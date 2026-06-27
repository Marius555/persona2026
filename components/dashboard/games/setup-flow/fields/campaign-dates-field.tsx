"use client";

import {
  DateField,
  DateRangePicker,
  Description,
  Label,
  RangeCalendar,
} from "@heroui/react";
import { I18nProvider } from "react-aria-components";

import { campaignDateBounds, type DateRange } from "../../game-meta";
import { useVisitorLocale } from "./use-visitor-locale";

interface CampaignDatesFieldProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  error?: string;
}

/**
 * The campaign window — a HeroUI date-range picker (start → end) with a range
 * calendar popover. Past dates and dates more than a month out are disabled, so a
 * campaign starts today-or-later and runs at most a month. Wrapped in an I18nProvider
 * keyed to the visitor's locale so the date format matches their region.
 */
export function CampaignDatesField({
  value,
  onChange,
  error,
}: CampaignDatesFieldProps) {
  const locale = useVisitorLocale();
  const { min, max } = campaignDateBounds();

  return (
    <I18nProvider locale={locale}>
      <DateRangePicker
        aria-label="Campaign dates"
        value={value}
        onChange={onChange}
        minValue={min}
        maxValue={max}
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
          <RangeCalendar aria-label="Campaign dates" minValue={min} maxValue={max}>
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
                {(day) => (
                  <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                )}
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
    </I18nProvider>
  );
}
