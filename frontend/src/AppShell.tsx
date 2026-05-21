import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { api } from './api/http'
import ToastStack from './components/ToastStack'
import GameDetailsPage from './pages/GameDetailsPage'
import LibraryPage from './pages/LibraryPage'
import CatalogPage from './pages/CatalogPage'
import WishlistPage from './pages/WishlistPage'
import type { CollectionItem, Toast, ToastKind, User } from './types/domain'
import './App.css'

type ActiveView = 'catalog' | 'wishlist' | 'details' | 'library'

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>('catalog')
  const [catalogResetKey, setCatalogResetKey] = useState(0)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [detailsReturnView, setDetailsReturnView] = useState<Exclude<ActiveView, 'details'>>('catalog')

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [libraryGameIds, setLibraryGameIds] = useState<string[]>([])
  const [wishlistGameIds, setWishlistGameIds] = useState<string[]>([])

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const [toasts, setToasts] = useState<Toast[]>([])
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

  const promptLogin = () => {
    setAuthMode('login')
    setAuthError(null)
    setAuthOpen(true)
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

  const reloadSession = async () => {
    const profileResponse = await api.get<User>('/auth/profile')
    setCurrentUser(profileResponse.data)
    await loadUserCollections()
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
    const loadProfile = async () => {
      try {
        await reloadSession()
      } catch {
        setCurrentUser(null)
        setLibraryGameIds([])
        setWishlistGameIds([])
      }
    }

    void loadProfile()
  }, [])

  const handleBrandClick = () => {
    setActiveView('catalog')
    setSelectedGameId(null)
    setDetailsReturnView('catalog')
    setCatalogResetKey((previous) => previous + 1)
    setMenuOpen(false)
  }

  const openGameDetails = (gameId: string, returnView: Exclude<ActiveView, 'details'>) => {
    setSelectedGameId(gameId)
    setActiveView('details')
    setDetailsReturnView(returnView)
    setMenuOpen(false)
  }

  const handleSubmitLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      const response = await api.post<User>('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      })

      setCurrentUser(response.data)
      await loadUserCollections()
      setAuthOpen(false)
      setMenuOpen(false)
      setLoginEmail('')
      setLoginPassword('')
      pushToast('success', `Logged in as ${response.data.username}`)
    } catch (error) {
      setAuthError(translateAuthError(error, 'No se pudo iniciar sesión. Revisa credenciales.'))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmitRegister = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      await api.post<User>('/auth/register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      })

      const loginResponse = await api.post<User>('/auth/login', {
        email: registerEmail,
        password: registerPassword,
      })

      setCurrentUser(loginResponse.data)
      await loadUserCollections()
      setAuthOpen(false)
      setMenuOpen(false)
      setRegisterUsername('')
      setRegisterEmail('')
      setRegisterPassword('')
      pushToast('success', `Account created and logged in as ${loginResponse.data.username}`)
    } catch (error) {
      setAuthError(translateAuthError(error, 'No se pudo registrar. Revisa los datos.'))
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
      setActiveView('catalog')
      setSelectedGameId(null)
      setDetailsReturnView('catalog')
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
      // optimistic local update: ensure UI reflects removal from wishlist and addition to library immediately
      setLibraryGameIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]))
      setWishlistGameIds((prev) => prev.filter((id) => id !== gameId))
      await loadUserCollections()
      pushToast('success', 'Added to library')
    } catch {
      pushToast('error', 'Could not add to library. Please login first.')
    }
  }

  const handleAddToWishlist = async (gameId: string) => {
    if (!currentUser) {
      promptLogin()
      return
    }

    try {
      await api.post(`/users/me/wishlist/${gameId}`)
      setWishlistGameIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]))
      await loadUserCollections()
      pushToast('success', 'Added to wishlist')
    } catch {
      pushToast('error', 'Could not add to wishlist. Please login first.')
    }
  }

  const handleRemoveFromWishlist = async (gameId: string) => {
    if (!currentUser) {
      promptLogin()
      return
    }

    try {
      await api.delete(`/users/me/wishlist/${gameId}`)
      setWishlistGameIds((prev) => prev.filter((id) => id !== gameId))
      await loadUserCollections()
      pushToast('info', 'Removed from wishlist')
    } catch {
      pushToast('error', 'Could not remove from wishlist.')
    }
  }

  const handleRemoveFromLibrary = async (gameId: string) => {
    if (!currentUser) {
      promptLogin()
      return
    }

    try {
      await api.delete(`/users/me/library/${gameId}`)
      setLibraryGameIds((prev) => prev.filter((id) => id !== gameId))
      await loadUserCollections()
      pushToast('info', 'Removed from library')
    } catch {
      pushToast('error', 'Could not remove from library.')
    }
  }

  return (
    <div className="app-shell">
      <ToastStack toasts={toasts} onClose={removeToast} />

      <header className="topbar">
        <div className="brand-group">
          {currentUser && (
            <button
              type="button"
              className="menu-trigger"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={menuOpen ? 'Close side menu' : 'Open side menu'}
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
                onClick={() => {
                  setAuthMode('login')
                  setAuthOpen(true)
                }}
              >
                Log in
              </button>
              <button
                type="button"
                className={`tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('register')
                  setAuthOpen(true)
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <div className="logged-info">Hello, {currentUser.username}</div>
          )}
        </div>
      </header>

      <button
        type="button"
        className={`drawer-overlay ${menuOpen ? 'visible' : ''}`}
        aria-label="Close side menu"
        onClick={() => setMenuOpen(false)}
      />

      <div className={`auth-popover ${authOpen ? 'open' : ''}`} role="dialog" aria-hidden={!authOpen}>
        <div className="auth-body">
          {authError && <div className="auth-error">{authError}</div>}

          {authMode === 'login' && (
            <form onSubmit={handleSubmitLogin} className="auth-form">
              <label className="field">
                <span>Email</span>
                <input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} minLength={6} required />
              </label>
              <div className="auth-actions-row">
                <button type="submit" className="primary-btn" disabled={authLoading}>
                  {authLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <button type="button" className="ghost-btn" onClick={() => setAuthOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleSubmitRegister} className="auth-form">
              <label className="field">
                <span>Username</span>
                <input type="text" value={registerUsername} onChange={(event) => setRegisterUsername(event.target.value)} required />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} required />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} minLength={6} required />
              </label>
              <div className="auth-actions-row">
                <button type="submit" className="primary-btn" disabled={authLoading}>
                  {authLoading ? 'Registrando...' : 'Crear cuenta'}
                </button>
                <button type="button" className="ghost-btn" onClick={() => setAuthOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {currentUser && (
        <aside id="sidepanel-drawer" className={`sidepanel ${menuOpen ? 'open' : ''}`}>
          <h2>Menu</h2>
          <div className="side-user">{currentUser.username}</div>
          <button
            type="button"
            className={`panel-link ${activeView === 'catalog' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('catalog')
              setSelectedGameId(null)
              setDetailsReturnView('catalog')
              setCatalogResetKey((previous) => previous + 1)
              setMenuOpen(false)
            }}
          >
            Catalog
          </button>
          <button
            type="button"
            className={`panel-link ${activeView === 'wishlist' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('wishlist')
              setSelectedGameId(null)
              setDetailsReturnView('wishlist')
              setMenuOpen(false)
            }}
          >
            Wishlist
          </button>
          <button
            type="button"
            className={`panel-link ${activeView === 'library' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('library')
              setSelectedGameId(null)
              setDetailsReturnView('library')
              setMenuOpen(false)
            }}
          >
            Library
          </button>
          <div style={{ marginTop: 'auto' }}>
            <button type="button" className="panel-link" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>
      )}

      <main className="content">
        {activeView === 'wishlist' && currentUser ? (
          <WishlistPage
            wishlistGameIds={wishlistGameIds}
            libraryGameIds={libraryGameIds}
            onOpenGame={(gameId: string) => openGameDetails(gameId, 'wishlist')}
            onAddToLibrary={handleAddToLibrary}
            onRemoveFromLibrary={handleRemoveFromLibrary}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        ) : activeView === 'library' && currentUser ? (
          <LibraryPage
            libraryGameIds={libraryGameIds}
            wishlistGameIds={wishlistGameIds}
            onOpenGame={(gameId: string) => openGameDetails(gameId, 'library')}
            onRemoveFromLibrary={handleRemoveFromLibrary}
            onAddToWishlist={handleAddToWishlist}
          />
        ) : activeView === 'details' && selectedGameId ? (
          <GameDetailsPage
            gameId={selectedGameId}
            libraryGameIds={libraryGameIds}
            wishlistGameIds={wishlistGameIds}
            onBack={() => {
              setSelectedGameId(null)
              setActiveView(detailsReturnView)
            }}
            onAddToLibrary={handleAddToLibrary}
            onRemoveFromLibrary={handleRemoveFromLibrary}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        ) : (
          <CatalogPage
            resetSignal={catalogResetKey}
            libraryGameIds={libraryGameIds}
            wishlistGameIds={wishlistGameIds}
            onOpenGame={(gameId) => openGameDetails(gameId, 'catalog')}
            onAddToLibrary={handleAddToLibrary}
            onRemoveFromLibrary={handleRemoveFromLibrary}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        )}
      </main>
    </div>
  )
}

export default AppShell
