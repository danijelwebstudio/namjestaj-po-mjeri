import './BriefIntro.css';

export default function BriefIntro({ config, onStart }) {
  return (
    <section className="brief-intro" id={config.id} aria-labelledby={`${config.id}-heading`}>
      <div className="brief-intro-inner">
        <div className="brief-intro-heading">
          <p className="brief-intro-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
          <h2 id={`${config.id}-heading`}>{config.title}</h2>
          <p className="brief-intro-description">{config.description}</p>
          <p className="brief-intro-note">{config.note}</p>
        </div>
        <div className="brief-intro-body">
          <ol className="brief-intro-list" role="list">
            {config.items.map((item) => (
              <li key={item.id}>
                <span className="brief-intro-number" aria-hidden="true">{item.number}</span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </li>
            ))}
          </ol>
          <div className="brief-intro-action">
            <button type="button" onClick={onStart}>
              <span>{config.action.label}</span><span aria-hidden="true">↗</span>
            </button>
            <small>{config.action.helper}</small>
          </div>
        </div>
        <p className="brief-intro-disclaimer">{config.disclaimer}</p>
      </div>
    </section>
  );
}
