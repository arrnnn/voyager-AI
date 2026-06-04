import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tripId } = await req.json();

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

   
   

    const trip = await db.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await db.trip.update({
      where: { id: tripId },
      data: { saved: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}