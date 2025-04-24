import { fetchWithToken } from '@/app/lib/api';
import { Destination, Schedule, Ticket } from '@/app/types/ticket-types';
import { format } from 'date-fns';

// Interface for passenger data
export interface Passenger {
  passenger_name: string;
  passenger_surname: string;
  passenger_email: string;
  passenger_phone: string;
}

// Interface for ticket selling request
export interface SellTicketsRequest {
  ticket_count: number;
  schedule_id: number;
  schedule_date: string;
  seat_numbers: number[];
  passengers: Passenger[];
  payment_method: string;
}

// Interface for new ticket creation
export interface CreateTicketData {
  schedule_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_surname: string;
  passenger_email: string;
  passenger_phone: string;
  purchaser_id: string;
  schedule_date: string;
  payment_method?: string;
}

// Interface for ticket update data
export interface UpdateTicketData {
  schedule_id?: string | number;
  seat_number?: string | number;
  passenger_name?: string;
  passenger_surname?: string;
  passenger_email?: string;
  passenger_phone?: string;
  driver_id?: string | number | null;
  schedule_date?: string;
}

/**
 * Get all tickets
 */
export const getAllTickets = async (): Promise<Ticket[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/alltickets`);

  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }

  const data = await response.json();
  
  // Ensure tickets is always an array
  if (Array.isArray(data)) {
    return data;
  } else {
    console.error('Received non-array tickets data:', data);
    throw new Error('Received invalid ticket data format');
  }
};

/**
 * Get all destinations
 */
export const getDestinations = async (): Promise<Destination[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/destinations`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch destinations');
  }
  
  return response.json();
};

/**
 * Get all schedules
 */
export const getSchedules = async (): Promise<Schedule[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/schedules`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch schedules');
  }
  
  return response.json();
};

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (ticketId: number): Promise<Ticket> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/alltickets/${ticketId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch ticket details');
  }
  
  return response.json();
};

/**
 * Create a new ticket
 */
export const createTicket = async (ticketData: CreateTicketData): Promise<Ticket> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  
  // Set default payment method if not provided
  const finalTicketData = {
    ...ticketData,
    payment_method: ticketData.payment_method || 'cash',
  };
  
  const response = await fetchWithToken(`${apiUrl}/tickets`, {
    method: 'POST',
    body: JSON.stringify(finalTicketData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create ticket');
  }
  
  return response.json();
};

/**
 * Update a ticket
 */
export const updateTicket = async (ticketId: number, updateData: UpdateTicketData): Promise<Ticket> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  
  const response = await fetchWithToken(`${apiUrl}/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update ticket');
  }
  
  return response.json();
};

/**
 * Delete a ticket
 */
export const deleteTicket = async (ticketId: number): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const response = await fetchWithToken(`${apiUrl}/tickets/${ticketId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete ticket');
  }
};

/**
 * Download a ticket
 */
export const downloadTicket = (ticketHash: string): void => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  const downloadUrl = `${apiUrl}/tickets/download/${ticketHash}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `ticket-${ticketHash}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Sell multiple tickets (for sales agents)
 */
export const sellTickets = async (sellRequest: SellTicketsRequest): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:8000/api';
  
  const response = await fetchWithToken(`${apiUrl}/tickets/sell`, {
    method: 'POST',
    body: JSON.stringify(sellRequest),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Server error details:', errorData);
    throw new Error(errorData?.message || 'Failed to sell tickets');
  }
  
  return response.json();
};

/**
 * Filter tickets by various criteria
 */
export const filterTickets = (
  tickets: Ticket[], 
  searchQuery: string, 
  selectedDate?: Date,
  selectedDirection: string = 'all'
): Ticket[] => {
  if (!Array.isArray(tickets)) return [];
  
  return tickets.filter((ticket) => {
    // Skip tickets with missing properties
    if (!ticket || !ticket.schedule || !ticket.schedule.destination) {
      return false;
    }

    // Filter by search query
    const passengerFullName = `${ticket.passenger_name || ''} ${
      ticket.passenger_surname || ''
    }`.toLowerCase();
    const passengerEmail = (ticket.passenger_email || '').toLowerCase();
    const ticketId = ticket.id?.toString() || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      passengerFullName.includes(query) ||
      passengerEmail.includes(query) ||
      ticketId.includes(query);

    // Filter by date
    const matchesDate =
      !selectedDate ||
      ticket.schedule_date === format(selectedDate, 'yyyy-MM-dd');

    // Filter by route direction
    const ticketRoute = `${ticket.schedule.destination.leaves_from}-${ticket.schedule.destination.arrives_to}`;
    const matchesDirection =
      selectedDirection === 'all' || ticketRoute === selectedDirection;

    return matchesSearch && matchesDate && matchesDirection;
  });
};

/**
 * Extract unique routes from tickets
 */
export const extractUniqueRoutes = (tickets: Ticket[]) => {
  if (!Array.isArray(tickets)) return [];
  
  return Array.from(
    new Set(
      tickets.map(
        (ticket) =>
          ticket?.schedule?.destination ? 
          `${ticket.schedule.destination.leaves_from}-${ticket.schedule.destination.arrives_to}` : 
          ''
      ).filter(route => route !== '')
    )
  ).map((routeString) => {
    const [from, to] = routeString.split('-');
    return { from, to, value: routeString };
  });
};