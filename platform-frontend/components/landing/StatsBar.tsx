'use client'

import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

const useCountUp = (end: number, duration = 1500, inView: boolean) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [end, duration, inView])
  return count
}

const stats = [
  { value: 35, suffix: 'M+', label: 'Digitale Nomaden weltweit' },
  { value: 15000, suffix: ' ', label: 'Aktive Nutzer' },
  { value: 99, suffix: '%', label: 'Zufriedenheit' },
  { value: 69, suffix: '', label: 'Länder vertreten' },
]

const StatItem = ({ value, suffix, label, inView }: typeof stats[0] & { inView: boolean }) => {
  const count = useCountUp(value, 1500, inView)
  return (
    <div className="flex flex-col items-center text-center px-6">
      <span className="font-bold text-4xl sm:text-5xl text-foreground tabular-nums tracking-tight" aria-live="polite">
        {count}{suffix}
      </span>
      <span className="text-muted-foreground text-sm mt-2 font-medium">{label}</span>
    </div>
  )
}

export function StatsBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-16 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-border">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
