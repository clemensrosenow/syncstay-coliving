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
      <p className="text-sm font-semibold text-stone-700 mb-4">
        What this place offers
      </p>
      {property.amenities.length === 0 ? (
        <p className="text-sm text-stone-400">
          Amenities will appear here once configured for this property.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {property.amenities.map((amenity) => {
            const Icon = amenityIcons[amenity] ?? Sparkles
            return (
              <div
                key={amenity}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-xs"
              >
                <Icon size={13} className="text-stone-400 flex-shrink-0" />
                {amenity}
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-8 h-px bg-stone-200" />
    </section>
  )
}
