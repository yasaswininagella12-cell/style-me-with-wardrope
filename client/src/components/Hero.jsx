import Reveal from './Reveal';

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <Reveal>
          <span className="kicker">
            <span className="dot" /> Your AI Stylist, always on call
          </span>
          <h1>
            Never wonder <em>what to wear</em> again.
          </h1>
          <p className="lead">
            StyleMe decodes your personal style in seconds — build a capsule
            wardrobe you love, pair your pieces into perfect outfits, and shop
            with total confidence. All in one elegant app.
          </p>
          <div className="hero-cta">
            <a href="#join" className="btn btn-gold">
              Discover your style →
            </a>
            <a href="#how" className="btn btn-ghost">
              See how it works
            </a>
          </div>
          <div className="hero-trust">
            <span className="stars">★★★★★</span>
            <span>
              Loved by <b style={{ color: 'var(--ivory)' }}>120,000+</b>{' '}
              stylish humans
            </span>
          </div>
        </Reveal>

        <Reveal>
          <div className="hero-visual">
            <img
              className="hero-img"
              src="https://picsum.photos/seed/stylemehero/600/750"
              alt="Stylish woman in a chic outfit"
            />
            <div className="float-card fc-1">
              <span className="ic">🧬</span>
              <span>
                <b>Style DNA found</b>
                <small>Neutral · Classic</small>
              </span>
            </div>
            <div className="float-card fc-2">
              <span className="ic">👗</span>
              <span>
                <b>3 outfits ready</b>
                <small>for this evening</small>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
