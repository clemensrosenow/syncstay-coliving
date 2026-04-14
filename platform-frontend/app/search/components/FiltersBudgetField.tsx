'use client'

import { Controller, type Control } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'

import { MAX_BUDGET, MIN_BUDGET } from '../lib/constants'
import {
  formatBudgetLabel,
  type FiltersFormValues,
} from '../lib/search-filters'

interface FiltersBudgetFieldProps {
  control: Control<FiltersFormValues, unknown, FiltersFormValues>
  isPending: boolean
}

export default function FiltersBudgetField({
  control,
  isPending,
}: FiltersBudgetFieldProps) {
  return (
    <Controller
      name="budgetRange"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>
              Budget
            </FieldLabel>
            <span className="text-muted-foreground text-xs font-medium">
              {formatBudgetLabel(field.value[0])} - {formatBudgetLabel(field.value[1])}/mo
            </span>
          </div>
          <Slider
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={50}
            value={field.value}
            onValueChange={(value) => field.onChange([value[0], value[1]])}
            disabled={isPending}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
