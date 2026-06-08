import { PrismaClient, CropType, OrderStatus, PlantStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed orders and plants...');
  
  // 1. Get a buyer
  const buyer = await prisma.user.findFirst({ where: { role: 'BUYER' } });
  if (!buyer) {
    console.error("No buyer found. Please run the main seed script first.");
    return;
  }
  
  // 2. Count existing spots and empty spots
  const totalSpots = await prisma.spot.count();
  const emptySpots = await prisma.spot.findMany({
    where: { status: 'EMPTY' },
    select: { id: true }
  });
  
  const targetOccupiedCount = Math.floor(totalSpots / 2);
  const currentOccupiedCount = totalSpots - emptySpots.length;
  const spotsToFillCount = targetOccupiedCount - currentOccupiedCount;
  
  if (spotsToFillCount <= 0) {
    console.log(`Facility is already half or more full. Target: ${targetOccupiedCount}, Occupied: ${currentOccupiedCount}`);
    return;
  }
  
  console.log(`Need to fill ${spotsToFillCount} spots to reach 50% capacity.`);
  
  // Slice empty spots
  const spotsToFill = emptySpots.slice(0, spotsToFillCount);
  
  let spotIndex = 0;
  const BATCH_SIZE = 5000;
  
  const cropTypes: CropType[] = ['LETTUCE', 'TOMATO'];
  
  let ordersBatch: any[] = [];
  let plantsBatch: any[] = [];
  let spotsUpdateBatch: { spotId: string; plantId: string }[] = [];
  
  let ordersCreated = 0;
  let plantsCreated = 0;
  
  while (spotIndex < spotsToFill.length) {
    const remainingSpots = spotsToFill.length - spotIndex;
    // Generate a random order needing between 50 and 550 spots
    const spotsNeededForOrder = Math.min(Math.floor(Math.random() * 500) + 50, remainingSpots);
    
    const orderId = crypto.randomUUID();
    const cropType = cropTypes[Math.floor(Math.random() * cropTypes.length)];
    
    const now = new Date();
    
    ordersBatch.push({
      id: orderId,
      buyerId: buyer.id,
      cropType,
      quantityKg: spotsNeededForOrder * 0.2, // Rough estimate
      spotsNeeded: spotsNeededForOrder,
      status: 'GROWING' as OrderStatus,
      createdAt: now,
      confirmedAt: now,
    });
    
    ordersCreated++;
    
    for (let i = 0; i < spotsNeededForOrder; i++) {
      const spot = spotsToFill[spotIndex];
      const plantId = crypto.randomUUID();
      
      const expectedHarvest = new Date(now);
      expectedHarvest.setDate(expectedHarvest.getDate() + (cropType === 'LETTUCE' ? 30 : 60));

      plantsBatch.push({
        id: plantId,
        orderId,
        cropType,
        spotId: spot.id,
        status: 'PLANTED' as PlantStatus,
        plantedAt: now,
        expectedHarvest,
      });
      
      spotsUpdateBatch.push({ spotId: spot.id, plantId });
      
      spotIndex++;
      plantsCreated++;
    }
    
    // If batches get large, commit them to DB
    if (plantsBatch.length >= BATCH_SIZE || spotIndex >= spotsToFill.length) {
      console.log(`Committing batch... (Plants: ${plantsCreated}/${spotsToFill.length})`);
      
      // 1. Create orders
      await prisma.order.createMany({ data: ordersBatch });
      
      // 2. Create plants
      await prisma.plant.createMany({ data: plantsBatch });
      
      // 3. Update spots
      try {
        const values = spotsUpdateBatch.map(s => `('${s.spotId}', '${s.plantId}')`).join(', ');
        await prisma.$executeRawUnsafe(`
          UPDATE spots AS s
          SET status = 'OCCUPIED', plant_id = v.plant_id
          FROM (VALUES ${values}) AS v(spot_id, plant_id)
          WHERE s.id = v.spot_id;
        `);
      } catch (err) {
        console.warn("Raw SQL update failed, falling back to sequential update (might be slow)...", err);
        const updates = spotsUpdateBatch.map(s => 
          prisma.spot.update({
            where: { id: s.spotId },
            data: { status: 'OCCUPIED', plantId: s.plantId }
          })
        );
        // Execute in chunks of 500 to not overload the pool
        for (let i = 0; i < updates.length; i += 500) {
          await Promise.all(updates.slice(i, i + 500));
        }
      }
      
      // Clear batches
      ordersBatch = [];
      plantsBatch = [];
      spotsUpdateBatch = [];
    }
  }
  
  console.log(`\n✅ Finished! Created ${ordersCreated} orders and filled ${plantsCreated} spots.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
