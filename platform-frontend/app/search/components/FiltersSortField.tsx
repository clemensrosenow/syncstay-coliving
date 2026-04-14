'use client'

import { Controller, type Control } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  type FiltersFormValues,
  SEARCH_FILTER_SORT_OPTIONS,
} from '../lib/search-filters'

interface FiltersSortFieldProps {
  control: Control<FiltersFormValues, unknown, FiltersFormValues>
  isPending: boolean
}

export default function FiltersSortField({
  control,
  isPending,
}: FiltersSortFieldProps) {
  return (
    <Controller
      name="sort"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="space-y-2">
          <FieldLabel>
            Sort by
          </FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className="h-10 w-full"
              disabled={isPending}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder="Sort results" />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_FILTER_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
