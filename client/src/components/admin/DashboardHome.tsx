
import { Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FlagIcon from '@mui/icons-material/Flag';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getAdminDashboardDetails } from '../../api/apiFunctions';
import {
  DashboardContainer,
  StatsFlexContainer,
  StatCardWrapper,
  CardHeader,
} from './DashboardHome.styles';

// Interface matching your backend response data
interface IDashboardStats {
  streamCount: number;
  studentCount: number;
  subjectCount: number;
  targetExamCount: number;
}

const DashboardHome: React.FC = () => {
  const navigate = useNavigate(); // Initialize hook

  const { data: response, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getAdminDashboardDetails
  });

  const statsData: IDashboardStats = response?.success && response?.data
    ? response.data.data
    : {
      streamCount: 0,
      studentCount: 0,
      subjectCount: 0,
      targetExamCount: 0,
    };

  // Helper to calculate current academic session (e.g., 2025-2026)
  const getCurrentSession = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Assuming session changes in April. If currently Jan-March, session started previous year.
    const startYear = now.getMonth() < 3 ? currentYear - 1 : currentYear;
    return `${startYear}-${(startYear + 1).toString().slice(-2)}`;
  };

  // Defined links for each card
  const stats = [
    {
      title: 'Total Students',
      value: statsData.studentCount,
      icon: <PeopleIcon color="primary" />,
      link: '/admin/students' // Route destination
    },
    {
      title: 'Active Subjects',
      value: statsData.subjectCount,
      icon: <MenuBookIcon color="success" />,
      link: '/admin/subjects' // Route destination
    },
    {
      title: 'Active Streams',
      value: statsData.streamCount,
      icon: <AccountTreeIcon color="info" />,
      link: '/admin/streams' // Route destination
    },
    {
      title: 'Active Target Exams',
      value: statsData.targetExamCount,
      icon: <FlagIcon color="warning" />,
      link: '/admin/target-exams' // Route destination
    },
    {
      title: 'Current Session',
      value: getCurrentSession(),
      icon: <EventAvailableIcon color="secondary" />,
      link: null // No specific route for this yet
    },
  ];

  return (
    <DashboardContainer>
      <Box mb={1}>
        <Typography variant="h5" fontWeight="700" color="text.primary">
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back to the JJ Institute Of Science Admin Panel.
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <StatsFlexContainer>
          {stats.map((stat, index) => (
            <StatCardWrapper
              key={index}
              onClick={() => stat.link && navigate(stat.link)}
              sx={{
                cursor: stat.link ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': stat.link ? {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                } : {}
              }}
            >
              <CardHeader>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="700" textTransform="uppercase" fontSize="0.75rem">
                  {stat.title}
                </Typography>
                {stat.icon}
              </CardHeader>

              <Box>
                <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                  {stat.value}
                </Typography>
              </Box>
            </StatCardWrapper>
          ))}
        </StatsFlexContainer>
      )}
    </DashboardContainer>
  );
};

export default DashboardHome;