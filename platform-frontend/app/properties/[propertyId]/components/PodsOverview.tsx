import { type PropertyAvailableMonth, type PropertyPodMonth } from '../lib/types'
import PodMonthCard from './PodMonthCard'
import PodsMonthSelect from './PodsMonthSelect'

interface PodsOverviewProps {
  availableMonths: PropertyAvailableMonth[]
  pods: PropertyPodMonth[]
  selectedMonthValue: string | null
}

export default function PodsOverview({
  availableMonths,
  pods,
  selectedMonthValue,
}: PodsOverviewProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Pod Lineup
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            Upcoming pods
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Browse which members have already joined in the coming months.
          </p>
        </div>
      </div>

      <PodsMonthSelect
        availableMonths={availableMonths}
        selectedMonthValue={selectedMonthValue}
      />

      {!selectedMonthValue ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-slate-500">
          Select a month to view the pod for that stay.
        </div>
      ) : pods.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-slate-500">
          No pod is scheduled for this month yet.
        </div>
      ) : (
        <div className="grid gap-5">
          {pods.map((pod) => (
            <PodMonthCard key={pod.podId} pod={pod} />
          ))}
        </div>
      )}
    </section>
  )
}
