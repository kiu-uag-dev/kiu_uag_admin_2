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
import { Edit, Trash2, PlusCircle, Search, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Destination,
  DestinationFormData,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from '@/app/services/admin_direction.service';
import { downloadDestinationsExcel } from '@/app/services/admin_excel.service';

// Simple pagination component
const PaginationNav = () => {
  return (
    <div className="flex items-center justify-end space-x-2 px-4 py-4">
      <button className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">
        წინა
      </button>
      <button className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">
        შემდეგი
      </button>
    </div>
  );
};

export default function DestinationTable() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [formData, setFormData] = useState<DestinationFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('customer'); // Default to lowest permission

  // Check if current user is admin
  const isAdmin = currentUserRole === 'admin';

  // Filter destinations by from or to location
  const filteredDestinations = destinations.filter((destination) => {
    const leavesFrom = destination.leaves_from.toLowerCase();
    const arrivesTo = destination.arrives_to.toLowerCase();
    const query = searchQuery.toLowerCase();
    return leavesFrom.includes(query) || arrivesTo.includes(query);
  });

  // Initialize the new destination form with empty values
  const initNewDestinationForm = () => {
    setFormData({
      leaves_from: '',
      leaves_from_ka: '',
      arrives_to: '',
      arrives_to_ka: '',
      bus_stops_text: '',
      bus_stops_ka_text: '',
      price: 0,
    });
  };

  // Fetch destinations data
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await getDestinations();
      setDestinations(data);
    } catch (err) {
      setError('მარშრუტების ჩატვირთვისას მოხდა შეცდომა');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Handle edit destination
  const handleEditClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setFormData({
      leaves_from: destination.leaves_from,
      leaves_from_ka: destination.leaves_from_ka,
      arrives_to: destination.arrives_to,
      arrives_to_ka: destination.arrives_to_ka,
      bus_stops_text: destination.bus_stops.join(', '),
      bus_stops_ka_text: destination.bus_stops_ka.join(', '),
      price: destination.price,
    });
  };

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit destination edit
  const handleSubmitEdit = async () => {
    if (!selectedDestination) return;

    try {
      setIsSubmitting(true);

      await updateDestination(selectedDestination.id, formData);

      // Refresh the destinations list
      await fetchDestinations();

      // Show success toast
      toast({
        title: 'მარშრუტი განახლდა',
        description: 'მარშრუტი წარმატებით განახლდა.',
      });

      // Reset form
      setSelectedDestination(null);
      setFormData({});
    } catch (err) {
      console.error('მარშრუტის განახლებისას მოხდა შეცდომა:', err);
      toast({
        title: 'განახლება ვერ მოხერხდა',
        description: 'მარშრუტის განახლებისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new destination
  const handleCreateDestination = async () => {
    try {
      setIsSubmitting(true);

      await createDestination(formData);

      // Refresh the destinations list
      await fetchDestinations();

      // Show success toast
      toast({
        title: 'მარშრუტი შეიქმნა',
        description: 'ახალი მარშრუტი წარმატებით დაემატა.',
      });

      // Reset form and close dialog
      setFormData({});
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('მარშრუტის შექმნისას მოხდა შეცდომა:', err);
      toast({
        title: 'შექმნა ვერ მოხერხდა',
        description: 'მარშრუტის შექმნისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete destination
  const handleDeleteDestination = async (destinationId: number) => {
    try {
      setIsSubmitting(true);

      await deleteDestination(destinationId);

      // Refresh the destinations list
      await fetchDestinations();

      // Show success toast
      toast({
        title: 'მარშრუტი წაიშალა',
        description: 'მარშრუტი წარმატებით წაიშალა.',
      });
    } catch (err) {
      console.error('მარშრუტის წაშლისას მოხდა შეცდომა:', err);
      toast({
        title: 'წაშლა ვერ მოხერხდა',
        description: 'მარშრუტის წაშლისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadDestinationsExcel();
      toast({
        title: 'Excel ფაილი გადმოწერილია',
        description:
          'მარშრუტების მონაცემები წარმატებით გადმოწერილია Excel ფაილში.',
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
          მარშრუტები
        </h3>
        <Card className="p-6">მარშრუტების ჩატვირთვა...</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          მარშრუტები
        </h3>
        <Card className="p-6 text-red-500">{error}</Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font scroll-m-20 text-2xl font-semibold tracking-tight">
          მარშრუტები
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
          <div className="relative w-1/3">
            <div className="relative">
              <Input
                type="text"
                placeholder="ძიება ადგილმდებარეობით..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  initNewDestinationForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                მარშრუტის დამატება
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>ახალი მარშრუტის დამატება</DialogTitle>
                <DialogDescription>
                  შეავსეთ ფორმა ახალი მარშრუტის შესაქმნელად.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaves_from" className="text-right">
                    საიდან (EN)
                  </Label>
                  <Input
                    id="leaves_from"
                    name="leaves_from"
                    value={formData.leaves_from || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaves_from_ka" className="text-right">
                    საიდან (KA)
                  </Label>
                  <Input
                    id="leaves_from_ka"
                    name="leaves_from_ka"
                    value={formData.leaves_from_ka || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="arrives_to" className="text-right">
                    სად (EN)
                  </Label>
                  <Input
                    id="arrives_to"
                    name="arrives_to"
                    value={formData.arrives_to || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="arrives_to_ka" className="text-right">
                    სად (KA)
                  </Label>
                  <Input
                    id="arrives_to_ka"
                    name="arrives_to_ka"
                    value={formData.arrives_to_ka || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bus_stops_text" className="text-right">
                    გაჩერებები (EN)
                  </Label>
                  <Input
                    id="bus_stops_text"
                    name="bus_stops_text"
                    value={formData.bus_stops_text || ''}
                    onChange={handleChange}
                    placeholder="გაჩერება 1, გაჩერება 2, გაჩერება 3"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bus_stops_ka_text" className="text-right">
                    გაჩერებები (KA)
                  </Label>
                  <Input
                    id="bus_stops_ka_text"
                    name="bus_stops_ka_text"
                    value={formData.bus_stops_ka_text || ''}
                    onChange={handleChange}
                    placeholder="გაჩერება 1, გაჩერება 2, გაჩერება 3"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    ფასი
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price || 0}
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
                  onClick={handleCreateDestination}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'იქმნება...' : 'მარშრუტის შექმნა'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>საიდან</TableHead>
              <TableHead>სად</TableHead>
              <TableHead>გაჩერებები</TableHead>
              <TableHead>ფასი</TableHead>
              <TableHead className="text-right">მოქმედებები</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination, index) => (
                <TableRow key={destination.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{destination.leaves_from}</TableCell>
                  <TableCell>{destination.arrives_to}</TableCell>
                  <TableCell>{destination.bus_stops.join(', ')}</TableCell>
                  <TableCell>{destination.price}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Edit Button and Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(destination)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">რედაქტირება</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>მარშრუტის რედაქტირება</DialogTitle>
                            <DialogDescription>
                              შეცვალეთ მარშრუტის ინფორმაცია.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="leaves_from"
                                className="text-right"
                              >
                                საიდან (EN)
                              </Label>
                              <Input
                                id="leaves_from"
                                name="leaves_from"
                                value={formData.leaves_from || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="leaves_from_ka"
                                className="text-right"
                              >
                                საიდან (KA)
                              </Label>
                              <Input
                                id="leaves_from_ka"
                                name="leaves_from_ka"
                                value={formData.leaves_from_ka || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="arrives_to"
                                className="text-right"
                              >
                                სად (EN)
                              </Label>
                              <Input
                                id="arrives_to"
                                name="arrives_to"
                                value={formData.arrives_to || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="arrives_to_ka"
                                className="text-right"
                              >
                                სად (KA)
                              </Label>
                              <Input
                                id="arrives_to_ka"
                                name="arrives_to_ka"
                                value={formData.arrives_to_ka || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="bus_stops_text"
                                className="text-right"
                              >
                                გაჩერებები (EN)
                              </Label>
                              <Input
                                id="bus_stops_text"
                                name="bus_stops_text"
                                value={formData.bus_stops_text || ''}
                                onChange={handleChange}
                                placeholder="გაჩერება 1, გაჩერება 2, გაჩერება 3"
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="bus_stops_ka_text"
                                className="text-right"
                              >
                                გაჩერებები (KA)
                              </Label>
                              <Input
                                id="bus_stops_ka_text"
                                name="bus_stops_ka_text"
                                value={formData.bus_stops_ka_text || ''}
                                onChange={handleChange}
                                placeholder="გაჩერება 1, გაჩერება 2, გაჩერება 3"
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="price" className="text-right">
                                ფასი
                              </Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                value={formData.price || 0}
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
                              {isSubmitting
                                ? 'ინახება...'
                                : 'ცვლილებების შენახვა'}
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
                                მარშრუტის წაშლა
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                დარწმუნებული ხართ, რომ გსურთ ამ მარშრუტის წაშლა?
                                ეს მოქმედება ვერ იქნება გაუქმებული.
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteDestination(destination.id)
                                }
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'იშლება...' : 'მარშრუტის წაშლა'}
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
                <TableCell colSpan={6} className="text-center">
                  {destinations.length === 0
                    ? 'მარშრუტები ვერ მოიძებნა'
                    : 'შესაბამისი მარშრუტები ვერ მოიძებნა'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
