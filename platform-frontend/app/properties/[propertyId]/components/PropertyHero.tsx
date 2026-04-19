import Image from 'next/image'
import { BedDouble, Users, MapPin} from 'lucide-react'

import BackButton from './BackButton'
import { type PropertyDetailProperty } from '../lib/types'
import { Separator } from '@/components/ui/separator'

interface PropertyHeroProps {
  property: PropertyDetailProperty
}

export default function PropertyHero({ property }: PropertyHeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="pt-8 pb-5">
        <BackButton />
      </div>

      <div className="mb-6">
        <p className="text-xs tracking-[0.18em] uppercase font-medium text-stone-400 mb-3">
          
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.04] tracking-tight text-slate-950">
          {property.name}
        </h1>
      </div>

      <div className="overflow-hidden rounded-3xl bg-slate-200 relative aspect-video">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 100vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-200 text-stone-400 text-sm">
            No image available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500">
        <span className='flex items-center gap-2'><MapPin size={14} className="text-stone-400" /> {property.locationName}, {property.country}</span>
        <Separator orientation="vertical" className='h-5' />
        <span className="flex items-center gap-2">
          <BedDouble size={14} className="text-stone-400" />
          {property.totalRooms} private rooms
        </span>
        <Separator orientation="vertical" className='h-5' />
        <span className="flex items-center gap-2">
          <Users size={14} className="text-stone-400" />
          Up to {property.totalRooms} guests
        </span>
      </div>
    </section>
  )
}
