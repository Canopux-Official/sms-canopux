import './IntegrationsSection.css';
import { INTEGRATIONS } from '../../data/constants';

export default function IntegrationsSection() {

  return (
    <section className="lp-integrations">
      <div className="lp-container">
        <div className="integrations-header">
          <div className="section-tag">Integrations</div>
          <h2 className="section-headline" style={{ textAlign: 'center' }}>Fits into your existing ecosystem.</h2>
          <p className="section-sub center">Connect with the tools and services your institution already uses.</p>
        </div>
        <div className="int-cards">
          {INTEGRATIONS.map(i => (
            <div key={i.name} className="int-card">
              <span className="int-icon">{i.icon}</span>
              <span>{i.name}</span>
              <span className={`int-status ${i.status}`}>{i.status === 'ok' ? 'Available' : 'Coming Soon'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
