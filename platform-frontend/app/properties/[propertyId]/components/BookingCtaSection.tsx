import Link from 'next/link'
import { ArrowRight, CalendarRange, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { getBookingCtaContent } from '../lib/helpers'
import { type PropertyPodMonth } from '../lib/types'

interface BookingCtaSectionProps {
  propertyId: string
  pricePerRoom: number
  selectedPod: PropertyPodMonth | null
}

export default function BookingCtaSection({
  propertyId,
  pricePerRoom,
  selectedPod,
}: BookingCtaSectionProps) {
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
    <section>
      <Card className="overflow-hidden rounded-[2rem] border-0 bg-[linear-gradient(135deg,#082f49,#0f766e_52%,#ecfeff)] shadow-[0_28px_90px_rgba(8,47,73,0.28)]">
        <CardContent className="p-8 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/90">
                Prototype Booking CTA
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                {content.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50/92">
                {content.body}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-cyan-50/85">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                  <CalendarRange size={16} />
                  {selectedPod ? selectedPod.monthLabel : 'Month not selected'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                  <ShieldCheck size={16} />
                  {pricePerRoom} EUR per room
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm font-medium text-cyan-50/80">
                This is a prototype CTA. The next step would carry the selected property and month
                into the simulated checkout flow.
              </p>
              <div className="mt-5">
                {content.disabled || !selectedPod ? (
                  <Button
                    size="lg"
                    className="w-full bg-white text-slate-900 hover:bg-white/90"
                    disabled
                  >
                    {content.buttonLabel}
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-white text-slate-900 hover:bg-white/90"
                  >
                    <Link
                      href={`/checkout?propertyId=${propertyId}&month=${selectedPod.monthValue}`}
                    >
                      {content.buttonLabel}
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
