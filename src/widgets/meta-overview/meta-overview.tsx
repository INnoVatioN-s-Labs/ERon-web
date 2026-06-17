import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MetaCharacter } from '@/shared/config/mock-home-data'
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
}

const trendIcon = {
  up: ArrowUp,
  down: ArrowDown,
  stable: ArrowRight,
}

export function MetaOverview({ characters }: MetaOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>현재 메타</CardTitle>
        <CardDescription>
          메타 통계 API 연결 전 임시 데이터입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-64">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={characters}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} width={34} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  color: 'hsl(var(--foreground))',
                  background: 'hsl(var(--card))',
                }}
              />
              <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pickRate" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {characters.map((character) => {
            const TrendIcon = trendIcon[character.trend]

            return (
              <div
                className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/35 p-3"
                key={character.id}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={character.tier === 'S' ? 'success' : 'secondary'}>
                    {character.tier}
                  </Badge>
                  <div>
                    <p className="whitespace-nowrap font-medium">{character.name}</p>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">
                      평균 순위 {character.avgRank.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="whitespace-nowrap text-sm font-semibold">
                      {character.winRate}%
                    </p>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">
                      {character.pickRate}% pick
                    </p>
                  </div>
                  <TrendIcon className="size-4 text-primary" />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
