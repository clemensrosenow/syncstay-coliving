import { asc, eq, isNotNull } from "drizzle-orm"
import { AuthView } from "@daveyplate/better-auth-ui"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"

import { users } from "@/auth-schema"
import { db } from "@/db/drizzle"
import { userProfiles } from "@/db/schema"

import { MockPrototypeLogin } from "./MockPrototypeLogin"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({
    params,
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params
    const mockUsers = await db
        .select({
            id: users.id,
            name: users.name,
            image: users.image,
            job: userProfiles.job,
        })
        .from(users)
        .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
        .where(isNotNull(userProfiles.job))
        .orderBy(asc(userProfiles.job), asc(users.name))

    return (
        <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
            <AuthView path={path} />
            {(path === "sign-up" || path === "sign-in") && (
                <MockPrototypeLogin
                    mockUsers={mockUsers}
                />
            )}
        </main>
    )
}
