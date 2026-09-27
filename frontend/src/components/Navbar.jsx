import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Brain, Info, Menu, X } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <HeartPulseIcon />
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-primary">CardioSense</span>
            <span className="navbar__logo-ai">AI</span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <div className="navbar__links">
          <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Activity size={15} />
            Home
          </NavLink>
          <NavLink to="/analyze" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Brain size={15} />
            Analyze
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Info size={15} />
            About
          </NavLink>
        </div>

        {/* CTA */}
        <div className="navbar__cta">
          <NavLink to="/analyze" className="btn btn-primary btn-sm">
            Start Analysis
          </NavLink>
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          <NavLink to="/" className="navbar__mobile-link">Home</NavLink>
          <NavLink to="/analyze" className="navbar__mobile-link">Analyze ECG</NavLink>
          <NavLink to="/about" className="navbar__mobile-link">About</NavLink>
        </div>
      )}
    </nav>
  )
}

function HeartPulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h5.28" />
    </svg>
  )
}
