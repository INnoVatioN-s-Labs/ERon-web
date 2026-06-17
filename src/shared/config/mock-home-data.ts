export type MetaCharacter = {
  id: number
  name: string
  tier: 'S' | 'A' | 'B'
  pickRate: number
  winRate: number
  avgRank: number
  trend: 'up' | 'down' | 'stable'
}

export type RankedPlayer = {
  rank: number
  nickname: string
  rp: number
  winRate: number
  top3Rate: number
  games: number
}

export type RecentMatch = {
  id: string
  mode: string
  character: string
  rank: number
  kills: number
  assists: number
  damage: number
  playedAt: string
}

export type PatchNote = {
  version: string
  title: string
  summary: string
}

export const metaCharacters: MetaCharacter[] = [
  {
    id: 1,
    name: '레녹스',
    tier: 'S',
    pickRate: 18.6,
    winRate: 54.2,
    avgRank: 3.1,
    trend: 'up',
  },
  {
    id: 2,
    name: '아비게일',
    tier: 'S',
    pickRate: 15.8,
    winRate: 53.4,
    avgRank: 3.3,
    trend: 'stable',
  },
  {
    id: 3,
    name: '마커스',
    tier: 'A',
    pickRate: 12.9,
    winRate: 51.8,
    avgRank: 3.8,
    trend: 'up',
  },
  {
    id: 4,
    name: '셀린',
    tier: 'A',
    pickRate: 10.7,
    winRate: 50.9,
    avgRank: 4.0,
    trend: 'down',
  },
]

export const rankedPlayers: RankedPlayer[] = [
  {
    rank: 1,
    nickname: 'EROnMaster',
    rp: 8214,
    winRate: 31.6,
    top3Rate: 72.4,
    games: 286,
  },
  {
    rank: 2,
    nickname: '루미아분석가',
    rp: 8072,
    winRate: 29.8,
    top3Rate: 70.1,
    games: 311,
  },
  {
    rank: 3,
    nickname: 'RoutePlanner',
    rp: 7920,
    winRate: 28.9,
    top3Rate: 68.8,
    games: 254,
  },
  {
    rank: 4,
    nickname: 'MetaReader',
    rp: 7818,
    winRate: 27.5,
    top3Rate: 67.9,
    games: 303,
  },
]

export const recentMatches: RecentMatch[] = [
  {
    id: 'match-1',
    mode: '랭크',
    character: '레녹스',
    rank: 1,
    kills: 7,
    assists: 9,
    damage: 28491,
    playedAt: '12분 전',
  },
  {
    id: 'match-2',
    mode: '랭크',
    character: '아야',
    rank: 3,
    kills: 4,
    assists: 11,
    damage: 21308,
    playedAt: '36분 전',
  },
  {
    id: 'match-3',
    mode: '일반',
    character: '재키',
    rank: 5,
    kills: 5,
    assists: 6,
    damage: 19220,
    playedAt: '1시간 전',
  },
]

export const patchNote: PatchNote = {
  version: '1.44',
  title: '근거리 실험체 밸런스 조정',
  summary: '상위권 픽률이 높은 전방 교전 실험체의 초반 성장 곡선을 조정했습니다.',
}
