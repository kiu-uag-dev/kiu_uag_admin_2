import { getSession } from "next-auth/react";

/**
 * Fetches data from an API endpoint with authentication token
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns Response object
 */
export async function fetchWithToken(url: string, options: RequestInit = {}) {
  const session = await getSession();
  
  if (!session?.token) {
    throw new Error("Authentication required");
  }
  
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Fetches JSON data from an API endpoint with authentication token
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns Parsed JSON response
 */
export async function fetchWithTokenJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithToken(url, options);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
} 