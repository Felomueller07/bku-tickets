import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerSeatLock } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const { seats, sessionId } = await request.json();

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { error: 'Keine Sitze angegeben' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Keine Session ID' },
        { status: 400 }
      );
    }

    // Lock Dauer: 10 Minuten
    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Generiere eindeutigen Lock Token
    const lockToken = `${sessionId}-${Date.now()}`;

    // Check ob Sitze verfügbar sind
    const existingSeats = await prisma.seat.findMany({
      where: {
        OR: seats.map(s => ({
          row: s.row,
          number: s.number,
        })),
      },
    });

    // Filter: Nur Sitze die NICHT belegt oder deren Lock abgelaufen ist
    const now = new Date();
    const unavailableSeats = existingSeats.filter(seat => {
      // Belegt wenn status = 'paid' oder 'admin' oder 'voucher'
      if (seat.status === 'paid' || seat.status === 'admin' || seat.status === 'voucher') {
        return true;
      }
      // Oder wenn Lock noch aktiv ist (und nicht von dieser Session)
      if (
        seat.status === 'locked' &&
        seat.lockExpiry &&
        seat.lockExpiry > now &&
        seat.sessionId !== sessionId
      ) {
        return true;
      }
      return false;
    });

    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        {
          error: 'Einige Sitze sind nicht verfügbar',
          unavailableSeats: unavailableSeats.map(s => ({ row: s.row, number: s.number })),
        },
        { status: 409 }
      );
    }

    // Sperre alle Sitze (upsert: erstelle wenn nicht existiert, update wenn existiert)
    const lockPromises = seats.map(seat =>
      prisma.seat.upsert({
        where: {
          row_number: {
            row: seat.row,
            number: seat.number,
          },
        },
        update: {
          status: 'locked',
          lockExpiry,
          sessionId,
          lockToken,
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'locked',
          lockExpiry,
          sessionId,
          lockToken,
        },
      })
    );

    await Promise.all(lockPromises);

    // Trigger Pusher Event
    await triggerSeatLock(seats);

    return NextResponse.json({
      success: true,
      lockExpiry: lockExpiry.toISOString(),
      seats,
    });

  } catch (error) {
    console.error('❌ Lock Fehler:', error);
    return NextResponse.json(
      { error: 'Server Fehler' },
      { status: 500 }
    );
  }
}