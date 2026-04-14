import Link from 'next/link'

import { Badge } from '@/components/ui/badge'

import { type PropertyPodMonth } from '../lib/types'
import PodMonthCard from './PodMonthCard'

interface PodsOverviewProps {
  propertyId: string
  pods: PropertyPodMonth[]
  selectedMonthValue: string | null
  hasExplicitMonthSelection: boolean
}

export default function PodsOverview({
  propertyId,
  pods,
  selectedMonthValue,
  hasExplicitMonthSelection,
}: PodsOverviewProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Pod Lineup
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            Upcoming pods and current members
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Browse who has already joined in the coming months. Select a month to lock the booking
            CTA to one specific pod.
          </p>
        </div>
        {hasExplicitMonthSelection ? (
          <Link
            href={`/properties/${propertyId}`}
            className="text-sm font-medium text-sky-700 underline-offset-4 hover:underline"
          >
            Show all upcoming months
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {pods.map((pod) => {
          const isSelected = selectedMonthValue === pod.monthValue

          return (
            <Link key={pod.podId} href={`/properties/${propertyId}?month=${pod.monthValue}`}>
              <Badge
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? 'bg-slate-950 text-white hover:bg-slate-950'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pod.monthLabel}
              </Badge>
            </Link>
          )
        })}
      </div>

      {pods.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-slate-500">
          No future pods are scheduled for this property yet.
        </div>
      ) : (
        <div className="grid gap-5">
          {pods.map((pod) => (
            <PodMonthCard key={pod.podId} pod={pod} />
          ))}
        </div>
      )}
    </section>
  )
}
