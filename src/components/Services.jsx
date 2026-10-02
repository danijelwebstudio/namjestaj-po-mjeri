import { useState } from 'react';
import './Services.css';

const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function ServiceImage({ item }) {
  const [failed, setFailed] = useState(false);
  const src = images[`/src/assets/images/${item.image}`];

  return (
    <div className="service-media">
      {src && !failed ? (
        <img
          src={src}
          alt={item.imageAlt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: item.imagePosition || 'center' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="service-image-fallback" role="img" aria-label={`Fotografija za ${item.label} nije dostupna`}>
          <span>{item.label}</span>
          <small>{item.image}</small>
        </div>
      )}
    </div>
  );
}

function ServiceItem({ item }) {
  return (
    <article className="service-item" aria-labelledby={`service-${item.id}`}>
      <ServiceImage key={item.image} item={item} />
      <div className="service-copy">
        <h3 id={`service-${item.id}`}>{item.label}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}

export default function Services({ config }) {
  const featuredItems = config.items.filter((item) => item.featured);
  const otherItems = config.items.filter((item) => !item.featured);

  return (
    <section className="services-section" id={config.id} aria-labelledby="services-heading">
      <div className="services-inner">
        <div className="services-intro">
          <div>
            <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
            <h2 id="services-heading">{config.title}</h2>
          </div>
          <p className="services-description">{config.description}</p>
        </div>

        {featuredItems.length > 0 && (
          <div className="services-featured">
            {featuredItems.map((item) => <ServiceItem key={item.id} item={item} />)}
          </div>
        )}

        {otherItems.length > 0 && (
          <div className="services-more">
            {otherItems.map((item) => <ServiceItem key={item.id} item={item} />)}
          </div>
        )}

        <div className="services-closing">
          <p className="services-closing-title">{config.closingTitle}</p>
          <p>{config.closingDescription}</p>
        </div>
      </div>
    </section>
  );
}
