import { z } from 'zod'

import { type AvailableLocation } from './types'

export const searchFormSchema = z.object({
  locations: z.array(z.string()).nonempty('Select at least one location.'),
  month: z.string(),
})

export type SearchFormValues = z.infer<typeof searchFormSchema>

export interface GroupedLocationOption {
  country: string
  items: AvailableLocation[]
}

export function groupLocationsByCountry(
  availableLocations: AvailableLocation[]
): GroupedLocationOption[] {
  const groupedLocations = availableLocations.reduce((acc, location) => {
    if (!acc[location.country]) {
      acc[location.country] = []
    }
    acc[location.country].push(location)
    return acc
  }, {} as Record<string, AvailableLocation[]>)

  return Object.entries(groupedLocations)
    .sort(([countryA], [countryB]) => countryA.localeCompare(countryB))
    .map(([country, items]) => ({
      country,
      items,
    }))
}

export function filterGroupedLocations(
  groupedLocations: GroupedLocationOption[],
  query: string
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) {
    return groupedLocations
  }

  return groupedLocations
    .map((group) => ({
      ...group,
      items: group.items.filter((location) =>
        `${location.name} ${location.country}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      ),
    }))
    .filter((group) => group.items.length > 0)
}
