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
    const body = await request.json();
    const { sessionId } = body;
    
    console.log('=== PAYMENT SUCCESS POST ===');
    console.log('Session ID:', sessionId);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Payment Status:', session.payment_status);
    
    if (session.payment_status === 'paid') {
      const seats = JSON.parse(session.metadata?.seats || '[]');
      const userId = session.metadata?.userId && session.metadata.userId !== "0" ? parseInt(session.metadata.userId) : null;
      
      console.log('Sitze:', seats);
      
      // Trenne bezahlte vs. Voucher-Sitze
      const paidSeats = seats.filter((s: any) => !s.voucherCode);
      const voucherSeats = seats.filter((s: any) => s.voucherCode);
      
      console.log(`💳 ${paidSeats.length} bezahlte Sitze`);
      console.log(`🎫 ${voucherSeats.length} Voucher-Sitze`);
      
      // Check ob schon verarbeitet
      const allSeatsProcessed = await Promise.all(
        paidSeats.map(async (seat: any) => {
          const existingSeat = await prisma.seat.findUnique({
            where: { row_number: { row: seat.row, number: seat.number } }
          });
          return existingSeat?.status === 'paid';
        })
      );

      const shouldProcess = !allSeatsProcessed.every(Boolean);
      
      if (shouldProcess) {
        // UPDATE NUR BEZAHLTE SITZE AUF 'PAID'
        for (const seat of paidSeats) {
          console.log(`💳 Update ${seat.row}${seat.number} → PAID`);
          
          await prisma.seat.upsert({
            where: {
              row_number: { row: seat.row, number: seat.number }
            },
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
        
        console.log(`🎫 ${voucherSeats.length} Voucher-Sitze bleiben 'reserved'`);
        
        // EMAIL SENDEN mit ALLEN Sitzen
        try {
          const { sendTicketConfirmation } = await import('@/lib/email');
          
          const customerEmail = seats[0]?.email || '';
          const customerName = `${seats[0]?.firstName || ''} ${seats[0]?.lastName || ''}`.trim();
          
          if (customerEmail) {
            await sendTicketConfirmation({
              customerEmail: customerEmail,
              customerName: customerName || 'Kunde',
              seats: seats.map((s: any) => ({
                row: s.row,
                number: s.number,
                firstName: s.firstName || '',
                lastName: s.lastName || '',
              })),
              totalAmount: session.amount_total || 0,
              paymentDate: new Date().toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
            });
            console.log('✅ Email gesendet');
          }
        } catch (emailError) {
          console.error('❌ Email-Fehler:', emailError);
        }
      } else {
        console.log('ℹ️ Bereits verarbeitet');
      }
      
      return NextResponse.json({ 
        success: true, 
        seats: seats
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