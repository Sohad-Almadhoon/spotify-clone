import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { manageSubscriptionStatusChange, upsertPriceRecord, upsertProductRecord } from '@/src/libs/supabaseAdmin';
import { stripe } from '@/src/libs/stripe';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get('Stripe-Signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  // Verify webhook signature
  try {
    if (!sig || !webhookSecret) {
      console.error('Missing signature or webhook secret.');
      return new NextResponse('Webhook Error: Missing signature or webhook secret', { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error: any) {
    console.log('Error message: ' + error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Log event type
  console.log(`Received event: ${event.type}`);

  // Handle the event if it's relevant
  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          console.log('Upserting price record:', event.data.object);
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          console.log('Managing subscription status change:', subscription.id, subscription.customer);
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer.toString(),
            event.type === 'customer.subscription.created'
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          console.log('Checkout session completed:', checkoutSession.id);
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            console.log('Handling subscription for checkout session:', subscriptionId);
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        default:
          throw new Error('Unhandled relevant event');
      }
    } catch (error: any) {
      console.error('Error handling event:', error);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
  } else {
    console.log(`Ignoring irrelevant event: ${event.type}`);
  }

  // Return a 200 response to Stripe to acknowledge receipt of the event
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
