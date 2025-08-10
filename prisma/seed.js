import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123';  // Change this to a secure password

  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    console.log('Admin user already exists, updating role to ADMIN...');
    user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
  } else {
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      }
    });
  }

  console.log('Admin user ready:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
