// hooks/useAICoach.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { aiService, ChatMessage, AIInsight, HabitSuggestion, AIContext } from '@/services/aiService';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/usehabits';
import { Alert } from 'react-native';

interface UseAICoachReturn {
  // Chat functionality
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  
  // Insights
  insights: AIInsight[];
  loadingInsights: boolean;
  refreshInsights: () => Promise<void>;
  
  // Suggestions
  suggestions: HabitSuggestion[];
  loadingSuggestions: boolean;
  generateSuggestions: () => Promise<void>;
  
  // General
  error: string | null;
  clearError: () => void;
  
  // Quick actions
  sendQuickMessage: (message: string) => Promise<void>;
  
  // Context building
  buildContext: () => AIContext;
}

export const useAICoach = (): UseAICoachReturn => {
  const { user } = useAuth();
  const { habits, stats } = useHabits();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for preventing duplicate requests
  const isLoadingInsights = useRef(false);
  const isLoadingSuggestions = useRef(false);
  const conversationId = useRef(user?.id || 'default');

  // Initialize conversation
  useEffect(() => {
    if (user && messages.length === 0) {
      initializeConversation();
    }
  }, [user]);

  // Build AI context from current app state
  const buildContext = useCallback((): AIContext => {
    return {
      habits,
      stats,
      userProfile: {
        name: user?.name || 'User',
        preferences: [], // Could be extended with user preferences
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      conversationHistory: messages.slice(-6), // Last 6 messages for context
    };
  }, [habits, stats, user, messages]);

  // Initialize conversation with welcome message
  const initializeConversation = useCallback(() => {
    if (!user) return;

    const welcomeMessages: ChatMessage[] = [
      {
        id: 'welcome-1',
        text: `Hi ${user.name}! I'm your AI habit coach. I'm here to help you build better habits and reach your goals.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    // Add contextual welcome message based on user's current state
    if (stats.totalHabits === 0) {
      welcomeMessages.push({
        id: 'welcome-2',
        text: "I see you're just getting started! Would you like help creating your first habit?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (stats.completionRate > 80) {
      welcomeMessages.push({
        id: 'welcome-2',
        text: `Impressive! Your ${stats.completionRate}% completion rate shows real dedication. How are you feeling about your habits today?`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      welcomeMessages.push({
        id: 'welcome-2',
        text: "How are your habits going today? I'm here to help you stay motivated and overcome any challenges.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setMessages(welcomeMessages);
  }, [user, stats]);

  // Send chat message
  const sendMessage = useCallback(async (message: string) => {
    if (!user || !message.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const context = buildContext();
      const { response, newMessage } = await aiService.sendChatMessage(
        message, 
        context, 
        conversationId.current
      );

      if (response.success) {
        setMessages(prev => [...prev, newMessage]);
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }, [user, isTyping, buildContext]);

  // Send quick action message
  const sendQuickMessage = useCallback(async (quickMessage: string) => {
    await sendMessage(quickMessage);
  }, [sendMessage]);

  // Load AI insights for home screen
  const refreshInsights = useCallback(async () => {
    if (!user || isLoadingInsights.current) return;

    isLoadingInsights.current = true;
    setLoadingInsights(true);
    setError(null);

    try {
      const context = buildContext();
      const insightsData = await aiService.getHomeInsights(context);
      setInsights(insightsData);
    } catch (error) {
      console.error('Insights error:', error);
      setError('Failed to load insights. Please try again.');
      // Set fallback insights
      setInsights([
        {
          id: 'fallback',
          type: 'motivation',
          title: 'Keep Building',
          description: 'Every habit is a vote for the person you want to become.',
          icon: '💪',
          priority: 'medium'
        }
      ]);
    } finally {
      setLoadingInsights(false);
      isLoadingInsights.current = false;
    }
  }, [user, buildContext]);

  // Generate habit suggestions
  const generateSuggestions = useCallback(async () => {
    if (!user || isLoadingSuggestions.current) return;

    isLoadingSuggestions.current = true;
    setLoadingSuggestions(true);
    setError(null);

    try {
      const context = buildContext();
      const suggestionsData = await aiService.getHabitSuggestions(context);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Suggestions error:', error);
      setError('Failed to generate suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
      isLoadingSuggestions.current = false;
    }
  }, [user, buildContext]);

  // Clear chat conversation
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    if (user) {
      initializeConversation();
    }
  }, [user, initializeConversation]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load insights when component mounts or user changes
  useEffect(() => {
    if (user && habits.length > 0) {
      refreshInsights();
    }
  }, [user, habits.length]);

  return {
    // Chat
    messages,
    isTyping,
    sendMessage,
    clearChat,
    
    // Insights
    insights,
    loadingInsights,
    refreshInsights,
    
    // Suggestions
    suggestions,
    loadingSuggestions,
    generateSuggestions,
    
    // General
    error,
    clearError,
    
    // Quick actions
    sendQuickMessage,
    buildContext,
  };
};