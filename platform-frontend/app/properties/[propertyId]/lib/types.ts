export interface PropertyDetailPageProps {
  params: Promise<{ propertyId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export type PodCondition = 'EMPTY' | 'OPEN' | 'LOCKED' | 'FULL'

export interface PropertyDetailMember {
  userId: string
  name: string
  image: string | null
  age: number | null
  bio: string | null
  chronotype: string | null
  workStyle: string | null
  tags: string[]
  status: 'PENDING' | 'CONFIRMED'
}

export interface ActiveUserContext {
  chronotype: string | null
  workStyle: string | null
  tags: string[]
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
  property: {
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
  pods: PropertyPodMonth[]
  activeUserId: string | null
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
