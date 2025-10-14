// services/apiClient.ts
import { supabase } from './supabase'

const API_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1'

interface ApiError {
  error: string
  code?: number
  details?: any
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || null
}

export async function apiPost<T = any>(
  path: string, 
  body: any,
  options: { timeout?: number } = {}
): Promise<T> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  const controller = new AbortController()
  const timeoutId = options.timeout 
    ? setTimeout(() => controller.abort(), options.timeout)
    : null

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (timeoutId) clearTimeout(timeoutId)

    const text = await response.text()
    
    if (!response.ok) {
      let errorData: ApiError
      try {
        errorData = JSON.parse(text)
      } catch {
        errorData = { error: text || `HTTP ${response.status}` }
      }

      // Handle specific error codes
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.')
      } else if (response.status === 403) {
        throw new Error('Access denied.')
      }

      throw new Error(errorData.error || 'API request failed')
    }

    return JSON.parse(text) as T
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }
    throw error
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function apiGet<T = any>(
  path: string,
  options: { timeout?: number } = {}
): Promise<T> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  const controller = new AbortController()
  const timeoutId = options.timeout 
    ? setTimeout(() => controller.abort(), options.timeout)
    : null

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    })

    if (timeoutId) clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `HTTP ${response.status}`)
    }

    return await response.json() as T
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }
    throw error
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}