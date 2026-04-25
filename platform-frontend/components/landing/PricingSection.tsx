'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Preise</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Fair & Transparent
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Kostenlos anmelden und matchen. Du zahlst erst, wenn du deinen Aufenthalt buchst.
          </p>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-background border-border shadow-lg rounded-3xl overflow-hidden relative">
            <CardContent className="p-8 sm:p-12 relative z-10">
              <div className="grid sm:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Dynamische Servicegebühr</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold tracking-tight">~15%</span>
                    <span className="text-muted-foreground font-medium">pro Buchung</span>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    Unsere Gebühr wird bei jeder Buchung dynamisch berechnet und deckt alle Kosten für Zahlungsabwicklung, Plattformbetrieb und Support.
                  </p>
                  <Button asChild className="w-full sm:w-auto rounded-xl px-8 py-6 font-medium text-sm transition-all duration-200">
                    <Link href="/signup">
                      Kostenlos starten
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {[
                    'Kostenlose Profilerstellung',
                    'Unbegrenztes KI-Matching',
                    'Keine monatlichen Fixkosten',
                    'Sichere Zahlungsabwicklung',
                    'Verifizierte Community'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1.5 rounded-full text-primary flex-shrink-0">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <span className="font-medium text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
