import { useEffect, useState } from 'react';
import { fetchSteps } from '../api';
import Reveal from './Reveal';

export default function HowItWorks() {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    fetchSteps().then(setSteps).catch(console.error);
  }, []);

  return (
    <section id="how">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2>
            Look amazing &amp; always know <em>what to wear</em> in 1-2-3
          </h2>
          <p>Three simple steps between you and a wardrobe that finally works for you.</p>
        </Reveal>
        <div className="steps">
          {steps.map((s) => (
            <article className="step" key={s.id}>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <img src={s.image} alt={s.title} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
