import Link from 'next/link'
import { ArrowRight, CalendarRange, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { getBookingCtaContent } from '../lib/helpers'
import { type PropertyPodMonth, type PodCondition } from '../lib/types'

interface BookingSidebarProps {
  propertyId: string
  pricePerRoom: number
  selectedPod: PropertyPodMonth | null
}

function getCancellationLabel(condition: PodCondition | null): string | null {
  if (condition === 'LOCKED') return 'No cancellation'
  if (condition === 'EMPTY' || condition === 'OPEN') return 'Withdraw before lock'
  return null
}

export default function BookingSidebar({
  propertyId,
  pricePerRoom,
  selectedPod,
}: BookingSidebarProps) {
  const content = getBookingCtaContent(
    selectedPod
      ? {
        condition: selectedPod.condition,
        monthLabel: selectedPod.monthLabel,
        memberCount: selectedPod.memberCount,
        membersNeededToLock: selectedPod.membersNeededToLock,
      }
      : null
  )

  const cancellationLabel = getCancellationLabel(selectedPod?.condition ?? null)
  const formattedPrice = new Intl.NumberFormat('de-DE').format(pricePerRoom)

  return (
    <aside className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:sticky lg:top-20">
      {/* Header strip */}
      <div className="bg-secondary px-6 py-5 shadow">
        <h2 className="text-lg font-semibold leading-snug tracking-tight">
          {content.title}
        </h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tracking-tight text-slate-950">{formattedPrice}</span>
            <span className="text-xl font-medium text-stone-400">€</span>
            <span className="text-sm text-stone-400 ml-0.5">/ month</span>
          </div>
          <p className="mt-1 text-xs text-stone-400">Per private room · all-inclusive</p>
        </div>

        {/* Details */}
        <div className="space-y-3 border-y border-stone-100 py-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-stone-500">
              <CalendarRange size={14} className="text-stone-400 shrink-0" />
              Month
            </span>
            {selectedPod ? (
              <span className="font-medium text-slate-900">{selectedPod.monthLabel}</span>
            ) : (
              <span className="text-stone-400 italic">Select a month</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-stone-500">
              <RotateCcw size={14} className="text-stone-400 shrink-0" />
              Cancellation
            </span>
            {cancellationLabel ? (
              <span className="text-xs font-medium text-sky-800 bg-secondary px-2 py-0.5 rounded-full">
                {cancellationLabel}
              </span>
            ) : (
              <span className="text-stone-400">—</span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          {content.disabled || !selectedPod ? (
            <Button size="lg" className="w-full" disabled>
              {content.buttonLabel}
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full">
              <Link href={`/checkout?propertyId=${propertyId}&month=${selectedPod.monthValue}`}>
                {content.buttonLabel}
                <ArrowRight size={16} />
              </Link>
            </Button>
          )}
          <p className="text-center text-xs text-stone-400">{content.body}</p>
        </div>
      </div>
    </aside>
  )
}
