import { useEffect, useRef, useState } from 'react';
import { businessConfig } from './config/businessConfig.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import SelectedWork from './components/SelectedWork.jsx';
import Process from './components/Process.jsx';
import Benefits from './components/Benefits.jsx';
import BriefIntro from './components/BriefIntro.jsx';
import BriefWizard from './brief/BriefWizard.jsx';
import Inbox from './inbox/Inbox.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [briefOpen, setBriefOpen] = useState(false);
  const [inbox, setInbox] = useState(window.location.hash.startsWith('#/upiti'));
  const landing = useRef(null);
  useEffect(() => {
    const update = () => { setInbox(window.location.hash.startsWith('#/upiti')); setBriefOpen(false); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (inbox || motion.matches || !('IntersectionObserver' in window)) return undefined;
    const animations = [];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!motion.matches && entry.target.animate) {
          animations.push(entry.target.animate(
            [{ opacity: 0.5, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' },
          ));
        }
      }
    }, { threshold: 0.12 });
    landing.current?.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    const stopMotion = () => { if (motion.matches) animations.forEach((animation) => animation.cancel()); };
    motion.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener('change', stopMotion);
    };
  }, [inbox]);

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
        <Header config={businessConfig} onStart={() => setBriefOpen(true)} />
        <main id="main" ref={landing}>
          <Hero config={businessConfig.hero} onStart={() => setBriefOpen(true)} />
          <SelectedWork config={businessConfig.work} />
          <Benefits config={businessConfig.benefits} />
          <Process config={businessConfig.process} />
          <BriefIntro config={businessConfig.briefIntro} onStart={() => setBriefOpen(true)} />
        </main>
        <BriefWizard config={businessConfig.projectBrief} open={briefOpen} onClose={() => setBriefOpen(false)} />
        <Footer config={businessConfig} />
      </>}
    </div>
  );
}
