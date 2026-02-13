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

    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 Minuten
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Hard Lock für alle Sitze setzen (Upgrade von soft zu hard)
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
                { softLockSessionId: sessionId } // Nur eigene viewing locks upgraden
              ]
            }
          ]
        },
        data: {
          status: 'locked',
          sessionId: sessionId,
          lockExpiry: lockExpiry,
          lockedBy: ip,
          // Soft Lock entfernen
          softLockSessionId: null,
          softLockExpiry: null,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sitze für Checkout gesperrt',
      expiresAt: lockExpiry
    });

  } catch (error) {
    console.error('❌ Hard Lock Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}