import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { and, asc, eq, inArray } from "drizzle-orm"

import { users } from "@/auth-schema"
import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { locations, podMembers, pods, properties } from "@/db/schema"

export type BookingTab = "pending" | "committed"

export type BookingCard = {
  podId: string
  monthValue: string
  monthLabel: string
  joinedAtLabel: string
  status: "OPEN" | "LOCKED" | "FULL"
  memberStatus: "PENDING" | "CONFIRMED" | "WITHDRAWN"
  property: {
    id: string
    name: string
    imageUrl: string | null
    totalRooms: number
    minOccupancy: number
    pricePerRoomCents: number
  }
  location: {
    name: string
    country: string
  }
  travelerCount: number
  spotsLeft: number
  spotsNeededToLock: number
  travelers: {
    userId: string
    name: string
    image: string | null
    status: "PENDING" | "CONFIRMED" | "WITHDRAWN"
  }[]
}

export type BookingsPageData = {
  userName: string
  tabs: {
    pending: BookingCard[]
    committed: BookingCard[]
  }
}

function formatMonthLabel(month: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}T00:00:00.000Z`))
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value)
}

export async function getBookingsPageData(): Promise<BookingsPageData> {
  const session = await auth.api.getSession({
    headers: new Headers(await headers()),
  })

  if (!session?.user?.id) {
    redirect("/auth/sign-in")
  }

  const bookingRows = await db
    .select({
      podId: podMembers.podId,
      memberStatus: podMembers.status,
      joinedAt: podMembers.joinedAt,
      podStatus: pods.status,
      month: pods.month,
      propertyId: properties.id,
      propertyName: properties.name,
      propertyImageUrl: properties.imageUrl,
      totalRooms: properties.totalRooms,
      minOccupancy: properties.minOccupancy,
      pricePerRoomCents: properties.pricePerRoomCents,
      locationName: locations.name,
      locationCountry: locations.country,
    })
    .from(podMembers)
    .innerJoin(pods, eq(pods.id, podMembers.podId))
    .innerJoin(properties, eq(properties.id, pods.propertyId))
    .innerJoin(locations, eq(locations.id, properties.locationId))
    .where(
      and(
        eq(podMembers.userId, session.user.id),
        inArray(podMembers.status, ["PENDING", "CONFIRMED"])
      )
    )
    .orderBy(asc(pods.month))

  const podIds = bookingRows.map((row) => row.podId)

  const travelerRows =
    podIds.length > 0
      ? await db
          .select({
            podId: podMembers.podId,
            userId: users.id,
            name: users.name,
            image: users.image,
            status: podMembers.status,
          })
          .from(podMembers)
          .innerJoin(users, eq(users.id, podMembers.userId))
          .where(
            and(
              inArray(podMembers.podId, podIds),
              inArray(podMembers.status, ["PENDING", "CONFIRMED"])
            )
          )
          .orderBy(asc(users.name))
      : []

  const travelersByPodId = travelerRows.reduce<
    Map<string, BookingsPageData["tabs"]["pending"][number]["travelers"]>
  >((map, row) => {
    const existing = map.get(row.podId) ?? []
    existing.push({
      userId: row.userId,
      name: row.name,
      image: row.image,
      status: row.status,
    })
    map.set(row.podId, existing)
    return map
  }, new Map())

  const cards = bookingRows.map<BookingCard>((row) => {
    const travelers = travelersByPodId.get(row.podId) ?? []
    const travelerCount = travelers.length
    const spotsLeft = Math.max(row.totalRooms - travelerCount, 0)
    const spotsNeededToLock =
      row.podStatus === "OPEN"
        ? Math.max(row.minOccupancy - travelerCount, 0)
        : 0

    return {
      podId: row.podId,
      monthValue: row.month,
      monthLabel: formatMonthLabel(row.month),
      joinedAtLabel: formatDateLabel(row.joinedAt),
      status: row.podStatus,
      memberStatus: row.memberStatus,
      property: {
        id: row.propertyId,
        name: row.propertyName,
        imageUrl: row.propertyImageUrl,
        totalRooms: row.totalRooms,
        minOccupancy: row.minOccupancy,
        pricePerRoomCents: row.pricePerRoomCents,
      },
      location: {
        name: row.locationName,
        country: row.locationCountry,
      },
      travelerCount,
      spotsLeft,
      spotsNeededToLock,
      travelers,
    }
  })

  return {
    userName: session.user.name,
    tabs: {
      pending: cards.filter((card) => card.status === "OPEN"),
      committed: cards.filter((card) => card.status === "LOCKED" || card.status === "FULL"),
    },
  }
}
