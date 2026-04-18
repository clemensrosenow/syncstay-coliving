import { NextResponse } from 'next/server'
import { z } from 'zod'

import { rankPods, rankPodsRequestSchema } from '@/lib/data/rank-pods'

const rankPodsApiRequestSchema = z.union([
  rankPodsRequestSchema,
  z.object({
    active_user_id: z.string().min(1),
    location_ids: z.array(z.string().min(1)),
    month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
])

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsedBody = rankPodsApiRequestSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: 'Invalid rank pods request',
        details: parsedBody.error.flatten(),
      },
      { status: 400 }
    )
  }

  try {
    const normalizedRequest =
      'activeUserId' in parsedBody.data
        ? parsedBody.data
        : {
            activeUserId: parsedBody.data.active_user_id,
            locationIds: parsedBody.data.location_ids,
            month: parsedBody.data.month,
          }

    const result = await rankPods(normalizedRequest)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status =
      message === 'Active user profile not found'
        ? 404
        : message === 'Active user has no embedding vector'
          ? 400
          : 500

    return NextResponse.json({ error: message }, { status })
  }
}
