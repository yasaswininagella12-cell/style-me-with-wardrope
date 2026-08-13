import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: '#how', label: 'How it works' },
    { href: '#features', label: 'Features' },
    { href: '#outfits', label: 'Outfits' },
    { href: '#reviews', label: 'Reviews' }
  ];

  return (
    <header>
      <nav className="wrap">
        <a href="#" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">S</span>
          <span className="logo-text">
            Style<em>Me</em>
          </span>
        </a>
        <ul className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#join" className="btn btn-gold" style={{ padding: '10px 22px' }}>
            Join now
          </a>
          <button
            className="burger"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}
