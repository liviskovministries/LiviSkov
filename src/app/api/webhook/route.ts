import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Grant course access to user
      if (session.client_reference_id && session.payment_status === 'paid') {
        try {
          await supabase
            .from('users')
            .update({ 
              estacoes_espirituais_access: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.client_reference_id);
          
          console.log(`Course access granted for user: ${session.client_reference_id}`);
        } catch (error) {
          console.error('Error granting course access:', error);
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}