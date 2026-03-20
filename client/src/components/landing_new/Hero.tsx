import { Box, Container, Typography, Button, Chip } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import VerifiedIcon from '@mui/icons-material/Verified'
import { useEffect, useRef, useState } from 'react'
import img from '../../assets/results/image.png'

const stats = [
  { target: 10000, suffix: 'K+', divisor: 1000, label: 'Students Trained' },
  { target: 95, suffix: '%', divisor: 1, label: 'Success Rate' },
  { target: 50, suffix: '+', divisor: 1, label: 'Expert Teachers' },
]


function useCountUp(target: number, duration = 1800, delay = 0, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let startTime: number | null = null
    let raf: number
    const delayTimer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(delayTimer); cancelAnimationFrame(raf) }
  }, [active, target, duration, delay])
  return count
}

function StatCard({ stat, animDelay, active, countDelay }: {
  stat: typeof stats[0]; animDelay: number; active: boolean; countDelay: number
}) {
  const raw = useCountUp(stat.target, 1800, countDelay, active)
  const display = stat.divisor > 1 ? Math.floor(raw / stat.divisor) : raw
  return (
    <Box sx={{
      opacity: 0, animation: 'fadeUp 0.6s ease forwards',
      animationDelay: `${animDelay}ms`,
      textAlign: 'center',
    }}>
      <Typography sx={{
        fontFamily: '"Fraunces", serif', fontWeight: 800,
        fontSize: { xs: '1.75rem', md: '2.25rem' },
        color: '#0a2540', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {display}{stat.suffix}
      </Typography>
      <Typography sx={{
        color: '#94a3b8', mt: 0.5,
        fontSize: { xs: '0.72rem', md: '0.8rem' },
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 500, letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {stat.label}
      </Typography>
    </Box>
  )
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Hero({ data }: { data?: { heading?: React.ReactNode; subheading?: string; stats?: typeof stats; image?: string } | null }) {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const heroHeading = data?.heading || (
    <>
      Unlock Your Academic
      <Box component="em" sx={{ color: '#c47a3a', display: 'block' }}> Potential</Box>
    </>
  )
  const heroSubheading = data?.subheading || 'Join JJ Institute Of Science and unlock your full potential. Our proven methodology has helped thousands of students achieve their dreams in competitive exams.'
  const displayStats = data?.stats && data.stats.length > 0 ? data.stats : stats

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect() }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Box id="hero" sx={{
      pt: { xs: 13, md: 17 }, pb: { xs: 8, md: 12 },
      background: 'white',
      position: 'relative', overflow: 'hidden',
      '@keyframes fadeUp': {
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      '@keyframes fadeRight': {
        from: { opacity: 0, transform: 'translateX(28px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
    }}>
      {/* Background orbs */}
      <Box sx={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,122,58,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10,37,64,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg">
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 6, md: 8 },
          alignItems: 'center',
        }}>
          {/* Left */}
          <Box>
            <Box sx={{ opacity: 0, animation: 'fadeUp 0.6s ease forwards', animationDelay: '0ms', mb: 3 }}>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#0a2540 !important' }} />}
                label="Trusted by Students & Parents in Koraput"
                size="small"
                sx={{
                  bgcolor: 'rgba(10,37,64,0.06)', color: '#0a2540',
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
                  fontSize: 12, border: '1px solid rgba(10,37,64,0.1)',
                  borderRadius: '20px', px: 0.5,
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            </Box>

            <Box sx={{ opacity: 0, animation: 'fadeUp 0.6s ease forwards', animationDelay: '80ms', mb: 3 }}>
              <Typography variant="h1" sx={{
                fontSize: { xs: '2.4rem', sm: '3rem', md: '3.8rem' },
                color: '#04301a', lineHeight: 1.08, letterSpacing: '-0.03em',
                mb: 2.5,
              }}>
                {heroHeading}
              </Typography>
              <Typography sx={{
                color: '#6b7280', fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.75,
                maxWidth: 480,
              }}>
                {heroSubheading}
              </Typography>
            </Box>

            <Box sx={{ opacity: 0, animation: 'fadeUp 0.6s ease forwards', animationDelay: '180ms', display: 'flex', gap: 2, flexWrap: 'wrap', mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => scrollTo('courses')}
                endIcon={<ArrowForwardIcon sx={{ fontSize: '18px !important' }} />}
                sx={{
                  px: 3.5, py: 1.4,
                  bgcolor: '#0a4025', color: '#fff',
                  borderRadius: '12px', fontSize: '0.95rem',
                  boxShadow: '0 4px 20px rgba(10,37,64,0.25)',
                  '&:hover': { bgcolor: '#0d3057', boxShadow: '0 8px 28px rgba(10,37,64,0.35)', transform: 'translateY(-1px)' },
                  transition: 'all 0.25s',
                }}
              >
                Start Your Journey
              </Button>
            </Box>

            {/* Stats Row */}
            <Box ref={statsRef} sx={{ opacity: 0, animation: 'fadeUp 0.6s ease forwards', animationDelay: '280ms' }}>
              <Box sx={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: { xs: 2, md: 3 },
                pt: 3.5, borderTop: '1px solid rgba(10,37,64,0.08)',
              }}>
                {displayStats.map((stat: typeof stats[0], i: number) => (
                  <StatCard key={stat.label} stat={stat} animDelay={400 + i * 80} active={statsVisible} countDelay={i * 120} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right Visual */}
          <Box sx={{
            position: 'relative',
            opacity: 0, animation: 'fadeRight 0.7s ease forwards', animationDelay: '150ms',
          }}>
            <Box sx={{
              borderRadius: '28px', overflow: 'hidden',
              aspectRatio: '1', position: 'relative',
              boxShadow: '0 32px 80px rgba(10,37,64,0.12), 0 8px 20px rgba(0,0,0,0.06)',
            }}>
              <Box component="img" src={data?.image || img} alt="JJ Institute"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {/* Overlay gradient */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(10,37,64,0.08) 0%, transparent 60%)',
              }} />
            </Box>

            {/* Floating badge */}
            <Box sx={{
              position: 'absolute', bottom: 28, left: -20,
              bgcolor: '#fff', borderRadius: '16px',
              px: 2.5, py: 1.5,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 1.5,
              border: '1px solid rgba(10,37,64,0.06)',
            }}>
              <Box sx={{
                width: 38, height: 38, bgcolor: '#f0fdf4',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: 18 }}>🏆</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 13, color: '#0a2540', lineHeight: 1.2 }}>
                  #1 Rank
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#94a3b8', fontFamily: '"DM Sans", sans-serif' }}>
                  Institute in Region
                </Typography>
              </Box>
            </Box>

            {/* Decorative dot grid */}
            <Box sx={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80,
              backgroundImage: 'radial-gradient(rgba(196,122,58,0.4) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              borderRadius: '50%',
              zIndex: -1,
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}