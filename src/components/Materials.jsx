import { useState } from 'react';
import './Materials.css';

const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export default function Materials({ config }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = images[`/src/assets/images/${config.image}`];

  return (
    <section className="materials-section" id={config.id} aria-labelledby={`${config.id}-heading`}>
      <div className="materials-inner">
        <div className="materials-intro">
          <div>
            <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
            <h2 id={`${config.id}-heading`}>{config.title}</h2>
          </div>
          <p>{config.introduction}</p>
        </div>

        <div className="materials-content">
          <figure className="materials-figure">
            <div className="materials-image">
              {imageUrl && !imageFailed ? (
                <img src={imageUrl} alt={config.imageAlt} loading="lazy" decoding="async"
                  style={{ objectPosition: config.imagePosition || 'center' }}
                  onError={() => setImageFailed(true)} />
              ) : (
                <div className="materials-image-fallback" role="img" aria-label={`Fotografija ${config.image} nije dostupna`}>
                  <span>{config.caption}</span><small>{config.image}</small>
                </div>
              )}
            </div>
            <figcaption>{config.caption}</figcaption>
          </figure>

          <div className="materials-copy">
            <div className="materials-details">
              {config.details.map((detail) => (
                <article key={detail.id}>
                  <p className="materials-label">{detail.label}</p>
                  <h3>{detail.title}</h3>
                  <p className="materials-description">{detail.description}</p>
                </article>
              ))}
            </div>
            {config.closing && <p className="materials-closing">{config.closing}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
