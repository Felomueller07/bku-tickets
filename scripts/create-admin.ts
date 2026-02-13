// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@bku.com';
  const adminPassword = 'admin123';

  // Prüfen ob Admin schon existiert
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin existiert bereits:', adminEmail);
    return;
  }

  // Passwort hashen
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Admin erstellen
  const admin = await prisma.user.create({
data: {
  email: adminEmail,
  password: hashedPassword,
  role: 'admin',
},
  });

  console.log('✅ Admin erstellt!');
console.log('📧 Email:', adminEmail);
console.log('🔑 Passwort:', adminPassword);
console.log('👤 Role:', admin.role);  // ✅ Role statt name
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });