import { type ActiveUserContext, type BookingCtaContent, type PodCondition, type PropertyDetailMember } from './types'

export function parseMonthParam(value: string | string[] | undefined) {
  const monthValue = Array.isArray(value) ? value[0] : value

  if (!monthValue || !/^\d{4}-\d{2}$/.test(monthValue)) {
    return null
  }

  return monthValue
}

export function toMonthValue(value: Date | string) {
  if (value instanceof Date) {
    const year = value.getUTCFullYear()
    const month = String(value.getUTCMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  return value.slice(0, 7)
}

export function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function calculateAge(birthday: Date | string | null) {
  if (!birthday) {
    return null
  }

  const birthDate = birthday instanceof Date ? birthday : new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }

  return age
}

export function clampMatchPercentage(score: number) {
  const percentage = Math.round(Math.min(Math.max(score, 0), 1) * 100)
  return percentage > 0 ? percentage : null
}

export function getPodCondition({
  memberCount,
  status,
}: {
  memberCount: number
  status: 'OPEN' | 'LOCKED' | 'FULL'
}): PodCondition {
  if (status === 'FULL') {
    return 'FULL'
  }

  if (status === 'LOCKED') {
    return 'LOCKED'
  }

  if (memberCount === 0) {
    return 'EMPTY'
  }

  return 'OPEN'
}

export function formatPreferenceLabel(value: string | null) {
  if (!value) {
    return null
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatWorkHours(startHour: number | null, endHour: number | null) {
  if (startHour === null || endHour === null) {
    return null
  }

  const formatHour = (hour: number) => {
    const normalizedHour = ((hour % 24) + 24) % 24
    const suffix = normalizedHour >= 12 ? 'PM' : 'AM'
    const hourOnClock = normalizedHour % 12 || 12
    return `${hourOnClock} ${suffix}`
  }

  return `${formatHour(startHour)} - ${formatHour(endHour)}`
}

export function getMemberInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function getCompatibilitySummary({
  activeUser,
  members,
  matchScore,
  monthLabel,
}: {
  activeUser: ActiveUserContext | null
  members: PropertyDetailMember[]
  matchScore: number | null
  monthLabel: string
}) {
  if (members.length === 0) {
    return `${monthLabel} is still open. You would set the first tone for this pod.`
  }

  if (!activeUser) {
    return `Sign in to see how your work rhythm and lifestyle align with this ${monthLabel} pod.`
  }

  const memberNames = members.slice(0, 2).map((member) => member.name.split(' ')[0])
  const overlapTags = Array.from(
    new Set(
      members.flatMap((member) => member.tags.filter((tag) => activeUser.tags.includes(tag)))
    )
  ).slice(0, 2)
  const sharesChronotype = members.some(
    (member) => member.chronotype && member.chronotype === activeUser.chronotype
  )
  const sharesWorkStyle = members.some(
    (member) => member.workStyle && member.workStyle === activeUser.workStyle
  )

  const affinityBits: string[] = []

  if (overlapTags.length > 0) {
    affinityBits.push(`shared interests like ${overlapTags.join(' and ')}`)
  }

  if (sharesChronotype) {
    affinityBits.push('a similar daily rhythm')
  }

  if (sharesWorkStyle) {
    affinityBits.push('compatible work styles')
  }

  const intro =
    memberNames.length > 1
      ? `${memberNames.join(' and ')} are already in this pod.`
      : `${memberNames[0]} is already in this pod.`

  if (affinityBits.length > 0) {
    return `${intro} Your profile suggests ${affinityBits.join(', ')}.`
  }

  if (matchScore !== null && matchScore >= 80) {
    return `${intro} This looks like a strong overall fit for your current preferences.`
  }

  return `${intro} You would bring a complementary profile to this group as the pod takes shape.`
}

export function getBookingCtaContent(selectedPod: {
  condition: PodCondition
  monthLabel: string
  memberCount: number
  membersNeededToLock: number
} | null): BookingCtaContent {
  if (!selectedPod) {
    return {
      title: 'Choose your month',
      body: 'Pick a month to enable booking.',
      buttonLabel: 'Select a month',
      disabled: true,
    }
  }

  if (selectedPod.condition === 'EMPTY') {
    return {
      title: 'Start this pod',
      body: 'Your commitment starts the pod. Booking opens once enough members join.',
      buttonLabel: 'Commit to pod',
      disabled: false,
    }
  }

  if (selectedPod.condition === 'OPEN') {
    return {
      title: 'Join this pod',
      body: `${selectedPod.membersNeededToLock} more ${
        selectedPod.membersNeededToLock === 1 ? 'person' : 'people'
      } need to commit before booking opens for this pod.`,
      buttonLabel: 'Commit to pod',
      disabled: false,
    }
  }

  if (selectedPod.condition === 'LOCKED') {
    return {
      title: 'Book your room',
      body: `${selectedPod.memberCount} members have committed, so booking is now open.`,
      buttonLabel: 'Book room',
      disabled: false,
    }
  }

  return {
    title: 'This month is full',
    body: 'Choose another month to continue.',
    buttonLabel: 'Choose another month',
    disabled: true,
  }
}
