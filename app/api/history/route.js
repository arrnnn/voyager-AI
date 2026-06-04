import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const savedOnly = searchParams.get('saved') === 'true';

    const clerkUser = await currentUser();
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        image: clerkUser.imageUrl,
      },
    });

    const subscription = await db.subscription.findUnique({ where: { userId: user.id } });
    const plan = subscription?.plan || 'free';
    const limit = plan === 'pro' ? 100 : 10;

    const trips = await db.trip.findMany({
      where: {
        userId: user.id,
        ...(savedOnly ? { saved: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: savedOnly ? (plan === 'pro' ? 100 : 3) : limit,
    });

    return NextResponse.json({ trips, plan, limit });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}