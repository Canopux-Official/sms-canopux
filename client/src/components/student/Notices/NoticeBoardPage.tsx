// Updated src/pages/NoticeBoardPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Chip, Stack, Alert, CircularProgress } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { NoticeCard, DateBadge } from './NoticeBoardPage.styles';
import type { Notice } from '../../admin/Notice/types/types';
import { getNoticesForStudent } from './services/StudentNotice';

const NoticeBoardPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNoticesForStudent();
        setNotices(data);
      } catch (error) {
        console.error('Failed to load notices:', error);
        setError(error instanceof Error ? error.message : 'Failed to load notices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return (
    <Box maxWidth="md">
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <CampaignIcon color="secondary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>Notice Board</Typography>
          <Typography variant="body1" color="text.secondary">Stay updated with latest announcements.</Typography>
        </Box>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && notices.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No notices available at the moment.
        </Alert>
      )}

      {!loading && !error && notices.length > 0 && notices.map((notice) => (
        <NoticeCard key={notice._id.toString()} elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
            <Typography variant="h6" fontWeight={600} color="primary">
              {notice.heading}
            </Typography>
            <DateBadge>{formatDate(notice.createdAt.toString())}</DateBadge>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            {notice.description}
          </Typography>
          <Chip 
            label={notice.tag || 'General'} 
            size="small" 
            variant="outlined" 
            color={notice.tag === 'Admin' ? 'error' : notice.tag === 'General' ? 'default' : 'primary'} 
          />
        </NoticeCard>
      ))}
    </Box>
  );
};

export default NoticeBoardPage;