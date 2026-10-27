import './Benefits.css';

export default function Benefits({ config }) {
  return (
    <section className="brief-benefits" id={config.id} aria-labelledby="brief-benefits-heading">
      <div className="section-inner brief-benefits-inner" data-reveal="">
        <p className="section-eyebrow"><span aria-hidden="true" />{config.eyebrow}</p>
        <h2 id="brief-benefits-heading">{config.title}</h2>
        <p className="brief-benefits-description">{config.description}</p>
      </div>
    </section>
  );
}
