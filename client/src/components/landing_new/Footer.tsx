import {
  Box, Container, Typography, Button, Divider, IconButton,
  Dialog, DialogContent, DialogTitle,
} from '@mui/material'
import { useState } from 'react'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
// import LogoImg from '../../assets/logo.jpeg';
import LogoCircular from '/logo/JIS Logo Circular.png'

interface FooterData {
  brandDescription?: string;
  ctaHeading?: string;
  ctaSubtext?: string;
  ctaButtonPrimary?: string;
  ctaButtonSecondary?: string;
  phones?: string[];
  email?: string;
  address?: string;
  copyrightText?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface FooterProps {
  data?: FooterData;
}

// Static company nav links (Courses link points to #courses section)
const COMPANY_LINKS = [
  { label: 'Courses', href: '#courses' },
  { label: 'Result', href: '#results' },
  { label: 'Our Faculty', href: '#faculty' },
  { label: 'Contact Us', href: '#footer' },
  { label: 'FAQ', href: '#faq' },
];


const handleNavClick = (e: React.MouseEvent, href: string) => {
  if (!href || href === '#') return
  e.preventDefault()
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function Footer({ data }: FooterProps) {
  const [contactOpen, setContactOpen] = useState(false);

  const d = {
    brandDescription: data?.brandDescription || 'Transforming academic aspirations into achievements through excellence and dedication.',
    ctaHeading: data?.ctaHeading || 'Ready to Transform Your Future?',
    ctaSubtext: data?.ctaSubtext || 'Join thousands of successful students who have achieved their dreams with JJ Institute Of Science.',
    ctaButtonPrimary: data?.ctaButtonPrimary || 'Enroll Now',
    ctaButtonSecondary: data?.ctaButtonSecondary || 'Schedule a Demo',
    phones: (data?.phones && data.phones.length > 0) ? data.phones : ['+91 9876 543 210', '+91 8765 432 109'],
    email: data?.email || 'contact@elite.com',
    address: data?.address || '123 Ave, City — 110001',
    copyrightText: data?.copyrightText || '© 2025 JJ Institute Of Science. All rights reserved.',
    socialLinks: {
      facebook: data?.socialLinks?.facebook || '#',
      instagram: data?.socialLinks?.instagram || '#',
      linkedin: data?.socialLinks?.linkedin || '#',
      twitter: data?.socialLinks?.twitter || '#',
    },
  };

  const socials = [
    { icon: <FacebookIcon fontSize="small" />, href: d.socialLinks.facebook || '#' },
    { icon: <InstagramIcon fontSize="small" />, href: d.socialLinks.instagram || '#' },
    { icon: <LinkedInIcon fontSize="small" />, href: d.socialLinks.linkedin || '#' },
    { icon: <TwitterIcon fontSize="small" />, href: d.socialLinks.twitter || '#' },
  ];

  return (
    <Box id="footer" component="footer">

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#e8f5e9', py: { xs: 7, md: 11 }, textAlign: 'center', px: 2 }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.6rem' },
              fontFamily: 'Montserrat',
              fontWeight: 800,
              color: '#001a4d',
            }}
          >
            {d.ctaHeading}
          </Typography>
          <Typography sx={{
            color: '#4a6741',
            mb: 4,
            fontSize: { xs: '0.88rem', md: '1rem' },
            lineHeight: 1.8,
            maxWidth: 520,
            mx: 'auto',
          }}>
            {d.ctaSubtext}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setContactOpen(true)}
              sx={{
                bgcolor: '#2e7d32',
                color: '#fff',
                px: { xs: 3, md: 5 },
                py: { xs: 1.2, md: 1.4 },
                fontFamily: 'Montserrat',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(46,125,50,0.35)',
                '&:hover': { bgcolor: '#256428' },
                fontSize: { xs: '0.85rem', md: '1rem' },
              }}
            >
              Contact Us to Enroll
            </Button>
          </Box>

