import { useEffect, useState } from 'react';
import { fetchFeatures } from '../api';
import Reveal from './Reveal';

export default function Features() {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetchFeatures().then(setFeatures).catch(console.error);
  }, []);

  return (
    <section className="features" id="features">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2>
            More than a stylist — <em>a style system</em>
          </h2>
          <p>Fresh ideas built in, so your wardrobe works every single day.</p>
        </Reveal>
        <div className="feat-grid">
          {features.map((f) => (
            <Reveal className="feat" key={f.id}>
              <div className="ic">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              {f.tag && <span className="tag">{f.tag}</span>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
