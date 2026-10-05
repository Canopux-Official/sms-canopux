import { useState } from 'react';
import './FeaturesSection.css';
import { FEATURES } from '../../data/constants';

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeFeature = FEATURES[activeIndex];

  return (
    <section className="lp-features" id="solutions">
      <div className="lp-container">
        <div className="features-header">
          <div className="section-tag glow-tag">Core Modules</div>
          <h2 className="section-headline">Everything your institution needs.</h2>
          <p className="section-sub center">A complete suite of tools designed specifically for how modern educational institutions operate.</p>
        </div>
        
        <div className="features-showcase">
          <div className="fs-sidebar">
            {FEATURES.map((f, i) => (
              <button 
                key={f.title} 
                className={`fs-tab ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
              >
                <span className={`fs-tab-icon ${f.iconCls}`}>{f.icon}</span>
                <span className="fs-tab-title">{f.title}</span>
              </button>
            ))}
          </div>

          <div className="fs-content-area">
            <div className="fs-content-header">
              <div className={`fs-huge-icon ${activeFeature.iconCls}`}>{activeFeature.icon}</div>
              <div>
                <h3 className="fs-title">{activeFeature.title}</h3>
                <p className="fs-desc">{activeFeature.desc}</p>
              </div>
            </div>

            <div className="fs-details">
              <ul className="fs-list">
                {activeFeature.preview.map((p, idx) => (
                  <li key={idx}>
                    <span className="fs-check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="fs-graphic-placeholder">
              {/* This is a stylized placeholder representing the module's dashboard view */}
              <div className="fs-mock-window">
                <div className="fs-mock-header">
                  <span className="fs-dot r"></span>
                  <span className="fs-dot y"></span>
                  <span className="fs-dot g"></span>
                </div>
                <div className="fs-mock-body">
                  <div className="fs-skeleton-title"></div>
                  <div className="fs-skeleton-grid">
                    <div className="fs-skeleton-card"></div>
                    <div className="fs-skeleton-card"></div>
                    <div className="fs-skeleton-card"></div>
                  </div>
                  <div className="fs-skeleton-list">
                    <div className="fs-skeleton-row"></div>
                    <div className="fs-skeleton-row"></div>
                    <div className="fs-skeleton-row"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
