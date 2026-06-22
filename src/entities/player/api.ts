import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '@/shared/api/endpoints'
import { requestFirstJson, requestJson } from '@/shared/api/http-client'
import {
  asArray,
  asNumber,
  asString,
  isRecord,
  unwrapApiData,
} from '@/shared/lib/object'
import type { PlayerMatch, PlayerSearchResult, PlayerSeasonStats } from './types'

const DEFAULT_MATCHING_TEAM_MODE = 3
const currentMatchingTeamMode = Number(
  import.meta.env.VITE_ER_MATCHING_TEAM_MODE ?? DEFAULT_MATCHING_TEAM_MODE,
)

function asIdString(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return ''
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function asOptionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const numericValue = Number(value)

    return Number.isFinite(numericValue) ? numericValue : undefined
  }

  return undefined
}

function normalizePercent(value: number) {
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10
  }

  return Math.round(value * 10) / 10
}

function statRecordFrom(value: unknown) {
  if (!isRecord(value)) {
    return undefined
  }

  const userStats = asArray(value.userStats ?? value.user_stats)
    .filter(isRecord)
  const matchingStat = userStats.find(
    (stat) =>
      asOptionalNumber(stat.matchingTeamMode ?? stat.matching_team_mode) ===
      currentMatchingTeamMode,
  )

  return matchingStat ?? userStats[0] ?? value
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const numericValue = asOptionalNumber(value)

    if (numericValue !== undefined) {
      return numericValue
    }
  }

  return 0
}

function rateFromCounts(count: number, total: number) {
  return total === 0 ? 0 : normalizePercent(count / total)
}

function normalizeStats(value: unknown): PlayerSeasonStats | undefined {
  const stats = statRecordFrom(value)

  if (!stats) {
    return undefined
  }

  const totalGames = firstNumber(
    stats.totalGames,
    stats.total_games,
    stats.gameCount,
    stats.game_count,
    stats.totalGame,
    stats.total_game,
  )
  const winCount = firstNumber(stats.winCount, stats.win_count, stats.wins, stats.win)
  const top2Count = firstNumber(stats.top2Count, stats.top2_count, stats.top2)
  const top3Count = firstNumber(stats.top3Count, stats.top3_count, stats.top3)

  return {
    totalGames,
    winRate: normalizePercent(
      firstNumber(stats.winRate, stats.win_rate) || rateFromCounts(winCount, totalGames),
    ),
    averageRank: asNumber(
      stats.averageRank ?? stats.avgRank ?? stats.avg_rank ?? stats.average_rank,
    ),
    top2Rate: normalizePercent(
      firstNumber(stats.top2Rate, stats.top2_rate) || rateFromCounts(top2Count, totalGames),
    ),
    top3Rate: normalizePercent(
      firstNumber(stats.top3Rate, stats.top3_rate) || rateFromCounts(top3Count, totalGames),
    ),
    averageKills: asNumber(
      stats.averageKills ??
        stats.averageKill ??
        stats.avgKills ??
        stats.avgKill ??
        stats.average_kills ??
        stats.average_kill,
    ),
    averageAssists: asNumber(
      stats.averageAssists ??
        stats.averageAssist ??
        stats.avgAssists ??
        stats.avgAssist ??
        stats.average_assists ??
        stats.average_assist,
    ),
    averageDeaths: asNumber(
      stats.averageDeaths ??
        stats.averageDeath ??
        stats.avgDeaths ??
        stats.avgDeath ??
        stats.average_deaths ??
        stats.average_death,
    ),
    kda: asNumber(stats.kda ?? stats.averageKda ?? stats.average_kda),
    averageDamage: asNumber(
      stats.averageDamage ??
        stats.averageDamageToPlayer ??
        stats.avgDamage ??
        stats.average_damage ??
        stats.average_damage_to_player,
    ),
    averageTeamKills:
      asNumber(
        stats.averageTeamKills ??
          stats.averageTeamKill ??
          stats.avgTeamKills ??
          stats.avgTeamKill ??
          stats.average_team_kills ??
          stats.average_team_kill,
        0,
      ) || undefined,
    averageAnimalKills:
      asNumber(
        stats.averageAnimalKills ??
          stats.averageAnimalKill ??
          stats.averageMonsterKills ??
          stats.averageMonsterKill ??
          stats.avgAnimalKills ??
          stats.avgAnimalKill ??
          stats.avgMonsterKills ??
          stats.avgMonsterKill,
        0,
      ) || undefined,
    averageCredits:
      asNumber(stats.averageCredits ?? stats.averageCredit ?? stats.avgCredits ?? stats.avgCredit, 0) ||
      undefined,
    averageVision:
      asNumber(stats.averageVision ?? stats.averageSight ?? stats.avgVision ?? stats.avgSight, 0) ||
      undefined,
    mostPlayedCharacterName: asString(stats.mostPlayedCharacterName),
  }
}

