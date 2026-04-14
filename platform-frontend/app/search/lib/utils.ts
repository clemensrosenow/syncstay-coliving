import { Clock3, LockKeyhole, LogIn, UserPlus } from 'lucide-react'

import { MAX_BUDGET, MIN_BUDGET } from './constants'
import {
  type ParsedSearchParams,
  type PodStateDetails,
  type PodStatus,
  SORT_OPTIONS,
  type SortOption,
} from './types'

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function parseBoundedNumber(
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

export function parseSearchParams(
  params: { [key: string]: string | string[] | undefined }
): ParsedSearchParams {
  const locationParam = params.location
  const locationFilters = locationParam
    ? Array.isArray(locationParam)
      ? locationParam
      : [locationParam]
    : []

  const monthParam = getFirstParam(params.month)
  const sortParam = getFirstParam(params.sort)
  const budgetMinParam = getFirstParam(params.budgetMin)
  const budgetMaxParam = getFirstParam(params.budgetMax)
  const showFullParam = getFirstParam(params.showFullPods)
  const onlyBookableParam = getFirstParam(params.onlyBookable)

  const selectedSort: SortOption = SORT_OPTIONS.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : 'compatibility'

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

  return {
    locationFilters,
    monthParam,
    selectedSort,
    normalizedBudgetMin: Math.min(selectedBudgetMin, selectedBudgetMax),
    normalizedBudgetMax: Math.max(selectedBudgetMin, selectedBudgetMax),
    showFullPods: showFullParam === 'true',
    onlyBookable: onlyBookableParam === 'true',
    hasActiveSearch: locationFilters.length > 0 || Boolean(monthParam),
  }
}

export function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  const date = new Date(year, month - 1, 1)

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function clampMatchPercentage(score: number) {
  const percentage = Math.round(Math.min(Math.max(score, 0), 1) * 100)

  return percentage > 0 ? percentage : null
}

export function getMemberInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function getPodStateDetails({
  isSignedIn,
  memberCount,
  minOccupancy,
  spotsLeft,
  status,
}: {
  isSignedIn: boolean
  memberCount: number
  minOccupancy: number
  spotsLeft: number
  status: PodStatus
}): PodStateDetails {
  if (!isSignedIn) {
    return {
      icon: LogIn,
      title: 'Sign in for live housemates',
      meta: 'Private preview',
    }
  }

  if (memberCount === 0) {
    return {
      icon: UserPlus,
      title: 'Be the first member',
      meta: `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} open`,
    }
  }

  const needed = Math.max(0, minOccupancy - memberCount)
  if (status === 'LOCKED' || needed === 0) {
    return {
      icon: LockKeyhole,
      title: `${memberCount} ${memberCount === 1 ? 'member' : 'members'} confirmed`,
      meta: 'Ready to book',
    }
  }

  return {
    icon: Clock3,
    title: `${memberCount} ${memberCount === 1 ? 'member' : 'members'} joined`,
    meta: needed === 1 ? 'Almost unlocked' : `${needed} more to unlock`,
  }
}

export function getPodSummary(
  memberCount: number,
  minOccupancy: number,
  monthLabel: string,
  isSignedIn: boolean
) {
  if (!isSignedIn) {
    return `Unlock the ${monthLabel} pod.`
  }

  if (memberCount === 0) {
    return `Start the ${monthLabel} pod.`
  }

  const needed = Math.max(0, minOccupancy - memberCount)
  if (needed > 0) {
    return needed === 1 ? 'One more and it is on.' : `${needed} more to go.`
  }

  return 'Ready when you are.'
}

export function isInstantlyBookableOrOneAway({
  podStatus,
  podMemberCount,
  minOccupancy,
}: {
  podStatus: PodStatus
  podMemberCount: number
  minOccupancy: number
}) {
  if (podStatus === 'LOCKED') {
    return true
  }

  return Math.max(0, minOccupancy - podMemberCount) <= 1
}
