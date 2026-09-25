import { useState } from 'react'
import { Box, Container, Typography, Dialog, IconButton, Divider } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SchoolIcon from '@mui/icons-material/School'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'

interface FacultyMember {
  id: string; name: string; title: string; subject: string
  experience: string; qualification: string; specialty: string
  initials: string; image: string; bio: string
}

const subjectColors: Record<string, { bg: string; text: string; border: string }> = {
  Physics: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  Chemistry: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Mathematics: { bg: '#fdf4ff', text: '#9333ea', border: '#e9d5ff' },
  Biology: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
}

function getSubjectStyle(subject: string) {
  for (const key of Object.keys(subjectColors)) {
    if (subject?.toLowerCase().includes(key.toLowerCase())) return subjectColors[key]
  }
  return { bg: '#f0f4ff', text: '#0a2540', border: '#dbeafe' }
}

function FacultyCard({ member, onClick }: { member: FacultyMember; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const sStyle = getSubjectStyle(member.subject)

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        cursor: 'pointer',
        bgcolor: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1.5px solid',
        borderColor: hovered ? 'rgba(10,37,64,0.15)' : 'rgba(10,37,64,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: { xs: 'row', sm: 'column' },
        '&:hover': {
          boxShadow: '0 16px 48px rgba(10,37,64,0.1)',
          transform: 'translateY(-4px)',
          '& .faculty-img': { transform: 'scale(1.06)' },
          '& .expand-icon': { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      {/* Image Section */}
      <Box sx={{
        overflow: 'hidden', position: 'relative',
        width: { xs: 110, sm: '100%' }, height: { xs: 110, sm: 210 },
        bgcolor: '#f1f5f9', flexShrink: 0,
      }}>
        <Box
          className="faculty-img"
          component="img" src={member.image} alt={member.name}
          sx={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'top', display: 'block',
            transition: 'transform 0.5s ease',
          }}
        />
        <Box className="expand-icon" sx={{
          position: 'absolute', top: 10, right: 10,
          width: 30, height: 30, bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transform: 'scale(0.8)',
          transition: 'all 0.25s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <OpenInFullIcon sx={{ fontSize: 13, color: '#0a2540' }} />
        </Box>
      </Box>

      {/* Content Section */}
      <Box sx={{ p: { xs: 1.8, sm: 2.2 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Box sx={{
            display: 'inline-block',
            bgcolor: sStyle.bg, color: sStyle.text,
            border: `1px solid ${sStyle.border}`,
            borderRadius: '8px', px: 1.2, py: 0.3,
            fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif', mb: 0.8,
          }}>
            {member.subject}
          </Box>
          <Typography sx={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
            fontSize: { xs: '0.88rem', sm: '0.95rem' },
            color: '#0a2540', mb: 0.3, letterSpacing: '-0.01em',
          }}>
            {member.name}
          </Typography>
          <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#94a3b8', fontFamily: '"DM Sans", sans-serif' }}>
            {member.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, pt: 0.5, borderTop: '1px solid rgba(10,37,64,0.06)' }}>
          <WorkHistoryOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: '#6b7280', fontFamily: '"DM Sans", sans-serif' }}>
            {member.experience} experience
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default function Faculty({ data, stats }: { data?: (Omit<FacultyMember, 'id'> & { id?: string })[]; stats?: { value: string; label: string }[] }) {
  const [selected, setSelected] = useState<FacultyMember | null>(null)

  const displayFaculty: FacultyMember[] = data && data.length > 0
    ? data.map((f, index) => ({ ...f, id: f.id || `f-${index}` })) : []

  const defaultStats = [
    { value: '6+', label: 'Expert Educators' },
    { value: '88 yrs', label: 'Combined Experience' },
    { value: '95%', label: 'Success Rate' },
    { value: '4', label: 'Subjects Covered' },
  ]

  // console.log(stats)
  // console.log(data)

  return (
    <Box id="faculty" sx={{ py: { xs: 9, md: 14 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 7, md: 10 }, px: { xs: 1, sm: 2 } }}>
          <Typography sx={{
            display: 'inline-block',
            bgcolor: 'rgba(10,37,64,0.05)', color: '#0a2540',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            px: 2, py: 0.6, borderRadius: '20px', mb: 2,
            border: '1px solid rgba(10,37,64,0.1)',
          }}>
            Our Team
          </Typography>
          <Typography variant="h2" sx={{
            color: '#04301a', mb: 2,
            fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' },
            lineHeight: 1.1, letterSpacing: '-0.03em',
          }}>
            Meet Our Faculty
          </Typography>
          <Typography sx={{
            color: '#6b7280', maxWidth: 520, mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7, fontFamily: '"DM Sans", sans-serif',
          }}>
            IIT alumni, published researchers, and medical professionals with a proven track record of student success.
          </Typography>

          {/* Stats Row */}
          <Box sx={{
            display: 'flex', justifyContent: 'center',
            gap: { xs: 0, sm: 0 }, mt: 6, pt: 5,
            borderTop: '1px solid rgba(10,37,64,0.07)',
            flexWrap: 'wrap',
          }}>
            {(stats && stats.length > 0 ? stats : defaultStats).map((s: { value: string; label: string }, i: number, arr: { value: string; label: string }[]) => (
              <Box key={s.label} sx={{
                textAlign: 'center', px: { xs: 3, sm: 5, md: 7 },
                borderRight: i < arr.length - 1 ? '1px solid rgba(10,37,64,0.08)' : 'none',
                py: 1,
              }}>
                <Typography sx={{
                  fontFamily: '"Fraunces", serif', fontWeight: 800,
                  fontSize: { xs: '1.4rem', md: '1.8rem' },
                  color: '#0a2540', lineHeight: 1,
                }}>
                  {s.value}
                </Typography>
                <Typography sx={{
                  fontSize: { xs: 11, md: 12 }, color: '#94a3b8', mt: 0.5,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 500,
                }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}>
          {displayFaculty.map((member: FacultyMember) => (
            <FacultyCard key={member.id} member={member} onClick={() => setSelected(member)} />
          ))}
        </Box>
      </Container>

      {/* Modal */}
      {/* <Dialog
        open={!!selected} onClose={() => setSelected(null)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' } }}
      >
        {selected && (
          <>
            <Box sx={{ position: 'relative' }}>
              <Box component="img" src={selected.image} alt={selected.name}
                sx={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
              <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(10,37,64,0.8) 0%, transparent 100%)',
                px: 3, py: 2.5,
              }}>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#fff', letterSpacing: '-0.01em' }}>
                  {selected.name}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', fontFamily: '"DM Sans", sans-serif' }}>
                  {selected.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelected(null)} size="small" sx={{
                position: 'absolute', top: 12, right: 12,
                bgcolor: 'rgba(255,255,255,0.92)', color: '#374151',
                '&:hover': { bgcolor: '#fff' },
                borderRadius: '10px', p: 0.7,
              }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <DialogContent sx={{ px: 3, py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 1, flexWrap: 'wrap' }}>
                {(() => {
                  const sStyle = getSubjectStyle(selected.subject)
                  return (
                    <Box sx={{
                      bgcolor: sStyle.bg, color: sStyle.text,
                      border: `1px solid ${sStyle.border}`,
                      borderRadius: '8px', px: 1.8, py: 0.4,
                      fontSize: 12, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                    }}>
                      {selected.subject}
                    </Box>
                  )
                })()}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <WorkHistoryOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                  <Typography sx={{ fontSize: 13, color: '#374151', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                    {selected.experience} yrs experience
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: 'rgba(10,37,64,0.07)' }} />

              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#94a3b8', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                About
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, mb: 3, fontFamily: '"DM Sans", sans-serif' }}>
                {selected.bio}
              </Typography>

              <Divider sx={{ mb: 2.5, borderColor: 'rgba(10,37,64,0.07)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, bgcolor: '#f0f4ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SchoolIcon sx={{ fontSize: 15, color: '#0a2540' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2, fontFamily: '"DM Sans", sans-serif' }}>
                      Qualification
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: '#0d1b2a', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                      {selected.qualification}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, bgcolor: '#f0f4ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AutoStoriesIcon sx={{ fontSize: 15, color: '#0a2540' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2, fontFamily: '"DM Sans", sans-serif' }}>
                      Specialty
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: '#0d1b2a', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                      {selected.specialty}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog> */}

      <Dialog
        open={!!selected} onClose={() => setSelected(null)}
        maxWidth="md" fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '16px', sm: '24px' },
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
            margin: { xs: '16px', sm: '32px' },  // ✅ breathing room on mobile
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' }, // ✅ limit height
          }
        }}
      >
        {selected && (
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            height: { sm: '100%' },
            overflow: { xs: 'auto', sm: 'hidden' }, // ✅ mobile scrollable
          }}>

            {/* TOP on mobile / LEFT on desktop — Image */}
            <Box sx={{
              width: { xs: '100%', sm: 280 },
              height: { xs: 260, sm: 'auto' },   // ✅ fixed height on mobile
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <Box
                component="img"
                src={selected.image}
                alt={selected.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                }}
              />
              {/* Close button over image — visible on both */}
              <IconButton
                onClick={() => setSelected(null)}
                size="small"
                sx={{
                  position: 'absolute', top: 12, right: 12,
                  bgcolor: 'rgba(255,255,255,0.92)', color: '#374151',
                  '&:hover': { bgcolor: '#fff' },
                  borderRadius: '10px', p: 0.7,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* BOTTOM on mobile / RIGHT on desktop — Details */}
            <Box sx={{
              flex: 1,
              px: { xs: 2.5, sm: 3 },
              py: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              overflowY: { xs: 'visible', sm: 'auto' }, // ✅ desktop scrollable if content tall
            }}>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.15rem' },
                color: '#0a2540', letterSpacing: '-0.01em'
              }}>
                {selected.name}
              </Typography>
              <Typography sx={{
                fontSize: 12.5, color: '#94a3b8',
                fontFamily: '"DM Sans", sans-serif', mb: 2
              }}>
                {selected.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 1, flexWrap: 'wrap' }}>
                {(() => {
                  const sStyle = getSubjectStyle(selected.subject)
                  return (
                    <Box sx={{
                      bgcolor: sStyle.bg, color: sStyle.text,
                      border: `1px solid ${sStyle.border}`,
                      borderRadius: '8px', px: 1.8, py: 0.4,
                      fontSize: 12, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                    }}>
                      {selected.subject}
                    </Box>
                  )
                })()}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <WorkHistoryOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                  <Typography sx={{ fontSize: 13, color: '#374151', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                    {selected.experience} yrs experience
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: 'rgba(10,37,64,0.07)' }} />

              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                fontSize: '0.75rem', color: '#94a3b8', mb: 1,
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                About
              </Typography>
              <Typography sx={{
                fontSize: 13.5, color: '#374151', lineHeight: 1.75, mb: 3,
                fontFamily: '"DM Sans", sans-serif'
              }}>
                {selected.bio}
              </Typography>

              <Divider sx={{ mb: 2.5, borderColor: 'rgba(10,37,64,0.07)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: { xs: 1, sm: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, bgcolor: '#f0f4ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SchoolIcon sx={{ fontSize: 15, color: '#0a2540' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2, fontFamily: '"DM Sans", sans-serif' }}>
                      Qualification
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: '#0d1b2a', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                      {selected.qualification}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, bgcolor: '#f0f4ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AutoStoriesIcon sx={{ fontSize: 15, color: '#0a2540' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2, fontFamily: '"DM Sans", sans-serif' }}>
                      Specialty
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: '#0d1b2a', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                      {selected.specialty}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

          </Box>
        )}
      </Dialog>

    </Box>
  )
}