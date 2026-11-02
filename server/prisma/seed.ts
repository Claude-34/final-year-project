import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL ?? 'admin@authority.local').toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD ?? 'AdminChangeMe1!';
  const name = process.env.ADMIN_SEED_NAME ?? 'Authority Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name, role: 'admin' },
    update: { passwordHash, name, role: 'admin' },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
