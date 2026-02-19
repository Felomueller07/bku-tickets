import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }

    const { seats } = await request.json();

    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze ausgewählt' }, { status: 400 });
    }

    const userId = String((session.user as any).id);

    const lineItems = seats.map((seat: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Josefi Konzert 2026 - Reihe ${seat.row}, Platz ${seat.number}`,
          description: 'Kursaal Meran, 22. März 2026, 19:00 Uhr',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      metadata: {
        userId: userId,
        seats: JSON.stringify(seats.map((s: any) => ({ 
          row: s.row, 
          number: s.number, 
          firstName: s.firstName, 
          lastName: s.lastName,
          email: s.email 
        }))),
        // ⭐ EMAIL-DATEN FÜR WEBHOOK
        customerEmail: seats[0]?.email || '',
        customerName: `${seats[0]?.firstName || ''} ${seats[0]?.lastName || ''}`.trim(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}