import { useEffect, useState } from 'react'
import { api } from './api/http'
import './App.css'

type Game = {
  id: string
  title: string
  description?: string | null
  coverImage?: string | null
  genre?: string | null
}

function App() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchColumn, setSearchColumn] = useState<'title' | 'genre'>('title')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
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

  const handleLogin = async () => {
    try {
      await api.get('/auth/profile')
      alert('Sesion activa')
    } catch {
      alert('Conecta luego el login real a /auth/login')
    }
  }

  const handleAddToLibrary = async (gameId: string) => {
    try {
      await api.post(`/users/me/library/${gameId}`)
      alert('Agregado a la biblioteca')
    } catch {
      alert('No se pudo agregar a la biblioteca. Inicia sesión primero.')
    }
  }

  const handleAddToWaitlist = async (gameId: string) => {
    try {
      await api.post(`/users/me/waitlist/${gameId}`)
      alert('Agregado a la lista de deseado')
    } catch {
      alert('No se pudo agregar a la lista de deseado. Inicia sesión primero.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-group">
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
          <button type="button" className="brand-button" onClick={handleBrandClick}>
            <h1 className="brand">VAULTGY</h1>
          </button>
        </div>
        <div className="auth-actions">
          <button type="button" className="ghost-btn" onClick={handleLogin}>Login</button>
          <button type="button" className="solid-btn">Register</button>
        </div>
      </header>

      <button
        type="button"
        className={`drawer-overlay ${menuOpen ? 'visible' : ''}`}
        aria-label="Cerrar menu lateral"
        onClick={() => setMenuOpen(false)}
      />

      <aside id="sidepanel-drawer" className={`sidepanel ${menuOpen ? 'open' : ''}`}>
        <h2>Menu</h2>
        <button type="button" className="panel-link" onClick={() => setMenuOpen(false)}>Library</button>
        <button type="button" className="panel-link" onClick={() => setMenuOpen(false)}>Waitlist</button>
      </aside>

      <main className="content">
        <section className="hero-banner">
          <p className="hero-tag">Game Catalog</p>
          <h2>Encuentra tu proximo juego</h2>
          <p className="hero-copy">
            Busca por titulo o genero y administra tu coleccion en Library y Waitlist.
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

          {!loading && !error && filteredGames.map((game) => (
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
                    onClick={() => handleAddToWaitlist(game.id)}
                  >
                    Lista de deseado
                  </button>
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
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
