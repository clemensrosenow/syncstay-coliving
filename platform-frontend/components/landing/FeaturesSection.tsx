'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Home, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const features = [
  {
    id: 'matching',
    icon: Users,
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    title: 'AI Matching',
    subtitle: 'People who truly fit you',
    description:
      'Our algorithm analyzes more than 40 parameters, from sleep schedules and work intensity to personality types. Find roommates and pods that truly match you.',
    bullets: ['Workstyle compatibility', 'Lifestyle matching', 'Shared interests', 'Language preferences'],
    cta: 'Explore matches',
    to: '/search',
  },
  {
    id: 'community',
    icon: Heart,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    title: 'Community Fit',
    subtitle: 'Arrive with the right people',
    description:
      'See in advance who is staying in a pod, how the group works, and what kind of atmosphere to expect. That way, you are not just booking a place to stay, but an environment that truly fits.',
    bullets: ['See pod profiles early', 'Shared interests', 'Visible work rhythms', 'More trust before booking'],
    cta: 'Explore the community',
    to: '/search',
  },
  {
    id: 'shared',
    icon: Home,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    title: 'Shared Stay',
    subtitle: 'Live for less, connect more',
    description:
      'Share apartments with verified community members. Dynamic pricing, fair cost sharing, and transparent billing without hidden fees.',
    bullets: ['Verified members', 'Fair split billing', 'Flexible stays', '24/7 emergency support'],
    cta: 'Explore stays',
    to: '/search',
  },
]

export function FeaturesSection() {
  const [active, setActive] = useState('matching')

  const activeFeature = features.find(f => f.id === active)!

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Everything you need as a nomad
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From the right people to the right place to stay, SyncStay supports every step of your journey.
          </p>
        </div>

        {/* Desktop: Split layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8 items-start">
          {/* Feature tabs */}
          <div className="col-span-2 flex flex-col gap-2">
            {features.map((f) => {
              const Icon = f.icon
              const isActive = f.id === active
              return (
                <button
                  key={f.id}
                  onClick={() => setActive(f.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200 border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-background border-border text-foreground hover:bg-muted hover:border-muted-foreground'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${f.gradient}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{f.title}</p>
                    <p className={`text-sm truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{f.subtitle}</p>
                  </div>
                  {isActive && <ArrowRight size={18} className="text-primary-foreground/80 flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Feature detail */}
          <div className="col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-3xl overflow-hidden border border-border shadow-lg">
                  {/* Visual header */}
                  <div className={`bg-gradient-to-br ${activeFeature.gradient} h-56 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-3">
                        <activeFeature.icon size={36} className="text-white" />
                      </div>
                      <p className="text-white font-bold text-2xl tracking-tight">{activeFeature.title}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-8">
                    <h3 className="font-bold text-xl text-foreground mb-3">{activeFeature.subtitle}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">{activeFeature.description}</p>
                    <ul className="grid grid-cols-2 gap-3 mb-8">
                      {activeFeature.bullets.map(b => (
                        <li key={b} className="flex items-center gap-2.5 text-sm text-foreground">
                          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">✓</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="rounded-xl px-6 py-6 font-medium text-sm">
                      <Link href={activeFeature.to}>
                        {activeFeature.cta}
                        <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: Card grid */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Link key={f.id} href={f.to}>
                <Card className="rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className={`bg-gradient-to-br ${f.gradient} h-32 flex items-center justify-center`}>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <Icon size={28} className="text-white" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{f.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
