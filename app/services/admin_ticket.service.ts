import { fetchWithToken } from '@/app/lib/api';
import { Destination, Schedule, Ticket } from '@/app/types/ticket-types';

export interface TicketFormData {
  schedule_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_surname: string;
  passenger_email: string;
  passenger_phone: string;
  purchaser_id: string;
  driver_id: string | null;
  schedule_date: string;
  payment_method?: string;
}

// Get all tickets
export const getTickets = async (): Promise<Ticket[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/alltickets`);

  if (!response.ok) {
    throw new Error('ბილეთების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Get total revenue from all tickets
export const getTotalRevenue = async (): Promise<number> => {
  const tickets = await getTickets();
  
  // Calculate total revenue from tickets
  const revenue = tickets.reduce((total, ticket) => {
    if (ticket.schedule?.destination?.price) {
      return total + ticket.schedule.destination.price;
    }
    return total;
  }, 0);
  
  return revenue;
};

// Get a single ticket by ID
export const getTicketById = async (ticketId: number): Promise<Ticket> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/alltickets/${ticketId}`);

  if (!response.ok) {
    throw new Error('ბილეთის ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Get all destinations for filtering
export const getDestinations = async (): Promise<Destination[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/destinations`);

  if (!response.ok) {
    throw new Error('მარშრუტების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Get all schedules for dropdown
export const getSchedules = async (): Promise<Schedule[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/schedules`);

  if (!response.ok) {
    throw new Error('განრიგების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Get available seats for a specific schedule and date
export const getAvailableSeats = async (
  scheduleId: string,
  scheduleDate: string
): Promise<{ available_seats: string }> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(
    `${apiUrl}/schedules/available-seats?schedule_id=${scheduleId}&schedule_date=${scheduleDate}`
  );

  if (!response.ok) {
    throw new Error('ხელმისაწვდომი ადგილების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Get all drivers
export const getDrivers = async (): Promise<any[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/users?role=driver`);

  if (!response.ok) {
    throw new Error('მძღოლების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Create a new ticket
export const createTicket = async (ticketData: TicketFormData): Promise<Ticket> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Ensure driver_id is null if empty string
  const formattedData = {
    ...ticketData,
    driver_id: ticketData.driver_id || null,
    payment_method: ticketData.payment_method || 'cash', // Default payment method
  };
  
  const response = await fetchWithToken(`${apiUrl}/tickets`, {
    method: 'POST',
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    throw new Error('ბილეთის შექმნა ვერ მოხერხდა');
  }

  return response.json();
};

// Update a ticket
export const updateTicket = async (ticketId: number, ticketData: Partial<TicketFormData>): Promise<Ticket> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Ensure driver_id is null if empty string
  const formattedData = {
    ...ticketData,
    driver_id: ticketData.driver_id || null,
  };
  
  const response = await fetchWithToken(
    `${apiUrl}/tickets/${ticketId}`,
    {
      method: 'PUT',
      body: JSON.stringify(formattedData),
    }
  );

  if (!response.ok) {
    throw new Error('ბილეთის განახლება ვერ მოხერხდა');
  }

  return response.json();
};

// Delete a ticket
export const deleteTicket = async (ticketId: number): Promise<void> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(
      `${apiUrl}/tickets/${ticketId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('ბილეთის წაშლა ვერ მოხერხდა');
    }
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw new Error('ბილეთის წაშლა ვერ მოხერხდა');
  }
};

// Download a ticket
export const downloadTicket = (ticketHash: string): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${apiUrl}/tickets/download/${ticketHash}`;
};
