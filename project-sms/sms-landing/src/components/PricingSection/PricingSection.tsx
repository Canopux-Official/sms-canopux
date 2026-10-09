import { useState } from 'react';
import './PricingSection.css';
import { PRICING_PLANS } from '../../data/constants';

export default function PricingSection() {

  const [yearly, setYearly] = useState(false);
  return (
    <section className="lp-pricing" id="pricing">
      <div className="lp-container">
        <div className="pricing-header">
          <div className="section-tag">Pricing</div>
          <h2 className="section-headline" style={{ textAlign: 'center' }}>Simple pricing that scales with you.</h2>
          <p className="section-sub center">Transparent plans with no hidden costs. Cancel or upgrade anytime.</p>
        </div>
        <div className="pricing-toggle">
          <span className="toggle-lbl">Monthly</span>
          <div className={`toggle-track ${yearly ? 'on' : ''}`} onClick={() => setYearly(!yearly)} role="button" aria-label="Toggle billing" />
          <span className="toggle-lbl">Yearly</span>
          <span className="toggle-save">Save 25%</span>
        </div>
        <div className="pricing-grid">
          {PRICING_PLANS.map(plan => (
            <div key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-plan">{plan.name}</div>
              <div className="pricing-desc">{plan.desc}</div>
              {plan.monthly ? (
                <>
                  <div className="pricing-price">
                    <span className="price-currency">₹</span>
                    <span className="price-amount">{yearly ? plan.yearly : plan.monthly}</span>
                    <span className="price-period">/mo</span>
                  </div>
                  <div className="price-note">{yearly ? 'Billed annually' : 'Billed monthly'}</div>
                </>
              ) : (
                <>
                  <div className="price-custom">Custom Pricing</div>
                  <div className="price-note">Contact sales for enterprise quote</div>
                </>
              )}
              <div className="divider" />
              <ul className="pricing-feats">
                {plan.feats.map(f => <li key={f} className="pricing-feat"><span className="pf-check">✓</span>{f}</li>)}
              </ul>
              <a href="#" className={`btn-plan ${plan.btn.cls}`}>{plan.btn.label}</a>
            </div>
          ))}
        </div>
        <p className="pricing-note">Need a custom deployment? <a href="#">Let's talk →</a></p>
      </div>
    </section>
  );
}
