'use client'

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { UserCircle, Sparkles, Home, Plane } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

const steps = [
  {
    number: '1',
    icon: UserCircle,
    title: 'Share Your Vibe',
    description: 'Fill in your interests, work style, and living preferences. Our personality engine identifies your nomad type in seconds.',
  },
  {
    number: '2',
    icon: Sparkles,
    title: 'AI Matches You',
    description: 'Our advanced algorithm recommends compatible roommates, fitting pods, and suitable coworking environments.',
  },
  {
    number: '3',
    icon: Home,
    title: 'Choose Your Pod',
    description: 'Compare available stays, check pricing and amenities. Find the place that perfectly fits your next month.',
  },
  {
    number: '4',
    icon: Plane,
    title: 'Move In & Connect',
    description: 'Book your stay, split costs fairly, and arrive to a community that already feels right.',
  },
]

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Update active step based on scroll progress (discrete state update)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const progress = latest * 100
    const newActiveStep = Math.min(3, Math.floor(progress / 25))
    if (newActiveStep !== activeStep) {
      setActiveStep(newActiveStep)
    }
  })

  // Map scroll progress to line scale smoothly.
  // The line finishes growing when it reaches the 4th bullet (at 75% progress).
  const lineScale = useTransform(scrollYProgress, [0, 0.75], [0, 1], { clamp: true })

  const handleStepClick = (index: number) => {
    if (!containerRef.current) return

    // Calculate the exact pixel position that corresponds to the target step
    const containerTop = containerRef.current.offsetTop
    const containerHeight = containerRef.current.offsetHeight
    const windowHeight = window.innerHeight

    // The total scrollable distance within the container
    const scrollDistance = containerHeight - windowHeight

    // Calculate target scroll position (index * 25% of the scrollable distance)
    // We add a tiny buffer (e.g. + 5px) to ensure we cross the threshold into the active step
    const targetScrollY = containerTop + (scrollDistance * (index * 0.25)) + 5

    window.scrollTo({ top: targetScrollY, behavior: 'smooth' })
  }

  return (
    <section id="how-it-works" ref={containerRef} className="relative h-[250vh] bg-background">
      {/* Sticky container stays pinned to viewport while scrolling through 250vh */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-bold tracking-widest text-primary uppercase mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Get started in 5 minutes
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From sign-up to move-in: simple, fast, and smart.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left Column: Steps */}
            <div className="relative">
              {/* Custom Vertical connecting line */}
              <div className="absolute left-[24px] md:left-[27px] top-6 bottom-[80px] md:bottom-[100px] w-[2px] bg-border/50 hidden sm:block overflow-hidden rounded-full">
                <motion.div
                  className="w-full bg-primary origin-top"
                  style={{ scaleY: lineScale, height: '100%' }}
                />
              </div>

              <div className="space-y-8 md:space-y-12">
                {steps.map((step, i) => {
                  const Icon = step.icon
                  const isActive = i === activeStep
                  const isNormallyVisible = isActive || activeStep === 3

                  return (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="relative flex gap-6 md:gap-8 group"
                      onClick={() => handleStepClick(i)} // Allow user to click to jump to step via scrolling
                    >
                      {/* Icon Container */}
                      <div className="relative z-10 flex-shrink-0 flex flex-col items-center cursor-pointer">
                        <div className={cn(
                          "size-12 md:size-14 rounded-full border-2 transition-all duration-500 flex items-center justify-center shadow-sm",
                          isActive
                            ? "border-primary bg-secondary text-primary scale-110"
                            : "border-border bg-background text-muted-foreground/40 group-hover:border-primary/50 group-hover:text-primary/70"
                        )}>
                          <Icon className="size-6 md:size-7" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className={cn(
                        "pt-2 md:pt-3 transition-opacity duration-500 cursor-pointer",
                        isNormallyVisible ? "opacity-100" : "opacity-40 hover:opacity-70"
                      )}>
                        <h3 className="text-lg md:text-xl font-bold mb-2 flex items-center gap-2">
                          <span>{step.number}.</span>
                          <span>{step.title}</span>
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Premium Shuffled Images */}
            <div className="relative h-[500px] md:h-[600px] lg:h-[750px] w-full hidden lg:flex items-center justify-center perspective-[1000px]">
              {/* Ambient Background Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-[100px] -z-10" />

              {/* Image 1: Profile (Bottom DOM layer) */}
              <motion.div
                className="absolute w-[80%] rounded-2xl overflow-hidden shadow-2xl border border-border bg-background"
                animate={`step${activeStep}`}
                variants={{
                  step0: { x: "-3%", y: "-40%", scale: 1.05, rotate: -1, filter: "grayscale(0%)" },
                  step1: { x: "-5%", y: "-80%", scale: 0.8, rotate: -2, filter: "grayscale(100%)" },
                  step2: { x: "5%", y: "-90%", scale: 0.65, rotate: 2, filter: "grayscale(100%)" },
                  step3: { x: "-7%", y: "-70%", scale: 0.8, rotate: -3, filter: "grayscale(0%)" },
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src="/images/landing/profile.png"
                  alt="User Profile"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </motion.div>

              {/* Image 2: Matching (Middle DOM layer) */}
              <motion.div
                className="absolute w-[70%] rounded-xl overflow-hidden shadow-2xl border border-border bg-background"
                animate={`step${activeStep}`}
                variants={{
                  step0: { x: "8%", y: "40%", scale: 0.85, rotate: 2, filter: "grayscale(100%)" },
                  step1: { x: "0%", y: "-5%", scale: 1.2, rotate: 1, filter: "grayscale(0%)" },
                  step2: { x: "5%", y: "-40%", scale: 0.85, rotate: 2, filter: "grayscale(100%)" },
                  step3: { x: "0%", y: "0%", scale: 0.95, rotate: 0, filter: "grayscale(0%)" },
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src="/images/landing/matching.png"
                  alt="AI Matching"
                  width={500}
                  height={400}
                  className="w-full object-cover"
                />
              </motion.div>

              {/* Image 3: Search Results (Top DOM layer) */}
              <motion.div
                className="absolute w-[75%] rounded-xl overflow-hidden shadow-2xl border border-border bg-background"
                animate={`step${activeStep}`}
                variants={{
                  step0: { x: "-5%", y: "90%", scale: 0.8, rotate: -2, filter: "grayscale(100%)" },
                  step1: { x: "-2%", y: "80%", scale: 0.85, rotate: -1, filter: "grayscale(100%)" },
                  step2: { x: "0%", y: "50%", scale: 1.2, rotate: -1, filter: "grayscale(0%)" },
                  step3: { x: "8%", y: "80%", scale: 1, rotate: 3, filter: "grayscale(0%)" },
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src="/images/landing/search-results.png"
                  alt="Search Results"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
