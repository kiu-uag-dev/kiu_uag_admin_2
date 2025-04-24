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
import { Edit, Trash2, UserPlus, Search, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import {
  User,
  UserFormData,
  ROLE_TYPES,
  STATUS_TYPES,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getRoleLabel,
  getStatusLabel,
  getStatusColor,
  isEmailVerified,
} from '@/app/services/admin_user.service';
import { downloadUsersExcel } from '@/app/services/admin_excel.service';

export function TableInvoice() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'customer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatusChangeLoading, setIsStatusChangeLoading] = useState<
    number | null
  >(null);

  // Filter users by name or email
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

  // Initialize the new user form with empty values
  const initNewUserForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      role: 'customer',
      password: '',
      email_verified: false,
    });
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Error loading users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle edit user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      email_verified: user.email_verified_at !== null,
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

  // Handle role select change
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  // Handle email verified change
  const handleEmailVerifiedChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      email_verified: value === 'true',
    }));
  };

  // Toggle user status between active and inactive
  const handleToggleStatus = async (user: User) => {
    try {
      setIsStatusChangeLoading(user.id);

      await toggleUserStatus(user.id, !user.is_active);

      // Refresh the users list
      await fetchUsers();

      // Show success toast
      toast({
        title: 'Status updated',
        description: `User has been ${
          user.status_id === 1 ? 'deactivated' : 'activated'
        }.`,
      });
    } catch (err) {
      console.error('Error updating user status:', err);
      toast({
        title: 'Status update failed',
        description: 'There was an error updating the user status.',
        variant: 'destructive',
      });
    } finally {
      setIsStatusChangeLoading(null);
    }
  };

  // Submit user edit
  const handleSubmitEdit = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);

      await updateUser(selectedUser.id, formData);

      // Refresh the users list
      await fetchUsers();

      // Show success toast
      toast({
        title: 'User updated',
        description: 'User has been successfully updated.',
      });

      // Reset form
      setSelectedUser(null);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'customer',
      });
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);

      await createUser(formData);

      // Refresh the users list
      await fetchUsers();

      // Show success toast
      toast({
        title: 'User created',
        description: 'New user has been successfully added.',
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'customer',
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: 'Create failed',
        description: 'There was an error creating the user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    try {
      setIsSubmitting(true);

      await deleteUser(userId);

      // Refresh the users list
      await fetchUsers();

      // Show success toast
      toast({
        title: 'User deleted',
        description: 'User has been successfully deleted.',
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadUsersExcel();
      toast({
        title: 'Excel ფაილი გადმოწერილია',
        description:
          'მომხმარებლების მონაცემები წარმატებით გადმოწერილია Excel ფაილში.',
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
    return <Card className="p-6">მომხმარებლების ჩატვირთვა...</Card>;
  }

  if (error) {
    return <Card className="p-6 text-red-500">{error}</Card>;
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h3 className="font scroll-m-20 text-2xl font-semibold tracking-tight">
          მომხმარებლები
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
                placeholder="მოძებნე სახელით ან მეილით..."
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
                  initNewUserForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                მომხმარებლის დამატება
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>ახალი მომხმარებლის დამატება</DialogTitle>
                <DialogDescription>
                  შექმენი ახალი მომხმარებელი შემდეგი ფორმის შევსებით.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first_name" className="text-right">
                    სახელი
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_name" className="text-right">
                    გვარი
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    იმეილი
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone_number" className="text-right">
                    ტელეფონი
                  </Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    პაროლი
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    როლი
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.role || 'customer'}
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_TYPES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email_verified" className="text-right">
                    იმეილის ვერიფიკაცია
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.email_verified ? 'true' : 'false'}
                      onValueChange={handleEmailVerifiedChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="იმეილის ვერიფიცირების სტატუსი" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">დიახ</SelectItem>
                        <SelectItem value="false">არა</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  onClick={handleCreateUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'იქმნება...' : 'შექმნა'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>სახელი გვარი</TableHead>
              <TableHead>იმეილი</TableHead>
              <TableHead>ტელეფონი</TableHead>
              <TableHead>როლი</TableHead>
              <TableHead>სტატუსი</TableHead>
              <TableHead>იმეილის ვერიფიკაცია</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className="mr-2 h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(user.status_id),
                        }}
                      />
                      <span>{getStatusLabel(user.status_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {isEmailVerified(user) ? (
                        <>
                          <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                          <span>დიახ</span>
                        </>
                      ) : (
                        <>
                          <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
                          <span>არა</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Toggle Status Button */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleStatus(user)}
                        disabled={isStatusChangeLoading === user.id}
                        className={
                          user.status_id === 1
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-red-500 hover:text-red-600'
                        }
                      >
                        {isStatusChangeLoading === user.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : user.status_id === 1 ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                        )}
                        <span className="sr-only">
                          {user.status_id === 1 ? 'Deactivate' : 'Activate'}
                        </span>
                      </Button>

                      {/* Edit Button and Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              მომხმარებლის ინფორმაციის ცვლილება
                            </DialogTitle>
                            <DialogDescription>
                              შეცვალე მომხმარებლის ინფორმაცია შემდეგი ფორმის
                              შევსებით.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="first_name"
                                className="text-right"
                              >
                                სახელი
                              </Label>
                              <Input
                                id="first_name"
                                name="first_name"
                                value={formData.first_name || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="last_name" className="text-right">
                                გვარი
                              </Label>
                              <Input
                                id="last_name"
                                name="last_name"
                                value={formData.last_name || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="email" className="text-right">
                                იმეილი
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="phone_number"
                                className="text-right"
                              >
                                ტელეფონი
                              </Label>
                              <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number || ''}
                                onChange={handleChange}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="role" className="text-right">
                                როლი
                              </Label>
                              <div className="col-span-3">
                                <Select
                                  value={formData.role || ''}
                                  onValueChange={handleRoleChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLE_TYPES.map((role) => (
                                      <SelectItem
                                        key={role.value}
                                        value={role.value}
                                      >
                                        {role.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="email_verified"
                                className="text-right"
                              >
                                იმეილის ვერიფიკაცია
                              </Label>
                              <div className="col-span-3">
                                <Select
                                  value={
                                    formData.email_verified ? 'true' : 'false'
                                  }
                                  onValueChange={handleEmailVerifiedChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="იმეილის ვერიფიცირების სტატუსი" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">დიახ</SelectItem>
                                    <SelectItem value="false">არა</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
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
                              {isSubmitting ? 'ინახება...' : 'შენახვა'}
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
                                მომხმარებლის წაშლა
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                დარწმუნებული ხართ რომ გინდათ ამ მომხმარებლის
                                წაშლა? წაშლილი მომხმარებლის აღდგენა შეუძლებელია.
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'იშლება...' : 'წაშლა'}
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
                <TableCell colSpan={8} className="text-center">
                  {users.length === 0
                    ? 'არ არის მომხმარებლები'
                    : 'არ არის შესაბამისი მომხმარებელი'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
