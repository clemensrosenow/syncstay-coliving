'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => router.back()}
      className="-ml-2 text-slate-500 hover:text-slate-900"
    >
      <ArrowLeft size={16} />
      Back to search
    </Button>
  )
}
