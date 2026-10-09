import './AnalyticsSection.css';
import { ANALYTICS_CARDS } from '../../data/constants';

export default function AnalyticsSection() {

  return (
    <section className="lp-analytics">
      <div className="lp-container">
        <div className="analytics-header">
          <div className="section-tag" style={{ color: 'var(--accent)', background: 'rgba(56,189,248,0.1)' }}>Analytics</div>
          <h2 className="section-headline white">Turn institutional data into better decisions.</h2>
          <p className="section-sub white center">Give administrators a real-time view of what is happening across classrooms, departments, and campuses.</p>
        </div>
        <div className="analytics-grid">
          {ANALYTICS_CARDS.map(c => (
            <div key={c.title} className="analytics-card">
              <h4>{c.title}</h4>
              <div className="mini-chart">
                {c.bars.map((h, i) => <div key={i} className={`mini-bar ${c.cls}`} style={{ height: `${h}%` }} />)}
              </div>
              <div className="analytics-metric">{c.metric}</div>
              <div className="analytics-label">{c.label}</div>
              <div className="analytics-trend">{c.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
