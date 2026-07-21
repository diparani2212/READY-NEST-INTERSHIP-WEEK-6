import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@hospital.com';
  const adminPassword = 'Admin@123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        fullName: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        phoneNumber: '+10000000000',
        isActive: true,
      },
    });

    console.log(`[SEED SUCCESS] Default Admin account created: ${admin.email}`);
  } else {
    console.log(`[SEED NOTICE] Admin account already exists (${existingAdmin.email})`);
  }
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
