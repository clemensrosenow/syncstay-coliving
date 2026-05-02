import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import SearchHeader from './components/SearchHeader'
import SearchResults from './components/SearchResults'
import { getSearchPageData } from './lib/data'
import { type SearchPageProps } from './lib/types'
import { parseSearchParams } from './lib/utils'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function SearchPage(props: SearchPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  const params = await props.searchParams

  if (!session) {
    const searchString = new URLSearchParams(params as Record<string, string>).toString()
    const returnTo = `/search${searchString ? `?${searchString}` : ''}`
    redirect(`/auth/sign-in?redirect=${encodeURIComponent(returnTo)}`)
  }

  const parsedParams = parseSearchParams(params)
  const data = await getSearchPageData(parsedParams)

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24">
      <SearchHeader
        availableLocations={data.availableLocations}
        availableMonths={data.availableMonths}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SearchResults data={data} />
      </div>
    </div>
  )
}
