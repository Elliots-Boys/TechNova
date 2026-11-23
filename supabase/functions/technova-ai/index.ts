import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

// Free mode: deliberately does not call OpenAI or any other paid model provider.
// Supported date/time utilities and document reading run in the visitor's browser.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: corsHeaders })
  return new Response(JSON.stringify({
    mode: 'free-local',
    providerCalls: 0,
    answer: 'TechNova AI uses its free browser-based features. Ask date and time questions, use the built-in knowledge bank, or upload a supported document to search and summarise its text locally.',
  }), { headers: corsHeaders })
})
