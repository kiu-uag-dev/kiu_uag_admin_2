import { fetchWithToken } from '@/app/lib/api';

export interface Destination {
  id: number;
  leaves_from: string;
  arrives_to: string;
  bus_stops: string[];
  price: number;
}

export interface Schedule {
  id: number;
  destination_id: number;
  leave_time: string;
  arrive_time: string;
  created_at: string;
  updated_at: string;
  destination: Destination;
}

export interface ScheduleFormData {
  destination_id?: number;
  leave_time?: string;
  arrive_time?: string;
}

// Get all schedules
export const getSchedules = async (): Promise<Schedule[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/schedules`);

  if (!response.ok) {
    throw new Error('განრიგების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Get all destinations for dropdown
export const getDestinations = async (): Promise<Destination[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/destinations`);

  if (!response.ok) {
    throw new Error('მარშრუტების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Create a new schedule
export const createSchedule = async (scheduleData: ScheduleFormData): Promise<Schedule> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const response = await fetchWithToken(`${apiUrl}/schedules`, {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });

  if (!response.ok) {
    throw new Error('განრიგის შექმნა ვერ მოხერხდა');
  }

  return response.json();
};

// Update a schedule
export const updateSchedule = async (scheduleId: number, scheduleData: ScheduleFormData): Promise<Schedule> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const response = await fetchWithToken(
    `${apiUrl}/schedules/${scheduleId}`,
    {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    }
  );

  if (!response.ok) {
    throw new Error('განრიგის განახლება ვერ მოხერხდა');
  }

  return response.json();
};

// Delete a schedule
export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(
    `${apiUrl}/schedules/${scheduleId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('განრიგის წაშლა ვერ მოხერხდა');
  }
};

// Format time to display in 24-hour format
export const formatTime = (timeString: string): string => {
  try {
    // Simply return the time string as is, since it's already in 24-hour format
    return timeString;
  } catch (error) {
    return timeString;
  }
};
