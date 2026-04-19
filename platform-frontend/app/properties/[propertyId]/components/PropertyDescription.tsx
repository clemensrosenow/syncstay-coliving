import { type PropertyDetailProperty } from '../lib/types'

interface PropertyDescriptionProps {
  property: PropertyDetailProperty
}

export default function PropertyDescription({ property }: PropertyDescriptionProps) {
  return (
    <section>
      <p className="text-lg leading-8 text-stone-600 max-w-2xl">
        {property.description ??
          'A calm, design-forward home base for remote work, routines that actually stick, and a pod that feels easy to join.'}
      </p>
      <div className="mt-8 h-px bg-stone-200" />
    </section>
  )
}
