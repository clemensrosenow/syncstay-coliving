import { notFound } from 'next/navigation'

import BookingSidebar from './components/BookingSidebar'
import PodsOverview from './components/PodsOverview'
import PropertyHero from './components/PropertyHero'
import { getPropertyDetailData } from './lib/data'
import { type PropertyDetailPageProps } from './lib/types'

export const dynamic = 'force-dynamic'

export default async function PropertyDetailPage(props: PropertyDetailPageProps) {
  const [{ propertyId }, searchParams] = await Promise.all([props.params, props.searchParams])
  const data = await getPropertyDetailData({
    propertyId,
    monthParam: searchParams.month,
  })

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <PropertyHero property={data.property} />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <PodsOverview pods={data.pods} />
            <BookingSidebar
              propertyId={data.property.id}
              pricePerRoom={data.property.pricePerRoom}
              roomCount={data.property.totalRooms}
              selectedPod={data.selectedPod}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
