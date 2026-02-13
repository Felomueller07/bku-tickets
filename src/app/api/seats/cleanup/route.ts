import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const now = new Date();

    // Nur noch HARD Locks entfernen
    const hardLocksCleaned = await prisma.seat.updateMany({
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

    console.log(`🧹 Cleanup: ${hardLocksCleaned.count} hard locks entfernt`);

    return NextResponse.json({ 
      success: true,
      locksRemoved: hardLocksCleaned.count
    });

  } catch (error) {
    console.error('❌ Cleanup Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}