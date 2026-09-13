import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Divider,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getStudentMarks, type StudentMarkRow } from './services/StudentMarksApi';

const StudentMarks: React.FC = () => {
  const [marks, setMarks] = useState<StudentMarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getStudentMarks();
        if (res.success) {
          setMarks(res.data || []);
        } else {
          setError(res.message || 'Failed to fetch marks');
        }
      } catch (err) {
        console.error('Error fetching marks:', err);
        setError('Unable to load marks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const percentageColor = (pct: number) => {
    if (pct >= 75) return '#2e7d32';
    if (pct >= 50) return '#ed6c02';
    return '#d32f2f';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#333', fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 0.5 }}>
          My Marks
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Published test results, along with class average and rank.
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}

      {!loading && !error && marks.length === 0 && (
        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
          No published test results yet. Check back once your admin publishes results.
        </Alert>
      )}

      {!loading && !error && marks.length > 0 && (
        <Stack spacing={2}>
          {marks.map((m) => (
            <Paper key={m.testId} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {m.heading}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    <EventIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption">
                      {new Date(m.testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' • '}Class {m.classType}
                      {m.stream ? ` • ${m.stream}` : ''}
                      {m.targetExam ? ` • ${m.targetExam}` : ''}
                    </Typography>
                  </Stack>
                </Box>

                {m.isAbsent ? (
                  <Chip label="Absent" color="error" variant="outlined" />
                ) : (
                  <Chip
                    icon={<EmojiEventsIcon sx={{ fontSize: 18 }} />}
                    label={`Rank #${m.rank} of ${m.totalStudents}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>

              {m.description && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: '#f7f7f8',
                    border: '1px solid #eee',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                    Syllabus / Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#444' }}>
                    {m.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {m.isAbsent ? (
                <Typography color="text.secondary" fontStyle="italic">
                  You were marked absent for this test.
                </Typography>
              ) : (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Your Score
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {m.marksObtained} / {m.totalMarks}
                      <Typography component="span" variant="body2" sx={{ ml: 1, color: percentageColor(m.percentage || 0) }}>
                        ({m.percentage}%)
                      </Typography>
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(m.percentage || 0, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 2,
                      backgroundColor: '#eee',
                      '& .MuiLinearProgress-bar': { backgroundColor: percentageColor(m.percentage || 0) },
                    }}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Class Average
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {m.classAverage} / {m.totalMarks}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Class Highest
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {m.classHighest} / {m.totalMarks}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Students
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {m.totalStudents}
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default StudentMarks;