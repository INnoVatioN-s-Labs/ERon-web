import { Link } from 'react-router-dom'
import type { RankedPlayer } from '@/entities/ranking/types'
import { Badge } from '@/shared/ui/badge'
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

type RankingPreviewProps = {
  error?: Error | null
  isFetching?: boolean
  isLoading?: boolean
  players: RankedPlayer[]
}

export function RankingPreview({
  error,
  isFetching = false,
  isLoading = false,
  players,
}: RankingPreviewProps) {
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>랭킹 TOP 10</CardTitle>
          <CardDescription>티어, RP, 평균 순위, TOP3, 평균 킬</CardDescription>
        </div>
        <Badge variant={isFetching ? 'success' : 'outline'}>
          {isFetching ? 'LIVE' : 'READY'}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground">
            랭킹 데이터를 불러오는 중입니다.
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
            랭킹 API 연결에 실패했습니다: {error.message}
          </div>
        ) : null}
        {!isLoading && !error && players.length === 0 ? (
          <div className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground">
            표시할 랭킹 데이터가 없습니다.
          </div>
        ) : null}
        {!isLoading && !error && players.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-40">플레이어</TableHead>
                <TableHead>티어</TableHead>
                <TableHead className="text-right">RP</TableHead>
                <TableHead className="whitespace-nowrap text-right">평균 순위</TableHead>
                <TableHead className="whitespace-nowrap text-right">TOP3</TableHead>
                <TableHead className="whitespace-nowrap text-right">평균 킬</TableHead>
                <TableHead className="min-w-44">모스트 실험체</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={`${player.rank}-${player.nickname}`}>
                  <TableCell className="font-semibold">{player.rank}</TableCell>
                  <TableCell>
                    <Link
                      className="font-medium text-foreground transition-colors hover:text-primary"
                      to={`/players/${encodeURIComponent(player.nickname)}`}
                    >
                      {player.nickname}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{player.tier}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {player.rp.toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {player.averageRank ? player.averageRank.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {player.top3Rate ? `${player.top3Rate.toFixed(1)}%` : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {player.averageKills ? player.averageKills.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell>
                    {player.mostCharacters.length > 0 ? (
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {player.mostCharacters.map((character) => (
                          <Badge key={character} variant="outline">
                            {character}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  )
}
