import { Check, DoorOpen, Sparkles, Wallet } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface PropertyFactsProps {
  property: {
    amenities: string[]
    totalRooms: number
    minOccupancy: number
    pricePerRoom: number
  }
}

const highlights = [
  {
    icon: DoorOpen,
    label: 'Private rooms',
    getValue: (rooms: number) => `${rooms} separate rooms`,
  },
  {
    icon: Sparkles,
    label: 'Pod lock threshold',
    getValue: (_rooms: number, minOccupancy: number) => `${minOccupancy} members`,
  },
  {
    icon: Wallet,
    label: 'Flat monthly rate',
    getValue: (_rooms: number, _minOccupancy: number, pricePerRoom: number) =>
      `${pricePerRoom} EUR`,
  },
] as const

export default function PropertyFacts({ property }: PropertyFactsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <CardContent className="p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Stay Snapshot
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map((highlight) => {
              const Icon = highlight.icon

              return (
                <div key={highlight.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Icon size={16} className="text-sky-600" />
                    {highlight.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {highlight.getValue(
                      property.totalRooms,
                      property.minOccupancy,
                      property.pricePerRoom
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <CardContent className="p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Included Amenities
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {property.amenities.map((amenity) => (
              <div
                key={amenity}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <Check size={12} />
                </span>
                {amenity}
              </div>
            ))}
            {property.amenities.length === 0 ? (
              <p className="text-sm text-slate-500">
                Amenities will appear here once they are configured for this property.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
