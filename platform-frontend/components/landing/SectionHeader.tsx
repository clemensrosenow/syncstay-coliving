'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  preHeader: string
  heading: string
  description?: string
  className?: string
}

export function SectionHeader({ preHeader, heading, description, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('text-center', className)}
    >
      <p className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{preHeader}</p>
      <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">{heading}</h2>
      {description && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">{description}</p>
      )}
    </motion.div>
  )
}
