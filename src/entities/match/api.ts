import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '@/shared/api/endpoints'
import { requestJson } from '@/shared/api/http-client'
import { asArray, asNumber, asString, isRecord, unwrapApiData } from '@/shared/lib/object'
import type { EquipmentSummary, MatchDetail, MatchParticipant, TraitSummary } from './types'

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

function normalizeTrait(
  value: unknown,
  slot?: TraitSummary['slot'],
): TraitSummary | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const traitName = asString(
    value.traitName ?? value.name ?? value.traitTypeName ?? value.trait_type_name,
  )

  if (!traitName) {
    return undefined
  }

  return {
    traitCode: asNumber(value.traitCode ?? value.code ?? value.traitType, 0) || undefined,
    traitIconCode:
      asNumber(value.traitIconCode ?? value.trait_icon_code, 0) || undefined,
    traitName,
    category: asString(
      value.category ??
        value.traitCategory ??
        value.trait_category ??
        value.traitGroup ??
        value.trait_group ??
        value.traitTypeName ??
        value.trait_type_name,
    ),
    slot,
  }
}

function normalizeTraits(value: Record<string, unknown>): TraitSummary[] {
  const mainTrait = normalizeTrait(
    value.mainTrait ??
      value.main_trait ??
      value.primaryTrait ??
      value.primary_trait ??
      value.traitFirst ??
      value.trait_first,
    'main',
  )
  const subTraits = asArray(
    value.subTraits ??
      value.sub_traits ??
      value.secondaryTraits ??
      value.secondary_traits ??
      value.traitSecond ??
      value.trait_second ??
      value.traits ??
      value.traitList ??
      value.trait_list,
  )
    .map((trait) => normalizeTrait(trait, 'sub'))
    .filter((trait): trait is TraitSummary => trait !== undefined)

  if (mainTrait) {
    return [mainTrait, ...subTraits]
  }

  return subTraits.map((trait, index) => ({
    ...trait,
    slot: index === 0 ? 'main' : 'sub',
  }))
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
      traits: [],
      equipment: {},
    }
  }
  const routeValue =
    value.routeId ??
    value.route_id ??
    value.routeNumber ??
    value.route_number ??
    value.routeNo ??
    value.route_no ??
    value.routeNum ??
    value.route_num ??
    value.routeCode ??
    value.route_code

  return {
    nickname: asString(value.nickname ?? value.userNickname ?? value.user_nickname),
    teamNumber: asNumber(value.teamNumber ?? value.team_number, 0) || undefined,
    gameRank: asNumber(value.gameRank ?? value.game_rank, 0) || undefined,
    characterNum: asNumber(value.characterNum ?? value.character_num, 0) || undefined,
    skinCode: asNumber(value.skinCode ?? value.skin_code, 0) || undefined,
    characterName: asString(value.characterName ?? value.character_name),
    characterLevel:
      asNumber(value.characterLevel ?? value.character_level, 0) || undefined,
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
    bestWeaponName: asString(value.bestWeaponName ?? value.best_weapon_name),
    bestWeaponLevel: asNumber(value.bestWeaponLevel, 0) || undefined,
    rankPoint: asNumber(value.rankPoint, 0) || undefined,
    victory: asOptionalNumber(value.victory),
    outcome: asString(value.outcome ?? value.result ?? value.gameResult),
    escape: asBoolean(value.escape ?? value.isEscape ?? value.is_escape),
    playTime: asNumber(value.playTime, 0) || undefined,
    tacticalSkillGroupCode:
      asNumber(value.tacticalSkillGroupCode ?? value.tactical_skill_group_code, 0) || undefined,
    tacticalSkill: asString(value.tacticalSkill ?? value.tacticalSkillName),
    subTraitStyle: asString(value.subTraitStyle ?? value.sub_trait_style) || undefined,
    routeNumber: asOptionalNumber(routeValue),
    isRoutePrivate:
      asBoolean(
        value.isRoutePrivate ??
          value.is_route_private ??
          value.routePrivate ??
          value.route_private ??
          value.privateRoute ??
          value.private_route ??
          value.isPrivateRoute ??
          value.is_private_route,
      ) ?? (routeValue == null),
    traits: normalizeTraits(value),
    equipment: normalizeEquipment(value.equipment),
  }
}

function normalizeMatchDetail(value: unknown): MatchDetail {
  const data = unwrapApiData(value)

  if (!isRecord(data)) {
    throw new Error('Invalid match detail response')
  }

  const participants = asArray(
    data.participants ?? data.userGames ?? data.user_games ?? data.players,
  ).map(normalizeParticipant)

  return {
    gameId: asNumber(data.gameId ?? data.game_id),
    seasonId: asNumber(data.seasonId ?? data.season_id, 0) || undefined,
    matchingMode: asNumber(data.matchingMode ?? data.matching_mode, 0) || undefined,
    matchingTeamMode:
      asNumber(data.matchingTeamMode ?? data.matching_team_mode, 0) || undefined,
    startDtm: asString(data.startDtm ?? data.start_dtm ?? data.startedAt),
    duration: asNumber(data.duration, 0) || undefined,
    playTime: asNumber(data.playTime ?? data.play_time, 0) || undefined,
    matchSize: asNumber(data.matchSize ?? data.match_size, 0) || undefined,
    participantCount:
      asNumber(data.participantCount ?? data.participant_count, 0) ||
      participants.length,
    participants,
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
