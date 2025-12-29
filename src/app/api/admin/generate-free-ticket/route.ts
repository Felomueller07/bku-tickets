import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'JOSEFI2026-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const code = generateCode();

    await prisma.freeTicket.create({
      data: { code }
    });

    console.log('✅ Freikarten-Code generiert:', code);

    return NextResponse.json({ 
      success: true,
      code 
    });

  } catch (error: any) {
    console.error('❌ Fehler beim Generieren:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
