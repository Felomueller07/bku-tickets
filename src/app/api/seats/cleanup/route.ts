import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⭐ GEÄNDERT!

export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Finde alle abgelaufenen Locks
    const expiredLocks = await prisma.seat.updateMany({
      where: {
        status: 'locked',
        lockExpiry: {
          lt: now,
        },
      },
      data: {
        status: 'available',
        sessionId: null,
        lockExpiry: null,
        lockedBy: null,
      },
    });

    console.log(`🧹 Cleanup: ${expiredLocks.count} Locks entfernt`);

    return NextResponse.json({
      success: true,
      cleaned: expiredLocks.count,
    });
  } catch (error: any) {
    console.error('❌ Cleanup Fehler:', error);
    return NextResponse.json(
      { error: 'Cleanup fehlgeschlagen' },
      { status: 500 }
    );
  }
}