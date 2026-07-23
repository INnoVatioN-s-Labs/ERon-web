import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '@/shared/api/endpoints'
import { requestJson } from '@/shared/api/http-client'
import { asArray, asNumber, asString, isRecord, unwrapApiData } from '@/shared/lib/object'

export type MetaCharacter = {
  id: number
  name: string
  tier: 'S' | 'A' | 'B'
  pickRate: number
  winRate: number
  top3Rate: number
  avgRank: number
  metaScore: number
  sampleConfidence: number
  trend: 'up' | 'down' | 'stable'
}

function normalizePercent(value: number) {
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10
  }

  return Math.round(value * 10) / 10
}

function normalizeNumber(value: unknown, fallback = 0) {
  const numberValue = asNumber(value, Number.NaN)

  return Number.isFinite(numberValue) ? numberValue : fallback
}

function tierByScore(metaScore: number) {
  const score = metaScore * 100

  if (score >= 50) {
    return 'S'
  }

  if (score >= 35) {
    return 'A'
  }

  return 'B'
}

function normalizeMetaCharacter(value: unknown): MetaCharacter | null {
  if (!isRecord(value)) {
    return null
  }

  const id = normalizeNumber(value.characterNum)
  const name = asString(value.characterName) || asString(value.name)

  if (!id || !name) {
    return null
  }

  const pickRate = normalizePercent(normalizeNumber(value.pickRate))
  const winRate = normalizePercent(normalizeNumber(value.winRate))
  const top3Rate = normalizePercent(normalizeNumber(value.top3Rate))
  const avgRank = normalizeNumber(value.averageRank ?? value.avgRank)
  const metaScore = normalizeNumber(value.metaScore)
  const sampleConfidence = normalizeNumber(value.sampleConfidence)

  return {
    id,
    name,
    tier: tierByScore(metaScore),
    pickRate,
    winRate,
    top3Rate,
    avgRank,
    metaScore,
    sampleConfidence,
    trend: 'stable',
  }
}

function normalizeCurrentMetaResponse(value: unknown) {
  const data = unwrapApiData(value)
  const rows = isRecord(data) ? asArray(data.characters) : asArray(data)

  return rows.map(normalizeMetaCharacter).filter((character) => character !== null).slice(0, 5)
}

export function useCurrentCharacterMeta() {
  return useQuery({
    queryKey: ['meta', 'current', 'characters'],
    queryFn: async () => {
      const response = await requestJson<unknown>(apiEndpoints.currentCharacterMeta)

      return normalizeCurrentMetaResponse(response)
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  })
}
