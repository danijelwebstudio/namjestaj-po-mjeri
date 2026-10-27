import MotionTitle from './MotionTitle.jsx';
import './Benefits.css';

export default function Benefits({ config }) {
  return (
    <section className="brief-benefits" id={config.id} aria-labelledby="brief-benefits-heading">
      <div className="section-inner brief-benefits-inner">
        <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
        <MotionTitle id="brief-benefits-heading" text={config.title} />
        <p className="brief-benefits-description" data-motion="fade">{config.description}</p>
      </div>
    </section>
  );
}
