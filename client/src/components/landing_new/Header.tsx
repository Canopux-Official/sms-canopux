import { useState, useEffect } from 'react'
import {
  AppBar, Toolbar, Box, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useTheme, useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LogoImg from '../../assets/logo.jpeg'
import { useNavigate } from 'react-router-dom'


const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'Courses', href: '#courses' },
  { label: 'Result', href: '#results' },
  { label: 'Faculty', href: '#faculty' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#footer' },
]

function smoothScrollTo(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(10,37,64,0.08)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2.5, md: 5 }, py: 1 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              border: '1.5px solid rgba(10,37,64,0.1)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}>
              <Box component="img" src={LogoImg} alt="JJ Institute Logo"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                fontSize: 15, color: '#0a2540', lineHeight: 1.2, letterSpacing: '-0.02em',
              }}>
                JJ Institute Of Science
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif' }}>
                Coaching Centre
              </Typography>
            </Box>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Typography
                  key={item.href}
                  onClick={() => smoothScrollTo(item.href)}
                  sx={{
                    color: '#374151', textDecoration: 'none', fontSize: 14,
                    fontWeight: 500, cursor: 'pointer', userSelect: 'none',
                    px: 1.5, py: 0.8, borderRadius: '8px',
                    fontFamily: '"DM Sans", sans-serif',
                    '&:hover': { color: '#0a2540', bgcolor: 'rgba(10,37,64,0.05)' },
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </Typography>
              ))}
              <Button
                variant="contained"
                size="medium"
                onClick={() => navigate('/login')}
                sx={{
                  ml: 1.5, px: 3, py: 1,
                  bgcolor: '#0a4025', color: '#fff',
                  borderRadius: '10px',
                  fontSize: 14,
                  boxShadow: '0 2px 12px rgba(10,37,64,0.25)',
                  '&:hover': { bgcolor: '#0d3057', boxShadow: '0 4px 20px rgba(10,37,64,0.35)' },
                  transition: 'all 0.25s',
                }}
              >
                Login
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} sx={{
              color: '#0a2540', border: '1px solid rgba(10,37,64,0.12)',
              borderRadius: '10px', p: 0.8,
            }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { borderRadius: '0 0 0 24px', boxShadow: '-4px 0 40px rgba(0,0,0,0.1)' } }}
      >
        <Box sx={{ width: 280, pt: 2.5, px: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(10,37,64,0.1)' }}>
                <Box component="img" src={LogoImg} alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 13, color: '#0a2540' }}>
                JJ Institute
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#374151' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <List sx={{ px: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  onClick={() => { smoothScrollTo(item.href); setMobileOpen(false) }}
                  sx={{ borderRadius: '10px', mb: 0.5 }}
                >
                  <ListItemText primary={item.label}
                    primaryTypographyProps={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem sx={{ mt: 2, px: 1 }}>
              <Button onClick={() => navigate('/login')} variant="contained" fullWidth
                sx={{ bgcolor: '#0a4025', borderRadius: '10px', py: 1.2 }}>
                Login
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}