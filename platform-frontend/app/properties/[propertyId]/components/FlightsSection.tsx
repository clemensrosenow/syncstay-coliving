import { type PropertyFlight } from '../lib/types'
import { Separator } from '@/components/ui/separator'

interface FlightsSectionProps {
  flights: PropertyFlight[]
  locationName: string
}

function formatDuration(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function FlightsSection({ flights, locationName }: FlightsSectionProps) {
  if (flights.length === 0) return null

  const cheapestPrice = Math.min(...flights.map((f) => f.priceEuros))
  const cheapestFlight = flights.find((f) => f.priceEuros === cheapestPrice)!
  const quickestDuration = Math.min(...flights.map((f) => f.durationHours))
  const maxDuration = Math.max(...flights.map((f) => f.durationHours))
  const minDuration = quickestDuration
  const durationRange = maxDuration - minDuration || 1

  return (
    <>
    <Separator />
    <section>
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-slate-950 leading-tight">Flights to {locationName}</h2>
        <p className="mt-2 text-base leading-7 text-stone-500">
          Starting at{' '}
          <span className="font-semibold text-stone-700">{cheapestFlight.priceEuros}€</span>
          {' '}from your location
        </p>
      </div>

      <div className="space-y-0 border border-stone-200 rounded-2xl overflow-hidden bg-white">
        {flights.map((flight, i) => {
          const trackWidth = 30 + ((flight.durationHours - minDuration) / durationRange) * 50
          const isCheapest = flight.priceEuros === cheapestPrice
          const isQuickest = flight.durationHours === quickestDuration
          const isBest = isCheapest && isQuickest

          return (
            <div
              key={flight.id}
              className={`group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50/80 ${
                i < flights.length - 1 ? 'border-b border-stone-100' : ''
              }`}
            >
              {/* Airline */}
              <div className="w-28 shrink-0">
                <span className="text-xs font-medium text-stone-400 leading-none">
                  {flight.airline}
                </span>
              </div>

              {/* Route track */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-semibold text-stone-600 shrink-0">
                  {flight.origin}
                </span>

                <div
                  className="relative flex items-center shrink-0"
                  style={{ width: `${trackWidth}%`, maxWidth: '200px', minWidth: '60px' }}
                >
                  <div className="h-px bg-stone-300 w-full" />

                  {flight.stops === 0 ? (
                    <svg
                      className="absolute right-0 text-stone-400 shrink-0"
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="currentColor"
                    >
                      <path d="M0 0l6 5-6 5V0z" />
                    </svg>
                  ) : (
                    <>
                      <div className="absolute left-1/2 -translate-x-1/2 size-1 rounded-full bg-amber-400 border- border-stone-300 shadow-sm" />
                      <svg
                        className="absolute right-0 text-stone-400 shrink-0"
                        width="6"
                        height="10"
                        viewBox="0 0 6 10"
                        fill="currentColor"
                      >
                        <path d="M0 0l6 5-6 5V0z" />
                      </svg>
                    </>
                  )}
                </div>

                <span className="text-xs font-mono font-semibold text-stone-600 shrink-0">
                  {flight.destination}
                </span>

                <span className="text-xs text-stone-400 shrink-0 ml-1">
                  {formatDuration(flight.durationHours)}
                  {flight.stops > 0 && (
                    <span className="ml-1.5 text-amber-500">· {flight.stops} stop</span>
                  )}
                </span>
              </div>

              {/* Badges + Price */}
              <div className="shrink-0 flex items-center gap-2">
                {isBest && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 leading-none">
                    Best
                  </span>
                )}
                {!isBest && isCheapest && (
                  <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 leading-none">
                    Cheapest
                  </span>
                )}
                {!isBest && isQuickest && (
                  <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5 leading-none">
                    Quickest
                  </span>
                )}
                <span
                  className={`text-base font-semibold tabular-nums ${
                    isCheapest ? 'text-slate-950' : 'text-stone-600'
                  }`}
                >
                  {flight.priceEuros}€
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
    </>
  )
}
