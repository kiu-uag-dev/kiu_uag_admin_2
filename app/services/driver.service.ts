import { fetchWithToken } from '@/app/lib/api';

export interface Ticket {
  id: number;
  seat_number: number;
  schedule_id: number;
  passenger_name: string;
  passenger_surname: string;
  passenger_email: string;
  passenger_phone: string;
  purchaser_id: number;
  schedule_date: string;
  ticket_hash: string | null;
  validated_at: string | null;
  driver_id: number;
  payment_method: string;
  status_id: number;
  schedule?: {
    leave_time: string;
  };
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  ticket?: Ticket;
}

/**
 * Fetch all tickets assigned to the driver
 */
export const getDriverTickets = async (): Promise<Ticket[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/driver/tickets`);

  if (!response.ok) {
    throw new Error('ბილეთების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

/**
 * Validate a ticket by its hash
 */
export const validateTicket = async (hash: string): Promise<ValidationResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(
    `${apiUrl}/tickets/validate?hash=${hash}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'ბილეთის ვალიდაცია ვერ მოხერხდა');
  }

  return data;
};

/**
 * Get all validated tickets for the driver
 */
export const getValidatedTickets = async (): Promise<Ticket[]> => {
  const tickets = await getDriverTickets();
  return tickets.filter((ticket) => ticket.validated_at !== null);
};

/**
 * Filter tickets by date range
 */
export const filterTicketsByDate = (
  tickets: Ticket[], 
  filter: 'today' | 'tomorrow' | 'week' | 'all'
): Ticket[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return tickets.filter((ticket) => {
    const ticketDate = new Date(ticket.schedule_date);
    ticketDate.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return ticketDate.getTime() === today.getTime();
      case 'tomorrow':
        return ticketDate.getTime() === tomorrow.getTime();
      case 'week':
        return ticketDate >= today && ticketDate <= nextWeek;
      case 'all':
        return true;
      default:
        return ticketDate.getTime() === today.getTime();
    }
  });
};