import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Sparkles, UserPlus } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { type SearchProperty } from '@/app/search/lib/types'
import { getMemberInitials, getPodStateDetails } from '@/app/search/lib/utils'

interface PropertyPreviewCardProps {
  property: SearchProperty
  isSignedIn: boolean
}

export default function PropertyPreviewCard({
  property,
  isSignedIn,
}: PropertyPreviewCardProps) {
  const podState = getPodStateDetails({
    isSignedIn,
    memberCount: property.podMemberCount,
    minOccupancy: property.minOccupancy,
    spotsLeft: property.spotsLeft,
    status: property.podStatus,
  })
  const PodStateIcon = podState.icon
  const visibleMembers = property.podMembers.slice(0, 2)
  const hiddenMembersCount = Math.max(property.podMembers.length - visibleMembers.length, 0)
  const showMemberAvatars = visibleMembers.length > 0
  const podDescription = `${podState.title}. ${property.podSummary}`

  return (
    <Link href={`/properties/${property.id}?month=${property.bookingMonth}`}>
      <Card className="group flex h-full cursor-pointer flex-col overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="bg-muted relative h-48 overflow-hidden">
          {property.photo ? (
            <Image
              src={property.photo}
              alt={property.name}
              fill
              unoptimized
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-background/90 backdrop-blur">
              {property.spotsLeft > 0
                ? `${property.spotsLeft} ${property.spotsLeft === 1 ? 'spot' : 'spots'} left`
                : 'Pod is full'}
            </Badge>
          </div>

          {property.matchScore !== null && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground flex items-center gap-1 shadow-sm">
                <Sparkles size={12} />
                {property.matchScore}% match
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="font-display mb-1 line-clamp-1 text-lg font-bold">
            {property.name}
          </h3>
          <p className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm">
            <MapPin size={14} />
            {property.locationName}
          </p>
          <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
            {property.description ??
              'Thoughtfully designed for long stays, meaningful routines, and a pod that feels easy to join.'}
          </p>

          <Item variant="muted" className="mt-6 mb-4 rounded-xl">
            <ItemMedia>
              {showMemberAvatars ? (
                <AvatarGroup>
                  {visibleMembers.map((member) => (
                    <Avatar
                      key={`${property.id}-${member.name}`}
                      size="sm"
                      className="bg-background after:hidden ring-2 ring-background"
                    >
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getMemberInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {hiddenMembersCount > 0 && (
                    <AvatarGroupCount className="bg-background text-foreground text-xs font-semibold">
                      +{hiddenMembersCount}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              ) : (
                <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full">
                  <UserPlus size={12} />
                </div>
              )}
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-primary inline-flex items-center gap-1">
                <PodStateIcon size={14} />
                <span>{podState.meta}</span>
              </ItemTitle>
              <ItemDescription className="text-muted-foreground line-clamp-3">
                {podDescription}
              </ItemDescription>
            </ItemContent>
          </Item>

          <div className="mt-auto flex items-end justify-between pt-4 text-sm font-medium">
            <span className="text-base font-semibold">{property.priceBase} EUR/mo</span>
            <span className="text-primary flex items-center gap-1 transition-all group-hover:px-1">
              {property.ctaLabel} <ArrowRight size={14} />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
