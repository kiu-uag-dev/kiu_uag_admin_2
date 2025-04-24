'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Destination, Schedule, Ticket } from '@/app/types/ticket-types';
import { TicketFilterBar } from './_components/TicketFilterBar';
import { TicketTable } from './_components/TicketTable';
import { TicketDetailsDialog } from './_components/TicketDetailsDialog';
import { AddTicketDialog } from './_components/AddTicketDialog';
import { EditTicketDialog } from './_components/EditTicketDialog';
import { 
  getTickets, 
  getTicketById, 
  getDestinations, 
  getSchedules, 
  createTicket, 
  updateTicket, 
  deleteTicket, 
  downloadTicket 
} from '@/app/services/admin_ticket.service';
import { downloadTicketsExcel } from '@/app/services/admin_excel.service';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TicketManagement() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [originalTicketData, setOriginalTicketData] = useState<Ticket | null>(
    null
  );

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDirection, setSelectedDirection] = useState<string>('all');

  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Dialog states
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    schedule_id: '',
    seat_number: '',
    passenger_name: '',
    passenger_surname: '',
    passenger_email: '',
    passenger_phone: '',
    purchaser_id: session?.user?.id || '',
    driver_id: '',
    schedule_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    schedule_id: '',
    seat_number: '',
    passenger_name: '',
    passenger_surname: '',
    passenger_email: '',
    passenger_phone: '',
    driver_id: '',
    purchaser_id: session?.user?.id || '',
    schedule_date: '',
  });

  // Update purchaser ID whenever session changes
  useEffect(() => {
    if (session?.user?.id) {
      setFormData((prev) => ({
        ...prev,
        purchaser_id: session.user.id,
      }));
    }
  }, [session]);

  // Fetch tickets data
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      setError('Error loading tickets');
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch destinations and schedules for filtering
  const fetchDestinationsAndSchedules = async () => {
    try {
      // Fetch destinations
      const destinationsData = await getDestinations();
      setDestinations(destinationsData);

      // Fetch schedules
      const schedulesData = await getSchedules();
      setSchedules(schedulesData);
    } catch (err) {
      console.error('Error loading filter data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDestinationsAndSchedules();
      await fetchTickets();
    };

    fetchData();
  }, []);

  // Calculate unique routes for filtering
  const uniqueRoutes =
    tickets && Array.isArray(tickets)
      ? Array.from(
          new Set(
            tickets.map(
              (ticket) =>
                `${ticket.schedule?.destination?.leaves_from}-${ticket.schedule?.destination?.arrives_to}`
            )
          )
        ).map((routeString) => {
          const [from, to] = routeString.split('-');
          return { from, to, value: routeString };
        })
      : [];

  // Apply filters to tickets
  const filteredTickets =
    tickets && Array.isArray(tickets)
      ? tickets.filter((ticket) => {
          // Skip tickets with missing properties
          if (!ticket || !ticket.schedule || !ticket.schedule.destination) {
            return false;
          }

          // Filter by search query
          const passengerFullName = `${ticket.passenger_name || ''} ${
            ticket.passenger_surname || ''
          }`.toLowerCase();
          const passengerEmail = (ticket.passenger_email || '').toLowerCase();
          const ticketId = ticket.id?.toString() || '';
          const query = searchQuery.toLowerCase();

          const matchesSearch =
            !searchQuery ||
            passengerFullName.includes(query) ||
            passengerEmail.includes(query) ||
            ticketId.includes(query);

          // Filter by date
          const matchesDate =
            !selectedDate ||
            ticket.schedule_date === format(selectedDate, 'yyyy-MM-dd');

          // Filter by route direction
          const ticketRoute = `${ticket.schedule.destination.leaves_from}-${ticket.schedule.destination.arrives_to}`;
          const matchesDirection =
            selectedDirection === 'all' || ticketRoute === selectedDirection;

          return matchesSearch && matchesDate && matchesDirection;
        })
      : [];

  // Download ticket
  const handleDownloadTicket = (ticketHash: string) => {
    setIsDownloading(true);
    try {
      // Create a link and trigger download
      const downloadUrl = downloadTicket(ticketHash);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `ticket-${ticketHash}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download started',
        description: 'Your ticket is being downloaded.',
      });
    } catch (err) {
      console.error('Error downloading ticket:', err);
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // View ticket details
  const handleViewTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDetailsOpen(true);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
    setSelectedDirection('all');
  };

  // Update handleEditClick to store the original data
  const handleEditClick = async (ticket: Ticket) => {
    try {
      setIsSubmitting(true);

      const ticketData = await getTicketById(ticket.id);

      // Store the original data for comparison later
      setOriginalTicketData(ticketData);

      // Populate the edit form
      setEditFormData({
        id: ticketData.id.toString(),
        schedule_id: ticketData.schedule_id.toString(),
        seat_number: ticketData.seat_number.toString(),
        passenger_name: ticketData.passenger_name,
        passenger_surname: ticketData.passenger_surname,
        passenger_email: ticketData.passenger_email,
        passenger_phone: ticketData.passenger_phone || '',
        driver_id: ticketData.driver_id ? ticketData.driver_id.toString() : '',
        purchaser_id: ticketData.purchaser_id.toString(),
        schedule_date: ticketData.schedule_date,
      });

      setIsEditDialogOpen(true);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      toast({
        title: 'Failed to load ticket',
        description: 'There was an error loading the ticket details.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create ticket
  const handleCreateTicket = async () => {
    try {
      setIsSubmitting(true);

      // Basic validation
      if (
        !formData.schedule_id ||
        !formData.seat_number ||
        !formData.passenger_name ||
        !formData.passenger_surname ||
        !formData.passenger_email ||
        !formData.schedule_date
      ) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      await createTicket(formData);

      // Refresh the tickets list
      await fetchTickets();

      // Show success toast
      toast({
        title: 'Ticket created',
        description: 'New ticket has been successfully added.',
      });

      // Reset form and close dialog
      setFormData({
        schedule_id: '',
        seat_number: '',
        passenger_name: '',
        passenger_surname: '',
        passenger_email: '',
        passenger_phone: '',
        purchaser_id: session?.user?.id || '',
        driver_id: '',
        schedule_date: format(new Date(), 'yyyy-MM-dd'),
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast({
        title: 'Create failed',
        description: 'There was an error creating the ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated handleSubmitEdit to only send changed fields
  // Updated handleSubmitEdit with null safety
  const handleSubmitEdit = async () => {
    try {
      setIsSubmitting(true);

      // Check if we have the original data
      if (!originalTicketData) {
        console.error('Original ticket data is missing');
        toast({
          title: 'Update error',
          description:
            'Could not compare with original ticket data. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Basic validation
      if (
        !editFormData.schedule_id ||
        !editFormData.seat_number ||
        !editFormData.passenger_name ||
        !editFormData.passenger_surname ||
        !editFormData.passenger_email ||
        !editFormData.schedule_date
      ) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Create an object to hold only the changed fields
      const changedFields: Record<string, any> = {};

      // Compare original and edited data to find changes
      const fieldComparisons = [
        {
          field: 'schedule_id',
          original: originalTicketData.schedule_id.toString(),
          current: editFormData.schedule_id,
          transform: (value: any) => value, // No transformation needed
        },
        {
          field: 'schedule_date',
          original: originalTicketData.schedule_date,
          current: editFormData.schedule_date,
          transform: (value: any) => value,
        },
        {
          field: 'seat_number',
          original: originalTicketData.seat_number.toString(),
          current: editFormData.seat_number,
          transform: (value: any) => value,
        },
        {
          field: 'passenger_name',
          original: originalTicketData.passenger_name,
          current: editFormData.passenger_name,
          transform: (value: any) => value,
        },
        {
          field: 'passenger_surname',
          original: originalTicketData.passenger_surname,
          current: editFormData.passenger_surname,
          transform: (value: any) => value,
        },
        {
          field: 'passenger_email',
          original: originalTicketData.passenger_email,
          current: editFormData.passenger_email,
          transform: (value: any) => value,
        },
        {
          field: 'passenger_phone',
          original: originalTicketData.passenger_phone || '',
          current: editFormData.passenger_phone,
          transform: (value: any) => value,
        },
        {
          field: 'driver_id',
          original: originalTicketData.driver_id
            ? originalTicketData.driver_id.toString()
            : '',
          current: editFormData.driver_id || '',
          transform: (value: any) => (value ? parseInt(value) : null),
        },
      ];

      // Check each field for changes using a more efficient approach
      fieldComparisons.forEach((comparison) => {
        if (comparison.original !== comparison.current) {
          changedFields[comparison.field] = comparison.transform(
            comparison.current
          );
        }
      });

      console.log('Sending only changed fields:', changedFields);

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: 'No changes',
          description: 'No changes were made to the ticket.',
        });
        setIsEditDialogOpen(false);
        setIsSubmitting(false);
        return;
      }

      await updateTicket(parseInt(editFormData.id), changedFields);

      // Refresh the tickets list
      await fetchTickets();

      // Show success toast
      toast({
        title: 'Ticket updated',
        description: 'Ticket has been successfully updated.',
      });

      // Close dialog
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (ticketId: number) => {
    try {
      setIsDeleting(true);
      
      await deleteTicket(ticketId);

      // Refresh the tickets list
      await fetchTickets();

      // Show success toast
      toast({
        title: 'Ticket deleted',
        description: 'Ticket has been successfully deleted.',
      });
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadTicketsExcel();
      toast({
        title: 'Excel ფაილი გადმოწერილია',
        description: 'ბილეთების მონაცემები წარმატებით გადმოწერილია Excel ფაილში.',
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
          ბილეთები
        </h3>
        <Card className="p-6">ბილეთები იტვირთება...</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          ბილეთები
        </h3>
        <Card className="p-6 text-red-500">{error}</Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font scroll-m-20 text-2xl font-semibold tracking-tight">
          ბილეთების მართვა
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

      {/* Filter component */}
      <TicketFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDirection={selectedDirection}
        setSelectedDirection={setSelectedDirection}
        uniqueRoutes={uniqueRoutes}
        resetFilters={resetFilters}
      />

      {/* Table component */}
      <TicketTable
        filteredTickets={filteredTickets}
        handleViewTicketDetails={handleViewTicketDetails}
        handleDownloadTicket={handleDownloadTicket}
        handleEditClick={handleEditClick}
        handleDeleteTicket={handleDeleteTicket}
        isDownloading={isDownloading}
        isDeleting={isDeleting}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />

      {/* View Details Dialog */}
      <TicketDetailsDialog
        isOpen={isViewDetailsOpen}
        setIsOpen={setIsViewDetailsOpen}
        selectedTicket={selectedTicket}
        handleDownloadTicket={handleDownloadTicket}
        isDownloading={isDownloading}
      />

      {/* Add Ticket Dialog */}
      <AddTicketDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        schedules={schedules}
        handleCreateTicket={handleCreateTicket}
        isSubmitting={isSubmitting}
      />

      {/* Edit Ticket Dialog */}
      <EditTicketDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        schedules={schedules}
        handleSubmitEdit={handleSubmitEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
