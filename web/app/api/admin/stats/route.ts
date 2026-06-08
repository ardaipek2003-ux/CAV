import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalSpots, occupiedSpots, pendingRobotJobs, activeOrders] = await Promise.all([
      prisma.spot.count(),
      prisma.spot.count({ where: { status: { not: 'EMPTY' } } }),
      prisma.robotJob.count({ where: { status: 'QUEUED' } }),
      prisma.order.count({
        where: { status: { in: ['CONFIRMED', 'GROWING', 'PENDING'] } },
      }),
    ]);

    const orders = await prisma.order.findMany({
      where: { status: { in: ['CONFIRMED', 'GROWING', 'PENDING'] } },
      include: { buyer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      totalSpots,
      occupiedSpots,
      occupancyRate: totalSpots > 0 ? (occupiedSpots / totalSpots) * 100 : 0,
      pendingRobotJobs,
      activeOrders,
      orders: orders.map((o: typeof orders[number]) => ({
        id: o.id,
        cropType: o.cropType,
        quantityKg: o.quantityKg,
        status: o.status,
        quotedHarvest: o.quotedHarvest,
        buyerName: o.buyer.name || 'Unknown',
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
