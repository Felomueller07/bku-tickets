import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }

    const body = await request.json();
    const { code, seats } = body;

    if (!code || !seats || seats.length === 0) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
    }

    console.log('🎟️ Prüfe Freikarten-Code:', code);

    // Code in DB suchen
    const freeTicket = await prisma.freeTicket.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!freeTicket) {
      console.log('❌ Code nicht gefunden');
      return NextResponse.json({ error: 'Ungültiger Code' }, { status: 400 });
    }

    if (freeTicket.used) {
      console.log('❌ Code bereits verwendet');
      return NextResponse.json({ error: 'Code wurde bereits verwendet' }, { status: 400 });
    }

    const userId = parseInt((session.user as any).id || '0');

    console.log('✅ Code gültig! Reserviere Sitze...');

    // Sitze reservieren
    for (const seat of seats) {
      await prisma.seat.upsert({
        where: {
          row_number: { row: seat.row, number: seat.number }
        },
        update: {
          status: 'paid',
          userId: userId,
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'paid',
          userId: userId,
        },
      });
      console.log(`  → Sitz ${seat.row}${seat.number} reserviert`);
    }

    // Code als verwendet markieren
    await prisma.freeTicket.update({
      where: { code: code.toUpperCase() },
      data: {
        used: true,
        usedBy: userId,
        usedAt: new Date(),
      }
    });

    console.log('✅ Freikarte erfolgreich eingelöst!');

    return NextResponse.json({ 
      success: true,
      seats: seats,
      message: 'Freikarte eingelöst'
    });

  } catch (error: any) {
    console.error('❌ Freikarten-Fehler:', error);
    return NextResponse.json({ 
      error: 'Serverfehler: ' + error.message 
    }, { status: 500 });
  }
}
