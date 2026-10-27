import MotionTitle from './MotionTitle.jsx';
import './Process.css';

export default function Process({ config }) {
  return (
    <section className="process-section" id={config.id} aria-labelledby="process-heading">
      <div className="section-inner process-layout">
        <div className="process-intro">
          <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
          <MotionTitle id="process-heading" text={config.title} />
          <p className="process-note" data-motion="fade">{config.note}</p>
        </div>
        <ol className="process-steps" aria-label={config.stepsLabel} data-motion="steps">
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
