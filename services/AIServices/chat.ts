// services/AIServices/chat.ts
import { supabase } from '../supabase'
import { apiPost } from '../apiClient'

export interface ChatMessage {
  id: string
  chat_id: string
  user_id: string
  sender: 'user' | 'ai' | 'system'
  content: string
  status: 'sending' | 'sent' | 'failed' | 'deleted'
  metadata?: any
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  personality: string
  metadata?: any
  created_at: string
  last_activity_at: string
}

export interface ChatWithPreview extends Chat {
  message_count: number
  memory_count: number
  last_message?: string
  last_message_at?: string
  last_message_sender?: 'user' | 'ai' | 'system'
}

export interface ChatResponse {
  aiMessage: string
  savedMemories: Array<{ id: string; summary: string }>
  relevantMemories: Array<{ id: string; summary: string; score: number }>
  modelMeta: { tokens_used: number; latency_ms: number }
  shouldSaveMemory: boolean
}

export interface PersonalityOption {
  id: string
  name: string
  description: string
  icon: string
  systemPrompt?: string
}

export const PERSONALITIES: PersonalityOption[] = [
  {
    id: 'default',
    name: 'Balanced Coach',
    description: 'Supportive and practical advice',
    icon: '🤖'
  },
  {
    id: 'motivator',
    name: 'Motivator',
    description: 'High-energy and encouraging',
    icon: '🔥'
  },
  {
    id: 'calm',
    name: 'Calm Guide',
    description: 'Gentle and mindful approach',
    icon: '🧘'
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Focused on metrics and patterns',
    icon: '📊'
  },
  {
    id: 'friend',
    name: 'Friendly Buddy',
    description: 'Casual and conversational',
    icon: '👋'
  }
]

class ChatService {
  private static instance: ChatService

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  /**
   * Create a new chat session
   */
  async createChat(
    userId: string, 
    title: string = 'New Chat',
    personality: string = 'default'
  ): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        title,
        personality,
        last_activity_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get all chats for a user (simple version)
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get all chats for a user with preview information
   * This fetches message counts and last message for the chat list
   */
  async getUserChatsWithPreview(userId: string): Promise<ChatWithPreview[]> {
    // Get all chats for user
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false })

    if (chatsError) throw chatsError
    if (!chats || chats.length === 0) return []

    // For each chat, get message count and last message
    const chatsWithPreview = await Promise.all(
      chats.map(async (chat) => {
        // Get message count
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)

        // Get last message
        const { data: lastMessages, error: msgError } = await supabase
          .from('messages')
          .select('content, sender, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)

        const lastMessage = lastMessages?.[0]
        const memoryCount = chat.metadata?.memory_count || 0

        return {
          ...chat,
          message_count: count || 0,
          memory_count: memoryCount,
          last_message: lastMessage?.content,
          last_message_at: lastMessage?.created_at,
          last_message_sender: lastMessage?.sender
        } as ChatWithPreview
      })
    )

    return chatsWithPreview
  }

  /**
   * Get a single chat with preview
   */
  async getChatWithPreview(chatId: string): Promise<ChatWithPreview | null> {
    // Get chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (chatError) {
      if (chatError.code === 'PGRST116') return null
      throw chatError
    }

    // Get message count
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)

    // Get last message
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('content, sender, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastMessage = lastMessages?.[0]
    const memoryCount = chat.metadata?.memory_count || 0

    return {
      ...chat,
      message_count: count || 0,
      memory_count: memoryCount,
      last_message: lastMessage?.content,
      last_message_at: lastMessage?.created_at,
      last_message_sender: lastMessage?.sender
    }
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    userId: string,
    chatId: string,
    message: string,
    personality: string = 'default',
    includeMemories: boolean = true
  ): Promise<{ userMessage: ChatMessage; aiResponse: ChatResponse }> {
    // 1. Optimistically insert user message
    const { data: userMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        sender: 'user',
        content: message,
        status: 'sent'
      })
      .select()
      .single()

    if (insertError) throw insertError

    try {
      // 2. Call AI chat endpoint
      const aiResponse = await apiPost<ChatResponse>('/ai-chat', {
        userId,
        chatId,
        message,
        personality,
        includeMemories,
        maxRecentMessages: 12
      }, { timeout: 30000 })

      // 3. Update last_activity_at for the chat
      await supabase
        .from('chats')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', chatId)

      return { userMessage, aiResponse }
    } catch (error) {
      // Mark user message as failed
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', userMessage.id)

      throw error
    }
  }

  /**
   * Delete a chat and all its messages
   */
  async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (error) throw error
  }

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)

    if (error) throw error
  }

  /**
   * Update chat personality
   */
  async updateChatPersonality(chatId: string, personality: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .update({ personality })
      .eq('id', chatId)

    if (error) throw error
  }

  /**
   * Clear all messages in a chat (keeps the chat)
   */
  async clearChatMessages(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId)

    if (error) throw error

    // Update last_activity_at
    await supabase
      .from('chats')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', chatId)
  }

  /**
   * Subscribe to new messages in a chat
   */
  subscribeToChat(
    chatId: string,
    onMessage: (message: ChatMessage) => void
  ) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => onMessage(payload.new as ChatMessage)
      )
      .subscribe()
  }

  /**
   * Subscribe to chat updates (for real-time title/personality changes)
   */
  subscribeToChats(
    userId: string,
    onChatUpdate: (chat: Chat) => void,
    onChatDelete: (chatId: string) => void
  ) {
    return supabase
      .channel(`chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `user_id=eq.${userId}`
        },
        (payload) => onChatUpdate(payload.new as Chat)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chats',
          filter: `user_id=eq.${userId}`
        },
        (payload) => onChatDelete(payload.old.id)
      )
      .subscribe()
  }

  /**
   * Get personality options
   */
  getPersonalities(): PersonalityOption[] {
    return PERSONALITIES
  }

  /**
   * Get personality by ID
   */
  getPersonality(id: string): PersonalityOption | undefined {
    return PERSONALITIES.find(p => p.id === id)
  }
}

export const chatService = ChatService.getInstance()