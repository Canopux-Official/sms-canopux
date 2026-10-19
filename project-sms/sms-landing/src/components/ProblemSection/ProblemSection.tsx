import './ProblemSection.css';

export default function ProblemSection() {

  return (
    <section className="lp-problem" id="features">
      <div className="lp-container">
        <div className="section-tag">The Problem</div>
        <h2 className="section-headline">Education shouldn't run on spreadsheets.</h2>
        <p className="section-sub">Most institutions still manage critical operations with disconnected tools, manual processes, and gut feeling.</p>
        
        <div className="before-after-wrapper">
          <div className="ba-card ba-before">
            <div className="ba-head">
              <span className="ba-label">Before</span>
              <h3>Chaotic & Disconnected</h3>
            </div>
            <ul className="ba-list">
              <li><span className="ba-icon cross">✕</span> <strong>Fragmented data:</strong> Records scattered across Excel files, physical registers, and isolated tools.</li>
              <li><span className="ba-icon cross">✕</span> <strong>Wasted time:</strong> Faculty spending hours manually marking attendance and compiling reports.</li>
              <li><span className="ba-icon cross">✕</span> <strong>Revenue leaks:</strong> Hard to track pending fees, leading to missed dues and awkward follow-ups.</li>
              <li><span className="ba-icon cross">✕</span> <strong>Communication gaps:</strong> Important notices buried in noisy WhatsApp groups.</li>
            </ul>
          </div>
          
          <div className="ba-divider">
            <div className="ba-arrow">→</div>
          </div>
          
          <div className="ba-card ba-after">
            <div className="ba-head">
              <span className="ba-label">With Canopux SMS</span>
              <h3>Unified & Automated</h3>
            </div>
            <ul className="ba-list">
              <li><span className="ba-icon check">✓</span> <strong>Single source of truth:</strong> Every student profile, academic record, and document in one place.</li>
              <li><span className="ba-icon check">✓</span> <strong>Instant workflows:</strong> Attendance marked in seconds; reports generated automatically.</li>
              <li><span className="ba-icon check">✓</span> <strong>Financial clarity:</strong> Automated fee schedules, reminders, and online payment gateways.</li>
              <li><span className="ba-icon check">✓</span> <strong>Seamless connection:</strong> A dedicated portal keeping parents and students instantly informed.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
