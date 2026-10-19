import './SecuritySection.css';
import { SEC_LAYERS } from '../../data/constants';

export default function SecuritySection() {

  return (
    <section className="lp-security">
      <div className="lp-container">
        <div className="security-grid">
          <div>
            <div className="section-tag">Security</div>
            <h2 className="section-headline">Built with security at the core.</h2>
            <p className="section-sub">Student data is sensitive. We treat it that way — with enterprise-grade security practices baked into every layer.</p>
          </div>
          <div className="security-visual">
            <div className="sec-badge">🔒 Security First Architecture</div>
            <div className="sec-layers">
              {SEC_LAYERS.map(l => (
                <div key={l.title} className="sec-layer">
                  <div className="sec-layer-icon">{l.icon}</div>
                  <div>
                    <div className="sec-layer-title">{l.title}</div>
                    <div className="sec-layer-desc">{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
