export type PlayerProfile = {
  userId: string
  userNum?: number
  nickname: string
  tier?: string
  mmr?: number
  rank?: number
  updatedAt: string
}

export type PlayerSeasonStats = {
  totalGames: number
  winRate: number
  averageRank: number
  top2Rate: number
  top3Rate: number
  averageKills: number
  averageAssists: number
  averageDeaths: number
  kda: number
  averageDamage: number
  averageTeamKills?: number
  averageAnimalKills?: number
  averageCredits?: number
  averageVision?: number
  mostPlayedCharacterName?: string
}

export type PlayerMatch = {
  matchId: string
  mode: string
  matchingMode?: number
  matchingTeamMode?: number
  seasonId?: number
  characterNum?: number
  skinCode?: number
  character: string
  bestWeapon?: number
  bestWeaponName?: string
  bestWeaponLevel?: number
  tacticalSkillGroupCode?: number
  tacticalSkill?: string
  subTraitStyle?: string
  traits?: Array<{
    traitCode?: number
    traitIconCode?: number
    traitName: string
    category?: string
    slot?: 'main' | 'sub'
  }>
  routeNumber?: number
  isRoutePrivate?: boolean
  rank: number
  kills: number
  deaths: number
  assists: number
  damage: number
  teamKills?: number
  animalKills?: number
  credits?: number
  vision?: number
  rankPoint?: number
  mmrGain?: number
  victory?: number
  outcome?: string
  escape?: boolean
  playedAt: string
}

export type PlayerSearchResult = {
  profile: PlayerProfile
  stats?: PlayerSeasonStats
  matches: PlayerMatch[]
  next?: string
}
