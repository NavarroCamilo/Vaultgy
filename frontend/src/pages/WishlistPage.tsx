import { useEffect, useState } from 'react'
import { api } from '../api/http'
import type { Game } from '../types/domain'

type WishlistPageProps = {
  wishlistGameIds: string[]
  libraryGameIds: string[]
  onAddToLibrary: (gameId: string) => Promise<void>
  onRemoveFromWishlist: (gameId: string) => Promise<void>
}

function WishlistPage({
  wishlistGameIds,
  libraryGameIds,
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
            <article className="game-card" key={game.id}>
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
                    onClick={() => onRemoveFromWishlist(game.id)}
                  >
                    Eliminar de deseados
                  </button>

                  {!inLibrary && (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => onAddToLibrary(game.id)}
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
