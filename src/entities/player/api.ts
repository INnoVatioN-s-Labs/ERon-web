import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '@/shared/api/endpoints'
import { requestFirstJson } from '@/shared/api/http-client'
import {
  asArray,
  asNumber,
  asString,
  isRecord,
  unwrapApiData,
} from '@/shared/lib/object'
import type { PlayerMatch, PlayerSearchResult, PlayerSeasonStats } from './types'

function normalizePercent(value: number) {
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10
  }

  return Math.round(value * 10) / 10
}

function normalizeStats(value: unknown): PlayerSeasonStats | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    totalGames: asNumber(value.totalGames ?? value.total_games ?? value.gameCount),
    winRate: normalizePercent(asNumber(value.winRate ?? value.win_rate)),
    averageRank: asNumber(
      value.averageRank ?? value.avgRank ?? value.avg_rank ?? value.averageRank,
    ),
    top2Rate: normalizePercent(asNumber(value.top2Rate ?? value.top2_rate)),
    top3Rate: normalizePercent(asNumber(value.top3Rate ?? value.top3_rate)),
    averageKills: asNumber(value.averageKills ?? value.avgKills ?? value.average_kills),
    averageAssists: asNumber(
      value.averageAssists ?? value.avgAssists ?? value.average_assists,
    ),
    averageDeaths: asNumber(
      value.averageDeaths ?? value.avgDeaths ?? value.average_deaths,
    ),
    kda: asNumber(value.kda ?? value.averageKda),
    averageDamage: asNumber(
      value.averageDamage ??
        value.averageDamageToPlayer ??
        value.avgDamage ??
        value.average_damage,
    ),
    averageTeamKills:
      asNumber(value.averageTeamKills ?? value.avgTeamKills, 0) || undefined,
    averageAnimalKills:
      asNumber(value.averageAnimalKills ?? value.avgAnimalKills, 0) || undefined,
    averageCredits:
      asNumber(value.averageCredits ?? value.avgCredits, 0) || undefined,
    averageVision: asNumber(value.averageVision ?? value.avgVision, 0) || undefined,
    mostPlayedCharacterName: asString(value.mostPlayedCharacterName),
  }
}

function normalizeMatch(value: unknown): PlayerMatch {
  if (!isRecord(value)) {
    return {
      matchId: '',
      mode: '',
      character: '',
      rank: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      damage: 0,
      playedAt: '',
    }
  }

  return {
    matchId: asString(value.matchId ?? value.match_id ?? value.id ?? value.gameId),
    mode: asString(value.mode ?? value.matchingMode ?? value.matching_mode, '랭크'),
    character: asString(
      value.character ?? value.characterName ?? value.character_name,
    ),
    rank: asNumber(value.rank ?? value.gameRank ?? value.game_rank),
    kills: asNumber(value.kills ?? value.playerKill),
    deaths: asNumber(value.deaths ?? value.playerDeaths),
    assists: asNumber(value.assists ?? value.playerAssistant),
    damage: asNumber(value.damage ?? value.damageToPlayer ?? value.damage_to_player),
    teamKills: asNumber(value.teamKills ?? value.teamKill, 0) || undefined,
    animalKills: asNumber(value.animalKills ?? value.monsterKill, 0) || undefined,
    credits: asNumber(value.credits ?? value.gainCredit, 0) || undefined,
    vision: asNumber(value.vision ?? value.sightScore, 0) || undefined,
    mmrGain: asNumber(value.mmrGain, 0) || undefined,
    playedAt: asString(value.playedAt ?? value.startedAt ?? value.started_at ?? value.startDtm),
  }
}

function normalizePlayerSearchResponse(value: unknown): PlayerSearchResult {
  const data = unwrapApiData(value)

  if (!isRecord(data)) {
    throw new Error('Invalid player response')
  }

  const profileSource = isRecord(data.profile) ? data.profile : data
  const userSource = isRecord(data.user) ? data.user : profileSource
  const gamesSource = isRecord(data.games) ? data.games : data
  const rankSource = isRecord(data.rank) ? data.rank : {}
  const userRankSource = isRecord(rankSource.userRank) ? rankSource.userRank : rankSource
  const matches = asArray(
    data.matches ??
      data.recentMatches ??
      data.recent_matches ??
      gamesSource.games,
  )
    .map(normalizeMatch)
    .filter((match) => match.matchId || match.character)
  const stats = normalizeStats(
    data.recentStats ?? data.stats ?? data.seasonStats ?? data.season_stats,
  )

  return {
    profile: {
      userId: asString(userSource.userId ?? userSource.user_id),
      userNum: asNumber(userSource.userNum ?? userSource.user_num, 0) || undefined,
      nickname: asString(userSource.nickname ?? userSource.name),
      mmr:
        asNumber(userRankSource.rankScore ?? userRankSource.mmr ?? userRankSource.rp, 0) ||
        undefined,
      rank: asNumber(userRankSource.rank, 0) || undefined,
      updatedAt: asString(profileSource.updatedAt ?? profileSource.lastUpdated ?? profileSource.last_updated),
    },
    stats: stats
      ? {
          ...stats,
          top2Rate:
            stats.top2Rate ||
            normalizePercent(
              matches.length === 0
                ? 0
                : matches.filter((match) => match.rank > 0 && match.rank <= 2).length /
                    matches.length,
            ),
        }
      : undefined,
    matches,
  }
}

export function usePlayerSearch(nickname: string) {
  const trimmedNickname = nickname.trim()

  return useQuery({
    enabled: trimmedNickname.length > 0,
    queryKey: ['player', 'search', trimmedNickname],
    queryFn: async () => {
      const response = await requestFirstJson<unknown>(
        apiEndpoints.playerSearch(trimmedNickname),
      )

      return normalizePlayerSearchResponse(response)
    },
  })
}
