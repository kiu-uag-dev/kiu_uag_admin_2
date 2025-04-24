import { fetchWithToken } from '@/app/lib/api';

export interface Status {
  id: number;
  name: string;
  name_ka: string;
  color: string;
}

export interface StatusFormData {
  name: string;
  name_ka: string;
  color: string;
}

// Get all statuses
export const getStatuses = async (): Promise<Status[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(`${apiUrl}/statuses`);

  if (!response.ok) {
    throw new Error('სტატუსების ჩატვირთვა ვერ მოხერხდა');
  }

  return response.json();
};

// Create a new status
export const createStatus = async (statusData: StatusFormData): Promise<Status> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const response = await fetchWithToken(`${apiUrl}/statuses`, {
    method: 'POST',
    body: JSON.stringify(statusData),
  });

  if (!response.ok) {
    throw new Error('სტატუსის შექმნა ვერ მოხერხდა');
  }

  return response.json();
};

// Update a status
export const updateStatus = async (statusId: number, statusData: StatusFormData): Promise<Status> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const response = await fetchWithToken(
    `${apiUrl}/statuses/${statusId}`,
    {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }
  );

  if (!response.ok) {
    throw new Error('სტატუსის განახლება ვერ მოხერხდა');
  }

  return response.json();
};

// Delete a status
export const deleteStatus = async (statusId: number): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetchWithToken(
    `${apiUrl}/statuses/${statusId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('სტატუსის წაშლა ვერ მოხერხდა');
  }
};
