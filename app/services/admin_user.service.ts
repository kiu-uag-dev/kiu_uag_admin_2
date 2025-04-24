import { fetchWithToken } from '@/app/lib/api';

// User interface
export interface User {
  id: number;
  email: string;
  email_verified_at: string | null;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  phone_number?: string;
  status_id?: number;
}

export interface UserFormData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
  email_verified?: boolean;
}

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('მომხმარებლების მონაცემების ჩატვირთვა ვერ მოხერხდა');
  }
}

// Get users by role
export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users?role=${role}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw new Error('მომხმარებლების მონაცემების ჩატვირთვა ვერ მოხერხდა');
  }
}

// Get a single user by ID
export async function getUserById(id: number): Promise<User> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('მომხმარებლის მონაცემების ჩატვირთვა ვერ მოხერხდა');
  }
}

// Create a new user
export async function createUser(userData: UserFormData): Promise<User> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('მომხმარებლის შექმნა ვერ მოხერხდა');
  }
}

// Update a user
export async function updateUser(id: number, userData: Partial<UserFormData>): Promise<User> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('მომხმარებლის განახლება ვერ მოხერხდა');
  }
}

// Delete a user
export async function deleteUser(id: number): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('მომხმარებლის წაშლა ვერ მოხერხდა');
  }
}

// Toggle user active status
export async function toggleUserStatus(id: number, isActive: boolean): Promise<User> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetchWithToken(`${apiUrl}/users/${id}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    if (!response.ok) throw new Error('Failed to toggle user status');
    return await response.json();
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw new Error('მომხმარებლის სტატუსის შეცვლა ვერ მოხერხდა');
  }
}

// Available role types
export const ROLE_TYPES = [
  { value: 'admin', label: 'ადმინისტრატორი' },
  { value: 'salesagent', label: 'გაყიდვების აგენტი' },
  { value: 'driver', label: 'მძღოლი' },
  { value: 'customer', label: 'მომხმარებელი' },
];

// Status types
export const STATUS_TYPES = [
  { id: 1, name: 'Active', name_ka: 'აქტიური', color: '#19B393' },
  { id: 2, name: 'Inactive', name_ka: 'არააქტიური', color: '#FE0000' },
  { id: 3, name: 'Validated', name_ka: 'გატარებული', color: '#FFB800' },
  { id: 4, name: 'Cancelled', name_ka: 'გაუქმებული', color: '#BFBFBF' },
];

// Helper functions
export const getRoleLabel = (roleValue: string): string => {
  const role = ROLE_TYPES.find((role) => role.value === roleValue);
  return role ? role.label : roleValue;
};

export const getStatusLabel = (statusId: number | undefined): string => {
  if (statusId === undefined) return 'Unknown';
  const status = STATUS_TYPES.find((status) => status.id === statusId);
  return status ? status.name_ka : 'Unknown';
};

export const getStatusColor = (statusId: number | undefined): string => {
  if (statusId === undefined) return '#000000';
  const status = STATUS_TYPES.find((status) => status.id === statusId);
  return status ? status.color : '#000000';
};

export const isEmailVerified = (user: User): boolean => {
  return user.email_verified_at !== null;
};
