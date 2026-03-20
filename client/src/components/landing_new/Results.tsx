// import { useState } from 'react'
// import { Box, Container, Typography, Dialog, IconButton, Chip } from '@mui/material'
// import CloseIcon from '@mui/icons-material/Close'
// import PlayArrowIcon from '@mui/icons-material/PlayArrow'
// import StarIcon from '@mui/icons-material/Star'
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

// interface Student {
//   id: number; name: string; score: string; scoreLabel: string
//   exam: string; course: string; image: string; bio: string
//   achievement: string; youtubeLink?: string
// }

// const formatYoutubeLink = (url?: string) => {
//   if (!url) return ''
//   try {
//     const urlObj = new URL(url)
//     if (url.includes('youtube.com/shorts/')) {
//       const videoId = url.split('youtube.com/shorts/')[1].split('?')[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     } else if (urlObj.hostname === 'youtu.be') {
//       const videoId = urlObj.pathname.substring(1)
//       return `https://www.youtube.com/embed/${videoId}`
//     } else if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
//       const videoId = urlObj.searchParams.get('v')
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//   } catch {
//     // If not a valid URL or other error, return the original string
//   }
//   return url
// }

// function StudentCard({ student, onSelect }: { student: Student; onSelect: (s: Student) => void }) {
//   const [hovered, setHovered] = useState(false)
//   return (
//     <Box
//       onClick={() => onSelect(student)}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       sx={{ cursor: 'pointer', width: 210, flexShrink: 0 }}
//     >
//       <Box sx={{
//         position: 'relative', height: 270, mb: 1.8,
//         borderRadius: '20px', overflow: 'hidden',
//         boxShadow: hovered ? '0 16px 40px rgba(10,37,64,0.14)' : '0 4px 16px rgba(10,37,64,0.06)',
//         transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
//         transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
//       }}>
//         <Box component="img" src={student.image} alt={student.name}
//           onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://via.placeholder.com/220x270?text=No+Image' }}
//           sx={{
//             width: '100%', height: '100%',
//             objectFit: 'cover', objectPosition: 'top', display: 'block',
//             transition: 'transform 0.4s ease',
//             transform: hovered ? 'scale(1.04)' : 'scale(1)',
//           }}
//         />
//         {/* Bottom gradient overlay */}
//         <Box sx={{
//           position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
//           background: 'linear-gradient(to top, rgba(10,37,64,0.75) 0%, transparent 100%)',
//         }} />
//         {/* Score badge bottom */}
//         <Box sx={{
//           position: 'absolute', bottom: 12, left: 12, right: 12,
//           display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
//         }}>
//           <Box>
//             <Typography sx={{
//               color: '#fff', fontFamily: '"DM Sans", sans-serif',
//               fontWeight: 700, fontSize: 14, lineHeight: 1.2,
//             }}>
//               {student.name}
//             </Typography>
//             <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: '"DM Sans", sans-serif' }}>
//               {student.exam}
//             </Typography>
//           </Box>
//           <Box sx={{
//             bgcolor: '#c47a3a', borderRadius: '10px',
//             px: 1.2, py: 0.4,
//           }}>
//             <Typography sx={{ color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 800, fontSize: 13 }}>
//               {student.scoreLabel}
//             </Typography>
//           </Box>
//         </Box>

//         {/* Play button if video */}
//         {student.youtubeLink && (
//           <Box sx={{
//             position: 'absolute', top: 12, right: 12,
//             width: 32, height: 32, bgcolor: 'rgba(239,68,68,0.9)',
//             borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
//             opacity: hovered ? 1 : 0, transition: 'opacity 0.25s ease',
//           }}>
//             <PlayArrowIcon sx={{ color: '#fff', fontSize: 18 }} />
//           </Box>
//         )}
//       </Box>

