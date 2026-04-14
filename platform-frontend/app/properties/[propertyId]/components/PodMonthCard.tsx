import {
  Briefcase,
  Clock3,
  LockKeyhole,
  Moon,
  PhoneCall,
  Sparkles,
  SunMedium,
  Users,
  UserPlus,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import {
  formatWorkHours,
  formatPreferenceLabel,
  getMemberInitials,
} from '../lib/helpers'
import { type PropertyPodMonth } from '../lib/types'

interface PodMonthCardProps {
  pod: PropertyPodMonth
}

const conditionMap = {
  EMPTY: {
    label: 'Empty pod',
    accent: 'bg-emerald-50 text-emerald-800',
    icon: UserPlus,
  },
  OPEN: {
    label: 'Not filled yet',
    accent: 'bg-amber-50 text-amber-900',
    icon: Clock3,
  },
  LOCKED: {
    label: 'Locked',
    accent: 'bg-sky-50 text-sky-800',
    icon: LockKeyhole,
  },
  FULL: {
    label: 'Not bookable',
    accent: 'bg-slate-200 text-slate-700',
    icon: Users,
  },
} as const

const memberStatusMap = {
  PENDING: {
    label: 'Pending',
    icon: Clock3,
    className: 'bg-amber-100 text-amber-900',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: LockKeyhole,
    className: 'bg-emerald-100 text-emerald-800',
  },
} as const

const chronotypeMap = {
  EARLY_BIRD: {
    icon: SunMedium,
    className: 'bg-amber-50 text-amber-900',
  },
  STANDARD: {
    icon: Clock3,
    className: 'bg-sky-50 text-sky-800',
  },
  NIGHT_OWL: {
    icon: Moon,
    className: 'bg-indigo-50 text-indigo-800',
  },
} as const

const workStyleMap = {
  DEEP_FOCUS: {
    icon: Briefcase,
    className: 'bg-emerald-50 text-emerald-800',
  },
  MIXED: {
    icon: Sparkles,
    className: 'bg-violet-50 text-violet-800',
  },
  MOSTLY_CALLS: {
    icon: PhoneCall,
    className: 'bg-rose-50 text-rose-800',
  },
  LIGHT: {
    icon: Clock3,
    className: 'bg-cyan-50 text-cyan-800',
  },
} as const

export default function PodMonthCard({ pod }: PodMonthCardProps) {
  const condition = conditionMap[pod.condition]
  const ConditionIcon = condition.icon

  return (
    <article className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">{pod.monthLabel}</h3>
          <p className="mt-1 text-sm text-slate-500">{pod.memberCount === 0
              ? 'Ready for the first member'
              : `${pod.memberCount} ${pod.memberCount === 1 ? 'member' : 'members'} so far`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={`${condition.accent} border-0 px-3 py-1`}>
            <ConditionIcon size={14} />
            {condition.label}
          </Badge>
          {pod.matchScore !== null ? (
            <Badge className="border-0 bg-sky-100 px-3 py-1 text-sky-800 hover:bg-sky-100">
              <Sparkles size={14} />
              {pod.matchScore}% match
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{condition.label}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm font-medium text-slate-500">Needed to lock</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{pod.membersNeededToLock}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm font-medium text-slate-500">Rooms left</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{pod.spotsLeft}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <p className="text-sm font-semibold text-sky-700">Pod Overview</p>
        <p className="mt-2 text-base leading-7 text-slate-700">{pod.compatibilitySummary}</p>
      </div>

      <div className="mt-5 space-y-3">
        {pod.members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm text-slate-500">
            No members have joined this month yet.
          </div>
        ) : (
          pod.members.map((member) => {
            const bookingStatus = memberStatusMap[member.status]
            const BookingStatusIcon = bookingStatus.icon
            const chronotype = member.chronotype ? chronotypeMap[member.chronotype] : null
            const ChronotypeIcon = chronotype?.icon
            const workStyle = member.workStyle ? workStyleMap[member.workStyle] : null
            const WorkStyleIcon = workStyle?.icon
            const workHours = formatWorkHours(member.workStartHour, member.workEndHour)

            return (
              <div
                key={`${pod.podId}-${member.userId}`}
                className="rounded-2xl bg-slate-50 px-4 py-4"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="size-11 border border-slate-200">
                    <AvatarImage src={member.image ?? undefined} alt={member.name} />
                    <AvatarFallback className="bg-sky-100 font-semibold text-sky-700">
                      {getMemberInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">{member.name}</p>
                      {member.age ? (
                        <span className="text-sm text-slate-500">{member.age}</span>
                      ) : null}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${bookingStatus.className}`}
                      >
                        <BookingStatusIcon size={12} />
                        {bookingStatus.label}
                      </span>
                    </div>
                    {member.bio ? (
                      <p className="mt-1 text-sm leading-6 text-slate-600">{member.bio}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ChronotypeIcon && chronotype ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${chronotype.className}`}
                        >
                          <ChronotypeIcon size={12} />
                          {formatPreferenceLabel(member.chronotype)}
                        </span>
                      ) : null}
                      {workHours ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                          <Clock3 size={12} />
                          {workHours}
                        </span>
                      ) : null}
                      {WorkStyleIcon && workStyle ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${workStyle.className}`}
                        >
                          <WorkStyleIcon size={12} />
                          {formatPreferenceLabel(member.workStyle)}
                        </span>
                      ) : null}
                      {member.tags.slice(0, 3).map((tag) => (
                        <span
                          key={`${member.userId}-${tag}`}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </article>
  )
}
