import Image from 'next/image'
import {
  Activity,
  Bath,
  BedDouble,
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
  Users,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
  Shirt,
  Zap,
} from 'lucide-react'

import BackButton from './BackButton'

import { Separator } from '@/components/ui/separator'

interface PropertyHeroProps {
  property: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    locationName: string
    locationSlug: string
    country: string
    totalRooms: number
    minOccupancy: number
    pricePerRoom: number
    amenities: string[]
  }
}

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

export default function PropertyHero({ property }: PropertyHeroProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <BackButton />
        <div className="space-y-2">
          <h1 className="font-heading text-4xl leading-tight text-slate-950 sm:text-5xl">
            {property.name}
          </h1>
          <p className="text-base text-slate-600">
            {property.locationName}, {property.country}
          </p>
        </div>
      </div>

      <div className="max-w-4xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="relative aspect-video overflow-hidden bg-slate-200">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={property.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
              No image available
            </div>
          )}
        </div>
      </div>

        <p className="flex flex-wrap items-center gap-2        text-slate-600">
          <BedDouble size={15} className="text-slate-500" />
          <span>{property.totalRooms} private rooms</span>
          <span className="text-slate-300">•</span>
          <Users size={15} className="text-slate-500" />
          <span>up to {property.totalRooms} guests</span>
        </p>
    


      <div className="max-w-4xl">
        <p className="text-base leading-7 text-slate-600">
          {property.description ??
            'A calm, design-forward home base for remote work, routines that actually stick, and a pod that feels easy to join.'}
        </p>
      </div>

      <Separator className='mt-6' />

      <div className="space-y-4 py-2">
        <h2 className="text-lg font-semibold text-slate-700">What this place offers</h2>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 sm:max-w-2xl">
          {property.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity] ?? Sparkles

            return (
              <div key={amenity} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 text-sky-700">
                  <Icon size={15} />
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

      <Separator />
    </section>
  )
}
