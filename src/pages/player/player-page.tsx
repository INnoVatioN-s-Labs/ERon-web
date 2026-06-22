import { ArrowLeft, Search } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePlayerSearch } from '@/entities/player/api'
import { PlayerSearchForm } from '@/features/player-search/player-search-form'
import { Button } from '@/shared/ui/button'
import { PlayerSearchResultView } from '@/widgets/player-search-result/player-search-result'

export function PlayerPage() {
  const navigate = useNavigate()
  const { nickname = '' } = useParams()
  const decodedNickname = decodeURIComponent(nickname)
  const playerQuery = usePlayerSearch(decodedNickname)

  function handleSearch(nextNickname: string) {
    const trimmedNickname = nextNickname.trim()

    if (!trimmedNickname) {
      return
    }

    navigate(`/players/${encodeURIComponent(trimmedNickname)}`)
  }

  return (
    <main>
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft />
                홈
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="size-4" />
              <span>전적 검색</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl">
            <PlayerSearchForm
              initialNickname={decodedNickname}
              isLoading={playerQuery.isFetching}
              key={decodedNickname}
              recentSearches={['페이블', '한동그라미', '지슥샷']}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <PlayerSearchResultView
          error={playerQuery.error}
          isLoading={playerQuery.isFetching}
          key={decodedNickname}
          result={playerQuery.data}
          searchedNickname={decodedNickname}
        />
      </section>
    </main>
  )
}
