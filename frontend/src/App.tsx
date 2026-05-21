import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { api } from './api/http'
import './App.css'

type Game = {
  id: string
  title: string
  description?: string | null
  coverImage?: string | null
  genre?: string | null
}

type User = {
  id: string
  username: string
  email: string
  role: string
}

type CollectionItem = {
  gameId: string
}

type ToastKind = 'success' | 'error' | 'info'

type Toast = {
  id: number
  kind: ToastKind
  message: string
}

function App() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchColumn, setSearchColumn] = useState<'title' | 'genre'>('title')
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [libraryGameIds, setLibraryGameIds] = useState<string[]>([])
  const [wishlistGameIds, setWishlistGameIds] = useState<string[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const toastIdRef = useRef(0)

  const translateAuthError = (error: unknown, fallback: string) => {
    if (!axios.isAxiosError(error)) {
      return fallback
    }

    const data = error.response?.data as { message?: unknown } | undefined
    const message = data?.message

    if (Array.isArray(message)) {
      return message
        .map((item) => String(item))
        .map((item) => {
          if (item.includes('email must be an email')) return 'El correo no tiene un formato válido.'
          if (item.includes('password must be longer than or equal to 6 characters')) return 'La contraseña debe tener al menos 6 caracteres.'
          if (item.includes('username should not be empty')) return 'Debes escribir un nombre de usuario.'
          if (item.includes('password should not be empty')) return 'Debes escribir una contraseña.'
          return item
        })
        .join(' ')
    }

    if (typeof message === 'string') {
      if (message.includes('Invalid credentials')) {
        return 'Correo o contraseña incorrectos.'
      }

      if (message.includes('Username or email already exists')) {
        return 'Ese usuario o correo ya está registrado.'
      }

      if (message.includes('JWT_SECRET is required')) {
        return 'El servidor no está listo para iniciar sesión. Falta configuración interna.'
      }

      if (message.includes('Authentication required')) {
        return 'Necesitas iniciar sesión para continuar.'
      }

      return message
    }

    return fallback
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setAuthOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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

  // try to fetch profile on mount to detect existing session
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get<User>('/auth/profile')
        setCurrentUser(res.data)
        await loadUserCollections()
      } catch {
        setCurrentUser(null)
        setLibraryGameIds([])
        setWishlistGameIds([])
      }
    }

    void loadProfile()
  }, [])

  const filteredGames = games

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

  const handleBrandClick = () => {
    setSearchDraft('')
    setSearchColumn('title')
    setMenuOpen(false)
    void loadAllGames()
  }

  const promptLogin = () => {
    setAuthMode('login')
    setAuthError(null)
    setAuthOpen(true)
  }

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const pushToast = (kind: ToastKind, message: string) => {
    const id = toastIdRef.current + 1
    toastIdRef.current = id

    setToasts((current) => [...current, { id, kind, message }])

    window.setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  const loadUserCollections = async () => {
    try {
      const [libraryResponse, wishlistResponse] = await Promise.all([
        api.get<CollectionItem[]>('/users/me/library'),
        api.get<CollectionItem[]>('/users/me/wishlist'),
      ])

      setLibraryGameIds(libraryResponse.data.map((item) => item.gameId))
      setWishlistGameIds(wishlistResponse.data.map((item) => item.gameId))
    } catch {
      setLibraryGameIds([])
      setWishlistGameIds([])
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

  

  const handleSubmitLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      const res = await api.post<User>('/auth/login', { email: loginEmail, password: loginPassword })
      // backend returns the user and sets auth cookie
      setCurrentUser(res.data)
      await loadUserCollections()
      setAuthOpen(false)
      setMenuOpen(false)
      setLoginEmail('')
      setLoginPassword('')
      pushToast('success', `Sesión iniciada como ${res.data.username}`)
    } catch (err) {
      setAuthError(translateAuthError(err, 'No se pudo iniciar sesión. Revisa credenciales.'))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmitRegister = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      await api.post<User>('/auth/register', { username: registerUsername, email: registerEmail, password: registerPassword })
      const loginResponse = await api.post<User>('/auth/login', { email: registerEmail, password: registerPassword })
      setCurrentUser(loginResponse.data)
      await loadUserCollections()
      setAuthOpen(false)
      setMenuOpen(false)
      setRegisterUsername('')
      setRegisterEmail('')
      setRegisterPassword('')
      pushToast('success', `Cuenta creada e iniciada como ${loginResponse.data.username}`)
    } catch (err) {
      setAuthError(translateAuthError(err, 'No se pudo registrar. Revisa los datos.'))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore errors
    } finally {
      setCurrentUser(null)
      setLibraryGameIds([])
      setWishlistGameIds([])
      setMenuOpen(false)
      setAuthOpen(false)
      pushToast('info', 'Sesión cerrada')
    }
  }

  const handleAddToLibrary = async (gameId: string) => {
    if (!currentUser) {
      promptLogin()
      return
    }

    try {
      await api.post(`/users/me/library/${gameId}`)
      await loadUserCollections()
      pushToast('success', 'Agregado a la biblioteca')
    } catch {
      pushToast('error', 'No se pudo agregar a la biblioteca. Inicia sesión primero.')
    }
  }

  const handleAddToWishlist = async (gameId: string) => {
    if (!currentUser) {
      promptLogin()
      return
    }

    try {
      await api.post(`/users/me/wishlist/${gameId}`)
      await loadUserCollections()
      pushToast('success', 'Agregado a la lista de deseados')
    } catch {
      pushToast('error', 'No se pudo agregar a la lista de deseados. Inicia sesión primero.')
    }
  }

  const handleRemoveFromWishlist = async (gameId: string) => {
    if (!currentUser) {
      promptLogin()
      return
    }

    try {
      await api.delete(`/users/me/wishlist/${gameId}`)
      await loadUserCollections()
      pushToast('info', 'Eliminado de la lista de deseados')
    } catch {
      pushToast('error', 'No se pudo eliminar de la lista de deseados.')
    }
  }

  return (
    <div className="app-shell">
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.kind}`}>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <header className="topbar">
        <div className="brand-group">
            {currentUser && (
              <button
                type="button"
                className="menu-trigger"
                onClick={() => setMenuOpen((previous) => !previous)}
                aria-label={menuOpen ? 'Cerrar menu lateral' : 'Abrir menu lateral'}
                aria-expanded={menuOpen}
                aria-controls="sidepanel-drawer"
              >
                ☰
              </button>
            )}
          <button type="button" className="brand-button" onClick={handleBrandClick}>
            <h1 className="brand">VAULTGY</h1>
          </button>
        </div>
        <div className="auth-actions auth-top-tabs">
          {!currentUser ? (
            <>
              <button
                type="button"
                className={`tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthOpen(true) }}
              >
                Log in
              </button>
              <button
                type="button"
                className={`tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setAuthOpen(true) }}
              >
                Sign up
              </button>
            </>
          ) : (
            <div className="logged-info">Hola, {currentUser.username}</div>
          )}
        </div>
      </header>

      <button
        type="button"
        className={`drawer-overlay ${menuOpen ? 'visible' : ''}`}
        aria-label="Cerrar menu lateral"
        onClick={() => setMenuOpen(false)}
      />

      {/* Auth popover anchored to top-right under auth buttons */}
      <div className={`auth-popover ${authOpen ? 'open' : ''}`} role="dialog" aria-hidden={!authOpen}>
        <div className="auth-body">
          {authError && <div className="auth-error">{authError}</div>}

          {authMode === 'login' && (
            <form onSubmit={handleSubmitLogin} className="auth-form">
              <label className="field">
                <span>Email</span>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} minLength={6} required />
              </label>
              <div className="auth-actions-row">
                <button type="submit" className="primary-btn" disabled={authLoading}>{authLoading ? 'Entrando...' : 'Entrar'}</button>
                <button type="button" className="ghost-btn" onClick={() => setAuthOpen(false)}>Cancelar</button>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleSubmitRegister} className="auth-form">
              <label className="field">
                <span>Username</span>
                <input type="text" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} minLength={6} required />
              </label>
              <div className="auth-actions-row">
                <button type="submit" className="primary-btn" disabled={authLoading}>{authLoading ? 'Registrando...' : 'Crear cuenta'}</button>
                <button type="button" className="ghost-btn" onClick={() => setAuthOpen(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {currentUser && (
        <aside id="sidepanel-drawer" className={`sidepanel ${menuOpen ? 'open' : ''}`}>
          <h2>Menu</h2>
          <div className="side-user">{currentUser.username}</div>
          <button type="button" className="panel-link" onClick={() => setMenuOpen(false)}>Library</button>
          <button type="button" className="panel-link" onClick={() => setMenuOpen(false)}>Wishlist</button>
          <div style={{ marginTop: 'auto' }}>
            <button type="button" className="panel-link" onClick={handleLogout}>Logout</button>
          </div>
        </aside>
      )}

      <main className="content">
        <section className="hero-banner">
          <p className="hero-tag">Game Catalog</p>
          <h2>Encuentra tu proximo juego</h2>
          <p className="hero-copy">
            Busca por titulo o genero y administra tu coleccion en Library y Wishlist.
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
              placeholder="Buscar juegos..."
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
              Buscar
            </button>
          </form>
        </section>

        <section className="games-grid" aria-live="polite">
          {loading && <p className="status">Cargando juegos...</p>}
          {!loading && error && <p className="status error">{error}</p>}

          {!loading && !error && filteredGames.length === 0 && (
            <p className="status">No hay juegos que coincidan con tu busqueda.</p>
          )}

          {!loading && !error && filteredGames.map((game) => {
            const inLibrary = libraryGameIds.includes(game.id)
            const inWishlist = wishlistGameIds.includes(game.id)

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
                    {!inLibrary && !inWishlist && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleAddToWishlist(game.id)}
                      >
                        Lista de deseados
                      </button>
                    )}

                    {!inLibrary && inWishlist && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleRemoveFromWishlist(game.id)}
                      >
                        Eliminar de deseados
                      </button>
                    )}

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleAddToLibrary(game.id)}
                    >
                      Biblioteca
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}

export default App
