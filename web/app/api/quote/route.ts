import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cropType, quantityKg } = body;

    if (!cropType || !quantityKg) {
      return NextResponse.json(
        { error: 'cropType and quantityKg are required' },
        { status: 400 }
      );
    }

    const algorithmUrl = process.env.ALGORITHM_SERVICE_URL || 'https://algorithm-taupe-two.vercel.app';

    const response = await fetch(`${algorithmUrl}/quote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: JSON.stringify({
        buyer_id: session.user.id,
        crop_type: cropType,
        quantity_kg: quantityKg,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.detail || 'Algorithm service error' },
        { status: response.status === 503 ? 503 : 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quote proxy error:', error);
    return NextResponse.json(
      { error: 'Unable to reach the algorithm service. Please try again later.' },
      { status: 503 }
    );
  }
}
