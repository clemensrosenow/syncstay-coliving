'use server'

import { headers } from 'next/headers'
import { and, count, eq, inArray } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/db/drizzle'
import { podMembers, pods, properties } from '@/db/schema'

export type JoinPodResult =
  | { ok: true; podId: string; propertyId: string; month: string }
  | { ok: false; error: 'unauthorized' | 'invalid_params' | 'not_found' | 'already_booked' | 'pod_full' }

async function syncPodStatus(podId: string, minOccupancy: number, totalRooms: number) {
  const [{ value: memberCount }] = await db
    .select({ value: count() })
    .from(podMembers)
    .where(and(eq(podMembers.podId, podId), inArray(podMembers.status, ['PENDING', 'CONFIRMED'])))

  const newStatus = memberCount >= totalRooms ? 'FULL' : memberCount >= minOccupancy ? 'LOCKED' : 'OPEN'

  const now = new Date()
  await db
    .update(pods)
    .set({
      status: newStatus,
      lockedAt: newStatus === 'LOCKED' ? now : undefined,
      filledAt: newStatus === 'FULL' ? now : undefined,
    })
    .where(and(eq(pods.id, podId), eq(pods.status, newStatus === 'FULL' ? 'LOCKED' : 'OPEN')))
}

export async function joinPod(propertyId: string, month: string): Promise<JoinPodResult> {
  const session = await auth.api.getSession({ headers: new Headers(await headers()) })
  if (!session?.user?.id) return { ok: false, error: 'unauthorized' }

  const userId = session.user.id

  if (!propertyId || !/^\d{4}-\d{2}$/.test(month)) {
    return { ok: false, error: 'invalid_params' }
  }

  const monthDate = `${month}-01`

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    columns: { id: true, minOccupancy: true, totalRooms: true },
  })
  if (!property) return { ok: false, error: 'not_found' }

  // Create pod if it doesn't exist yet for this property+month
  await db.insert(pods).values({ propertyId, month: monthDate }).onConflictDoNothing()

  const pod = await db.query.pods.findFirst({
    where: and(eq(pods.propertyId, propertyId), eq(pods.month, monthDate)),
    columns: { id: true, status: true },
  })
  if (!pod) return { ok: false, error: 'not_found' }

  if (pod.status === 'FULL') return { ok: false, error: 'pod_full' }

  // Check for any non-withdrawn membership
  const existing = await db.query.podMembers.findFirst({
    where: and(eq(podMembers.podId, pod.id), eq(podMembers.userId, userId)),
    columns: { id: true, status: true },
  })

  if (existing) {
    if (existing.status !== 'WITHDRAWN') return { ok: false, error: 'already_booked' }
    await db
      .update(podMembers)
      .set({ status: 'PENDING', joinedAt: new Date() })
      .where(eq(podMembers.id, existing.id))
  } else {
    try {
      await db.insert(podMembers).values({ podId: pod.id, userId, status: 'PENDING' })
    } catch {
      // Unique constraint violation — race condition, treat as already booked
      return { ok: false, error: 'already_booked' }
    }
  }

  await syncPodStatus(pod.id, property.minOccupancy, property.totalRooms)

  return { ok: true, podId: pod.id, propertyId, month }
}
