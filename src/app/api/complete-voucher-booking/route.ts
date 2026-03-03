import { NextRequest, NextResponse } from 'next/server';
import { sendTicketConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { seats } = await request.json();
    
    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'No seats' }, { status: 400 });
    }

    const customerEmail = seats[0].email;
    const customerName = `${seats[0].firstName} ${seats[0].lastName}`;

    // Email senden
    console.log('📧 Sende Voucher-Email an:', customerEmail);
    await sendTicketConfirmation({
      customerEmail,
      customerName,
      seats: seats.map((s: any) => ({
        row: s.row,
        number: s.number,
        firstName: s.firstName,
        lastName: s.lastName,
      })),
      totalAmount: 0,
      paymentDate: new Date().toLocaleDateString('de-DE'),
    });

    return NextResponse.json({ 
      success: true,
      seats: seats
    });

  } catch (error: any) {
    console.error('Voucher booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}