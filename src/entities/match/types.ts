export type EquipmentSummary = {
  itemCode?: number
  itemName: string
  itemGrade?: number
}

export type MatchParticipant = {
  nickname: string
  teamNumber?: number
  gameRank?: number
  characterNum?: number
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
  bestWeaponLevel?: number
  rankPoint?: number
  victory?: number
  playTime?: number
  tacticalSkill?: string
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
