import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyCode } from '@/lib/verification-email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // User finden
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Code verifizieren
    const isValid = await verifyCode(user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Code' },
        { status: 400 }
      );
    }

    console.log('✅ Email verifiziert:', email);

    return NextResponse.json({
      success: true,
      message: 'Email erfolgreich bestätigt!',
    });
  } catch (error: any) {
    console.error('❌ Verify Fehler:', error);
    return NextResponse.json(
      { error: 'Verifizierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
