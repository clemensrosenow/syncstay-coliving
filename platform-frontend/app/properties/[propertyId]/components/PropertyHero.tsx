import Image from 'next/image'
import { BedDouble, Users } from 'lucide-react'

import BackButton from './BackButton'
import { type PropertyDetailProperty } from '../lib/types'

interface PropertyHeroProps {
  property: PropertyDetailProperty
}

export default function PropertyHero({ property }: PropertyHeroProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <BackButton />
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-medium leading-tight text-slate-950 sm:text-4xl">
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

      <div className="flex flex-wrap items-center gap-2 text-slate-600">
        <BedDouble size={15} className="text-slate-500" />
        <span>{property.totalRooms} private rooms</span>
        <span className="text-slate-300">•</span>
        <Users size={15} className="text-slate-500" />
        <span>up to {property.totalRooms} guests</span>
      </div>
    </section>
  )
}
