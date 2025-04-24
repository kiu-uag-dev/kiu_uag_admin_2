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
import { toast } from '@/hooks/use-toast';
import { getAvailableSeats } from '@/app/services/salesagent_sell.service';
import { EditTicketDialogProps } from '../_types/sell_ticket';

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
  const [language, setLanguage] = useState<string>('ka');

  // Set the language based on the existing ticket data when dialog opens
  useEffect(() => {
    if (isOpen && editFormData.language) {
      setLanguage(editFormData.language);
    } else {
      setLanguage('ka'); // Default to Georgian
    }
  }, [isOpen, editFormData]);

  // Fetch available seats whenever schedule_id or schedule_date changes
  useEffect(() => {
    const fetchSeats = async () => {
      // Only fetch if both schedule_id and schedule_date are set
      if (!editFormData.schedule_id || !editFormData.schedule_date) {
        setAvailableSeats('');
        return;
      }

      setIsLoadingSeats(true);
      setSeatError(null);

      try {
        const availableSeatsString = await getAvailableSeats(
          parseInt(editFormData.schedule_id), 
          editFormData.schedule_date
        );
        
        // Add the current seat to available seats if not already present
        let availableSeatsArray = availableSeatsString
          ? availableSeatsString.split(', ')
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

    fetchSeats();
  }, [
    editFormData.schedule_id,
    editFormData.schedule_date,
    editFormData.seat_number,
  ]);

  // Handle form submission including language
  const onSubmitEdit = () => {
    // Add language to form data
    setEditFormData(prev => ({
      ...prev,
      language: language
    }));
    
    // Call the original submit handler after state update
    setTimeout(() => {
      handleSubmitEdit();
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      {schedule.destination?.leaves_from} ➝{' '}
                      {schedule.destination?.arrives_to} (
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
              
              {seatError && (
                <p className="text-xs text-red-500 mt-1">{seatError}</p>
              )}
            </div>
          </div>

          {/* Passenger information */}
          <div className="border p-4 rounded-md mt-4">
            <h3 className="font-medium mb-4">მგზავრის ინფორმაცია</h3>
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Language selection */}
          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label htmlFor="language" className="text-right">
              ბილეთის ენა
            </Label>
            <div className="col-span-3">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="edit-language-ka" 
                    name="edit-language" 
                    value="ka" 
                    checked={language === 'ka'}
                    onChange={() => setLanguage('ka')}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="edit-language-ka" className="cursor-pointer">
                    ქართული
                  </Label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="edit-language-en" 
                    name="edit-language" 
                    value="en" 
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="edit-language-en" className="cursor-pointer">
                    English
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            გაუქმება
          </Button>
          <Button
            type="submit"
            onClick={onSubmitEdit}
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