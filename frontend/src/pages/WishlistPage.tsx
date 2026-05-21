import { useEffect, useState } from 'react'
import { api } from '../api/http'
import type { Game } from '../types/domain'

type WishlistPageProps = {
  wishlistGameIds: string[]
  libraryGameIds: string[]
  onOpenGame: (gameId: string) => void
  onAddToLibrary: (gameId: string) => Promise<void>
  onRemoveFromWishlist: (gameId: string) => Promise<void>
}

function WishlistPage({
  wishlistGameIds,
  libraryGameIds,
  onOpenGame,
  onAddToLibrary,
  onRemoveFromWishlist,
}: WishlistPageProps) {
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
        setError('No se pudo cargar tu lista de deseos.')
      } finally {
        setLoading(false)
      }
    }

    void loadGames()
  }, [])

  const wishlistGames = games.filter((game) => wishlistGameIds.includes(game.id))

  const openGameCard = (gameId: string) => {
    onOpenGame(gameId)
  }

  return (
    <>
      <section className="hero-banner">
        <p className="hero-tag">Wishlist</p>
        <h2>Tu lista de deseos</h2>
        <p className="hero-copy">
          Aquí ves los juegos que guardaste para más tarde.
        </p>
      </section>

      <section className="games-grid" aria-live="polite">
        {loading && <p className="status">Cargando tu wishlist...</p>}
        {!loading && error && <p className="status error">{error}</p>}

        {!loading && !error && wishlistGames.length === 0 && (
          <p className="status">Todavía no tienes juegos en tu lista de deseos.</p>
        )}

        {!loading && !error && wishlistGames.map((game) => {
          const inLibrary = libraryGameIds.includes(game.id)

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
                      void onRemoveFromWishlist(game.id)
                    }}
                  >
                    Eliminar de deseados
                  </button>

                  {!inLibrary && (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        void onAddToLibrary(game.id)
                      }}
                    >
                      Biblioteca
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

export default WishlistPage
