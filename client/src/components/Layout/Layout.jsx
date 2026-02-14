import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <h1 className="header-title">La Cucina</h1>
            <span className="header-subtitle">Recipe Collection</span>
          </Link>
          <nav className="header-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/recipes/new"
              className={`nav-link nav-link-create ${location.pathname === '/recipes/new' ? 'active' : ''}`}
            >
              + Create Recipe
            </Link>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>La Cucina &mdash; A personal recipe collection</p>
      </footer>
    </div>
  );
}

export default Layout;
