import { PrismaClient, SaasRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local database...');

  // 1. Create default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'orvexatech' },
    update: {},
    create: {
      name: 'Orvexatech',
      domain: 'orvexatech',
    },
  });

  console.log(`Tenant created: ${tenant.name} (${tenant.id})`);

  // 2. Hash Password
  const password = 'Password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Create default Admin User
  const user = await prisma.user.upsert({
    where: { email: 'admin@orvexatech.io' },
    update: {
      passwordHash,
    },
    create: {
      email: 'admin@orvexatech.io',
      name: 'Siva Sridharan',
      passwordHash,
      role: SaasRole.CLIENT_ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log(`Admin user created: ${user.email} (Password: ${password})`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
