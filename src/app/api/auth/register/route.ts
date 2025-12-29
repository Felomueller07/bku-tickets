import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Registrierungs-Anfrage erhalten');
    
    const body = await request.json();
    const { email, name, password } = body;

    console.log('📧 Email:', email);
    console.log('👤 Name:', name);

    // Validierung
    if (!email || !name || !password) {
      console.log('❌ Fehlende Felder');
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    // Email-Format prüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Ungültige Email');
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Passwort-Länge prüfen
    if (password.length < 6) {
      console.log('❌ Passwort zu kurz');
      return NextResponse.json(
        { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Prüfen ob Email bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ Email existiert bereits');
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits registriert' },
        { status: 400 }
      );
    }

    console.log('🔐 Hash Passwort...');
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('💾 Erstelle User in DB...');
    // User erstellen
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
      },
    });

    console.log('✅ User erstellt! ID:', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Register Error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Registrierung' },
      { status: 500 }
    );
  }
}
