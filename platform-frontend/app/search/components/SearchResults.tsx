import { Sparkles } from 'lucide-react'

import PropertyPreviewCard from '@/lib/properties/PropertyPreviewCard'
import { Card, CardContent } from '@/components/ui/card'

import SearchFilters from '../SearchFilters'
import { type SearchPageData } from '../lib/types'

interface SearchResultsProps {
  data: SearchPageData
}

function SearchStartState() {
  return (
    <Card className="border-dashed">
      <CardContent className="px-6 py-16 text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full">
          <Sparkles size={24} />
        </div>
        <h2 className="text-2xl font-bold">Start your search</h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl">
          Pick a destination, a travel month, or both to explore available pods curated
          for your next stay.
        </p>
      </CardContent>
    </Card>
  )
}

export default function SearchResults({ data }: SearchResultsProps) {
  if (!data.hasActiveSearch) {
    return <SearchStartState />
  }

  return (
    <>
      <div className="mb-4 pb-6">
        <h2 className="text-2xl font-bold">Co-Living Spaces</h2>
        <p className="text-muted-foreground mt-1">
          {data.properties.length} {data.properties.length === 1 ? 'property' : 'properties'}{' '}
          found for {data.selectedMonthLabel}.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <Card className="sticky top-10">
            <CardContent className="px-5 py-2">
              <SearchFilters
                key={`${data.filters.selectedSort}-${data.filters.normalizedBudgetMin}-${data.filters.normalizedBudgetMax}-${data.filters.showFullPods}-${data.filters.onlyBookable}`}
                sort={data.filters.selectedSort}
                budgetMin={data.filters.normalizedBudgetMin}
                budgetMax={data.filters.normalizedBudgetMax}
                showFullPods={data.filters.showFullPods}
                onlyBookable={data.filters.onlyBookable}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <div className="grid md:grid-cols-2 gap-6">
            {data.properties.map((property) => (
              <div
                key={property.id}
                className="transition-all duration-500 opacity-100 translate-y-0"
              >
                <PropertyPreviewCard
                  property={property}
                  isSignedIn={Boolean(data.activeUserId)}
                />
              </div>
            ))}

            {data.properties.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground pb-4">
                  No properties found for these locations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
