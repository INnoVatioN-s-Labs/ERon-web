import { useNavigate } from 'react-router-dom'
import { useCurrentCharacterMeta } from '@/entities/meta/api'
import { useTopRankings } from '@/entities/ranking/api'
import { patchNote } from '@/shared/config/mock-home-data'
import { HomeHero } from '@/widgets/home-hero/home-hero'
import { MetaOverview } from '@/widgets/meta-overview/meta-overview'
import { RankingPreview } from '@/widgets/ranking-preview/ranking-preview'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

export function HomePage() {
  const navigate = useNavigate()
  const metaQuery = useCurrentCharacterMeta()
  const rankingQuery = useTopRankings()

  function handleSearch(nickname: string) {
    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      return
    }

    navigate(`/players/${encodeURIComponent(trimmedNickname)}`)
  }

  return (
    <main>
      <HomeHero onSearch={handleSearch} />
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <MetaOverview
          characters={metaQuery.data ?? []}
          error={metaQuery.error}
          isFetching={metaQuery.isFetching}
          isLoading={metaQuery.isLoading}
        />
        <RankingPreview
          error={rankingQuery.error}
          isFetching={rankingQuery.isFetching}
          isLoading={rankingQuery.isLoading}
          players={rankingQuery.data ?? []}
        />
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
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
      </section>
    </main>
  )
}
