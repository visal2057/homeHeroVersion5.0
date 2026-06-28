import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--color-primary-700)' : 'var(--color-secondary-700)',
  fontWeight: 600,
});

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tracks whether the page has been scrolled down, so we can add a
  // subtle shadow to the header once content starts passing behind it.
  const [isScrolled, setIsScrolled] = useState(false);

  // Tracks whether the mobile hamburger menu is open. Only used on
  // small screens; the CSS hides the toggle button on desktop.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
    navigate(ROUTES.HOME);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className={`public-header ${isScrolled ? 'public-header-scrolled' : ''}`}>
      <div
        className="container"
        style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)' }}
      >
        <Link
          to={ROUTES.HOME}
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 800,
            color: 'var(--color-secondary-700)',
          }}
        >
          HomeHero
        </Link>

        <nav className="public-header-nav">
          <NavLink to={ROUTES.HOME} style={navLinkStyle} end>
            Home
          </NavLink>
          <NavLink to={ROUTES.ABOUT} style={navLinkStyle}>
            About Us
          </NavLink>
          <NavLink to={ROUTES.CAREERS} style={navLinkStyle}>
            Careers
          </NavLink>
          <NavLink to={ROUTES.CONTACT} style={navLinkStyle}>
            Contact Us
          </NavLink>
        </nav>

        <div className="public-header-actions">
          {user ? (
            <>
              <span style={{ fontWeight: 600, color: 'var(--color-secondary-700)' }}>{user.username}</span>
              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.REGISTER_ROLE} className="btn btn-outline">
                Sign Up
              </Link>
              <Link to={ROUTES.LOGIN} className="btn btn-primary">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button - only shown on small screens via CSS. */}
        <button
          type="button"
          className="public-header-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile dropdown menu: same links as the desktop nav, stacked
          vertically. Only rendered when open, and only visible on
          small screens (the CSS hides it above the mobile breakpoint). */}
      {isMobileMenuOpen && (
        <div className="public-header-mobile-menu animate-fade-in-up">
          <NavLink to={ROUTES.HOME} onClick={closeMobileMenu} end>
            Home
          </NavLink>
          <NavLink to={ROUTES.ABOUT} onClick={closeMobileMenu}>
            About Us
          </NavLink>
          <NavLink to={ROUTES.CAREERS} onClick={closeMobileMenu}>
            Careers
          </NavLink>
          <NavLink to={ROUTES.CONTACT} onClick={closeMobileMenu}>
            Contact Us
          </NavLink>
          <hr />
          {user ? (
            <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to={ROUTES.REGISTER_ROLE} className="btn btn-outline btn-block" onClick={closeMobileMenu}>
                Sign Up
              </Link>
              <Link to={ROUTES.LOGIN} className="btn btn-primary btn-block" onClick={closeMobileMenu}>
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
