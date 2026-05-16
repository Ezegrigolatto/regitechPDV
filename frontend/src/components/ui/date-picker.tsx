'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  onDateChange?: (date: Date) => void;
  defaultDate?: Date;
  value?: Date;
  timePicker?: React.ReactNode;
  mode?: 'card' | 'popover';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  onDateChange,
  defaultDate,
  value,
  timePicker,
  mode = 'card',
  placeholder = 'Seleccionar fecha',
  disabled,
  className,
}: DatePickerProps) {
  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultDate ??
      (mode === 'card'
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 12)
        : undefined)
  );
  const [open, setOpen] = React.useState(false);

  const date = isControlled ? value : internalDate;

  const handleDateChange = (selectedDate: Date) => {
    if (!isControlled) setInternalDate(selectedDate);
    onDateChange?.(selectedDate);
    if (mode === 'popover') setOpen(false);
  };

  if (mode === 'popover') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-44 justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {date ? format(date, 'dd/MM/yyyy') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            required
          />
          {timePicker && <div className="border-t p-3">{timePicker}</div>}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card className={cn('mx-auto w-fit', className)}>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          className="p-0"
          required
        />
      </CardContent>
      {timePicker && <CardFooter className="border-t bg-card">{timePicker}</CardFooter>}
    </Card>
  );
}
