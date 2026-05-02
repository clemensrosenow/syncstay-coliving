export interface PropertyDetailPageProps {
  params: Promise<{ propertyId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface PropertyDetailProperty {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  locationName: string
  locationSlug: string
  country: string
  totalRooms: number
  minOccupancy: number
  pricePerRoom: number
  amenities: string[]
}

export type PodCondition = 'EMPTY' | 'OPEN' | 'LOCKED' | 'FULL'

export interface PropertyDetailMember {
  userId: string
  name: string
  image: string | null
  age: number | null
  bio: string | null
  job: string | null
  city: string | null
  country: string | null
  chronotype: string | null
  workStartHour: number | null
  workEndHour: number | null
  workStyle: string | null
  tags: string[]
  status: 'PENDING' | 'CONFIRMED'
  compatibilityNote: string | null
}

export interface ActiveUserContext {
  chronotype: string | null
  workStyle: string | null
  tags: string[]
}

export interface PropertyAvailableMonth {
  value: string
  label: string
}

export interface PropertyPodMonth {
  monthValue: string
  monthLabel: string
  podId: string
  status: 'OPEN' | 'LOCKED' | 'FULL'
  condition: PodCondition
  memberCount: number
  membersNeededToLock: number
  spotsLeft: number
  matchScore: number | null
  members: PropertyDetailMember[]
  compatibilitySummary: string
}

export interface PropertyDetailData {
  property: PropertyDetailProperty
  pods: PropertyPodMonth[]
  availableMonths: PropertyAvailableMonth[]
  flights: PropertyFlight[]
  activeUserId: string | null
  activeUserContext: ActiveUserContext | null
  selectedMonthValue: string | null
  selectedPod: PropertyPodMonth | null
  hasExplicitMonthSelection: boolean
}

export interface BookingCtaContent {
  title: string
  body: string
  buttonLabel: string
  disabled: boolean
}

export interface PropertyFlight {
  id: string
  origin: string
  destination: string
  airline: string
  priceEuros: number
  durationHours: number
  stops: number
}
