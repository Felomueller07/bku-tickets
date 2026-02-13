import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const now = new Date();

    // Abgelaufene HARD Locks entfernen
    await prisma.seat.updateMany({
      where: {
        status: 'locked',
        lockExpiry: { lt: now }
      },
      data: {
        status: 'available',
        sessionId: null,
        lockExpiry: null,
        lockedBy: null,
      },
    });

    // Abgelaufene SOFT Locks entfernen
    await prisma.seat.updateMany({
      where: {
        status: 'viewing',
        softLockExpiry: { lt: now }
      },
      data: {
        status: 'available',
        softLockSessionId: null,
        softLockExpiry: null,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Abgelaufene Locks entfernt'
    });

  } catch (error) {
    console.error('❌ Cleanup Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}