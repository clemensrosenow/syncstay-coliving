import { headers } from 'next/headers'
import { and, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { locations, pods, properties } from '@/db/schema'
import { auth } from '@/lib/auth'
import { rankPods } from '@/lib/data/rank-pods'

import {
  type ParsedSearchParams,
  type PodRanking,
  type RankPodsResponse,
  type SearchPageData,
  type SearchProperty,
  type PodStatus,
} from './types'
import {
  clampMatchPercentage,
  formatMonthLabel,
  getPodSummary,
  isInstantlyBookableOrOneAway,
} from './utils'

async function fetchRankedPods(input: {
  activeUserId: string
  locationIds: string[]
  month: string
}) {
  try {
    const data: RankPodsResponse = await rankPods(input)
    return data.rankings
  } catch (error) {
    console.error('Failed to fetch pod rankings:', error)
    return []
  }
}

function sortProperties(
  propertiesToSort: SearchProperty[],
  selectedSort: ParsedSearchParams['selectedSort']
) {
  return [...propertiesToSort].sort((a, b) => {
    switch (selectedSort) {
      case 'price-asc':
        return a.priceBase - b.priceBase
      case 'price-desc':
        return b.priceBase - a.priceBase
      case 'availability':
        if (b.spotsLeft !== a.spotsLeft) {
          return b.spotsLeft - a.spotsLeft
        }
        return (b.matchScore ?? -1) - (a.matchScore ?? -1)
      case 'compatibility':
      default:
        if ((b.matchScore ?? -1) !== (a.matchScore ?? -1)) {
          return (b.matchScore ?? -1) - (a.matchScore ?? -1)
        }

        if (a.podMemberCount !== b.podMemberCount) {
          return b.podMemberCount - a.podMemberCount
        }

        return a.priceBase - b.priceBase
    }
  })
}

function buildSearchProperties(input: {
  fetchedProperties: Array<{
    id: string
    locationId: string
    name: string
    description: string | null
    priceBaseCents: number
    photo: string | null
    minOccupancy: number
    totalRooms: number
    locationName: string | null
  }>
  rankingsByProperty: Map<string, PodRanking>
  podStatusByPropertyAndMonth: Map<string, PodStatus>
  searchMonthValue: string
  searchPodMonth: string
  selectedMonthLabel: string
  activeUserId: string | null
  parsedParams: ParsedSearchParams
}) {
  const {
    fetchedProperties,
    rankingsByProperty,
    podStatusByPropertyAndMonth,
    searchMonthValue,
    searchPodMonth,
    selectedMonthLabel,
    activeUserId,
    parsedParams,
  } = input

  const mappedProperties = fetchedProperties.map((property) => {
    const bestRanking = rankingsByProperty.get(property.id)
    const podStatus =
      podStatusByPropertyAndMonth.get(`${property.id}:${searchPodMonth}`) ?? null
    const podMemberCount = bestRanking?.members.length ?? 0
    const spotsLeft =
      podStatus === 'FULL' ? 0 : Math.max(property.totalRooms - podMemberCount, 0)

    return {
      ...property,
      bookingMonth: searchMonthValue,
      podStatus,
      priceBase: Math.round(property.priceBaseCents / 100),
      matchScore: bestRanking ? clampMatchPercentage(bestRanking.match_score) : null,
      podMembers: bestRanking?.members ?? [],
      podSummary: getPodSummary(
        podMemberCount,
        property.minOccupancy,
        selectedMonthLabel,
        Boolean(activeUserId)
      ),
      podMemberCount,
      spotsLeft,
      ctaLabel: 'View Property',
    }
  })

  const filteredProperties = mappedProperties.filter((property) => {
    const isWithinBudget =
      property.priceBase >= parsedParams.normalizedBudgetMin &&
      property.priceBase <= parsedParams.normalizedBudgetMax

    const passesAvailabilityFilter =
      parsedParams.showFullPods || property.podStatus !== 'FULL'
    const passesBookableFilter =
      !parsedParams.onlyBookable ||
      isInstantlyBookableOrOneAway({
        podStatus: property.podStatus,
        podMemberCount: property.podMemberCount,
        minOccupancy: property.minOccupancy,
      })

    return isWithinBudget && passesAvailabilityFilter && passesBookableFilter
  })

  return sortProperties(filteredProperties, parsedParams.selectedSort)
}

export async function getSearchPageData(
  parsedParams: ParsedSearchParams
): Promise<SearchPageData> {
  const allLocationsRaw = await db.select().from(locations)
  const availableLocations = allLocationsRaw.map((location) => ({
    name: location.name,
    slug: location.slug,
    country: location.country,
  }))
  const locationIdsBySlug = new Map(
    allLocationsRaw.map((location) => [location.slug, location.id])
  )

  const availableMonths = Array.from({ length: 9 }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() + index)

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    return {
      value,
      label: formatMonthLabel(value),
    }
  })

  const searchMonthValue = parsedParams.monthParam || availableMonths[0].value
  const searchPodMonth = `${searchMonthValue}-01`
  const selectedMonthLabel = formatMonthLabel(searchMonthValue)

  let fetchedProperties: Array<{
    id: string
    locationId: string
    name: string
    description: string | null
    priceBaseCents: number
    photo: string | null
    minOccupancy: number
    totalRooms: number
    locationName: string | null
  }> = []

  if (parsedParams.hasActiveSearch) {
    const query = db
      .select({
        id: properties.id,
        locationId: properties.locationId,
        name: properties.name,
        description: properties.description,
        priceBaseCents: properties.pricePerRoomCents,
        photo: properties.imageUrl,
        minOccupancy: properties.minOccupancy,
        totalRooms: properties.totalRooms,
        locationName: locations.name,
      })
      .from(properties)
      .leftJoin(locations, eq(properties.locationId, locations.id))

    fetchedProperties =
      parsedParams.locationFilters.length > 0
        ? await query.where(inArray(locations.slug, parsedParams.locationFilters))
        : await query
  }

  const propertyIds = fetchedProperties.map((property) => property.id)

  const [podRows, session] = await Promise.all([
    propertyIds.length > 0
      ? db
        .select({
          propertyId: pods.propertyId,
          month: pods.month,
          status: pods.status,
        })
        .from(pods)
        .where(and(inArray(pods.propertyId, propertyIds), eq(pods.month, searchPodMonth)))
      : Promise.resolve([]),
    auth.api.getSession({
      headers: new Headers(await headers()),
    }),
  ])

  const activeUserId = session?.user?.id ?? null
  const requestedLocationIds = parsedParams.locationFilters
    .map((slug) => locationIdsBySlug.get(slug))
    .filter((locationId): locationId is string => Boolean(locationId))

  const podRankings =
    parsedParams.hasActiveSearch && activeUserId
      ? await fetchRankedPods({
        activeUserId,
        locationIds: requestedLocationIds,
        month: searchPodMonth,
      })
      : []

  const rankingsByProperty = new Map(
    podRankings.map((ranking) => [ranking.property_id, ranking])
  )

  const podStatusByPropertyAndMonth = podRows.reduce<Map<string, PodStatus>>((map, pod) => {
    map.set(`${pod.propertyId}:${pod.month}`, pod.status)
    return map
  }, new Map())

  return {
    availableLocations,
    availableMonths,
    hasActiveSearch: parsedParams.hasActiveSearch,
    selectedMonthLabel,
    filters: {
      selectedSort: parsedParams.selectedSort,
      normalizedBudgetMin: parsedParams.normalizedBudgetMin,
      normalizedBudgetMax: parsedParams.normalizedBudgetMax,
      showFullPods: parsedParams.showFullPods,
      onlyBookable: parsedParams.onlyBookable,
    },
    properties: buildSearchProperties({
      fetchedProperties,
      rankingsByProperty,
      podStatusByPropertyAndMonth,
      searchMonthValue,
      searchPodMonth,
      selectedMonthLabel,
      activeUserId,
      parsedParams,
    }),
    activeUserId,
  }
}
