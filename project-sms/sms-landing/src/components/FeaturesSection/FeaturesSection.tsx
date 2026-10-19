import { useState } from 'react';
import './FeaturesSection.css';
import { FEATURES } from '../../data/constants';
import { FeatureVideo } from '../common/FeatureVideo/FeatureVideo';
import { VIDEO_REGISTRY } from '../../data/videoManifest';

const FEATURE_VIDEO_MAP: Record<string, string> = {
  'Student Management': 'student_directory',
  'Attendance Tracking': 'student_attendance',
  'Analytics Dashboard': 'admin_dashboard',
  'Fee & Finance': 'billing_finance',
  'Academic Management': 'marks_exams',
  'Faculty': 'session_manager',
  'Communication': 'notices_broadcast',
  'Role-Based Access': 'admin_dashboard',
};

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeFeature = FEATURES[activeIndex];
  const videoKey = FEATURE_VIDEO_MAP[activeFeature.title] || 'admin_dashboard';
  const activeVideo = VIDEO_REGISTRY[videoKey];

  return (
    <section className="lp-features" id="solutions">
      <div className="lp-container">
        <div className="features-header">
          <div className="section-tag glow-tag">Core Modules</div>
          <h2 className="section-headline">Everything your institution needs.</h2>
          <p className="section-sub center">
            A complete suite of tools designed specifically for how modern educational institutions operate.
          </p>
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="fs-video-container">
              {activeVideo && (
                <FeatureVideo
                  key={activeVideo.key}
                  videoUrl={activeVideo.videoUrl}
                  posterUrl={activeVideo.posterUrl}
                  title={activeVideo.title}
                  badge={activeVideo.badge}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
