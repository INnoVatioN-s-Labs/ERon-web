const DEFAULT_SEASON_ID = 39
const DEFAULT_MATCHING_TEAM_MODE = 3

const seasonId = Number(import.meta.env.VITE_ER_SEASON_ID ?? DEFAULT_SEASON_ID)
const matchingTeamMode = Number(
  import.meta.env.VITE_ER_MATCHING_TEAM_MODE ?? DEFAULT_MATCHING_TEAM_MODE,
)
const matchLimit = Number(import.meta.env.VITE_ER_MATCH_LIMIT ?? 50)

export const apiEndpoints = {
  currentCharacterMeta: '/api/er/meta/current/characters',
  skinMetadata: '/api/er/meta/skins',
  rankingTop10: [
    `/api/er/rankings/top?seasonId=${seasonId}&matchingTeamMode=${matchingTeamMode}`,
  ],
  playerSearch: (nickname: string) => {
    const encodedNickname = encodeURIComponent(nickname)

    return [
      `/api/er/users/overview?nickname=${encodedNickname}&seasonId=${seasonId}&matchingTeamMode=${matchingTeamMode}&limit=${matchLimit}&count=${matchLimit}&size=${matchLimit}`,
    ]
  },
  matchDetail: (gameId: string | number) => `/api/er/games/${gameId}`,
  playerGames: (userId: string, next?: string) => {
    const query = new URLSearchParams({
      includeDetails: 'true',
      detailLimit: '5',
    })

    if (next) {
      query.set('next', next)
    }

    return `/api/er/users/${encodeURIComponent(userId)}/games?${query.toString()}`
  },
}
