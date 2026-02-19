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
    console.log('📝 lastName:', lastName);
    console.log('📝 email:', email);
    console.log('📝 password:', password ? '***' : 'LEER');

    // Validierung
    if (!firstName || !lastName || !email || !password) {
      console.log('❌ Fehlende Felder!');
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
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
        lastName,
        email,
        password: hashedPassword,
        role: 'user',
        emailVerified: false,
      },
    });

    // Verifizierungs-Email senden
    const fullName = `${firstName} ${lastName}`;
    await sendVerificationEmail(user.id, user.email, fullName);

    console.log('✅ User registriert:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich! Bitte überprüfe deine Email.',
    });
  } catch (error: any) {
    console.error('❌ Registrierungs-Fehler:', error);
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
