import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { stripe } from '@/src/libs/stripe';
import { getURL } from '@/src/libs/helpers';
import { createOrRetrieveCustomer } from '@/src/libs/supabaseAdmin';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({
      cookies,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if the user exists and has valid id and email
    if (!user || !user.id || !user.email) {
      throw new Error('User not found or invalid user data');
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email,
    });

    if (!customer) {
      throw new Error('Customer not found or could not be created');
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`,
    });

    return NextResponse.json({ url });
  } catch (error: any) {
    console.log('Error:', error.message);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
