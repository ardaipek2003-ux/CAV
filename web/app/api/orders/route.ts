import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        cropType: true,
        quantityKg: true,
        spotsNeeded: true,
        status: true,
        quotedHarvest: true,
        actualHarvest: true,
        createdAt: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
