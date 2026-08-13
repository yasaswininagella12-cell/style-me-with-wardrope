import { useState } from 'react';
import { subscribeNewsletter } from '../api';
import Reveal from './Reveal';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(false);
    try {
      const res = await subscribeNewsletter(email);
      setMsg(res.message);
      setEmail('');
    } catch (error) {
      setErr(true);
      setMsg(error.message);
    }
  };

  return (
    <section id="join">
      <div className="wrap">
        <Reveal className="cta-banner">
          <h2>
            Elevate your <em>style</em> today
          </h2>
          <p>
            Join 120,000+ people who wake up already knowing exactly what to wear.
            Your best-dressed era starts now.
          </p>
          <form className="newsletter" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email to get the app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-gold" style={{ fontSize: 16, padding: '15px 34px' }}>
              Create my Style Formula — it's free
            </button>
            {msg && <span className={`msg ${err ? 'err' : ''}`}>{msg}</span>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
