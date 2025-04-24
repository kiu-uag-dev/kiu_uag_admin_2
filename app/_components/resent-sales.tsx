'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { getUsers, User } from '@/app/services/admin_user.service';

export function ResentSales() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch all users using the service
        const users = await getUsers();
        
        // Set total user count
        setUserCount(users.length);

        // Sort by most recent (assuming there's an id field and higher id = more recent)
        // If there's a created_at field, we can use that instead
        const sortedUsers = [...users].sort((a, b) => {
          if (a.created_at && b.created_at) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
          // Fallback to ID
          return b.id - a.id;
        });

        // Take the most recent 6 users
        const recent = sortedUsers.slice(0, 6);
        setRecentUsers(recent);
      } catch (err) {
        console.error('Error fetching recent users:', err);
        setError('Failed to load recent users');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  // Helper to get initials from name
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper to get a role-based color for avatars
  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'driver':
        return 'bg-blue-100 text-blue-800';
      case 'salesagent':
        return 'bg-green-100 text-green-800';
      case 'customer':
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  // Helper to get role in Georgian
  const getRoleInGeorgian = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'ადმინი';
      case 'driver':
        return 'მძღოლი';
      case 'salesagent':
        return 'გაყიდვების მენეჯერი';
      case 'customer':
        return 'მომხმარებელი';
      default:
        return role;
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-0">
        <CardTitle>მომხმარებლები</CardTitle>
        <CardDescription>
          სისტემაში რეგისტრირებულია {loading ? '...' : userCount} მომხმარებელი
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-6 pb-0">
        {loading ? (
          <div className="flex h-60 flex-col items-center justify-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              მონაცემების ჩატვირთვა...
            </p>
          </div>
        ) : error ? (
          <div className="flex h-60 items-center justify-center text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-center text-muted-foreground">
            <p>მომხმარებლები არ არის</p>
          </div>
        ) : (
          <div className="pt-0">
            <div className="space-y-8">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={getRoleColor(user.role)}>
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-600 px-2 py-1 text-xs font-medium text-white">
                    {getRoleInGeorgian(user.role)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
