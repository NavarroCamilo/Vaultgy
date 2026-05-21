import { useEffect, useRef, useState } from 'react'
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
  const [searchColumn, setSearchColumn] = useState<'title' | 'genre'>('title')
  const mountedRef = useRef(false)

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<Game[]>('/games')
        setGames(response.data)
      } catch {
        setError('No se pudieron cargar los juegos. Revisa que el backend esté corriendo.')
      } finally {
        setLoading(false)
      }
    }

    void loadGames()
  }, [])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }

    setSearchDraft('')
    setSearchColumn('title')
    void loadAllGames()
  }, [resetSignal])

  const loadAllGames = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<Game[]>('/games')
      setGames(response.data)
    } catch {
      setError('No se pudieron cargar los juegos. Revisa que el backend esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  const runSearch = async () => {
    const normalizedQuery = searchDraft.trim()

    if (!normalizedQuery) {
      void loadAllGames()
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.get<Game[]>('/games/search', {
        params: {
          column: searchColumn,
          value: normalizedQuery,
        },
      })

      setGames(response.data)
    } catch {
      setError('No se pudieron encontrar juegos con ese filtro.')
      setGames([])
    } finally {
      setLoading(false)
    }
  }

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
            runSearch()
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
      </section>
    </>
  )
}

export default CatalogPage
