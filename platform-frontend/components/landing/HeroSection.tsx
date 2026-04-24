'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import type { AvailableLocation, AvailableMonth } from '@/app/search/lib/types'
import SearchUI from '@/app/search/SearchUI'

const categories = [
  { emoji: '🏖️', label: 'Beach & Meer' },
  { emoji: '🌆', label: 'City-Life' },
  { emoji: '🌿', label: 'Natur & Cowork' },
  { emoji: '🗺️', label: 'Abenteuer' },
  { emoji: '🎉', label: 'Netzwerken' },
  { emoji: '🧘', label: 'Fokus & Wellness' },
  { emoji: '🏔️', label: 'Berge' },
  { emoji: '🍜', label: 'Kulinarik' },
]

export function HeroSection({
  availableLocations,
  availableMonths,
}: {
  availableLocations: AvailableLocation[]
  availableMonths: AvailableMonth[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <section id="hero" className="relative overflow-hidden pt-16 bg-background">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[55%] -left-40 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Two-column hero */}
        <div className="grid lg:grid-cols-[55%_45%] gap-12 items-center mb-12">
          {/* Left: Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <Badge variant="secondary" className="px-4 py-2 font-semibold">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
                Jetzt in Beta – Kostenlos beitreten
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-bold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-6 tracking-tight"
            >
              Wo arbeitest du
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">als nächstes?</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-3 bg-secondary -z-[1] opacity-40 rounded"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-xl mb-8 max-w-xl leading-relaxed"
            >
              Remote, aber nie allein. KI-Matching, Multi-Destination-Trips und
              SharedStay-Preisoptimierung – alles in einer Plattform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-md" asChild>
                <Link href="/search">Trip planen</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl" asChild>
                <Link href="#community">Community erkunden</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: Photos */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex items-end justify-center h-[460px]"
          >
            {/* Main hero image */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute z-10"
              style={{ top: '20px', left: '10px', width: '310px' }}
              whileHover={{ y: -6, rotate: -2, transition: { duration: 0.3 } }}
            >
              <Image
                src="/images/landing/Frontpage1.png"
                alt="Remote work at the beach"
                width={310}
                height={400}
                className="w-full drop-shadow-2xl"
              />
            </motion.div>

            {/* Secondary image */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="absolute z-20"
              style={{ bottom: '20px', right: '10px', width: '195px' }}
              whileHover={{ y: -6, rotate: 2, transition: { duration: 0.3 } }}
            >
              <Image
                src="/images/landing/Frontpage4.png"
                alt="Nomad lifestyle"
                width={195}
                height={260}
                className="w-full drop-shadow-xl"
              />
            </motion.div>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute z-30 bg-background rounded-2xl border border-border shadow-lg px-4 py-3 flex items-center gap-3"
              style={{ top: '10px', right: '5px' }}
            >
              <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center text-yellow-500">
                <Star size={15} />
              </div>
              <div>
                <p className="font-bold text-foreground text-xs">4.9/5 Bewertung</p>
                <p className="text-muted-foreground text-[11px]">2.400+ Nomaden</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="absolute z-30 bg-background rounded-2xl border border-border shadow-lg px-4 py-3 flex items-center gap-3"
              style={{ top: '185px', right: '0px' }}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={15} />
              </div>
              <div>
                <p className="font-bold text-foreground text-xs">Bis 40% günstiger</p>
                <p className="text-muted-foreground text-[11px]">durch Shared Stay</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mb-8"
        >
          <SearchUI
            availableLocations={availableLocations}
            availableMonths={availableMonths}
          />
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeCategory === cat.label
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground border-border hover:border-muted-foreground hover:shadow-sm'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-t border-border pt-8"
        >
          {[
            'Keine Kreditkarte',
            '1 Trip mit 50% Rabatt',
            '35.000+ Nomaden weltweit',
            'Jederzeit kündbar',
          ].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">✓</span>
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
