import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⭐ GEÄNDERT!

// ⭐ Type für Seat hinzufügen
type Seat = {
  id: number;
  row: string;
  number: number;
  status: string;
  sessionId: string | null;
  lockExpiry: Date | null;
  lockedBy: string | null;
  userId: number | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  note: string | null;
  reservationType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

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

    const now = new Date();
    const lockDuration = 10 * 60 * 1000; // 10 Minuten
    const lockExpiry = new Date(now.getTime() + lockDuration);

    // Prüfe ob Sitze verfügbar sind
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
      },
    });

    // Prüfe ob irgendein Sitz bereits gelockt/reserviert ist
    const unavailableSeats = seats.filter((seat: Seat) => { // ⭐ Type hinzugefügt!
      if (seat.status === 'reserved' || seat.status === 'marked') {
        return true; // Nicht verfügbar
      }
      
      if (
        seat.status === 'locked' &&
        seat.lockExpiry &&
        seat.lockExpiry > now &&
        seat.sessionId !== sessionId
      ) {
        return true; // Von jemand anderem gelockt
      }
      
      return false;
    });

    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        { 
          error: 'Einige Sitze sind nicht mehr verfügbar',
          unavailableSeats: unavailableSeats.map((s: Seat) => ({ row: s.row, number: s.number })) // ⭐ Type hinzugefügt!
        },
        { status: 409 }
      );
    }

    // Locke die Sitze
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds },
      },
      data: {
        status: 'locked',
        sessionId: sessionId,
        lockExpiry: lockExpiry,
        lockedBy: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    console.log(`✅ Sitze gelockt:`, seatIds, `bis`, lockExpiry);

    return NextResponse.json({
      success: true,
      lockExpiry: lockExpiry,
    });
  } catch (error: any) {
    console.error('❌ Lock Fehler:', error);
    return NextResponse.json(
      { error: 'Lock fehlgeschlagen' },
      { status: 500 }
    );
  }
}