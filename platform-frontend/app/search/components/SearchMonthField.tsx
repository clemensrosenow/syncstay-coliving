'use client'

import { Controller, type Control } from 'react-hook-form'
import { Calendar } from 'lucide-react'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { type SearchFormValues } from '../lib/search-ui'
import { type AvailableMonth } from '../lib/types'

interface SearchMonthFieldProps {
  control: Control<SearchFormValues>
  availableMonths: AvailableMonth[]
}

export default function SearchMonthField({
  control,
  availableMonths,
}: SearchMonthFieldProps) {
  return (
    <Controller
      name="month"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="min-w-0 gap-3">
          <FieldLabel className="flex items-baseline gap-2">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="text-primary" /> Travel Month
            </span>
          </FieldLabel>
          <Select value={field.value} onValueChange={field.onChange} name={field.name}>
            <SelectTrigger
              className="h-auto min-h-11 w-full"
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent position="popper">
              {availableMonths.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
