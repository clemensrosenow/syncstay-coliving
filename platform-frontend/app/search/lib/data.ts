import { headers } from 'next/headers'
import { and, eq, inArray } from 'drizzle-orm'

import { users } from '@/auth-schema'
import { db } from '@/db/drizzle'
import { locations, podMembers, pods, properties } from '@/db/schema'
import { auth } from '@/lib/auth'
import { rankPods } from '@/lib/data/rank-pods'

import {
  type ParsedSearchParams,
  type RankPodsResponse,
  type SearchPageData,
} from './types'
import { formatMonthLabel } from './utils'
import { buildSearchProperties } from './search-property-mapper'

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
          id: pods.id,
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
  const podIds = podRows.map((pod) => pod.id)

  const memberRows =
    podIds.length > 0
      ? await db
        .select({
          podId: podMembers.podId,
          propertyId: pods.propertyId,
          month: pods.month,
          name: users.name,
          image: users.image,
          joinedAt: podMembers.joinedAt,
        })
        .from(podMembers)
        .innerJoin(pods, eq(pods.id, podMembers.podId))
        .innerJoin(users, eq(users.id, podMembers.userId))
        .where(
          and(
            inArray(podMembers.podId, podIds),
            inArray(podMembers.status, ['PENDING', 'CONFIRMED'])
          )
        )
      : []

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

  const podByPropertyAndMonth = podRows.reduce<
    Map<
      string,
      {
        status: (typeof podRows)[number]['status']
        members: Array<{ name: string; image: string | null; score: number }>
      }
    >
  >((map, pod) => {
    map.set(`${pod.propertyId}:${pod.month}`, {
      status: pod.status,
      members: [],
    })
    return map
  }, new Map())

  const sortedMemberRows = [...memberRows].sort(
    (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
  )

  for (const member of sortedMemberRows) {
    const podSnapshot = podByPropertyAndMonth.get(`${member.propertyId}:${member.month}`)

    if (!podSnapshot) {
      continue
    }

    podSnapshot.members.push({
      name: member.name,
      image: member.image,
      score: 0,
    })
  }

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
      podByPropertyAndMonth,
      searchMonthValue,
      searchPodMonth,
      selectedMonthLabel,
      activeUserId,
      parsedParams,
    }),
    activeUserId,
  }
}
