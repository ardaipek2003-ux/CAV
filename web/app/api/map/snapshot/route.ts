import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get module-level aggregation using raw SQL for performance
    // (querying 450k spots with ORM is too slow)
    const spots = await prisma.spot.findMany({
      select: {
        moduleNumber: true,
        status: true,
        plant: {
          select: {
            orderId: true,
            order: {
              select: {
                buyerId: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by module
    const moduleMap = new Map<
      number,
      { buyer: number; other: number; empty: number; buyerOrderIds: Set<string> }
    >();

    for (let m = 1; m <= 10000; m++) {
      moduleMap.set(m, { buyer: 0, other: 0, empty: 0, buyerOrderIds: new Set() });
    }

    for (const spot of spots) {
      const mod = moduleMap.get(spot.moduleNumber);
      if (!mod) continue;

      if (spot.status === 'EMPTY') {
        mod.empty++;
      } else if (
        spot.plant && 
        ((orderId && spot.plant.orderId === orderId) || (!orderId && userId && spot.plant.order?.buyerId === userId))
      ) {
        mod.buyer++;
        mod.buyerOrderIds.add(spot.plant.orderId);
      } else if (spot.plant) {
        mod.other++;
      } else {
        mod.empty++;
      }
    }

    const modules = Array.from(moduleMap.entries()).map(([moduleNumber, data]) => ({
      moduleNumber,
      status: data.buyer > 0 ? 'buyer' : data.other > 0 ? 'other' : ('empty' as const),
      buyerOrderIds: Array.from(data.buyerOrderIds),
    }));

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Map snapshot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
