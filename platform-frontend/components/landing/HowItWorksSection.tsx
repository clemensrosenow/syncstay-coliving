'use client'

import { motion } from 'framer-motion'
import { UserCircle, Sparkles, Map, Plane } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

const steps = [
  {
    number: '01',
    icon: UserCircle,
    title: 'Profil erstellen',
    description: 'Gib deinen Arbeitsstil, deine Interessen und Reisepräferenzen an. Unser Persönlichkeitstest findet in 5 Minuten deinen Nomaden-Typ.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'KI matcht dich',
    description: 'Der Algorithmus analysiert 40+ Parameter und schlägt dir kompatible Mitreisende, passende Coworkings und optimale Destinationen vor.',
  },
  {
    number: '03',
    icon: Map,
    title: 'Route planen',
    description: 'Nutze den Trip Planner für Multi-Destination-Routen. Budget, Visa, Klima und Unterkunft werden automatisch berücksichtigt.',
  },
  {
    number: '04',
    icon: Plane,
    title: 'Gemeinsam reisen',
    description: 'Bucht zusammen, teilt die Kosten fair und verbindet euch mit anderen Nomaden an jedem Ort der Welt.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">So funktioniert's</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            In 4 Schritten zum perfekten Trip
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Von der Registrierung bis zur gemeinsamen Reise – einfach, schnell, intelligent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
                className="relative"
              >
                <Card className="rounded-3xl border-border shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <CardHeader className="p-8 pb-4">
                    {/* Step number */}
                    <span className="font-mono text-xs font-bold text-muted-foreground tracking-widest mb-6 block">{step.number}</span>

                    {/* Icon */}
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                      <Icon size={26} className="text-primary" />
                    </div>

                    <h3 className="font-bold text-xl text-foreground mb-3">{step.title}</h3>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>

                {/* Connector line (not on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-3 w-6 h-[2px] bg-border z-10" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
