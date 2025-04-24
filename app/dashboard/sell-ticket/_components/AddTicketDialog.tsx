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
import { Schedule } from '@/app/types/ticket-types';
import { 
  getAvailableSeats, 
  sellTicketsAsSalesAgent,
  validatePassengerData,
  getPaymentMethods,
  PassengerFormData
} from '@/app/services/salesagent_sell.service';
import { toast } from '@/hooks/use-toast';

// Define driver interface
interface Driver {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

interface SellTicketsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  schedules: Schedule[];
  onTicketsSold?: () => void;
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

export const SellTicketsDialog: React.FC<SellTicketsDialogProps> = ({
  isOpen,
  setIsOpen,
  schedules,
  onTicketsSold = () => {},
}) => {
  // Form state
  const [scheduleId, setScheduleId] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<PassengerFormData[]>([{
    passenger_name: '',
    passenger_surname: '',
    passenger_email: '',
    passenger_phone: '',
  }]);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [language, setLanguage] = useState<string>('ka');
  
  // UI states
  const [availableSeats, setAvailableSeats] = useState<string>('');
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['cash', 'card', 'bank_transfer']);
  const [formErrors, setFormErrors] = useState<Record<number, Record<string, string>>>({});
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchPaymentMethods();
    }
  }, [isOpen]);
  
  // Fetch available seats when schedule or date changes
  useEffect(() => {
    const fetchSeats = async () => {
      // Only fetch if both schedule_id and schedule_date are set
      if (!scheduleId || !scheduleDate) {
        setAvailableSeats('');
        return;
      }

      setIsLoadingSeats(true);
      setSeatError(null);

      try {
        const availableSeatsString = await getAvailableSeats(parseInt(scheduleId), scheduleDate);
        setAvailableSeats(availableSeatsString);
        
        // Clear selected seats if they're no longer available
        if (availableSeatsString) {
          const availableSeatNumbers = availableSeatsString.split(', ').map(Number);
          setSelectedSeats(prev => 
            prev.filter(seatNum => availableSeatNumbers.includes(seatNum))
          );
        } else {
          setSelectedSeats([]);
        }
      } catch (err) {
        console.error('Error fetching available seats:', err);
        setSeatError('Could not load available seats');
        setAvailableSeats('');
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [scheduleId, scheduleDate]);
  
  // Update passenger forms when seats change
  useEffect(() => {
    const passengerCount = selectedSeats.length;
    
    if (passengerCount === 0) {
      setPassengers([{
        passenger_name: '',
        passenger_surname: '',
        passenger_email: '',
        passenger_phone: '',
      }]);
    } else if (passengerCount > passengers.length) {
      // Add more forms if needed
      const newForms = [...passengers];
      for (let i = passengers.length; i < passengerCount; i++) {
        newForms.push({
          passenger_name: '',
          passenger_surname: '',
          passenger_email: '',
          passenger_phone: '',
        });
      }
      setPassengers(newForms);
    } else if (passengerCount < passengers.length) {
      // Remove excess forms
      setPassengers(passengers.slice(0, passengerCount));
    }
  }, [selectedSeats]);
  
  const fetchPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };
  
  const handleSeatChange = (seatNumbers: string[]) => {
    // Convert to numbers and limit to 5 tickets
    const seatNumbersAsNumbers = seatNumbers.map(Number).slice(0, 5);
    setSelectedSeats(seatNumbersAsNumbers);
  };
  
  const updatePassengerField = (
    index: number,
    field: keyof PassengerFormData,
    value: string
  ) => {
    setPassengers((prevPassengers) => {
      const newPassengers = [...prevPassengers];
      newPassengers[index] = { ...newPassengers[index], [field]: value };
      return newPassengers;
    });
  };
  
  const validatePassengerForms = (): boolean => {
    const errors: Record<number, Record<string, string>> = {};
    let isValid = true;

    passengers.forEach((passenger, index) => {
      const validation = validatePassengerData(passenger);
      if (!validation.isValid) {
        errors[index] = validation.errors;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async () => {
    try {
      // Validation
      if (!scheduleId) {
        toast({
          title: 'შეცდომა',
          description: 'გთხოვთ აირჩიოთ მარშრუტი',
          variant: 'destructive',
        });
        return;
      }
      
      if (!scheduleDate) {
        toast({
          title: 'შეცდომა',
          description: 'გთხოვთ აირჩიოთ თარიღი',
          variant: 'destructive',
        });
        return;
      }
      
      if (!selectedSeats.length) {
        toast({
          title: 'შეცდომა',
          description: 'გთხოვთ აირჩიოთ ერთი ადგილი მაინც',
          variant: 'destructive',
        });
        return;
      }
      
      if (!validatePassengerForms()) {
        toast({
          title: 'შეცდომა',
          description: 'გთხოვთ შეავსოთ სწორად მგზავრის ინფორმაცია',
          variant: 'destructive',
        });
        return;
      }
      
      setIsSubmitting(true);
      
      const sellRequest = {
        ticket_count: selectedSeats.length,
        schedule_id: parseInt(scheduleId),
        schedule_date: scheduleDate,
        seat_numbers: selectedSeats,
        passengers: passengers,
        payment_method: paymentMethod,
        language: language
      };
      
      await sellTicketsAsSalesAgent(sellRequest);
      
      toast({
        title: 'წარმატება',
        description: `წარმატებით გაიყიდა ${selectedSeats.length} ბილეთი!`,
      });
      
      // Notify parent component
      onTicketsSold();
      
      // Close dialog and reset form
      resetForm();
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error selling tickets:', error);
      toast({
        title: 'შეცდომა',
        description: 'ბილეთების გაყიდვისას დაფიქსირდა შეცდომა',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setScheduleId('');
    setScheduleDate(new Date().toISOString().split('T')[0]);
    setSelectedSeats([]);
    setPassengers([{
      passenger_name: '',
      passenger_surname: '',
      passenger_email: '',
      passenger_phone: '',
    }]);
    setPaymentMethod('cash');
    setLanguage('ka');
    setFormErrors({});
  };
  
  // Handle dialog close to reset form data
  const handleDialogOpenChange = (open: boolean) => {
    // If dialog is closing
    if (!open) {
      // Reset form data after closing
      setTimeout(() => {
        resetForm();
      }, 300); // Small delay to allow animation to complete
    }

    setIsOpen(open);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ბილეთების გაყიდვა</DialogTitle>
          <DialogDescription>
            გაყიდე ერთი ან რამდენიმე ბილეთი (მაქსიმუმ 5)
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
                value={scheduleId}
                onValueChange={setScheduleId}
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
            <Label htmlFor="schedule_date" className="text-right">
              თარიღი
            </Label>
            <Input
              id="schedule_date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Seat number selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              ადგილის ნომრები
            </Label>
            <div className="col-span-3">
              <div className="mb-2">
                <Select
                  value={selectedSeats.length === 1 ? selectedSeats[0].toString() : undefined}
                  onValueChange={(value) => handleSeatChange([value])}
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
              
              {/* Multiple seats selection */}
              <div className="mt-4">
                <Label className="block mb-2 text-sm">ან აირჩიეთ რამდენიმე ადგილი (მაქსიმუმ 5)</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableSeats && availableSeats.split(', ').map((seat) => {
                    const seatNumber = parseInt(seat);
                    const isSelected = selectedSeats.includes(seatNumber);
                    
                    return (
                      <button
                        key={seat}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
                          } else if (selectedSeats.length < 5) {
                            setSelectedSeats(prev => [...prev, seatNumber]);
                          } else {
                            toast({
                              title: 'შეზღუდვა',
                              description: 'შეგიძლიათ აირჩიოთ მაქსიმუმ 5 ადგილი',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className={`h-10 w-10 flex items-center justify-center rounded-md border ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {selectedSeats.length > 0 && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">არჩეული ადგილები: </span>
                  {selectedSeats.sort((a, b) => a - b).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Passenger information */}
          {selectedSeats.length > 0 ? (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">მგზავრების ინფორმაცია</h3>
                <div className="text-sm text-gray-500">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'მგზავრი' : 'მგზავრი'}
                </div>
              </div>
              
              <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4">
                {passengers.map((passenger, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">მგზავრი {index + 1} - ადგილი {selectedSeats[index]}</h3>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Copy data from the first passenger
                            updatePassengerField(index, 'passenger_name', passengers[0].passenger_name);
                            updatePassengerField(index, 'passenger_surname', passengers[0].passenger_surname);
                            updatePassengerField(index, 'passenger_email', passengers[0].passenger_email);
                            updatePassengerField(index, 'passenger_phone', passengers[0].passenger_phone);
                          }}
                          className="text-xs"
                        >
                          დააკოპირე პირველი მგზავრიდან
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`passenger_name_${index}`} className="text-right">
                          სახელი
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id={`passenger_name_${index}`}
                            value={passenger.passenger_name}
                            onChange={(e) =>
                              updatePassengerField(index, 'passenger_name', e.target.value)
                            }
                            className={formErrors[index]?.passenger_name ? "border-red-500" : ""}
                          />
                          {formErrors[index]?.passenger_name && (
                            <p className="text-xs text-red-500 mt-1">{formErrors[index].passenger_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`passenger_surname_${index}`} className="text-right">
                          გვარი
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id={`passenger_surname_${index}`}
                            value={passenger.passenger_surname}
                            onChange={(e) =>
                              updatePassengerField(index, 'passenger_surname', e.target.value)
                            }
                            className={formErrors[index]?.passenger_surname ? "border-red-500" : ""}
                          />
                          {formErrors[index]?.passenger_surname && (
                            <p className="text-xs text-red-500 mt-1">{formErrors[index].passenger_surname}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`passenger_email_${index}`} className="text-right">
                          იმეილი
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id={`passenger_email_${index}`}
                            type="email"
                            value={passenger.passenger_email}
                            onChange={(e) =>
                              updatePassengerField(index, 'passenger_email', e.target.value)
                            }
                            className={formErrors[index]?.passenger_email ? "border-red-500" : ""}
                          />
                          {formErrors[index]?.passenger_email && (
                            <p className="text-xs text-red-500 mt-1">{formErrors[index].passenger_email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`passenger_phone_${index}`} className="text-right">
                          ტელეფონი
                        </Label>
                        <div className="col-span-3">
                          <Input
                            id={`passenger_phone_${index}`}
                            value={passenger.passenger_phone}
                            onChange={(e) =>
                              updatePassengerField(index, 'passenger_phone', e.target.value)
                            }
                            className={formErrors[index]?.passenger_phone ? "border-red-500" : ""}
                          />
                          {formErrors[index]?.passenger_phone && (
                            <p className="text-xs text-red-500 mt-1">{formErrors[index].passenger_phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              გთხოვთ აირჩიოთ ერთი ადგილი მაინც, რომ შეიყვანოთ მგზავრის ინფორმაცია
            </div>
          )}
          
          {/* Payment method selection */}
          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label htmlFor="payment_method" className="text-right">
              გადახდის მეთოდი
            </Label>
            <div className="col-span-3">
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ გადახდის მეთოდი" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method === 'cash' ? 'ნაღდი ფული' : 
                      method === 'card' ? 'ბარათით' : 
                      method === 'bank_transfer' ? 'საბანკო გადარიცხვა' : 
                      method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    id="language-ka" 
                    name="language" 
                    value="ka" 
                    checked={language === 'ka'}
                    onChange={() => setLanguage('ka')}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="language-ka" className="cursor-pointer">
                    ქართული
                  </Label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="language-en" 
                    name="language" 
                    value="en" 
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="language-en" className="cursor-pointer">
                    English
                  </Label>
                </div>
              </div>
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
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingSeats || selectedSeats.length === 0}
          >
            {isSubmitting ? 'იქმნება...' : 'ბილეთების გაყიდვა'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};