//       <Typography sx={{
//         fontSize: 12, color: '#94a3b8',
//         fontFamily: '"DM Sans", sans-serif', textAlign: 'center',
//       }}>
//         {student.course}
//       </Typography>
//     </Box>
//   )
// }


// export default function Results({ data }: { data?: Student[] | unknown[] }) {
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [isPlayingVideo, setIsPlayingVideo] = useState(false)
//   const [isPaused, setIsPaused] = useState(false)

//   const displayResults: Student[] = data && data.length > 0
//     ? data.map((s, index) => ({ ...(s as Student), id: (s as Student).id || index })) : []

//   const shouldAnimate = displayResults.length > 4

//   return (
//     <Box id="results" sx={{ py: { xs: 9, md: 13 }, bgcolor: '#ffffff' }}>
//       <Container maxWidth="lg">
//         <Box sx={{ textAlign: 'center', mb: 8, px: { xs: 1, sm: 2 } }}>
//           <Typography sx={{
//             display: 'inline-block',
//             bgcolor: 'rgba(196,122,58,0.08)', color: '#c47a3a',
//             fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
//             fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
//             px: 2, py: 0.6, borderRadius: '20px', mb: 2,
//             border: '1px solid rgba(196,122,58,0.15)',
//           }}>
//             Achievements
//           </Typography>
//           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
//             <Typography variant="h2" sx={{
//               color: '#04301a',
//               fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' },
//               lineHeight: 1.1, letterSpacing: '-0.03em',
//             }}>
//               Success Stories
//             </Typography>
//             <AutoAwesomeIcon sx={{ color: '#c47a3a', fontSize: 26, mb: 0.5 }} />
//           </Box>
//           <Typography sx={{
//             color: '#6b7280', mt: 1.5, maxWidth: 460, mx: 'auto',
//             fontSize: { xs: '0.95rem', md: '1.05rem' },
//             lineHeight: 1.7, fontFamily: '"DM Sans", sans-serif',
//           }}>
//             Real students, real results. See how our students have transformed their futures.
//           </Typography>
//         </Box>
//       </Container>

//       {/* Scrolling strip */}
//       <Box
//         sx={{ position: 'relative', overflow: 'hidden', width: '100%' }}
//         onMouseEnter={() => setIsPaused(true)}
//         onMouseLeave={() => setIsPaused(false)}
//       >
//         {shouldAnimate && (
//           <>
//             <Box sx={{
//               position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
//               background: 'linear-gradient(to right, #fafaf8, transparent)',
//               zIndex: 10, pointerEvents: 'none',
//             }} />
//             <Box sx={{
//               position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
//               background: 'linear-gradient(to left, #fafaf8, transparent)',
//               zIndex: 10, pointerEvents: 'none',
//             }} />
//           </>
//         )}

//         <Box sx={{
//           display: 'flex', gap: 3, px: 5, pb: 4,
//           width: shouldAnimate ? 'max-content' : '100%',
//           overflowX: shouldAnimate ? 'visible' : 'auto',
//           justifyContent: shouldAnimate ? 'flex-start' : 'center',
//           ...(shouldAnimate && {
//             animationName: 'marquee',
//             animationDuration: '35s',
//             animationTimingFunction: 'linear',
//             animationIterationCount: 'infinite',
//             animationPlayState: isPaused ? 'paused' : 'running',
//             '@keyframes marquee': {
//               '0%': { transform: 'translateX(0)' },
//               '100%': { transform: 'translateX(-50%)' },
//             },
//           })
//         }}>
//           {(shouldAnimate ? [...displayResults, ...displayResults] : displayResults).map((student: unknown, i: number) => (
//             <StudentCard key={`${(student as Student).id}-${i}`} student={student as Student} onSelect={(s) => {
//               setSelectedStudent(s); setDialogOpen(true); setIsPlayingVideo(false)
//             }} />
//           ))}
//         </Box>
//       </Box>

