// import { PrismaClient } from '@prisma/client';
// import { PrismaClient } from '@prisma/client/extension';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { Role } from '../generated/prisma/enums';
import { PrismaClient } from '../generated/prisma/client';
import { prisma } from '../src/lib/prisma';

dotenv.config();

// const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ---- Admin ----
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fixitnow.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Platform Admin',
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin ready: ${admin.email}`);

  // ---- Categories ----
  const categoryNames = ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry'];
  const categories = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} services` },
    });
    categories.push(cat);
  }
  console.log(`Categories ready: ${categories.map((c) => c.name).join(', ')}`);

  // ---- Sample Technician ----
  const techEmail = 'technician@fixitnow.com';
  const techPassword = await bcrypt.hash('Tech@123', 10);

  const techUser = await prisma.user.upsert({
    where: { email: techEmail },
    update: {},
    create: {
      name: 'John Plumber',
      email: techEmail,
      password: techPassword,
      role: Role.TECHNICIAN,
      phone: '01700000000',
    },
  });

  const techProfile = await prisma.technicianProfile.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      bio: 'Experienced plumber with 5 years in residential plumbing.',
      experienceYears: 5,
      hourlyRate: 25.0,
      location: 'Dhaka, Bangladesh',
    },
  });
  console.log(`Sample technician ready: ${techUser.email}`);

  // ---- Sample Service ----
  const existingService = await prisma.service.findFirst({
    where: { technicianId: techProfile.id },
  });
  if (!existingService) {
    await prisma.service.create({
      data: {
        technicianId: techProfile.id,
        categoryId: categories[0]!.id,
        title: 'Pipe Leak Repair',
        description: 'Fix leaking pipes and faucets in kitchen or bathroom.',
        price: 40.0,
      },
    });
    console.log('Sample service created.');
  }

  // ---- Sample Customer ----
  const custEmail = 'customer@fixitnow.com';
  const custPassword = await bcrypt.hash('Customer@123', 10);
  const customer = await prisma.user.upsert({
    where: { email: custEmail },
    update: {},
    create: {
      name: 'Jane Customer',
      email: custEmail,
      password: custPassword,
      role: Role.CUSTOMER,
      phone: '01800000000',
    },
  });
  console.log(`Sample customer ready: ${customer.email}`);

  console.log('\nSeed complete. Test credentials:');
  console.log(`  Admin:      ${adminEmail} / ${adminPassword}`);
  console.log(`  Technician: ${techEmail} / Tech@123`);
  console.log(`  Customer:   ${custEmail} / Customer@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });