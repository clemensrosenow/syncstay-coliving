import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type SearchProperty } from '@/app/search/lib/types'
import PropertyBookingProgress from '@/lib/properties/PropertyBookingProgress'

interface PropertyPreviewCardProps {
  property: SearchProperty
  isSignedIn: boolean
}

export default function PropertyPreviewCard({
  property,
  isSignedIn,
}: PropertyPreviewCardProps) {
  return (
    <Link href={`/properties/${property.id}?month=${property.bookingMonth}`}>
      <Card className="group flex h-full cursor-pointer flex-col overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="bg-muted relative h-48 overflow-hidden">
          {property.photo ? (
            <Image
              src={property.photo}
              alt={property.name}
              fill
              unoptimized
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-black/10" />

          {property.matchScore !== null && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground flex items-center gap-1 shadow-sm">
                <Sparkles size={12} />
                {property.matchScore}% match
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="font-display mb-1 line-clamp-1 text-lg font-bold">
            {property.name}
          </h3>
          <p className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm">
            <MapPin size={14} />
            {property.locationName}
          </p>
          <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
            {property.description ??
              'Thoughtfully designed for long stays, meaningful routines, and a pod that feels easy to join.'}
          </p>

          <PropertyBookingProgress property={property} isSignedIn={isSignedIn} />

          <div className="mt-auto flex items-end justify-between pt-4 text-sm font-medium">
            <span className="text-base font-semibold">{property.priceBase} EUR/mo</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
