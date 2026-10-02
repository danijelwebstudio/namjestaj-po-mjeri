import { useEffect, useState } from 'react';

export default function Header({ config, onFutureSection }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  function navigateToFuture(label) {
    setMenuOpen(false);
    onFutureSection(label);
  }

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
          {config.navigation.map((item) => item.href ? (
            <a key={item.id} href={item.href}>{item.label}</a>
          ) : (
            <button key={item.id} type="button" onClick={() => navigateToFuture(item.label)}>{item.label}</button>
          ))}
        </nav>

        <div className="header-actions">
          <a className="header-cta" href={`#${config.briefIntro.id}`}>
            Započni projekat <span aria-hidden="true">↗</span>
          </a>
          <button
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
          {config.navigation.map((item) => item.href ? (
            <a key={item.id} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<span aria-hidden="true">↗</span></a>
          ) : (
            <button key={item.id} type="button" onClick={() => navigateToFuture(item.label)}>{item.label}<span aria-hidden="true">↗</span></button>
          ))}
          <a className="mobile-nav-cta" href={`#${config.briefIntro.id}`} onClick={() => setMenuOpen(false)}>
            Započni projekat <span aria-hidden="true">↗</span>
          </a>
        </nav>
      )}
    </header>
  );
}
