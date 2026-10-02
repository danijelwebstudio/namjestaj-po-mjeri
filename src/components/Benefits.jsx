import { useState } from 'react';
import './Benefits.css';

const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export default function Benefits({ config }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = images[`/src/assets/images/${config.image}`];

  return (
    <section className="benefits-section" id={config.id} aria-labelledby={`${config.id}-heading`}>
      <div className="benefits-inner">
        <div className="benefits-intro">
          <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
          <h2 id={`${config.id}-heading`}>{config.title}</h2>
          <p>{config.description}</p>
        </div>

        <div className="benefits-content">
          <figure className="benefits-figure">
            <div className="benefits-image">
              {imageUrl && !imageFailed ? (
                <img src={imageUrl} alt={config.imageAlt} loading="lazy" decoding="async"
                  style={{ objectPosition: config.imagePosition || 'center' }}
                  onError={() => setImageFailed(true)} />
              ) : (
                <div className="benefits-image-fallback" role="img" aria-label={`Fotografija ${config.image} nije dostupna`}>
                  <span>{config.imageCaption}</span><small>{config.image}</small>
                </div>
              )}
            </div>
            <figcaption>{config.imageCaption}</figcaption>
          </figure>

          <ol className="benefits-list" role="list">
            {config.points.map((point, index) => (
              <li key={point.id}>
                <span className="benefits-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
