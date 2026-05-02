import { type LucideIcon } from 'lucide-react'

export interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface AvailableLocation {
  name: string
  slug: string
  country: string
}

export interface AvailableMonth {
  value: string
  label: string
}

export interface PodRankingMember {
  name: string
  score: number
  image: string | null
}

export interface PodRanking {
  property_id: string
  location_id: string
  month: string
  pod_id: string | null
  property_name: string
  match_score: number
  members: PodRankingMember[]
}

export interface RankPodsRequest {
  activeUserId: string
  locationIds: string[]
  month: string
  excludeUserId?: string
}

export interface RankPodsResponse {
  rankings: PodRanking[]
}

export const SORT_OPTIONS = [
  'compatibility',
  'price-asc',
  'price-desc',
  'availability',
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]
export type PodStatus = 'OPEN' | 'LOCKED' | 'FULL' | null

export interface SearchFiltersState {
  selectedSort: SortOption
  normalizedBudgetMin: number
  normalizedBudgetMax: number
  showFullPods: boolean
  onlyBookable: boolean
}

export interface ParsedSearchParams extends SearchFiltersState {
  locationFilters: string[]
  monthParam?: string
  hasActiveSearch: boolean
}

export interface PodStateDetails {
  icon: LucideIcon
  title: string
  meta: string
}

export interface SearchProperty {
  id: string
  name: string
  description: string | null
  photo: string | null
  minOccupancy: number
  totalRooms: number
  locationName: string | null
  bookingMonth: string
  podStatus: PodStatus
  priceBase: number
  matchScore: number | null
  podMembers: PodRankingMember[]
  podSummary: string
  podMemberCount: number
  spotsLeft: number
}

export interface SearchPageData {
  availableLocations: AvailableLocation[]
  availableMonths: AvailableMonth[]
  hasActiveSearch: boolean
  selectedMonthLabel: string
  filters: SearchFiltersState
  properties: SearchProperty[]
  activeUserId: string | null
}
