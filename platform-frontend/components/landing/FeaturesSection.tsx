'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Map, Home, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const features = [
  {
    id: 'matching',
    icon: Users,
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    title: 'KI-Matching',
    subtitle: 'Dein perfekter Reisepartner',
    description:
      'Unser Algorithmus analysiert über 40 Parameter – von Schlafzeiten über Arbeitsintensität bis hin zu Persönlichkeitstypen. Finde Mitreisende, die wirklich zu dir passen.',
    bullets: ['Arbeitsstil-Kompatibilität', 'Lifestyle-Matching', 'Gemeinsame Interessen', 'Sprachpräferenzen'],
    cta: 'Matches entdecken',
    to: '/search',
  },
  {
    id: 'trip',
    icon: Map,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    title: 'Trip Planner',
    subtitle: 'Deine Route, automatisch optimiert',
    description:
      'Plane Multi-Destination-Routen innerhalb deines Budgets. Visa-Checker, Saisonpreise, Coworking-Verfügbarkeit – alles in einem Tool.',
    bullets: ['Multi-Destination-Routen', 'Budget-Optimierung', 'Visa-Checker', 'Coworking-Finder'],
    cta: 'Route planen',
    to: '/search',
  },
  {
    id: 'shared',
    icon: Home,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    title: 'Shared Stay',
    subtitle: 'Günstiger wohnen, besser vernetzen',
    description:
      'Teile Apartments mit geprüften Mitreisenden. Dynamische Preisoptimierung, faire Kostenaufteilung und transparente Abrechnung ohne versteckte Gebühren.',
    bullets: ['Verifizierte Partner', 'Fair-Split Abrechnung', 'Flexible Laufzeiten', 'Notfall-Support 24/7'],
    cta: 'Stays entdecken',
    to: '/search',
  },
  {
    id: 'community',
    icon: Heart,
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    title: 'Community Hub',
    subtitle: 'Remote, aber nie allein',
    description:
      'Monatliche virtuelle Meetups, Skill-Sharing-Sessions und lokale Pop-up-Events weltweit. Dein globales Nomaden-Netzwerk wächst mit dir.',
    bullets: ['Virtuelle Meetups', 'Skill-Sharing', 'Lokale Events', 'Peer-Reviews'],
    cta: 'Community erkunden',
    to: '/',
  },
]

export function FeaturesSection() {
  const [active, setActive] = useState('matching')

  const activeFeature = features.find(f => f.id === active)!

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Funktionen</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Alles, was du als Nomade brauchst
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Von der Partnersuche bis zur Unterkunft – SyncStay begleitet dich auf jeder Etappe.
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
