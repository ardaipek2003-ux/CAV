import { PrismaClient } from '@prisma/client';

const BATCH_SIZE = 10_000;
const TOTAL_MODULES = 10_000;
const ROWS_PER_MODULE = 5;
const SPOTS_PER_ROW = 9;

const prisma = new PrismaClient();

function growthMultiplier(rowNumber: number): number {
  // Row 3 is baseline (1.0). Each row up is 5% faster, each down 5% slower.
  // multiplier = 1.05 ^ (3 - rowNumber)
  return Math.pow(1.05, 3 - rowNumber);
}

async function main() {
  console.log('🌱 Seeding facility with 450,000 spots...');
  console.log('  This may take a minute. Using batch inserts of 10,000 records.\n');

  // Clear existing spots (in case of re-seed)
  await prisma.robotJob.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.user.deleteMany();

  console.log('  Cleared existing data.');

  let batch: {
    moduleNumber: number;
    rowNumber: number;
    spotNumber: number;
    growthMultiplier: number;
  }[] = [];

  let totalInserted = 0;

  for (let m = 1; m <= TOTAL_MODULES; m++) {
    for (let r = 1; r <= ROWS_PER_MODULE; r++) {
      for (let s = 1; s <= SPOTS_PER_ROW; s++) {
        batch.push({
          moduleNumber: m,
          rowNumber: r,
          spotNumber: s,
          growthMultiplier: parseFloat(growthMultiplier(r).toFixed(4)),
        });

        if (batch.length >= BATCH_SIZE) {
          await prisma.spot.createMany({ data: batch });
          totalInserted += batch.length;
          batch = [];

          if (totalInserted % 50_000 === 0) {
            const pct = ((totalInserted / 450_000) * 100).toFixed(0);
            console.log(`  Inserted ${totalInserted.toLocaleString()} spots (${pct}%)`);
          }
        }
      }
    }
  }

  // Insert remaining
  if (batch.length > 0) {
    await prisma.spot.createMany({ data: batch });
    totalInserted += batch.length;
  }

  console.log(`\n✅ Seeded ${totalInserted.toLocaleString()} spots successfully!`);

  // Create a default admin user
  const bcrypt = await import('bcryptjs');
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@verticalfarm.com',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('  Created admin user: admin@verticalfarm.com / admin123');

  // Create a demo buyer
  const buyerHash = await bcrypt.hash('buyer123', 10);
  await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      passwordHash: buyerHash,
      name: 'Demo Buyer',
      role: 'BUYER',
    },
  });
  console.log('  Created demo buyer: buyer@example.com / buyer123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
