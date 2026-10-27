import './BriefIntro.css';

export default function BriefIntro({ config, onStart }) {
  return (
    <section className="brief-intro" id={config.id} aria-labelledby="project-brief-heading">
      <div className="section-inner brief-intro-inner" data-reveal="">
        <div>
          <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
          <h2 id="project-brief-heading">{config.title}</h2>
          <p className="brief-intro-description">{config.description}</p>
        </div>
        <div className="brief-intro-action">
          <button className="button-primary" type="button" onClick={onStart}>
            {config.action.label}<span aria-hidden="true">↗</span>
          </button>
          <p className="cta-helper">{config.action.helper}</p>
        </div>
      </div>
    </section>
  );
}
