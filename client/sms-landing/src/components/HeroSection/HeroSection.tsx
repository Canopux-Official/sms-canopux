import './HeroSection.css';

export default function HeroSection() {

  return (
    <section className="lp-hero" id="platform">
      <div className="lp-container">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">⚡ The Modern Operating System for Education</div>
            <h1 className="hero-headline">
              Run your entire institution from one <span className="gradient-text">intelligent platform.</span>
            </h1>
            <p className="hero-sub">
              From admissions and attendance to academics, fees, communication, and analytics — manage every student, faculty member, and process in one place.
            </p>
            <div className="hero-cta">
              <a href="#" className="btn-primary">Get Started →</a>
              <a href="#" className="btn-outline">▶ Book a Demo</a>
            </div>
            <p className="hero-micro">Built for schools, colleges, universities & coaching institutes</p>
            <div className="hero-trust">
              {['🔒 Secure', '⚡ Scalable', '👤 Role-Based Access', '📊 Real-Time Analytics'].map(t => (
                <span key={t} className="trust-pill"><span className="pulse-dot" />  {t}</span>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="float-card fc1"><span className="fc-dot g" /> 98.2% Avg Attendance</div>
            <div className="float-card fc2"><span className="fc-dot b" /> Fee Received ✓</div>
            <div className="float-card fc3"><span className="fc-dot o" /> New Admission 🎓</div>
            <div className="float-card fc4"><span className="fc-dot g" /> Performance +18% ↑</div>
            <div className="dashboard-mockup">
              <div className="dash-header">
                <span className="win-dot r" /><span className="win-dot y" /><span className="win-dot g" />
                <span className="dash-url-bar">app.canopux.com/admin/dashboard</span>
              </div>
              <div className="dash-body">
                <div className="dash-topbar">
                  {['Overview', 'Students', 'Finance', 'Reports'].map((t, i) => (
                    <span key={t} className={`dash-tab ${i === 0 ? 'active' : ''}`}>{t}</span>
                  ))}
                </div>
                <div className="dash-stats">
                  {[
                    { icon: '👥', cls: 'blue', val: '12,842', lbl: 'Total Students', chg: '+124' },
                    { icon: '✅', cls: 'green', val: '94.6%', lbl: 'Avg Attendance', chg: '+2.1%' },
                    { icon: '💰', cls: 'orange', val: '₹18.4L', lbl: 'Fees Collected', chg: '+₹2.1L' },
                    { icon: '📈', cls: 'purple', val: '+12.8%', lbl: 'Performance', chg: '↑ Improved' },
                  ].map(s => (
                    <div key={s.lbl} className="stat-card">
                      <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                      <div className="stat-val">{s.val}</div>
                      <div className="stat-lbl">{s.lbl}</div>
                      <span className="stat-chg">{s.chg}</span>
                    </div>
                  ))}
                </div>
                <div className="dash-chart">
                  <div className="dash-chart-head">
                    <span className="chart-title">Attendance Trend — This Month</span>
                    <span className="chart-badge">↑ 94.6%</span>
                  </div>
                  <div className="bar-chart">
                    {[55,70,60,80,75,85,70,90,82,95,88,93].map((h, i) => (
                      <div key={i} className={`bar ${i % 3 === 0 ? 'p' : i % 3 === 1 ? 'a' : 'l'}`} style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
                    ))}
                  </div>
                </div>
                <div className="dash-recent">
                  <div className="recent-title">Recent Activity</div>
                  {[
                    { col: '#2563EB', init: 'AK', text: 'Ananya K. marked present — Class 11A', time: '2m ago' },
                    { col: '#10B981', init: 'RS', text: 'Fee paid — Rohan S. — ₹12,500', time: '8m ago' },
                    { col: '#8B5CF6', init: 'PM', text: 'New admission — Priya M. enrolled', time: '15m ago' },
                  ].map(r => (
                    <div key={r.init} className="recent-item">
                      <div className="recent-av" style={{ background: r.col }}>{r.init}</div>
                      <span className="recent-txt">{r.text}</span>
                      <span className="recent-time">{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
