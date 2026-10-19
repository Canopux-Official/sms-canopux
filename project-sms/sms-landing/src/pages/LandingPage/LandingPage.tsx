import { Helmet } from 'react-helmet-async';
import '../../styles/global.css';
import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import BrandMarquee from '../../components/BrandMarquee/BrandMarquee';
import StatsSection from '../../components/StatsSection/StatsSection';
import ProblemSection from '../../components/ProblemSection/ProblemSection';
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection';
import RolesSection from '../../components/RolesSection/RolesSection';
import ShowcaseSection from '../../components/ShowcaseSection/ShowcaseSection';
import AnalyticsSection from '../../components/AnalyticsSection/AnalyticsSection';
import AutomationSection from '../../components/AutomationSection/AutomationSection';
import SecuritySection from '../../components/SecuritySection/SecuritySection';
import IntegrationsSection from '../../components/IntegrationsSection/IntegrationsSection';
import MobileAppSection from '../../components/MobileAppSection/MobileAppSection';
import PricingSection from '../../components/PricingSection/PricingSection';
import TestimonialsSection from '../../components/TestimonialsSection/TestimonialsSection';
import FAQSection from '../../components/FAQSection/FAQSection';
import FinalCTA from '../../components/FinalCTA/FinalCTA';
import Footer from '../../components/Footer/Footer';

export default function LandingPage() {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Canopux SMS",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "4999",
      "priceCurrency": "INR"
    },
    "provider": {
      "@type": "Organization",
      "name": "Canopux",
      "url": "https://canopux.org"
    },
    "description": "The modern operating system for education. Manage students, attendance, academics, fees, and more on a single platform."
  };

  return (
    <>
      <Helmet>
        <title>Canopux SMS | The Modern Operating System for Education</title>
        <meta name="description" content="Manage your entire educational institution with Canopux SMS. From admissions and attendance to fees and analytics, run your school or college from a single platform." />
        <meta name="keywords" content="Student Management System, School ERP, College ERP, Education Technology, Canopux SMS, Attendance Tracking, Fee Management" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sms.canopux.org/" />
        <meta property="og:title" content="Canopux SMS | Modern Education OS" />
        <meta property="og:description" content="Manage your entire educational institution with Canopux SMS. A complete suite for schools, colleges, and coaching institutes." />
        <meta property="og:image" content="https://sms.canopux.org/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://sms.canopux.org/" />
        <meta property="twitter:title" content="Canopux SMS | Modern Education OS" />
        <meta property="twitter:description" content="Manage your entire educational institution with Canopux SMS. A complete suite for schools, colleges, and coaching institutes." />
        <meta property="twitter:image" content="https://sms.canopux.org/og-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://sms.canopux.org/" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgJSONLD)}
        </script>
      </Helmet>
      
      <Navbar />
      <main>
        <HeroSection />
        <BrandMarquee />
        <StatsSection />
        <ProblemSection />
        <FeaturesSection />
        <RolesSection />
        <ShowcaseSection />
        <AnalyticsSection />
        <AutomationSection />
        <SecuritySection />
        <IntegrationsSection />
        <MobileAppSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
