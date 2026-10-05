import './MobileAppSection.css';

export default function MobileAppSection() {
  return (
    <section className="lp-mobile-app">
      <div className="lp-container">
        <div className="mobile-app-grid">
          
          <div className="mobile-app-content">
            <div className="section-tag glow-tag">Native Mobile Apps</div>
            <h2 className="section-headline">Keep parents and students connected, everywhere.</h2>
            <p className="mobile-desc">
              Your institution in their pocket. Our native iOS and Android applications ensure parents never miss an update, and students always have access to their schedules and resources.
            </p>
            
            <ul className="mobile-feature-list">
              <li>
                <div className="m-icon">🔔</div>
                <div>
                  <h4>Real-time Push Notifications</h4>
                  <p>Instant alerts for attendance, fee dues, and urgent notices.</p>
                </div>
              </li>
              <li>
                <div className="m-icon">🚌</div>
                <div>
                  <h4>Live Transport Tracking</h4>
                  <p>Parents can track the school bus location in real-time.</p>
                </div>
              </li>
              <li>
                <div className="m-icon">💳</div>
                <div>
                  <h4>One-Tap Fee Payments</h4>
                  <p>Integrated secure payment gateways for instant fee clearance.</p>
                </div>
              </li>
            </ul>

            <div className="app-store-badges">
              <button className="store-btn apple">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.93.15 3.32.99 4.2 2.32-3.32 1.99-2.73 6.38.5 7.73-.66 1.34-1.72 3.01-3.28 2.92zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <div className="btn-text">
                  <span>Download on the</span>
                  <strong>App Store</strong>
                </div>
              </button>
              <button className="store-btn google">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.67 3.67 2 4.5 2h15c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-15C3.67 22 3 21.33 3 20.5zM7 11l5-5 5 5H7zm10 2l-5 5-5-5h10z"/></svg>
                <div className="btn-text">
                  <span>GET IT ON</span>
                  <strong>Google Play</strong>
                </div>
              </button>
            </div>
          </div>

          <div className="mobile-app-visual">
            {/* Abstract Phone Frame */}
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="app-mock-header">
                  <h3>Canopux Parent</h3>
                  <div className="app-mock-avatar">P</div>
                </div>
                <div className="app-mock-body">
                  <div className="app-card alert">
                    <strong>Fee Reminder</strong>
                    <span>Term 2 fees due in 3 days.</span>
                  </div>
                  <div className="app-card">
                    <strong>Attendance</strong>
                    <span className="text-green">Present today</span>
                  </div>
                  <div className="app-card tall">
                    <strong>Notice Board</strong>
                    <div className="mock-lines">
                      <div className="ml"></div>
                      <div className="ml"></div>
                      <div className="ml short"></div>
                    </div>
                  </div>
                </div>
                <div className="app-mock-nav">
                  <span className="n-dot active"></span>
                  <span className="n-dot"></span>
                  <span className="n-dot"></span>
                  <span className="n-dot"></span>
                </div>
              </div>
            </div>
            
            <div className="floating-bubble fb-1">
              "Bus has reached stop."
            </div>
            <div className="floating-bubble fb-2">
              A+ in Math! 🎉
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
