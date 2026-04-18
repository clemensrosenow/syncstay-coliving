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
  Shirt,
  Sparkles,
  Sun,
  Waves,
  Wifi,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { type PropertyDetailProperty } from '../lib/types'
import { Separator } from '@/components/ui/separator'

interface PropertyAmenitiesProps {
  property: PropertyDetailProperty
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

export default function PropertyAmenities({ property }: PropertyAmenitiesProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">What this place offers</h2>
      <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
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
      <Separator className="mt-8" />
    </section>
  )
}