//       {/* Modal */}
//       <Dialog
//         open={dialogOpen}
//         onClose={() => { setDialogOpen(false); setIsPlayingVideo(false) }}
//         maxWidth="sm" fullWidth
//         PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' } }}
//       >
//         {selectedStudent && (
//           <Box sx={{ position: 'relative' }}>
//             <IconButton onClick={() => { setDialogOpen(false); setIsPlayingVideo(false) }} size="small" sx={{
//               position: 'absolute', top: 14, right: 14, zIndex: 10,
//               color: '#374151', bgcolor: 'rgba(255,255,255,0.92)',
//               '&:hover': { bgcolor: '#fff' },
//               borderRadius: '10px', p: 0.7,
//             }}>
//               <CloseIcon fontSize="small" />
//             </IconButton>

//             <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: selectedStudent.youtubeLink ? '1fr 1.4fr' : '1fr' } }}>
//               {/* Left: portrait 9:16 video panel — only shown when there is a youtube link */}
//               {selectedStudent.youtubeLink && (
//                 <Box sx={{ bgcolor: '#0a0a0a', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ width: '100%', paddingTop: '177.78%', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
//                     {selectedStudent.youtubeLink && isPlayingVideo && (
//                       <Box sx={{
//                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
//                         zIndex: 2,
//                         opacity: 1,
//                         pointerEvents: 'auto',
//                       }}>
//                         <iframe
//                           src={`${formatYoutubeLink(selectedStudent.youtubeLink)}?autoplay=1&rel=0`}
//                           title="YouTube video player"
//                           frameBorder="0"
//                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                           allowFullScreen
//                           style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
//                         />
//                       </Box>
//                     )}

//                     <Box sx={{
//                       position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
//                       zIndex: 1,
//                       opacity: isPlayingVideo ? 0 : 1,
//                       pointerEvents: isPlayingVideo ? 'none' : 'auto',
//                       transition: 'opacity 0.3s ease',
//                     }}>
//                       <Box component="img" src={selectedStudent.image}
//                         onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
//                         sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
//                       />
//                       {selectedStudent.youtubeLink && (
//                         <Box onClick={(e) => { e.stopPropagation(); setIsPlayingVideo(true) }} sx={{
//                           position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2,
//                           bgcolor: 'rgba(0,0,0,0.35)', cursor: 'pointer',
//                           transition: 'background 0.3s',
//                           '&:hover': { bgcolor: 'rgba(0,0,0,0.5)', '& .play-btn': { transform: 'scale(1.1)' } },
//                         }}>
//                           <Box className="play-btn" sx={{
//                             width: 64, height: 64, borderRadius: '50%',
//                             bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             transition: 'transform 0.3s',
//                             boxShadow: '0 8px 32px rgba(239,68,68,0.5)',
//                           }}>
//                             <PlayArrowIcon sx={{ color: '#fff', fontSize: 40 }} />
//                           </Box>
//                           <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.5px' }}>
//                             Watch Story
//                           </Typography>
//                         </Box>
//                       )}
//                     </Box>
//                   </Box>
//                 </Box>
//               )}

//               {/* Right: Details */}
//               <Box sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
//                 <Chip
//                   icon={<StarIcon sx={{ fontSize: '13px !important', color: '#c47a3a !important' }} />}
//                   label={selectedStudent.exam}
//                   size="small"
//                   sx={{
//                     alignSelf: 'flex-start', mb: 2,
//                     bgcolor: 'rgba(196,122,58,0.08)', color: '#c47a3a',
//                     border: '1px solid rgba(196,122,58,0.15)',
//                     fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
//                     fontSize: 12, borderRadius: '8px',
//                   }}
//                 />

//                 <Typography sx={{
//                   fontFamily: '"Fraunces", serif', fontWeight: 800,
//                   fontSize: { xs: '1.6rem', md: '1.9rem' }, color: '#0a2540',
//                   mb: 0.5, lineHeight: 1.1, letterSpacing: '-0.02em',
//                 }}>
//                   {selectedStudent.name}
//                 </Typography>
//                 <Typography sx={{ fontSize: '1rem', color: '#6b7280', mb: 3, fontFamily: '"DM Sans", sans-serif' }}>
//                   {selectedStudent.achievement}
//                 </Typography>

