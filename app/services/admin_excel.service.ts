import { fetchWithToken } from '@/app/lib/api';

/**
 * Downloads an Excel file from the API
 * @param endpoint The API endpoint for the Excel download
 * @param filename The name to use for the downloaded file
 */
export async function downloadExcel(endpoint: string, filename: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/excel/${endpoint}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download ${endpoint} Excel file`);
    }
    
    // Get the blob from the response
    const blob = await response.blob();
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading ${endpoint} Excel file:`, error);
    throw new Error(`მონაცემების გადმოწერა ვერ მოხერხდა`);
  }
}

/**
 * Downloads users data as Excel
 */
export async function downloadUsersExcel(): Promise<void> {
  return downloadExcel('users', 'users');
}

/**
 * Downloads tickets data as Excel
 */
export async function downloadTicketsExcel(): Promise<void> {
  return downloadExcel('tickets', 'tickets');
}

/**
 * Downloads schedules data as Excel
 */
export async function downloadSchedulesExcel(): Promise<void> {
  return downloadExcel('schedules', 'schedules');
}

/**
 * Downloads destinations data as Excel
 */
export async function downloadDestinationsExcel(): Promise<void> {
  return downloadExcel('destinations', 'destinations');
}

/**
 * Downloads transactions data as Excel
 */
export async function downloadTransactionsExcel(): Promise<void> {
  return downloadExcel('transactions', 'transactions');
}
