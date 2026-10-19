import './AutomationSection.css';
import { FLOW_STEPS, AUTO_FEATS } from '../../data/constants';

export default function AutomationSection() {

  return (
    <section className="lp-automation">
      <div className="lp-container">
        <div className="automation-grid">
          <div>
            <div className="section-tag">Automation</div>
            <h2 className="section-headline">Less administration. More education.</h2>
            <p className="section-sub" style={{ marginBottom: '2.5rem' }}>Repetitive tasks run on autopilot. Your team focuses on what matters — students.</p>
            <div className="flow-steps">
              {FLOW_STEPS.map(s => (
                <div key={s.title} className="flow-step">
                  <div className="flow-icon">{s.icon}</div>
                  <div className="flow-content">
                    <div className="flow-title">{s.title}</div>
                    <div className="flow-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="auto-features">
            {AUTO_FEATS.map(f => (
              <div key={f.title} className="auto-feat">
                <div className="auto-feat-icon">{f.icon}</div>
                <div className="auto-feat-title">{f.title}</div>
                <div className="auto-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
