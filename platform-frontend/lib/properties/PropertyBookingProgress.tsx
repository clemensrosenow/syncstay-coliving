import {
  LockOpen,
} from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { type SearchProperty } from '@/app/search/lib/types'
import { getMemberInitials, getPodStateDetails } from '@/app/search/lib/utils'

interface PropertyBookingProgressProps {
  property: SearchProperty
  isSignedIn: boolean
}

export default function PropertyBookingProgress({
  property,
  isSignedIn,
}: PropertyBookingProgressProps) {
  const podState = getPodStateDetails({
    isSignedIn,
    memberCount: property.podMemberCount,
    minOccupancy: property.minOccupancy,
    spotsLeft: property.spotsLeft,
    status: property.podStatus,
  })
  const bookedCount = property.podMemberCount
  const lockThreshold = Math.min(property.minOccupancy, property.totalRooms)
  const remainingCapacity = Math.max(property.totalRooms - bookedCount, 0)
  const fillPercent =
    property.totalRooms > 0 ? Math.min((bookedCount / property.totalRooms) * 100, 100) : 0
  const lockPercent =
    property.totalRooms > 0 ? Math.min((lockThreshold / property.totalRooms) * 100, 100) : 0
  const visibleMembers = property.podMembers.slice(0, 2)
  const hiddenMembersCount = Math.max(property.podMembers.length - visibleMembers.length, 0)
  const showMemberAvatars = visibleMembers.length > 0

  return (
    <Item variant="muted" className="mt-6 mb-4 rounded-xl">
      <ItemContent>
        <ItemTitle>
          {podState.meta}
        </ItemTitle>
        <ItemDescription className="line-clamp-2">
          {property.podSummary}
        </ItemDescription>



        <div className="relative mt-4">
          <Progress
            value={fillPercent}
            aria-label={`${bookedCount} of ${property.totalRooms} spots booked`}
            className="h-2 bg-primary/15"
          />
          {lockThreshold > 0 ? (
            <div
              aria-hidden="true"
              className="bg-background border-border text-primary absolute top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm"
              style={{
                left: `clamp(0.625rem, calc(${lockPercent}% - 0.625rem), calc(100% - 1.25rem))`,
              }}
            >
              <LockOpen size={10} />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 text-xs mt-2">
          <div className="flex items-center gap-2">
            {showMemberAvatars ? (
              <>
                <AvatarGroup className="-space-x-1.5 *:data-[slot=avatar]:ring-border">
                  {visibleMembers.map((member) => (
                    <Avatar
                      key={`${property.id}-${member.name}`}
                      size="sm"
                      className="bg-background after:hidden"
                    >
                      <AvatarImage src={member.image ?? undefined} alt={member.name} />
                    </Avatar>
                  ))}
                  {hiddenMembersCount > 0 ? (
                    <AvatarGroupCount className="bg-background text-foreground ring-1 ring-border text-xs font-semibold">
                      +{hiddenMembersCount}
                    </AvatarGroupCount>
                  ) : null}
                </AvatarGroup>
                <span className="text-muted-foreground">Booked</span>
              </>
            ) : (
              <span className="text-muted-foreground">No members yet</span>
            )}
          </div>
          <span className={remainingCapacity <= 2 ? 'text-red-800' : 'text-muted-foreground'}>
            {remainingCapacity === 0
              ? 'Full'
              : `${remainingCapacity} ${remainingCapacity === 1 ? 'spot' : 'spots'} left`}
          </span>
        </div>
      </ItemContent>
    </Item>
  )
}
