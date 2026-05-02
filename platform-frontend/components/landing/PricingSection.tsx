'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/landing/SectionHeader'

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          preHeader="Pricing"
          heading="Fair & Transparent"
          description="You only pay when you book your stay."
          className="mb-12"
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-12 sm:items-center justify-center"
        >
          <div className='max-w-sm'>
            <h3 className="text-2xl font-bold mb-3">Service fee</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold tracking-tight">~15%</span>
              <span className="text-muted-foreground font-medium">per booking</span>
            </div>
            <p className="text-muted-foreground text-sm mb-8 text-balance">
              Our fee is calculated dynamically for each transaction and covers platform operations and support.
            </p>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Book stays for free
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4 max-w-sm">
            {[
              'Unlimited AI matching',
              'No subscription fees',
              'Secure payment processing',
              'Verified community'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="bg-primary/10 p-1.5 rounded-full text-primary flex-shrink-0">
                  <Check size={16} strokeWidth={3} />
                </div>
                <span className="font-medium text-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
