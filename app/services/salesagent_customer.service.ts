import { fetchWithToken } from '@/app/lib/api';

// Customer interface
export interface Customer {
  id: number;
  email: string;
  email_verified_at: string | null;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  status_id: number;
}

// Status types
export const STATUS_TYPES = [
  { id: 1, name: 'Active', name_ka: 'აქტიური', color: '#19B393' },
  { id: 2, name: 'Inactive', name_ka: 'არააქტიური', color: '#FE0000' },
  { id: 3, name: 'Validated', name_ka: 'გატარებული', color: '#FFB800' },
  { id: 4, name: 'Cancelled', name_ka: 'გაუქმებული', color: '#BFBFBF' },
];

// Get status label in Georgian
export const getStatusLabel = (statusId: number): string => {
  const status = STATUS_TYPES.find((status) => status.id === statusId);
  return status ? status.name_ka : 'Unknown';
};

// Get status color
export const getStatusColor = (statusId: number): string => {
  const status = STATUS_TYPES.find((status) => status.id === statusId);
  return status ? status.color : '#000000';
};

// Check if email is verified
export const isEmailVerified = (customer: Customer): boolean => {
  return customer.email_verified_at !== null;
};

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/customers`);

    if (!response.ok) {
      throw new Error('მომხმარებლების მონაცემების მიღება ვერ მოხერხდა');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('მომხმარებლების მონაცემების მიღება ვერ მოხერხდა');
  }
};

// Get customer by ID
export const getCustomerById = async (customerId: number): Promise<Customer> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/customers/${customerId}`);

    if (!response.ok) {
      throw new Error('მომხმარებლის მონაცემების მიღება ვერ მოხერხდა');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new Error('მომხმარებლის მონაცემების მიღება ვერ მოხერხდა');
  }
};

// Get customer tickets
export const getCustomerTickets = async (customerId: number): Promise<any[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/customers/${customerId}/tickets`);

    if (!response.ok) {
      throw new Error('მომხმარებლის ბილეთების მონაცემების მიღება ვერ მოხერხდა');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching customer tickets:', error);
    throw new Error('მომხმარებლის ბილეთების მონაცემების მიღება ვერ მოხერხდა');
  }
};

// Update customer status
export const updateCustomerStatus = async (customerId: number, statusId: number): Promise<void> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(
      `${apiUrl}/customers/${customerId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status_id: statusId }),
      }
    );

    if (!response.ok) {
      throw new Error('მომხმარებლის სტატუსის განახლება ვერ მოხერხდა');
    }
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw new Error('მომხმარებლის სტატუსის განახლება ვერ მოხერხდა');
  }
};
