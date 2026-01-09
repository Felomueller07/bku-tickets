import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendTicketConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = parseInt(session.metadata?.userId || '0');
      const seatsData = JSON.parse(session.metadata?.seats || '[]');
      
      // ⭐ Email und Name aus Seat-Daten nehmen
      const customerEmail = seatsData[0]?.email || '';
      const customerName = seatsData[0]?.firstName 
        ? `${seatsData[0].firstName} ${seatsData[0].lastName}` 
        : 'Kunde';

      console.log('=== PAYMENT SUCCESS START ===');
      console.log('Sitze aus Metadata:', seatsData);
      console.log('User ID:', userId);
      console.log('Email:', customerEmail);

      const updatedSeats = [];

      for (const seat of seatsData) {
        console.log(`Erstelle/Update Sitz ${seat.row}${seat.number}...`);
        console.log(`📝 Kontaktdaten: ${seat.firstName} ${seat.lastName} (${seat.email})`);

        const updatedSeat = await prisma.seat.upsert({
          where: {
            row_number: {
              row: seat.row,
              number: seat.number,
            },
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

        console.log(`✅ ${seat.row}${seat.number} → PAID mit Kontaktdaten gespeichert`);
        updatedSeats.push(updatedSeat);
      }

      console.log('=== FERTIG ===');

      // ✅ Email-Bestätigung senden
      if (customerEmail) {
        try {
          const paymentDate = new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          console.log('📧 Sende Email an:', customerEmail);

          const emailResult = await sendTicketConfirmation({
            customerEmail: customerEmail,
            customerName: customerName,
            seats: updatedSeats.map(seat => ({
              row: seat.row,
              number: seat.number,
              firstName: seat.firstName || '',
              lastName: seat.lastName || '',
            })),
            totalAmount: session.amount_total || 0,
            paymentDate: paymentDate,
          });

          if (emailResult.success) {
            console.log('✅ Bestätigungs-Email gesendet an:', customerEmail);
          } else {
            console.error('❌ Email konnte nicht gesendet werden:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Email-Fehler:', emailError);
        }
      } else {
        console.log('⚠️ Keine Email-Adresse vorhanden - Email wird nicht gesendet');
      }

      const ticketsUrl = new URL('/meine-tickets', request.url);
      return NextResponse.redirect(ticketsUrl);
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error in payment-success:', error);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
