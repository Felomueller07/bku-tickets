import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Alle reservierten UND bezahlten Sitze laden
export async function GET() {
  try {
    const seats = await prisma.seat.findMany({
      where: { 
        status: { 
          in: ['occupied', 'paid'] 
        } 
      }
    });
    return NextResponse.json(seats);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
  }
}

// POST - Sitze reservieren
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seats } = body;
    
    const created = await Promise.all(
      seats.map((seat: any) =>
        prisma.seat.upsert({
          where: {
            row_number: { row: seat.row, number: seat.number }
          },
          update: {
            status: 'occupied',
            firstName: seat.firstName || '',
            lastName: seat.lastName || '',
            note: seat.note || '',
          },
          create: {
            row: seat.row,
            number: seat.number,
            status: 'occupied',
            firstName: seat.firstName || '',
            lastName: seat.lastName || '',
            note: seat.note || '',
          }
        })
      )
    );
    
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
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
