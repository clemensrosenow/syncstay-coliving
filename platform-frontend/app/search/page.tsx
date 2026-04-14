import SearchHeader from './components/SearchHeader'
import SearchResults from './components/SearchResults'
import { getSearchPageData } from './lib/data'
import { type SearchPageProps } from './lib/types'
import { parseSearchParams } from './lib/utils'

export const dynamic = 'force-dynamic'

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.searchParams
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
