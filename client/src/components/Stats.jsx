import { useEffect, useState } from 'react';
import { fetchStats } from '../api';
import Counter from './Counter';
import Reveal from './Reveal';

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  return (
    <section className="stats">
      <div className="wrap">
        <div className="stat-row">
          {stats.map((s) => (
            <Reveal className="stat" key={s.label}>
              <Counter value={s.value} suffix={s.suffix} />
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
