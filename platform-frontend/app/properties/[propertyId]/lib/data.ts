import { headers } from 'next/headers'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { users } from '@/auth-schema'
import { auth } from '@/lib/auth'
import { rankPods } from '@/lib/data/rank-pods'
import { db } from '@/db/drizzle'
import {
  amenities,
  locations,
  podMembers,
  pods,
  properties,
  propertyAmenities,
  tags,
  userProfiles,
  userTags,
} from '@/db/schema'

import {
  calculateAge,
  clampMatchPercentage,
  formatMonthLabel,
  getCompatibilitySummary,
  getPodCondition,
  parseMonthParam,
  toMonthValue,
} from './helpers'
import { type ActiveUserContext, type PropertyDetailData, type PropertyDetailMember } from './types'

async function getActiveUserContext(activeUserId: string | null): Promise<ActiveUserContext | null> {
  if (!activeUserId) {
    return null
  }

  const activeProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, activeUserId),
    columns: {
      id: true,
      chronotype: true,
      workStyle: true,
    },
  })

  if (!activeProfile) {
    return null
  }

  const activeTagRows = await db
    .select({
      label: tags.label,
    })
    .from(userTags)
    .innerJoin(tags, eq(tags.id, userTags.tagId))
    .where(eq(userTags.profileId, activeProfile.id))

  return {
    chronotype: activeProfile.chronotype,
    workStyle: activeProfile.workStyle,
    tags: activeTagRows.map((tagRow) => tagRow.label),
  }
}

