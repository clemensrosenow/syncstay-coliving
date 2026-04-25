'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative bg-foreground rounded-3xl overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
                <Zap size={14} />
                Jetzt starten – kostenlos
              </div>

              <h2 className="font-bold text-4xl sm:text-5xl text-background leading-tight mb-6 tracking-tight">
                Bereit für dein
                <br />
                <span className="text-primary">nächstes Abenteuer?</span>
              </h2>

              <p className="text-background/70 text-lg leading-relaxed mb-8 max-w-md">
                Schließe dich tausenden digitalen Nomaden an. Finde deinen perfekten
                Pod und die passenden Mitbewohner – der Algorithmus übernimmt den Rest.
              </p>

              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Button
                  asChild
                  size="lg"
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-10 py-8 rounded-full hover:bg-primary/90 transition-colors shadow-2xl shadow-primary/30 text-lg"
                >
                  <Link href="/search">
                    Jetzt Aufenthalt finden
                    <ArrowRight size={20} />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right: Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🌍', value: '69', label: 'Länder', sub: 'weltweit aktiv' },
                { icon: '🤝', value: '2.400+', label: 'Matches', sub: 'bisher vermittelt' },
                { icon: '⭐', value: '4.9/5', label: 'Bewertung', sub: 'von Nutzern' },
                { icon: '🏠', value: '890+', label: 'Stays', sub: 'erfolgreich gebucht' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="bg-background/5 border border-background/10 rounded-2xl p-5 hover:bg-background/10 transition-colors"
                >
                  <span className="text-2xl block mb-2">{stat.icon}</span>
                  <p className="font-bold text-background text-2xl tracking-tight">{stat.value}</p>
                  <p className="text-background font-medium text-sm">{stat.label}</p>
                  <p className="text-background/50 text-xs">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
