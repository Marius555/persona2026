"use client";

import { getLocalTimeZone, today } from "@internationalized/date";
import {
  DateField,
  DateRangePicker,
  Description,
  Label,
  RangeCalendar,
} from "@heroui/react";

import type { DateRange } from "../../game-meta";

interface CampaignDatesFieldProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  error?: string;
}

/**
 * The campaign window — a HeroUI date-range picker (start → end) with a range
 * calendar popover. Past dates are disabled so a campaign can't start in the past.
 */
export function CampaignDatesField({
  value,
  onChange,
  error,
}: CampaignDatesFieldProps) {
  const minValue = today(getLocalTimeZone());

  return (
    <DateRangePicker
      aria-label="Campaign dates"
      value={value}
      onChange={onChange}
      minValue={minValue}
      isInvalid={!!error}
      className="w-full text-left"
    >
      <Label>Campaign dates</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover>
        <RangeCalendar aria-label="Campaign dates" minValue={minValue}>
          <RangeCalendar.Header>
            <RangeCalendar.YearPickerTrigger>
              <RangeCalendar.YearPickerTriggerHeading />
              <RangeCalendar.YearPickerTriggerIndicator />
            </RangeCalendar.YearPickerTrigger>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
          <RangeCalendar.YearPickerGrid>
            <RangeCalendar.YearPickerGridBody>
              {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
            </RangeCalendar.YearPickerGridBody>
          </RangeCalendar.YearPickerGrid>
        </RangeCalendar>
      </DateRangePicker.Popover>
      {error ? <Description className="text-danger">{error}</Description> : null}
    </DateRangePicker>
  );
}
