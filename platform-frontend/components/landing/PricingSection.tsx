'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Billing = 'monthly' | 'yearly'

const plans = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: { monthly: 0, yearly: 0 },
    description: 'Zum Kennenlernen der Plattform',
    features: ['Basis-Profil & KI-Matching', '3 Trips pro Jahr', 'Community-Zugang', 'Basis Coworking-Finder'],
    cta: 'Kostenlos starten',
    featured: false,
    to: '/signup',
  },
  {
    id: 'nomad-pro',
    name: 'Nomad Pro',
    price: { monthly: 29, yearly: 23 },
    description: 'Für aktive digitale Nomaden',
    features: [
      'Unbegrenztes KI-Matching',
      'Multi-Destination Planung',
      'Dynamic Pricing & Shared Stay',
      'Priority Community Events',
      'Offline-Zugang (Mobile App)',
      'Visa & Budget-Checker',
    ],
    cta: 'Jetzt starten',
    featured: true,
    badge: 'Beliebteste Wahl',
    to: '/signup',
  },
  {
    id: 'business',
    name: 'Business',
    price: { monthly: 79, yearly: 63 },
    description: 'Für Teams & Unternehmen',
    features: [
      'Team-Management (bis 20)',
      'Gruppenreise-Planung',
      'Dedizierter Account Manager',
      'Analytics Dashboard',
      'SSO & API-Zugang',
      'Custom Onboarding',
    ],
    cta: 'Kontakt aufnehmen',
    featured: false,
    to: '/signup',
  },
]

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Preise</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Transparent & fair
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Keine versteckten Kosten. Keine langen Vertragslaufzeiten. Jederzeit kündbar.
          </p>

          <div className="inline-flex items-center bg-background rounded-xl p-1 border border-border shadow-sm gap-1">
            {(['monthly', 'yearly'] as Billing[]).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  billing === b ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {b === 'monthly' ? 'Monatlich' : 'Jährlich'}
                {b === 'yearly' && (
                  <span className={`ml-2 text-xs rounded-full px-2 py-0.5 font-bold ${billing === b ? 'bg-primary-foreground text-primary' : 'bg-primary/20 text-primary'}`}>
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              className="relative flex flex-col"
            >
              {plan.badge && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              <Card
                className={`flex-1 flex flex-col rounded-3xl overflow-hidden ${
                  plan.featured
                    ? 'bg-foreground text-background ring-2 ring-primary shadow-2xl'
                    : 'bg-background border-border shadow-sm hover:shadow-md transition-shadow'
                }`}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className={`font-bold text-xl mb-1 ${plan.featured ? 'text-background' : 'text-foreground'}`}>{plan.name}</h3>
                    <p className={`text-sm mb-5 ${plan.featured ? 'text-background/80' : 'text-muted-foreground'}`}>{plan.description}</p>

                    <div className="flex items-end gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.id}-${billing}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className={`font-bold text-5xl tracking-tight ${plan.featured ? 'text-background' : 'text-foreground'}`}
                        >
                          {plan.price[billing] === 0 ? 'Gratis' : `${plan.price[billing]}€`}
                        </motion.span>
                      </AnimatePresence>
                      {plan.price[billing] > 0 && (
                        <span className={`text-sm mb-1.5 ${plan.featured ? 'text-background/80' : 'text-muted-foreground'}`}>/Monat</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-3 text-sm ${plan.featured ? 'text-background/90' : 'text-foreground/80'}`}>
                        <Check size={16} className={`flex-shrink-0 mt-0.5 ${plan.featured ? 'text-primary-foreground' : 'text-primary'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.featured ? 'default' : 'outline'}
                    className={`w-full py-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                      plan.featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                    }`}
                  >
                    <Link href={plan.to}>
                      {plan.cta}
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          Alle Preise zzgl. MwSt. · Kreditkarte erst bei Upgrade nötig · Jederzeit kündbar
        </motion.p>
      </div>
    </section>
  )
}
