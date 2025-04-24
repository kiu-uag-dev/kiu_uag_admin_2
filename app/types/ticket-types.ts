// src/types/ticket-types.ts

export interface Destination {
  id: number;
  leaves_from: string;
  arrives_to: string;
  bus_stops: string[];
  price: number;
}

export interface Schedule {
  id: number;
  destination_id: number;
  leave_time: string;
  arrive_time: string;
  created_at: string;
  updated_at: string;
  destination: Destination;
}

export interface Ticket {
  id: number;
  seat_number: number;
  schedule_id: number;
  passenger_name: string;
  passenger_surname: string;
  passenger_email: string;
  passenger_phone: string;
  purchaser_id: number;
  schedule_date: string;
  ticket_hash: string;
  validated_at: string | null;
  driver_id: number | null;
  payment_method: string;
  schedule: Schedule;
  price: number;
  status: string;
  time: string;
  language: string;
}

export interface RouteOption {
  from: string;
  to: string;
  value: string;
}

export interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedDirection: string;
  setSelectedDirection: (direction: string) => void;
  uniqueRoutes: RouteOption[];
  resetFilters: () => void;
}

export interface TicketTableProps {
  filteredTickets: Ticket[];
  handleViewTicketDetails: (ticket: Ticket) => void;
  handleDownloadTicket: (ticketHash: string) => void;
  handleEditClick: (ticket: Ticket) => void;
  handleDeleteTicket: (ticketId: number) => void;
  isDownloading: boolean;
  isDeleting: boolean;
  setIsAddDialogOpen: (isOpen: boolean) => void;
}

export interface TicketDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedTicket: Ticket | null;
  handleDownloadTicket: (ticketHash: string) => void;
  isDownloading: boolean;
}

export interface AddTicketDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formData: {
    schedule_id: string;
    seat_number: string;
    passenger_name: string;
    passenger_surname: string;
    passenger_email: string;
    passenger_phone: string;
    purchaser_id: string;
    driver_id: string;
    schedule_date: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      schedule_id: string;
      seat_number: string;
      passenger_name: string;
      passenger_surname: string;
      passenger_email: string;
      passenger_phone: string;
      driver_id: string;
      purchaser_id: string;
      schedule_date: string;
    }>
  >;
  schedules: Schedule[];
  handleCreateTicket: () => Promise<void>;
  isSubmitting: boolean;
}

export interface EditTicketDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editFormData: {
    id: string;
    schedule_id: string;
    seat_number: string;
    passenger_name: string;
    passenger_surname: string;
    passenger_email: string;
    passenger_phone: string;
    purchaser_id: string;
    driver_id: string;
    schedule_date: string;
  };
  setEditFormData: React.Dispatch<
    React.SetStateAction<{
      id: string;
      schedule_id: string;
      seat_number: string;
      passenger_name: string;
      passenger_surname: string;
      passenger_email: string;
      passenger_phone: string;
      purchaser_id: string;
      driver_id: string;
      schedule_date: string;
    }>
  >;
  schedules: Schedule[];
  handleSubmitEdit: () => Promise<void>;
  isSubmitting: boolean;
}
