// supabase/functions/generate-feed-event/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedEventPayload {
  type: 'completion' | 'milestone' | 'streak' | 'challenge_joined' | 'challenge_completed' | 'habit_created' | 'habit_revived';
  habit_id?: string;
  challenge_id?: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const payload: FeedEventPayload = await req.json();

    // Validate payload
    if (!payload.type) {
      throw new Error('Event type is required');
    }

    // Check if event should be posted (avoid spam)
    const shouldPost = await shouldCreateFeedItem(supabase, user.id, payload);

    if (!shouldPost) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          posted: false,
          message: 'Event filtered (anti-spam)' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create feed item
    const feedItem = await createFeedItem(supabase, user.id, payload);

    // Broadcast via realtime
    await supabase
      .channel('feed_updates')
      .send({
        type: 'broadcast',
        event: 'new_feed_item',
        payload: feedItem
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        posted: true,
        feed_item: feedItem 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating feed event:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate feed event' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function shouldCreateFeedItem(
  supabase: any, 
  userId: string, 
  payload: FeedEventPayload
): Promise<boolean> {
  // Anti-spam rules
  const rules: Record<string, { minutes: number; limit: number }> = {
    'completion': { minutes: 60, limit: 10 },
    'milestone': { minutes: 1440, limit: 5 }, // 24 hours
    'streak': { minutes: 1440, limit: 3 },
    'challenge_joined': { minutes: 60, limit: 5 },
    'challenge_completed': { minutes: 1440, limit: 5 },
    'habit_created': { minutes: 60, limit: 3 },
    'habit_revived': { minutes: 1440, limit: 2 }
  };

  const rule = rules[payload.type];
  if (!rule) return true;

  // Check recent posts of same type
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - rule.minutes);

  const { data, error } = await supabase
    .from('feed_items')
    .select('id')
    .eq('user_id', userId)
    .eq('type', payload.type)
    .gte('created_at', cutoffTime.toISOString());

  if (error) {
    console.warn('Error checking spam rules:', error);
    return true; // Allow on error
  }

  return (data?.length || 0) < rule.limit;
}

async function createFeedItem(
  supabase: any, 
  userId: string, 
  payload: FeedEventPayload
): Promise<any> {
  // Enrich metadata based on event type
  const enrichedMetadata = await enrichMetadata(supabase, userId, payload);

  const feedItem = {
    user_id: userId,
    type: payload.type,
    habit_id: payload.habit_id || null,
    challenge_id: payload.challenge_id || null,
    metadata: {
      ...payload.metadata,
      ...enrichedMetadata
    }
  };

  const { data, error } = await supabase
    .from('feed_items')
    .insert(feedItem)
    .select()
    .single();

  if (error) {
    console.error('Error creating feed item:', error);
    throw error;
  }

  return data;
}

async function enrichMetadata(
  supabase: any, 
  userId: string, 
  payload: FeedEventPayload
): Promise<any> {
  const metadata: any = {};

  // Fetch habit details if habit_id provided
  if (payload.habit_id) {
    const { data: habit } = await supabase
      .from('habits')
      .select('title, icon, category')
      .eq('id', payload.habit_id)
      .single();

    if (habit) {
      metadata.habit_title = habit.title;
      metadata.habit_icon = habit.icon;
      metadata.habit_category = habit.category;
    }

    // For milestone/streak events, calculate the achievement
    if (payload.type === 'milestone' || payload.type === 'streak') {
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('completion_date')
        .eq('habit_id', payload.habit_id)
        .eq('user_id', userId)
        .order('completion_date', { ascending: false });

      if (completions) {
        metadata.total_completions = completions.length;
        metadata.streak_days = calculateCurrentStreak(completions);
      }
    }
  }

  // Fetch challenge details if challenge_id provided
  if (payload.challenge_id) {
    const { data: challenge } = await supabase
      .from('challenges')
      .select('title, icon, difficulty, duration_days')
      .eq('id', payload.challenge_id)
      .single();

    if (challenge) {
      metadata.challenge_title = challenge.title;
      metadata.challenge_icon = challenge.icon;
      metadata.challenge_difficulty = challenge.difficulty;
      metadata.challenge_duration = challenge.duration_days;
    }
  }

  return metadata;
}

function calculateCurrentStreak(completions: any[]): number {
  if (!completions.length) return 0;

  const sortedDates = completions
    .map(c => new Date(c.completion_date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    date.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}