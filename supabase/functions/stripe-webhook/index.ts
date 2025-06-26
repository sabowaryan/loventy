// Follow this setup guide to integrate the Deno runtime and Supabase functions in your project:
// https://supabase.com/docs/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.39.0"
import Stripe from "npm:stripe@14.5.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    })
  }

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature provided')
    }

    // Get the raw body
    const body = await req.text()

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Verify the webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET')
    }

    // Construct the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get customer ID
        const customerId = session.customer as string
        
        // Get user ID from metadata or from customer
        let userId = session.metadata?.user_id
        
        if (!userId) {
          // Look up user ID from customer
          const { data: customerData, error: customerError } = await supabaseAdmin
            .from('stripe_customers')
            .select('user_id')
            .eq('customer_id', customerId)
            .maybeSingle()
          
          if (customerError) {
            throw new Error(`Error fetching customer: ${customerError.message}`)
          }
          
          userId = customerData?.user_id
        }
        
        if (!userId) {
          throw new Error('Could not determine user ID')
        }
        
        // Handle subscription
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          // Get price ID
          const priceId = subscription.items.data[0].price.id
          
          // Update or insert subscription
          const { error: subscriptionError } = await supabaseAdmin
            .from('stripe_subscriptions')
            .upsert({
              customer_id: customerId,
              subscription_id: subscriptionId,
              price_id: priceId,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
          
          if (subscriptionError) {
            throw new Error(`Error updating subscription: ${subscriptionError.message}`)
          }
          
          // Add premium role to user
          const { data: roleData, error: roleError } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', 'premium')
            .maybeSingle()
          
          if (roleError) {
            throw new Error(`Error fetching premium role: ${roleError.message}`)
          }
          
          if (roleData?.id) {
            const { error: userRoleError } = await supabaseAdmin
              .from('user_roles')
              .upsert({
                user_id: userId,
                role_id: roleData.id,
                assigned_at: new Date().toISOString(),
              })
            
            if (userRoleError) {
              throw new Error(`Error assigning premium role: ${userRoleError.message}`)
            }
          }
        }
        
        // Handle one-time payment
        if (session.mode === 'payment') {
          const paymentIntentId = session.payment_intent as string
          
          // Get payment intent details
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          
          // Insert order
          const { error: orderError } = await supabaseAdmin
            .from('stripe_orders')
            .insert({
              checkout_session_id: session.id,
              payment_intent_id: paymentIntentId,
              customer_id: customerId,
              amount_subtotal: session.amount_subtotal,
              amount_total: session.amount_total,
              currency: session.currency,
              payment_status: paymentIntent.status,
              status: 'completed',
            })
          
          if (orderError) {
            throw new Error(`Error creating order: ${orderError.message}`)
          }
        }
        
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription in database
        const { error: subscriptionError } = await supabaseAdmin
          .from('stripe_subscriptions')
          .upsert({
            customer_id: subscription.customer as string,
            subscription_id: subscription.id,
            price_id: subscription.items.data[0].price.id,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
        
        if (subscriptionError) {
          throw new Error(`Error updating subscription: ${subscriptionError.message}`)
        }
        
        // If subscription is no longer active, remove premium role
        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
          // Get user ID from customer
          const { data: customerData, error: customerError } = await supabaseAdmin
            .from('stripe_customers')
            .select('user_id')
            .eq('customer_id', subscription.customer as string)
            .maybeSingle()
          
          if (customerError) {
            throw new Error(`Error fetching customer: ${customerError.message}`)
          }
          
          if (customerData?.user_id) {
            // Get premium role ID
            const { data: roleData, error: roleError } = await supabaseAdmin
              .from('roles')
              .select('id')
              .eq('name', 'premium')
              .maybeSingle()
            
            if (roleError) {
              throw new Error(`Error fetching premium role: ${roleError.message}`)
            }
            
            if (roleData?.id) {
              // Remove premium role
              const { error: deleteRoleError } = await supabaseAdmin
                .from('user_roles')
                .delete()
                .match({
                  user_id: customerData.user_id,
                  role_id: roleData.id,
                })
              
              if (deleteRoleError) {
                throw new Error(`Error removing premium role: ${deleteRoleError.message}`)
              }
            }
          }
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Mark subscription as deleted
        const { error: subscriptionError } = await supabaseAdmin
          .from('stripe_subscriptions')
          .update({
            status: 'canceled',
            deleted_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription.id)
        
        if (subscriptionError) {
          throw new Error(`Error updating subscription: ${subscriptionError.message}`)
        }
        
        // Get user ID from customer
        const { data: customerData, error: customerError } = await supabaseAdmin
          .from('stripe_customers')
          .select('user_id')
          .eq('customer_id', subscription.customer as string)
          .maybeSingle()
        
        if (customerError) {
          throw new Error(`Error fetching customer: ${customerError.message}`)
        }
        
        if (customerData?.user_id) {
          // Get premium role ID
          const { data: roleData, error: roleError } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', 'premium')
            .maybeSingle()
          
          if (roleError) {
            throw new Error(`Error fetching premium role: ${roleError.message}`)
          }
          
          if (roleData?.id) {
            // Remove premium role
            const { error: deleteRoleError } = await supabaseAdmin
              .from('user_roles')
              .delete()
              .match({
                user_id: customerData.user_id,
                role_id: roleData.id,
              })
            
            if (deleteRoleError) {
              throw new Error(`Error removing premium role: ${deleteRoleError.message}`)
            }
          }
        }
        
        break
      }
      
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod
        
        // Get customer ID
        const customerId = paymentMethod.customer as string
        
        // Get subscription
        const { data: subscriptions, error: listError } = await stripe.subscriptions.list({
          customer: customerId,
          limit: 1,
        })
        
        if (listError) {
          throw new Error(`Error listing subscriptions: ${listError}`)
        }
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          
          // Update subscription with payment method details
          const { error: subscriptionError } = await supabaseAdmin
            .from('stripe_subscriptions')
            .update({
              payment_method_brand: paymentMethod.card?.brand,
              payment_method_last4: paymentMethod.card?.last4,
            })
            .eq('subscription_id', subscription.id)
          
          if (subscriptionError) {
            throw new Error(`Error updating subscription: ${subscriptionError.message}`)
          }
        }
        
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})