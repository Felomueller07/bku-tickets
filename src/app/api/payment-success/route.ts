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
      const seatsFromMetadata = JSON.parse(session.metadata?.seats || '[]');
      const customerEmail = seatsFromMetadata[0]?.email || '';
      
      console.log('Email:', customerEmail);
      
      // HOLE ALLE SITZE (paid + reserved) MIT DIESER EMAIL AUS DEN LETZTEN 15 MINUTEN
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const allSeats = await prisma.seat.findMany({
        where: {
          email: customerEmail,
          updatedAt: { gte: fifteenMinutesAgo },
          OR: [
            { status: 'paid' },
            { status: 'reserved' }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      console.log(`✅ Gefunden: ${allSeats.length} Sitze für ${customerEmail}`);
      
      // Formatiere für Frontend
      const formattedSeats = allSeats.map(s => ({
        row: s.row,
        number: s.number,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        email: s.email || ''
      }));
      
      return NextResponse.json({ 
        success: true, 
        seats: formattedSeats
      });
    }
    
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}