import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const SYSTEM_PROMPT = `You are TechNova AI, the friendly technology assistant for the TechNova website.
Be concise, helpful and age-appropriate. Help with technology, programming, AI, cybersecurity concepts, events, project ideas, and navigating TechNova.
Do not provide instructions for dangerous or illegal activities. If a user asks for something unsafe, redirect to a safe educational alternative.
Do not claim to know private TechNova data unless it is included in the conversation context.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: corsHeaders })

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'The AI service is not configured yet. Add OPENAI_API_KEY to the Edge Function secrets.' }), { status: 503, headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!message || message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Please provide a message up to 4000 characters.' }), { status: 400, headers: corsHeaders })
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        instructions: SYSTEM_PROMPT,
        input: message,
        max_output_tokens: 700,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('OpenAI error:', data)
      return new Response(JSON.stringify({ error: 'The AI provider returned an error. Please try again.' }), { status: 502, headers: corsHeaders })
    }

    const answer = data.output_text || data.output?.flatMap((item: any) => item.content || []).map((item: any) => item.text || '').join('') || 'I could not generate an answer.'
    return new Response(JSON.stringify({ answer }), { headers: corsHeaders })
  } catch (error) {
    console.error('TechNova AI error:', error)
    return new Response(JSON.stringify({ error: 'The AI assistant could not process that request.' }), { status: 500, headers: corsHeaders })
  }
})
