import { useEffect, useRef, useState } from 'react';
import { siteKey } from '../data/leadService.js';
export default function SpamCheck({ onToken, resetKey }) {
  const target = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!siteKey) return;
    let widget; let cancelled = false;
    const render = () => {
      if (cancelled || !window.turnstile) return;
      widget = window.turnstile.render(target.current, { sitekey: siteKey, action: 'brief', callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => { onToken(''); setError('Provjera nije uspjela. Osvježite provjeru ili pokušajte kasnije.'); } });
    };
    let script = document.getElementById('turnstile-script');
    if (window.turnstile) render();
    else {
      if (!script) { script = document.createElement('script'); script.id = 'turnstile-script'; script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; document.head.append(script); }
      script.addEventListener('load', render);
    }
    return () => { cancelled = true; script?.removeEventListener('load', render); if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [onToken, resetKey]);
  return <div><div ref={target} />{error && <p role="alert">{error}</p>}</div>;
}
