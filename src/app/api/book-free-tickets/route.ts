import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user ? Number((session.user as any).id) : null;

    const body = await request.json();
    const { seats, customerEmail, customerName } = body;

    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze ausgewählt' }, { status: 400 });
    }

    // Validate all voucher codes first
    for (const seat of seats) {
      if (!seat.voucherCode) {
        return NextResponse.json({ error: `Kein Voucher-Code für Platz ${seat.row}${seat.number}` }, { status: 400 });
      }
      const voucher = await prisma.voucherCode.findUnique({
        where: { code: seat.voucherCode.toUpperCase() }
      });
      if (!voucher) {
        return NextResponse.json({ error: `Ungültiger Code: ${seat.voucherCode}` }, { status: 400 });
      }
      if (voucher.used) {
        return NextResponse.json({ error: `Code bereits verwendet: ${seat.voucherCode}` }, { status: 400 });
      }
    }

    // Book all seats and mark vouchers as used
    for (const seat of seats) {
      await prisma.seat.upsert({
        where: { row_number: { row: seat.row, number: seat.number } },
        update: {
          status: 'paid',
          userId: userId,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
          reservationType: 'voucher',
          sessionId: null,
          lockExpiry: null,
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'paid',
          userId: userId,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
          reservationType: 'voucher',
        },
      });

      await prisma.voucherCode.update({
        where: { code: seat.voucherCode.toUpperCase() },
        data: {
          used: true,
          usedBy: userId,
          usedAt: new Date(),
        }
      });
    }

    // Send confirmation email (fire-and-forget, don't block response)
    if (customerEmail) {
      const { sendTicketConfirmation } = await import('@/lib/email');
      sendTicketConfirmation({
        customerEmail,
        customerName: customerName || 'Gast',
        seats: seats.map((s: any) => ({
          row: s.row,
          number: s.number,
          firstName: s.firstName || '',
          lastName: s.lastName || '',
        })),
        totalAmount: 0,
        paymentDate: new Date().toLocaleDateString('de-DE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      }).catch((err: any) => console.error('❌ Email Fehler:', err));
    }

    console.log(`✅ Freikarten gebucht: ${seats.length} Plätze für ${customerEmail}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ book-free-tickets Fehler:', error);
    return NextResponse.json({ error: error.message || 'Buchung fehlgeschlagen' }, { status: 500 });
  }
}
