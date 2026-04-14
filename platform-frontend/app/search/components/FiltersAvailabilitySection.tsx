'use client'

import { Controller, type Control } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

import { type FiltersFormValues } from '../lib/search-filters'

interface FiltersAvailabilitySectionProps {
  control: Control<FiltersFormValues, unknown, FiltersFormValues>
  isPending: boolean
}

interface ToggleFieldProps {
  control: Control<FiltersFormValues, unknown, FiltersFormValues>
  name: 'onlyBookable' | 'showFullPods'
  id: string
  label: string
  isPending: boolean
}

function ToggleField({
  control,
  name,
  id,
  label,
  isPending,
}: ToggleFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          orientation="horizontal"
          data-invalid={fieldState.invalid}
        >
          <Checkbox
            id={id}
            checked={field.value}
            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            disabled={isPending}
            aria-invalid={fieldState.invalid}
            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <FieldLabel
            htmlFor={id}
          >
            {label}
          </FieldLabel>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

export default function FiltersAvailabilitySection({
  control,
  isPending,
}: FiltersAvailabilitySectionProps) {
  return (
    <div className="space-y-4 pt-3">
      <ToggleField
        control={control}
        name="onlyBookable"
        id="only-bookable"
        label="Instantly bookable"
        isPending={isPending}
      />
      <ToggleField
        control={control}
        name="showFullPods"
        id="show-full"
        label="Show full pods"
        isPending={isPending}
      />
    </div>
  )
}
