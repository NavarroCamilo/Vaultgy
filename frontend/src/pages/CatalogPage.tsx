import { useEffect, useState } from 'react'
import { api } from '../api/http'
import type { Game } from '../types/domain'

type CatalogPageProps = {
  resetSignal: number
  libraryGameIds: string[]
  wishlistGameIds: string[]
  onOpenGame: (gameId: string) => void
  onAddToLibrary: (gameId: string) => Promise<void>
  onRemoveFromLibrary: (gameId: string) => Promise<void>
  onAddToWishlist: (gameId: string) => Promise<void>
  onRemoveFromWishlist: (gameId: string) => Promise<void>
}

type PagedGamesResponse = {
  data: Game[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

function CatalogPage({
  resetSignal,
  libraryGameIds,
  wishlistGameIds,
  onOpenGame,
  onAddToLibrary,
  onRemoveFromLibrary,
  onAddToWishlist,
  onRemoveFromWishlist,
}: CatalogPageProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchColumn, setSearchColumn] = useState<'title' | 'genre'>('title')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const loadCatalog = async () => {
    setLoading(true)
    setError('')

    try {
      const endpoint = searchQuery
        ? '/games/search/paged'
        : '/games/paged'

      const response = searchQuery
        ? await api.get<PagedGamesResponse>(endpoint, {
            params: {
              column: searchColumn,
              value: searchQuery,
              page,
              pageSize,
            },
          })
        : await api.get<PagedGamesResponse>(endpoint, {
            params: {
              page,
              pageSize,
            },
          })

      setGames(response.data.data)
      setTotalItems(response.data.meta.total)
      setTotalPages(response.data.meta.totalPages)
    } catch {
      setGames([])
      setTotalItems(0)
      setTotalPages(1)
      setError(searchQuery ? '' : 'Could not load games. Please check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCatalog()
  }, [searchQuery, searchColumn, page, pageSize])

  useEffect(() => {
    setSearchDraft('')
    setSearchQuery('')
    setSearchColumn('title')
    setPage(1)
    setPageSize(10)
  }, [resetSignal])

  const openGameCard = (gameId: string) => {
    onOpenGame(gameId)
  }

  return (
    <>
      <section className="hero-banner">
        <p className="hero-tag">Game Catalog</p>
        <h2>Find your next game</h2>
        <p className="hero-copy">
          Search by title or genre and manage your collection in Library and Wishlist.
        </p>
        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setSearchQuery(searchDraft.trim())
          }}
        >
          <input
            className="search-input"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search games..."
          />
          <select
            className="search-select"
            value={searchColumn}
            onChange={(event) => setSearchColumn(event.target.value as 'title' | 'genre')}
          >
            <option value="title">Title</option>
            <option value="genre">Genre</option>
          </select>
          <select
            className="search-select"
            value={pageSize}
            onChange={(event) => {
              setPage(1)
              setPageSize(Number(event.target.value))
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </section>

      <section className="games-grid" aria-live="polite">
        {loading && <p className="status">Loading games...</p>}
        {!loading && error && <p className="status error">{error}</p>}

        {!loading && !error && games.length === 0 && (
          <p className="status">No games match your search.</p>
        )}

        {!loading && !error && games.map((game) => {
          const inLibrary = libraryGameIds.includes(game.id)
          const inWishlist = wishlistGameIds.includes(game.id)

          return (
            <article
              className="game-card interactive"
              key={game.id}
              role="button"
              tabIndex={0}
              aria-label={`Abrir detalle de ${game.title}`}
              onClick={() => openGameCard(game.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openGameCard(game.id)
                }
              }}
            >
              <img
                src={game.coverImage || 'https://placehold.co/600x350/1f2937/e5e7eb?text=Vaultgy'}
                alt={game.title}
                loading="lazy"
              />
              <div className="game-meta">
                <h3>{game.title}</h3>
                <p className="game-genre">{game.genre ?? 'Unknown genre'}</p>
                <div className="game-actions">
                  {!inLibrary && !inWishlist && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          void onAddToWishlist(game.id)
                        }}
                      >
                        Add to Wishlist
                      </button>
                    )}

                  {!inLibrary && inWishlist && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          void onRemoveFromWishlist(game.id)
                        }}
                      >
                        Remove from Wishlist
                      </button>
                    )}

                  {inLibrary ? (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        void onRemoveFromLibrary(game.id)
                      }}
                    >
                      Remove from Library
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        void onAddToLibrary(game.id)
                      }}
                    >
                      Add to Library
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}

        {!loading && !error && totalPages > 1 && (
          <div className="pagination-bar">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className="pagination-meta">
              Page {page} of {totalPages} · {totalItems} games
            </span>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export default CatalogPage
