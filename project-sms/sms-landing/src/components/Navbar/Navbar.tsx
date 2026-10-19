import { useState, useEffect } from 'react';
import './Navbar.css';
import { NAV_LINKS } from '../../data/constants';

export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`lp-nav ${scrolled ? 'scrolled' : 'at-top'}`}>
        <div className="lp-nav-inner">
          <a href="#" className="lp-nav-logo">
            <div className="lp-nav-logo-icon">C</div>
            <span className="lp-nav-logo-text">Canopux <span>SMS</span></span>
          </a>
          <ul className="lp-nav-links">
            {NAV_LINKS.map(l => <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>)}
          </ul>
          <div className="lp-nav-actions">
            <a href="/login" className="lp-nav-login">Log in</a>
            <a href="#" className="btn-nav-demo">Book a Demo</a>
            <a href="#" className="btn-nav-cta">Get Started</a>
          </div>
          <button className="nav-mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
        </div>
      </nav>
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="lp-nav-logo">
            <div className="lp-nav-logo-icon">C</div>
            <span className="lp-nav-logo-text">Canopux <span>SMS</span></span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>✕</button>
        </div>
        <ul className="mobile-nav-links">
          {NAV_LINKS.map(l => <li key={l}><a href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{l}</a></li>)}
        </ul>
        <div className="mobile-actions">
          <a href="/login" className="btn-outline">Log in</a>
          <a href="#" className="btn-primary">Get Started →</a>
        </div>
      </div>
    </>
  );
}
