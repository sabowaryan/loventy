import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: sitemapEntries, error } = await supabaseClient
      .from('sitemap_entries')
      .select('*');

    if (error) {
      throw error;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    sitemapEntries.forEach((entry) => {
      xml += `
  <url>
    <loc>${entry.loc}</loc>`;
      if (entry.lastmod) {
        xml += `
    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>`;
      }
      if (entry.changefreq) {
        xml += `
    <changefreq>${entry.changefreq}</changefreq>`;
      }
      if (entry.priority !== null) {
        xml += `
    <priority>${entry.priority}</priority>`;
      }
      xml += `
  </url>`;
    });

    xml += `
</urlset>`;

    return new Response(
      xml,
      {
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

