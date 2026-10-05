import { useState } from 'react';
import './FAQSection.css';
import { FAQS } from '../../data/constants';

export default function FAQSection() {

  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="lp-faq" id="resources">
      <div className="lp-container">
        <div className="faq-header">
          <div className="section-tag">FAQ</div>
          <h2 className="section-headline" style={{ textAlign: 'center' }}>Common questions, answered.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <span className="faq-arrow">▼</span>
              </div>
              <div className="faq-ans">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
