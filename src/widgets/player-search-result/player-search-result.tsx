import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMatchDetail } from '@/entities/match/api'
import type { MatchDetail, MatchParticipant } from '@/entities/match/types'
import { loadPlayerMatches } from '@/entities/player/api'
import type { PlayerMatch, PlayerSearchResult } from '@/entities/player/types'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

type PlayerSearchResultProps = {
  error?: Error | null
  isLoading?: boolean
  result?: PlayerSearchResult
  searchedNickname: string
}

type MatchFilter = 'all' | 'ranked' | 'normal' | 'cobalt' | 'loneWolf' | 'union' | 'cobaltUnion'

const MATCH_FILTERS: { key: MatchFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'ranked', label: '랭크' },
  { key: 'normal', label: '일반' },
  { key: 'cobalt', label: '코발트' },
  { key: 'loneWolf', label: '론울프' },
  { key: 'union', label: '유니온' },
  { key: 'cobaltUnion', label: '코발트 유니온' },
]
const INITIAL_VISIBLE_MATCH_COUNT = 10
const MATCH_LOAD_STEP = 10
const FILTER_PREFETCH_PAGE_LIMIT = 5

export function PlayerSearchResultView({
  error,
  isLoading = false,
  result,
  searchedNickname,
}: PlayerSearchResultProps) {
  const [selectedMatchFilter, setSelectedMatchFilter] = useState<MatchFilter>('all')
  const [visibleMatchCount, setVisibleMatchCount] = useState(INITIAL_VISIBLE_MATCH_COUNT)
  const [loadedMatches, setLoadedMatches] = useState<PlayerMatch[]>([])
  const [nextCursor, setNextCursor] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState('')

  useEffect(() => {
    setLoadedMatches(result?.matches ?? [])
    setNextCursor(result?.next ?? '')
    setVisibleMatchCount(INITIAL_VISIBLE_MATCH_COUNT)
    setLoadMoreError('')
  }, [result])

  if (!searchedNickname) {
    return (
      <StateCard
        description="닉네임을 검색하면 실제 전적이 표시됩니다."
        title="전적 검색"
      >
        백엔드 API에서 유저 정보, 시즌 통계, 최근 경기를 불러옵니다.
      </StateCard>
    )
  }

  if (isLoading) {
    return (
      <StateCard description={`${searchedNickname} 검색 중`} title="전적 검색">
        백엔드 캐시와 전적 데이터를 확인하는 중입니다.
      </StateCard>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>전적 검색</CardTitle>
          <CardDescription>{searchedNickname} 검색 실패</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
            전적 검색 API 연결에 실패했습니다: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return null
  }

  const userId = result.profile.userId

  async function loadMoreMatchPages(
    options: { ensureVisibleCount?: number; filter?: MatchFilter } = {},
  ) {
    const ensureVisibleCount = options.ensureVisibleCount ?? 0
    const targetFilter = options.filter ?? selectedMatchFilter
    let cursor = nextCursor
    let nextMatches = loadedMatches
    let pagesLoaded = 0

    if (!userId || !cursor || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    setLoadMoreError('')
    try {
      while (cursor && pagesLoaded < FILTER_PREFETCH_PAGE_LIMIT) {
        const nextPage = await loadPlayerMatches(userId, cursor)
        nextMatches = [...nextMatches, ...nextPage.matches]
        cursor = nextPage.next ?? ''
        pagesLoaded += 1

        const nextFilteredMatches = filterMatches(nextMatches, targetFilter)
        if (nextFilteredMatches.length >= ensureVisibleCount || !cursor) {
          break
        }
      }

      setLoadedMatches(nextMatches)
      setNextCursor(cursor)
    } catch (loadError) {
      setLoadMoreError(loadError instanceof Error ? loadError.message : String(loadError))
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleLoadMoreMatches() {
    if (visibleMatchCount < filteredMatches.length) {
      setVisibleMatchCount((count) => count + MATCH_LOAD_STEP)
      return
    }
    if (!userId || !nextCursor || isLoadingMore) {
      return
    }

    await loadMoreMatchPages({ ensureVisibleCount: visibleMatchCount + MATCH_LOAD_STEP })
    setVisibleMatchCount((count) => count + MATCH_LOAD_STEP)
  }

  const characterStats = getCharacterStats(loadedMatches)
  const filteredMatches = filterMatches(loadedMatches, selectedMatchFilter)
  const visibleMatches = filteredMatches.slice(0, visibleMatchCount)
  const hasMoreMatches = visibleMatchCount < filteredMatches.length || Boolean(nextCursor)

  return (
    <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{result.profile.nickname}</CardTitle>
              <CardDescription>
                {result.profile.userId || result.profile.userNum || '-'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.profile.rank ? <Badge>#{result.profile.rank}</Badge> : null}
              {result.profile.mmr ? (
                <Badge variant="secondary">{result.profile.mmr.toLocaleString()} RP</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="랭킹" value={result.profile.rank ? `#${result.profile.rank}` : '-'} />
            <Stat label="평균 TK" value={formatNumber(result.stats?.averageTeamKills)} />
            <Stat label="승률" value={formatPercent(result.stats?.winRate)} />
            <Stat label="시즌 게임 수" value={formatInteger(result.stats?.totalGames)} />
            <Stat label="평균 킬" value={formatNumber(result.stats?.averageKills)} />
            <Stat label="TOP2" value={formatPercent(result.stats?.top2Rate)} />
            <Stat label="평균 딜량" value={formatInteger(result.stats?.averageDamage)} />
            <Stat label="평균 어시" value={formatNumber(result.stats?.averageAssists)} />
            <Stat label="TOP3" value={formatPercent(result.stats?.top3Rate)} />
            <Stat label="평균 순위" value={formatNumber(result.stats?.averageRank)} />
            <Stat label="평균 동물 킬" value={formatNumber(result.stats?.averageAnimalKills)} />
            <Stat label="평균 획득 크레딧" value={formatInteger(result.stats?.averageCredits)} />
            <Stat label="평균 시야" value={formatNumber(result.stats?.averageVision)} />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">최근 경기 실험체 통계</h3>
              <span className="text-xs text-muted-foreground">
                최근 {loadedMatches.length}게임
              </span>
            </div>
            <div className="space-y-2">
              {characterStats.length > 0 ? (
                characterStats.map((stat) => (
                  <div
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-border/80 bg-muted/35 p-3"
                    key={stat.character}
                  >
                    <div>
                      <p className="font-medium">{stat.character}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.games}게임 · 평균 순위 {formatNumber(stat.averageRank)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{formatPercent(stat.top3Rate)}</p>
                      <p className="text-xs text-muted-foreground">TOP3</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-border/80 bg-muted/35 p-4 text-sm text-muted-foreground">
                  실험체 통계가 없습니다.
                </div>
              )}
            </div>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">최근 경기</CardTitle>
          <CardDescription>실험체별 경기 기록</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {MATCH_FILTERS.map((filter) => {
              const isSelected = selectedMatchFilter === filter.key

              return (
                <Button
                  className="h-8 px-3 text-xs"
                  key={filter.key}
                  size="sm"
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedMatchFilter(filter.key)
                    setVisibleMatchCount(INITIAL_VISIBLE_MATCH_COUNT)
                    if (filter.key !== selectedMatchFilter && nextCursor) {
                      void loadMoreMatchPages({
                        ensureVisibleCount: INITIAL_VISIBLE_MATCH_COUNT,
                        filter: filter.key,
                      })
                    }
                  }}
                >
                  {filter.label}
                </Button>
              )
            })}
          </div>
          {visibleMatches.length > 0 ? (
            <>
              {visibleMatches.map((match) => (
                <MatchPanel key={match.matchId || `${match.character}-${match.playedAt}`} match={match} />
              ))}
              {loadMoreError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  추가 전적을 불러오지 못했습니다: {loadMoreError}
                </div>
              ) : null}
              <Button
                className="w-full"
                disabled={!hasMoreMatches || isLoadingMore}
                type="button"
                variant="outline"
                onClick={handleLoadMoreMatches}
              >
                {isLoadingMore ? '불러오는 중' : hasMoreMatches ? '더 보기' : '추가 전적 없음'}
                <ChevronDown />
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground">
                선택한 분류의 최근 경기 데이터가 없습니다.
              </div>
              {nextCursor ? (
                <Button
                  className="w-full"
                  disabled={isLoadingMore}
                  type="button"
                  variant="outline"
                  onClick={handleLoadMoreMatches}
                >
                  {isLoadingMore ? '불러오는 중' : '더 보기'}
                  <ChevronDown />
                </Button>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StateCard({
  children,
  description,
  title,
}: {
  children: string
  description: string
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

function MatchPanel({ match }: { match: PlayerMatch }) {
  const [isOpen, setIsOpen] = useState(false)
  const detailQuery = useMatchDetail(match.matchId, isOpen)
  const myParticipant = findMyParticipant(detailQuery.data, match)
  const equipment = myParticipant ? getEquipmentList(myParticipant) : []

  return (
    <div className="rounded-lg border border-border/80 bg-muted/35 p-3">
      <div className="grid gap-4 sm:grid-cols-[112px_1fr_auto]">
        <div className="flex aspect-square items-center justify-center rounded-md border border-primary/20 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.24),hsl(var(--background))_70%)]">
          <span className="px-2 text-center text-sm font-semibold">
            {match.character || '-'}
          </span>
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={getResultBadgeVariant(match)}>
                {getResultLabel(match)}
              </Badge>
              <Badge variant="outline">{match.mode || '-'}</Badge>
              <p className="font-semibold">{match.character || '-'}</p>
            </div>
            <span className="text-xs text-muted-foreground">{match.playedAt || '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <MiniStat label="K/D/A" value={`${match.kills}/${match.deaths}/${match.assists}`} />
            <MiniStat label="피해량" value={match.damage.toLocaleString()} />
            <MiniStat label="TK" value={formatNumber(match.teamKills)} />
            {isRankedResult(match) ? (
              <RankPointStat match={match} />
            ) : (
              <MiniStat label="평점(KDA)" value={formatNumber(getKdaScore(match))} />
            )}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            aria-expanded={isOpen}
            aria-label="경기 상세 보기"
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => setIsOpen((current) => !current)}
          >
            <ChevronDown
              className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
            />
          </Button>
        </div>
      </div>
      {isOpen ? (
        <div className="mt-4 space-y-4 border-t border-border/80 pt-4">
          {detailQuery.isLoading ? (
            <div className="rounded-lg border border-border/80 bg-background/40 p-4 text-sm text-muted-foreground">
              경기 상세를 불러오는 중입니다.
            </div>
          ) : null}
          {detailQuery.error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              경기 상세 API 연결에 실패했습니다: {detailQuery.error.message}
            </div>
          ) : null}
          {detailQuery.data ? (
            <>
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-border/80 bg-background/35 p-4">
                  <h4 className="text-sm font-semibold">내 무기 · 장비 · 전술스킬</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <MiniStat
                      label="무기"
                      value={
                        myParticipant?.bestWeapon
                          ? `${myParticipant.bestWeapon} Lv.${myParticipant.bestWeaponLevel ?? '-'}`
                          : '-'
                      }
                    />
                    <MiniStat label="전술스킬" value={myParticipant?.tacticalSkill || '-'} />
                    <MiniStat label="레벨" value={formatInteger(myParticipant?.characterLevel)} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {equipment.length > 0 ? (
                      equipment.map((item) => (
                        <Badge key={item.slot} variant="outline">
                          {item.slot}: {item.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">장비 정보 없음</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border/80 bg-background/35 p-4">
                  <h4 className="text-sm font-semibold">경기 정보</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <MiniStat label="참가자" value={`${detailQuery.data.participantCount}명`} />
                    <MiniStat label="매치 크기" value={formatInteger(detailQuery.data.matchSize)} />
                    <MiniStat label="플레이 시간" value={formatDuration(detailQuery.data.playTime)} />
                    <MiniStat label="시작 시간" value={detailQuery.data.startDtm || '-'} />
                  </div>
                </div>
              </div>
              <ParticipantTable
                matchingMode={match.matchingMode}
                mode={match.mode}
                participants={detailQuery.data.participants}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ParticipantTable({
  matchingMode,
  mode,
  participants,
}: {
  matchingMode?: number
  mode?: string
  participants: MatchParticipant[]
}) {
  const teams = groupParticipantsByTeam(participants, mode, matchingMode)

  return (
    <div className="space-y-3">
      {teams.map((team) => (
        <div
          className="rounded-lg border border-border/80 bg-background/35"
          key={team.teamNumber ?? 'unknown-team'}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
            <div>
              <h4 className="text-sm font-semibold">
                {team.teamNumber === undefined ? '팀 정보 없음' : `팀 ${team.teamNumber}`}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {team.participants.length}명 · {team.summary.kills}/{team.summary.deaths}/
                {team.summary.assists}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-right text-sm">
              <div>
                <p className="whitespace-nowrap text-xs text-muted-foreground">결과</p>
                <Badge className="mt-0.5" variant={getResultBadgeVariant(team.summary)}>
                  {getResultLabel(team.summary)}
                </Badge>
              </div>
              <MiniStat label="피해량" value={formatInteger(team.summary.damageToPlayer)} />
              <MiniStat label="받은 피해" value={formatInteger(team.summary.damageFromPlayer)} />
            </div>
          </div>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>플레이어</TableHead>
                  <TableHead>실험체</TableHead>
                  <TableHead className="text-right">K/D/A</TableHead>
                  <TableHead className="text-right">피해량</TableHead>
                  <TableHead className="text-right">받은 피해</TableHead>
                  <TableHead className="text-right">동물</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.participants.map((participant) => (
                  <TableRow key={`${participant.nickname}-${participant.characterName}`}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {participant.nickname ? (
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          to={`/players/${encodeURIComponent(participant.nickname)}`}
                        >
                          {participant.nickname}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {participant.characterName || '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {participant.kills}/{participant.deaths}/{participant.assists}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {participant.damageToPlayer.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatInteger(participant.damageFromPlayer)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatInteger(participant.monsterKills)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/35 p-3">
      <p className="whitespace-nowrap text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-nowrap text-lg font-semibold">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="whitespace-nowrap text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-nowrap font-semibold">{value}</p>
    </div>
  )
}

function RankPointStat({ match }: { match: PlayerMatch }) {
  const delta = match.mmrGain

  return (
    <div>
      <p className="whitespace-nowrap text-xs text-muted-foreground">RP</p>
      <p className="mt-0.5 whitespace-nowrap font-semibold">
        {match.rankPoint !== undefined ? (
          <span>{match.rankPoint.toLocaleString()} </span>
        ) : null}
        {delta !== undefined ? (
          <span
            className={cn(
              delta > 0 && 'text-sky-400',
              delta < 0 && 'text-red-400',
            )}
          >
            {formatSigned(delta)}
          </span>
        ) : null}
        {match.rankPoint === undefined && delta === undefined ? '-' : null}
      </p>
    </div>
  )
}

function getCharacterStats(matches: PlayerMatch[]) {
  const grouped = new Map<string, PlayerMatch[]>()

  for (const match of matches) {
    const character = match.character || 'Unknown'
    grouped.set(character, [...(grouped.get(character) ?? []), match])
  }

  return [...grouped.entries()]
    .map(([character, rows]) => ({
      character,
      games: rows.length,
      averageRank: average(rows.map((row) => row.rank).filter(Boolean)),
      top3Rate: (rows.filter((row) => row.rank > 0 && row.rank <= 3).length / rows.length) * 100,
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 5)
}

function isRankedResult(match: PlayerMatch) {
  return match.matchingMode === 3 || match.mode === '랭크'
}

function getKdaScore(match: PlayerMatch) {
  return (match.kills + match.assists) / Math.max(match.deaths, 1)
}

function filterMatches(matches: PlayerMatch[], filter: MatchFilter) {
  if (filter === 'all') {
    return matches
  }

  return matches.filter((match) => getMatchFilter(match) === filter)
}

function getMatchFilter(match: PlayerMatch): Exclude<MatchFilter, 'all'> | undefined {
  const mode = match.mode.toLowerCase()
  const isUnion = match.mode.includes('유니온') || mode.includes('union')
  const isCobalt = isCobaltResult(match)

  if (isCobalt && isUnion) {
    return 'cobaltUnion'
  }

  if (isCobalt) {
    return 'cobalt'
  }

  if (isUnion) {
    return 'union'
  }

  if (match.mode.includes('론 울프') || mode.includes('lone')) {
    return 'loneWolf'
  }

  if (isRankedResult(match)) {
    return 'ranked'
  }

  if (
    match.matchingMode === 1 ||
    match.matchingMode === 2 ||
    match.mode.includes('일반') ||
    mode.includes('normal')
  ) {
    return 'normal'
  }

  return undefined
}

function average(values: number[]) {
  if (values.length === 0) {
    return undefined
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function groupParticipantsByTeam(
  participants: MatchParticipant[],
  mode?: string,
  matchingMode?: number,
) {
  const grouped = new Map<number | undefined, MatchParticipant[]>()

  for (const participant of participants) {
    grouped.set(participant.teamNumber, [
      ...(grouped.get(participant.teamNumber) ?? []),
      participant,
    ])
  }

  return [...grouped.entries()]
    .map(([teamNumber, rows]) => ({
      teamNumber,
      participants: rows.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || '')),
      summary: getTeamSummary(rows, mode, matchingMode),
    }))
    .sort((a, b) => {
      const rankDiff = (a.summary.rank || Number.MAX_SAFE_INTEGER) -
        (b.summary.rank || Number.MAX_SAFE_INTEGER)

      if (rankDiff !== 0) {
        return rankDiff
      }

      return (a.teamNumber ?? Number.MAX_SAFE_INTEGER) -
        (b.teamNumber ?? Number.MAX_SAFE_INTEGER)
    })
}

function getTeamSummary(
  participants: MatchParticipant[],
  mode?: string,
  matchingMode?: number,
) {
  const ranks = participants
    .map((participant) => participant.gameRank)
    .filter((rank): rank is number => rank !== undefined)
  const representative = participants[0]

  return {
    rank: ranks.length > 0 ? Math.min(...ranks) : undefined,
    matchingMode,
    mode,
    victory: representative?.victory,
    outcome: representative?.outcome,
    escape: participants.some((participant) => participant.escape),
    kills: participants.reduce((sum, participant) => sum + participant.kills, 0),
    deaths: participants.reduce((sum, participant) => sum + participant.deaths, 0),
    assists: participants.reduce((sum, participant) => sum + participant.assists, 0),
    damageToPlayer: participants.reduce(
      (sum, participant) => sum + participant.damageToPlayer,
      0,
    ),
    damageFromPlayer: participants.reduce(
      (sum, participant) => sum + (participant.damageFromPlayer ?? 0),
      0,
    ),
  }
}

function getResultBadgeVariant(result: {
  escape?: boolean
  matchingMode?: number
  mode?: string
  outcome?: string
  rank?: number
  victory?: number
}) {
  if (isEscapeResult(result)) {
    return 'escape' as const
  }

  if (isVictoryResult(result)) {
    return 'win' as const
  }

  if (isDefeatResult(result)) {
    return 'loss' as const
  }

  if (result.rank === 2 || result.rank === 3) {
    return 'podium' as const
  }

  return 'loss' as const
}

function getResultLabel(result: {
  escape?: boolean
  matchingMode?: number
  mode?: string
  outcome?: string
  rank?: number
  victory?: number
}) {
  if (isEscapeResult(result)) {
    return '탈출'
  }

  if (isCobaltResult(result) && isVictoryResult(result)) {
    return '승리'
  }

  if (isDefeatResult(result)) {
    return '패배'
  }

  return `#${result.rank || '-'}`
}

function isVictoryResult(result: {
  matchingMode?: number
  mode?: string
  outcome?: string
  rank?: number
  victory?: number
}) {
  const outcome = result.outcome?.toLowerCase()

  return (
    result.victory === 1 ||
    outcome === 'win' ||
    outcome === 'victory' ||
    result.rank === 1
  )
}

function isDefeatResult(result: {
  matchingMode?: number
  mode?: string
  outcome?: string
  rank?: number
  victory?: number
}) {
  const outcome = result.outcome?.toLowerCase()

  return (
    (result.victory !== undefined && result.victory !== 1) ||
    (isCobaltResult(result) && result.rank !== undefined && result.rank > 1) ||
    outcome === 'lose' ||
    outcome === 'loss' ||
    outcome === 'defeat' ||
    result.outcome === '패배'
  )
}

function isCobaltResult(result: { matchingMode?: number; mode?: string }) {
  const mode = result.mode?.toLowerCase()

  return (
    result.matchingMode === 6 ||
    mode?.includes('cobalt') === true ||
    result.mode?.includes('코발트') === true
  )
}

function isEscapeResult(result: { escape?: boolean; outcome?: string }) {
  const outcome = result.outcome?.toLowerCase()

  return (
    result.escape === true ||
    outcome === 'escape' ||
    outcome === 'escaped' ||
    result.outcome === '탈출'
  )
}

function findMyParticipant(detail: MatchDetail | undefined, match: PlayerMatch) {
  if (!detail) {
    return undefined
  }

  return detail.participants.find(
    (participant) =>
      participant.characterName === match.character &&
      participant.gameRank === match.rank &&
      participant.kills === match.kills &&
      participant.assists === match.assists &&
      participant.deaths === match.deaths,
  )
}

function getEquipmentList(participant: MatchParticipant) {
  return Object.entries(participant.equipment)
    .map(([slot, item]) => ({
      slot,
      name: item.itemName || `Item ${item.itemCode ?? '-'}`,
    }))
    .filter((item) => item.name && item.name !== '-')
}

function formatNumber(value?: number) {
  return value === undefined ? '-' : value.toFixed(1)
}

function formatInteger(value?: number) {
  return value === undefined ? '-' : Math.round(value).toLocaleString()
}

function formatDuration(value?: number) {
  if (value === undefined || value === 0) {
    return '-'
  }

  const minutes = Math.floor(value / 60)
  const seconds = value % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatPercent(value?: number) {
  return value === undefined ? '-' : `${value.toFixed(1)}%`
}

function formatSigned(value?: number) {
  if (value === undefined || value === 0) {
    return '-'
  }

  return value > 0 ? `+${value}` : String(value)
}
