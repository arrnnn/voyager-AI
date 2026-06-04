import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST() {
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

    let subscription = await db.subscription.findUnique({ where: { userId: user.id } });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || '',
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      if (!subscription) {
        await db.subscription.create({
          data: { userId: user.id, stripeCustomerId: customerId },
        });
      } else {
        await db.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { userId: user.id },
      billing_address_collection: 'auto',
      payment_method_types: ['card', 'upi'],  // ← CHANGE THIS LINE (add 'upi')
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[CHECKOUT_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}