import { Suspense } from 'react'

import { getSearchPageData } from '@/app/search/lib/data'
import { parseSearchParams } from '@/app/search/lib/utils'

import { db } from '@/db/drizzle'

import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturedProperties } from '@/components/landing/FeaturedProperties'
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

  const dbTestimonials = await db.query.testimonials.findMany({
    with: {
      podMember: {
        with: {
          user: {
            with: {
              profile: true
            }
          },
          pod: {
            with: {
              property: {
                with: {
                  location: true
                }
              },
              members: true
            }
          }
        }
      }
    }
  })

  const formattedTestimonials = dbTestimonials.map(t => {
    const pm = t.podMember;
    const user = pm.user;
    const profile = user.profile;
    const pod = pm.pod;
    const location = pod.property.location;

    const jobLocation = [profile?.job, profile?.city ? `from ${profile.city}` : null].filter(Boolean).join(' ')

    const othersCount = (pod.members?.length || 1) - 1

    const podDate = new Date(pod.month)
    const monthYear = podDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    const podNotice = othersCount > 0 
      ? `Co-lived in ${location.name} with ${othersCount} others in ${monthYear}.`
      : `Co-lived in ${location.name} in ${monthYear}.`
    
    return {
      name: user.name,
      image: user.image,
      initials: user.name.split(' ').map((n: string) => n[0]).join(''),
      jobLocation,
      quote: t.quote,
      rating: t.rating,
      podNotice,
    }
  })

  return (
    <main className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-screen" />}>
        <HeroSection
          availableLocations={data.availableLocations}
          availableMonths={data.availableMonths}
        />
      </Suspense>
      <FeaturedProperties
        properties={data.properties}
        isSignedIn={Boolean(data.activeUserId)}
      />
      <HowItWorksSection />
      <TestimonialsSection testimonials={formattedTestimonials} />
      <PricingSection />
      <TeamSection />
      <CTASection />
    </main>
  )
}
