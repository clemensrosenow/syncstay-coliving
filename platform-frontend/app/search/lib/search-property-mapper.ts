import {
  clampMatchPercentage,
  getPodSummary,
  isInstantlyBookableOrOneAway,
} from './utils'
import {
  type ParsedSearchParams,
  type PodRanking,
  type PodRankingMember,
  type PodStatus,
  type SearchProperty,
} from './types'

interface FetchedProperty {
  id: string
  locationId: string
  name: string
  description: string | null
  priceBaseCents: number
  photo: string | null
  minOccupancy: number
  totalRooms: number
  locationName: string | null
}

interface SearchPodSnapshot {
  status: PodStatus
  members: PodRankingMember[]
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

export function buildSearchProperties(input: {
  fetchedProperties: FetchedProperty[]
  rankingsByProperty: Map<string, PodRanking>
  podByPropertyAndMonth: Map<string, SearchPodSnapshot>
  searchMonthValue: string
  searchPodMonth: string
  selectedMonthLabel: string
  activeUserId: string | null
  parsedParams: ParsedSearchParams
}) {
  const {
    fetchedProperties,
    rankingsByProperty,
    podByPropertyAndMonth,
    searchMonthValue,
    searchPodMonth,
    selectedMonthLabel,
    activeUserId,
    parsedParams,
  } = input

  const mappedProperties = fetchedProperties.map((property) => {
    const bestRanking = rankingsByProperty.get(property.id)
    const podSnapshot = podByPropertyAndMonth.get(`${property.id}:${searchPodMonth}`)
    const podStatus = podSnapshot?.status ?? null
    const podMembers = podSnapshot?.members ?? []
    const podMemberCount = podMembers.length
    const spotsLeft =
      podStatus === 'FULL' ? 0 : Math.max(property.totalRooms - podMemberCount, 0)

    return {
      ...property,
      bookingMonth: searchMonthValue,
      podStatus,
      priceBase: Math.round(property.priceBaseCents / 100),
      matchScore: bestRanking ? clampMatchPercentage(bestRanking.match_score) : null,
      podMembers,
      podSummary: getPodSummary(
        podMemberCount,
        property.minOccupancy,
        selectedMonthLabel,
        Boolean(activeUserId)
      ),
      podMemberCount,
      spotsLeft,
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
