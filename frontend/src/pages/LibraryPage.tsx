import { useEffect, useState } from 'react'
import { api } from '../api/http'
import type { Game } from '../types/domain'

type LibraryPageProps = {
  libraryGameIds: string[]
  wishlistGameIds: string[]
  onOpenGame: (gameId: string) => void
  onRemoveFromLibrary: (gameId: string) => Promise<void>
  onAddToWishlist: (gameId: string) => Promise<void>
}

function LibraryPage({
  libraryGameIds,
  wishlistGameIds,
  onOpenGame,
  onRemoveFromLibrary,
  onAddToWishlist,
}: LibraryPageProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<Game[]>('/games')
        setGames(response.data)
      } catch {
        setError('No se pudo cargar la biblioteca.')
      } finally {
        setLoading(false)
      }
    }

    void loadGames()
  }, [])

  const libraryGames = games.filter((game) => libraryGameIds.includes(game.id))

  const openGameCard = (gameId: string) => {
    onOpenGame(gameId)
  }

  return (
    <>
      <section className="hero-banner">
        <p className="hero-tag">Library</p>
        <h2>Your Library</h2>
        <p className="hero-copy">Games in your collection.</p>
      </section>

      <section className="games-grid" aria-live="polite">
        {loading && <p className="status">Loading library...</p>}
        {!loading && error && <p className="status error">{error}</p>}

        {!loading && !error && libraryGames.length === 0 && (
          <p className="status">Your library is empty.</p>
        )}

        {!loading && !error && libraryGames.map((game) => {

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
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={(event) => {
                      event.stopPropagation()
                      void onRemoveFromLibrary(game.id)
                    }}
                  >
                    Remove from Library
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}

export default LibraryPage
