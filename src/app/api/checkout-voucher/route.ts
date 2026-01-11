import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }

    const { seats, voucherCode, firstName, lastName, email } = await request.json();

    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze ausgewählt' }, { status: 400 });
    }

    if (!voucherCode) {
      return NextResponse.json({ error: 'Kein Voucher Code' }, { status: 400 });
    }

    const voucher = await prisma.voucherCode.findUnique({
      where: { code: voucherCode.toUpperCase() }
    });

    if (!voucher || voucher.used) {
      return NextResponse.json({ error: 'Ungültiger oder bereits verwendeter Code' }, { status: 400 });
    }

    const userId = parseInt((session.user as any).id);

    for (const seat of seats) {
      await prisma.seat.upsert({
        where: {
          row_number: { row: seat.row, number: seat.number }
        },
        update: {
          status: 'paid',
          userId: userId,
          firstName: firstName,
          lastName: lastName,
          email: email,
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'paid',
          userId: userId,
          firstName: firstName,
          lastName: lastName,
          email: email,
        },
      });
    }

    await prisma.voucherCode.update({
      where: { id: voucher.id },
      data: {
        used: true,
        usedBy: userId,
        usedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Voucher checkout error:', error);
    return NextResponse.json({ error: 'Fehler bei der Reservierung' }, { status: 500 });
  }
}
