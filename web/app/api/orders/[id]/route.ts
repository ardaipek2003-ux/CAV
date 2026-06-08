import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        buyerId: session.user.id,
      },
      include: {
        plants: {
          include: {
            spot: {
              select: {
                moduleNumber: true,
                rowNumber: true,
                spotNumber: true,
              },
            },
          },
          orderBy: [
            { spot: { moduleNumber: 'asc' } },
            { spot: { rowNumber: 'asc' } },
          ],
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { plants: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';

    if (!isAdmin) {
      if (order.buyerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (order.status !== 'PENDING') {
        return NextResponse.json({ error: 'You can only cancel pending orders.' }, { status: 400 });
      }
    }

    // Admin or allowed buyer. We must delete the order.
    // If there are plants, we must free the spots first and delete robot jobs.
    await prisma.$transaction(async (tx) => {
      const plantIds = order.plants.map(p => p.id);
      
      if (plantIds.length > 0) {
        // Free spots
        await tx.spot.updateMany({
          where: { plantId: { in: plantIds } },
          data: { status: 'EMPTY', plantId: null },
        });

        // Delete robot jobs
        await tx.robotJob.deleteMany({
          where: { plantId: { in: plantIds } },
        });

        // Delete plants
        await tx.plant.deleteMany({
          where: { orderId: id },
        });
      }

      // Delete the order itself
      await tx.order.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
