import { fetchWithToken } from '@/app/lib/api';

export interface Destination {
  id: number;
  leaves_from: string;
  leaves_from_ka: string;
  arrives_to: string;
  arrives_to_ka: string;
  bus_stops: string[];
  bus_stops_ka: string[];
  price: number;
}

export interface DestinationFormData extends Partial<Destination> {
  bus_stops_text?: string; // For handling the array as a text input
  bus_stops_ka_text?: string; // For handling the Georgian array as a text input
}

// Get all destinations
export const getDestinations = async (): Promise<Destination[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/destinations`);

  if (!response.ok) {
    throw new Error('მარშრუტების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Create a new destination
export const createDestination = async (destinationData: DestinationFormData): Promise<Destination> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Process bus stops from string to array
  const formattedData = {
    ...destinationData,
    bus_stops: destinationData.bus_stops_text
      ? destinationData.bus_stops_text.split(',').map((stop) => stop.trim())
      : [],
    bus_stops_ka: destinationData.bus_stops_ka_text
      ? destinationData.bus_stops_ka_text.split(',').map((stop) => stop.trim())
      : [],
  };

  // Remove the text fields before sending
  delete formattedData.bus_stops_text;
  delete formattedData.bus_stops_ka_text;
  
  const response = await fetchWithToken(`${apiUrl}/destinations`, {
    method: 'POST',
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    throw new Error('მარშრუტის შექმნა ვერ მოხერხდა');
  }

  return response.json();
};

// Update a destination
export const updateDestination = async (destinationId: number, destinationData: DestinationFormData): Promise<Destination> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Process bus stops from string to array
  const formattedData = {
    ...destinationData,
    bus_stops: destinationData.bus_stops_text
      ? destinationData.bus_stops_text.split(',').map((stop) => stop.trim())
      : [],
    bus_stops_ka: destinationData.bus_stops_ka_text
      ? destinationData.bus_stops_ka_text.split(',').map((stop) => stop.trim())
      : [],
  };

  // Remove the text fields before sending
  delete formattedData.bus_stops_text;
  delete formattedData.bus_stops_ka_text;
  
  const response = await fetchWithToken(
    `${apiUrl}/destinations/${destinationId}`,
    {
      method: 'PUT',
      body: JSON.stringify(formattedData),
    }
  );

  if (!response.ok) {
    throw new Error('მარშრუტის განახლება ვერ მოხერხდა');
  }

  return response.json();
};

// Delete a destination
export const deleteDestination = async (destinationId: number): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(
    `${apiUrl}/destinations/${destinationId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('მარშრუტის წაშლა ვერ მოხერხდა');
  }
};
