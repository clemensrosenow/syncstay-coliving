import Link from "next/link"
import { type Metadata } from "next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import { getPublicProfileData } from "./lib/data"
import { TagBadge } from "@/components/tag-icon"

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

function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null
  const birth = new Date(`${birthday}T00:00:00.000Z`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function memberStatusVariant(status: "PENDING" | "CONFIRMED" | "WITHDRAWN") {
  if (status === "CONFIRMED") return "default" as const
  if (status === "PENDING") return "secondary" as const
  return "outline" as const
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

  const age = calculateAge(data.profile.birthday)

  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <header className="pt-12">
          <div className="flex items-center gap-6">
            <Avatar className="size-[72px] shrink-0">
              <AvatarImage src={data.user.image ?? undefined} alt={data.user.name} />
              <AvatarFallback className="text-2xl font-semibold">
                {data.user.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-foreground leading-none">
                {data.user.name}
              </h1>
              {(data.profile.job || data.profile.city || data.profile.country) && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {[
                    data.profile.job,
                    [data.profile.city, data.profile.country].filter(Boolean).join(", "),
                    age !== null ? `${age} years old` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed">
            {data.profile.bio ?? "This traveler has not added a public bio yet."}
          </p>
        </header>

        {data.tags.length > 0 && (
          <section className="mt-7 flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                variant="outline"
                className="rounded-full px-3 py-1 text-sm font-normal gap-1.5"
              />
            ))}
          </section>
        )}

        <Separator className="mt-10"/>

        <section className="py-10">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
            Lifestyle
          </h2>

          {(data.profile.cleanliness !== null || data.profile.socialEnergy !== null) && (
            <div className="mt-6 space-y-5">
              {data.profile.cleanliness !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Cleanliness</p>
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {data.profile.cleanliness} / 5
                    </p>
                  </div>
                  <Progress value={(data.profile.cleanliness / 5) * 100} />
                </div>
              )}
              {data.profile.socialEnergy !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Social energy</p>
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {data.profile.socialEnergy} / 5
                    </p>
                  </div>
                  <Progress value={(data.profile.socialEnergy / 5) * 100} />
                </div>
              )}
            </div>
          )}

          <dl className="mt-6 divide-y divide-border">
            {(data.profile.chronotype || data.profile.workStartHour !== null) && (
              <div className="flex items-baseline justify-between gap-8 py-3">
                <dt className="text-sm text-muted-foreground shrink-0">Daily rhythm</dt>
                <dd className="text-sm font-medium text-foreground text-right">
                  {[
                    formatEnumLabel(data.profile.chronotype),
                    data.profile.workStartHour !== null
                      ? `${formatHour(data.profile.workStartHour)} – ${formatHour(data.profile.workEndHour)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
            )}
            {data.profile.workStyle && (
              <div className="flex items-baseline justify-between gap-8 py-3">
                <dt className="text-sm text-muted-foreground shrink-0">Work style</dt>
                <dd className="text-sm font-medium text-foreground text-right">
                  {formatEnumLabel(data.profile.workStyle)}
                </dd>
              </div>
            )}
            {data.profile.budgetTier && (
              <div className="flex items-baseline justify-between gap-8 py-3">
                <dt className="text-sm text-muted-foreground shrink-0">Budget tier</dt>
                <dd className="text-sm font-medium text-foreground text-right">
                  {formatEnumLabel(data.profile.budgetTier)}
                </dd>
              </div>
            )}
          </dl>
        </section>



        <Separator />

        <section className="py-10">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
            Booking history
          </h2>
          {data.bookings.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No pod activity has been recorded for this traveler yet.
            </p>
          ) : (
            <ol className="mt-6 divide-y divide-border">
              {data.bookings.map((booking) => (
                <li
                  key={`${booking.podId}-${booking.joinedAt.toISOString()}`}
                  className="py-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground">
                      {booking.propertyName}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {booking.locationName}, {booking.locationCountry}
                      <span className="mx-2">·</span>
                      {formatMonth(booking.month)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Joined {formatDate(booking.joinedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={memberStatusVariant(booking.status)}>
                      Member {booking.status.toLowerCase()}
                    </Badge>
                    <Badge variant="outline">Pod {booking.podStatus.toLowerCase()}</Badge>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  )
}
