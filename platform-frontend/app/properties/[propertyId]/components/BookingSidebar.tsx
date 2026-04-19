import Link from 'next/link'
import { ArrowRight, CalendarRange, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { getBookingCtaContent } from '../lib/helpers'
import { type PropertyPodMonth } from '../lib/types'

interface BookingSidebarProps {
  propertyId: string
  pricePerRoom: number
  selectedPod: PropertyPodMonth | null
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

  return (
    <aside className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:sticky lg:top-20">
      {/* Header strip */}
      <div className="bg-slate-950 px-6 py-5">
        <h2 className="text-base font-semibold leading-snug text-white">
          {content.title}
        </h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold text-slate-950">{pricePerRoom}</span>
          <span className="text-xl font-medium text-stone-400">€</span>
          <span className="text-sm text-stone-400 ml-0.5">/ month</span>
        </div>

        {/* Details */}
        <div className="space-y-3 border-y border-stone-100 py-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-stone-500">
              <CalendarRange size={14} className="text-stone-400" />
              Month
            </span>
            <span className="text-right font-medium text-slate-900">
              {selectedPod ? selectedPod.monthLabel : 'Select a month'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-stone-500">
              <ShieldCheck size={14} className="text-stone-400" />
              Secure booking
            </span>
            <span className="text-right text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Protected
            </span>
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
