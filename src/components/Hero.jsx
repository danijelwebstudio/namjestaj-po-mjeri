import CtaButton from './CtaButton.jsx';
import MotionTitle from './MotionTitle.jsx';
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
        <MotionTitle as="h1" id="hero-title" text={config.title} />
        <p className="hero-description">{config.description}</p>
        <div className="hero-actions">
          <CtaButton label={config.primaryCta} onClick={onStart} />
          <p className="cta-helper">{config.helper}</p>
        </div>
      </div>
      <figure className="hero-visual">
        {imageUrl && !imageMissing ? (
          <div className="hero-image-reveal"><img src={imageUrl} alt={config.imageAlt} className="hero-image"
            fetchPriority="high" onError={() => setImageMissing(true)} /></div>
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
