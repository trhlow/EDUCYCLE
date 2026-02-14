import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎓 EduCycle
        </Link>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/products" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Browse
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-icon-btn" aria-label="Shopping cart">
            🛒
            <span className="navbar-cart-badge">0</span>
          </Link>
          <Link to="/auth">
            <button className="navbar-auth-btn">Sign In</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
