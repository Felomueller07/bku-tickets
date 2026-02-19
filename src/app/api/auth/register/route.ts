import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/verification-email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Received body:', body);
    
    const { firstName, lastName, email, password } = body;

    console.log('📝 firstName:', firstName);
    console.log('📝 lastName:', lastName || '(optional)');
    console.log('📝 email:', email);
    console.log('📝 password:', password ? '***' : 'LEER');

    // Validierung - lastName ist OPTIONAL
    if (!firstName || !email || !password) {
      console.log('❌ Fehlende Felder!');
      return NextResponse.json(
        { error: 'Vorname, Email und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    // Email bereits registriert?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email bereits registriert' },
        { status: 400 }
      );
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // User erstellen
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '', // Optional, default leer
        email,
        password: hashedPassword,
        emailVerified: null,
      },
    });

    console.log('✅ User erstellt:', user.id);

    // Verification Code erstellen
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Minuten

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Email senden
    await sendVerificationEmail(user.id, email, firstName);

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich! Bitte prüfe deine Emails.',
    });
  } catch (error: any) {
    console.error('❌ Registrierungs-Fehler:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Registrierung' },
      { status: 500 }
    );
  }
}
