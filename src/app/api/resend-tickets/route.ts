import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTicketConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seats, email } = body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json({ error: 'No seats provided' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'No email provided' }, { status: 400 });
    }

    // Email erneut senden
    const emailResult = await sendTicketConfirmation({
      customerEmail: email,
      customerName: `${seats[0].firstName} ${seats[0].lastName}`,
      seats: seats.map((s: any) => ({
        row: s.row,
        number: s.number,
        firstName: s.firstName,
        lastName: s.lastName,
      })),
      totalAmount: seats.length * 2000, // 20€ pro Ticket in Cent
      paymentDate: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    });

    if (emailResult.success) {
      return NextResponse.json({ success: true, message: 'Email erfolgreich gesendet' });
    } else {
      return NextResponse.json({ error: 'Email konnte nicht gesendet werden' }, { status: 500 });
    }
  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