//                 <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3.5 }}>
//                   <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
//                     <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"DM Sans", sans-serif' }}>
//                       Score
//                     </Typography>
//                     <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
//                       {selectedStudent.scoreLabel}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
//                     <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"DM Sans", sans-serif' }}>
//                       Program
//                     </Typography>
//                     <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#0a2540', lineHeight: 1.3 }}>
//                       {selectedStudent.course}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 <Box sx={{ flex: 1, borderLeft: '3px solid #c47a3a', pl: 2.5 }}>
//                   <Typography sx={{
//                     fontSize: '0.95rem', color: '#374151',
//                     lineHeight: 1.75, fontStyle: 'italic',
//                     fontFamily: '"DM Sans", sans-serif',
//                   }}>
//                     "{selectedStudent.bio}"
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           </Box>
//         )}
//       </Dialog>
//     </Box>
//   )
// }


import { useEffect, useRef, useState } from 'react'
import { Box, Container, Typography, Dialog, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StarIcon from '@mui/icons-material/Star'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { motion, useMotionValue } from 'framer-motion'

// interface Student {
//   id: number; name: string; score: string; scoreLabel: string
//   exam: string; course: string; image: string; bio: string
//   achievement: string; youtubeLink?: string
// }

interface ScoreEntry {
  exam: string
  score: string
}

interface Student {
  id: number
  name: string
  scores: ScoreEntry[]        // ✅ replaces score, scoreLabel, exam
  course: string
  image: string
  bio: string
  currentStatus: string[]     // ✅ new
  youtubeLink?: string
}

const formatYoutubeLink = (url?: string) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('youtube.com/shorts/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    } else if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1)
      return `https://www.youtube.com/embed/${videoId}`
    } else if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v')
      return `https://www.youtube.com/embed/${videoId}`
    }
  } catch { /* empty */ }
  return url
}

// function StudentCard({ student, onSelect }: { student: Student; onSelect: (s: Student) => void }) {
//   const [hovered, setHovered] = useState(false)
//   const firstScore = student.scores?.[0]  // show first score on card

//   return (
//     <Box onClick={() => onSelect(student)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
//       sx={{ cursor: 'pointer', width: 210, flexShrink: 0 }}
//     >
//       <Box sx={{
//         position: 'relative', height: 270, mb: 1.8,
//         borderRadius: '20px', overflow: 'hidden',
//         boxShadow: hovered ? '0 16px 40px rgba(10,37,64,0.14)' : '0 4px 16px rgba(10,37,64,0.06)',
//         transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
//         transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
//       }}>
//         <Box component="img" src={student.image} alt={student.name}
//           onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = 'https://via.placeholder.com/220x270?text=No+Image' }}
//           sx={{
//             width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block',
//             transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)',
//           }}
//         />
//         <Box sx={{
//           position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
//           background: 'linear-gradient(to top, rgba(10,37,64,0.82) 0%, transparent 100%)',
//         }} />
//         <Box sx={{
//           position: 'absolute', bottom: 12, left: 12, right: 12,
//           display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
//         }}>
//           <Box>
//             <Typography sx={{ color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
//               {student.name}
//             </Typography>
//             {/* ✅ show first exam name */}
//             <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: '"DM Sans", sans-serif' }}>
//               {firstScore?.exam || student.course}
//             </Typography>
//           </Box>
//           {/* ✅ show first score in badge */}
//           {firstScore && (
//             <Box sx={{ bgcolor: '#c47a3a', borderRadius: '8px', px: 1.2, py: 0.4 }}>
//               <Typography sx={{ color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 800, fontSize: 13 }}>
//                 {firstScore.score}
//               </Typography>
//             </Box>
//           )}
//         </Box>
//         {student.youtubeLink && (
//           <Box sx={{
//             position: 'absolute', top: 12, right: 12,
//             width: 32, height: 32, bgcolor: 'rgba(239,68,68,0.9)',
//             borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
//             opacity: hovered ? 1 : 0, transition: 'opacity 0.25s ease',
//           }}>
//             <PlayArrowIcon sx={{ color: '#fff', fontSize: 18 }} />
//           </Box>
//         )}
//       </Box>
//       <Typography sx={{ fontSize: 12, color: '#94a3b8', fontFamily: '"DM Sans", sans-serif', textAlign: 'center' }}>
//         {student.course}
//       </Typography>
//     </Box>
//   )
// }

