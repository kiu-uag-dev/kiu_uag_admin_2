'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from 'recharts';
import { getTickets } from '@/app/services/admin_ticket.service';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Interface for monthly data
interface MonthlyData {
  month: string;
  desktop: number; // We'll use this for ticket count
  revenue?: number; // Optional additional data
}

// Georgian month names
const georgianMonths = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
];

const chartConfig = {
  desktop: {
    label: 'გაყიდული ბილეთები ',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function BarCharts() {
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [previousMonthTickets, setPreviousMonthTickets] = useState<number>(0);
  const [currentMonthTickets, setCurrentMonthTickets] = useState<number>(0);
  const [trend, setTrend] = useState<{ percentage: number; isUp: boolean }>({
    percentage: 0,
    isUp: true,
  });

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);

        // Fetch all tickets using the service
        const tickets = await getTickets();

        // Initialize monthly data with all months
        const monthlyData: MonthlyData[] = georgianMonths.map((month) => ({
          month,
          desktop: 0,
          revenue: 0,
        }));

        // Group tickets by month
        let total = 0;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        tickets.forEach((ticket) => {
          if (ticket.schedule_date) {
            const ticketDate = new Date(ticket.schedule_date);
            const ticketMonth = ticketDate.getMonth();
            const price = ticket.schedule?.destination?.price || 0;

            // Increment count for the relevant month
            monthlyData[ticketMonth].desktop += 1;
            monthlyData[ticketMonth].revenue =
              (monthlyData[ticketMonth].revenue || 0) + price;

            total += 1;

            // Track current and previous month counts for trend calculation
            if (ticketDate.getFullYear() === currentDate.getFullYear()) {
              if (ticketMonth === currentMonth) {
                currentMonthCount += 1;
              } else if (ticketMonth === previousMonth) {
                previousMonthCount += 1;
              }
            }
          }
        });

        // Calculate trend percentage
        let trendPercentage = 0;
        let isUp = true;

        if (previousMonthCount > 0) {
          const change = currentMonthCount - previousMonthCount;
          trendPercentage = Math.abs((change / previousMonthCount) * 100);
          isUp = change >= 0;
        }

        setChartData(monthlyData);
        setTotalTickets(total);
        setCurrentMonthTickets(currentMonthCount);
        setPreviousMonthTickets(previousMonthCount);
        setTrend({ percentage: parseFloat(trendPercentage.toFixed(1)), isUp });
      } catch (err) {
        console.error('Error fetching ticket data for chart:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, []);

  // Get current year
  const currentYear = new Date().getFullYear();

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="font">სტატისტიკა</CardTitle>
        <CardDescription>{currentYear}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-80 items-center justify-center text-center">
            <p>მონაცემების ჩატვირთვა...</p>
          </div>
        ) : error ? (
          <div className="flex h-80 items-center justify-center text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {!loading && !error && (
          <>
            <div className="flex gap-2 font-medium leading-none">
              {trend.isUp ? 'ზრდა' : 'კლება'} {trend.percentage}% წინა თვესთან
              შედარებით
              {trend.isUp ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              სულ გაყიდულია {totalTickets} ბილეთი
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
