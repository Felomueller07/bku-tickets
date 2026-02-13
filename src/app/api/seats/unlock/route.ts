import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
    }

    // Alle Locks dieser Session entfernen (soft UND hard)
    await prisma.seat.updateMany({
      where: {
        OR: [
          { sessionId: sessionId, status: 'locked' }, // Hard locks
          { softLockSessionId: sessionId, status: 'viewing' }, // Soft locks
        ]
      },
      data: {
        status: 'available',
        sessionId: null,
        lockExpiry: null,
        lockedBy: null,
        softLockSessionId: null,
        softLockExpiry: null,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Unlock Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}