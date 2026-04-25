'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Info, Star } from 'lucide-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel'

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface Testimonial {
  name: string
  image: string | null
  initials: string
  jobLocation: string
  quote: string
  rating: number
  podNotice: string
}

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

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-muted/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            By nomads, for nomads
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            What our users say about SyncStay.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="px-0 sm:px-12 lg:px-16"
        >
          <Carousel
            opts={{
              align: 'start',
              dragFree: true,
            }}
            plugins={[WheelGesturesPlugin()]}
            className="w-full"
          >
            <CarouselContent className="-ml-4 py-4 -my-4">
              {testimonials.map((t) => (
                <CarouselItem key={t.name} className="pl-4 pb-8 pt-2 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <Card className="rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full bg-card">
                      
                        <div className="flex items-center gap-3 mb-5">
                          <Avatar className="border border-stone-200 size-10">
                            <AvatarImage src={t.image ?? undefined} alt={t.name} />
                            <AvatarFallback className="bg-stone-100 font-semibold text-stone-600 text-sm">
                              {t.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-none mb-1">{t.name}</p>
                            <p className="text-muted-foreground text-xs">{t.jobLocation}</p>
                          </div>
                        </div>
                    
                      
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <blockquote className="text-foreground/90 leading-relaxed text-[15px] flex-1 mb-2">
                        "{t.quote}"
                      </blockquote>

                      <Item variant="muted">
                        <ItemMedia variant="icon">
                          <Info size={12} className="text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemDescription className="text-xs">
                            {t.podNotice}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </Card>
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
        </motion.div>
      </div>
    </section>
  )
}
