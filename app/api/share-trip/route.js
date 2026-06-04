import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tripId } = await req.json();
    const user = await db.user.findUnique({ where: { clerkId: userId } });

   
    const trip = await db.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${tripId}`;
    return NextResponse.json({ shareUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}