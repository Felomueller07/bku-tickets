const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const codes = [
    'FREI2026',
    'VIP2026',
    'GRATIS01',
    'GRATIS02',
    'GRATIS03',
  ];

  for (const code of codes) {
    await prisma.voucherCode.create({
      data: { code }
    });
    console.log(`✅ Code erstellt: ${code}`);
  }
}

main()
  .then(() => console.log('\n🎉 Alle Codes erstellt!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
