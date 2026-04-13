import { Suspense } from 'react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { MapPin, Users, ArrowRight, Sparkles } from 'lucide-react'
import { and, eq, inArray } from 'drizzle-orm'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/db/drizzle'
import { amenities, locations, pods, properties, propertyAmenities } from '@/db/schema'
import { auth } from '@/lib/auth'

import SearchFilters from './SearchFilters'
import SearchUI from './SearchUI'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface PodRankingMember {
  name: string
  age?: number | null
  bio?: string | null
  chronotype?: string | null
  work_style?: string | null
  tags: string[]
  score: number
}

interface PodRanking {
  property_id: string
  location_id: string
  month: string
  pod_id: string | null
  property_name: string
  match_score: number
  explanation: string
  members: PodRankingMember[]
}

interface RankPodsResponse {
  rankings: PodRanking[]
}

const SORT_OPTIONS = ['compatibility', 'price-asc', 'price-desc', 'availability'] as const
type SortOption = (typeof SORT_OPTIONS)[number]
type PodStatus = 'OPEN' | 'LOCKED' | 'FULL' | null

const MIN_BUDGET = 500
const MAX_BUDGET = 5000
const AI_BACKEND_URL = process.env.AI_BACKEND_URL ?? 'http://127.0.0.1:8000'

