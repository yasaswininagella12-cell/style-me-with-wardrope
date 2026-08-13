const columns = [
  {
    title: 'Product',
    links: [
      'Style Formula',
      'Color Analysis',
      'Figure & Fit',
      'Wardrobe',
      'Marketplace'
    ]
  },
  {
    title: 'Learn',
    links: ['Style guides', 'Body shapes', 'Color theory', 'Blog']
  },
  {
    title: 'Company',
    links: ['About us', 'Contact', 'Privacy Policy', 'Terms of use', 'Cookie Policy']
  }
];

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-about">
            <a href="#" className="logo">
              <span className="logo-mark">S</span>
              <span className="logo-text">
                Style<em>Me</em>
              </span>
            </a>
            <p>
              Your personal AI stylist. Built by image consultants, fashion experts
              and data scientists to make looking great effortless.
            </p>
            <div className="socials">
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="TikTok">🎵</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Facebook">f</a>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© 2026 StyleMe. All rights reserved.</span>
          <span>
            Made with <span style={{ color: 'var(--rose)' }}>♥</span> for a smarter
            wardrobe.
          </span>
        </div>
      </div>
    </footer>
  );
}
