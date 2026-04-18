import Link from "next/link"
import { type Metadata } from "next"

import { getPublicProfileData } from "./lib/data"

export const dynamic = "force-dynamic"

type PublicProfilePageProps = {
  params: Promise<{ userId: string }>
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "Not provided"
  }

  const date = typeof value === "string" ? new Date(`${value}T00:00:00.000Z`) : value

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function formatMonth(month: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}T00:00:00.000Z`))
}

function formatHour(hour: number | null) {
  if (hour === null) {
    return "Not provided"
  }

  return `${String(hour).padStart(2, "0")}:00`
}

function formatEnumLabel(value: string | null) {
  if (!value) {
    return "Not provided"
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatLikert(value: number | null) {
  return value === null ? "Not provided" : `${value} / 5`
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <p className="mt-2 text-base font-medium text-gray-900">{value}</p>
    </div>
  )
}

export async function generateMetadata(props: PublicProfilePageProps): Promise<Metadata> {
  const { userId } = await props.params
  const data = await getPublicProfileData(userId)

  return {
    title: `${data.user.name} | Public Profile | SyncStay`,
    description: `Public SyncStay traveler profile for ${data.user.name}.`,
  }
}

export default async function PublicProfilePage(props: PublicProfilePageProps) {
  const { userId } = await props.params
  const data = await getPublicProfileData(userId)

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-200">
          <div className="bg-gray-900 px-6 py-10 text-white md:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/60">
              Public traveler profile
            </p>
            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">
                  {data.user.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight">{data.user.name}</h1>
                  <p className="mt-2 text-sm text-white/70">
                    Member since {formatDate(data.user.createdAt)}
                  </p>
                </div>
              </div>

              <Link
                href="/search"
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Explore SyncStay homes
              </Link>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-8 md:px-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Profile overview</h2>
              <p className="mt-3 text-gray-600">
                {data.profile.bio ?? "This traveler has not added a public bio yet."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Lifestyle fit</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Stat label="Birthday" value={formatDate(data.profile.birthday)} />
                <Stat label="Chronotype" value={formatEnumLabel(data.profile.chronotype)} />
                <Stat label="Work style" value={formatEnumLabel(data.profile.workStyle)} />
                <Stat
                  label="Work hours"
                  value={`${formatHour(data.profile.workStartHour)} to ${formatHour(data.profile.workEndHour)}`}
                />
                <Stat label="Cleanliness" value={formatLikert(data.profile.cleanliness)} />
                <Stat label="Social energy" value={formatLikert(data.profile.socialEnergy)} />
                <Stat label="Budget tier" value={formatEnumLabel(data.profile.budgetTier)} />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Interests</h2>
              {data.tags.length === 0 ? (
                <p className="mt-3 text-gray-600">No interest tags available.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Booking history</h2>
              {data.bookings.length === 0 ? (
                <p className="mt-3 text-gray-600">No pod activity has been recorded for this traveler yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {data.bookings.map((booking) => (
                    <article
                      key={`${booking.podId}-${booking.joinedAt.toISOString()}`}
                      className="rounded-3xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {booking.propertyName}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {booking.locationName}, {booking.locationCountry} · {formatMonth(booking.month)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.2em]">
                          <span className="rounded-full bg-white px-3 py-2 text-gray-600 ring-1 ring-gray-200">
                            Member {booking.status}
                          </span>
                          <span className="rounded-full bg-white px-3 py-2 text-gray-600 ring-1 ring-gray-200">
                            Pod {booking.podStatus}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-gray-600">
                        Joined this pod on {formatDate(booking.joinedAt)}.
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Profile metadata</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Stat label="User ID" value={data.user.id} />
                <Stat label="Profile ID" value={data.profile.id ?? "No profile row"} />
                <Stat label="Profile created" value={formatDate(data.profile.createdAt)} />
                <Stat label="Profile updated" value={formatDate(data.profile.updatedAt)} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
