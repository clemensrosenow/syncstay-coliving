'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { useComboboxAnchor } from '@/components/ui/combobox'
import { FieldGroup } from '@/components/ui/field'

import SearchDestinationField from './components/SearchDestinationField'
import SearchMonthField from './components/SearchMonthField'
import SearchSubmitButton from './components/SearchSubmitButton'
import {
  filterGroupedLocations,
  groupLocationsByCountry,
  searchFormSchema,
  type SearchFormValues,
} from './lib/search-ui'
import { type AvailableLocation, type AvailableMonth } from './lib/types'

interface SearchUIProps {
  availableLocations: AvailableLocation[]
  availableMonths: AvailableMonth[]
}

export default function SearchUI({ availableLocations, availableMonths }: SearchUIProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chipsRef = useComboboxAnchor()

  const defaultMonth = availableMonths[0]?.value || ''
  const [locationQuery, setLocationQuery] = useState('')
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      locations: searchParams.getAll('location'),
      month: searchParams.get('month') || defaultMonth,
    },
  })

  useEffect(() => {
    form.reset({
      locations: searchParams.getAll('location'),
      month: searchParams.get('month') || defaultMonth,
    })
  }, [defaultMonth, form, searchParams])

  const selectedLocations = useWatch({
    control: form.control,
    name: 'locations',
  }) ?? []

  const handleSearch = (values: SearchFormValues) => {
    const params = new URLSearchParams()
    values.locations.forEach((location) => params.append('location', location))
    if (values.month) {
      params.append('month', values.month)
    }
    router.push(`/search?${params.toString()}`)
  }

  const availableLocationsBySlug = new Map(
    availableLocations.map((location) => [location.slug, location])
  )
  const selectedLocationItems = selectedLocations
    .map((slug) => availableLocationsBySlug.get(slug))
    .filter((location): location is AvailableLocation => Boolean(location))

  const groupedLocationEntries = useMemo(
    () => groupLocationsByCountry(availableLocations),
    [availableLocations]
  )
  const filteredGroupedLocations = useMemo(
    () => filterGroupedLocations(groupedLocationEntries, locationQuery),
    [groupedLocationEntries, locationQuery]
  )

  return (
    <Card className="mx-auto mb-8 w-full max-w-5xl rounded-3xl p-6">
      <form onSubmit={form.handleSubmit(handleSearch)}>
        <FieldGroup className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_auto] lg:items-end">
          <SearchDestinationField
            control={form.control}
            selectedLocations={selectedLocations}
            selectedLocationItems={selectedLocationItems}
            groupedLocationEntries={groupedLocationEntries}
            filteredGroupedLocations={filteredGroupedLocations}
            locationQuery={locationQuery}
            setLocationQuery={setLocationQuery}
            chipsRef={chipsRef}
          />
          <SearchMonthField control={form.control} availableMonths={availableMonths} />
          <SearchSubmitButton />
        </FieldGroup>
      </form>
    </Card>
  )
}
