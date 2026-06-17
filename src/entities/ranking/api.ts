import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '@/shared/api/endpoints'
import { requestFirstJson } from '@/shared/api/http-client'
import { asArray, asNumber, asString, isRecord, unwrapApiData } from '@/shared/lib/object'
import type { RankedPlayer } from './types'

function firstNumber(value: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const numberValue = asNumber(value[key], Number.NaN)

    if (Number.isFinite(numberValue)) {
      return numberValue
    }
  }

  return fallback
}

function firstString(value: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const stringValue = asString(value[key])

    if (stringValue) {
      return stringValue
    }
  }

  return fallback
}

function normalizePercent(value: number) {
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10
  }

  return Math.round(value * 10) / 10
}

function characterName(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (!isRecord(value)) {
    return ''
  }

  return firstString(value, ['characterName', 'name', 'localizedName'])
}

function normalizeMostCharacters(value: Record<string, unknown>) {
  const rawCharacters =
    value.mostCharacters ??
    value.mostPlayedCharacters ??
    value.mostExperiments ??
    value.topCharacters ??
    value.characters

  return asArray(rawCharacters).map(characterName).filter(Boolean).slice(0, 4)
}

function normalizeRankedPlayer(value: unknown, index: number): RankedPlayer {
  if (!isRecord(value)) {
    return {
      rank: index + 1,
      nickname: '',
      tier: '-',
      rp: 0,
      top3Rate: 0,
      averageRank: 0,
      averageKills: 0,
      games: 0,
      mostCharacters: [],
    }
  }

  return {
    rank: firstNumber(value, ['rank', 'ranking'], index + 1),
    nickname: firstString(value, ['nickname', 'userNickname', 'name']),
    userNum: firstNumber(value, ['userNum', 'userId'], 0) || undefined,
    tier: firstString(value, ['tier', 'tierName', 'rankTier'], '-'),
    rp: firstNumber(value, ['rp', 'rankPoint', 'rankScore', 'mmr', 'rating']),
    top3Rate: normalizePercent(
      firstNumber(value, ['top3Rate', 'top3_rate', 'topRate', 'averageTop3']),
    ),
    averageRank: firstNumber(value, ['averageRank', 'avgRank', 'avg_rank']),
    averageKills: firstNumber(value, ['averageKills', 'avgKills', 'avg_kills']),
    games: firstNumber(value, ['games', 'totalGames', 'total_games', 'totalGame']),
    mostCharacters: normalizeMostCharacters(value),
  }
}

function normalizeRankingResponse(value: unknown): RankedPlayer[] {
  const data = unwrapApiData(value)
  const rows = isRecord(data)
    ? asArray(
        data.topRanks ??
          data.userRanks ??
          data.ranks ??
          data.rankings ??
          data.players ??
          data.list,
      )
    : asArray(data)

  return rows.map(normalizeRankedPlayer).filter((player) => player.nickname)
}

export function useTopRankings() {
  return useQuery({
    queryKey: ['ranking', 'top10'],
    queryFn: async () => {
      const response = await requestFirstJson<unknown>(apiEndpoints.rankingTop10)

      return normalizeRankingResponse(response).slice(0, 10)
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  })
}
