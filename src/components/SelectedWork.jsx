import { useRef, useState } from 'react';
import './SelectedWork.css';

const images = import.meta.glob('/src/assets/images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function WorkImage({ project }) {
  const [failed, setFailed] = useState(false);
  const src = images[`/src/assets/images/${project.image}`];

  return (
    <div className="work-image">
      {src && !failed ? (
        <img src={src} alt={project.imageAlt} loading="lazy" decoding="async"
          style={{ objectPosition: project.imagePosition || 'center' }}
          onError={() => setFailed(true)} />
      ) : (
        <div className="work-image-fallback" role="img" aria-label={`Fotografija za ${project.tabLabel} nije dostupna`}>
          <span>{project.tabLabel}</span><small>{project.image}</small>
        </div>
      )}
    </div>
  );
}

export default function SelectedWork({ config }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef([]);
  const activeIndex = Math.min(selected, config.items.length - 1);
  const active = config.items[activeIndex];
  if (!active) return null;

  function handleTabKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % config.items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + config.items.length) % config.items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = config.items.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="selected-work" id={config.id} aria-labelledby={`${config.id}-heading`}>
      <div className="work-inner">
        <div className="work-intro">
          <div>
            <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
            <h2 id={`${config.id}-heading`}>{config.title}</h2>
          </div>
          <div className="work-intro-aside">
            <p>{config.description}</p>
            {config.demoLabel && <span className="work-demo-label">{config.demoLabel}</span>}
          </div>
        </div>

        <div className="work-tabs" role="tablist" aria-label={config.tabsLabel}>
          {config.items.map((project, index) => (
            <button key={project.id} ref={(element) => { tabs.current[index] = element; }}
              type="button" role="tab" id={`${config.id}-tab-${project.id}`}
              aria-selected={activeIndex === index}
              aria-controls={`${config.id}-panel-${project.id}`}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => setSelected(index)} onKeyDown={(event) => handleTabKey(event, index)}>
              <span className="work-tab-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span>{project.tabLabel}</span>
              <span className="work-tab-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>

        {config.items.map((project, index) => (
          <div key={project.id} id={`${config.id}-panel-${project.id}`} role="tabpanel"
            aria-labelledby={`${config.id}-tab-${project.id}`} tabIndex={0} hidden={activeIndex !== index}
            className="work-panel">
            {activeIndex === index && <>
              <WorkImage key={project.image} project={project} />
              <div className="work-copy">
                <p className="work-category">{project.category}</p>
                <h3>{project.title}</h3>
                <p className="work-description">{project.description}</p>
                <dl className="work-focus"><dt>{project.focusLabel}</dt><dd>{project.focus}</dd></dl>
                <div className="work-details">
                  <p>{config.detailsLabel}</p>
                  <ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                </div>
              </div>
            </>}
          </div>
        ))}
      </div>
    </section>
  );
}
