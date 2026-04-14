import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import SearchUI from '../SearchUI'
import { type AvailableLocation, type AvailableMonth } from '../lib/types'

interface SearchHeaderProps {
  availableLocations: AvailableLocation[]
  availableMonths: AvailableMonth[]
}

export default function SearchHeader({
  availableLocations,
  availableMonths,
}: SearchHeaderProps) {
  return (
    <div className="border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center text-center">
        <h1 className="font-display mb-4 text-3xl font-bold sm:text-5xl">
          Find your Premium Stay
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Tell us when and where, and we&apos;ll show you to your matching pod.
        </p>

        <Suspense fallback={<Skeleton className="w-full max-w-4xl h-48 rounded-3xl" />}>
          <SearchUI
            availableLocations={availableLocations}
            availableMonths={availableMonths}
          />
        </Suspense>
      </div>
    </div>
  )
}
