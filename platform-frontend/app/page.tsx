import { Suspense } from 'react'

import { getSearchPageData } from '@/app/search/lib/data'
import { parseSearchParams } from '@/app/search/lib/utils'

import { HeroSection } from '@/components/landing/HeroSection'
import { StatsBar } from '@/components/landing/StatsBar'
import { FeaturedProperties } from '@/components/landing/FeaturedProperties'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TeamSection } from '@/components/landing/TeamSection'
import { CTASection } from '@/components/landing/CTASection'

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
    <main className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-screen" />}>
        <HeroSection
          availableLocations={data.availableLocations}
          availableMonths={data.availableMonths}
        />
      </Suspense>
      <StatsBar />
      <FeaturedProperties
        properties={data.properties}
        isSignedIn={Boolean(data.activeUserId)}
      />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <TeamSection />
      <CTASection />
    </main>
  )
}
