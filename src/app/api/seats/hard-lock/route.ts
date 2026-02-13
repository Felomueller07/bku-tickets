import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { seats, sessionId } = await request.json();

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json({ error: 'Keine Sitze angegeben' }, { status: 400 });
    }

    // ⭐ MAX 20 SITZE CHECK
    if (seats.length > 20) {
      return NextResponse.json({ error: 'Maximal 20 Sitze pro Bestellung erlaubt' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // ⭐ RATE LIMITING: Max 20 Checkouts pro Tag
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkoutCount = await prisma.checkoutLog.count({
      where: {
        ip: ip,
        timestamp: { gte: today }
      }
    });

    if (checkoutCount >= 20) {
      return NextResponse.json({ 
        error: 'Maximale Anzahl an Checkout-Versuchen für heute erreicht (20)' 
      }, { status: 429 });
    }

    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 Minuten

    // ⭐ ERST PRÜFEN ob ALLE Sitze verfügbar sind
    for (const seat of seats) {
      const existingSeat = await prisma.seat.findUnique({
        where: { row_number: { row: seat.row, number: seat.number } }
      });

      if (existingSeat && 
          existingSeat.status === 'locked' && 
          existingSeat.sessionId !== sessionId &&
          existingSeat.lockExpiry && 
          new Date(existingSeat.lockExpiry) > new Date()) {
        
        return NextResponse.json({ 
          error: `Sitz ${seat.row}${seat.number} ist bereits reserviert`,
          success: false,
          seat: { row: seat.row, number: seat.number }
        }, { status: 409 });
      }
    }

    // ⭐ ALLE Sitze sind OK → JETZT locken
    for (const seat of seats) {
      await prisma.seat.upsert({
        where: { row_number: { row: seat.row, number: seat.number } },
        update: {
          status: 'locked',
          sessionId: sessionId,
          lockExpiry: lockExpiry,
          lockedBy: ip,
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'locked',
          sessionId: sessionId,
          lockExpiry: lockExpiry,
          lockedBy: ip,
        }
      });
    }

    // ⭐ LOG SPEICHERN
    await prisma.checkoutLog.create({
      data: {
        ip: ip,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Sitze gesperrt',
      expiresAt: lockExpiry
    });

  } catch (error) {
    console.error('❌ Hard Lock Fehler:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}