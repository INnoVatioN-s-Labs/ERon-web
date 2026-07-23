export type EquipmentSummary = {
  itemCode?: number
  itemName: string
  itemGrade?: number
}

export type TraitSummary = {
  traitCode?: number
  traitIconCode?: number
  traitName: string
  category?: string
  slot?: 'main' | 'sub'
}

export type MatchParticipant = {
  nickname: string
  teamNumber?: number
  gameRank?: number
  characterNum?: number
  skinCode?: number
  characterName: string
  characterLevel?: number
  kills: number
  deaths: number
  assists: number
  monsterKills?: number
  teamKills?: number
  damageToPlayer: number
  damageFromPlayer?: number
  damageToMonster?: number
  healAmount?: number
  protectAbsorb?: number
  bestWeapon?: number
  bestWeaponName?: string
  bestWeaponLevel?: number
  rankPoint?: number
  victory?: number
  outcome?: string
  escape?: boolean
  playTime?: number
  tacticalSkillGroupCode?: number
  tacticalSkill?: string
  subTraitStyle?: string
  routeNumber?: number
  isRoutePrivate?: boolean
  traits: TraitSummary[]
  equipment: Record<string, EquipmentSummary>
}

export type MatchDetail = {
  gameId: number
  seasonId?: number
  matchingMode?: number
  matchingTeamMode?: number
  startDtm?: string
  duration?: number
  playTime?: number
  matchSize?: number
  participantCount: number
  participants: MatchParticipant[]
}
