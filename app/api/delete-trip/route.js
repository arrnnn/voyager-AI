import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(req) {
  try {
    const { userId } = auth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tripId } = await req.json();
    const user = await db.user.findUnique({ where: { clerkId: userId } });

    const trip = await db.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await db.trip.delete({ where: { id: tripId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}