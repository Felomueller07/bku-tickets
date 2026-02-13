import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seats } = body;
    
    const session = await auth();
    const userId = session?.user ? Number((session.user as any).id) : null;
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('🟨 MARK Seats:', seats);
    console.log('👤 User ID:', userId);

    for (const seat of seats) {
      await prisma.seat.upsert({
        where: { row_number: { row: seat.row, number: seat.number } },
        update: {
          status: 'reserved',
          userId: userId,
          reservationType: 'marked',  // ⬅️ GELB!
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'reserved',
          userId: userId,
          reservationType: 'marked',  // ⬅️ GELB!
        },
      });
    }

    console.log('✅ MARK erfolgreich!');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ MARK Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}