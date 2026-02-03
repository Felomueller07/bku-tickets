import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    console.log('🎫 Checking voucher code:', code);

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const voucher = await prisma.voucherCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      console.log('❌ Voucher nicht gefunden');
      return NextResponse.json({ valid: false });
    }

    if (voucher.used) {
      console.log('❌ Voucher bereits benutzt');
      return NextResponse.json({ valid: false, error: 'Code bereits verwendet' });
    }

    console.log('✅ Voucher gültig!');
    return NextResponse.json({ valid: true });

  } catch (error: any) {
    console.error('❌ Voucher Check Error:', error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
