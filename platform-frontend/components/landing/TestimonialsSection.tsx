'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

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
      'In zwei Monaten mit SyncStay habe ich mehr echte Connections gemacht als in zwei Jahren Solo-Reisen. Die Community-Events sind Gold wert – besonders die lokalen Pop-ups.',
    destination: 'Lissabon → Tbilisi',
    country: '🇮🇹 Italien',
    rating: 5,
  },
]

export function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const cardWidth = 380

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(testimonials.length - 1, index))
    setCurrent(clamped)
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: clamped * (cardWidth + 24), behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (trackRef.current) {
      const scrollLeft = trackRef.current.scrollLeft
      const index = Math.round(scrollLeft / (cardWidth + 24))
      setCurrent(Math.min(index, testimonials.length - 1))
    }
  }

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
            Was unsere Community über SyncStay sagt.
          </p>
        </motion.div>

        {/* Carousel track */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.snap-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div className="hidden lg:block flex-shrink-0 w-[calc((100vw-1280px)/2+16px)]" />

            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="flex-shrink-0 w-[340px] sm:w-[380px] snap-center"
              >
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
              </motion.div>
            ))}

            <div className="flex-shrink-0 w-4" />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => scrollTo(current - 1)}
              disabled={current === 0}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollTo(current + 1)}
              disabled={current === testimonials.length - 1}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} className="text-foreground" />
            </button>
          </div>
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
          ].map(stat => (
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
