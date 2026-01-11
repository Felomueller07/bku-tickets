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

    console.log('📝 PATCH Seat:', row, number);
    console.log('📧 Daten:', body);  // ⭐ Debug Log

    const seat = await prisma.seat.update({
      where: {
        row_number: { row, number: parseInt(number) }
      },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,        // ⭐ WICHTIG: email statt note
      }
    });

    console.log('✅ Gespeichert!', seat);

    return NextResponse.json(seat);
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}