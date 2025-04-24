'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  getDriverTickets, 
  validateTicket, 
  filterTicketsByDate,
  getValidatedTickets,
  type Ticket 
} from '@/app/services/driver.service';

// Dynamically import the Scanner component with no SSR
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
);

interface ScanHistory {
  ticketId: number;
  passengerName: string;
  scanTime: string;
  success: boolean;
  message: string;
  seatNumber?: number;
  scheduleDate?: string;
  scheduleTime?: string;
}

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('today');
  const { toast } = useToast();

  // Fetch driver's tickets on component mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const data = await getDriverTickets();
        setTickets(data);
        setFilteredTickets(filterTicketsByDate(data, dateFilter as any));
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: 'შეცდომა',
          description: 'ბილეთების ჩატვირთვისას მოხდა შეცდომა.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [toast]);

  // Filter tickets when date filter changes
  useEffect(() => {
    setFilteredTickets(filterTicketsByDate(tickets, dateFilter as any));
  }, [dateFilter, tickets]);

  const handleTicketValidation = async (hash: string) => {
    try {
      setIsLoading(true);
      const data = await validateTicket(hash);

      // Add to scan history with ticket details
      const newScanHistory: ScanHistory = {
        ticketId: data.ticket?.id || 0,
        passengerName: `${data.ticket?.passenger_name || 'უცნობი'} ${
          data.ticket?.passenger_surname || ''
        }`,
        scanTime: new Date().toLocaleString(),
        success: true,
        message: data.message || 'ბილეთი წარმატებით ვალიდირებულია',
        seatNumber: data.ticket?.seat_number,
        scheduleDate: data.ticket?.schedule_date,
        scheduleTime: data.ticket?.schedule?.leave_time,
      };

      setScanHistory((prev) => [newScanHistory, ...prev]);

      toast({
        title: 'წარმატება',
        description: data.message || 'ბილეთი წარმატებით ვალიდირებულია',
      });

      // Refresh tickets list
      const ticketsData = await getDriverTickets();
      setTickets(ticketsData);
      setFilteredTickets(filterTicketsByDate(ticketsData, dateFilter as any));
      
    } catch (error) {
      console.error('Error validating ticket:', error);
      let errorMessage = 'ბილეთის ვალიდაციისას მოხდა შეცდომა';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Add to scan history
      const newScanHistory: ScanHistory = {
        ticketId: 0,
        passengerName: 'უცნობი',
        scanTime: new Date().toLocaleString(),
        success: false,
        message: errorMessage,
      };

      setScanHistory((prev) => [newScanHistory, ...prev]);

      toast({
        title: 'შეცდომა',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsScanning(false);
      setScanResult(hash);
    }
  };

  const handleQrScan = (detectedCodes: IDetectedBarcode[]) => {
    // Check if any codes were detected
    if (detectedCodes && detectedCodes.length > 0) {
      // Get the value from the first detected code
      const hash = detectedCodes[0].rawValue;
      setIsScanning(false);
      handleTicketValidation(hash);
    }
  };

  // Handle scanning mode - adding a manual input option as fallback
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualHash, setManualHash] = useState('');

  const handleScanError = (error: unknown) => {
    console.error('QR Scan Error:', error);
    let errorMessage = 'უცნობი შეცდომა';

    // Try to extract error message if possible
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }

    toast({
      title: 'კამერის შეცდომა',
      description:
        'კამერასთან წვდომა ვერ მოხერხდა. შეგიძლიათ ბილეთის კოდი ხელით შეიყვანოთ.',
      variant: 'destructive',
    });

    // Switch to manual input mode when camera fails
    setScanMode('manual');
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanMode('camera');
  };

  const switchToManualInput = () => {
    setIsScanning(false);
    setScanMode('manual');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualHash.trim()) {
      handleTicketValidation(manualHash.trim());
      setManualHash('');
    }
  };

  const refreshTickets = async () => {
    try {
      setIsLoading(true);
      const data = await getDriverTickets();
      setTickets(data);
      setFilteredTickets(filterTicketsByDate(data, dateFilter as any));
      toast({
        title: 'წარმატება',
        description: 'ბილეთები წარმატებით განახლდა',
      });
    } catch (error) {
      console.error('Error refreshing tickets:', error);
      toast({
        title: 'შეცდომა',
        description: 'ბილეთების განახლებისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get validated tickets for scan history
  const getValidatedTicketsList = () => {
    return tickets.filter((ticket) => ticket.validated_at !== null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-3xl font-bold">QR სკანერი</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>QR კოდის სკანირება</CardTitle>
          <CardDescription>
            სკანირეთ ბილეთის QR კოდი მგზავრის იდენტიფიკაციისთვის
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isScanning && !scanResult && scanMode === 'camera' && (
            <div className="flex flex-col gap-4">
              <Button
                onClick={startScanning}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <QrCode className="h-4 w-4" />
                სკანირების დაწყება
              </Button>
              <Button variant="outline" onClick={switchToManualInput}>
                ხელით ჩაწერა
              </Button>
            </div>
          )}

          {!isScanning && !scanResult && scanMode === 'manual' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                შეიყვანეთ ბილეთის ჰეშ კოდი მანუალურად:
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="ჰეშ კოდი"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !manualHash.trim()}
                >
                  გაგზავნა
                </Button>
              </form>
              <Button
                variant="outline"
                onClick={() => setScanMode('camera')}
                className="w-full"
              >
                ხელახლა სკანირება
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="relative">
              <div className="mx-auto h-[330px] w-full max-w-md overflow-hidden rounded-lg border">
                <div style={{ width: '100%', height: '100%' }}>
                  <Scanner onScan={handleQrScan} onError={handleScanError} />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <Button onClick={() => setIsScanning(false)} variant="outline">
                  გაუქმება
                </Button>
                <Button onClick={switchToManualInput} variant="secondary">
                  ხელით ჩაწერა
                </Button>
              </div>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-medium text-green-800">
                სკანირება წარმატებულია
              </h3>
              <p className="break-all text-green-700">{scanResult}</p>
              <Button
                onClick={() => {
                  setScanResult(null);
                  startScanning();
                }}
                variant="outline"
                className="mt-4"
                disabled={isLoading}
              >
                ხელახლა სკანირება
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-5">
            <div>
              <CardTitle>მგზავრების ბილეთები</CardTitle>
              <CardDescription>
                თქვენი მარშრუტის მგზავრების ბილეთები
              </CardDescription>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ფილტრი თარიღით" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">დღეს</SelectItem>
                  <SelectItem value="tomorrow">ხვალ</SelectItem>
                  <SelectItem value="week">მიმდინარე კვირა</SelectItem>
                  <SelectItem value="all">ყველა</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshTickets}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && filteredTickets.length === 0 ? (
              <div className="flex justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                ბილეთები არ მოიძებნა
              </p>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {ticket.passenger_name} {ticket.passenger_surname}
                        </p>
                        <p className="text-sm text-gray-500">
                          ადგილი: {ticket.seat_number} | თარიღი:{' '}
                          {ticket.schedule_date}
                        </p>
                      </div>
                      {ticket.validated_at ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          ვერიფიცირებული
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                          მომლოდინე
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ვალიდური ბილეთები</CardTitle>
            <CardDescription>
              თქვენი ბოლო QR კოდის სკანირებების ისტორია
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getValidatedTicketsList().length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                ვალიდური ბილეთები არ არის
              </p>
            ) : (
              <div className="space-y-4">
                {getValidatedTicketsList().map((ticket) => (
                  <div key={ticket.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">ბილეთი #{ticket.id}</p>
                        <p className="text-sm text-gray-500">
                          {ticket.passenger_name} {ticket.passenger_surname} |{' '}
                          {new Date(ticket.validated_at!).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          ადგილი: {ticket.seat_number} | თარიღი:{' '}
                          {ticket.schedule_date}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          ბილეთი ვერიფიცირებულია
                        </p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        წარმატებული
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}