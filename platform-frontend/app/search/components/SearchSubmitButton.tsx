'use client'

import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'

export default function SearchSubmitButton() {
  return (
    <Field className="lg:pb-0 h-auto min-h-11 flex items-stretch">
      <Button type="submit" size="lg">
        <Search size={18} />
        Search
      </Button>
    </Field>
  )
}
