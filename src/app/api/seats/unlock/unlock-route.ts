import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerSeatUnlock } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const { seats, sessionId } = await request.json();

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { error: 'Keine Sitze angegeben' },
        { status: 400 }
      );
    }

    // Lösche nur Sitze die dieser Session gehören und status='locked' haben
    const deletePromises = seats.map(seat =>
      prisma.seat.deleteMany({
        where: {
          row: seat.row,
          number: seat.number,
          sessionId: sessionId,
          status: 'locked',
        },
      })
    );

    await Promise.all(deletePromises);

    // Trigger Pusher Event
    await triggerSeatUnlock(seats);

    return NextResponse.json({
      success: true,
      unlockedSeats: seats,
    });

  } catch (error) {
    console.error('❌ Unlock Fehler:', error);
    return NextResponse.json(
      { error: 'Server Fehler' },
      { status: 500 }
    );
  }
}