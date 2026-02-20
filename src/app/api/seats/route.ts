import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  console.log('🔍 GET /api/seats - START');
  
  try {
    const seats = await prisma.seat.findMany({
      where: {
        status: {
          in: ['reserved', 'paid', 'viewing', 'locked', 'marked']  // ⭐ ALLE STATUS!
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    console.log(`✅ Gefunden: ${seats.length} Sitze`);
    return NextResponse.json(seats);
    
  } catch (error: any) {
    console.error('❌ GET /api/seats ERROR:', error);
    return NextResponse.json({
      error: 'Fehler beim Laden',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seats } = body;

    const session = await auth();
    const userId = session?.user ? Number((session.user as any).id) : null;

    console.log('📝 POST Seats:', seats);
    console.log('👤 User ID:', userId);

    for (const seat of seats) {
      const voucherCode = seat.voucherCode;  // ⬅️ PRÜFE VOUCHER CODE!
      
      await prisma.seat.upsert({
        where: { row_number: { row: seat.row, number: seat.number } },
        update: {
          status: 'reserved',
          userId: userId,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || '',
          reservationType: voucherCode ? 'voucher' : 'user',
        },
        create: {
          row: seat.row,
          number: seat.number,
          status: 'reserved',
          userId: userId,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          note: seat.note || '',
          reservationType: voucherCode ? 'voucher' : 'user',
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { seats } = body;

    console.log('🗑️ DELETE Seats:', seats);

    for (const seat of seats) {
      await prisma.seat.updateMany({
        where: {
          row: seat.row,
          number: seat.number,
        },
        data: {
          status: 'available',
          userId: null,
          firstName: null,
          lastName: null,
          email: null,
          note: null,
        },
      });
    }

    console.log('✅ DELETE erfolgreich!');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}