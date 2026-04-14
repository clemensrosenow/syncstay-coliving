import { notFound } from 'next/navigation'

import BookingCtaSection from './components/BookingCtaSection'
import PodsOverview from './components/PodsOverview'
import PropertyFacts from './components/PropertyFacts'
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5fbff_0%,#f8fafc_25%,#eef6ff_100%)] pt-24 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <PropertyHero property={data.property} />
        <PropertyFacts property={data.property} />
        <PodsOverview
          propertyId={data.property.id}
          pods={data.pods}
          selectedMonthValue={data.selectedMonthValue}
          hasExplicitMonthSelection={data.hasExplicitMonthSelection}
        />
        <BookingCtaSection
          propertyId={data.property.id}
          pricePerRoom={data.property.pricePerRoom}
          selectedPod={data.selectedPod}
        />
      </div>
    </div>
  )
}
