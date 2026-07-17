const { PrismaClient, SaasRole } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  console.log("Creating Super Admin account...");
  try {
    // 1. Get default tenant
    const tenant = await prisma.tenant.findUnique({
      where: { domain: 'orvexatech' }
    });

    if (!tenant) {
      throw new Error("Default tenant 'orvexatech' not found. Please run migrations/seed first.");
    }

    // 2. Hash Password
    const password = 'Password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Upsert Super Admin User
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@orvexatech.io' },
      update: {
        passwordHash,
        role: SaasRole.SUPER_ADMIN
      },
      create: {
        email: 'superadmin@orvexatech.io',
        name: 'Orvexa Super Admin',
        passwordHash,
        role: SaasRole.SUPER_ADMIN,
        tenantId: tenant.id
      }
    });

    console.log("\n============================================");
    console.log("Super Admin Account Created/Updated successfully!");
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Password: ${password}`);
    console.log("============================================\n");

  } catch (err) {
    console.error("Failed to create Super Admin:", err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
