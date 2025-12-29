import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('�� Script gestartet...');
  
  const adminEmail = 'admin@bku.com';
  const adminPassword = 'admin123';

  console.log('📧 Suche nach User:', adminEmail);

  // Prüfen ob Admin schon existiert
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin existiert bereits!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Passwort:', adminPassword);
    console.log('👤 ID:', existingAdmin.id);
    console.log('👤 Name:', existingAdmin.name);
    console.log('🎭 Role:', existingAdmin.role);
    return;
  }

  console.log('🔨 Erstelle neuen Admin...');

  // Passwort hashen
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Admin erstellen
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'BKU Administrator',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin erstellt!');
  console.log('📧 Email:', adminEmail);
  console.log('🔑 Passwort:', adminPassword);
  console.log('👤 ID:', admin.id);
  console.log('👤 Name:', admin.name);
  console.log('🎭 Role:', admin.role);
}

main()
  .catch((e) => {
    console.error('❌ FEHLER:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Schließe Datenbank-Verbindung...');
    await prisma.$disconnect();
    console.log('✅ Fertig!');
  });
