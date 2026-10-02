import { useEffect, useState } from 'react';
import { businessConfig } from './config/businessConfig.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import SelectedWork from './components/SelectedWork.jsx';
import Process from './components/Process.jsx';
import Benefits from './components/Benefits.jsx';
import Materials from './components/Materials.jsx';
import BriefIntro from './components/BriefIntro.jsx';
import BriefWizard from './brief/BriefWizard.jsx';
import Inbox from './inbox/Inbox.jsx';

export default function App() {
  const [notice, setNotice] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const [inbox, setInbox] = useState(window.location.hash.startsWith('#/upiti'));
  useEffect(() => {
    const update = () => { setInbox(window.location.hash.startsWith('#/upiti')); setBriefOpen(false); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  function openFutureSection(label) {
    setNotice(`${label} — ovu sekciju dodajemo u narednom koraku.`);
  }

  return (
    <div className="app-shell" style={{
      '--color-background': businessConfig.theme.background,
      '--color-paper': businessConfig.theme.paper,
      '--color-text': businessConfig.theme.text,
      '--color-muted': businessConfig.theme.muted,
      '--color-accent': businessConfig.theme.accent,
      '--color-line': businessConfig.theme.line,
    }}>
      {inbox ? <Inbox /> : <>
      <a className="skip-link" href="#main">Preskoči navigaciju</a>
      <Header config={businessConfig} onFutureSection={openFutureSection} />
      <main id="main">
        <Hero config={businessConfig.hero} />
        <Services config={businessConfig.services} />
        <SelectedWork config={businessConfig.work} />
        <Process config={businessConfig.process} />
        <Benefits config={businessConfig.benefits} />
        <Materials config={businessConfig.materials} />
        <BriefIntro config={businessConfig.briefIntro} onStart={() => setBriefOpen(true)} />
      </main>
      <BriefWizard config={businessConfig.projectBrief} open={briefOpen} onClose={() => setBriefOpen(false)} />
      <div className="inbox-entry"><a href="#/upiti">Ulaz za stolara →</a></div>
      </>}
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Zatvori obavještenje">×</button>
        </div>
      )}
    </div>
  );
}
