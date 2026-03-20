import { useState } from 'react'
import { Box, Container, Typography, IconButton, Dialog, useMediaQuery, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

interface GalleryImage {
    url: string
    publicId?: string
}

interface GalleryProps {
    data?: GalleryImage[]
}

export default function Gallery({ data }: GalleryProps) {
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
    const [hovered, setHovered] = useState<number | null>(null)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    if (!data || data.length === 0) return null

    // Mobile: 2 columns, Tablet+: 3 columns
    const colCount = isMobile ? 2 : 3
    const columns: { img: GalleryImage; realIdx: number }[][] = Array.from({ length: colCount }, () => [])
    data.forEach((img, i) => columns[i % colCount].push({ img, realIdx: i }))

    const handlePrev = () => {
        if (lightboxIdx === null) return
        setLightboxIdx(lightboxIdx === 0 ? data.length - 1 : lightboxIdx - 1)
    }

    const handleNext = () => {
        if (lightboxIdx === null) return
        setLightboxIdx(lightboxIdx === data.length - 1 ? 0 : lightboxIdx + 1)
    }

    // Swipe support for mobile lightbox
    let touchStartX = 0
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX = e.touches[0].clientX
    }
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) {
            diff > 0 ? handleNext() : handlePrev()
        }
    }

    return (
        <Box id="gallery" sx={{ py: { xs: 6, md: 14 }, bgcolor: '#ffffff' }}>
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>

                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 10 }, px: { xs: 0, sm: 2 } }}>
                    <Typography sx={{
                        display: 'inline-block',
                        bgcolor: 'rgba(10,37,64,0.05)',
                        color: '#0a2540',
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 600,
                        fontSize: { xs: 11, sm: 12 },
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        px: 2, py: 0.6,
                        borderRadius: '20px',
                        mb: 2,
                        border: '1px solid rgba(10,37,64,0.1)',
                    }}>
                        Our Moments
                    </Typography>
                    <Typography variant="h2" sx={{
                        color: '#04301a',
                        mb: 1.5,
                        fontSize: { xs: '1.6rem', sm: '2.4rem', md: '3rem' },
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                    }}>
                        Life at JJ Institute
                    </Typography>
                    <Typography sx={{
                        color: '#6b7280',
                        maxWidth: 480,
                        mx: 'auto',
                        fontSize: { xs: '0.88rem', md: '1.05rem' },
                        lineHeight: 1.7,
                        fontFamily: '"DM Sans", sans-serif',
                    }}>
                        A glimpse into our classrooms, events, and the moments that make us proud.
                    </Typography>
                </Box>

                {/* Masonry Collage Grid */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                    gap: { xs: '5px', sm: '8px', md: '10px' },
                    alignItems: 'start',
                }}>
                    {columns.map((col, colIdx) => (
                        <Box
                            key={colIdx}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: '5px', sm: '8px', md: '10px' },
                            }}
                        >
                            {col.map(({ img, realIdx }) => (
                                <Box
                                    key={realIdx}
                                    onMouseEnter={() => setHovered(realIdx)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => setLightboxIdx(realIdx)}
                                    sx={{
                                        position: 'relative',
                                        borderRadius: { xs: '6px', sm: '10px', md: '12px' },
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        lineHeight: 0,
                                        // Subtle shadow on mobile for depth
                                        boxShadow: '0 2px 8px rgba(10,37,64,0.08)',
                                        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: { xs: 'none', sm: 'scale(1.015)' }, // no scale on mobile (feels laggy)
                                            boxShadow: { xs: '0 2px 8px rgba(10,37,64,0.08)', sm: '0 8px 24px rgba(10,37,64,0.15)' },
                                            zIndex: 2,
                                        },
                                        // Active press effect for mobile tap feedback
                                        '&:active': {
                                            transform: 'scale(0.97)',
                                            transition: 'transform 0.1s ease',
                                        },
                                    }}
                                >
                                    {/* Image — full natural ratio, never cropped */}
                                    <Box
                                        component="img"
                                        src={img.url}
                                        alt=""
                                        loading="lazy"          // ✅ lazy load for mobile performance
                                        sx={{
                                            width: '100%',
                                            height: 'auto',     // ✅ natural ratio always preserved
                                            display: 'block',
                                        }}
                                    />

                                    {/* Hover overlay — desktop only (touch has tap feedback instead) */}
                                    <Box sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: 'rgba(10,37,64,0.38)',
                                        opacity: hovered === realIdx ? 1 : 0,
                                        transition: 'opacity 0.25s ease',
                                        display: { xs: 'none', sm: 'flex' }, // hidden on mobile
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Box sx={{
                                            width: 36, height: 36,
                                            bgcolor: 'rgba(255,255,255,0.92)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transform: hovered === realIdx ? 'scale(1)' : 'scale(0.7)',
                                            transition: 'transform 0.25s ease',
                                        }}>
                                            <ZoomInIcon sx={{ fontSize: 18, color: '#0a2540' }} />
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>

                {/* Image count pill */}
                <Box sx={{ textAlign: 'center', mt: { xs: 3, md: 4 } }}>
                    <Typography sx={{
                        display: 'inline-block',
                        fontSize: { xs: 11, sm: 12 },
                        color: '#94a3b8',
                        fontFamily: '"DM Sans", sans-serif',
                        bgcolor: 'rgba(10,37,64,0.04)',
                        px: 2, py: 0.5,
                        borderRadius: '20px',
                        border: '1px solid rgba(10,37,64,0.07)',
                    }}>
                        {data.length} {data.length === 1 ? 'photo' : 'photos'} — tap to view
                    </Typography>
                </Box>
            </Container>

            {/* ── Lightbox ── */}
            <Dialog
                open={lightboxIdx !== null}
                onClose={() => setLightboxIdx(null)}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(4,18,30,0.98)',
                        borderRadius: { xs: '12px', sm: '20px' },
                        overflow: 'hidden',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
                        // Full screen feel on mobile
                        m: { xs: 1, sm: 4 },
                        maxWidth: { xs: 'calc(100vw - 16px)', sm: '90vw' },
                        maxHeight: { xs: 'calc(100vh - 16px)', sm: '90vh' },
                        width: { xs: 'calc(100vw - 16px)', sm: 'auto' },
                    }
                }}
            >
                {lightboxIdx !== null && (
                    <Box
                        sx={{ position: 'relative', lineHeight: 0 }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Main image */}
                        <Box
                            component="img"
                            src={data[lightboxIdx].url}
                            alt=""
                            sx={{
                                display: 'block',
                                maxWidth: '100%',
                                maxHeight: { xs: 'calc(100vh - 80px)', sm: '85vh' },
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                mx: 'auto',
                            }}
                        />

                        {/* Close */}
                        <IconButton
                            onClick={() => setLightboxIdx(null)}
                            size="small"
                            sx={{
                                position: 'absolute', top: 10, right: 10,
                                bgcolor: 'rgba(255,255,255,0.12)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                                borderRadius: '10px', p: { xs: 0.6, sm: 0.8 },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>

                        {/* Prev/Next — always visible on mobile as bottom bar */}
                        {data.length > 1 && (
                            <>
                                {/* Desktop arrow buttons */}
                                <IconButton
                                    onClick={handlePrev}
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        position: 'absolute', left: 10,
                                        top: '50%', transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                        borderRadius: '10px',
                                    }}
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={handleNext}
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        position: 'absolute', right: 10,
                                        top: '50%', transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                        borderRadius: '10px',
                                    }}
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </IconButton>

                                {/* Mobile bottom nav bar */}
                                <Box sx={{
                                    display: { xs: 'flex', sm: 'none' },
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    px: 2, py: 1.5,
                                    bgcolor: 'rgba(0,0,0,0.4)',
                                }}>
                                    <IconButton onClick={handlePrev} sx={{ color: '#fff', p: 1 }}>
                                        <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                    <Typography sx={{
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: 13,
                                        fontFamily: '"DM Sans", sans-serif',
                                    }}>
                                        {lightboxIdx + 1} / {data.length}
                                    </Typography>
                                    <IconButton onClick={handleNext} sx={{ color: '#fff', p: 1 }}>
                                        <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </>
                        )}

                        {/* Desktop counter */}
                        {data.length > 1 && (
                            <Box sx={{
                                display: { xs: 'none', sm: 'block' },
                                position: 'absolute', bottom: 12,
                                left: '50%', transform: 'translateX(-50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'rgba(255,255,255,0.8)',
                                px: 2, py: 0.4,
                                borderRadius: '20px',
                                fontSize: 12,
                                fontFamily: '"DM Sans", sans-serif',
                            }}>
                                {lightboxIdx + 1} / {data.length}
                            </Box>
                        )}
                    </Box>
                )}
            </Dialog>
        </Box>
    )
}