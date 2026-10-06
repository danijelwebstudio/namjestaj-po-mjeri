import { useState } from 'react';

// Vite includes the image when the real file is added; the demo also builds without it.
const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export default function Hero({ config, onStart }) {
  const [imageMissing, setImageMissing] = useState(false);
  const imageUrl = images[config.imageUrl];

  return (
    <section className="hero grid" aria-labelledby="hero-title">
      <div className="hero-copy flex flex-col justify-between">
        <div className="hero-copy-inner">
          <div className="hero-eyebrow"><span className="eyebrow-rule" />{config.eyebrow}</div>
          <h1 id="hero-title">{config.title}</h1>
          <p className="hero-description">{config.description}</p>
          <div className="hero-actions">
            <button className="button-primary" type="button" onClick={onStart}>
              {config.primaryCta}<span aria-hidden="true">↗</span>
            </button>
            <a className="button-secondary" href={config.secondaryHref}>
              {config.secondaryCta}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        {!imageUrl || imageMissing ? (
          <div className="image-placeholder" role="img" aria-label="Mjesto za fotografiju hero-main.jpg">
            <div className="placeholder-inner"><span className="placeholder-number">01 / 01</span><span className="placeholder-title">Vaš prostor.<br /><em>Naša pažnja.</em></span><span className="placeholder-filename">Dodajte src/assets/images/hero-main.jpg</span></div>
          </div>
        ) : (
          <img src={imageUrl} alt={config.imageAlt} className="hero-image" onError={() => setImageMissing(true)} />
        )}
        <div className="image-caption" aria-hidden="true"><span>Promišljeno do posljednjeg detalja</span></div>
      </div>
    </section>
  );
}
