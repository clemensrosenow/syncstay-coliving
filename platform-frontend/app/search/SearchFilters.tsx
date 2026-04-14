'use client'

import { useCallback, useEffect, useMemo, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'

import FiltersAvailabilitySection from './components/FiltersAvailabilitySection'
import FiltersBudgetField from './components/FiltersBudgetField'
import FiltersSortField from './components/FiltersSortField'
import { FieldGroup } from '@/components/ui/field'
import {
  searchFiltersSchema,
  type FiltersFormValues,
  type SearchFilterSortValue,
} from './lib/search-filters'

interface SearchFiltersProps {
  sort: SearchFilterSortValue
  budgetMin: number
  budgetMax: number
  showFullPods: boolean
  onlyBookable: boolean
}

export default function SearchFilters({
  sort,
  budgetMin,
  budgetMax,
  showFullPods,
  onlyBookable,
}: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FiltersFormValues, unknown, FiltersFormValues>({
    resolver: zodResolver(searchFiltersSchema),
    defaultValues: {
      sort,
      budgetRange: [budgetMin, budgetMax],
      showFullPods,
      onlyBookable,
    },
  })

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
    form.reset({
      sort,
      budgetRange: [budgetMin, budgetMax],
      showFullPods,
      onlyBookable,
    })
  }, [budgetMax, budgetMin, form, onlyBookable, showFullPods, sort])

  const watchedSort = useWatch({
    control: form.control,
    name: 'sort',
  }) ?? sort
  const watchedBudgetRangeValue = useWatch({
    control: form.control,
    name: 'budgetRange',
  })
  const watchedBudgetRange = useMemo<[number, number]>(
    () => watchedBudgetRangeValue ?? [budgetMin, budgetMax],
    [budgetMax, budgetMin, watchedBudgetRangeValue]
  )
  const watchedOnlyBookable = useWatch({
    control: form.control,
    name: 'onlyBookable',
  }) ?? onlyBookable
  const watchedShowFullPods = useWatch({
    control: form.control,
    name: 'showFullPods',
  }) ?? showFullPods

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.set('sort', watchedSort)
      nextParams.set('budgetMin', String(watchedBudgetRange[0]))
      nextParams.set('budgetMax', String(watchedBudgetRange[1]))

      if (watchedOnlyBookable) {
        nextParams.set('onlyBookable', 'true')
      } else {
        nextParams.delete('onlyBookable')
      }

      if (watchedShowFullPods) {
        nextParams.set('showFullPods', 'true')
      } else {
        nextParams.delete('showFullPods')
      }

      if (nextParams.toString() === searchParams.toString()) {
        return
      }

      updateSearchParams((params) => {
        params.set('sort', watchedSort)
        params.set('budgetMin', String(watchedBudgetRange[0]))
        params.set('budgetMax', String(watchedBudgetRange[1]))

        if (watchedOnlyBookable) {
          params.set('onlyBookable', 'true')
        } else {
          params.delete('onlyBookable')
        }

        if (watchedShowFullPods) {
          params.set('showFullPods', 'true')
        } else {
          params.delete('showFullPods')
        }
      })
    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [
    searchParams,
    updateSearchParams,
    watchedBudgetRange,
    watchedOnlyBookable,
    watchedShowFullPods,
    watchedSort,
  ])

  return (
    <form>
      <FieldGroup>
        <FiltersSortField control={form.control} isPending={isPending} />
        <FiltersBudgetField control={form.control} isPending={isPending} />
        <FiltersAvailabilitySection control={form.control} isPending={isPending} />
      </FieldGroup>
    </form>
  )
}
