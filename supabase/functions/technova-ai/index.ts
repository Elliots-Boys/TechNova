import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const SYSTEM_PROMPT = `
You are TechNova AI, the friendly built-in assistant for the TechNova technology website.

Be conversational, natural and concise unless the user asks for detail.
Understand common casual chat and abbreviations. For example:
- "hru" means "how are you?"
- "wyd" means "what are you doing?"
- "ty" means "thank you"
- "idk" means "I don't know"

Do not force casual conversation into a technology explanation.
If the user says hello or asks how you are, respond naturally.
For technology questions, explain clearly and accurately.
You can help with coding, AI, web development, cybersecurity concepts, PC hardware, TechNova features, events and project ideas.
Never claim access to private user data unless that data was explicitly provided to you in the request.
Keep responses age-appropriate and avoid dangerous or illegal instructions.
`.trim()

type HistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

function cleanHistory(value: unknown): HistoryItem[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(-12)
    .map((item: any) => ({
      role: item?.role === 'assistant' ? 'assistant' : 'user',
      content: typeof item?.content === 'string' ? item.content.trim().slice(0, 4000) : '',
    }))
    .filter(item => item.content)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'POST required' }),
      { status: 405, headers: corsHeaders },
    )
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY')

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'TechNova AI is not configured on the server.' }),
      { status: 503, headers: corsHeaders },
    )
  }

  try {
    const body = await req.json()
    const message =
      typeof body?.message === 'string'
        ? body.message.trim()
        : ''

    if (!message || message.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Please enter a message up to 4000 characters.' }),
        { status: 400, headers: corsHeaders },
      )
    }

    const history = cleanHistory(body?.history)

    const input = [
      ...history,
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        instructions: SYSTEM_PROMPT,
        input,
        max_output_tokens: 900,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenAI API error', {
        status: response.status,
        type: data?.error?.type,
        code: data?.error?.code,
        message: data?.error?.message,
      })

      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            'The AI provider returned an error.',
        }),
        { status: 502, headers: corsHeaders },
      )
    }

    const answer =
      data.output_text ||
      data.output
        ?.flatMap((item: any) => item.content || [])
        .map((item: any) => item.text || '')
        .join('')
        .trim() ||
      'I could not generate an answer.'

    return new Response(
      JSON.stringify({ answer }),
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error('TechNova AI error:', error)

    return new Response(
      JSON.stringify({
        error: 'The AI assistant could not process that request.',
      }),
      { status: 500, headers: corsHeaders },
    )
  }
})
