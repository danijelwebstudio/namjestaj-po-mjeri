import { useState } from 'react';

const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp}', {
  eager: true, query: '?url', import: 'default',
});

export default function Hero({ config, onStart }) {
  const [imageMissing, setImageMissing] = useState(false);
  const imageUrl = images[config.imageUrl];

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
        <h1 id="hero-title">{config.title}</h1>
        <p className="hero-description">{config.description}</p>
        <div className="hero-actions">
          <button className="button-primary" type="button" onClick={onStart}>
            {config.primaryCta}<span aria-hidden="true">↗</span>
          </button>
          <p className="cta-helper">{config.helper}</p>
        </div>
      </div>
      <figure className="hero-visual">
        {imageUrl && !imageMissing ? (
          <img src={imageUrl} alt={config.imageAlt} className="hero-image"
            fetchPriority="high" onError={() => setImageMissing(true)} />
        ) : (
          <div className="image-fallback" role="img" aria-label={config.imageAlt}>
            <span>Namještaj po vašoj mjeri</span>
          </div>
        )}
        <figcaption>{config.caption}</figcaption>
      </figure>
    </section>
  );
}
