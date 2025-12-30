import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    console.log('=== PAYMENT SUCCESS ===');
    console.log('Session ID:', sessionId);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Payment Status:', session.payment_status);
    
    if (session.payment_status === 'paid') {
      const seats = JSON.parse(session.metadata?.seats || '[]');
      const userId = parseInt(session.metadata?.userId || '0');

      console.log('Sitze:', seats);
      console.log('User ID:', userId);

      for (const seat of seats) {
        console.log(`Erstelle/Update Sitz ${seat.row}${seat.number}...`);
        
        // UPSERT statt UPDATE - erstellt wenn nicht vorhanden!
        await prisma.seat.upsert({
          where: {
            row_number: { row: seat.row, number: seat.number }
          },
          update: {
            status: 'paid',
            userId: userId,
          },
          create: {
            row: seat.row,
            number: seat.number,
            status: 'paid',
            userId: userId,
          },
        });
        
        console.log(`✅ ${seat.row}${seat.number} → PAID`);
      }

      console.log('=== FERTIG ===');
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
