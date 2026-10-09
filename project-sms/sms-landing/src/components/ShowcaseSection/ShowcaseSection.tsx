import './ShowcaseSection.css';

export default function ShowcaseSection() {

  return (
    <section className="lp-showcase">
      <div className="lp-container">
        <div className="showcase-header">
          <div className="section-tag">Product Showcase</div>
          <h2 className="section-headline">Everything connected. Nothing scattered.</h2>
          <p className="section-sub center">See how Canopux SMS looks and feels across every critical workflow.</p>
        </div>
        <div className="showcase-items">
          {[
            { rev: false, title: 'Know what\'s happening across your institution', desc: 'Turn thousands of student records into clear, actionable insights. The admin dashboard gives you a live overview of attendance, finance, and academic performance.', tags: ['Real-time Data', 'Live Analytics', 'Drill-down Reports'], videolabel: 'Admin Dashboard — Product Demo' },
            { rev: true, title: 'Attendance in seconds, not hours', desc: 'Mark attendance for an entire class in one click. Track trends over time, get low-attendance alerts, and notify parents automatically.', tags: ['Bulk Marking', 'Parent Alerts', 'Monthly Reports'], videolabel: 'Attendance Management — Product Demo' },
            { rev: false, title: 'Academics & results, end-to-end', desc: 'From creating tests to entering marks and publishing results — the entire academic cycle is handled within one clean interface.', tags: ['Test Management', 'Marks Entry', 'Result Publishing'], videolabel: 'Academic Module — Product Demo' },
          ].map((item, i) => (
            <div key={i} className={`showcase-item ${item.rev ? 'rev' : ''}`}>
              <div className="showcase-info">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="showcase-tags">
                  {item.tags.map(t => <span key={t} className="sc-tag">{t}</span>)}
                </div>
              </div>
              <div className="video-placeholder">
                <div className="video-glow"></div>
                <div className="play-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span className="video-label">{item.videolabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
