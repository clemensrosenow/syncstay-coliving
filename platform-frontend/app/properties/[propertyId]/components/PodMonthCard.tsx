import { Clock3, LockKeyhole, Sparkles, Users, UserPlus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import {
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

export default function PodMonthCard({ pod }: PodMonthCardProps) {
  const condition = conditionMap[pod.condition]
  const ConditionIcon = condition.icon

  return (
    <Card className="rounded-[1.75rem] border-white/70 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {pod.monthLabel}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {pod.memberCount === 0
                ? 'Ready for the first member'
                : `${pod.memberCount} ${pod.memberCount === 1 ? 'member' : 'members'} so far`}
            </h3>
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-500">Status</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{condition.label}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-500">Needed to lock</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{pod.membersNeededToLock}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-500">Rooms left</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{pod.spotsLeft}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0.95))] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Pod Overview
          </p>
          <p className="mt-2 text-base leading-7 text-slate-700">{pod.compatibilitySummary}</p>
        </div>

        <div className="mt-5 space-y-3">
          {pod.members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm text-slate-500">
              No members have joined this month yet.
            </div>
          ) : (
            pod.members.map((member) => {
              const preferences = [
                formatPreferenceLabel(member.chronotype),
                formatPreferenceLabel(member.workStyle),
              ].filter(Boolean)

              return (
                <div
                  key={`${pod.podId}-${member.userId}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
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
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {member.status.toLowerCase()}
                        </Badge>
                      </div>
                      {member.bio ? (
                        <p className="mt-1 text-sm leading-6 text-slate-600">{member.bio}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {preferences.map((preference) => (
                          <span
                            key={`${member.userId}-${preference}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {preference}
                          </span>
                        ))}
                        {member.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${member.userId}-${tag}`}
                            className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
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
      </CardContent>
    </Card>
  )
}
