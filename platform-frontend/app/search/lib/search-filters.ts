import { z } from 'zod'

import { MAX_BUDGET, MIN_BUDGET } from './constants'
import { type SortOption } from './types'

export const SEARCH_FILTER_SORT_OPTIONS = [
  { value: 'compatibility', label: 'Compatibility' },
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
  { value: 'availability', label: 'Availability' },
] as const

const sortValues = SEARCH_FILTER_SORT_OPTIONS.map((option) => option.value) as [
  (typeof SEARCH_FILTER_SORT_OPTIONS)[number]['value'],
  ...(typeof SEARCH_FILTER_SORT_OPTIONS)[number]['value'][]
]

export const searchFiltersSchema = z.object({
  sort: z.enum(sortValues),
  budgetRange: z
    .tuple([
      z.number().min(MIN_BUDGET).max(MAX_BUDGET),
      z.number().min(MIN_BUDGET).max(MAX_BUDGET),
    ])
    .refine(([min, max]) => min <= max, {
      message: 'Minimum budget must be lower than maximum budget.',
    }),
  showFullPods: z.boolean(),
  onlyBookable: z.boolean(),
})

export type FiltersFormValues = z.infer<typeof searchFiltersSchema>
export type SearchFilterSortValue = SortOption

export function formatBudgetLabel(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}
