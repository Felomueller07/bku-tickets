import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⭐ GEÄNDERT!

export async function POST(request: NextRequest) {
  try {
    const { seatIds, sessionId } = await request.json();

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
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

    // Unlock nur die Sitze die von dieser Session gelockt sind
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds },
        sessionId: sessionId,
        status: 'locked',
      },
      data: {
        status: 'available',
        sessionId: null,
        lockExpiry: null,
        lockedBy: null,
      },
    });

    console.log(`✅ Sitze freigegeben:`, seatIds);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Unlock Fehler:', error);
    return NextResponse.json(
      { error: 'Unlock fehlgeschlagen' },
      { status: 500 }
    );
  }
}