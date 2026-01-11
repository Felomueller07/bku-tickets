import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user ? Number((session.user as any).id) : null;

    const { seats } = await request.json();

    console.log('💳 Create Checkout Session - Seats:', JSON.stringify(seats, null, 2));
    console.log('💳 Anzahl Sitze:', seats?.length);

    if (!seats || seats.length === 0) {
      console.log('❌ Keine Sitze erhalten!');
      return NextResponse.json(
        { error: 'Keine Sitze ausgewählt' },
        { status: 400 }
      );
    }

    // Line Items für Stripe
    const lineItems = seats.map((seat: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Josefi Konzert 2026 - Reihe ${seat.row}, Platz ${seat.number}`,
          description: '22. März 2026, 19:00 Uhr, Kursaal Meran',
        },
        unit_amount: 2000, // 20.00 EUR in Cents
      },
      quantity: 1,
    }));

    console.log('💳 Line Items:', JSON.stringify(lineItems, null, 2));

    // Metadata für später
    const metadata = {
      userId: userId?.toString() || '',
      seats: JSON.stringify(seats),
      customerEmail: seats[0]?.email || '',
      customerFirstName: seats[0]?.firstName || '',
      customerLastName: seats[0]?.lastName || '',
    };

    console.log('💳 Metadata:', metadata);

    // Stripe Checkout Session erstellen
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata,
      customer_email: seats[0]?.email,
    });

    console.log('✅ Checkout Session erstellt:', checkoutSession.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('❌ Create Checkout Session Fehler:', error);
    return NextResponse.json(
      { error: 'Checkout fehlgeschlagen' },
      { status: 500 }
    );
  }
}
