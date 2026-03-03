import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { seats, allSeats } = await request.json();

    console.log('📦 Received seats:', seats.length);
console.log('📦 Received allSeats:', allSeats?.length || 0);
console.log('📦 allSeats content:', JSON.stringify(allSeats, null, 2));
    
    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze ausgewählt' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user ? String((session.user as any).id) : '0';

    // Line Items NUR für bezahlte Sitze
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

    // ALLE Sitze (inkl. Voucher) für Email
    const seatsForEmail = allSeats || seats;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?cancelled=true`,
      metadata: {
        userId: userId,
        seats: JSON.stringify(seatsForEmail.map((s: any) => ({ 
          row: s.row, 
          number: s.number, 
          firstName: s.firstName, 
          lastName: s.lastName,
          email: s.email,
          voucherCode: s.voucherCode || null
        }))),
        customerEmail: seatsForEmail[0]?.email || '',
        customerName: `${seatsForEmail[0]?.firstName || ''} ${seatsForEmail[0]?.lastName || ''}`.trim(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}