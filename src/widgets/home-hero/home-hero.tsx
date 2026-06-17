import { BarChart3, Brain, Swords } from 'lucide-react'
import { PlayerSearchForm } from '@/features/player-search/player-search-form'

const serviceStats = [
  { label: '캐시 기반 빠른 검색', value: 'Phase 1' },
  { label: '실험체 메타 분석', value: 'Phase 2' },
  { label: 'AI 피드백 확장', value: 'Phase 3' },
]

type HomeHeroProps = {
  isSearching?: boolean
  onSearch: (nickname: string) => void
}

export function HomeHero({ isSearching = false, onSearch }: HomeHeroProps) {
  return (
    <section className="border-b border-border/80 bg-[hsl(224_34%_8%/0.72)]">
      <div className="mx-auto flex min-h-[460px] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <h1 className="max-w-4xl text-5xl font-bold tracking-normal text-foreground sm:text-7xl">
          ER on
        </h1>
        <div className="mt-9 flex w-full justify-center">
          <PlayerSearchForm
            isLoading={isSearching}
            recentSearches={['페이블', '한동그라미', '지슥샷']}
            onSearch={onSearch}
          />
        </div>
        <div className="mt-10 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
          {serviceStats.map((item, index) => {
            const Icon = [Swords, BarChart3, Brain][index]

            return (
              <div
                className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/45 p-4 text-left shadow-sm"
                key={item.label}
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
