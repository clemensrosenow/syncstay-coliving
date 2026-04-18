import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export default async function AccountIndexPage() {
    const session = await auth.api.getSession({
        headers: new Headers(await headers()),
    })

    if (!session?.user?.id) {
        redirect("/auth/sign-in")
    }

    const links = [
        {
            href: "/account/settings",
            label: "Account Settings",
            description: "Manage your signed-in account details and preferences.",
        },
        {
            href: "/account/bookings",
            label: "My Bookings",
            description: "Track pending pods and committed trips.",
        },
        {
            href: `/account/profile/${session.user.id}`,
            label: "My Public Profile",
            description: "Open the public profile page for your traveler identity.",
        },
    ]

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <section className="rounded-[2rem] bg-white px-6 py-8 shadow-sm ring-1 ring-gray-200 md:px-8">
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-400">
                        Account
                    </p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
                        Welcome back, {session.user.name}
                    </h1>
                    <p className="mt-3 max-w-2xl text-base text-gray-600">
                        Jump into your settings, review your bookings, or open your public profile.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="rounded-3xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
                            >
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {link.label}
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    {link.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
