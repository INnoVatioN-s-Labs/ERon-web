const DEFAULT_SEASON_ID = 39
const DEFAULT_MATCHING_TEAM_MODE = 3

const seasonId = Number(import.meta.env.VITE_ER_SEASON_ID ?? DEFAULT_SEASON_ID)
const matchingTeamMode = Number(
  import.meta.env.VITE_ER_MATCHING_TEAM_MODE ?? DEFAULT_MATCHING_TEAM_MODE,
)

export const apiEndpoints = {
  rankingTop10: [
    `/api/er/rankings/top?seasonId=${seasonId}&matchingTeamMode=${matchingTeamMode}`,
  ],
  playerSearch: (nickname: string) => {
    const encodedNickname = encodeURIComponent(nickname)

    return [
      `/api/er/users/overview?nickname=${encodedNickname}&seasonId=${seasonId}&matchingTeamMode=${matchingTeamMode}`,
    ]
  },
  matchDetail: (gameId: string | number) => `/api/er/games/${gameId}`,
}
