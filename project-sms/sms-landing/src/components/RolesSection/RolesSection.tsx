import { useState } from 'react';
import './RolesSection.css';
import { ROLES } from '../../data/constants';

export default function RolesSection() {

  const [active, setActive] = useState<keyof typeof ROLES>('Admin');
  const role = ROLES[active];
  return (
    <section className="lp-roles">
      <div className="lp-container">
        <div className="roles-header">
          <div className="section-tag">For Everyone</div>
          <h2 className="section-headline">One platform, multiple roles.</h2>
          <p className="section-sub center">Tailored experiences for every stakeholder in your institution.</p>
        </div>
        <div className="role-tabs">
          {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map(r => (
            <button key={r} className={`role-tab ${active === r ? 'active' : ''}`} onClick={() => setActive(r)}>{r}</button>
          ))}
        </div>
        <div className="role-content">
          <div className="role-info">
            <h3>{role.headline}</h3>
            <p>{role.desc}</p>
            <ul className="role-feats">
              {role.feats.map(f => <li key={f} className="role-feat">{f}</li>)}
            </ul>
          </div>
          <div className="role-mockup">
            <div className="role-mock-head">
              <span className="role-mock-title">{active} Dashboard</span>
              <span className="role-mock-badge">● Live</span>
            </div>
            <div className="role-stats-row">
              {role.stats.map(s => (
                <div key={s.lbl} className="role-stat">
                  <div className="role-stat-val">{s.val}</div>
                  <div className="role-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
            <ul className="role-mini-list">
              {role.list.map(l => (
                <li key={l.text} className="role-mini-item">
                  <span className="role-mini-icon">{l.icon}</span> {l.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
