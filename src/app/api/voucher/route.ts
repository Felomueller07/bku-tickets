import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Kein Code angegeben' }, { status: 400 });
    }

    // Prüfe ob Code existiert und nicht verwendet wurde
    const voucher = await prisma.voucherCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      return NextResponse.json({ error: 'Ungültiger Code' }, { status: 404 });
    }

    if (voucher.used) {
      return NextResponse.json({ error: 'Code bereits verwendet' }, { status: 400 });
    }

    return NextResponse.json({ valid: true, voucher });
  } catch (error: any) {
    console.error('Voucher validation error:', error);
    return NextResponse.json({ error: 'Fehler bei der Validierung' }, { status: 500 });
  }
}
