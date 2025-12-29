import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Sitz-Daten aktualisieren
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ row: string; number: string }> }
) {
  try {
    const body = await request.json();
    const { firstName, lastName, note } = body;
    
    // WICHTIG: params ist ein Promise in Next.js 15+
    const params = await context.params;
    
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
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
