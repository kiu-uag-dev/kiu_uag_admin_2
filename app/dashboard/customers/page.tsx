'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Customer, 
  getCustomers, 
  getStatusLabel, 
  getStatusColor, 
  isEmailVerified 
} from '@/app/services/salesagent_customer.service';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter customers by name or email
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const email = customer.email.toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Error loading customers');
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return <Card className="p-6">მომხმარებლების ჩატვირთვა...</Card>;
  }

  if (error) {
    return <Card className="p-6 text-red-500">{error}</Card>;
  }

  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div className="relative w-1/3">
          <div className="relative">
            <Input
              type="text"
              placeholder="მოძებნე სახელით ან მეილით..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">ID</TableHead>
            <TableHead>სახელი გვარი</TableHead>
            <TableHead>იმეილი</TableHead>
            <TableHead>ტელეფონი</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead>იმეილის ვერიფიკაცია</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{`${customer.first_name} ${customer.last_name}`}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone_number}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getStatusColor(customer.status_id) }}
                    />
                    <span>{getStatusLabel(customer.status_id)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {isEmailVerified(customer) ? (
                      <>
                        <div className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <span>დიახ</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full mr-2 bg-red-500" />
                        <span>არა</span>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                {customers.length === 0
                  ? 'არ არის მომხმარებლები'
                  : 'არ არის შესაბამისი მომხმარებელი'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
} 