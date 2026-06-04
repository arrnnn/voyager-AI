import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
    );
  } catch (error) {
    console.error('[WEBHOOK_SIG_ERROR]', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[WEBHOOK_EVENT]', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await db.subscription.upsert({
            where: { userId },
            update: {
              stripeSubId: sub.id,
              stripeCustomerId: session.customer,
              status: 'active',
              plan: 'pro',
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            create: {
              userId,
              stripeSubId: sub.id,
              stripeCustomerId: session.customer,
              status: 'active',
              plan: 'pro',
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
          console.log('[WEBHOOK] User upgraded to pro:', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        
        // ✅ FIX: Get userId from customer metadata instead of subscription metadata
        try {
          const customer = await stripe.customers.retrieve(sub.customer);
          const userId = customer.metadata?.userId;
          
          if (userId) {
            await db.subscription.upsert({
              where: { userId },
              update: {
                stripeSubId: sub.id,
                status: sub.status,
                plan: sub.status === 'active' ? 'pro' : 'free',
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
              },
              create: {
                userId,
                stripeSubId: sub.id,
                status: sub.status,
                plan: 'pro',
              },
            });
            console.log('[WEBHOOK] Subscription updated for user:', userId);
          }
        } catch (error) {
          console.error('[WEBHOOK] Error in subscription.updated:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        
        // ✅ FIX: Get userId from customer metadata
        try {
          const customer = await stripe.customers.retrieve(sub.customer);
          const userId = customer.metadata?.userId;
          
          if (userId) {
            await db.subscription.update({
              where: { userId },
              data: { status: 'cancelled', plan: 'free' },
            });
            console.log('[WEBHOOK] Subscription cancelled for user:', userId);
          }
        } catch (error) {
          console.error('[WEBHOOK] Error in subscription.deleted:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription);
            
            // ✅ FIX: Get userId from customer metadata instead of subscription metadata
            const customer = await stripe.customers.retrieve(sub.customer);
            const userId = customer.metadata?.userId;
            
            if (userId) {
              await db.subscription.update({
                where: { userId },
                data: { status: 'active', plan: 'pro' },
              });
              console.log('[WEBHOOK] Invoice paid for user:', userId);
            }
          } catch (error) {
            console.error('[WEBHOOK] Error in invoice.payment_succeeded:', error);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK_PROCESS_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}