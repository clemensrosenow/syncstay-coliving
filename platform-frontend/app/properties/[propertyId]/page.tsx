import { notFound } from 'next/navigation'

import BookingSidebar from './components/BookingSidebar'
import PodsOverview from './components/PodsOverview'
import PropertyAmenities from './components/PropertyAmenities'
import PropertyDescription from './components/PropertyDescription'
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
    <div className="min-h-screen bg-stone-50/50 pb-28">
      <PropertyHero property={data.property} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-10">
            <PropertyDescription property={data.property} />
            <PropertyAmenities property={data.property} />
            <PodsOverview
              availableMonths={data.availableMonths}
              pods={data.pods}
              selectedMonthValue={data.selectedMonthValue}
              minOccupancy={data.property.minOccupancy}
              totalRooms={data.property.totalRooms}
              isSignedIn={data.activeUserId !== null}
              activeUserTags={data.activeUserContext?.tags ?? []}
            />
          </div>
          <BookingSidebar
            propertyId={data.property.id}
            pricePerRoom={data.property.pricePerRoom}
            selectedPod={data.selectedPod}
          />
        </div>
      </div>
    </div>
  )
}
