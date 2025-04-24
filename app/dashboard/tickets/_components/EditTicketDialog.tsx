// src/components/EditTicketDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { EditTicketDialogProps } from '@/app/types/ticket-types';
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

export const EditTicketDialog: React.FC<EditTicketDialogProps> = ({
  isOpen,
  setIsOpen,
  editFormData,
  setEditFormData,
  schedules,
  handleSubmitEdit,
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
      if (!editFormData.schedule_id || !editFormData.schedule_date) {
        setAvailableSeats('');
        return;
      }

      setIsLoadingSeats(true);
      setSeatError(null);

      try {
        const data = await getAvailableSeats(
          editFormData.schedule_id,
          editFormData.schedule_date
        );

        // Add the current seat to available seats if not already present
        let availableSeatsArray = data.available_seats
          ? data.available_seats.split(', ')
          : [];
        if (
          editFormData.seat_number &&
          !availableSeatsArray.includes(editFormData.seat_number)
        ) {
          availableSeatsArray.push(editFormData.seat_number);
          availableSeatsArray.sort(
            (a: string, b: string) => parseInt(a) - parseInt(b)
          );
        }

        setAvailableSeats(availableSeatsArray.join(', '));
      } catch (err) {
        console.error('Error fetching available seats:', err);
        setSeatError('Could not load available seats');
        setAvailableSeats('');
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchAvailableSeats();
  }, [
    editFormData.schedule_id,
    editFormData.schedule_date,
    editFormData.seat_number,
  ]);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ბილეთის ცვლილება</DialogTitle>
          <DialogDescription>შეცვალე ბილეთის მონაცემები</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Schedule selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_schedule_id" className="text-right">
              მარშრუტი
            </Label>
            <div className="col-span-3">
              <Select
                value={editFormData.schedule_id}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({ ...prev, schedule_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე მარშრუტი" />
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
            <Label htmlFor="edit_schedule_date" className="text-right">
              თარიღი
            </Label>
            <Input
              id="edit_schedule_date"
              type="date"
              value={editFormData.schedule_date}
              onChange={(e) =>
                setEditFormData((prev) => ({
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
                value={editFormData.seat_number}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({ ...prev, seat_number: value }))
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
            <Label htmlFor="edit_passenger_name" className="text-right">
              სახელი
            </Label>
            <Input
              id="edit_passenger_name"
              value={editFormData.passenger_name}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  passenger_name: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_passenger_surname" className="text-right">
              გვარი
            </Label>
            <Input
              id="edit_passenger_surname"
              value={editFormData.passenger_surname}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  passenger_surname: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_passenger_email" className="text-right">
              იმეილი
            </Label>
            <Input
              id="edit_passenger_email"
              type="email"
              value={editFormData.passenger_email}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  passenger_email: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_passenger_phone" className="text-right">
              ტელეფონი
            </Label>
            <Input
              id="edit_passenger_phone"
              value={editFormData.passenger_phone}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  passenger_phone: e.target.value,
                }))
              }
              className="col-span-3"
            />
          </div>

          {/* Driver selection (optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_driver_id" className="text-right">
              მძღოლი (არჩევითი)
            </Label>
            <div className="col-span-3">
              <Select
                value={editFormData.driver_id?.toString() || 'none'}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    driver_id: value === 'none' ? '' : value,
                  }))
                }
                disabled={isLoadingDrivers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="მონიშნე (არჩევითი)" />
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            გაუქმება
          </Button>
          <Button
            type="submit"
            onClick={handleSubmitEdit}
            disabled={
              isSubmitting || isLoadingSeats || !editFormData.seat_number
            }
          >
            {isSubmitting ? 'ინახება...' : 'ცვლილებების შენახვა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
