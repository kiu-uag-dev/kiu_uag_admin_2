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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, PlusCircle, Search, Clock, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Destination,
  Schedule,
  ScheduleFormData,
  getSchedules,
  getDestinations,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  formatTime,
} from '@/app/services/admin_schedule.service';
import { downloadSchedulesExcel } from '@/app/services/admin_excel.service';

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestinationFilter, setSelectedDestinationFilter] =
    useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [formData, setFormData] = useState<ScheduleFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // No role checker needed for this component

  // Filter schedules by destination and search query
  const filteredSchedules = schedules.filter((schedule) => {
    // First filter by destination if a specific one is selected
    if (
      selectedDestinationFilter !== 'all' &&
      schedule.destination_id.toString() !== selectedDestinationFilter
    ) {
      return false;
    }

    // Then apply text search filter
    if (searchQuery) {
      const leavesFrom = schedule.destination.leaves_from.toLowerCase();
      const arrivesTo = schedule.destination.arrives_to.toLowerCase();
      const query = searchQuery.toLowerCase();
      return leavesFrom.includes(query) || arrivesTo.includes(query);
    }

    return true;
  });

  // Initialize the new schedule form with empty values
  const initNewScheduleForm = () => {
    setFormData({
      destination_id: destinations.length > 0 ? destinations[0].id : undefined,
      leave_time: '',
      arrive_time: '',
    });
  };

  // Fetch schedules data
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getSchedules();
      setSchedules(data);
    } catch (err) {
      setError('განრიგების ჩატვირთვისას მოხდა შეცდომა');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch destinations for the dropdown
  const fetchDestinations = async () => {
    try {
      const data = await getDestinations();
      setDestinations(data);
    } catch (err) {
      console.error('მარშრუტების ჩატვირთვისას მოხდა შეცდომა:', err);
      // We don't set the main error here as it would hide the schedules
    }
  };

  useEffect(() => {
    // Fetch both schedules and destinations
    const fetchData = async () => {
      await fetchDestinations();
      await fetchSchedules();
    };

    fetchData();
  }, []);

  // Handle edit schedule
  const handleEditClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      destination_id: schedule.destination_id,
      leave_time: schedule.leave_time,
      arrive_time: schedule.arrive_time,
    });
  };

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit schedule edit
  const handleSubmitEdit = async () => {
    if (!selectedSchedule) return;

    try {
      setIsSubmitting(true);
      
      await updateSchedule(selectedSchedule.id, formData);
      
      // Refresh the schedules list
      await fetchSchedules();

      // Show success toast
      toast({
        title: 'განრიგი განახლდა',
        description: 'განრიგი წარმატებით განახლდა.',
      });

      // Reset form
      setSelectedSchedule(null);
      setFormData({});
    } catch (err) {
      console.error('განრიგის განახლებისას მოხდა შეცდომა:', err);
      toast({
        title: 'განახლება ვერ მოხერხდა',
        description: 'განრიგის განახლებისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new schedule
  const handleCreateSchedule = async () => {
    try {
      setIsSubmitting(true);
      
      await createSchedule(formData);
      
      // Refresh the schedules list
      await fetchSchedules();

      // Show success toast
      toast({
        title: 'განრიგი შეიქმნა',
        description: 'ახალი განრიგი წარმატებით დაემატა.',
      });

      // Reset form and close dialog
      setFormData({});
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('განრიგის შექმნისას მოხდა შეცდომა:', err);
      toast({
        title: 'შექმნა ვერ მოხერხდა',
        description: 'განრიგის შექმნისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      setIsSubmitting(true);
      
      await deleteSchedule(scheduleId);
      
      // Refresh the schedules list
      await fetchSchedules();

      // Show success toast
      toast({
        title: 'განრიგი წაიშალა',
        description: 'განრიგი წარმატებით წაიშალა.',
      });
    } catch (err) {
      console.error('განრიგის წაშლისას მოხდა შეცდომა:', err);
      toast({
        title: 'წაშლა ვერ მოხერხდა',
        description: 'განრიგის წაშლისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadSchedulesExcel();
      toast({
        title: 'Excel ფაილი გადმოწერილია',
        description: 'გრაფიკების მონაცემები წარმატებით გადმოწერილია Excel ფაილში.',
      });
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast({
        title: 'გადმოწერა ვერ მოხერხდა',
        description: 'Excel ფაილის გადმოწერისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          განრიგი
        </h3>
        <Card className="p-6">განრიგების ჩატვირთვა...</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          განრიგი
        </h3>
        <Card className="p-6 text-red-500">{error}</Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-4">
           <h3 className="font scroll-m-20 text-2xl font-semibold tracking-tight">
        განრიგი
      </h3>
      <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadExcel}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Excel-ში გადმოწერა
        </Button>   
      </div>

      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="flex w-2/3 items-center gap-4">
            <div className="relative w-1/2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ძიება ადგილმდებარეობით..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="w-1/2">
              <Select
                value={selectedDestinationFilter}
                onValueChange={(value) => setSelectedDestinationFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="მარშრუტით ფილტრაცია" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა მარშრუტი</SelectItem>
                  {destinations.map((destination) => (
                    <SelectItem
                      key={destination.id}
                      value={destination.id.toString()}
                    >
                      {destination.leaves_from} ➝ {destination.arrives_to}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  initNewScheduleForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                განრიგის დამატება
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>ახალი განრიგის დამატება</DialogTitle>
                <DialogDescription>
                  შექმენით ახალი განრიგი ქვემოთ მოცემული ფორმის შევსებით.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="destination_id" className="text-right">
                    მარშრუტი
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.destination_id?.toString()}
                      onValueChange={(value) =>
                        handleSelectChange('destination_id', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="აირჩიეთ მარშრუტი" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((destination) => (
                          <SelectItem
                            key={destination.id}
                            value={destination.id.toString()}
                          >
                            {destination.leaves_from} ➝ {destination.arrives_to}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leave_time" className="text-right">
                    გასვლის დრო
                  </Label>
                  <Input
                    id="leave_time"
                    name="leave_time"
                    type="time"
                    value={formData.leave_time || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="arrive_time" className="text-right">
                    ჩასვლის დრო
                  </Label>
                  <Input
                    id="arrive_time"
                    name="arrive_time"
                    type="time"
                    value={formData.arrive_time || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  გაუქმება
                </Button>
                <Button
                  type="submit"
                  onClick={handleCreateSchedule}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'იქმნება...' : 'განრიგის შექმნა'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>მარშრუტი</TableHead>
              <TableHead>გასვლა</TableHead>
              <TableHead>ჩასვლა</TableHead>
              <TableHead>ფასი</TableHead>
              <TableHead>გაჩერებები</TableHead>
              <TableHead className="text-right">მოქმედებები</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule, index) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.id}</TableCell>
                  <TableCell>
                    {schedule.destination.leaves_from} ➝{' '}
                    {schedule.destination.arrives_to}
                  </TableCell>
                  <TableCell>{formatTime(schedule.leave_time)}</TableCell>
                  <TableCell>{formatTime(schedule.arrive_time)}</TableCell>
                  <TableCell>{schedule.destination.price} ლარი</TableCell>
                  <TableCell>
                    {schedule.destination.bus_stops.join(', ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Edit Button and Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">რედაქტირება</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>განრიგის რედაქტირება</DialogTitle>
                            <DialogDescription>
                              განრიგის ინფორმაციის შეცვლა შეგიძლიათ აქ.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="destination_id"
                                className="text-right"
                              >
                                მარშრუტი
                              </Label>
                              <div className="col-span-3">
                                <Select
                                  value={formData.destination_id?.toString()}
                                  onValueChange={(value) =>
                                    handleSelectChange('destination_id', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="აირჩიეთ მარშრუტი" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {destinations.map((destination) => (
                                      <SelectItem
                                        key={destination.id}
                                        value={destination.id.toString()}
                                      >
                                        {destination.leaves_from} ➝{' '}
                                        {destination.arrives_to}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="leave_time"
                                className="text-right"
                              >
                                გასვლის დრო
                              </Label>
                              <Input
                                id="leave_time"
                                name="leave_time"
                                type="time"
                                value={formData.leave_time || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="arrive_time"
                                className="text-right"
                              >
                                ჩასვლის დრო
                              </Label>
                              <Input
                                id="arrive_time"
                                name="arrive_time"
                                type="time"
                                value={formData.arrive_time || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">გაუქმება</Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              onClick={handleSubmitEdit}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'ინახება...' : 'ცვლილებების შენახვა'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete Button and Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">წაშლა</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                განრიგის წაშლა
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                დარწმუნებული ხართ, რომ გსურთ ამ განრიგის წაშლა?
                                ეს მოქმედება ვერ იქნება გაუქმებული.
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteSchedule(schedule.id)
                                }
                                disabled={isSubmitting}
                              >
                                {isSubmitting
                                  ? 'იშლება...'
                                  : 'განრიგის წაშლა'}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {schedules.length === 0
                    ? 'განრიგები არ მოიძებნა'
                    : 'შესაბამისი განრიგები ვერ მოიძებნა'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}