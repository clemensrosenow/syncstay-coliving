'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

interface SearchFiltersProps {
  sort: string
  budgetMin: number
  budgetMax: number
  hideFull: boolean
}

const SORT_OPTIONS = [
  { value: 'compatibility', label: 'Compatibility' },
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
  { value: 'availability', label: 'Availability' },
]

const MIN_BUDGET = 500
const MAX_BUDGET = 5000

function formatBudgetLabel(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function SearchFilters({
  sort,
  budgetMin,
  budgetMax,
  hideFull,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [budgetRange, setBudgetRange] = useState<[number, number]>([budgetMin, budgetMax])

  const updateSearchParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)

    const nextQuery = params.toString()
    const nextUrl = nextQuery ? `/search?${nextQuery}` : '/search'

    startTransition(() => {
      router.replace(nextUrl)
    })
  }, [router, searchParams, startTransition])

  useEffect(() => {
    const currentBudgetMin = searchParams.get('budgetMin')
    const currentBudgetMax = searchParams.get('budgetMax')

    if (
      currentBudgetMin === String(budgetRange[0]) &&
      currentBudgetMax === String(budgetRange[1])
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      updateSearchParams((params) => {
        params.set('budgetMin', String(budgetRange[0]))
        params.set('budgetMax', String(budgetRange[1]))
      })
    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [budgetRange, searchParams, updateSearchParams])

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Sort by
        </label>
        <Select
          value={sort}
          onValueChange={(nextValue) => {
            updateSearchParams((params) => {
              params.set('sort', nextValue)
            })
          }}
        >
          <SelectTrigger className="w-full" disabled={isPending}>
            <SelectValue placeholder="Sort results" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-gray-700">
            Budget
          </label>
          <span className="text-xs text-gray-500">
            {formatBudgetLabel(budgetRange[0])} - {formatBudgetLabel(budgetRange[1])}/mo
          </span>
        </div>
        <Slider
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={50}
          value={budgetRange}
          onValueChange={(value) => setBudgetRange([value[0], value[1]])}
          disabled={isPending}
        />
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="hide-full"
          checked={hideFull}
          onCheckedChange={(checked) => {
            updateSearchParams((params) => {
              params.set('hideFull', checked === true ? 'true' : 'false')
            })
          }}
          disabled={isPending}
        />
        <label
          htmlFor="hide-full"
          className="text-sm font-medium leading-none text-gray-700"
        >
          Hide full pods
        </label>
      </div>
    </div>
  )
}
