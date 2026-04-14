import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BedDouble, MapPin, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
  }
}

export default function PropertyHero({ property }: PropertyHeroProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
          <Link
            href={`/search?location=${property.locationSlug}`}
            className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur"
          >
            <ArrowLeft size={16} />
            Back to search
          </Link>
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
            <Badge className="bg-white/92 px-3 py-1 text-slate-900 hover:bg-white">
              {property.pricePerRoom} EUR / month
            </Badge>
            <Badge className="bg-sky-100 px-3 py-1 text-sky-800 hover:bg-sky-100">
              {property.totalRooms} private rooms
            </Badge>
            <Badge className="bg-amber-100 px-3 py-1 text-amber-900 hover:bg-amber-100">
              Locks at {property.minOccupancy} members
            </Badge>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <CardContent className="flex h-full flex-col justify-between p-8">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Anchor Property
            </p>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight text-slate-950 sm:text-5xl">
                {property.name}
              </h1>
              <p className="flex items-center gap-2 text-base text-slate-600">
                <MapPin size={18} className="text-sky-600" />
                {property.locationName}, {property.country}
              </p>
            </div>
            <p className="text-base leading-7 text-slate-600">
              {property.description ??
                'A calm, design-forward home base for remote work, routines that actually stick, and a pod that feels easy to join.'}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <BedDouble size={16} />
                Private room setup
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {property.totalRooms} rooms available
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Users size={16} />
                Pod threshold
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {property.minOccupancy} people to lock
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
