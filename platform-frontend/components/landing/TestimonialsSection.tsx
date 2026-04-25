'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
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

const testimonials = [
  {
    name: 'Nina Hofmann',
    role: 'UX Designer · 3 Jahre Remote',
    initials: 'NH',
    quote:
      'SyncStay hat meine Reiseerfahrung komplett verändert. Ich habe meinen perfekten Co-Working-Partner für Bali gefunden – wir arbeiten sogar heute noch zusammen. Die KI-Empfehlungen waren von Anfang an auf den Punkt.',
    destination: 'Bali → Lissabon → Bangkok',
    country: '🇩🇪 Deutschland',
    rating: 5,
  },
  {
    name: 'Jonas Braun',
    role: 'Full-Stack Dev · Freelancer',
    initials: 'JB',
    quote:
      'Endlich eine Plattform, die versteht, dass Nomaden nicht nur Urlaub machen, sondern arbeiten. Der Trip Planner hat mir 40% Kosten gespart und ich habe durch Shared Stay drei echte Freundschaften geschlossen.',
    destination: 'Barcelona → Medellín',
    country: '🇦🇹 Österreich',
    rating: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Content Strategist · Paris',
    initials: 'SL',
    quote:
      'Als Introvert hatte ich Angst vor dem Matching. Aber SyncStay hat verstanden, was ich brauche: jemanden zum gemeinsamen Coworken, aber mit Rückzugsräumen. Perfektes Match in Chiang Mai!',
    destination: 'Chiang Mai → Da Nang',
    country: '🇫🇷 Frankreich',
    rating: 5,
  },
  {
    name: 'Luca Ferrari',
    role: 'Product Manager · Remote-first',
    initials: 'LF',
    quote:
      'In zwei Monaten mit SyncStay habe ich mehr echte Connections gemacht als in zwei Jahren Solo-Reisen. Die Events sind Gold wert – besonders die lokalen Pop-ups.',
    destination: 'Lissabon → Tbilisi',
    country: '🇮🇹 Italien',
    rating: 5,
  },
]

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

export function TestimonialsSection() {
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
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Erfahrungen</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Von Nomaden, für Nomaden
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Was unsere Nutzer über SyncStay sagen.
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
                    <Card className="rounded-3xl border border-border p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                      <div className="flex gap-1 mb-5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <blockquote className="text-foreground leading-relaxed text-sm flex-1 mb-6">
                        "{t.quote}"
                      </blockquote>

                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full mb-6 w-fit">
                        <span>✈️</span>
                        {t.destination}
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {t.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{t.name}</p>
                            <p className="text-muted-foreground text-xs">{t.role}</p>
                          </div>
                        </div>
                        <span className="text-sm">{t.country}</span>
                      </div>
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

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { value: '4.9/5', label: 'Ø Bewertung' },
            { value: '2.400+', label: 'Aktive Nutzer' },
            { value: '89%', label: 'Würden SyncStay empfehlen' },
            { value: '69', label: 'Länder weltweit' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-bold text-2xl text-foreground">{stat.value}</span>
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
