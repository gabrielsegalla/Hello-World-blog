'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  basePath?: string
  initialQuery?: string
  initialCategory?: string
  categories: string[]
}

export default function HomeSearch({
  basePath = '/',
  initialQuery = '',
  initialCategory = 'Todos',
  categories,
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [, startTransition] = useTransition()

  function buildUrl(q?: string, cat?: string) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat && cat !== 'Todos') params.set('cat', cat)
    const s = params.toString()
    const hash = basePath === '/' ? '#destaque' : ''
    return `${basePath}${s ? `?${s}` : ''}${hash}`
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      router.push(buildUrl(query, initialCategory))
    })
  }

  function selectCategory(cat: string) {
    startTransition(() => {
      router.push(buildUrl(query, cat))
    })
  }

  return (
    <div className="home-search">
      <form onSubmit={onSubmit} className="home-search-form" role="search">
        <span className="home-search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          placeholder="Buscar artigos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="home-search-input"
          aria-label="Buscar artigos"
        />
      </form>
      <div className="home-search-pills" role="tablist" aria-label="Filtrar por categoria">
        {categories.map(cat => {
          const active = cat === initialCategory
          return (
            <button
              key={cat}
              type="button"
              onClick={() => selectCategory(cat)}
              role="tab"
              aria-selected={active}
              className={`home-search-pill${active ? ' home-search-pill-active' : ''}`}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}
