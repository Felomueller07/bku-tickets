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
    
    console.log('=== PAYMENT SUCCESS POST ===');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const seats = JSON.parse(session.metadata?.seats || '[]');
      const userId = session.metadata?.userId && session.metadata.userId !== "0" ? parseInt(session.metadata.userId) : null;
      
      console.log(`📋 ${seats.length} Sitze aus Stripe Metadata`);
      
      // NUR BEZAHLTE SITZE (ohne voucherCode) AUF 'PAID' SETZEN
      const paidSeats = seats.filter((s: any) => !s.voucherCode);
      
      console.log(`💳 ${paidSeats.length} bezahlte Sitze werden auf 'paid' gesetzt`);
      console.log(`🎫 ${seats.length - paidSeats.length} Voucher-Sitze bleiben 'reserved'`);
      
      // Check ob schon verarbeitet
      const alreadyProcessed = await Promise.all(
        paidSeats.map(async (seat: any) => {
          const existing = await prisma.seat.findUnique({
            where: { row_number: { row: seat.row, number: seat.number } }
          });
          return existing?.status === 'paid';
        })
      );

      if (alreadyProcessed.every(Boolean)) {
        console.log('⚠️ Bereits verarbeitet - Webhook war schneller');
        return NextResponse.json({ 
          success: true, 
          seats: seats
        });
      }
      
      // UPDATE NUR BEZAHLTE SITZE
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
      
      console.log('✅ Sitze aktualisiert');
      
      // EMAIL SENDEN MIT ALLEN SITZEN (bezahlt + voucher)
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
        
        console.log('✅ Email gesendet an:', seats[0].email);
      } catch (emailError) {
        console.error('❌ Email-Fehler:', emailError);
      }
      
      return NextResponse.json({ 
        success: true, 
        seats: seats  // ALLE SITZE aus dieser Buchung
      });
    }
    
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  } catch (error: any) {
    console.error('=== FEHLER ===');
    console.error(error.message);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}