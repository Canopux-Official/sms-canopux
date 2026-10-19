import { useState, useEffect } from 'react';
import './TestimonialsSection.css';
import { TESTIMONIALS } from '../../data/constants';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((currentIndex + 1) % TESTIMONIALS.length);
  const prevSlide = () => setCurrentIndex((currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="lp-testimonials">
      <div className="lp-container">
        <div className="testimonials-header">
          <div className="section-tag glow-tag">Testimonials</div>
          <h2 className="section-headline" style={{ textAlign: 'center' }}>Loved by the people who run education.</h2>
        </div>
        
        <div className="testimonials-carousel">
          <button className="carousel-btn prev-btn" onClick={prevSlide}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div className="carousel-viewport">
            <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="carousel-slide">
                  <div className="testimonial-card">
                    <div className="t-stars">{'★'.repeat(t.stars)}</div>
                    <p className="t-text">"{t.text}"</p>
                    <div className="t-author">
                      <div className="t-avatar" style={{ background: t.color }}>{t.initials}</div>
                      <div>
                        <div className="t-name">{t.name}</div>
                        <div className="t-role">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="carousel-btn next-btn" onClick={nextSlide}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        
        <div className="carousel-dots">
          {TESTIMONIALS.map((_, idx) => (
            <button 
              key={idx} 
              className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}
