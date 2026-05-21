export type Game = {
  id: string
  title: string
  description?: string | null
  coverImage?: string | null
  releaseDate?: string | null
  genre?: string | null
  createdAt?: string
  updatedAt?: string
}

export type User = {
  id: string
  username: string
  email: string
  role: string
}

export type CollectionItem = {
  gameId: string
}

export type GameReview = {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  user: {
    id: string
    username: string
  }
}

export type GameAverage = {
  gameId: string
  average: number | null
}

export type GameReviewCount = {
  gameId: string
  count: number
}

export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  kind: ToastKind
  message: string
}
