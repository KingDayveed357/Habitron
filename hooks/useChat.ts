// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { chatService, ChatMessage, Chat, ChatWithPreview } from '@/services/AIServices/chat'
import { useAuth } from '@/hooks/useAuth'

interface UseChatOptions {
  chatId?: string
  autoCreate?: boolean
  personality?: string
}

interface UseChatReturn {
  chat: ChatWithPreview | null
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  sendMessage: (message: string) => Promise<void>
  deleteChat: () => Promise<void>
  updateTitle: (title: string) => Promise<void>
  updatePersonality: (personality: string) => Promise<void>
  clearMessages: () => Promise<void>
  retryFailedMessage: (messageId: string) => Promise<void>
  shouldShowScrollButton: boolean
  setShouldShowScrollButton: (show: boolean) => void
  error: string | null
  clearError: () => void
  memoryInfo: {
    savedCount: number
    relevantCount: number
  }
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { user } = useAuth()
  const { chatId, autoCreate = true, personality = 'default' } = options
  
  const [chat, setChat] = useState<ChatWithPreview | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memoryInfo, setMemoryInfo] = useState({ savedCount: 0, relevantCount: 0 })
  const [shouldShowScrollButton, setShouldShowScrollButton] = useState(false)
  
  const subscriptionRef = useRef<any>(null)
  const currentChatId = useRef<string | null>(null)
  const mountedRef = useRef(true)

  // Initialize chat
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const initChat = async () => {
      try {
        setIsLoading(true)
        
        let chatToUse: ChatWithPreview | null = null
        
        if (chatId) {
          chatToUse = await chatService.getChatWithPreview(chatId)
        }
        
        if (!chatToUse && autoCreate) {
          const newChat = await chatService.createChat(user.id, 'New Chat', personality)
          chatToUse = {
            ...newChat,
            message_count: 0,
            memory_count: 0
          }
        }
        
        if (chatToUse) {
          setChat(chatToUse)
          currentChatId.current = chatToUse.id
          
          const loadedMessages = await chatService.getChatMessages(chatToUse.id)
          setMessages(loadedMessages)
        }
        
        setError(null)
      } catch (err: any) {
        console.error('Failed to initialize chat:', err)
        setError(err.message || 'Failed to load chat')
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    initChat()
  }, [user, chatId, autoCreate, personality])

  // FIX #1: Subscribe to real-time messages - Now properly handles AI responses
  useEffect(() => {
    if (!currentChatId.current) return

    const subscription = chatService.subscribeToChat(
      currentChatId.current,
      (newMessage) => {
        if (!mountedRef.current) return
        
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === newMessage.id)
          if (exists) return prev
          
          // Add new message and sort by created_at to maintain order
          const updated = [...prev, newMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          return updated
        })

        // Update chat preview info
        setChat(prev => prev ? {
          ...prev,
          message_count: prev.message_count + 1,
          last_message: newMessage.content,
          last_message_at: newMessage.created_at,
          last_message_sender: newMessage.sender
        } : null)
      }
    )

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [currentChatId.current])

  // Send message - Now properly waits for AI response
  const sendMessage = useCallback(async (message: string) => {
    if (!user || !chat || !message.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      const { userMessage, aiResponse } = await chatService.sendMessage(
        user.id,
        chat.id,
        message.trim(),
        chat.personality
      )

      // Update memory info
      setMemoryInfo({
        savedCount: aiResponse.savedMemories.length,
        relevantCount: aiResponse.relevantMemories.length
      })

      // Add user message immediately (optimistic update)
      if (mountedRef.current) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === userMessage.id)
          if (exists) return prev
          return [...prev, userMessage]
        })
      }

      // AI response will come through the real-time subscription
      // But we can also add it directly for immediate display
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`, // Temporary ID
        chat_id: chat.id,
        user_id: user.id,
        sender: 'ai',
        content: aiResponse.aiMessage,
        status: 'sent',
        created_at: new Date().toISOString()
      }

      if (mountedRef.current) {
        setMessages(prev => [...prev, aiMessage])
      }

    } catch (err: any) {
      console.error('Failed to send message:', err)
      if (mountedRef.current) {
        setError(err.message || 'Failed to send message')
      }
    } finally {
      if (mountedRef.current) {
        setIsSending(false)
      }
    }
  }, [user, chat, isSending])

  const retryFailedMessage = useCallback(async (messageId: string) => {
    if (!chat) return

    const failedMessage = messages.find(m => m.id === messageId && m.status === 'failed')
    if (!failedMessage) return

    await sendMessage(failedMessage.content)
  }, [chat, messages, sendMessage])

  const deleteChat = useCallback(async () => {
    if (!chat) return

    try {
      await chatService.deleteChat(chat.id)
      setChat(null)
      setMessages([])
      currentChatId.current = null
    } catch (err: any) {
      setError(err.message || 'Failed to delete chat')
    }
  }, [chat])

  const updateTitle = useCallback(async (title: string) => {
    if (!chat) return

    try {
      await chatService.updateChatTitle(chat.id, title)
      setChat(prev => prev ? { ...prev, title } : null)
    } catch (err: any) {
      setError(err.message || 'Failed to update title')
    }
  }, [chat])

  const updatePersonality = useCallback(async (newPersonality: string) => {
    if (!chat) return

    try {
      await chatService.updateChatPersonality(chat.id, newPersonality)
      setChat(prev => prev ? { ...prev, personality: newPersonality } : null)
    } catch (err: any) {
      setError(err.message || 'Failed to update personality')
    }
  }, [chat])

  const clearMessages = useCallback(async () => {
    if (!chat) return

    try {
      await chatService.clearChatMessages(chat.id)
      setMessages([])
      setChat(prev => prev ? {
        ...prev,
        message_count: 0,
        last_message: undefined,
        last_message_at: undefined,
        last_message_sender: undefined
      } : null)
    } catch (err: any) {
      setError(err.message || 'Failed to clear messages')
    }
  }, [chat])

  const clearError = useCallback(() => setError(null), [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    chat,
    messages,
    isLoading,
    isSending,
    sendMessage,
    deleteChat,
    updateTitle,
    updatePersonality,
    clearMessages,
    retryFailedMessage,
    shouldShowScrollButton,
    setShouldShowScrollButton,
    error,
    clearError,
    memoryInfo
  }
}