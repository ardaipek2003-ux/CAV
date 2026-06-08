import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleNumber: string }> }
) {
  try {
    const { moduleNumber: moduleNumberStr } = await params;
    const moduleNumber = parseInt(moduleNumberStr, 10);

    if (isNaN(moduleNumber) || moduleNumber < 1 || moduleNumber > 10000) {
      return NextResponse.json({ error: 'Invalid module number' }, { status: 400 });
    }

    const spots = await prisma.spot.findMany({
      where: { moduleNumber },
      include: {
        plant: {
          select: {
            id: true,
            cropType: true,
            orderId: true,
            expectedHarvest: true,
            status: true,
          },
        },
      },
      orderBy: [{ rowNumber: 'asc' }, { spotNumber: 'asc' }],
    });

    const result = spots.map((spot: typeof spots[number]) => ({
      id: spot.id,
      rowNumber: spot.rowNumber,
      spotNumber: spot.spotNumber,
      status: spot.status,
      cropType: spot.plant?.cropType || null,
      orderId: spot.plant?.orderId || null,
      daysRemaining: spot.plant?.expectedHarvest
        ? Math.max(0, Math.ceil(
            (new Date(spot.plant.expectedHarvest).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          ))
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Module detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
