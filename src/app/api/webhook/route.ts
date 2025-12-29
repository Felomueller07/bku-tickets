import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Webhook Signature verifizieren
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Payment erfolgreich
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('✅ Payment successful:', session.id);
    console.log('Metadata:', session.metadata);

    try {
      const seats = JSON.parse(session.metadata?.seats || '[]');
      const userId = parseInt(session.metadata?.userId || '0');

      console.log('💺 Updating seats:', seats);

      // Alle Sitze auf "paid" setzen
      for (const seat of seats) {
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
      }

      console.log('✅ Seats marked as paid!');
    } catch (error) {
      console.error('❌ Error updating seats:', error);
    }
  }

  return NextResponse.json({ received: true });
}
