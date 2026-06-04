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

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[SYNC_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}