import { type PropertyDetailProperty } from '../lib/types'
import { Separator } from '@/components/ui/separator'

interface PropertyDescriptionProps {
  property: PropertyDetailProperty
}

export default function PropertyDescription({ property }: PropertyDescriptionProps) {
  return (
    <section>
      <p className="text-base leading-7 text-slate-600">
        {property.description ??
          'A calm, design-forward home base for remote work, routines that actually stick, and a pod that feels easy to join.'}
      </p>
      <Separator className="mt-8" />
    </section>
  )
}
