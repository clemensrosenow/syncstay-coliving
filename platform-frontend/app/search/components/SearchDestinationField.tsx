'use client'

import { Controller, type Control } from 'react-hook-form'
import { MapPin } from 'lucide-react'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  type useComboboxAnchor,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

import {
  type GroupedLocationOption,
  type SearchFormValues,
} from '../lib/search-ui'
import { type AvailableLocation } from '../lib/types'

interface SearchDestinationFieldProps {
  control: Control<SearchFormValues>
  selectedLocations: string[]
  selectedLocationItems: AvailableLocation[]
  groupedLocationEntries: GroupedLocationOption[]
  filteredGroupedLocations: GroupedLocationOption[]
  locationQuery: string
  setLocationQuery: (value: string) => void
  chipsRef: ReturnType<typeof useComboboxAnchor>
}

export default function SearchDestinationField({
  control,
  selectedLocations,
  selectedLocationItems,
  groupedLocationEntries,
  filteredGroupedLocations,
  locationQuery,
  setLocationQuery,
  chipsRef,
}: SearchDestinationFieldProps) {
  return (
    <Controller
      name="locations"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="min-w-0 gap-3">
          <FieldLabel className="flex items-baseline gap-2">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Destination(s)
            </span>
          </FieldLabel>
          <Combobox
            items={groupedLocationEntries}
            filteredItems={filteredGroupedLocations}
            itemToStringLabel={(location) => `${location.name}, ${location.country}`}
            itemToStringValue={(location) => location.slug}
            isItemEqualToValue={(item, value) => item.slug === value.slug}
            multiple
            inputValue={locationQuery}
            onInputValueChange={setLocationQuery}
            value={selectedLocationItems}
            onValueChange={(selected) => {
              const selectedSlugs = selected.map((location) => location.slug)
              const nextExisting = field.value.filter((slug) => selectedSlugs.includes(slug))
              const nextAdded = selectedSlugs.filter((slug) => !field.value.includes(slug))
              field.onChange([...nextExisting, ...nextAdded])
              setLocationQuery('')
            }}
          >
            <ComboboxChips
              ref={chipsRef}
              aria-invalid={fieldState.invalid}
            >
              <ComboboxValue>
                {(locations: AvailableLocation[]) =>
                  locations.map((location) => (
                    <ComboboxChip
                      key={location.slug}
                      className="border-primary/20 bg-primary/10 text-primary"
                    >
                      {location.name}
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <div className="flex items-center gap-1.5">
                <ComboboxChipsInput
                  className="max-w-36"
                  placeholder={selectedLocations.length === 0 ? 'Select destinations...' : ''}
                />
              </div>
            </ComboboxChips>
            <ComboboxContent anchor={chipsRef}>
              <ComboboxEmpty>No location found.</ComboboxEmpty>
              <ComboboxList>
                {filteredGroupedLocations.map((group, index) => (
                  <ComboboxGroup key={group.country} items={group.items}>
                    <ComboboxLabel>{group.country}</ComboboxLabel>
                    <ComboboxCollection>
                      {(location) => (
                        <ComboboxItem key={location.slug} value={location}>
                          {location.name}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                    {index < filteredGroupedLocations.length - 1 ? (
                      <ComboboxSeparator />
                    ) : null}
                  </ComboboxGroup>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
