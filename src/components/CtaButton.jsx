export default function CtaButton({ label, onClick, className = 'button-primary' }) {
  return (
    <button className={`${className} motion-cta`} type="button" aria-label={label} onClick={onClick} data-magnetic="">
      <span className="cta-label" data-label={label} aria-hidden="true"><span>{label}</span></span>
      <span className="cta-arrow" aria-hidden="true">↗</span>
    </button>
  );
}
