"use client";

import type { DateValue } from "@internationalized/date";
import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  Label,
} from "@heroui/react";

interface EventDateStepProps {
  value: DateValue | null;
  onChange: (v: DateValue | null) => void;
  error?: string;
}

/** A HeroUI date + time picker (calendar popover) — replaces the native input. */
export function EventDateStep({ value, onChange, error }: EventDateStepProps) {
  return (
    <DatePicker
      granularity="minute"
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      className="w-full text-left"
    >
      <Label>Date &amp; time</Label>
      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
      {error ? (
        <Description className="text-danger">{error}</Description>
      ) : null}
    </DatePicker>
  );
}
