"use client";

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, PlusCircle, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Status,
  StatusFormData,
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from '@/app/services/admin_status.service';

export default function StatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [formData, setFormData] = useState<StatusFormData>({
    name: '',
    name_ka: '',
    color: '#000000',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter statuses by name
  const filteredStatuses = statuses.filter((status) => {
    const name = status.name.toLowerCase();
    const nameKa = status.name_ka.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || nameKa.includes(query);
  });

  // Initialize the new status form with empty values
  const initNewStatusForm = () => {
    setFormData({
      name: '',
      name_ka: '',
      color: '#000000',
    });
  };

  // Fetch statuses data
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const data = await getStatuses();
      setStatuses(data);
    } catch (err) {
      setError('სტატუსების ჩატვირთვისას მოხდა შეცდომა');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Handle edit status
  const handleEditClick = (status: Status) => {
    setSelectedStatus(status);
    setFormData({
      name: status.name,
      name_ka: status.name_ka,
      color: status.color,
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

  // Submit status edit
  const handleSubmitEdit = async () => {
    if (!selectedStatus) return;

    try {
      setIsSubmitting(true);
      
      await updateStatus(selectedStatus.id, formData);
      
      // Refresh the statuses list
      await fetchStatuses();

      // Show success toast
      toast({
        title: 'სტატუსი განახლდა',
        description: 'სტატუსი წარმატებით განახლდა.',
      });

      // Reset form
      setSelectedStatus(null);
      setFormData({
        name: '',
        name_ka: '',
        color: '#000000',
      });
    } catch (err) {
      console.error('სტატუსის განახლებისას მოხდა შეცდომა:', err);
      toast({
        title: 'განახლება ვერ მოხერხდა',
        description: 'სტატუსის განახლებისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new status
  const handleCreateStatus = async () => {
    try {
      setIsSubmitting(true);
      
      await createStatus(formData);
      
      // Refresh the statuses list
      await fetchStatuses();

      // Show success toast
      toast({
        title: 'სტატუსი შეიქმნა',
        description: 'ახალი სტატუსი წარმატებით დაემატა.',
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        name_ka: '',
        color: '#000000',
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('სტატუსის შექმნისას მოხდა შეცდომა:', err);
      toast({
        title: 'შექმნა ვერ მოხერხდა',
        description: 'სტატუსის შექმნისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete status
  const handleDeleteStatus = async (statusId: number) => {
    try {
      setIsSubmitting(true);
      
      await deleteStatus(statusId);
      
      // Refresh the statuses list
      await fetchStatuses();

      // Show success toast
      toast({
        title: 'სტატუსი წაიშალა',
        description: 'სტატუსი წარმატებით წაიშალა.',
      });
    } catch (err) {
      console.error('სტატუსის წაშლისას მოხდა შეცდომა:', err);
      toast({
        title: 'წაშლა ვერ მოხერხდა',
        description: 'სტატუსის წაშლისას მოხდა შეცდომა.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          სტატუსები
        </h3>
        <Card className="p-6">სტატუსების ჩატვირთვა...</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          სტატუსები
        </h3>
        <Card className="p-6 text-red-500">{error}</Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
        სტატუსები
      </h3>
      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="relative w-1/3">
            <div className="relative">
              <Input
                type="text"
                placeholder="სტატუსის სახელით ძებნა..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  initNewStatusForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                დაამატე სტატუსი
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>დამატე ახალი სტატუსი</DialogTitle>
                <DialogDescription>
                  შეავსე ფორმა ქვემოთ დამატე ახალი სტატუსი.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    სტატუსი (ინგლისური)
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name_ka" className="text-right">
                    სტატუსი (ქართული)
                  </Label>
                  <Input
                    id="name_ka"
                    name="name_ka"
                    value={formData.name_ka}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    ფერი
                  </Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
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
                  onClick={handleCreateStatus}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'შექმნა...' : 'შექმნა'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>სტატუსი (ინგლისური)</TableHead>
              <TableHead>სტატუსი (ქართული)</TableHead>
              <TableHead>ფერი</TableHead>
              <TableHead className="text-right">მოქმედებები</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStatuses.length > 0 ? (
              filteredStatuses.map((status, index) => (
                <TableRow key={status.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{status.name}</TableCell>
                  <TableCell>{status.name_ka}</TableCell>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Edit Button and Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(status)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">რედაქტირება</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>რედაქტირება</DialogTitle>
                            <DialogDescription>
                              შეცვალეთ სტატუსის ინფორმაცია.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right">
                                სტატუსი (ინგლისური)
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name_ka" className="text-right">
                                სტატუსი (ქართული)
                              </Label>
                              <Input
                                id="name_ka"
                                name="name_ka"
                                value={formData.name_ka}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="color" className="text-right">
                                ფერი
                              </Label>
                              <Input
                                id="color"
                                name="color"
                                type="color"
                                value={formData.color}
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
                              {isSubmitting ? 'შენახვა...' : 'შენახვა'}
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
                                წაშლა
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                გსურს ამ სტატუსის წაშლა? სტატუსის აღდგენა შესაძლებელი არაა.
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteStatus(status.id)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'წაშლა...' : 'წაშლა'}
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
                <TableCell colSpan={5} className="text-center">
                  {statuses.length === 0
                    ? 'სტატუსები არ მოიძებნა' 
                    : 'შესაბამისი სტატუსი არ მოიძებნა'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 