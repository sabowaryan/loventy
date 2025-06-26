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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Create a Supabase client with the auth header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'))
    }

    // Get the customer ID for the user
    const { data: customerData, error: customerError } = await supabaseClient
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (customerError) {
      throw new Error('Error getting customer: ' + customerError.message)
    }

    if (!customerData?.customer_id) {
      throw new Error('No Stripe customer found for this user')
    }

    // Get the subscription for the customer
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('stripe_subscriptions')
      .select('subscription_id')
      .eq('customer_id', customerData.customer_id)
      .maybeSingle()

    if (subscriptionError) {
      throw new Error('Error getting subscription: ' + subscriptionError.message)
    }

    if (!subscriptionData?.subscription_id) {
      throw new Error('No active subscription found')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscriptionData.subscription_id, {
      cancel_at_period_end: true,
    })

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Subscription will be canceled at the end of the billing period' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
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