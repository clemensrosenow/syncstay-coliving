import { asc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { users } from "@/auth-schema"
import { db } from "@/db/drizzle"
import { locations, podMembers, pods, properties, tags, userProfiles, userTags } from "@/db/schema"

export type PublicProfileData = {
  user: {
    id: string
    name: string
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
  profile: {
    id: string | null
    bio: string | null
    job: string | null
    city: string | null
    country: string | null
    birthday: string | null
    chronotype: string | null
    workStartHour: number | null
    workEndHour: number | null
    workStyle: string | null
    cleanliness: number | null
    socialEnergy: number | null
    budgetTier: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }
  tags: string[]
  bookings: {
    podId: string
    status: "PENDING" | "CONFIRMED" | "WITHDRAWN"
    podStatus: "OPEN" | "LOCKED" | "FULL"
    month: string
    propertyName: string
    locationName: string
    locationCountry: string
    joinedAt: Date
  }[]
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export async function getPublicProfileData(userId: string): Promise<PublicProfileData> {
  const userRow = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      userCreatedAt: users.createdAt,
      userUpdatedAt: users.updatedAt,
      profileId: userProfiles.id,
      bio: userProfiles.bio,
      job: userProfiles.job,
      city: userProfiles.city,
      country: userProfiles.country,
      birthday: userProfiles.birthday,
      chronotype: userProfiles.chronotype,
      workStartHour: userProfiles.workStartHour,
      workEndHour: userProfiles.workEndHour,
      workStyle: userProfiles.workStyle,
      cleanliness: userProfiles.cleanliness,
      socialEnergy: userProfiles.socialEnergy,
      budgetTier: userProfiles.budgetTier,
      profileCreatedAt: userProfiles.createdAt,
      profileUpdatedAt: userProfiles.updatedAt,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null)

  if (!userRow) {
    notFound()
  }

  const [tagRows, bookingRows] = await Promise.all([
    userRow.profileId
      ? db
          .select({
            label: tags.label,
          })
          .from(userTags)
          .innerJoin(tags, eq(tags.id, userTags.tagId))
          .where(eq(userTags.profileId, userRow.profileId))
          .orderBy(asc(tags.label))
      : Promise.resolve([]),
    db
      .select({
        podId: podMembers.podId,
        status: podMembers.status,
        podStatus: pods.status,
        month: pods.month,
        propertyName: properties.name,
        locationName: locations.name,
        locationCountry: locations.country,
        joinedAt: podMembers.joinedAt,
      })
      .from(podMembers)
      .innerJoin(pods, eq(pods.id, podMembers.podId))
      .innerJoin(properties, eq(properties.id, pods.propertyId))
      .innerJoin(locations, eq(locations.id, properties.locationId))
      .where(eq(podMembers.userId, userId))
      .orderBy(asc(pods.month)),
  ])

  return {
    user: {
      id: userRow.id,
      name: userRow.name,
      image: userRow.image,
      createdAt: userRow.userCreatedAt,
      updatedAt: userRow.userUpdatedAt,
    },
    profile: {
      id: userRow.profileId,
      bio: userRow.bio,
      job: userRow.job,
      city: userRow.city,
      country: userRow.country,
      birthday: userRow.birthday,
      chronotype: userRow.chronotype,
      workStartHour: userRow.workStartHour,
      workEndHour: userRow.workEndHour,
      workStyle: userRow.workStyle,
      cleanliness: userRow.cleanliness,
      socialEnergy: userRow.socialEnergy,
      budgetTier: userRow.budgetTier,
      createdAt: userRow.profileCreatedAt,
      updatedAt: userRow.profileUpdatedAt,
    },
    tags: uniqueSorted(tagRows.map((row) => row.label)),
    bookings: bookingRows,
  }
}