function StudentCard({ student, onSelect }: { student: Student; onSelect: (s: Student) => void }) {
  const [hovered, setHovered] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const animFrameRef = useRef<number | null>(null)

  const chips = student.scores ?? []
  const shouldScroll = chips.length > 1  // ← the only gate you need

  useEffect(() => {
    if (!shouldScroll) return   // single score → skip rAF entirely

    const rafId = requestAnimationFrame(() => {
      const tick = () => {
        const inner = innerRef.current
        if (inner) {
          const singleSetWidth = inner.offsetWidth / 2
          let next = x.get() - 0.5
          if (next <= -singleSetWidth) next = 0
          x.set(next)
        }
        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [x, shouldScroll])

  return (
    <motion.div
      onClick={() => onSelect(student)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', width: 210, flexShrink: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* ── Image panel ── */}
      <motion.div
        style={{ position: 'relative', height: 270, marginBottom: 10, borderRadius: 20, overflow: 'hidden' }}
        animate={{ boxShadow: hovered ? '0 16px 40px rgba(10,37,64,0.14)' : '0 4px 16px rgba(10,37,64,0.06)' }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={student.image}
          alt={student.name}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://via.placeholder.com/220x270?text=No+Image'
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.4 }}
        />
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(to top, rgba(10,37,64,0.82) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <Typography sx={{ color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
            {student.name}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: '"DM Sans", sans-serif' }}>
            {student.scores?.[0]?.exam || student.course}
          </Typography>
        </Box>
        {student.youtubeLink && (
          <motion.div
            style={{
              position: 'absolute', top: 12, right: 12, width: 32, height: 32,
              background: 'rgba(239,68,68,0.9)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <PlayArrowIcon sx={{ color: '#fff', fontSize: 18 }} />
          </motion.div>
        )}
      </motion.div>

      {/* ── Score strip ── */}
      {chips.length > 0 && (
        <>
          {/* SINGLE score — static, centered, no scroll */}
          {!shouldScroll && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0 }}>
              <ScoreChip s={chips[0]} />
            </Box>
          )}

          {/* MULTIPLE scores — infinite loop scroll */}
          {shouldScroll && (
            <Box
              ref={wrapperRef}
              sx={{
                width: '100%',
                overflow: 'hidden',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
              }}
            >
              <motion.div style={{ display: 'flex', x }}>
                <div ref={innerRef} style={{ display: 'flex', flexShrink: 0 }}>
                  {chips.map((s, i) => <ScoreChip key={`a-${i}`} s={s} />)}
                  {chips.map((s, i) => <ScoreChip key={`b-${i}`} s={s} />)}
                </div>
              </motion.div>
            </Box>
          )}
        </>
      )}

      <Typography sx={{ fontSize: 12, color: '#94a3b8', fontFamily: '"DM Sans", sans-serif', textAlign: 'center', mt: '8px' }}>
        {student.course}
      </Typography>
    </motion.div>
  )
}

function ScoreChip({ s }: { s: ScoreEntry }) {
  return (
    <Box sx={{
      flexShrink: 0,
      border: '0.5px solid rgba(196,122,58,0.25)',
      borderRadius: '8px',
      px: '10px', py: '5px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minWidth: 58,
      bgcolor: 'rgba(196,122,58,0.04)',
      userSelect: 'none',
      pointerEvents: 'none',
      mr: '6px',
    }}>
      <Typography sx={{
        fontSize: 9, fontWeight: 700, color: '#b08040',
        fontFamily: '"DM Sans", sans-serif',
        letterSpacing: '0.6px', textTransform: 'uppercase',
        lineHeight: 1.4, whiteSpace: 'nowrap',
      }}>
        {s.exam}
      </Typography>
      <Typography sx={{
        fontSize: 15, fontWeight: 800, color: '#0d1117',
        fontFamily: '"DM Sans", sans-serif', lineHeight: 1.25,
      }}>
        {s.score}
      </Typography>
    </Box>
  )
}


export default function Results({ data }: { data?: Student[] | unknown[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const displayResults: Student[] = data && data.length > 0
    ? data.map((s, index) => ({ ...(s as Student), id: (s as Student).id || index })) : []

  const shouldAnimate = displayResults.length > 4

  const handleClose = () => { setDialogOpen(false); setIsPlayingVideo(false) }

  return (
    <Box id="results" sx={{ py: { xs: 9, md: 13 }, bgcolor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8, px: { xs: 1, sm: 2 } }}>
          <Typography sx={{
            display: 'inline-block',
            bgcolor: 'rgba(196,122,58,0.08)', color: '#c47a3a',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            px: 2, py: 0.6, borderRadius: '20px', mb: 2,
            border: '1px solid rgba(196,122,58,0.15)',
          }}>
            Achievements
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Typography variant="h2" sx={{
              color: '#04301a',
              fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' },
              lineHeight: 1.1, letterSpacing: '-0.03em',
            }}>
              Success Stories
            </Typography>
            <AutoAwesomeIcon sx={{ color: '#c47a3a', fontSize: 26, mb: 0.5 }} />
          </Box>
          <Typography sx={{
            color: '#6b7280', mt: 1.5, maxWidth: 460, mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7, fontFamily: '"DM Sans", sans-serif',
          }}>
            Real students, real results. See how our students have transformed their futures.
          </Typography>
        </Box>
      </Container>

      {/* Scrolling strip */}
      <Box
        sx={{ position: 'relative', overflow: 'hidden', width: '100%' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {shouldAnimate && (
          <>
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, #fafaf8, transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, #fafaf8, transparent)', zIndex: 10, pointerEvents: 'none' }} />
          </>
        )}
        <Box sx={{
          display: 'flex', gap: 3, px: 5, pb: 4,
          width: shouldAnimate ? 'max-content' : '100%',
          overflowX: shouldAnimate ? 'visible' : 'auto',
          justifyContent: shouldAnimate ? 'flex-start' : 'center',
          ...(shouldAnimate && {
            animationName: 'marquee',
            animationDuration: '35s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
            '@keyframes marquee': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            },
          })
        }}>
          {(shouldAnimate ? [...displayResults, ...displayResults] : displayResults).map((student: unknown, i: number) => (
            <StudentCard key={`${(student as Student).id}-${i}`} student={student as Student} onSelect={(s) => {
              setSelectedStudent(s); setDialogOpen(true); setIsPlayingVideo(false)
            }} />
          ))}
        </Box>
      </Box>

      {/* ── PROFESSIONAL MODAL ── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            borderRadius: { xs: '20px', sm: '24px' },
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
            m: { xs: 1.5, sm: 3 },
            width: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 48px)' },
          }
        }}
        BackdropProps={{
          sx: { bgcolor: 'rgba(10, 25, 41, 0.55)', backdropFilter: 'blur(4px)' }
        }}
      >
        {selectedStudent && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, bgcolor: '#fff', minHeight: { sm: 480 } }}>

            {/* ── LEFT PANEL: Image / Video ── */}
            <Box sx={{
              position: 'relative',
              width: { xs: '100%', sm: 300 },
              flexShrink: 0,
              bgcolor: '#111',
              minHeight: { xs: 260, sm: 'auto' },
            }}>
              {/* Image */}
              <Box
                component="img"
                src={selectedStudent.image}
                alt={selectedStudent.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image' }}
                sx={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'top',
                  display: 'block',
                  position: { xs: 'relative', sm: 'absolute' },
                  top: 0, left: 0,
                  minHeight: { xs: 260, sm: 'auto' },
                  opacity: isPlayingVideo ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* Gradient overlay on image */}
              {!isPlayingVideo && (
                <Box sx={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Video iframe */}
              {selectedStudent.youtubeLink && isPlayingVideo && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 3 }}>
                  <iframe
                    src={`${formatYoutubeLink(selectedStudent.youtubeLink)}?autoplay=1&rel=0`}
                    title="Student Story"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                </Box>
              )}

              {/* Play button overlay */}
              {selectedStudent.youtubeLink && !isPlayingVideo && (
                <Box
                  onClick={(e) => { e.stopPropagation(); setIsPlayingVideo(true) }}
                  sx={{
                    position: 'absolute', inset: 0, zIndex: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.5,
                    cursor: 'pointer',
                    '&:hover .play-ring': { transform: 'scale(1.07)', bgcolor: 'rgba(255,255,255,0.18)' },
                  }}
                >
                  <Box className="play-ring" sx={{
                    width: 56, height: 56, borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '2px solid rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s ease',
                  }}>
                    <PlayArrowIcon sx={{ color: '#fff', fontSize: 28, ml: 0.4 }} />
                  </Box>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: '0.78rem', fontWeight: 600,
                    fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    Watch Story
                  </Typography>
                </Box>
              )}

              {/* Score badge pinned bottom-left */}
              {/* ✅ first score badge on image */}
              {!isPlayingVideo && selectedStudent.scores?.[0] && (
                <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 3 }}>
                  <Box sx={{ bgcolor: '#c47a3a', borderRadius: '8px', px: 1.5, py: 0.5 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                      {selectedStudent.scores[0].score}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* ── RIGHT PANEL: Details ── */}
            {/* ── RIGHT PANEL: Details ── */}
            <Box sx={{
              flex: 1, display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden', bgcolor: '#fff',
            }}>
              {/* Close button — unchanged */}
              <IconButton onClick={handleClose} size="small" sx={{
                position: 'absolute', top: 14, right: 14, zIndex: 10,
                color: '#6b7280', bgcolor: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: '8px', p: 0.55,
                '&:hover': { bgcolor: '#f1f5f9', color: '#111827' },
                transition: 'all 0.15s ease',
              }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>

              {/* TOP SECTION */}
              <Box sx={{ px: { xs: 3, sm: 3.5 }, pt: { xs: 3, sm: 3.5 }, pb: 2.5 }}>
                {/* ✅ Show all exam tags as pills */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                  {(selectedStudent.scores || []).map((entry, i) => (
                    <Box key={i} sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.6,
                      bgcolor: 'rgba(196,122,58,0.06)',
                      border: '1px solid rgba(196,122,58,0.18)',
                      borderRadius: '6px', px: 1.2, py: 0.4,
                    }}>
                      <StarIcon sx={{ fontSize: 11, color: '#c47a3a' }} />
                      <Typography sx={{
                        fontSize: '0.7rem', fontWeight: 700, color: '#c47a3a',
                        fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.05em',
                      }}>
                        {entry.exam}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Student name — unchanged */}
                <Typography sx={{
                  fontFamily: '"Fraunces", serif', fontWeight: 800,
                  fontSize: { xs: '1.65rem', sm: '1.9rem' }, color: '#0d1117',
                  lineHeight: 1.1, letterSpacing: '-0.025em', mb: 0.8, pr: 4,
                }}>
                  {selectedStudent.name}
                </Typography>

                {/* <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.55 }}>
                  {selectedStudent.achievement}
                </Typography> */}
              </Box>

              <Box sx={{ height: '1px', bgcolor: '#f0f0f0', mx: { xs: 3, sm: 3.5 } }} />

              {/* ✅ SCORES STRIP — multiple scores */}
              <Box sx={{ px: { xs: 3, sm: 3.5 }, py: 2, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {(selectedStudent.scores || []).map((entry, i, arr) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Box sx={{ pr: 2.5 }}>
                      <Typography sx={{
                        fontSize: '0.62rem', fontWeight: 700, color: '#b0b8c4',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        fontFamily: '"DM Sans", sans-serif', mb: 0.4,
                      }}>
                        {entry.exam}
                      </Typography>
                      <Typography sx={{
                        fontFamily: '"Fraunces", serif',
                        fontSize: { xs: '1.3rem', sm: '1.5rem' },
                        fontWeight: 800, color: '#16a34a', lineHeight: 1,
                      }}>
                        {entry.score}
                      </Typography>
                    </Box>
                    {/* vertical divider between scores */}
                    {i < arr.length - 1 && (
                      <Box sx={{ width: '1px', bgcolor: '#f0f0f0', alignSelf: 'stretch', mr: 2.5 }} />
                    )}
                  </Box>
                ))}

                {/* Program — always last after scores */}
                {selectedStudent.scores?.length > 0 && (
                  <Box sx={{ width: '1px', bgcolor: '#f0f0f0', alignSelf: 'stretch', mr: 2.5 }} />
                )}
                <Box>
                  <Typography sx={{
                    fontSize: '0.62rem', fontWeight: 700, color: '#b0b8c4',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    fontFamily: '"DM Sans", sans-serif', mb: 0.4,
                  }}>
                    Program
                  </Typography>
                  <Typography sx={{
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem',
                    fontWeight: 700, color: '#0d1117', lineHeight: 1.35,
                  }}>
                    {selectedStudent.course}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ height: '1px', bgcolor: '#f0f0f0', mx: { xs: 3, sm: 3.5 } }} />

              {/* ✅ CURRENT STATUS — multiple lines */}
              {selectedStudent.currentStatus?.length > 0 && (
                <>
                  <Box sx={{ px: { xs: 3, sm: 3.5 }, pt: 2, pb: 1.5 }}>
                    <Typography sx={{
                      fontSize: '0.62rem', fontWeight: 700, color: '#b0b8c4',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      fontFamily: '"DM Sans", sans-serif', mb: 1.2,
                    }}>
                      Current Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {selectedStudent.currentStatus.map((line, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            bgcolor: '#c47a3a', flexShrink: 0,
                          }} />
                          <Typography sx={{
                            fontSize: '0.88rem', color: '#374151',
                            fontFamily: '"DM Sans", sans-serif', fontWeight: 500,
                          }}>
                            {line}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ height: '1px', bgcolor: '#f0f0f0', mx: { xs: 3, sm: 3.5 } }} />
                </>
              )}

              {/* QUOTE BLOCK — unchanged */}
              <Box sx={{
                flex: 1, px: { xs: 3, sm: 3.5 }, pt: 2.5, pb: { xs: 3, sm: 3.5 },
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <Typography sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: '4rem', lineHeight: 0.7, color: '#e2e8f0', mb: 1, userSelect: 'none',
                }}>
                  &ldquo;
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '0.9rem', sm: '0.95rem' }, color: '#374151',
                  lineHeight: 1.85, fontFamily: '"DM Sans", sans-serif', fontWeight: 400,
                }}>
                  {selectedStudent.bio}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Box sx={{ height: '1px', width: 24, bgcolor: '#c47a3a' }} />
                  <Typography sx={{
                    fontSize: '0.78rem', fontWeight: 700, color: '#c47a3a',
                    fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.04em',
                  }}>
                    {selectedStudent.name}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  )
}