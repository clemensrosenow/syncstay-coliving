'use client'

import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

import type { AvailableLocation, AvailableMonth } from '@/app/search/lib/types'
import SearchUI from '@/app/search/SearchUI'

export function HeroSection({
  availableLocations,
  availableMonths,
}: {
  availableLocations: AvailableLocation[]
  availableMonths: AvailableMonth[]
}) {
  return (
    <section id="hero" className="relative overflow-hidden pt-16 bg-background">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[55%] -left-40 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Two-column hero */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
          {/* Left: Text content */}
          <div className="lg:col-span-7 xl:col-span-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <Badge variant="secondary" className="px-4 py-2 font-semibold">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
                Now in beta - Join for free
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-bold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-6 tracking-tight"
            >
              Co-living for
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Digital Nomads</span>
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
              Remote, but never alone. AI matching, curated co-living stays, and
              fair shared-stay pricing in one platform.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 w-full"
            >
              <SearchUI
                availableLocations={availableLocations}
                availableMonths={availableMonths}
              />
            </motion.div>
          </div>

          {/* Right: Photos */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex items-end justify-center h-[460px] lg:col-span-5 xl:col-span-4"
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
                <p className="font-bold text-foreground text-xs">4.9/5 rating</p>
                <p className="text-muted-foreground text-[11px]">2,400+ nomads</p>
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
                <p className="font-bold text-foreground text-xs">Up to 40% cheaper</p>
                <p className="text-muted-foreground text-[11px]">with shared stays</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
