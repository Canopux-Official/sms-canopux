import './Footer.css';

export default function Footer() {

  const COLS = [
    { title: 'Platform', links: [{ label: 'Student Management', href: '#' }, { label: 'Attendance', href: '#' }, { label: 'Academics', href: '#' }, { label: 'Fee & Finance', href: '#' }, { label: 'Faculty', href: '#' }, { label: 'Analytics', href: '#' }] },
    { title: 'Solutions', links: [{ label: 'Schools', href: '#' }, { label: 'Colleges', href: '#' }, { label: 'Universities', href: '#' }, { label: 'Coaching Institutes', href: '#' }, { label: 'Multi-Campus', href: '#' }] },
    { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'API Reference', href: '#' }, { label: 'Changelog', href: '#' }, { label: 'Status Page', href: '#' }, { label: 'Blog', href: '#' }] },
    { title: 'Company', links: [{ label: 'About Canopux', href: 'https://canopux.org', external: true }, { label: 'Careers', href: 'https://canopux.org/careers', external: true }, { label: 'Contact', href: 'https://canopux.org/contact', external: true }, { label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] },
  ];
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">C</div>
              <span className="footer-logo-text">Canopux <span>SMS</span></span>
            </div>
            <p>The modern operating system for education. Built for institutions that demand more than a basic school ERP.</p>
          </div>
          {COLS.map(col => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul className="footer-links">
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} target={l.external ? "_blank" : "_self"} rel={l.external ? "noopener noreferrer" : undefined}>
                      {l.label} {l.external && <span style={{ fontSize: '0.7em', opacity: 0.5, marginLeft: '4px' }}>↗</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 <a href="https://canopux.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Canopux</a>. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
