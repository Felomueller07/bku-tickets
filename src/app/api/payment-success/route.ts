import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    console.log('=== PAYMENT SUCCESS GET ===');
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
        console.log(`📝 Kontaktdaten: ${seat.firstName} ${seat.lastName} (${seat.email})`);
        
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
        console.log(`✅ ${seat.row}${seat.number} → PAID mit Kontaktdaten gespeichert`);
      }
      
      // ✅ EMAIL-BESTÄTIGUNG SENDEN
      try {
        const { sendTicketConfirmation } = await import('@/lib/email');
        
        const customerEmail = seats[0]?.email || session.customer_details?.email || '';
        const customerName = `${seats[0]?.firstName || ''} ${seats[0]?.lastName || ''}`.trim();
        
        if (customerEmail) {
          const emailResult = await sendTicketConfirmation({
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
          
          if (emailResult.success) {
            console.log('✅ Ticket-Email gesendet an:', customerEmail);
          } else {
            console.error('❌ Email konnte nicht gesendet werden:', emailResult.error);
          }
        } else {
          console.error('❌ Keine Email-Adresse gefunden!');
        }
      } catch (emailError) {
        console.error('❌ Email-Fehler:', emailError);
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
      const userId = parseInt(session.metadata?.userId || '0');
      
      console.log('Sitze:', seats);
      console.log('User ID:', userId);
      
      for (const seat of seats) {
        console.log(`Erstelle/Update Sitz ${seat.row}${seat.number}...`);
        console.log(`📝 Kontaktdaten: ${seat.firstName} ${seat.lastName} (${seat.email})`);
        
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
        console.log(`✅ ${seat.row}${seat.number} → PAID mit Kontaktdaten gespeichert`);
      }
      
      // ✅ EMAIL-BESTÄTIGUNG SENDEN
      try {
        const { sendTicketConfirmation } = await import('@/lib/email');
        
        const customerEmail = seats[0]?.email || session.customer_details?.email || '';
        const customerName = `${seats[0]?.firstName || ''} ${seats[0]?.lastName || ''}`.trim();
        
        if (customerEmail) {
          const emailResult = await sendTicketConfirmation({
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
          
          if (emailResult.success) {
            console.log('✅ Ticket-Email gesendet an:', customerEmail);
          } else {
            console.error('❌ Email konnte nicht gesendet werden:', emailResult.error);
          }
        } else {
          console.error('❌ Keine Email-Adresse gefunden!');
        }
      } catch (emailError) {
        console.error('❌ Email-Fehler:', emailError);
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