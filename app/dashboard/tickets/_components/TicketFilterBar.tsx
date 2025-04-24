// src/components/TicketFilterBar.tsx
'use client';

import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, CalendarIcon } from 'lucide-react';
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
import { FilterBarProps } from '@/app/types/ticket-types';

export const TicketFilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDate,
  setSelectedDate,
  selectedDirection,
  setSelectedDirection,
  uniqueRoutes,
  resetFilters,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="pt-0 text-lg">ბილეთების ფილტრი</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="მოძებნე სახელით, გვარით, იმეილით"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          {/* Date filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`justify-start text-left font-normal ${
                  !selectedDate ? 'text-muted-foreground' : ''
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, 'PPP')
                  : 'გაფილტრე თარიღით'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Direction filter */}
          <Select
            value={selectedDirection}
            onValueChange={(value) => setSelectedDirection(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="გაფილტრე მარშრუტით" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ყველა მარშრუტი</SelectItem>
              {uniqueRoutes.map((route) => (
                <SelectItem key={route.value} value={route.value}>
                  {route.from} ➝ {route.to}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset filters button */}
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            გასუფთავება
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
