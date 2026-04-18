import { getSearchPageData } from '@/app/search/lib/data'
import { parseSearchParams } from '@/app/search/lib/utils'
import PropertyPreviewCard from '@/lib/properties/PropertyPreviewCard'

export const dynamic = 'force-dynamic'

function getCurrentMonthValue() {
  const date = new Date()
  date.setDate(1)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default async function Home() {
  const data = await getSearchPageData(
    parseSearchParams({
      month: getCurrentMonthValue(),
      showFullPods: 'true',
    })
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.properties.map((property) => (
          <PropertyPreviewCard
            key={property.id}
            property={property}
            isSignedIn={Boolean(data.activeUserId)}
          />
        ))}
      </div>
    </main>
  )
}
