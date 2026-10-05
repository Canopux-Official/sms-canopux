import './BrandMarquee.css';

export default function BrandMarquee() {
  const brands = [
    { name: "Oxford Academy", logo: "🎓" },
    { name: "Stanford Prep", logo: "🏛️" },
    { name: "Global Edu", logo: "🌍" },
    { name: "Nexus Institute", logo: "🔬" },
    { name: "Apex Coaching", logo: "📈" },
    { name: "Pinnacle High", logo: "🏫" },
    { name: "Horizon College", logo: "🌅" },
  ];

  // We duplicate the array to create a seamless infinite loop
  const marqueeItems = [...brands, ...brands, ...brands];

  return (
    <section className="brand-marquee-section">
      <div className="marquee-label">TRUSTED BY 500+ INSTITUTIONS WORLDWIDE</div>
      <div className="marquee-container">
        <div className="marquee-track">
          {marqueeItems.map((brand, i) => (
            <div key={i} className="marquee-item">
              <span className="marquee-logo">{brand.logo}</span>
              <span className="marquee-name">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
