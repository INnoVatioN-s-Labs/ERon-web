import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '@/shared/api/endpoints'
import { requestJson } from '@/shared/api/http-client'
import { asNumber, asString, isRecord } from '@/shared/lib/object'
import type { EquipmentSummary, MatchDetail, MatchParticipant } from './types'

function normalizeEquipment(value: unknown): Record<string, EquipmentSummary> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, Record<string, unknown>] => isRecord(entry[1]))
      .map(([slot, item]) => [
        slot,
        {
          itemCode: asNumber(item.itemCode, 0) || undefined,
          itemName: asString(item.itemName, '-'),
          itemGrade: asNumber(item.itemGrade, 0) || undefined,
        },
      ]),
  )
}

function normalizeParticipant(value: unknown): MatchParticipant {
  if (!isRecord(value)) {
    return {
      nickname: '',
      characterName: '',
      kills: 0,
      deaths: 0,
      assists: 0,
      damageToPlayer: 0,
      equipment: {},
    }
  }

  return {
    nickname: asString(value.nickname),
    teamNumber: asNumber(value.teamNumber, 0) || undefined,
    gameRank: asNumber(value.gameRank, 0) || undefined,
    characterNum: asNumber(value.characterNum, 0) || undefined,
    characterName: asString(value.characterName),
    characterLevel: asNumber(value.characterLevel, 0) || undefined,
    kills: asNumber(value.playerKill ?? value.kills),
    deaths: asNumber(value.playerDeaths ?? value.deaths),
    assists: asNumber(value.playerAssistant ?? value.assists),
    monsterKills: asNumber(value.monsterKill, 0) || undefined,
    teamKills: asNumber(value.teamKill, 0) || undefined,
    damageToPlayer: asNumber(value.damageToPlayer),
    damageFromPlayer: asNumber(value.damageFromPlayer, 0) || undefined,
    damageToMonster: asNumber(value.damageToMonster, 0) || undefined,
    healAmount: asNumber(value.healAmount, 0) || undefined,
    protectAbsorb: asNumber(value.protectAbsorb, 0) || undefined,
    bestWeapon: asNumber(value.bestWeapon, 0) || undefined,
    bestWeaponLevel: asNumber(value.bestWeaponLevel, 0) || undefined,
    rankPoint: asNumber(value.rankPoint, 0) || undefined,
    victory: asNumber(value.victory, 0) || undefined,
    playTime: asNumber(value.playTime, 0) || undefined,
    tacticalSkill: asString(value.tacticalSkill ?? value.tacticalSkillName),
    equipment: normalizeEquipment(value.equipment),
  }
}

function normalizeMatchDetail(value: unknown): MatchDetail {
  if (!isRecord(value)) {
    throw new Error('Invalid match detail response')
  }

  return {
    gameId: asNumber(value.gameId),
    seasonId: asNumber(value.seasonId, 0) || undefined,
    matchingMode: asNumber(value.matchingMode, 0) || undefined,
    matchingTeamMode: asNumber(value.matchingTeamMode, 0) || undefined,
    startDtm: asString(value.startDtm),
    duration: asNumber(value.duration, 0) || undefined,
    playTime: asNumber(value.playTime, 0) || undefined,
    matchSize: asNumber(value.matchSize, 0) || undefined,
    participantCount: asNumber(value.participantCount),
    participants: Array.isArray(value.participants)
      ? value.participants.map(normalizeParticipant)
      : [],
  }
}

export function useMatchDetail(gameId: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && gameId.length > 0,
    queryKey: ['match', gameId],
    queryFn: async () => {
      const response = await requestJson<unknown>(apiEndpoints.matchDetail(gameId))

      return normalizeMatchDetail(response)
    },
  })
}
