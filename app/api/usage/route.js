import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clerkUser = await currentUser();
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        image: clerkUser.imageUrl,
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        image: clerkUser.imageUrl,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usage = await db.usage.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });

    return NextResponse.json({
      plan: 'free',
      used: usage?.generationsCount || 0,
      limit: null,
      unlimited: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}