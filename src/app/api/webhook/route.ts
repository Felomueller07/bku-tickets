import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendTicketConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('🔔 WEBHOOK AUFGERUFEN');
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('💳 Session completed - Payment Status:', session.payment_status);
    
    if (session.payment_status !== 'paid') {
      console.log('⚠️ Payment not completed - skipping seat reservation');
      return NextResponse.json({ received: true, skipped: 'payment not completed' });
    }
    
    console.log('✅ Payment confirmed - marking seats as paid');
    
    const userId = parseInt(session.metadata?.userId || '0');
    const seatsData = JSON.parse(session.metadata?.seats || '[]');

    for (const seat of seatsData) {
      console.log(`📝 ${seat.row}${seat.number}: ${seat.firstName} ${seat.lastName}`);
      
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
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'paid',
          userId: userId,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
        },
      });
    }
    
    console.log('✅ Alle Sitze gespeichert!');

    try {
      const metadata = session.metadata!;
      const paymentDate = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const emailResult = await sendTicketConfirmation({
        customerEmail: metadata.customerEmail,
        customerName: metadata.customerName || 'Kunde',
        seats: seatsData.map((seat: any) => ({
          row: seat.row,
          number: seat.number,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
        })),
        totalAmount: session.amount_total || 0,
        paymentDate: paymentDate,
      });

      if (emailResult.success) {
        console.log('✅ Email gesendet');
      }
    } catch (emailError) {
      console.error('❌ Email-Fehler:', emailError);
    }
  }

  return NextResponse.json({ received: true });
}
