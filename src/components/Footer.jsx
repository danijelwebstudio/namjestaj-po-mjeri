import { live, privacyUrl } from '../data/leadService.js';
import './Footer.css';

export default function Footer({ config, onStart }) {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand"><span className="footer-brand-name">{config.brand.shortName}</span><p>Namještaj po mjeri · Portfolio koncept</p><p>Portfolio demo projekat zasnovan na istraživanju procesa izrade namještaja po mjeri.</p></div>
      <nav aria-label="Navigacija u podnožju">{config.navigation.map((item) => <a key={item.id} href={item.href}>{item.label}</a>)}</nav>
      <div className="footer-actions"><button type="button" onClick={onStart}>Započni projekat ↗</button><a href="#/upiti">Ulaz za stolara ↗</a>{live && privacyUrl && <a href={privacyUrl} target="_blank" rel="noopener noreferrer">Privatnost ↗</a>}</div>
    </div>
    <div className="footer-bottom"><span>Portfolio demo · Podaci firme nisu predstavljeni</span><span>Dizajn i razvoj — Danijel Web</span></div>
  </footer>;
}
