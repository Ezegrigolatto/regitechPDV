'use client';

import * as React from 'react';
import { Clock2Icon } from 'lucide-react';
import { Field, FieldGroup } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

interface TimePickerProps {
  defaultValue?: string; // "HH:MM:SS"
  onChange?: (time: string) => void;
}

export function TimePicker({ defaultValue = '12:00:00', onChange }: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <FieldGroup>
      <Field>
        <InputGroup>
          <InputGroupInput
            type="time"
            step="1"
            defaultValue={defaultValue}
            onChange={handleChange}
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <Clock2Icon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </FieldGroup>
  );
}