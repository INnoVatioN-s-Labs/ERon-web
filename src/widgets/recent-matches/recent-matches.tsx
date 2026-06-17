import type { PatchNote, RecentMatch } from '@/shared/config/mock-home-data'
import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

type RecentMatchesProps = {
  matches: RecentMatch[]
  patchNote: PatchNote
}

export function RecentMatches({ matches, patchNote }: RecentMatchesProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>최근 경기 예시</CardTitle>
          <CardDescription>검색 결과 영역에 연결될 경기 리스트</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {matches.map((match) => (
            <div
              className="flex items-center justify-between rounded-lg border bg-background p-4"
              key={match.id}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={match.rank <= 3 ? 'success' : 'outline'}>
                    #{match.rank}
                  </Badge>
                  <p className="font-semibold">{match.character}</p>
                  <span className="text-xs text-muted-foreground">{match.mode}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  K/A {match.kills}/{match.assists} · 피해량{' '}
                  {match.damage.toLocaleString()}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{match.playedAt}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>최신 패치</CardTitle>
          <CardDescription>패치별 메타 변화 섹션의 시작점</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-background p-5">
            <Badge variant="warning">v{patchNote.version}</Badge>
            <h3 className="mt-4 text-lg font-semibold">{patchNote.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {patchNote.summary}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
