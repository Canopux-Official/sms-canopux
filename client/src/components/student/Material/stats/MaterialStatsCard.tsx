// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Stack,
//   CircularProgress,
//   Alert,
//   Paper,
// } from '@mui/material';
// import {
//   School,
//   Description,
//   CalendarToday,
//   DateRange,
//   LibraryBooks
// } from '@mui/icons-material';
// import { fetchMaterialStats } from '../services/DashboardRecentMaterial';

// interface MaterialStats {
//   today: number;
//   thisWeek: number;
//   total: number;
// }

// interface StatItemProps {
//   icon: React.ReactNode;
//   label: string;
//   value: number;
//   color: string;
//   bgColor: string;
//   description?: string;
// }

// const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color, bgColor, description }) => (
//   <Paper
//     elevation={0}
//     sx={{
//       p: 2.5,
//       borderRadius: '16px',
//       background: bgColor,
//       border: '1px solid',
//       borderColor: `${color}20`,
//       transition: 'all 0.3s ease',
//       cursor: 'default',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: `0 8px 24px ${color}30`,
//       }
//     }}
//   >
//     <Stack direction="row" alignItems="center" spacing={2}>
//       <Box
//         sx={{
//           width: 48,
//           height: 48,
//           borderRadius: '12px',
//           background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           boxShadow: `0 4px 12px ${color}40`,
//         }}
//       >
//         {icon}
//       </Box>
//       <Box flex={1}>
//         <Typography
//           variant="h4"
//           fontWeight={800}
//           sx={{
//             background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
//             backgroundClip: 'text',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//           }}
//         >
//           {value}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" fontWeight={600}>
//           {label}
//         </Typography>
//         {description && (
//           <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
//             {description}
//           </Typography>
//         )}
//       </Box>
//     </Stack>
//   </Paper>
// );

// const MaterialStatsCard: React.FC = () => {
//   const [stats, setStats] = useState<MaterialStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadStats();
//   }, []);

//   const loadStats = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await fetchMaterialStats();
//       setStats(data);
//     } catch (err: any) {
//       setError(err.message || 'Failed to load statistics');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Paper
//         elevation={0}
//         sx={{
//           p: 4,
//           borderRadius: '16px',
//           background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
//           border: '1px solid #e0e0e0',
//         }}
//       >
//         <Stack alignItems="center" spacing={2}>
//           <CircularProgress size={40} />
//           <Typography variant="body2" color="text.secondary">
//             Loading your statistics...
//           </Typography>
//         </Stack>
//       </Paper>
//     );
//   }

//   if (error) {
//     return (
//       <Alert
//         severity="error"
//         sx={{
//           borderRadius: '16px',
//           '& .MuiAlert-message': { width: '100%' }
//         }}
//       >
//         <Typography variant="body2" fontWeight={600}>
//           {error}
//         </Typography>
//       </Alert>
//     );
//   }

//   if (!stats) {
//     return null;
//   }

//   return (
//     <Box>
//       <Box display="flex" alignItems="center" mb={3}>
//         <Box
//           sx={{
//             width: 40,
//             height: 40,
//             borderRadius: '10px',
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             mr: 1.5,
//             boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
//           }}
//         >
//           <School sx={{ color: 'white', fontSize: 24 }} />
//         </Box>
//         <Typography variant="h5" fontWeight={700}>
//           Material Activity
//         </Typography>
//       </Box>

//       <Stack spacing={2.5}>
//         {/* Main Stats Grid */}
//         <Box
//           sx={{
//             display: 'grid',
//             gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
//             gap: 2,
//           }}
//         >
//           <StatItem
//             icon={<CalendarToday sx={{ color: 'white', fontSize: 24 }} />}
//             label="Added Today"
//             value={stats.today}
//             color="#4facfe"
//             bgColor="linear-gradient(135deg, #e0f7ff 0%, #ffffff 100%)"
//             description="New materials"
//           />
//           <StatItem
//             icon={<DateRange sx={{ color: 'white', fontSize: 24 }} />}
//             label="This Week"
//             value={stats.thisWeek}
//             color="#667eea"
//             bgColor="linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)"
//             description="Last 7 days"
//           />
//           <StatItem
//             icon={<LibraryBooks sx={{ color: 'white', fontSize: 24 }} />}
//             label="Total Materials"
//             value={stats.total}
//             color="#f093fb"
//             bgColor="linear-gradient(135deg, #fff0f8 0%, #ffffff 100%)"
//             description="All time"
//           />
//         </Box>

//         {/* Optional: Growth Indicator */}
//         {stats.thisWeek > 0 && (
//           <Paper
//             elevation={0}
//             sx={{
//               p: 2,
//               borderRadius: '12px',
//               background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)',
//               border: '1px solid #4caf5020',
//             }}
//           >
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <Box
//                 sx={{
//                   width: 32,
//                   height: 32,
//                   borderRadius: '8px',
//                   background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//               >
//                 <Description sx={{ color: 'white', fontSize: 18 }} />
//               </Box>
//               <Box flex={1}>
//                 <Typography variant="body2" fontWeight={600} color="text.primary">
//                   {stats.thisWeek} new materials this week!
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   Keep up the great learning momentum 🚀
//                 </Typography>
//               </Box>
//             </Stack>
//           </Paper>
//         )}
//       </Stack>
//     </Box>
//   );
// };

// export default MaterialStatsCard;

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { fetchMaterialStats } from '../services/DashboardRecentMaterial';

interface MaterialStats { today: number; thisWeek: number; total: number }

const STATS = (s: MaterialStats) => [
  { label: 'Added Today',     value: s.today,    sub: 'New materials' },
  { label: 'This Week',       value: s.thisWeek, sub: 'Last 7 days'   },
  { label: 'Total Materials', value: s.total,    sub: 'All time'      },
];

const MaterialStatsCard: React.FC = () => {
  const [stats, setStats]     = useState<MaterialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try   { setStats(await fetchMaterialStats()); }
      catch (e: any) { setError(e.message || 'Failed to load statistics'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, color: 'text.secondary' }}>
      <CircularProgress size={16} thickness={4} color="inherit" />
      <Typography variant="body2" color="text.secondary">Loading statistics…</Typography>
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  if (!stats) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid', borderColor: 'grey.200',
        borderRadius: 3, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      }}
    >
      {STATS(stats).map(({ label, value, sub }, i) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, px: 3.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', letterSpacing: '-1px', lineHeight: 1 }}
            >
              {value}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {label}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {sub}
            </Typography>
          </Box>
          {i < 2 && <Divider orientation="vertical" flexItem />}
        </Box>
      ))}
    </Paper>
  );
};

export default MaterialStatsCard;