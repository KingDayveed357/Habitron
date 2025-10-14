// EDGE FUNCTION supabase/functions/ai-chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const GROQ_API_URL = 'https://api.groq.com/openai/v1'

interface ChatRequest {
  userId: string
  chatId: string
  message: string
  personality?: string
  includeMemories?: boolean
  maxRecentMessages?: number
}

interface ChatResponse {
  aiMessage: string
  savedMemories: Array<{ id: string; summary: string }>
  relevantMemories: Array<{ id: string; summary: string; score: number }>
  modelMeta: { tokens_used: number; latency_ms: number }
  shouldSaveMemory: boolean
}

// Rate limiting: store in-memory (consider Redis for production)
const rateLimits = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50
const RATE_LIMIT_WINDOW = 3600000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimits.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT) return false
  userLimit.count++
  return true
}

async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${GROQ_API_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  })
  
  const data = await response.json()
  return data.data[0].embedding
}

async function classifyMemory(message: string): Promise<{ save: boolean; summary: string }> {
  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a JSON-only classifier. Decide if this message contains important information about the user's habits, preferences, or patterns that should be stored as long-term memory.

Save memory when:
- User shares preferences (e.g., "I prefer morning workouts")
- User mentions challenges or obstacles
- User sets goals or intentions
- User describes patterns or routines
- User shares personal insights

Output ONLY valid JSON: {"save": boolean, "summary": "10-20 word summary if save=true, else empty string"}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    }),
  })
  
  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    })
  }

  try {
    const startTime = Date.now()
    
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const body: ChatRequest = await req.json()
    const { 
      chatId, 
      message, 
      personality = 'default',
      includeMemories = true,
      maxRecentMessages = 12 
    } = body

    // 1. Load chat and recent messages
    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(maxRecentMessages)

    // 2. Get personality prompt
    const { data: personalityData } = await supabase
      .from('chat_personalities')
      .select('system_prompt')
      .eq('id', personality)
      .single()

    const systemPrompt = personalityData?.system_prompt || 
      'You are a helpful, supportive AI coach. Keep responses concise and actionable.'

    // 3. Retrieve relevant memories (if enabled)
    let relevantMemories: any[] = []
    if (includeMemories) {
      try {
        const queryEmbedding = await createEmbedding(message)
        const { data: memories } = await supabase.rpc('match_memories_for_user', {
          p_user_id: user.id,
          p_query: `[${queryEmbedding.join(',')}]`,
          p_limit: 5
        })
        
        // Filter by similarity threshold (< 0.3 for L2 distance is good)
        relevantMemories = (memories || [])
          .filter((m: any) => m.distance < 0.3)
          .map((m: any) => ({
            id: m.id,
            summary: m.summary,
            score: m.distance
          }))
      } catch (error) {
        console.error('Memory retrieval failed:', error)
        // Continue without memories
      }
    }

    // 4. Build prompt with context
    const memoryBlock = relevantMemories.length > 0
      ? `\n\nRELEVANT USER FACTS:\n${relevantMemories.map(m => `- ${m.summary}`).join('\n')}`
      : ''

    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')

    const fullPrompt = `${systemPrompt}${memoryBlock}

RECENT CONVERSATION:
${conversationHistory}
User: ${message}

Respond as a supportive AI coach. Keep it concise and actionable (under 150 words).`

    // 5. Call Llama for chat completion
    const chatResponse = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const chatData = await chatResponse.json()
    const aiMessage = chatData.choices[0].message.content

    // 6. Classify and potentially save memory
    const savedMemories: any[] = []
    let shouldSaveMemory = false

    try {
      const classification = await classifyMemory(message)
      shouldSaveMemory = classification.save

      if (classification.save && classification.summary) {
        const embedding = await createEmbedding(classification.summary)
        
        // Save user message to get ID
        const { data: userMsg } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            user_id: user.id,
            sender: 'user',
            content: message,
            status: 'sent'
          })
          .select()
          .single()

        // Save memory
        const { data: memory } = await supabase
          .from('memories')
          .insert({
            user_id: user.id,
            chat_id: chatId,
            source_message_id: userMsg.id,
            content: message,
            summary: classification.summary,
            embedding: `[${embedding.join(',')}]`,
          })
          .select()
          .single()

        if (memory) {
          savedMemories.push({
            id: memory.id,
            summary: classification.summary
          })
        }
      }
    } catch (error) {
      console.error('Memory save failed:', error)
      // Continue without saving memory
    }

    // 7. Save AI response
    await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: user.id,
        sender: 'ai',
        content: aiMessage,
        status: 'sent',
        metadata: { model: 'llama-3.1-8b-instant' }
      })

    // 8. Update chat last activity
    await supabase
      .from('chats')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', chatId)

    const response: ChatResponse = {
      aiMessage,
      savedMemories,
      relevantMemories,
      modelMeta: {
        tokens_used: chatData.usage?.total_tokens || 0,
        latency_ms: Date.now() - startTime
      },
      shouldSaveMemory
    }

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})