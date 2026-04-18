'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { type PropertyAvailableMonth } from '../lib/types'

interface PodsMonthSelectProps {
  availableMonths: PropertyAvailableMonth[]
  selectedMonthValue: string | null
}

const EMPTY_MONTH_VALUE = '__no-month-selected__'

export default function PodsMonthSelect({
  availableMonths,
  selectedMonthValue,
}: PodsMonthSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <Select
      value={selectedMonthValue ?? EMPTY_MONTH_VALUE}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === EMPTY_MONTH_VALUE) {
          params.delete('month')
        } else {
          params.set('month', value)
        }
        const nextQuery = params.toString()

        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        })
      }}
    >
      <SelectTrigger className="w-full bg-white sm:w-72">
        <SelectValue placeholder="Select a month">
          {selectedMonthValue
            ? availableMonths.find((month) => month.value === selectedMonthValue)?.label
            : 'Select a month'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EMPTY_MONTH_VALUE}>Select a month</SelectItem>
        {availableMonths.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
