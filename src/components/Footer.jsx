import { live, privacyUrl } from '../data/leadService.js';
import './Footer.css';

export default function Footer({ config }) {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand"><span>{config.brand.shortName}</span><p>Portfolio demo · Podaci firme nisu predstavljeni</p></div>
      <div className="footer-links">
        <span>Dizajn i razvoj — Danijel Web</span>
        {live && privacyUrl && <a href={privacyUrl} target="_blank" rel="noopener noreferrer">Privatnost ↗</a>}
        <a href="#/upiti">Ulaz za stolara ↗</a>
      </div>
    </div>
  </footer>;
}
