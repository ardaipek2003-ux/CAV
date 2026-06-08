import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const algorithmUrl = process.env.ALGORITHM_SERVICE_URL || 'https://algorithm-sandy-nine.vercel.app';

    const response = await fetch(`${algorithmUrl}/optimize`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Optimizer service error' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Optimizer trigger error:', error);
    return NextResponse.json(
      { error: 'Unable to reach algorithm service' },
      { status: 503 }
    );
  }
}
