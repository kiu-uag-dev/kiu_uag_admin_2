// src/components/TicketTable.tsx
'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  User,
  Download,
  PlusCircle,
} from 'lucide-react';
import { TicketTableProps } from '@/app/types/ticket-types';

// Helper functions for formatting
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

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

export const TicketTable: React.FC<TicketTableProps> = ({
  filteredTickets,
  handleViewTicketDetails,
  handleDownloadTicket,
  handleEditClick,
  handleDeleteTicket,
  isDownloading,
  isDeleting,
  setIsAddDialogOpen,
}) => {
  return (
    <Card>
      <div className="flex items-center justify-end p-4">
        {/* Add Ticket Button */}
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          ბილეთის დამატება
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">ID</TableHead>
            <TableHead>მგზავრი</TableHead>
            <TableHead>მარშრუტი</TableHead>
            <TableHead>თარიღი</TableHead>
            <TableHead>ადგილი</TableHead>
            <TableHead>სტატუსი</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {ticket.passenger_name} {ticket.passenger_surname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.passenger_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {ticket.schedule.destination.leaves_from} ➝{' '}
                      {ticket.schedule.destination.arrives_to}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      თანხა: {ticket.schedule.destination.price} ₾
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {formatDate(ticket.schedule_date)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(ticket.schedule.leave_time)} -{' '}
                      {formatTime(ticket.schedule.arrive_time)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.seat_number}</Badge>
                </TableCell>
                <TableCell>
                  {ticket.validated_at ? (
                    <Badge className="border-green-300 bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> ვალიდური
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-yellow-300 bg-yellow-50 text-yellow-800"
                    >
                      <XCircle className="mr-1 h-3 w-3" /> ლოდინი
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicketDetails(ticket)}
                    >
                      <User className="h-4 w-4" />
                    </Button>

                    {/* Download Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTicket(ticket.ticket_hash)}
                      disabled={isDownloading}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(ticket)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">
                              ბილეთის წაშლა
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              დარწმუნებული ხართ რომ გინდათ ამ ბილეთის წაშლა?
                              წაშლილი ბილეთის აღდგენა შეუძლებელია.
                            </p>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteTicket(ticket.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'იშლება...' : 'წაშლა'}
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
              <TableCell colSpan={7} className="py-8 text-center">
                {filteredTickets.length === 0
                  ? 'No tickets found'
                  : 'No matching tickets found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
