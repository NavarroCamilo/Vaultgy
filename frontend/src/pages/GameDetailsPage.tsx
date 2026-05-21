import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/http'
import type { Game, GameAverage, GameReview, GameReviewCount } from '../types/domain'

type GameDetailsPageProps = {
  gameId: string
  currentUsername?: string | null
  libraryGameIds: string[]
  wishlistGameIds: string[]
  onAddToLibrary: (gameId: string) => Promise<void>
  onRemoveFromLibrary: (gameId: string) => Promise<void>
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
  currentUsername,
  libraryGameIds,
  wishlistGameIds,
  onAddToLibrary,
  onRemoveFromLibrary,
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState('10')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewDeleting, setReviewDeleting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const currentReview = currentUsername
    ? reviews.find((review) => review.user.username === currentUsername)
    : undefined

  const loadDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const [gameResponse, averageResponse, countResponse, reviewsResponse] = await Promise.all([
        api.get<Game>(`/games/${gameId}`),
        api.get<GameAverage>(`/reviews/game/${gameId}/average`),
        api.get<GameReviewCount>(`/reviews/game/${gameId}/count`),
        api.get<GameReview[]>(`/reviews/game/${gameId}`, {
          params: { take: 1000 },
        }),
      ])

      setGame(gameResponse.data)
      setAverage(averageResponse.data.average)
      setReviewCount(countResponse.data.count)
      setReviews(reviewsResponse.data)
    } catch {
      setError('Could not load the game information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDetails()
  }, [gameId])

  useEffect(() => {
    if (!reviewModalOpen) {
      setReviewError('')
      return
    }

    setReviewRating(currentReview ? String(currentReview.rating) : '10')
    setReviewComment(currentReview?.comment ?? '')
    setReviewError('')
  }, [reviewModalOpen, currentReview])

  const openReviewModal = () => {
    setReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setReviewModalOpen(false)
    setReviewSaving(false)
    setReviewDeleting(false)
    setReviewError('')
  }

  const handleDeleteReview = async () => {
    if (!currentReview) {
      return
    }

    setReviewDeleting(true)
    setReviewError('')

    try {
      await api.delete(`/users/me/reviews/${currentReview.id}`)
      await loadDetails()
      closeReviewModal()
    } catch {
      setReviewError('Could not delete the review.')
    } finally {
      setReviewDeleting(false)
    }
  }

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!game) {
      return
    }

    const ratingValue = Number.parseInt(reviewRating, 10)

    if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 10) {
      setReviewError('Please choose a rating between 0 and 10.')
      return
    }

    setReviewSaving(true)
    setReviewError('')

    try {
      if (currentReview) {
        await api.patch(`/users/me/reviews/${currentReview.id}`, {
          rating: ratingValue,
          comment: reviewComment.trim() || undefined,
        })
      } else {
        await api.post(`/users/me/reviews/${game.id}`, {
          rating: ratingValue,
          comment: reviewComment.trim() || undefined,
        })
      }

      await loadDetails()
      closeReviewModal()
    } catch {
      setReviewError('Could not save the review. Make sure you are logged in and the game is in your library.')
    } finally {
      setReviewSaving(false)
    }
  }

  if (loading) {
    return <p className="status">Loading game details...</p>
  }

  if (error || !game) {
    return (
      <section className="hero-banner">
        <button type="button" className="ghost-btn" onClick={onBack}>
          Back
        </button>
        <p className="status error" style={{ marginTop: '1rem' }}>{error || 'Game not found.'}</p>
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
          Back to catalog
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
              {game.description || 'No description available.'}
            </p>

            <div className="game-metrics">
              <div className="metric-card metric-card-rating">
                <span className="metric-label">Average rating</span>
                <div className={`average-circle ${hasReviews ? 'is-rated' : 'is-empty'}`} aria-label={hasReviews ? `Average ${average.toFixed(1)} out of 10` : 'No reviews'}>
                  <span>{hasReviews ? average.toFixed(1) : 'X'}</span>
                </div>
                <span className="metric-subvalue">{hasReviews ? 'out of 10' : 'No reviews'}</span>
              </div>
              <div className="metric-stack">
                <div className="metric-card">
                  <span className="metric-label">Reviews</span>
                  <span className="metric-value">{reviewCount}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Release date</span>
                  <span className="metric-value">{formatDate(game.releaseDate)}</span>
                </div>
              </div>
            </div>

            <div className="game-actions game-actions-detail">
              {inLibrary ? (
                <>
                  <button type="button" className="primary-btn" onClick={() => onRemoveFromLibrary(game.id)}>
                    Remove from Library
                  </button>
                  <button type="button" className="secondary-btn" onClick={openReviewModal}>
                    {currentReview ? 'Edit review' : 'Write review'}
                  </button>
                </>
              ) : (
                <>
                  {!inWishlist && (
                    <button type="button" className="secondary-btn" onClick={() => onAddToWishlist(game.id)}>
                      Add to Wishlist
                    </button>
                  )}

                  {inWishlist && (
                    <button type="button" className="secondary-btn" onClick={() => onRemoveFromWishlist(game.id)}>
                      Remove from Wishlist
                    </button>
                  )}

                  <button type="button" className="primary-btn" onClick={() => onAddToLibrary(game.id)}>
                    Add to Library
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="section-header">
          <h3>Recent reviews</h3>
        </div>

        {reviews.length === 0 ? (
          <p className="status">There are no reviews for this game yet.</p>
        ) : (
          <div className="reviews-list">
            {reviews.slice(0, 4).map((review) => (
              <article key={review.id} className="review-card glass-panel">
                <div className="review-topline">
                  <div>
                    <p className="review-user">{review.user.username}</p>
                    <p className="review-date">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="review-rating">{review.rating}/10</div>
                </div>
                {review.comment ? <p className="review-comment">{review.comment}</p> : <p className="review-comment muted">No comment.</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      {reviewModalOpen && (
        <div className="review-modal-backdrop" role="presentation" onClick={closeReviewModal}>
          <div className="review-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="review-modal-header">
              <div>
                <p className="hero-tag">Review</p>
                <h3 id="review-modal-title">{currentReview ? 'Edit your review' : 'Write a review'}</h3>
              </div>
              <button type="button" className="ghost-btn" onClick={closeReviewModal}>
                Close
              </button>
            </div>

            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="field">
                <span>Rating</span>
                <div className="rating-picker" role="group" aria-label="Select review rating">
                  {Array.from({ length: 11 }, (_, value) => value).map((value) => {
                    const isSelected = reviewRating === String(value)

                    return (
                      <button
                        key={value}
                        type="button"
                        className={`rating-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => setReviewRating(String(value))}
                        aria-pressed={isSelected}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
                <input type="hidden" value={reviewRating} readOnly />
              </div>

              <label className="field">
                <span>Comment</span>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows={5}
                  placeholder="Share what you think about this game..."
                />
              </label>

              {reviewError && <p className="status error">{reviewError}</p>}

              <div className="review-modal-actions">
                {currentReview && (
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => {
                      void handleDeleteReview()
                    }}
                    disabled={reviewSaving || reviewDeleting}
                  >
                    {reviewDeleting ? 'Deleting...' : 'Delete review'}
                  </button>
                )}
                <button type="button" className="ghost-btn" onClick={closeReviewModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={reviewSaving}>
                  {reviewSaving ? 'Saving...' : currentReview ? 'Update review' : 'Publish review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default GameDetailsPage