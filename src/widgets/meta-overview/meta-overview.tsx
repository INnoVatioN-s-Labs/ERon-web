import type { MetaCharacter } from '@/entities/meta/api'
import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

type MetaOverviewProps = {
  characters: MetaCharacter[]
  error?: Error | null
  isFetching?: boolean
  isLoading?: boolean
}

export function MetaOverview({ characters, error, isFetching, isLoading }: MetaOverviewProps) {
  const hasCharacters = characters.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 실험체</CardTitle>
        <CardDescription>
          매일 오전 9시에 갱신되는 상위 1000명 랭크 표본 기반 추천 픽입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasCharacters ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            {isLoading ? '추천 실험체를 불러오는 중입니다.' : '추천할 실험체 데이터가 없습니다.'}
          </div>
        ) : (
          <div className="space-y-3">
          {error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              추천 실험체를 불러오지 못했습니다.
            </div>
          ) : null}
          {isFetching && hasCharacters ? (
            <p className="text-xs text-muted-foreground">추천 데이터를 갱신 중입니다.</p>
          ) : null}
          {characters.map((character, index) => (
              <div
                className="grid min-h-20 grid-cols-[2.25rem_1fr] gap-3 rounded-lg border border-border/80 bg-muted/35 p-3 sm:grid-cols-[2.25rem_1fr_auto]"
                key={character.id}
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-background text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={character.tier === 'S' ? 'success' : 'secondary'}>
                      {character.tier}
                    </Badge>
                    <p className="font-medium">{character.name}</p>
                    <span className="text-xs text-muted-foreground">
                      점수 {Math.round(character.metaScore * 100)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                    <span>TOP3 {character.top3Rate}%</span>
                    <span>픽률 {character.pickRate}%</span>
                    <span>승률 {character.winRate}%</span>
                    <span>평균 #{character.avgRank.toFixed(1)}</span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-background sm:w-28">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, Math.round(character.metaScore * 100))}%` }}
                    />
                  </div>
                  <div>
                    <p className="whitespace-nowrap text-sm font-semibold">
                      {Math.round(character.metaScore * 100)}
                    </p>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">score</p>
                  </div>
                </div>
              </div>
          ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
