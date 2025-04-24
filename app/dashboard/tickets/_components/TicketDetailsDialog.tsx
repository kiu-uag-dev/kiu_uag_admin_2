// src/components/TicketDetailsDialog.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Map,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';
import { TicketDetailsDialogProps } from '@/app/types/ticket-types';

// Helper functions for formatting
const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHour}:${minutes} ${period}`;
  } catch (error) {
    return timeString;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

export const TicketDetailsDialog: React.FC<TicketDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedTicket,
  handleDownloadTicket,
  isDownloading,
}) => {
  if (!selectedTicket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ბილეთის დეტალები</DialogTitle>
          <DialogDescription>
            სრული ინფორმაცია ბილეთის შესახებ
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Passenger Information */}
          <div className="grid gap-3">
            <h4 className="flex items-center text-lg font-semibold">
              <User className="mr-2 h-5 w-5" />
              მგზავრის ინფორმაცია
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">ბილეთის ID:</div>
              <div>{selectedTicket.id}</div>

              <div className="font-medium">სტატუსი:</div>
              <div>
                {selectedTicket.validated_at ? (
                  <Badge className="border-green-300 bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-4 w-4" /> ვალიდურია{' '}
                    {formatDate(selectedTicket.validated_at)}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-yellow-300 bg-yellow-50 text-yellow-800"
                  >
                    <XCircle className="mr-1 h-4 w-4" /> არავალიდური
                  </Badge>
                )}
              </div>

              <div className="font-medium">სახელი გვარი:</div>
              <div>
                {selectedTicket.passenger_name}{' '}
                {selectedTicket.passenger_surname}
              </div>

              <div className="font-medium">იმეილი:</div>
              <div>{selectedTicket.passenger_email}</div>

              <div className="font-medium">ტელეფონი:</div>
              <div>{selectedTicket.passenger_phone}</div>

              <div className="font-medium">გადახდის მეთოდი:</div>
              <div className="capitalize">{selectedTicket.payment_method}</div>
            </div>
          </div>

          {/* Journey Information */}
          <div className="grid gap-3">
            <h4 className="flex items-center text-lg font-semibold">
              <Map className="mr-2 h-5 w-5" />
              მგზავრობის დეტალები
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">მარშრუტი:</div>
              <div>
                {selectedTicket.schedule.destination.leaves_from} ➝{' '}
                {selectedTicket.schedule.destination.arrives_to}
              </div>

              <div className="font-medium">თარიღი:</div>
              <div>
                {formatDate(selectedTicket.schedule_date)} <br />
                {formatTime(selectedTicket.schedule.leave_time)} -{' '}
                {formatTime(selectedTicket.schedule.arrive_time)}
              </div>

              <div className="font-medium">ადგილის ნომერი:</div>
              <div>{selectedTicket.seat_number}</div>

              <div className="font-medium">თანხა:</div>
              <div>{selectedTicket.schedule.destination.price} ₾</div>
            </div>
          </div>

          {/* Bus Stops */}
          <div className="grid gap-3">
            <h4 className="flex items-center text-lg font-semibold">
              <Clock className="mr-2 h-5 w-5" />
              გაჩერებები
            </h4>
            <div className="text-sm">
              <ul className="space-y-1">
                {selectedTicket.schedule.destination.bus_stops.map(
                  (stop, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
                        {index + 1}
                      </span>
                      {stop}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleDownloadTicket(selectedTicket.ticket_hash)}
            disabled={isDownloading}
          >
            <Download className="mr-1 h-4 w-4" />
            ბილეთის გადმოწერა
          </Button>

          <Button variant="default" onClick={() => setIsOpen(false)}>
            დახურვა
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
