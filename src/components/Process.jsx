import './Process.css';

export default function Process({ config }) {
  return (
    <section className="process-section" id={config.id} aria-labelledby={`${config.id}-heading`}>
      <div className="process-inner">
        <div className="process-layout">
          <div className="process-intro">
            <p className="process-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
            <h2 id={`${config.id}-heading`}>{config.title}</h2>
            <p className="process-description">{config.description}</p>
            {config.preparation && (
              <div className="process-preparation">
                <p className="process-preparation-title">{config.preparation.title}</p>
                <p>{config.preparation.description}</p>
              </div>
            )}
          </div>

          <ol className="process-steps" role="list" aria-label={config.stepsLabel}>
            {config.steps.map((step, index) => (
              <li key={step.id} className="process-step">
                <span className="process-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {config.quoteNote && (
          <aside className="process-quote-note" aria-labelledby={`${config.id}-quote-heading`}>
            <div>
              <p className="process-note-eyebrow">{config.quoteNote.eyebrow}</p>
              <h3 id={`${config.id}-quote-heading`}>{config.quoteNote.title}</h3>
            </div>
            <p className="process-note-description">{config.quoteNote.description}</p>
          </aside>
        )}
      </div>
    </section>
  );
}
