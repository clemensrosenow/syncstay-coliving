'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Calendar, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface SearchUIProps {
  availableLocations: { name: string, slug: string }[]
  availableMonths: { value: string, label: string }[]
}

export default function SearchUI({ availableLocations, availableMonths }: SearchUIProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    searchParams.getAll('location')
  )
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    searchParams.getAll('month')
  )

  const toggleLocation = (slug: string) => {
    setSelectedLocations(prev => 
      prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]
    )
  }

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(x => x !== month) : [...prev, month]
    )
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    selectedLocations.forEach(loc => params.append('location', loc))
    selectedMonths.forEach(m => params.append('month', m))
    router.push(`/search?${params.toString()}`)
  }

  return (
    <Card className="border border-gray-100 shadow-sm p-6 mb-8 w-full max-w-5xl mx-auto rounded-3xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_auto] lg:items-end">
        
        {/* Locations */}
        <div className="min-w-0">
          <label className="flex items-baseline gap-2 text-sm font-semibold text-gray-700 mb-3">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> Destination(s)
            </span>
            <span className="text-xs text-gray-400 font-normal">Select multiple</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white via-white/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white via-white/90 to-transparent" />
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableLocations.map((loc) => (
                <button
                  key={loc.slug}
                  onClick={() => toggleLocation(loc.slug)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    selectedLocations.includes(loc.slug)
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm hover:bg-blue-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
              {availableLocations.length === 0 && (
                <span className="text-gray-400 text-sm">No locations found.</span>
              )}
            </div>
          </div>
        </div>

        {/* Months */}
        <div className="min-w-0">
          <label className="flex items-baseline gap-2 text-sm font-semibold text-gray-700 mb-3">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Travel Month(s)
            </span>
            <span className="text-xs text-gray-400 font-normal">Select multiple</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white via-white/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white via-white/90 to-transparent" />
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableMonths.map((month) => (
                <button
                  key={month.value}
                  onClick={() => toggleMonth(month.value)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    selectedMonths.includes(month.value)
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm hover:bg-blue-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {month.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:pb-2">
          <button
            onClick={handleSearch}
            className="w-full lg:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Search size={18} />
            Search Properties
          </button>
        </div>
      </div>
    </Card>
  )
}