function parseBoundedNumber(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(max, Math.max(min, parsed))
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  const date = new Date(year, month - 1, 1)

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function clampMatchPercentage(score: number) {
  const percentage = Math.round(Math.min(Math.max(score, 0), 1) * 100)

  return percentage > 0 ? percentage : null
}

function buildPodSummary(ranking: PodRanking | null, monthValue: string, isSignedIn: boolean) {
  const monthLabel = formatMonthLabel(monthValue)

  if (!ranking) {
    return isSignedIn
      ? `Live pod insights are temporarily unavailable for ${monthLabel}.`
      : `Sign in to unlock AI pod matching and live housemate previews for ${monthLabel}.`
  }

  if (ranking.members.length === 0) {
    return `${monthLabel} is still open. You could be the first to anchor this pod.`
  }

  const visibleNames = ranking.members.slice(0, 2).map((member) => member.name)
  const extraCount = ranking.members.length - visibleNames.length
  const namesLabel =
    extraCount > 0 ? `${visibleNames.join(', ')} +${extraCount} more` : visibleNames.join(' and ')

  return `${ranking.members.length} pending ${
    ranking.members.length === 1 ? 'member' : 'members'
  } for ${monthLabel}: ${namesLabel}.`
}

function pickBestRankingForProperty(
  rankings: PodRanking[],
  monthPriority: Map<string, number>
) {
  return rankings.reduce<PodRanking | null>((bestRanking, candidate) => {
    if (!bestRanking) {
      return candidate
    }

    if (candidate.match_score !== bestRanking.match_score) {
      return candidate.match_score > bestRanking.match_score ? candidate : bestRanking
    }

    if (candidate.members.length !== bestRanking.members.length) {
      return candidate.members.length > bestRanking.members.length ? candidate : bestRanking
    }

    const candidatePriority = monthPriority.get(candidate.month) ?? Number.MAX_SAFE_INTEGER
    const bestPriority = monthPriority.get(bestRanking.month) ?? Number.MAX_SAFE_INTEGER

    return candidatePriority < bestPriority ? candidate : bestRanking
  }, null)
}

async function fetchRankedPods(input: {
  activeUserId: string
  locationIds: string[]
  months: string[]
}) {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/api/rank-pods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        active_user_id: input.activeUserId,
        location_ids: input.locationIds,
        months: input.months,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch pod rankings:', response.status, errorText)
      return []
    }

    const data = (await response.json()) as RankPodsResponse
    return data.rankings
  } catch (error) {
    console.error('Failed to fetch pod rankings:', error)
    return []
  }
}

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.searchParams

  let locationFilters: string[] = []
  if (params.location) {
    locationFilters = Array.isArray(params.location) ? params.location : [params.location]
  }

  let monthFilters: string[] = []
  if (params.month) {
    monthFilters = Array.isArray(params.month) ? params.month : [params.month]
  }

  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort
  const selectedSort: SortOption = SORT_OPTIONS.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : 'compatibility'
  const budgetMinParam = Array.isArray(params.budgetMin) ? params.budgetMin[0] : params.budgetMin
  const budgetMaxParam = Array.isArray(params.budgetMax) ? params.budgetMax[0] : params.budgetMax
  const hideFullParam = Array.isArray(params.hideFull) ? params.hideFull[0] : params.hideFull
  const selectedBudgetMin = parseBoundedNumber(
    budgetMinParam,
    MIN_BUDGET,
    MIN_BUDGET,
    MAX_BUDGET
  )
  const selectedBudgetMax = parseBoundedNumber(
    budgetMaxParam,
    MAX_BUDGET,
    MIN_BUDGET,
    MAX_BUDGET
  )
  const normalizedBudgetMin = Math.min(selectedBudgetMin, selectedBudgetMax)
  const normalizedBudgetMax = Math.max(selectedBudgetMin, selectedBudgetMax)
  const hideFullPods = hideFullParam === undefined ? true : hideFullParam !== 'false'
  const hasActiveSearch = locationFilters.length > 0 || monthFilters.length > 0

  const allLocationsRaw = await db.select().from(locations)
  const availableLocations = allLocationsRaw.map((location) => ({
    name: location.name,
    slug: location.slug,
  }))
  const locationIdsBySlug = new Map(allLocationsRaw.map((location) => [location.slug, location.id]))

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

  const searchMonthValues = monthFilters.length > 0 ? monthFilters : [availableMonths[0].value]
  const searchPodMonths = Array.from(
    new Set(searchMonthValues.map((monthValue) => `${monthValue}-01`))
  )
  const monthPriority = new Map(searchPodMonths.map((monthValue, index) => [monthValue, index]))

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
    locationSlug: string | null
  }> = []

  if (hasActiveSearch) {
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
        locationSlug: locations.slug,
      })
      .from(properties)
      .leftJoin(locations, eq(properties.locationId, locations.id))

    if (locationFilters.length > 0) {
      fetchedProperties = await query.where(inArray(locations.slug, locationFilters))
    } else {
      fetchedProperties = await query
    }
  }

  const propertyIds = fetchedProperties.map((property) => property.id)

  const [amenityRows, podRows, session] = await Promise.all([
    propertyIds.length > 0
      ? db
          .select({
            propertyId: propertyAmenities.propertyId,
            amenityLabel: amenities.label,
          })
          .from(propertyAmenities)
          .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
          .where(inArray(propertyAmenities.propertyId, propertyIds))
      : Promise.resolve([]),
    propertyIds.length > 0
      ? db
          .select({
            propertyId: pods.propertyId,
            month: pods.month,
            status: pods.status,
          })
          .from(pods)
          .where(and(inArray(pods.propertyId, propertyIds), inArray(pods.month, searchPodMonths)))
      : Promise.resolve([]),
    auth.api.getSession({
      headers: new Headers(await headers()),
    }),
  ])

  const activeUserId = session?.user?.id ?? null
  const requestedLocationIds = locationFilters
    .map((slug) => locationIdsBySlug.get(slug))
    .filter((locationId): locationId is string => Boolean(locationId))

  const podRankings =
    hasActiveSearch && activeUserId
      ? await fetchRankedPods({
          activeUserId,
          locationIds: requestedLocationIds,
          months: searchPodMonths,
        })
      : []

  const rankingsByProperty = podRankings.reduce<Map<string, PodRanking[]>>((map, ranking) => {
    const currentRankings = map.get(ranking.property_id) ?? []
    currentRankings.push(ranking)
    map.set(ranking.property_id, currentRankings)
    return map
  }, new Map())

  const amenitiesByProperty = amenityRows.reduce<Map<string, string[]>>((map, row) => {
    const currentAmenities = map.get(row.propertyId) ?? []
    currentAmenities.push(row.amenityLabel)
    map.set(row.propertyId, currentAmenities)
    return map
  }, new Map())

  const podStatusByPropertyAndMonth = podRows.reduce<Map<string, PodStatus>>((map, pod) => {
    map.set(`${pod.propertyId}:${pod.month}`, pod.status)
    return map
  }, new Map())

  const sortedProperties = fetchedProperties
    .map((property) => {
      const bestRanking = pickBestRankingForProperty(
        rankingsByProperty.get(property.id) ?? [],
        monthPriority
      )
      const bookingMonth = bestRanking?.month.slice(0, 7) ?? searchMonthValues[0]
      const bookingPodMonth = bestRanking?.month ?? `${bookingMonth}-01`
      const podStatus =
        podStatusByPropertyAndMonth.get(`${property.id}:${bookingPodMonth}`) ?? null
      const podMemberCount = bestRanking?.members.length ?? 0
      const computedSpotsLeft =
        podStatus === 'FULL' ? 0 : Math.max(property.totalRooms - podMemberCount, 0)

      return {
        ...property,
        bookingMonth,
        podStatus,
        priceBase: Math.round(property.priceBaseCents / 100),
        matchScore: bestRanking ? clampMatchPercentage(bestRanking.match_score) : null,
        matchExplanation:
          bestRanking?.explanation ??
          (activeUserId
            ? 'This stay still fits your filters while live pod matching catches up.'
            : 'Sign in to unlock AI-ranked pods and personalized roommate insights.'),
        podSummary: buildPodSummary(bestRanking, bookingMonth, Boolean(activeUserId)),
        podMemberCount,
        spotsLeft: computedSpotsLeft,
        ctaLabel:
          podStatus === 'LOCKED'
            ? 'Book Pod'
            : podMemberCount > 0
              ? 'Join Pod'
              : 'Start Pod',
        amenityLabels: (amenitiesByProperty.get(property.id) ?? []).slice(0, 4),
      }
    })
    .filter((property) => {
      const isWithinBudget =
        property.priceBase >= normalizedBudgetMin &&
        property.priceBase <= normalizedBudgetMax
      const passesAvailabilityFilter = !hideFullPods || property.podStatus !== 'FULL'

      return isWithinBudget && passesAvailabilityFilter
    })
    .sort((a, b) => {
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

  const hasSelectedMonths = monthFilters.length > 0
  const selectedMonthLabels = monthFilters.map(formatMonthLabel)

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center text-center">
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-gray-900 mb-4">
            Find your Premium Stay
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Tell us when and where, and we&apos;ll show you to your matching pod.
          </p>

          <Suspense fallback={<Skeleton className="w-full max-w-4xl h-48 rounded-3xl" />}>
            <SearchUI
              availableLocations={availableLocations}
              availableMonths={availableMonths}
            />
          </Suspense>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!hasActiveSearch ? (
          <Card className="border border-dashed border-gray-200 bg-white shadow-sm">
            <CardContent className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Start your search</h2>
              <p className="mx-auto mt-3 max-w-2xl text-gray-500">
                Pick a destination, a travel month, or both to explore available pods curated for your next stay.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Co-Living Spaces
              </h2>
              <p className="text-gray-500 mt-1">
                {sortedProperties.length} {sortedProperties.length === 1 ? 'property' : 'properties'} found for{' '}
                {hasSelectedMonths ? `${selectedMonthLabels.join(', ')}` : 'your criteria'}.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-64 flex-shrink-0">
                <Card className="sticky top-24 border border-gray-100 shadow-sm">
                  <CardContent className="p-5">
                    <SearchFilters
                      key={`${selectedSort}-${normalizedBudgetMin}-${normalizedBudgetMax}-${hideFullPods}`}
                      sort={selectedSort}
                      budgetMin={normalizedBudgetMin}
                      budgetMax={normalizedBudgetMax}
                      hideFull={hideFullPods}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1">
                <div className="grid md:grid-cols-2 gap-6">
                  {sortedProperties.map((property) => (
                    <div key={property.id} className="transition-all duration-500 opacity-100 translate-y-0">
                      <Link href={`/properties/${property.id}?month=${property.bookingMonth}`}>
                        <Card className="h-full overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col group pt-0">
                          <div className="h-48 relative overflow-hidden bg-gray-200">
                            {property.photo ? (
                              <img
                                src={property.photo}
                                alt={property.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="absolute bottom-3 left-3">
                              <Badge variant="secondary" className="bg-white/90 backdrop-blur text-gray-900 border-none font-semibold">
                                {property.spotsLeft > 0
                                  ? `${property.spotsLeft} spots left`
                                  : 'Pod is full'}
                              </Badge>
                            </div>

                            {property.matchScore !== null && (
                              <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="bg-white/90 backdrop-blur text-blue-700 flex items-center gap-1 border-none shadow-sm font-semibold">
                                  <Sparkles size={12} className="text-blue-500" />
                                  {property.matchScore}% match
                                </Badge>
                              </div>
                            )}
                          </div>

                          <CardContent className="p-5 flex-1 flex flex-col">
                            <h3 className="font-display font-bold text-lg text-gray-900 mb-1 line-clamp-1">{property.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                              <MapPin size={14} className="text-blue-500" />
                              {property.locationName}
                            </p>
                            <p className="text-sm leading-6 text-gray-600 line-clamp-3">
                              {property.description ?? 'Thoughtfully designed for long stays, meaningful routines, and a pod that feels easy to join.'}
                            </p>

                            {property.amenityLabels.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {property.amenityLabels.map((amenityLabel) => (
                                  <Badge
                                    key={amenityLabel}
                                    variant="secondary"
                                    className="border border-blue-100 bg-blue-50 text-blue-700"
                                  >
                                    {amenityLabel}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="p-3 rounded-xl mb-4 text-sm mt-6 bg-gray-50 border border-gray-100 text-gray-600">
                              <p className="flex gap-2 items-start leading-snug">
                                <Users size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>{property.matchExplanation}</span>
                              </p>
                              <p className="mt-2 text-xs leading-5 text-gray-500">
                                {property.podSummary}
                              </p>
                            </div>

                            <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-4 text-sm font-medium">
                              <span className="text-base font-semibold text-gray-900">
                                {property.priceBase} €/mo
                              </span>
                              <span className="text-blue-600 flex items-center gap-1 group-hover:px-1 transition-all">
                                {property.ctaLabel} <ArrowRight size={14} />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}

                  {sortedProperties.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-gray-500 pb-4">No properties found for these locations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
