import { fetchWithToken } from '@/app/lib/api';
import { SellTicketsRequest } from './salesagent_ticket.service';

/**
 * Interface for a seat object
 */
export interface Seat {
  id: number;
  seat_number: number;
  is_available: boolean;
  is_selected?: boolean; // Used for UI state management
}

/**
 * Interface for passenger form data
 */
export interface PassengerFormData {
  passenger_name: string;
  passenger_surname: string;
  passenger_email: string;
  passenger_phone: string;
}

/**
 * Get available seats for a schedule on a specific date
 */
export const getAvailableSeats = async (
    scheduleId: number,
    scheduleDate: string
  ): Promise<string> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
    const response = await fetchWithToken(
      `${apiUrl}/schedules/available-seats?schedule_id=${scheduleId}&schedule_date=${scheduleDate}`
    );
  
    if (!response.ok) {
      throw new Error('Failed to fetch available seats');
    }
  
    const data = await response.json();
    return data.available_seats || '';
  };

/**
 * Sell multiple tickets as a sales agent
 */
export const sellTicketsAsSalesAgent = async (
  ticketData: SellTicketsRequest
): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  
  const response = await fetchWithToken(`${apiUrl}/tickets/sell`, {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Server error details:', errorData);
    throw new Error(errorData?.message || 'Failed to sell tickets');
  }
  
  return response.json();
};

/**
 * Get tickets sold by the current sales agent
 */
export const getSalesAgentTickets = async (): Promise<any[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/salesagent/tickets`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch sales agent tickets');
  }
  
  return response.json();
};

/**
 * Cancel a ticket sold by the sales agent
 */
export const cancelTicket = async (ticketId: number): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/tickets/${ticketId}/cancel`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel ticket');
  }
};

/**
 * Validate form data for passenger information
 */
export const validatePassengerData = (
  passenger: PassengerFormData
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate name
  if (!passenger.passenger_name || passenger.passenger_name.trim() === '') {
    errors.passenger_name = 'Name is required';
  }
  
  // Validate surname
  if (!passenger.passenger_surname || passenger.passenger_surname.trim() === '') {
    errors.passenger_surname = 'Surname is required';
  }
  
  // Validate email
  if (!passenger.passenger_email || passenger.passenger_email.trim() === '') {
    errors.passenger_email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(passenger.passenger_email)) {
    errors.passenger_email = 'Invalid email format';
  }
  
  // Validate phone (optional validation if phone is provided)
  if (passenger.passenger_phone && !/^[+]?[0-9]{8,15}$/.test(passenger.passenger_phone)) {
    errors.passenger_phone = 'Invalid phone number format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generate a sales report for the current agent
 */
export const generateSalesReport = async (
  startDate: string,
  endDate: string
): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(
    `${apiUrl}/salesagent/reports?start_date=${startDate}&end_date=${endDate}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to generate sales report');
  }
  
  return response.json();
};

/**
 * Get payment methods available in the system
 */
export const getPaymentMethods = async (): Promise<string[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/payment-methods`);
  
  if (!response.ok) {
    // If the endpoint doesn't exist, return default payment methods
    return ['cash', 'card', 'bank_transfer'];
  }
  
  return response.json();
};

