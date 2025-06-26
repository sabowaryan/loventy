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

    // Parse the request body
    const { price_id, mode, success_url, cancel_url } = await req.json()

    // Validate required parameters
    if (!price_id) {
      throw new Error('Missing price_id parameter')
    }
    if (!mode) {
      throw new Error('Missing mode parameter')
    }
    if (!success_url) {
      throw new Error('Missing success_url parameter')
    }
    if (!cancel_url) {
      throw new Error('Missing cancel_url parameter')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Check if the user already has a Stripe customer ID
    const { data: customerData, error: customerError } = await supabaseClient
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId: string

    if (customerError && customerError.code !== 'PGRST116') {
      throw new Error('Error checking customer: ' + customerError.message)
    }

    if (customerData?.customer_id) {
      // Use existing customer
      customerId = customerData.customer_id
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })

      // Store the customer ID in the database
      const { error: insertError } = await supabaseClient
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: customer.id,
        })

      if (insertError) {
        throw new Error('Error storing customer: ' + insertError.message)
      }

      customerId = customer.id
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      metadata: {
        user_id: user.id,
      },
    })

    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
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