import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db/drizzle'
import { userProfiles } from '@/db/schema'

import {
  type PodRanking,
  type PodRankingMember,
  type RankPodsRequest,
  type RankPodsResponse,
} from './types'

export const rankPodsRequestSchema = z.object({
  activeUserId: z.uuid(),
  locationIds: z.array(z.string().nonempty()),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function rankPods(input: RankPodsRequest): Promise<RankPodsResponse> {
  const activeProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, input.activeUserId),
    columns: {
      embedding: true,
    },
  })

  if (!activeProfile) {
    throw new Error('Active user profile not found')
  }

  if (!activeProfile.embedding) {
    throw new Error('Active user has no embedding vector')
  }

  const activeEmbedding = JSON.stringify(activeProfile.embedding)

  const rankedProperties = await db.query.properties.findMany({
    where:
      input.locationIds.length > 0
        ? (properties, { inArray }) => inArray(properties.locationId, input.locationIds)
        : undefined,
    columns: {
      id: true,
      name: true,
      locationId: true,
    },
    with: {
      pods: {
        where: (pods, { eq }) => eq(pods.month, input.month),
        columns: {
          id: true,
        },
        with: {
          members: {
            where: (members, { inArray }) => inArray(members.status, ['PENDING', 'CONFIRMED']),
            columns: {
              userId: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                },
                with: {
                  profile: {
                    columns: {
                      id: true,
                    },
                    extras: {
                      similarityScore: sql<number | null>`
                        CASE
                          WHEN ${userProfiles.embedding} IS NOT NULL
                            THEN 1 - (${userProfiles.embedding} <=> ${activeEmbedding}::vector)
                          ELSE NULL
                        END
                      `.as('similarity_score'),
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const rankingsByPropertyId = new Map<
    string,
    Omit<PodRanking, 'match_score' | 'members'> & {
      scores: number[]
      members: PodRankingMember[]
    }
  >()

  for (const property of rankedProperties) {
    const pod = property.pods[0] ?? null

    rankingsByPropertyId.set(property.id, {
      property_id: property.id,
      property_name: property.name,
      location_id: property.locationId,
      month: input.month,
      pod_id: pod?.id ?? null,
      scores: [],
      members: [],
    })

    if (!pod) {
      continue
    }

    for (const member of pod.members) {
      const ranking = rankingsByPropertyId.get(property.id)
      const userName = member.user?.name ?? null
      const profile = member.user?.profile ?? null

      if (!ranking || !userName || !profile) {
        continue
      }

      const memberScore = profile.similarityScore ?? 0
      ranking.scores.push(memberScore)
      ranking.members.push({
        name: userName,
        score: memberScore,
      })
    }
  }

  const rankings: PodRanking[] = Array.from(rankingsByPropertyId.values())
    .map(({ scores, members, ...ranking }) => ({
      ...ranking,
      members,
      match_score:
        scores.length > 0 ? scores.reduce((total, score) => total + score, 0) / scores.length : 0,
    }))
    .sort((a, b) => b.match_score - a.match_score)

  return { rankings }
}
