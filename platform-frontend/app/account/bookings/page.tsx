import Image from "next/image"
import Link from "next/link"
import { ChevronRight, MapPin } from "lucide-react"
import { type Metadata } from "next"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getBookingsPageData, type BookingCard } from "./lib/data"

export const metadata: Metadata = {
  title: "My Bookings | SyncStay",
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(cents / 100) + " €"
}

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function TravelerAvatars({ travelers }: { travelers: BookingCard["travelers"] }) {
  const visible = travelers.slice(0, 3)
  const hidden = Math.max(travelers.length - visible.length, 0)

  if (visible.length === 0) return null

  return (
    <AvatarGroup>
      {visible.map((t) => (
        <Avatar key={t.userId} size="sm" className="bg-white">
          <AvatarImage src={t.image ?? undefined} alt={t.name} />
          <AvatarFallback>{getMemberInitials(t.name)}</AvatarFallback>
        </Avatar>
      ))}
      {hidden > 0 && <AvatarGroupCount>+{hidden}</AvatarGroupCount>}
    </AvatarGroup>
  )
}

function BookingRow({ booking }: { booking: BookingCard }) {
  return (
    <Link
      id={booking.podId}
      href={`/properties/${booking.property.id}?month=${booking.monthValue.slice(0, 7)}`}
      className="group flex items-center gap-4 px-5 py-6 transition-colors hover:bg-stone-100 target:bg-green-50"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Heading row */}
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-stone-900">
            {booking.property.name}
          </span>
          {booking.matchScore !== null && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {booking.matchScore}% match
            </Badge>
          )}
        </div>

        {/* Image + details row */}
        <div className="flex items-center gap-5">
          <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-stone-100">
            {booking.property.imageUrl ? (
              <Image
                src={booking.property.imageUrl}
                alt={booking.property.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-300">
                <MapPin size={16} />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {booking.location.name}, {booking.location.country} · {booking.monthLabel}
            </p>

            <div className="mt-1 flex items-center gap-3">
              <TravelerAvatars travelers={booking.travelers} />
              <span className="text-xs text-muted-foreground">
                {booking.travelerCount} traveler{booking.travelerCount !== 1 ? "s" : ""}
                {booking.status === "FULL" ? " · full" : ""}
                {booking.status === "OPEN" && booking.spotsNeededToLock > 0
                  ? ` · ${booking.spotsNeededToLock} more needed to lock`
                  : ""}
              </span>
            </div>

            <p className="mt-1 text-sm font-medium text-stone-700">
              {formatCurrency(booking.property.pricePerRoomCents)}/mo
            </p>
          </div>
        </div>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}

function NoBookingsEmpty() {
  return (
    <Card className="border-dashed">
      <CardContent className="px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">No bookings yet.</p>
        <Link
          href="/search"
          className="mt-4 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Browse properties
        </Link>
      </CardContent>
    </Card>
  )
}

export default async function AccountBookingsPage() {
  const data = await getBookingsPageData()

  return (
    <main className="bg-stone-50/50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            Your Bookings
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Forming pods and confirmed trips in one place.
          </p>
        </div>

        {(data.tabs.pending.length === 0 && data.tabs.committed.length === 0) ? (
          <NoBookingsEmpty />
        ) : (
          <div className="space-y-10">
            {data.tabs.pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
                  Pending Travel Plans
                </h2>
                <div className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {data.tabs.pending.map((booking) => (
                    <BookingRow key={booking.podId} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {data.tabs.committed.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
                  Confirmed Trips
                </h2>
                <div className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {data.tabs.committed.map((booking) => (
                    <BookingRow key={booking.podId} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
