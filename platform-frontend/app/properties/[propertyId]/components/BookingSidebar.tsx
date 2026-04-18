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
    <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:sticky lg:top-28 space-y-5">
        <h2 className="text-2xl font-semibold leading-tight text-slate-950">
          {content.title}
        </h2>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-500">
              <CalendarRange size={16} className="text-slate-400" />
              Month
            </span>
            <span className="text-right font-medium text-slate-900">
              {selectedPod ? selectedPod.monthLabel : 'Select a month'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-500">
              <ShieldCheck size={16} className="text-slate-400" />
              Price
            </span>
            <span className="font-semibold text-slate-950">{pricePerRoom} €</span>
          </div>
        </div>

        <div className="space-y-2">
          {content.disabled || !selectedPod ? (
            <Button size="lg" className="w-full" disabled>
              {content.buttonLabel}
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full">
              <Link href={`/checkout?propertyId=${propertyId}&month=${selectedPod.monthValue}`}>
                {content.buttonLabel}
                <ArrowRight size={18} />
              </Link>
            </Button>
          )}
          <p className="text-center text-xs text-slate-500">{content.body}</p>
        </div>
    </aside>
  )
}
