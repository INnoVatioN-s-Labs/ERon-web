export type PlayerProfile = {
  userId: string
  userNum?: number
  nickname: string
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
  character: string
  rank: number
  kills: number
  deaths: number
  assists: number
  damage: number
  teamKills?: number
  animalKills?: number
  credits?: number
  vision?: number
  mmrGain?: number
  playedAt: string
}

export type PlayerSearchResult = {
  profile: PlayerProfile
  stats?: PlayerSeasonStats
  matches: PlayerMatch[]
}
