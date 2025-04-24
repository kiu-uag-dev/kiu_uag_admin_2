// lib/api.ts
import { getSession, signOut } from 'next-auth/react';

export async function fetchWithToken(url: string, options: RequestInit = {}) {
  const session = await getSession();

  // If no session or no token, redirect to login
  if (!session?.token) {
    // Only redirect if running in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw new Error('No authentication token found');
  }

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check for 401 Unauthorized or 403 Forbidden
    if (response.status === 401 || response.status === 403) {
      console.log(`Token invalid (${response.status} response)`);

      // Force logout and redirect to login
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/' });
      }

      throw new Error('Session expired. Please sign in again.');
    }

    return response;
  } catch (error) {
    // For network errors or other fetch failures, check if they're auth-related
    if (error instanceof Error) {
      // If it's our authentication error, just rethrow it
      if (
        error.message.includes('No authentication token found') ||
        error.message.includes('Session expired')
      ) {
        throw error;
      }

      // For other errors (network etc.), log and rethrow
      console.error('API request failed:', error);
    }

    throw error;
  }
}

// Helper for when you want the JSON response directly
export async function fetchWithTokenJSON<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithToken(url, options);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
