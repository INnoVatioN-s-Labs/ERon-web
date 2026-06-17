import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useMatchDetail } from '@/entities/match/api'
import type { MatchDetail, MatchParticipant } from '@/entities/match/types'
import type { PlayerMatch, PlayerSearchResult } from '@/entities/player/types'
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

export function PlayerSearchResultView({
  error,
  isLoading = false,
  result,
  searchedNickname,
}: PlayerSearchResultProps) {
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

  const characterStats = getCharacterStats(result.matches)

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
            <Stat label="티어" value={result.profile.rank ? `#${result.profile.rank}` : '-'} />
            <Stat label="평균 TK" value={formatNumber(result.stats?.averageTeamKills)} />
            <Stat label="승률" value={formatPercent(result.stats?.winRate)} />
            <Stat label="게임 수" value={formatInteger(result.stats?.totalGames)} />
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
              <h3 className="text-sm font-semibold">랭크 실험체 통계</h3>
              <span className="text-xs text-muted-foreground">
                최근 {result.matches.length}게임
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
          {result.matches.length > 0 ? (
            result.matches.map((match) => (
              <MatchPanel key={match.matchId || `${match.character}-${match.playedAt}`} match={match} />
            ))
          ) : (
            <div className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground">
              최근 경기 데이터가 없습니다.
            </div>
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
              <Badge variant={match.rank > 0 && match.rank <= 3 ? 'success' : 'secondary'}>
                #{match.rank || '-'}
              </Badge>
              <p className="font-semibold">{match.character || '-'}</p>
            </div>
            <span className="text-xs text-muted-foreground">{match.playedAt || '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <MiniStat label="K/D/A" value={`${match.kills}/${match.deaths}/${match.assists}`} />
            <MiniStat label="피해량" value={match.damage.toLocaleString()} />
            <MiniStat label="TK" value={formatNumber(match.teamKills)} />
            <MiniStat label="MMR" value={formatSigned(match.mmrGain)} />
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
              <ParticipantTable participants={detailQuery.data.participants} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ParticipantTable({ participants }: { participants: MatchParticipant[] }) {
  return (
    <div className="rounded-lg border border-border/80 bg-background/35 p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>플레이어</TableHead>
            <TableHead>실험체</TableHead>
            <TableHead className="text-right">순위</TableHead>
            <TableHead className="text-right">K/D/A</TableHead>
            <TableHead className="text-right">피해량</TableHead>
            <TableHead className="text-right">받은 피해</TableHead>
            <TableHead className="text-right">동물</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={`${participant.nickname}-${participant.characterName}`}>
              <TableCell className="whitespace-nowrap font-medium">
                {participant.nickname || '-'}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {participant.characterName || '-'}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                #{participant.gameRank || '-'}
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

function average(values: number[]) {
  if (values.length === 0) {
    return undefined
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
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
  return value === undefined || value === 0 ? '-' : value.toFixed(1)
}

function formatInteger(value?: number) {
  return value === undefined || value === 0 ? '-' : Math.round(value).toLocaleString()
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
  return value === undefined || value === 0 ? '-' : `${value.toFixed(1)}%`
}

function formatSigned(value?: number) {
  if (value === undefined || value === 0) {
    return '-'
  }

  return value > 0 ? `+${value}` : String(value)
}
