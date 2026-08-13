import { useEffect, useState } from 'react';
import { fetchOutfits } from '../api';
import Reveal from './Reveal';

export default function Outfits() {
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    fetchOutfits().then(setOutfits).catch(console.error);
  }, []);

  return (
    <section id="outfits">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2>
            Outfits on tap, <em>for any moment</em>
          </h2>
          <p>Your daily dose of outfit inspiration, curated from the clothes you already own.</p>
        </Reveal>
        <div className="outfits">
          {outfits.map((o) => (
            <Reveal as="article" className="outfit" key={o.id}>
              <img src={o.image} alt={`${o.title} outfit`} />
              <div className="meta">
                <h4>{o.title}</h4>
                <p>{o.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