export async function getPropertyDetailData(input: {
  propertyId: string
  monthParam: string | string[] | undefined
}): Promise<PropertyDetailData | null> {
  const selectedMonthValue = parseMonthParam(input.monthParam)
  const availableMonths = Array.from({ length: 9 }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() + index)

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    return {
      value,
      label: formatMonthLabel(value),
    }
  })

  const [session, propertyRow] = await Promise.all([
    auth.api.getSession({
      headers: new Headers(await headers()),
    }),
    db
      .select({
        id: properties.id,
        name: properties.name,
        description: properties.description,
        imageUrl: properties.imageUrl,
        totalRooms: properties.totalRooms,
        minOccupancy: properties.minOccupancy,
        pricePerRoomCents: properties.pricePerRoomCents,
        locationId: locations.id,
        locationName: locations.name,
        locationSlug: locations.slug,
        country: locations.country,
      })
      .from(properties)
      .innerJoin(locations, eq(locations.id, properties.locationId))
      .where(eq(properties.id, input.propertyId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ])

  if (!propertyRow) {
    return null
  }

  const activeUserId = session?.user?.id ?? null
  const [amenityRows, podRows, activeUser] = await Promise.all([
    db
      .select({
        label: amenities.label,
      })
      .from(propertyAmenities)
      .innerJoin(amenities, eq(amenities.id, propertyAmenities.amenityId))
      .where(eq(propertyAmenities.propertyId, propertyRow.id)),
    selectedMonthValue
      ? db
          .select({
            id: pods.id,
            month: pods.month,
            status: pods.status,
          })
          .from(pods)
          .where(and(eq(pods.propertyId, propertyRow.id), eq(pods.month, `${selectedMonthValue}-01`)))
          .orderBy(asc(pods.month))
      : Promise.resolve([]),
    getActiveUserContext(activeUserId),
  ])

  const podIds = podRows.map((pod) => pod.id)
  const memberRows =
    podIds.length > 0
      ? await db
          .select({
            podId: podMembers.podId,
            userId: users.id,
            name: users.name,
            image: users.image,
            status: podMembers.status,
            joinedAt: podMembers.joinedAt,
            profileId: userProfiles.id,
            birthday: userProfiles.birthday,
            bio: userProfiles.bio,
            chronotype: userProfiles.chronotype,
            workStartHour: userProfiles.workStartHour,
            workEndHour: userProfiles.workEndHour,
            workStyle: userProfiles.workStyle,
          })
          .from(podMembers)
          .innerJoin(users, eq(users.id, podMembers.userId))
          .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
          .where(
            and(
              inArray(podMembers.podId, podIds),
              inArray(podMembers.status, ['PENDING', 'CONFIRMED'])
            )
          )
          .orderBy(asc(podMembers.joinedAt))
      : []

  const profileIds = Array.from(
    new Set(
      memberRows
        .map((memberRow) => memberRow.profileId)
        .filter((profileId): profileId is string => Boolean(profileId))
    )
  )

  const memberTagRows =
    profileIds.length > 0
      ? await db
          .select({
            profileId: userTags.profileId,
            label: tags.label,
          })
          .from(userTags)
          .innerJoin(tags, eq(tags.id, userTags.tagId))
          .where(inArray(userTags.profileId, profileIds))
      : []

  const tagsByProfileId = memberTagRows.reduce<Map<string, string[]>>((map, row) => {
    const existingTags = map.get(row.profileId) ?? []
    existingTags.push(row.label)
    map.set(row.profileId, existingTags)
    return map
  }, new Map())

  const membersByPodId = memberRows.reduce<Map<string, PropertyDetailMember[]>>((map, row) => {
    const existingMembers = map.get(row.podId) ?? []
    existingMembers.push({
      userId: row.userId,
      name: row.name,
      image: row.image,
      age: calculateAge(row.birthday),
      bio: row.bio,
      chronotype: row.chronotype,
      workStartHour: row.workStartHour,
      workEndHour: row.workEndHour,
      workStyle: row.workStyle,
      tags: row.profileId ? (tagsByProfileId.get(row.profileId) ?? []) : [],
      status: row.status,
    })
    map.set(row.podId, existingMembers)
    return map
  }, new Map())

  const rankingsByMonth = new Map<string, number | null>()

  if (activeUserId && podRows.length > 0) {
    const rankingResults = await Promise.all(
      podRows.map(async (pod) => {
        const monthValue = toMonthValue(pod.month)

        try {
          const rankingResponse = await rankPods({
            activeUserId,
            locationIds: [propertyRow.locationId],
            month: `${monthValue}-01`,
          })
          const match = rankingResponse.rankings.find(
            (ranking) => ranking.property_id === propertyRow.id
          )

          return [monthValue, match ? clampMatchPercentage(match.match_score) : null] as const
        } catch (error) {
          console.error(`Failed to rank property ${propertyRow.id} for ${monthValue}:`, error)
          return [monthValue, null] as const
        }
      })
    )

    for (const [monthValue, matchScore] of rankingResults) {
      rankingsByMonth.set(monthValue, matchScore)
    }
  }

  const podMonths = podRows.map((pod) => {
    const monthValue = toMonthValue(pod.month)
    const monthLabel = formatMonthLabel(monthValue)
    const members = membersByPodId.get(pod.id) ?? []
    const memberCount = members.length
    const condition = getPodCondition({
      memberCount,
      status: pod.status,
    })
    const spotsLeft =
      condition === 'FULL'
        ? 0
        : Math.max(propertyRow.totalRooms - memberCount, 0)
    const membersNeededToLock =
      condition === 'LOCKED' || condition === 'FULL'
        ? 0
        : Math.max(propertyRow.minOccupancy - memberCount, 0)
    const matchScore = rankingsByMonth.get(monthValue) ?? null

    return {
      monthValue,
      monthLabel,
      podId: pod.id,
      status: pod.status,
      condition,
      memberCount,
      membersNeededToLock,
      spotsLeft,
      matchScore,
      members,
      compatibilitySummary: getCompatibilitySummary({
        activeUser,
        members,
        matchScore,
        monthLabel,
      }),
    }
  })

  const selectedPod = selectedMonthValue
    ? podMonths.find((podMonth) => podMonth.monthValue === selectedMonthValue) ?? null
    : null

  return {
    property: {
      id: propertyRow.id,
      name: propertyRow.name,
      description: propertyRow.description,
      imageUrl: propertyRow.imageUrl,
      locationName: propertyRow.locationName,
      locationSlug: propertyRow.locationSlug,
      country: propertyRow.country,
      totalRooms: propertyRow.totalRooms,
      minOccupancy: propertyRow.minOccupancy,
      pricePerRoom: Math.round(propertyRow.pricePerRoomCents / 100),
      amenities: amenityRows.map((amenityRow) => amenityRow.label),
    },
    pods: podMonths,
    availableMonths,
    activeUserId,
    selectedMonthValue,
    selectedPod,
    hasExplicitMonthSelection: Boolean(selectedMonthValue),
  }
}
