import { useState } from 'react'
import { Box, Container, Typography, Collapse, Chip } from '@mui/material'
import BookOpenIcon from '@mui/icons-material/AutoStories'
import PeopleIcon from '@mui/icons-material/PeopleAlt'
import AccessTimeIcon from '@mui/icons-material/Schedule'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

interface Course {
  id: string
  title: string
  description: string
  level: string
  students: number
  duration: string
  features: string[]
  gradient: string
}

function CourseCard({ course, isExpanded, onToggle }: {
  course: Course; isExpanded: boolean; onToggle: () => void
}) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        bgcolor: '#fff',
        border: '1.5px solid',
        borderColor: isExpanded ? 'rgba(196,122,58,0.35)' : 'rgba(10,37,64,0.07)',
        borderRadius: '20px',
        p: { xs: 2.5, md: 3 },
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(10,37,64,0.08)',
          borderColor: 'rgba(196,122,58,0.3)',
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute', top: 0, left: 0,
          width: '4px', height: '100%',
          bgcolor: isExpanded ? '#c47a3a' : 'transparent',
          transition: 'background-color 0.3s ease',
          borderRadius: '20px 0 0 20px',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: 1 }}>
          <Box sx={{
            p: 1.2, bgcolor: 'rgba(10,37,64,0.05)', borderRadius: '12px',
            color: '#0a2540', flexShrink: 0,
            border: '1px solid rgba(10,37,64,0.08)',
          }}>
            <BookOpenIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              color: '#0a2540', fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' },
              letterSpacing: '-0.02em', mb: 0.5, wordBreak: 'break-word',
            }}>
              {course.title}
            </Typography>
            <Chip
              label={course.level}
              size="small"
              sx={{
                background: course.gradient || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                color: '#1a1a2e',
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                fontSize: 11, height: 22, borderRadius: '6px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}
            />
          </Box>
        </Box>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: isExpanded ? '#c47a3a' : 'rgba(10,37,64,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isExpanded ? '#fff' : '#6b7280',
          flexShrink: 0, transition: 'all 0.3s ease',
        }}>
          {isExpanded ? <RemoveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
        </Box>
      </Box>

      <Typography sx={{
        color: '#6b7280', mb: 2.5, lineHeight: 1.65,
        fontSize: { xs: '0.88rem', md: '0.92rem' },
        fontFamily: '"DM Sans", sans-serif',
      }}>
        {course.description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#94a3b8' }}>
          <PeopleIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: '0.82rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>
            {course.students} students
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#94a3b8' }}>
          <AccessTimeIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: '0.82rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>
            {course.duration}
          </Typography>
        </Box>
      </Box>

      <Collapse in={isExpanded} timeout="auto">
        <Box sx={{ pt: 3, mt: 3, borderTop: '1px solid rgba(10,37,64,0.06)' }}>
          <Typography sx={{
            color: '#0a2540', fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700, mb: 2, fontSize: '0.9rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Features
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1,
          }}>
            {course.features.map((feature, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#c47a3a', mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{
                  fontSize: '0.85rem', color: '#374151',
                  fontFamily: '"DM Sans", sans-serif', lineHeight: 1.5,
                }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default function Courses({ data }: { data?: (Omit<Course, 'id'> & { courseId?: string, id?: string })[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const displayCourses: Course[] = data && data.length > 0 ? data.map(c => ({ ...c, id: c.courseId || c.id || '' } as Course)) : []

  const handleToggle = (courseId: string) => {
    setExpandedId(expandedId === courseId ? null : courseId)
  }

  return (
    <Box id="courses" sx={{
      py: { xs: 9, md: 14 },
      bgcolor: '#ffffff',
      position: 'relative',
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 10 }, px: { xs: 1, sm: 2 } }}>
          <Typography sx={{
            display: 'inline-block',
            bgcolor: 'rgba(196,122,58,0.1)', color: '#c47a3a',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            px: 2, py: 0.6, borderRadius: '20px', mb: 2,
            border: '1px solid rgba(196,122,58,0.2)',
          }}>
            Our Programs
          </Typography>
          <Typography variant="h2" sx={{
            color: '#04301a', mb: 2,
            fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' },
            lineHeight: 1.1, letterSpacing: '-0.03em',
          }}>
            Choose Your Path
          </Typography>
          <Typography sx={{
            color: '#6b7280', maxWidth: 520, mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7, fontFamily: '"DM Sans", sans-serif',
          }}>
            Comprehensive courses designed to help you conquer competitive exams and achieve academic excellence
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}>
          {displayCourses.map((course: Course) => (
            <CourseCard
              key={course.id} course={course}
              isExpanded={expandedId === course.id}
              onToggle={() => handleToggle(course.id)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}