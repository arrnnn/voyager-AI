import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateTravelPlan } from '@/lib/groq';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { destination, budget, duration, travellers, tripType, origin } = body;

    if (!destination || !budget || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clerkUser = await currentUser();
    let user = await db.user.upsert({
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

    const travelPlan = await generateTravelPlan(destination, budget, duration, travellers, tripType, origin);

    const trip = await db.trip.create({
      data: {
        userId: user.id,
        destination,
        budget: parseInt(budget),
        duration: parseInt(duration),
        travellers: parseInt(travellers),
        tripType,
        itinerary: JSON.stringify(travelPlan.itinerary),
        budget_breakdown: JSON.stringify(travelPlan.budget_breakdown),
        hotels: JSON.stringify(travelPlan.hotels),
        attractions: JSON.stringify(travelPlan.attractions),
        tips: JSON.stringify(travelPlan.tips),
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await db.usage.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: { generationsCount: { increment: 1 } },
      create: { userId: user.id, date: today, generationsCount: 1 },
    });

    // ✅ FIXED: Removed undefined 'plan' variable
    return NextResponse.json({ success: true, trip, plan: travelPlan });
  } catch (error) {
    console.error('[GENERATE_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}