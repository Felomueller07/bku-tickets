import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { seats, sessionId } = await request.json();

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze angegeben' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
    }

    const softLockExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 Minuten

    // Soft Lock für alle Sitze setzen
    for (const seat of seats) {
      await prisma.seat.updateMany({
        where: {
          row: seat.row,
          number: seat.number,
          OR: [
            { status: 'available' },
            { 
              AND: [
                { status: 'viewing' },
                { softLockExpiry: { lt: new Date() } } // Abgelaufene Soft Locks
              ]
            }
          ]
        },
        data: {
          status: 'viewing',
          softLockSessionId: sessionId,
          softLockExpiry: softLockExpiry,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sitze als "viewing" markiert',
      expiresAt: softLockExpiry
    });

  } catch (error) {
    console.error('❌ Soft Lock Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}