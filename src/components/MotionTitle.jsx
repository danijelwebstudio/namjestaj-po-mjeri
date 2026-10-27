export default function MotionTitle({ text, as: Tag = 'h2', ...props }) {
  return (
    <Tag {...props} aria-label={text} data-motion="title">
      <span aria-hidden="true">
        {text.split(' ').map((word, index) => (
          <span key={`${word}-${index}`}>
            {index > 0 && ' '}
            <span className="motion-word-clip"><span className="motion-word">{word}</span></span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
