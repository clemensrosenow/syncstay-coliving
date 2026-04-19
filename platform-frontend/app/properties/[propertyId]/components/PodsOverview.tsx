import { type PropertyAvailableMonth, type PropertyPodMonth } from '../lib/types'
import PodMonthCard from './PodMonthCard'
import PodsMonthSelect from './PodsMonthSelect'

interface PodsOverviewProps {
  availableMonths: PropertyAvailableMonth[]
  pods: PropertyPodMonth[]
  selectedMonthValue: string | null
  minOccupancy: number
  totalRooms: number
  isSignedIn: boolean
  activeUserTags: string[]
}

export default function PodsOverview({
  availableMonths,
  pods,
  selectedMonthValue,
  minOccupancy,
  totalRooms,
  isSignedIn,
  activeUserTags,
}: PodsOverviewProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-950 leading-tight">
          Upcoming pods
        </h2>
        <p className="mt-2 text-base leading-7 text-stone-500">
          Browse which members have already joined in the coming months.
        </p>
      </div>

      <PodsMonthSelect
        availableMonths={availableMonths}
        selectedMonthValue={selectedMonthValue}
      />

      {!selectedMonthValue ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-14 text-center text-stone-400 text-sm">
          Select a month to view the pod for that stay.
        </div>
      ) : pods.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-14 text-center text-stone-400 text-sm">
          No pod is scheduled for this month yet.
        </div>
      ) : (
        <div className="grid gap-5">
          {pods.map((pod) => (
            <PodMonthCard
              key={pod.podId}
              pod={pod}
              minOccupancy={minOccupancy}
              totalRooms={totalRooms}
              isSignedIn={isSignedIn}
              activeUserTags={activeUserTags}
            />
          ))}
        </div>
      )}
    </section>
  )
}
