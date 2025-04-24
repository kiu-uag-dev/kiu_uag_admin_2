// src/components/AddTicketDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddTicketDialogProps } from '@/app/types/ticket-types';
import { getAvailableSeats, getDrivers } from '@/app/services/admin_ticket.service';

// Define driver interface
interface Driver {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

// Helper for time formatting
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

export const AddTicketDialog: React.FC<AddTicketDialogProps> = ({
  isOpen,
  setIsOpen,
  formData,
  setFormData,
  schedules,
  handleCreateTicket,
  isSubmitting,
}) => {
  const [availableSeats, setAvailableSeats] = useState<string>('');
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState<boolean>(false);

  // Fetch available seats whenever schedule_id or schedule_date changes
  useEffect(() => {
    const fetchAvailableSeats = async () => {
      // Only fetch if both schedule_id and schedule_date are set
      if (!formData.schedule_id || !formData.schedule_date) {
        setAvailableSeats('');
        return;
      }

      setIsLoadingSeats(true);
      setSeatError(null);

      try {
        const data = await getAvailableSeats(
          formData.schedule_id,
          formData.schedule_date
        );
        setAvailableSeats(data.available_seats || '');

        // If the currently selected seat is not available, clear it
        if (
          formData.seat_number &&
          data.available_seats &&
          !data.available_seats.split(', ').includes(formData.seat_number)
        ) {
          setFormData((prev) => ({ ...prev, seat_number: '' }));
        }
      } catch (err) {
        console.error('Error fetching available seats:', err);
        setSeatError('Could not load available seats');
        setAvailableSeats('');
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchAvailableSeats();
  }, [formData.schedule_id, formData.schedule_date]);

  // Fetch drivers when dialog opens
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!isOpen) return;

      setIsLoadingDrivers(true);
      try {
        const data = await getDrivers();
        setDrivers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [isOpen]);

  // Handle dialog close to reset form data
  const handleDialogOpenChange = (open: boolean) => {
    // If dialog is closing
    if (!open) {
      // Reset form data after closing
      setTimeout(() => {
        setFormData({
          schedule_id: '',
          seat_number: '',
          passenger_name: '',
          passenger_surname: '',
          passenger_email: '',
          passenger_phone: '',
          purchaser_id: formData.purchaser_id, // Keep the purchaser ID
          driver_id: '', // Reset driver ID
          schedule_date: new Date().toISOString().split('T')[0], // Reset to today's date
        });
        // Also reset local states
        setAvailableSeats('');
        setSeatError(null);
      }, 300); // Small delay to allow animation to complete
    }

    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>დაამატე ახალი ბილეთი</DialogTitle>
          <DialogDescription>
            შექმენი ბილეთი ახალი მგზავრისთვის
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Schedule selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule_id" className="text-right">
              მარშრუტი
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.schedule_id?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, schedule_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem
                      key={schedule.id}
                      value={schedule.id.toString()}
                    >
                      {schedule.destination.leaves_from} ➝{' '}
                      {schedule.destination.arrives_to} (
                      {formatTime(schedule.leave_time)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule_date" className="text-right">
              თარიღი
            </Label>
            <Input
              id="schedule_date"
              type="date"
              value={formData.schedule_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  schedule_date: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          {/* Seat number selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seat_number" className="text-right">
              ადგილის ნომერი
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.seat_number}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, seat_number: value }))
                }
                disabled={!availableSeats || isLoadingSeats}
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ ადგილი" />
                </SelectTrigger>
                <SelectContent>
                  {availableSeats &&
                    availableSeats.split(', ').map((seat) => (
                      <SelectItem key={seat} value={seat}>
                        ადგილი {seat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Passenger information */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passenger_name" className="text-right">
              სახელი
            </Label>
            <Input
              id="passenger_name"
              value={formData.passenger_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  passenger_name: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passenger_surname" className="text-right">
              გვარი
            </Label>
            <Input
              id="passenger_surname"
              value={formData.passenger_surname}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  passenger_surname: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passenger_email" className="text-right">
              იმეილი
            </Label>
            <Input
              id="passenger_email"
              type="email"
              value={formData.passenger_email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  passenger_email: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passenger_phone" className="text-right">
              ტელეფონი
            </Label>
            <Input
              id="passenger_phone"
              value={formData.passenger_phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  passenger_phone: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          {/* Driver selection (optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver_id" className="text-right">
              მძღოლი (არჩევითი)
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.driver_id?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    driver_id: value === 'none' ? '' : value,
                  }))
                }
                disabled={isLoadingDrivers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ მძღოლი (არჩევითი)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- არცერთი --</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.first_name} {driver.last_name} ({driver.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
          >
            გაუქმება
          </Button>
          <Button
            type="submit"
            onClick={handleCreateTicket}
            disabled={isSubmitting || isLoadingSeats || !formData.seat_number}
          >
            {isSubmitting ? 'იქმნება...' : 'შექმნა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
