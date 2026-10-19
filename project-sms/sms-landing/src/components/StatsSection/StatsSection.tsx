import './StatsSection.css';
import { STATS } from '../../data/constants';

export default function StatsSection() {

  return (
    <section className="lp-stats">
      <div className="lp-container">
        <div className="stats-headline">
          <h2>Built for institutions that want to move faster.</h2>
          <p>Placeholder metrics — to be updated with real production data.</p>
        </div>
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-block">
              <div className="stat-big-num">{s.num}</div>
              <div className="stat-big-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