          {/* Contact Dialog */}
          <Dialog
            open={contactOpen}
            onClose={() => setContactOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
          >
            <DialogTitle sx={{
              fontFamily: 'Montserrat', fontWeight: 800, fontSize: '1.1rem',
              bgcolor: '#051911', color: '#d8ede0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              px: 3, py: 2.5,
            }}>
              Contact Us to Enroll
              <IconButton size="small" onClick={() => setContactOpen(false)}
                sx={{ color: 'rgba(216,237,224,0.7)', '&:hover': { color: '#fff' } }}>
                ✕
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#fff', px: 3, py: 5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5,py: 2 }}>

                {/* Phones */}
                {d.phones.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '10px',
                      bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <PhoneIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5, fontWeight: 600 }}>
                        Phone
                      </Typography>
                      {d.phones.map((phone, i) => (
                        <Typography key={i} component="a" href={`tel:${phone.replace(/\s/g, '')}`}
                          sx={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#0a2540', textDecoration: 'none', lineHeight: 1.6, '&:hover': { color: '#2e7d32' } }}>
                          {phone}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Email */}
                {d.email && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start'}}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '10px',
                      bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <EmailIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5, fontWeight: 600 }}>
                        Email
                      </Typography>
                      <Typography component="a" href={`mailto:${d.email}`}
                        sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#0a2540', textDecoration: 'none', '&:hover': { color: '#2563eb' } }}>
                        {d.email}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Address */}
                {d.address && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start'}}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '10px',
                      bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: '#ea580c' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5, fontWeight: 600 }}>
                        Address
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151', lineHeight: 1.6 }}>
                        {d.address}
                      </Typography>
                    </Box>
                  </Box>
                )}

              </Box>
            </DialogContent>
          </Dialog>
        </Container>
      </Box>

      {/* Main Footer */}
      <Box sx={{ bgcolor: '#051911', color: '#d8ede0' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, px: { xs: 3, md: 4 } }}>

          {/* Top: Brand + Columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.6fr 1fr 1fr 1.4fr' },
              gap: { xs: 5, sm: 4, md: 5 },
              mb: { xs: 5, md: 7 },
            }}
          >
            {/* Brand */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={LogoCircular}
                    alt="JJ Institute Logo"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: { xs: 13, md: 15 }, color: '#fff', lineHeight: 1.5 }}>
                    JJ Institute Of Science
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'rgba(216,237,224,0.55)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    Coaching Centre
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{
                color: 'rgba(216,237,224,0.6)',
                fontSize: { xs: 13, md: 14 },
                lineHeight: 1.9,
                mb: 3,
                maxWidth: { xs: '100%', sm: 280 },
              }}>
                {d.brandDescription}
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.8 }}>
                {socials.map((s, i) => (
                  <IconButton
                    key={i}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'rgba(216,237,224,0.7)',
                      border: '1px solid rgba(216,237,224,0.18)',
                      borderRadius: 1.5,
                      width: 34,
                      height: 34,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>

            {/* Company Column (includes Courses link) */}
            <Box>
              <Typography sx={{
                fontFamily: 'Montserrat', fontWeight: 700, mb: 2.5,
                fontSize: { xs: 11, md: 12 }, color: '#fff',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                {COMPANY_LINKS.map((link, i) => (
                  <Typography
                    key={i}
                    component="a"
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    sx={{
                      color: 'rgba(216,237,224,0.6)',
                      textDecoration: 'none',
                      fontSize: { xs: 13, md: 14 },
                      cursor: 'pointer',
                      '&:hover': { color: '#fff' },
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Contact */}
            <Box>
              <Typography sx={{
                fontFamily: 'Montserrat', fontWeight: 700, mb: 2.5,
                fontSize: { xs: 11, md: 12 }, color: '#fff',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                {d.phones.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                    <PhoneIcon sx={{ fontSize: 15, mt: 0.3, flexShrink: 0, color: 'rgba(216,237,224,0.55)' }} />
                    <Box>
                      {d.phones.map((phone, i) => (
                        <Typography key={i} sx={{ fontSize: { xs: 13, md: 14 }, color: 'rgba(216,237,224,0.72)', lineHeight: 1.7 }}>
                          {phone}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                {d.email && (
                  <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                    <EmailIcon sx={{ fontSize: 15, flexShrink: 0, color: 'rgba(216,237,224,0.55)' }} />
                    <Typography sx={{ color: 'rgba(216,237,224,0.72)', fontSize: { xs: 13, md: 14 } }}>{d.email}</Typography>
                  </Box>
                )}
                {d.address && (
                  <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                    <LocationOnIcon sx={{ fontSize: 15, mt: 0.3, flexShrink: 0, color: 'rgba(216,237,224,0.55)' }} />
                    <Typography sx={{ color: 'rgba(216,237,224,0.72)', fontSize: { xs: 13, md: 14 }, lineHeight: 1.7 }}>
                      {d.address}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(216,237,224,0.1)', mb: { xs: 3.5, md: 4 } }} />

          {/* Bottom Bar */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Typography sx={{
              color: 'rgba(216,237,224,0.38)',
              fontSize: { xs: 11, md: 12 },
              textAlign: 'center',
            }}>
              {d.copyrightText}
            </Typography>
          </Box>

        </Container>
      </Box>

    </Box>
  )
}