import {
  Briefcase,
  Clock3,
  Moon,
  PhoneCall,
  Sparkles,
  SunMedium,
} from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemSeparator, ItemTitle } from '@/components/ui/item'
import { Badge } from '@/components/ui/badge'
import PropertyBookingProgress from '@/lib/properties/PropertyBookingProgress'
import { getPodSummary } from '@/app/search/lib/utils'

import {
  formatWorkHours,
  formatPreferenceLabel,
  getMemberInitials,
} from '../lib/helpers'
import { type PropertyPodMonth } from '../lib/types'

interface PodMonthCardProps {
  pod: PropertyPodMonth
  minOccupancy: number
  totalRooms: number
  isSignedIn: boolean
  activeUserTags: string[]
}

const chronotypeIcon = {
  EARLY_BIRD: SunMedium,
  STANDARD: Clock3,
  NIGHT_OWL: Moon,
} as const

const workStyleIcon = {
  DEEP_FOCUS: Briefcase,
  MIXED: Sparkles,
  MOSTLY_CALLS: PhoneCall,
  LIGHT: Clock3,
} as const

export default function PodMonthCard({ pod, minOccupancy, totalRooms, isSignedIn, activeUserTags }: PodMonthCardProps) {
  const searchProperty = {
    id: pod.podId,
    name: '',
    description: null,
    photo: null,
    minOccupancy,
    totalRooms,
    locationName: null,
    bookingMonth: pod.monthValue,
    podStatus: pod.status,
    priceBase: 0,
    matchScore: pod.matchScore,
    podMembers: pod.members.map((m) => ({ name: m.name, score: 0, image: m.image })),
    podSummary: getPodSummary(pod.memberCount, minOccupancy, pod.monthLabel, isSignedIn),
    podMemberCount: pod.memberCount,
    spotsLeft: pod.spotsLeft,
  } as const

  return (
    <article className="rounded-2xl border border-stone-200 bg-white px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">{pod.monthLabel}</h3>
        </div>
        {pod.matchScore !== null ? (
          <Badge variant="secondary">{pod.matchScore}% match</Badge>
        ) : null}
      </div>

      <PropertyBookingProgress property={searchProperty} isSignedIn={isSignedIn} displayMode="text" />

      <p className="text-muted-foreground  text-sm leading-6 -mt-2 mb-4">
        {pod.compatibilitySummary}
      </p>

      {pod.members.length > 0 ? (
        <div>
          {pod.members.map((member, index) => {
            const ChronotypeIcon = member.chronotype ? chronotypeIcon[member.chronotype as keyof typeof chronotypeIcon] : null
            const WorkStyleIcon = member.workStyle ? workStyleIcon[member.workStyle as keyof typeof workStyleIcon] : null
            const workHours = formatWorkHours(member.workStartHour, member.workEndHour)
            const locationParts = [member.city, member.country].filter(Boolean).join(', ')
            const jobLocation = [member.job, locationParts ? `from ${locationParts}` : null].filter(Boolean).join(' ')

            return (
              <>
                {index > 0 ? <ItemSeparator key={`sep-${member.userId}`} /> : null}
                <Item key={`${pod.podId}-${member.userId}`} className="!px-0 rounded-none items-start">
                  <ItemMedia variant="image">
                    <Link href={`/account/profile/${member.userId}`}>
                      <Avatar className="border border-stone-200 size-10">
                        <AvatarImage src={member.image ?? undefined} alt={member.name} />
                        <AvatarFallback className="bg-stone-100 font-semibold text-stone-600 text-sm">
                          {getMemberInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='items-baseline gap-2'>
                      <Link href={`/account/profile/${member.userId}`} className="hover:underline">
                        {member.name}
                      </Link>
                      <span className="text-xs font-normal text-stone-400">{member.age}</span>
                    </ItemTitle>
                    <ItemDescription>{jobLocation}</ItemDescription>
                    <ItemDescription className="line-clamp-2 mt-1.5 text-xs italic">{member.bio}</ItemDescription>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ChronotypeIcon ? (
                        <Badge variant="outline">
                          <ChronotypeIcon size={10} />
                          {formatPreferenceLabel(member.chronotype)}
                        </Badge>
                      ) : null}
                      {workHours ? (
                        <Badge variant="outline">
                          <Clock3 size={10} />
                          {workHours}
                        </Badge>
                      ) : null}
                      {WorkStyleIcon ? (
                        <Badge variant="outline">
                          <WorkStyleIcon size={10} />
                          {formatPreferenceLabel(member.workStyle)}
                        </Badge>
                      ) : null}
                      {member.tags.slice(0, 3).map((tag) => (
                        <Badge key={`${member.userId}-${tag}`} variant={activeUserTags.includes(tag) ? 'secondary' : 'outline'}>{tag}</Badge>
                      ))}
                    </div>
                    {member.compatibilityNote ? (
                      <p className="text-muted-foreground mt-3 text-xs leading-5">{member.compatibilityNote}</p>
                    ) : null}
                  </ItemContent>
                </Item>
              </>
            )
          })}
        </div>
      ) : null}
    </article>
  )
}
