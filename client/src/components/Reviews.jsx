import { useEffect, useState } from 'react';
import { fetchTestimonials } from '../api';
import Reveal from './Reveal';

function Stars({ n }) {
  const full = '\u2605'.repeat(n);
  const empty = '\u2606'.repeat(5 - n);
  return <span className="stars">{full}{empty}</span>;
}

export default function Reviews() {
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetchTestimonials()
      .then((d) => setGroups(d.groups || []))
      .catch(console.error);
  }, []);

  const current = groups[active];

  return (
    <section id="reviews">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2>
            Ratings &amp; <em>Reviews</em>
          </h2>
          <p>Real words from people who stopped staring at a full closet with nothing to wear.</p>
        </Reveal>
        {groups.length > 0 && (
          <>
            <Reveal className="tabs">
              {groups.map((g, i) => (
                <button
                  key={g.id}
                  className={`tab ${i === active ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  {g.label}
                </button>
              ))}
            </Reveal>
            <div className="tview active">
              {current.items.map((c) => (
                <article className="card" key={c.name}>
                  <Stars n={c.stars} />
                  <p className="quote">"{c.quote}"</p>
                  <div className="who">
                    <img src={c.avatar} alt={c.name} />
                    <span>
                      <b>{c.name}</b>
                      <small>{c.country}</small>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
