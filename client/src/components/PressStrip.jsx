import Reveal from './Reveal';

export default function PressStrip() {
  const names = ['VOGUE', 'ELLE', 'TechCrunch', 'NY Times', 'Forbes', 'WWD'];
  return (
    <Reveal as="div" className="press wrap">
      <p>As featured in</p>
      <div className="press-row">
        {names.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </Reveal>
  );
}
