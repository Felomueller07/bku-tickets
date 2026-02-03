import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user ? Number((session.user as any).id) : null;
    
    const body = await request.json();
    const { code } = body;

    console.log('✅ Markiere Voucher als verwendet:', code);

    await prisma.voucherCode.update({
      where: { code: code.toUpperCase() },
      data: { 
        used: true,
        usedBy: userId,
        usedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Voucher Use Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}