function isRankedMatch(match: PlayerMatch) {
  return match.mode === '랭크'
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function rate(count: number, total: number) {
  return total === 0 ? 0 : normalizePercent(count / total)
}

function statsFromRankedMatches(matches: PlayerMatch[]): PlayerSeasonStats {
  const rankedMatches = matches.filter(isRankedMatch)

  return {
    totalGames: rankedMatches.length,
    winRate: rate(rankedMatches.filter((match) => match.rank === 1).length, rankedMatches.length),
    averageRank: average(rankedMatches.map((match) => match.rank).filter(Boolean)),
    top2Rate: rate(
      rankedMatches.filter((match) => match.rank > 0 && match.rank <= 2).length,
      rankedMatches.length,
    ),
    top3Rate: rate(
      rankedMatches.filter((match) => match.rank > 0 && match.rank <= 3).length,
      rankedMatches.length,
    ),
    averageKills: average(rankedMatches.map((match) => match.kills)),
    averageAssists: average(rankedMatches.map((match) => match.assists)),
    averageDeaths: average(rankedMatches.map((match) => match.deaths)),
    kda: average(
      rankedMatches.map((match) => (match.kills + match.assists) / Math.max(match.deaths, 1)),
    ),
    averageDamage: average(rankedMatches.map((match) => match.damage)),
    averageTeamKills: average(
      rankedMatches.map((match) => match.teamKills ?? 0).filter((value) => value > 0),
    ),
    averageAnimalKills: average(
      rankedMatches.map((match) => match.animalKills ?? 0).filter((value) => value > 0),
    ),
    averageCredits: average(
      rankedMatches.map((match) => match.credits ?? 0).filter((value) => value > 0),
    ),
    averageVision: average(
      rankedMatches.map((match) => match.vision ?? 0).filter((value) => value > 0),
    ),
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

  const matchingMode = firstOptionalNumber(
    value.matchingMode,
    value.matching_mode,
    value.matchingModeId,
    value.matching_mode_id,
    value.matchMode,
    value.match_mode,
    value.gameMode,
    value.game_mode,
    value.mode,
  )
  const matchingTeamMode = firstOptionalNumber(
    value.matchingTeamMode,
    value.matching_team_mode,
    value.matchingTeamModeId,
    value.matching_team_mode_id,
  )
  const seasonId = firstOptionalNumber(value.seasonId, value.season_id)
  const modeKey = asString(value.modeKey ?? value.mode_key)

  return {
    matchId: asIdString(
      value.matchId ?? value.match_id ?? value.id ?? value.gameId ?? value.game_id,
    ),
    mode: normalizeMatchMode(
      value.mode ??
        value.modeKey ??
        value.mode_key ??
        value.modeName ??
        value.mode_name ??
        value.matchingModeName ??
        value.matching_mode_name ??
        value.matchModeName ??
        value.match_mode_name ??
        value.gameModeName ??
        value.game_mode_name,
      modeKey,
      matchingMode,
      matchingTeamMode,
      seasonId,
    ),
    matchingMode,
    matchingTeamMode,
    seasonId,
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
    rankPoint: asOptionalNumber(
      value.rankPoint ?? value.rank_point ?? value.rp ?? value.mmr,
    ),
    mmrGain: asOptionalNumber(
      value.mmrGain ??
        value.mmr_gain ??
        value.rankPointGain ??
        value.rank_point_gain ??
        value.rpGain ??
        value.rp_gain,
    ),
    victory: asOptionalNumber(value.victory),
    outcome: asString(value.outcome ?? value.result ?? value.gameResult),
    escape: asBoolean(value.escape ?? value.isEscape ?? value.is_escape),
    playedAt: asString(value.playedAt ?? value.startedAt ?? value.started_at ?? value.startDtm),
  }
}

function firstOptionalNumber(...values: unknown[]) {
  for (const value of values) {
    const numericValue = asOptionalNumber(value)

    if (numericValue !== undefined) {
      return numericValue
    }
  }

  return undefined
}

function normalizeMatchMode(
  value: unknown,
  modeKey: string,
  matchingMode?: number,
  matchingTeamMode?: number,
  seasonId?: number,
) {
  if (modeKey === 'ranked') {
    return '랭크'
  }
  if (modeKey === 'normal') {
    return '일반'
  }
  if (modeKey === 'cobalt') {
    return '코발트'
  }
  if (modeKey === 'union') {
    return '유니온'
  }
  if (modeKey === 'cobaltUnion') {
    return '코발트 유니온'
  }
  if (modeKey === 'loneWolf') {
    return '론 울프'
  }

  const numericMode = asOptionalNumber(value) ?? matchingMode

  if (numericMode === 2 || numericMode === 1) {
    return '일반'
  }

  if (numericMode === 3) {
    return '랭크'
  }

  if (numericMode === 6) {
    return '코발트'
  }

  const mode = asString(value)

  if (
    (mode.includes('코발트') || mode.toLowerCase().includes('cobalt')) &&
    (mode.includes('유니온') || mode.toLowerCase().includes('union'))
  ) {
    return '코발트 유니온'
  }

  if (mode.includes('유니온') || mode.toLowerCase().includes('union')) {
    return '유니온'
  }

  if (mode.includes('일반') || mode.toLowerCase().includes('normal')) {
    return '일반'
  }

  if (mode.includes('랭크') || mode.toLowerCase().includes('rank')) {
    return '랭크'
  }

  if (mode.includes('코발트') || mode.toLowerCase().includes('cobalt')) {
    return '코발트'
  }

  if (mode.includes('론 울프') || mode.toLowerCase().includes('lone')) {
    return '론 울프'
  }

  if (seasonId !== undefined && seasonId > 0) {
    return '랭크'
  }

  if (matchingTeamMode === 1) {
    return '론 울프'
  }

  return mode || '기타'
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
  const responseStats = normalizeStats(
    data.recentStats ?? data.stats ?? data.seasonStats ?? data.season_stats,
  )
  const matchStats = statsFromRankedMatches(matches)
  const stats = responseStats
    ? {
        ...responseStats,
        totalGames: responseStats.totalGames || matchStats.totalGames,
        winRate: responseStats.winRate || matchStats.winRate,
        averageRank: responseStats.averageRank || matchStats.averageRank,
        top2Rate: responseStats.top2Rate || matchStats.top2Rate,
        top3Rate: responseStats.top3Rate || matchStats.top3Rate,
        averageKills: responseStats.averageKills || matchStats.averageKills,
        averageAssists: responseStats.averageAssists || matchStats.averageAssists,
        averageDeaths: responseStats.averageDeaths || matchStats.averageDeaths,
        kda: responseStats.kda || matchStats.kda,
        averageDamage: responseStats.averageDamage || matchStats.averageDamage,
        averageTeamKills: responseStats.averageTeamKills || matchStats.averageTeamKills,
        averageAnimalKills: responseStats.averageAnimalKills || matchStats.averageAnimalKills,
        averageCredits: responseStats.averageCredits || matchStats.averageCredits,
        averageVision: responseStats.averageVision || matchStats.averageVision,
      }
    : matchStats

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
    stats,
    matches,
    next: asIdString(gamesSource.next ?? data.next),
  }
}

function normalizePlayerGamesResponse(value: unknown) {
  const data = unwrapApiData(value)

  if (!isRecord(data)) {
    throw new Error('Invalid player games response')
  }

  return {
    matches: asArray(data.games ?? data.userGames ?? data.user_games)
      .map(normalizeMatch)
      .filter((match) => match.matchId || match.character),
    next: asIdString(data.next),
  }
}

export async function loadPlayerMatches(userId: string, next?: string) {
  const response = await requestJson<unknown>(apiEndpoints.playerGames(userId, next))

  return normalizePlayerGamesResponse(response)
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
