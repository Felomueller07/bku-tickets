import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ row: string; number: string }> }
) {
  try {
    const params = await context.params;
    const { row, number } = params;
    const body = await request.json();
    
    const seat = await prisma.seat.update({
      where: {
        row_number: { row, number: parseInt(number) }
      },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        note: body.note,
      }
    });
    
    return NextResponse.json(seat);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
