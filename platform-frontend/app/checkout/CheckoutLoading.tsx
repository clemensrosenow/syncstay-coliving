'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { AlertCircle, Check } from 'lucide-react'

import { DotPattern } from '@/components/ui/dot-pattern'
import { joinPod, type JoinPodResult } from './actions'

const STEPS = [
  {
    label: 'Checking availability',
    sublabel: 'Verifying your selected month has open spots',
  },
  {
    label: 'Reserving your spot',
    sublabel: 'Securing your room in the traveler pod',
  },
  {
    label: 'Confirming payment setup',
    sublabel: 'Preparing simulated billing details',
  },
  {
    label: 'Finalizing your booking',
    sublabel: 'Adding you to the pod roster',
  },
]

const STEP_INTERVAL = 1200
const SUCCESS_AT = STEPS.length * STEP_INTERVAL + 250
const REDIRECT_AT = SUCCESS_AT + 2200

const ERROR_MESSAGES: Record<Exclude<JoinPodResult, { ok: true }>['error'], { title: string; body: string }> = {
  unauthorized: {
    title: 'Sign in required',
    body: 'You need to be signed in to book a pod.',
  },
  invalid_params: {
    title: 'Invalid booking',
    body: 'Something went wrong with your booking link. Please try again from the property page.',
  },
  not_found: {
    title: 'Property not found',
    body: 'This property or month is no longer available.',
  },
  already_booked: {
    title: "You're already booked",
    body: 'You already have a spot in this pod.',
  },
  pod_full: {
    title: 'Pod is full',
    body: 'All spots in this pod have been taken. Try a different month.',
  },
}

function RingsLoader({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="relative size-28">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgb(0 0 0) 90deg, transparent 180deg)',
          mask: 'radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)',
          WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)',
          opacity: 0.7,
        }}
      />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgb(0 0 0) 120deg, rgba(0,0,0,0.5) 240deg, transparent 360deg)',
          mask: 'radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)',
          WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)',
          opacity: 0.9,
        }}
      />
      <motion.div
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 180deg, transparent 0deg, rgba(0,0,0,0.6) 45deg, transparent 90deg)',
          mask: 'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)',
          WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)',
          opacity: 0.3,
        }}
      />
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="text-2xl font-semibold text-stone-900">
          {stepIndex + 1}
          <span className="text-sm font-normal text-stone-400">/{STEPS.length}</span>
        </span>
      </motion.div>
    </div>
  )
}

export default function CheckoutLoading() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const month = searchParams.get('month')

  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorKey, setErrorKey] = useState<Exclude<JoinPodResult, { ok: true }>['error'] | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!propertyId || !month) {
      setPhase('error')
      setErrorKey('invalid_params')
      return
    }

    // Fire DB write immediately — runs in parallel with the animation
    const bookingPromise = joinPod(propertyId, month)

    // Step progression timers
    STEPS.forEach((_, i) => {
      if (i === 0) return
      setTimeout(() => setStepIndex(i), i * STEP_INTERVAL)
    })

    // After animation completes, resolve with DB result
    setTimeout(async () => {
      const result = await bookingPromise
      if (!result.ok) {
        setPhase('error')
        setErrorKey(result.error)
        return
      }

      setPhase('success')

      const redirectUrl = `/account/bookings#${result.podId}`
      setTimeout(() => { window.location.href = redirectUrl }, REDIRECT_AT - SUCCESS_AT)
    }, SUCCESS_AT)
  }, [router, propertyId, month])

  const errorInfo = errorKey ? ERROR_MESSAGES[errorKey] : null

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-white">
      <DotPattern className="text-stone-200/70" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center gap-8"
            >
              <RingsLoader stepIndex={stepIndex} />

              <div className="flex flex-col items-center gap-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-1 text-center"
                  >
                    <p className="text-sm font-medium text-stone-900">{STEPS[stepIndex].label}</p>
                    <p className="text-xs text-stone-400">{STEPS[stepIndex].sublabel}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-2">
                  {STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i <= stepIndex ? 1 : 0.75,
                        opacity: i <= stepIndex ? 1 : 0.25,
                        backgroundColor: i <= stepIndex ? 'rgb(28 25 23)' : 'rgb(214 211 209)',
                      }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="size-1.5 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                className="relative flex size-24 items-center justify-center rounded-full bg-emerald-500"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute size-24 rounded-full bg-emerald-400"
                />
                <Check size={44} strokeWidth={3} className="text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                  You&rsquo;re in!
                </h1>
                <p className="text-base text-stone-500">
                  Your spot has been reserved in the pod.
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-sm text-stone-400"
              >
                Taking you to your bookings&hellip;
              </motion.p>
            </motion.div>
          )}

          {phase === 'error' && errorInfo && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex size-24 items-center justify-center rounded-full bg-stone-100"
              >
                <AlertCircle size={40} className="text-stone-500" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-2"
              >
                <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                  {errorInfo.title}
                </h1>
                <p className="text-sm text-stone-500">{errorInfo.body}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex flex-col items-center gap-3"
              >
                {errorKey === 'already_booked' ? (
                  <Link
                    href="/account/bookings?tab=pending"
                    className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
                  >
                    View your bookings
                  </Link>
                ) : errorKey === 'unauthorized' ? (
                  <Link
                    href="/auth/sign-in"
                    className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
                  >
                    Sign in
                  </Link>
                ) : (
                  <Link
                    href="/search"
                    className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
                  >
                    Browse properties
                  </Link>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
