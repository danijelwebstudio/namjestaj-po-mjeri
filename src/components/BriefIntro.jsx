import CtaButton from './CtaButton.jsx';
import MotionTitle from './MotionTitle.jsx';
import './BriefIntro.css';

export default function BriefIntro({ config, onStart }) {
  return (
    <section className="brief-intro" id={config.id} aria-labelledby="project-brief-heading">
      <div className="section-inner brief-intro-inner">
        <div>
          <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
          <MotionTitle id="project-brief-heading" text={config.title} />
          <p className="brief-intro-description" data-motion="fade">{config.description}</p>
        </div>
        <div className="brief-intro-action" data-motion="fade">
          <CtaButton label={config.action.label} onClick={onStart} />
          <p className="cta-helper">{config.action.helper}</p>
        </div>
      </div>
    </section>
  );
}
