import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';  // ⭐ NEU - Import hinzufügen

// GET - Alle reservierten UND bezahlten Sitze laden
export async function GET() {
  console.log('🔍 GET /api/seats - START');
  
  try {
    const seats = await prisma.seat.findMany({
      where: { 
        status: { 
          in: ['reserved', 'paid'] 
        } 
      },
      include: {
        user: {                    // ⭐ User-Daten mitladen
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    console.log(`✅ Gefunden: ${seats.length} Sitze`);
    
    return NextResponse.json(seats);
  } catch (error: any) {
    console.error('❌❌❌ GET /api/seats ERROR:', error);
    return NextResponse.json({ 
      error: 'Fehler beim Laden',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Sitze reservieren
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seats } = body;

    // ⭐ Session holen um userId zu bekommen
    const session = await auth();
   const userId = session?.user ? Number((session.user as any).id) : null;

    console.log('📝 POST Seats:', seats);
    console.log('👤 User ID:', userId);

    for (const seat of seats) {
      await prisma.seat.upsert({
        where: { row_number: { row: seat.row, number: seat.number } },
        update: {
          status: 'reserved',
          userId: userId,        // ⭐ userId speichern
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'reserved',
          userId: userId,        // ⭐ userId speichern
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
        },
      });
    }

    console.log('✅ POST erfolgreich!');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Sitze freigeben
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { seats } = body;
    
    await Promise.all(
      seats.map((seat: any) =>
        prisma.seat.delete({
          where: {
            row_number: { row: seat.row, number: seat.number }
          }
        })
      )
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}
