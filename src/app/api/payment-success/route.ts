import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const seats = JSON.parse(session.metadata?.seats || '[]');
      
      return NextResponse.json({ 
        success: true, 
        seats: seats
      });
    }
    
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const seats = JSON.parse(session.metadata?.seats || '[]');
      const userId = session.metadata?.userId && session.metadata.userId !== "0" ? parseInt(session.metadata.userId) : null;
      
      // UPDATE SITZE AUF 'PAID'
      const paidSeats = seats.filter((s: any) => !s.voucherCode);
      
      for (const seat of paidSeats) {
        await prisma.seat.upsert({
          where: { row_number: { row: seat.row, number: seat.number } },
          update: {
            status: 'paid',
            userId: userId,
            firstName: seat.firstName || '',
            lastName: seat.lastName || '',
            email: seat.email || '',
            reservationType: 'user',
          },
          create: {
            row: seat.row,
            number: seat.number,
            status: 'paid',
            userId: userId,
            firstName: seat.firstName || '',
            lastName: seat.lastName || '',
            email: seat.email || '',
            reservationType: 'user',
          },
        });
      }
      
      // EMAIL SENDEN
      try {
        const { sendTicketConfirmation } = await import('@/lib/email');
        await sendTicketConfirmation({
          customerEmail: seats[0].email,
          customerName: `${seats[0].firstName} ${seats[0].lastName}`,
          seats: seats.map((s: any) => ({
            row: s.row,
            number: s.number,
            firstName: s.firstName,
            lastName: s.lastName,
          })),
          totalAmount: session.amount_total || 0,
          paymentDate: new Date().toLocaleDateString('de-DE'),
        });
        console.log('✅ Email gesendet');
      } catch (emailError) {
        console.error('❌ Email-Fehler:', emailError);
      }
      
      return NextResponse.json({ 
        success: true, 
        seats: seats  // NUR diese Sitze!
      });
    }
    
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}