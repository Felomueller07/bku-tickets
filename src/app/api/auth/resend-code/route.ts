import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/verification-email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email bereits bestätigt' },
        { status: 400 }
      );
    }

await sendVerificationEmail(
  user.id, 
  user.email, 
  `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kunde'
); 
    return NextResponse.json({
      success: true,
      message: 'Code wurde erneut gesendet',
    });
  } catch (error: any) {
    console.error('❌ Resend Code Fehler:', error);
    return NextResponse.json(
      { error: 'Code konnte nicht gesendet werden' },
      { status: 500 }
    );
  }
}
