import { Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

type PlayerSearchFormProps = {
  initialNickname?: string
  isLoading?: boolean
  onSearch: (nickname: string) => void
  recentSearches: string[]
}

export function PlayerSearchForm({
  initialNickname = '',
  isLoading = false,
  onSearch,
  recentSearches,
}: PlayerSearchFormProps) {
  const [nickname, setNickname] = useState(initialNickname)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(nickname)
  }

  return (
    <div className="w-full max-w-3xl">
      <form
        className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-card/95 p-2 shadow-soft sm:flex-row"
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="닉네임 검색"
            className="border-transparent pl-10 shadow-none focus-visible:ring-0"
            placeholder="이터널 리턴 닉네임을 입력하세요"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>
        <Button className="sm:w-28" type="submit">
          {isLoading ? '검색 중' : '검색'}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>최근 검색</span>
        {recentSearches.map((search) => (
          <button
            className="rounded-md border border-border/80 bg-secondary/70 px-2.5 py-1 text-secondary-foreground transition-colors hover:bg-secondary"
            key={search}
            type="button"
            onClick={() => {
              setNickname(search)
              onSearch(search)
            }}
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  )
}
