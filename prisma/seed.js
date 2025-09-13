// const prisma = new PrismaClient();

// async function main() {
//   // Update the user role to 'ADMIN'
//   const user = await prisma.user.update({
//     where: { email: 'admin@example.com' },  // Match by the email of the user
//     data: { role: 'ADMIN' },  // Set the role to 'ADMIN'
//   });
//   console.log('User role updated:', user);
// }

// main()
//   .catch(e => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'admin123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // Update if admin exists, else create
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (existingAdmin) {
    const updated = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { password: passwordHash },
    });
    console.log('Admin password updated:', updated.email);
  } else {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: passwordHash,
        role: 'ADMIN',
        name: 'Admin',
      },
    });
    console.log('Admin user created:', admin.email);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
