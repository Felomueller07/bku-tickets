import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Sitz-Daten aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { row: string; number: string } }
) {
  try {
    const body = await request.json();
    const { firstName, lastName, note } = body;
    
    const updated = await prisma.seat.update({
      where: {
        row_number: { 
          row: params.row, 
          number: parseInt(params.number) 
        }
      },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        note: note || null,
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}