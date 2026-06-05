import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tripId } = await req.json();

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const trip = await db.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Reuse existing token, or generate a new one
    let token = trip.shareToken;
    if (!token) {
      token = randomBytes(24).toString('hex'); // 48-char secure random token
      await db.trip.update({
        where: { id: tripId },
        data: { shareToken: token },
      });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`;
    return NextResponse.json({ shareUrl });
  } catch (error) {
    console.error('[SHARE_TRIP_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}