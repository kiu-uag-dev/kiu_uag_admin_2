'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getTotalRevenue, getDestinations } from '@/app/services/admin_ticket.service';
import { getUsersByRole } from '@/app/services/admin_user.service';

function InfoCards() {
  // State for the data
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [destinationCount, setDestinationCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get total revenue from tickets
        const revenue = await getTotalRevenue();
        setTotalRevenue(revenue);

        // Get customers
        const customers = await getUsersByRole('customer');
        setCustomerCount(customers.length);

        // Get destinations
        const destinations = await getDestinations();
        setDestinationCount(destinations.length);

        // Get staff (salesagent, admin, driver)
        const staffRoles = ['salesagent', 'admin', 'driver'];
        let totalStaff = 0;

        for (const role of staffRoles) {
          const staff = await getUsersByRole(role);
          totalStaff += staff.length;
        }
        setStaffCount(totalStaff);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Card data
  const cardData = [
    {
      title: 'შემოსავლები',
      value: loading ? 'იტვირთება...' : `₾${totalRevenue.toFixed(2)}`,
      change: 'მიმდინარე თვის შემოსავალი',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      title: 'მომხმარებლები',
      value: loading ? 'იტვირთება...' : customerCount.toString(),
      change: 'რეგისტრირებული მომხმარებლები',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      title: 'მიმართულებები',
      value: loading ? 'იტვირთება...' : destinationCount.toString(),
      change: 'ხელმისაწვდომი მიმართულებები',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <path d="M2 10h20"></path>
        </svg>
      ),
    },
    {
      title: 'თანამშრომლები',
      value: loading ? 'იტვირთება...' : staffCount.toString(),
      change: 'მძღოლები, ადმინები და მენეჯერები',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4 pt-0">
        <div className="rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index} className={loading ? 'opacity-70' : ''}>
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <CardTitle className="font">{card.title}</CardTitle>
            {card.icon}
          </div>
          <CardContent>
            <div className="text-2xl font-bold text-primaryGreen">
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default InfoCards;
