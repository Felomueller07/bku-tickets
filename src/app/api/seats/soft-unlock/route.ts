import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { seats, sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
    }

    // Soft Lock entfernen für Sitze dieser Session
    for (const seat of seats) {
      await prisma.seat.updateMany({
        where: {
          row: seat.row,
          number: seat.number,
          status: 'viewing',
          softLockSessionId: sessionId,
        },
        data: {
          status: 'available',
          softLockSessionId: null,
          softLockExpiry: null,
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Soft Unlock Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}