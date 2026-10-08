import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Chip,
  IconButton, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  NotificationsNoneOutlined as BellIcon,
  MenuBookOutlined as BookIcon,
  TrendingUp as TrendIcon,
  ArrowForward as ArrowIcon,
  SupportAgentOutlined as SupportIcon,
  ChevronRight as ChevronIcon,
} from '@mui/icons-material';
import { getStudentNotices, getStudent } from '../../../api/apiFunctions';
import MaterialStatsCard from '../Material/stats/MaterialStatsCard';
import RecentlyAddedMaterials from '../Material/stats/RecentlyAddedMaterials';

interface StudentData { name?: string; targetExams?: { name?: string }[] }
interface NoticeData { _id: string; title?: string; heading?: string; createdAt?: string }

const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    (async () => {
      try {
        const [p, n] = await Promise.all([getStudent(), getStudentNotices()]);
        if (p.success) setStudent(p.data as StudentData);
        if (n.success) {
          const d = (n.data as any)?.data;
          if (Array.isArray(d)) setNotices(d);
        }
      } catch { }
    })();
  }, []);

  // console.log(student)

  const firstName = student?.name?.split(' ')[0] || 'Student';
  const targets = student?.targetExams?.map(t => t.name).filter(Boolean).join(', ') || '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const goToMaterial = (path: Array<{ id: string; heading: string }>) =>
    navigate('/student/material', { state: { navigateToPath: path, shouldNavigate: true, timestamp: Date.now() } });

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          px: 3, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid', borderColor: 'grey.200',
          borderRadius: 0, bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Typography variant="body1" fontWeight={600}>
            {getGreeting()}, {firstName} 👋
          </Typography>
          {!isMobile && (
            <Typography variant="body2" color="text.disabled">{today}</Typography>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {targets && !isMobile && (
            <Chip
              icon={<TrendIcon sx={{ fontSize: '14px !important' }} />}
              label={targets}
              size="small"
              sx={{
                bgcolor: 'primary.50', color: 'primary.main',
                fontWeight: 600, fontSize: '0.75rem',
                '& .MuiChip-icon': { color: 'primary.main' },
              }}
            />
          )}
          <Box sx={{ position: 'relative' }}>
            <IconButton
              size="small"
              sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 0.75 }}
            >
              <BellIcon fontSize="small" />
            </IconButton>
            {notices.length > 0 && (
              <Box sx={{
                position: 'absolute', top: 6, right: 6,
                width: 6, height: 6, borderRadius: '50%',
                bgcolor: 'error.main', border: '2px solid white',
              }} />
            )}
          </Box>
        </Stack>
      </Paper>

      {/* ── Page Body ───────────────────────────────────────────────────────── */}
      <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Stats */}
        <MaterialStatsCard />

        {/* 70 / 30 grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '7fr 3fr' },
          gap: 2,
          alignItems: 'start',
        }}>

          {/* ── Study Materials ─────────────────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, overflow: 'hidden' }}
          >
            {/* Panel header */}
            <Box sx={{
              px: 2.5, py: 1.75,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid', borderColor: 'grey.100',
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <BookIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={600}>Study Materials</Typography>
                <Chip
                  label="Latest"
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.65rem', fontWeight: 600,
                    bgcolor: 'grey.100', color: 'text.secondary',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Stack>
              <Box
                component="button"
                onClick={() => navigate('/student/material')}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'primary.main', fontSize: '0.8rem', fontWeight: 600,
                  fontFamily: 'inherit', p: 0,
                  '&:hover': { opacity: 0.75 },
                }}
              >
                View all <ArrowIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>

            {/* Materials grid */}
            <Box sx={{ p: 2 }}>
              <RecentlyAddedMaterials
                onNavigateToMaterial={goToMaterial}
                maxItems={isMobile ? 4 : 8}
                showHeader={false}
                containerStyles={{}}
              />
            </Box>
          </Paper>

          {/* ── Right column ────────────────────────────────────────────── */}
          <Stack spacing={2}>

            {/* Announcements */}
            <Paper
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, overflow: 'hidden' }}
            >
              <Box sx={{
                px: 2.5, py: 1.75,
                display: 'flex', alignItems: 'center',
                borderBottom: '1px solid', borderColor: 'grey.100',
                gap: 1,
              }}>
                <BellIcon sx={{ fontSize: 17, color: 'warning.main' }} />
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                  Announcements
                </Typography>
                {notices.length > 0 && (
                  <Chip
                    label={`${notices.length} new`}
                    size="small"
                    sx={{
                      height: 20, fontSize: '0.65rem', fontWeight: 700,
                      bgcolor: 'warning.50', color: 'warning.dark',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                )}
              </Box>

              <Box sx={{ px: 2.5, py: 1.25 }}>
                {notices.length === 0 ? (
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
                    No announcements
                  </Typography>
                ) : (
                  <Stack divider={<Divider />}>
                    {notices.slice(0, isMobile ? 3 : 5).map(n => (
                      <Box key={n._id} sx={{ py: 1.25 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Box sx={{
                            width: 5, height: 5, borderRadius: '50%',
                            bgcolor: 'primary.main', flexShrink: 0, mt: 0.75,
                          }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.5 }}>
                              {n.title || n.heading || '—'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Date unavailable'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>

            {/* Support */}
            <Paper
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, p: 2.5 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <SupportIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600}>Need Help?</Typography>
              </Stack>

              <Stack spacing={1}>
                {[
                  { label: 'support@example.com', href: 'mailto:support@example.com', color: 'primary.main' },
                  { label: '+91 98765 43210', href: 'tel:+919876543210', color: 'text.primary' },
                ].map(item => (
                  <Box
                    key={item.href}
                    component="a"
                    href={item.href}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      px: 1.5, py: 1,
                      bgcolor: 'grey.50', borderRadius: 2,
                      border: '1px solid', borderColor: 'grey.200',
                      color: item.color, fontSize: '0.8rem', fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'border-color 0.15s',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 500, color: 'inherit' }}>
                      {item.label}
                    </Typography>
                    <ChevronIcon sx={{ fontSize: 16, opacity: 0.45 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentDashboard;