import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }

    const body = await request.json();
    const { seats } = body; // Array of { row, number }

    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze ausgewählt' }, { status: 400 });
    }

    const PRICE_PER_SEAT = 20.00;
    const totalAmount = seats.length * PRICE_PER_SEAT;

    // Stripe Checkout Session erstellen
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Josefi Konzert 2026 - Tickets',
              description: `${seats.length} Sitzplatz${seats.length > 1 ? 'plätze' : ''}: ${seats.map((s: any) => `${s.row}${s.number}`).join(', ')}`,
            },
            unit_amount: Math.round(PRICE_PER_SEAT * 100), // Cent
          },
          quantity: seats.length,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        userId: (session.user as any).id,
        seats: JSON.stringify(seats),
      },
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Fehler beim Checkout' }, { status: 500 });
  }
}
