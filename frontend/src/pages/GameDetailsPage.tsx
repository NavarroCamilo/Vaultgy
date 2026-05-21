import { useEffect, useState } from 'react'
import { api } from '../api/http'
import type { Game, GameAverage, GameReview, GameReviewCount } from '../types/domain'

type GameDetailsPageProps = {
  gameId: string
  libraryGameIds: string[]
  wishlistGameIds: string[]
  onAddToLibrary: (gameId: string) => Promise<void>
  onAddToWishlist: (gameId: string) => Promise<void>
  onRemoveFromWishlist: (gameId: string) => Promise<void>
  onBack: () => void
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

function GameDetailsPage({
  gameId,
  libraryGameIds,
  wishlistGameIds,
  onAddToLibrary,
  onAddToWishlist,
  onRemoveFromWishlist,
  onBack,
}: GameDetailsPageProps) {
  const [game, setGame] = useState<Game | null>(null)
  const [average, setAverage] = useState<number | null>(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [reviews, setReviews] = useState<GameReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)
      setError('')

      try {
        const [gameResponse, averageResponse, countResponse, reviewsResponse] = await Promise.all([
          api.get<Game>(`/games/${gameId}`),
          api.get<GameAverage>(`/reviews/game/${gameId}/average`),
          api.get<GameReviewCount>(`/reviews/game/${gameId}/count`),
          api.get<{ data: GameReview[] }>(`/reviews/game/${gameId}/paged`, {
            params: { page: 1, pageSize: 4 },
          }),
        ])

        setGame(gameResponse.data)
        setAverage(averageResponse.data.average)
        setReviewCount(countResponse.data.count)
        setReviews(reviewsResponse.data.data)
      } catch {
        setError('No se pudo cargar la información del juego.')
      } finally {
        setLoading(false)
      }
    }

    void loadDetails()
  }, [gameId])

  if (loading) {
    return <p className="status">Cargando detalle del juego...</p>
  }

  if (error || !game) {
    return (
      <section className="hero-banner">
        <button type="button" className="ghost-btn" onClick={onBack}>
          Volver
        </button>
        <p className="status error" style={{ marginTop: '1rem' }}>{error || 'Juego no encontrado.'}</p>
      </section>
    )
  }

  const inLibrary = libraryGameIds.includes(game.id)
  const inWishlist = wishlistGameIds.includes(game.id)
  const hasReviews = reviewCount > 0 && average !== null

  return (
    <>
      <section className="game-hero glass-panel">
        <button type="button" className="ghost-btn" onClick={onBack}>
          Volver al catálogo
        </button>

        <div className="game-hero-grid">
          <img
            className="game-hero-cover"
            src={game.coverImage || 'https://placehold.co/600x900/1f2937/e5e7eb?text=Vaultgy'}
            alt={game.title}
          />

          <div className="game-hero-content">
            <div className="game-hero-badges">
              <span className="game-genre">{game.genre ?? 'Unknown genre'}</span>
            </div>

            <h2 className="game-title">{game.title}</h2>

            <p className="hero-copy">
              {game.description || 'Sin descripción disponible.'}
            </p>

            <div className="game-metrics">
              <div className="metric-card metric-card-rating">
                <span className="metric-label">Rating promedio</span>
                <div className={`average-circle ${hasReviews ? 'is-rated' : 'is-empty'}`} aria-label={hasReviews ? `Promedio ${average.toFixed(1)} de 10` : 'Sin reseñas'}>
                  <span>{hasReviews ? average.toFixed(1) : 'X'}</span>
                </div>
                <span className="metric-subvalue">{hasReviews ? 'de 10' : 'Sin reseñas'}</span>
              </div>
              <div className="metric-stack">
                <div className="metric-card">
                  <span className="metric-label">Reseñas</span>
                  <span className="metric-value">{reviewCount}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Fecha de lanzamiento</span>
                  <span className="metric-value">{formatDate(game.releaseDate)}</span>
                </div>
              </div>
            </div>

            <div className="game-actions game-actions-detail">
              {!inLibrary && !inWishlist && (
                <button type="button" className="secondary-btn" onClick={() => onAddToWishlist(game.id)}>
                  Agregar a deseados
                </button>
              )}

              {!inLibrary && inWishlist && (
                <button type="button" className="secondary-btn" onClick={() => onRemoveFromWishlist(game.id)}>
                  Eliminar de deseados
                </button>
              )}

              <button type="button" className="primary-btn" onClick={() => onAddToLibrary(game.id)}>
                Agregar a biblioteca
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="section-header">
          <h3>Reseñas recientes</h3>
        </div>

        {reviews.length === 0 ? (
          <p className="status">Todavía no hay reseñas para este juego.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <article key={review.id} className="review-card glass-panel">
                <div className="review-topline">
                  <div>
                    <p className="review-user">{review.user.username}</p>
                    <p className="review-date">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="review-rating">{review.rating}/10</div>
                </div>
                {review.comment ? <p className="review-comment">{review.comment}</p> : <p className="review-comment muted">Sin comentario.</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default GameDetailsPage