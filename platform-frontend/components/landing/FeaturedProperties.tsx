'use client'

import { useEffect, useState } from 'react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'

import PropertyPreviewCard from '@/lib/properties/PropertyPreviewCard'
import { type Property } from '@/lib/properties/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel'

function CarouselDots() {
  const { api } = useCarousel()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  useEffect(() => {
    if (!api) return

    setScrollSnaps(api.scrollSnapList())
    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap())
    })
    api.on('reInit', () => {
      setScrollSnaps(api.scrollSnapList())
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  if (scrollSnaps.length <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-8">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={`h-2 rounded-full transition-all ${
            index === selectedIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'
          }`}
          onClick={() => api?.scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
}

export function FeaturedProperties({
  properties,
  isSignedIn,
}: {
  properties: Property[]
  isSignedIn: boolean
}) {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 mb-10">
        <p className="text-sm text-muted-foreground font-medium mb-2">
          Top Nomaden-Hotspots 2026
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Dein nächster Arbeitsplatz wartet
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <Carousel
          opts={{
            align: 'start',
            dragFree: true,
          }}
          plugins={[WheelGesturesPlugin()]}
          className="w-full"
        >
          <CarouselContent className="-ml-4 py-4 -my-4">
            {properties.map((property) => (
              <CarouselItem key={property.id} className="pl-4 pb-8 pt-2 md:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <PropertyPreviewCard
                    property={property}
                    isSignedIn={isSignedIn}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="-left-4 lg:-left-12" />
            <CarouselNext className="-right-4 lg:-right-12" />
          </div>
          <CarouselDots />
        </Carousel>
      </div>
    </section>
  )
}
