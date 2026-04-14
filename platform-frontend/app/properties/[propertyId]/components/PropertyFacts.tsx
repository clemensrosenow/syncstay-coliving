import {
  Activity,
  Bath,
  Bike,
  Car,
  ChefHat,
  Coffee,
  DoorOpen,
  Droplets,
  Film,
  Flame,
  Leaf,
  Mic,
  Monitor,
  Music4,
  Sparkles,
  Sun,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
  Shirt,
  Wallet,
  Zap,
} from 'lucide-react'

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

const amenityIcons: Record<string, LucideIcon> = {
  'High-Speed Fibre (1 Gbps+)': Wifi,
  'Rooftop Terrace': Sun,
  'Private Ensuite Bathroom': Bath,
  'Dedicated Co-Working Studio': DoorOpen,
  'Saltwater Pool': Waves,
  'Plunge Pool': Droplets,
  'Air Conditioning': Wind,
  'Chef-Grade Kitchen': ChefHat,
  'Espresso Bar': Coffee,
  'Standing Desks & Monitors (4K)': Monitor,
  'Podcast / Recording Studio': Mic,
  'Yoga Shala': Activity,
  'Laundry In-Unit': Shirt,
  'Bike Storage & Rental': Bike,
  'Secure Underground Parking': Car,
  'Hammam / Sauna': Flame,
  'Outdoor Cinema': Film,
  'Communal Vegetable Garden': Leaf,
  'Vinyl Lounge': Music4,
  'EV Charging': Zap,
}

export default function PropertyFacts({ property }: PropertyFactsProps) {
  return (
    <section className="space-y-6 rounded-[2rem] border border-white/70 bg-white/82 p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((highlight) => {
          const Icon = highlight.icon

          return (
            <div key={highlight.label} className="rounded-2xl bg-slate-50 px-4 py-4">
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

      <div className="border-t border-slate-200 pt-6">
        <p className="text-sm font-semibold text-slate-500">
          Included Amenities
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {property.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity] ?? Sparkles

            return (
              <div
                key={amenity}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <Icon size={16} />
                </span>
                <span>{amenity}</span>
              </div>
            )
          })}
          {property.amenities.length === 0 ? (
            <p className="text-sm text-slate-500">
              Amenities will appear here once they are configured for this property.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
