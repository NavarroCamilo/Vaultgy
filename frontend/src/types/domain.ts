export type Game = {
  id: string
  title: string
  description?: string | null
  coverImage?: string | null
  genre?: string | null
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

export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  kind: ToastKind
  message: string
}
