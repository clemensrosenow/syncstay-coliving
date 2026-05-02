import Link from "next/link"
import { type Metadata } from "next"

import { getBookingsPageData, type BookingCard, type BookingTab } from "./lib/data"

export const metadata: Metadata = {
  title: "My Bookings | SyncStay",
}

type BookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function getSelectedTab(value: string | string[] | undefined): BookingTab {
  return value === "committed" ? "committed" : "pending"
}

function TabLink({
  href,
  isActive,
  label,
  count,
}: {
  href: string
  isActive: boolean
  label: string
  count: number
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50",
      ].join(" ")}
    >
      <span>{label}</span>
      <span
        className={[
          "rounded-full px-2 py-0.5 text-xs",
          isActive ? "bg-white/15 text-white" : "bg-gray-100 text-gray-600",
        ].join(" ")}
      >
        {count}
      </span>
    </Link>
  )
}

function BookingMembers({ travelers }: { travelers: BookingCard["travelers"] }) {
  if (travelers.length === 0) {
    return <p className="text-sm text-gray-500">No traveler details available yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {travelers.map((traveler) => (
        <Link
          key={`${traveler.userId}-${traveler.status}`}
          href={`/account/profile/${traveler.userId}`}
          className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
            {traveler.name.slice(0, 1).toUpperCase()}
          </span>
          <span>{traveler.name}</span>
          <span className="text-xs uppercase tracking-wide text-gray-400">{traveler.status}</span>
        </Link>
      ))}
    </div>
  )
}

function PendingBookingCard({ booking }: { booking: BookingCard }) {
  const progress = Math.min(
    100,
    Math.round((booking.travelerCount / booking.property.minOccupancy) * 100)
  )

  return (
    <article
      id={`${booking.property.id}-${booking.monthValue}`}
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow target:border-emerald-300 target:ring-2 target:ring-emerald-100 target:shadow-emerald-100 target:shadow-md"
    >
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
              Pending pod
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{booking.property.name}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {booking.location.name}, {booking.location.country} · {booking.monthLabel}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-200">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Room rate</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(booking.property.pricePerRoomCents)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
              <span>{booking.travelerCount} travelers committed so far</span>
              <span>{booking.property.minOccupancy} needed to lock</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100">
              <div
                className="h-3 rounded-full bg-gray-900 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-gray-600">
              {booking.spotsNeededToLock > 0
                ? `${booking.spotsNeededToLock} more traveler${booking.spotsNeededToLock === 1 ? "" : "s"} needed before this pod locks.`
                : "This pod has enough travelers and is waiting for the next status sync."}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Pod travelers</p>
            <BookingMembers travelers={booking.travelers} />
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-sm font-medium text-gray-900">Reservation status</p>
          <ul className="mt-3 space-y-3 text-sm text-gray-600">
            <li>Joined on {booking.joinedAtLabel}</li>
            <li>{booking.spotsLeft} room spot{booking.spotsLeft === 1 ? "" : "s"} left in the home</li>
            <li>Your payment remains simulated until minimum occupancy is reached</li>
          </ul>
        </div>
      </div>
    </article>
  )
}

function CommittedBookingCard({ booking }: { booking: BookingCard }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              {booking.status === "FULL" ? "Full pod" : "Committed pod"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{booking.property.name}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {booking.location.name}, {booking.location.country} · {booking.monthLabel}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-emerald-200">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Status</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {booking.status === "FULL" ? "Pod full" : "Pod locked"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Pod travelers</p>
            <BookingMembers travelers={booking.travelers} />
          </div>

          <div className="rounded-2xl bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-900">Trip snapshot</p>
            <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
              <p>Committed on {booking.joinedAtLabel}</p>
              <p>{formatCurrency(booking.property.pricePerRoomCents)} flat room rate</p>
              <p>{booking.travelerCount} total traveler{booking.travelerCount === 1 ? "" : "s"} in pod</p>
              <p>{booking.spotsLeft} remaining room spot{booking.spotsLeft === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gray-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Group chat unlocked</p>
              <p className="mt-2 text-lg font-semibold">Pod Lounge</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
              Mocked preview
            </span>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="font-medium text-white">Trip Concierge</p>
              <p className="mt-1 text-white/70">
                Your pod is locked. Shared planning, arrival coordination, and roommate chat are now available.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="font-medium text-white">Latest update</p>
              <p className="mt-1 text-white/70">
                Everyone in this pod can now coordinate flights, move-in timing, and house preferences together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default async function AccountBookingsPage(props: BookingsPageProps) {
  const [params, data] = await Promise.all([props.searchParams, getBookingsPageData()])
  const selectedTab = getSelectedTab(params.tab)
  const cards = data.tabs[selectedTab]

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 rounded-[2rem] bg-white px-6 py-8 shadow-sm ring-1 ring-gray-200 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-400">
                Account bookings
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
                {data.userName}&rsquo;s travel plans
              </h1>
              <p className="mt-3 max-w-2xl text-base text-gray-600">
                Review your pending pods, track lock progress, and jump into committed trips once the group is confirmed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <TabLink
                href="/account/bookings?tab=pending"
                isActive={selectedTab === "pending"}
                label="Pending"
                count={data.tabs.pending.length}
              />
              <TabLink
                href="/account/bookings?tab=committed"
                isActive={selectedTab === "committed"}
                label="Committed"
                count={data.tabs.committed.length}
              />
            </div>
          </div>
        </div>

        <section className="mt-8 space-y-6">
          {cards.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-8 py-14 text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                No {selectedTab} bookings yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                {selectedTab === "pending"
                  ? "Once you commit to a pod that is still forming, it will appear here with lock progress and your fellow travelers."
                  : "Locked and full pods will appear here as soon as your commitment turns into a confirmed trip."}
              </p>
              <Link
                href="/search"
                className="mt-6 inline-flex rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Browse properties
              </Link>
            </div>
          ) : (
            cards.map((booking) =>
              selectedTab === "pending" ? (
                <PendingBookingCard key={booking.podId} booking={booking} />
              ) : (
                <CommittedBookingCard key={booking.podId} booking={booking} />
              )
            )
          )}
        </section>
      </div>
    </main>
  )
}
