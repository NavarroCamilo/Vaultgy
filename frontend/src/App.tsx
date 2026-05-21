import { useEffect, useMemo, useState } from 'react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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

  const filteredGames = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return games
    }

    return games.filter((game) => {
      const byTitle = game.title.toLowerCase().includes(normalizedQuery)
      const byGenre = (game.genre ?? '').toLowerCase().includes(normalizedQuery)

      return byTitle || byGenre
    })
  }, [games, searchQuery])

  const runSearch = () => {
    setSearchQuery(searchDraft)
  }

  const handleLogin = async () => {
    try {
      await api.get('/auth/profile')
      alert('Sesion activa')
    } catch {
      alert('Conecta luego el login real a /auth/login')
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
            aria-label="Open side menu"
          >
            ☰
          </button>
          <h1 className="brand">VAULTGY</h1>
        </div>
        <div className="auth-actions">
          <button type="button" className="ghost-btn" onClick={handleLogin}>Login</button>
          <button type="button" className="solid-btn">Register</button>
        </div>
      </header>

      <aside className={`sidepanel ${menuOpen ? 'open' : ''}`}>
        <h2>Menu</h2>
        <button type="button" className="panel-link">Library</button>
        <button type="button" className="panel-link">Waitlist</button>
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
                <div className="game-top">
                  <h3>{game.title}</h3>
                  <span>{game.genre ?? 'Unknown'}</span>
                </div>
                <p>{game.description ?? 'Sin descripcion disponible.'}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
