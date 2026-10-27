import CtaButton from './CtaButton.jsx';
import { useEffect, useRef, useState } from 'react';

export default function Header({ config, onStart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 700) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);


  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#main" className="brand" aria-label={`${config.brand.name} — početna`} onClick={() => setMenuOpen(false)}>
          {config.brand.logoUrl ? (
            <img src={config.brand.logoUrl} alt={config.brand.name} className="brand-logo" />
          ) : (
            <>
              <span className="brand-mark" aria-hidden="true">P<span className="brand-slash">/</span>M</span>
              <span className="brand-text"><strong>{config.brand.shortName}</strong><small>{config.brand.descriptor}</small></span>
            </>
          )}
        </a>

        <nav className="desktop-nav" aria-label="Glavna navigacija">
          {config.navigation.map((item) => <a key={item.id} href={item.href}>{item.label}</a>)}
        </nav>

        <div className="header-actions">
          <CtaButton className="header-cta" label={config.hero.primaryCta} onClick={onStart} />
          <button
            ref={menuToggle}
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobilna navigacija">
          {config.navigation.map((item) => <a key={item.id} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>)}
          <CtaButton className="mobile-nav-cta" label={config.hero.primaryCta} onClick={() => { setMenuOpen(false); menuToggle.current?.focus(); onStart(); }} />
        </nav>
      )}
    </header>
  );
}
