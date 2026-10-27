import { useState } from 'react';
import './SelectedWork.css';

const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true, query: '?url', import: 'default',
});

function WorkImage({ project }) {
  const [failed, setFailed] = useState(false);
  const src = images[`/src/assets/images/${project.image}`];
  return <div className="work-image">
    {src && !failed ? (
      <img src={src} alt={project.imageAlt} loading="lazy" decoding="async"
        style={{ objectPosition: project.imagePosition || 'center' }} onError={() => setFailed(true)} />
    ) : (
      <div className="image-fallback" role="img" aria-label={project.imageAlt}><span>{project.title}</span></div>
    )}
  </div>;
}

export default function SelectedWork({ config }) {
  return (
    <section className="selected-work" id={config.id} aria-labelledby="work-heading">
      <span className="section-anchor" id="radovi" aria-hidden="true" />
      <div className="section-inner">
        <div className="work-intro" data-reveal="">
          <div>
            <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
            <h2 id="work-heading">{config.title}</h2>
          </div>
          <p className="work-demo-label">{config.demoLabel}</p>
        </div>
        <div className="work-grid">
          {config.items.map((project, index) => (
            <figure className="work-item" key={project.id}>
              <WorkImage project={project} />
              <figcaption>
                <span className="work-number" aria-hidden="true">0{index + 1}</span>
                <h3>{project.title}</h3>
                <span className="work-caption">{project.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="work-other">{config.other}</p>
      </div>
    </section>
  );
}
