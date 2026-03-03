import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { seats, customerEmail, customerName } = await request.json();

    if (!customerEmail || !seats || seats.length === 0) {
      return NextResponse.json({ error: 'Fehlende Daten' }, { status: 400 });
    }

    const { sendTicketConfirmation } = await import('@/lib/email');

    const emailResult = await sendTicketConfirmation({
      customerEmail,
      customerName: customerName || 'Kunde',
      seats: seats.map((s: any) => ({
        row: s.row,
        number: s.number,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
      })),
      totalAmount: 0,
      paymentDate: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    if (!emailResult.success) {
      console.error('❌ Email Fehler:', emailResult.error);
    } else {
      console.log('✅ Freikarten-Email gesendet an:', customerEmail);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Voucher-Success Fehler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
