// LandingPage.tsx
import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material'
import Header from '../../components/landing_new/Header';
import Hero from '../../components/landing_new/Hero';
import Results from '../../components/landing_new/Results';
import Courses from '../../components/landing_new/Courses';
import Faculty from '../../components/landing_new/Faculty';
import FAQ from '../../components/landing_new/FAQ';
import Footer from '../../components/landing_new/Footer';
import theme from '../../components/landing_new/theme/theme';
import { getLandingPage } from '../../api/apiFunctions';
import SEO from '../../components/SEO';
import Gallery from '../../components/landing_new/Gallery';

interface FooterData {
  brandDescription?: string;
  ctaHeading?: string;
  ctaSubtext?: string;
  ctaButtonPrimary?: string;
  ctaButtonSecondary?: string;
  courseLinks?: { label: string; href: string }[];
  companyLinks?: { label: string; href: string }[];
  phones?: string[];
  email?: string;
  address?: string;
  copyrightText?: string;
  socialLinks?: { facebook?: string; instagram?: string; linkedin?: string; twitter?: string };
}

interface LandingData {
  hero?: { heading?: React.ReactNode; subheading?: string; stats?: { target: number; suffix: string; divisor: number; label: string }[]; image?: string };
  results?: { id: number; name: string; score: string; scoreLabel: string; exam: string; course: string; image: string; bio: string; youtubeLink?: string }[];
  courses?: { id: string; title: string; description: string; level: string; students: number; duration: string; features: string[]; gradient: string; courseId?: string }[];
  faculty?: { id: string; name: string; title: string; subject: string; experience: string; qualification: string; specialty: string; initials: string; image: string; bio: string }[];
  facultyStats?: { value: string; label: string }[];
  faqs?: { q: string; a: string; id?: string }[];
  footer?: FooterData;
  gallery?: { publicid: string; url: string }[];
}

const LandingPage = () => {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const response = await getLandingPage();
        if (response.success) {
          const payload = response.data as { data: LandingData };
          setData(payload.data);
        }
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#fafaf8' }}>
        <CircularProgress sx={{ color: '#0a2540' }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SEO
        title="JJ Institute Of Science: In The Pursuit Of Excellence"
        description="Join JJ Institute of Science for a premier educational experience. Explore our courses, faculty, and success stories to achieve academic excellence in JEE, NEET, and Boards."
        keywords="JJ Institute of Science, JIS, Education, Courses, Faculty, Academic Excellence, JEE, NEET, Boards, Science"
      />
      {/* Inject premium fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>
      <Header />
      <Hero data={data?.hero} />
      <Results data={data?.results} />
      <Courses data={data?.courses} />
      <Faculty data={data?.faculty} stats={data?.facultyStats} />
      <FAQ data={data?.faqs} />
      <Gallery data={data?.gallery} />
      <Footer data={data?.footer} />
    </ThemeProvider>
  );
};

export default LandingPage;