import './Process.css';

export default function Process({ config }) {
  return (
    <section className="process-section" id={config.id} aria-labelledby="process-heading">
      <div className="section-inner process-layout">
        <div className="process-intro" data-reveal="">
          <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
          <h2 id="process-heading">{config.title}</h2>
          <p className="process-note">{config.note}</p>
        </div>
        <ol className="process-steps" aria-label={config.stepsLabel} data-reveal="">
          {config.steps.map((step, index) => (
            <li key={step.id} id={step.anchor}>
              <span className="process-number" aria-hidden="true">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
