// import React from 'react';
// import { Typography, Box, Stack, Divider } from '@mui/material';

// import EventNoteIcon from '@mui/icons-material/EventNote';
// import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// import MenuBookIcon from '@mui/icons-material/MenuBook';
// import SupportAgentIcon from '@mui/icons-material/SupportAgent';
// import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
// import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

// import {
//   WelcomeCard, InfoCard, NoticePreview,
//   CountdownCard, QuickActionButton, QuoteBox
// } from './StudentDashboard.styles';
// import RecentlyAddedMaterials from '../Material/stats/RecentlyAddedMaterials';
// import { useNavigate } from 'react-router-dom';

// // Import the new component

// const StudentDashboard: React.FC = () => {
//   // Mock Data
//   const student = {
//     name: "Anjali Singh",
//     currentClass: "Class 12",
//     targetExams: ["NEET"]
//   };

//   const notices = [
//     { id: 1, title: "Diwali Vacation Schedule", date: "15 Oct 2025" },
//     { id: 2, title: "Physics Guest Lecture by Dr. Verma", date: "12 Oct 2025" },
//   ];

//   const navigate = useNavigate()

//   // Handler for when student clicks on a material
//   const handleNavigateToMaterial = (fullPath: Array<{ id: string; heading: string }>) => {
//     console.log('Navigating to:', fullPath.map(p => p.heading).join(' → '));

//     // Navigate to materials page with the full path
//     navigate('/student/material', {
//       state: {
//         navigateToPath: fullPath,
//         shouldNavigate: true
//       }
//     });
//   };

//   return (
//     <Box>
//       {/* 1. Welcome Header (Simplified) */}
//       <WelcomeCard elevation={3}>
//         <Box>
//           <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
//             Hello, {student.name}!
//           </Typography>
//           <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
//             Stay focused. Your goal <strong>{student.targetExams[0]}</strong> is closer than you think.
//           </Typography>
//         </Box>
//         {/* Decorative Icon or simple visual */}
//         <Box sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.8 }}>
//           <EmojiObjectsIcon sx={{ fontSize: 60, color: '#ffca28' }} />
//         </Box>
//       </WelcomeCard>

//       {/* 2. Motivational Quote */}
//       <QuoteBox>
//         <Typography variant="body2" fontWeight={600}>
//           "Success is the sum of small efforts, repeated day in and day out."
//         </Typography>
//         <Typography variant="caption" display="block" mt={0.5}>
//           — Robert Collier
//         </Typography>
//       </QuoteBox>

//       {/* 3. General Utilities Row (Countdown + Quick Actions) */}
//       <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>

//         {/* Exam Countdown (Flex 1) */}
//         <Box flex={1}>
//           <CountdownCard elevation={0}>
//             <HourglassEmptyIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
//             <Typography variant="h3" fontWeight={800}>142</Typography>
//             <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>
//               Days to NEET 2026
//             </Typography>
//           </CountdownCard>
//         </Box>

//         {/* Quick Actions (Flex 2) */}
//         <Box flex={2}>
//           <Stack direction="row" spacing={2} height="100%">
//             <Box flex={1}>
//               <QuickActionButton>
//                 <ReceiptLongIcon color="primary" fontSize="large" />
//                 <Typography variant="body2" fontWeight={600}>Fee Receipts</Typography>
//               </QuickActionButton>
//             </Box>
//             <Box flex={1}>
//               <QuickActionButton>
//                 <MenuBookIcon color="secondary" fontSize="large" />
//                 <Typography variant="body2" fontWeight={600}>Syllabus</Typography>
//               </QuickActionButton>
//             </Box>
//             <Box flex={1}>
//               <QuickActionButton>
//                 <SupportAgentIcon color="action" fontSize="large" />
//                 <Typography variant="body2" fontWeight={600}>Help Desk</Typography>
//               </QuickActionButton>
//             </Box>
//           </Stack>
//         </Box>
//       </Stack>

//       {/* 4. Main Content Row (Materials & Notices) */}
//       <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>

//         {/* Left: Recent Materials (Flex 2) - REPLACED WITH REAL COMPONENT */}
//         <Box flex={2}>
//           <InfoCard elevation={0}>
//             {/* Use the real RecentlyAddedMaterials component */}
//             <RecentlyAddedMaterials
//               onNavigateToMaterial={handleNavigateToMaterial}
//               maxItems={5}
//               showHeader={false}
//               containerStyles={{ padding: 0 }}
//             />
//           </InfoCard>
//         </Box>

//         {/* Right: Notices (Flex 1) */}
//         <Box flex={1}>
//           <InfoCard elevation={0}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//               <Typography variant="h6" fontWeight={700}>Notice Board</Typography>
//               <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>VIEW ALL</Typography>
//             </Box>

//             {notices.map((notice) => (
//               <NoticePreview key={notice.id}>
//                 <Typography variant="subtitle2" fontWeight={600}>{notice.title}</Typography>
//                 <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
//                   <EventNoteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
//                   <Typography variant="caption" color="text.secondary">{notice.date}</Typography>
//                 </Stack>
//               </NoticePreview>
//             ))}

//             <Divider sx={{ my: 2 }} />

//             {/* Institute Contact Info (General Thing) */}
//             <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
//               Institute Contact
//             </Typography>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Email: support@jjinstitute.com
//             </Typography>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Phone: +91 98765 43210
//             </Typography>

//           </InfoCard>
//         </Box>

//       </Stack>
//     </Box>
//   );
// };

// export default StudentDashboard;



// main one

// import React, { useEffect, useState } from 'react';
// import { Typography, Box, Stack, Divider, CircularProgress } from '@mui/material';

// import EventNoteIcon from '@mui/icons-material/EventNote';
// import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

// import {
//   WelcomeCard, InfoCard, NoticePreview, QuoteBox
// } from './StudentDashboard.styles';
// import RecentlyAddedMaterials from '../Material/stats/RecentlyAddedMaterials';
// import MaterialStatsCard from '../Material/stats/MaterialStatsCard';
// import { useNavigate } from 'react-router-dom';
// import { getStudentProfile, getStudentNotices } from '../../../api/apiFunctions';

// interface StudentData {
//   name?: string;
//   targetExams?: { name?: string }[];
//   currentClass?: string;
//   stream?: { name?: string };
// }

// interface NoticeData {
//   _id: string;
//   title?: string;
//   heading?: string;
//   createdAt?: string;
// }

// const StudentDashboard: React.FC = () => {
//   const [student, setStudent] = useState<StudentData | null>(null);
//   const [notices, setNotices] = useState<NoticeData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [profileRes, noticesRes] = await Promise.all([
//           getStudentProfile(),
//           getStudentNotices()
//         ]);

//         if (profileRes.success && profileRes.data) {
//           // Backend returns the student document directly (not wrapped in { student })
//           setStudent(profileRes.data as StudentData);
//         }

//         if (noticesRes.success && noticesRes.data) {
//           // Backend returns { success, data: [...notices], count }
//           const payload = noticesRes.data as { data?: NoticeData[] };
//           if (Array.isArray(payload.data)) {
//             setNotices(payload.data);
//           }
//         }
//       } catch (error) {
//         console.error("Error loading dashboard data", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handler for when student clicks on a material
//   const handleNavigateToMaterial = (fullPath: Array<{ id: string; heading: string }>) => {
//     console.log('Navigating to:', fullPath.map(p => p.heading).join(' → '));

//     // Navigate to materials page with the full path
//     navigate('/student/material', {
//       state: {
//         navigateToPath: fullPath,
//         shouldNavigate: true,
//         timestamp: Date.now() // Add timestamp to ensure navigation triggers
//       }
//     });
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Fallback defaults if APIs fail
//   const studentName = student?.name || "Student";
//   const studentTargets = student?.targetExams?.length
//     ? student.targetExams.map(t => t.name || '').filter(Boolean).join(', ')
//     : "Your upcoming exams";

//   return (
//     <Box>
//       {/* 1. Welcome Header */}
//       <WelcomeCard elevation={3}>
//         <Box>
//           <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
//             Hello, {studentName}!
//           </Typography>
//           <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
//             Stay focused. <strong>{studentTargets}</strong> is closer than you think.
//           </Typography>
//         </Box>
//         <Box sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.8 }}>
//           <EmojiObjectsIcon sx={{ fontSize: 60, color: '#ffca28' }} />
//         </Box>
//       </WelcomeCard>

//       {/* 2. Motivational Quote */}
//       <QuoteBox mb={3}>
//         <Typography variant="body2" fontWeight={600}>
//           "Success is the sum of small efforts, repeated day in and day out."
//         </Typography>
//         <Typography variant="caption" display="block" mt={0.5}>
//           — Robert Collier
//         </Typography>
//       </QuoteBox>

//       {/* 4. Material Statistics Section (FULL WIDTH) */}
//       <Box mb={3}>
//         <InfoCard elevation={0}>
//           <MaterialStatsCard />
//         </InfoCard>
//       </Box>

//       {/* 5. Main Content Row (Recent Materials & Notices) */}
//       <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
//         {/* Left: Recent Materials */}
//         <Box flex={2}>
//           <InfoCard elevation={0}>
//             <RecentlyAddedMaterials
//               onNavigateToMaterial={handleNavigateToMaterial}
//               maxItems={5}
//               showHeader={false}
//               containerStyles={{ padding: 0 }}
//             />
//           </InfoCard>
//         </Box>

//         {/* Right: Notices */}
//         <Box flex={1}>
//           <InfoCard elevation={0}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//               <Typography variant="h6" fontWeight={700}>Notice Board</Typography>
//               <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
//                 VIEW ALL
//               </Typography>
//             </Box>

//             {notices.length === 0 ? (
//               <Typography variant="body2" color="text.secondary">No active notices.</Typography>
//             ) : (
//               notices.slice(0, 3).map((notice) => (
//                 <NoticePreview key={notice._id}>
//                   <Typography variant="subtitle2" fontWeight={600}>{notice.title || notice.heading}</Typography>
//                   <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
//                     <EventNoteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
//                     <Typography variant="caption" color="text.secondary">
//                        {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : ''}
//                     </Typography>
//                   </Stack>
//                 </NoticePreview>
//               ))
//             )}

//             <Divider sx={{ my: 2 }} />

//             {/* Institute Contact Info */}
//             <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
//               Institute Contact
//             </Typography>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Email: support@jjinstitute.com
//             </Typography>
//             <Typography variant="caption" display="block" color="text.secondary">
//               Phone: +91 98765 43210
//             </Typography>
//           </InfoCard>
//         </Box>
//       </Stack>
//     </Box>
//   );
// };

// export default StudentDashboard;



// import React from 'react';
// import { 
//   Typography, 
//   Box, 
//   Stack, 
//   Container, 
//   useTheme,
//   useMediaQuery,
//   IconButton,
//   Chip,
//   Avatar
// } from '@mui/material';

// // Icons
// import EventNoteIcon from '@mui/icons-material/EventNote';
// import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// import MenuBookIcon from '@mui/icons-material/MenuBook';
// import SupportAgentIcon from '@mui/icons-material/SupportAgent';
// import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
// import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
// import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
// import AutoStoriesIcon from '@mui/icons-material/AutoStories';
// import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// // Custom Styled Components
// import {
//   WelcomeCard, 
//   SectionContainer,
//   SectionHeader, 
//   NoticePreview,
//   CountdownCard, 
//   QuickActionButton
// } from './StudentDashboard.styles';

// // Functional Components
// import RecentlyAddedMaterials from '../Material/stats/RecentlyAddedMaterials';
// import MaterialStatsCard from '../Material/stats/MaterialStatsCard';
// import { useNavigate } from 'react-router-dom';

// const StudentDashboard: React.FC = () => {
//   const theme = useTheme();
//   // Using 'md' breakpoint: stack vertically on mobile/tablets, row on desktop
//   const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
//   const navigate = useNavigate();

//   // --- Mock Data ---
//   const student = {
//     name: "Anjali Singh",
//     currentClass: "Class 12",
//     targetExams: ["NEET"]
//   };

//   const notices = [
//     { id: 1, title: "Diwali Vacation Schedule declared", date: "15 Oct 2025", type: "Holiday" },
//     { id: 2, title: "Physics Guest Lecture by Dr. Verma", date: "12 Oct 2025", type: "Event" },
//   ];

//   const quickLinks = [
//     { label: "Pay Fees", icon: <ReceiptLongIcon />, color: "#E91E63", route: "/student/fees" },
//     { label: "Syllabus", icon: <MenuBookIcon />, color: "#2196F3", route: "/student/syllabus" },
//     { label: "Support", icon: <SupportAgentIcon />, color: "#FF9800", route: "/student/support" },
//     { label: "Library", icon: <AutoStoriesIcon />, color: "#4CAF50", route: "/student/material" },
//   ];

//   // --- Logic ---
//   const handleNavigateToMaterial = (fullPath: Array<{ id: string; heading: string }>) => {
//     navigate('/student/material', {
//       state: { navigateToPath: fullPath, shouldNavigate: true, timestamp: Date.now() }
//     });
//   };

//   const getCurrentDate = () => {
//     return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
//   };

//   return (
//     <Box sx={{ flexGrow: 1, pb: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
//       <Container maxWidth="xl" sx={{ pt: 3 }}>

//         {/* HEADER SECTION */}
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
//           <Box>
//             <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
//               {getCurrentDate()}
//             </Typography>
//             <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} color="#1a237e">
//               Student Dashboard
//             </Typography>
//           </Box>
//           <IconButton sx={{ bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
//             <NotificationsNoneIcon color="action" />
//           </IconButton>
//         </Stack>

//         {/* TOP ROW: Welcome & Countdown */}
//         {/* Uses Stack with flex-basis for responsive sizing without Grid */}
//         <Stack direction={isMobile ? 'column' : 'row'} spacing={3} mb={4}>

//           {/* Left: Welcome Card (Takes 66% width on desktop) */}
//           <Box flexBasis={isMobile ? '100%' : '66.66%'} flexGrow={1}>
//             <WelcomeCard elevation={0}>
//               <Box position="relative" zIndex={2}>
//                 <Chip 
//                   label="Academic Year 2025-26" 
//                   size="small" 
//                   sx={{ 
//                     bgcolor: 'rgba(255,255,255,0.15)', 
//                     color: 'white', 
//                     mb: 2, 
//                     fontWeight: 600, 
//                     border: '1px solid rgba(255,255,255,0.2)' 
//                   }} 
//                 />
//                 <Typography variant="h4" fontWeight={800} sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//                   Hello, {student.name.split(' ')[0]}! 👋
//                 </Typography>
//                 <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: '600px', lineHeight: 1.6, fontSize: '1.05rem' }}>
//                   You are preparing for <strong>{student.targetExams[0]}</strong>. Consistency is the key to cracking it. Keep your momentum going!
//                 </Typography>
//               </Box>
//               <EmojiObjectsIcon sx={{ 
//                 position: 'absolute', right: 30, bottom: -20, 
//                 fontSize: 180, opacity: 0.15, color: 'white', transform: 'rotate(-20deg)' 
//               }} />
//             </WelcomeCard>
//           </Box>

//           {/* Right: Countdown (Takes 33% width on desktop) */}
//           <Box flexBasis={isMobile ? '100%' : '33.33%'} flexGrow={1}>
//             <CountdownCard elevation={0}>
//               <Box position="relative" zIndex={2}>
//                 <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
//                   142
//                 </Typography>
//                 <Typography variant="h6" fontWeight={600} sx={{ mb: 2, opacity: 0.9 }}>Days Remaining</Typography>
//                 <Chip 
//                   label={`Target: ${student.targetExams[0]}`} 
//                   size="small" 
//                   sx={{ bgcolor: 'white', color: '#EF6C00', fontWeight: 800 }} 
//                 />
//               </Box>
//               <HourglassEmptyIcon sx={{ position: 'absolute', right: -20, bottom: -30, fontSize: 160, opacity: 0.2, color: 'white' }} />
//             </CountdownCard>
//           </Box>
//         </Stack>

//         {/* MIDDLE SECTION: Stats & Quick Actions */}
//         <Stack direction={isMobile ? 'column' : 'row'} spacing={3} mb={4}>

//           {/* Material Stats (Takes 66%) */}
//           <Box flexBasis={isMobile ? '100%' : '66.66%'} flexGrow={1}>
//              <SectionContainer elevation={0}>
//                 <SectionHeader bgcolor="#e3f2fd"> {/* Light Blue Header */}
//                   <Stack direction="row" alignItems="center" spacing={1.5}>
//                     <Avatar sx={{ bgcolor: '#2196F3', width: 32, height: 32 }}>
//                       <TrendingUpIcon fontSize="small" />
//                     </Avatar>
//                     <Box>
//                       <Typography variant="h6" fontWeight={700} color="#0d47a1">Study Analytics</Typography>
//                       <Typography variant="caption" color="text.secondary">Your learning progress overview</Typography>
//                     </Box>
//                   </Stack>
//                 </SectionHeader>

//                 {/* Padding Wrapper to contain the Stats Card */}
//                 <Box p={3}>
//                    <MaterialStatsCard /> 
//                 </Box>
//              </SectionContainer>
//           </Box>

//           {/* Quick Actions (Takes 33%) */}
//           <Box flexBasis={isMobile ? '100%' : '33.33%'} flexGrow={1} display="flex" flexDirection="column">
//              <Typography variant="h6" fontWeight={700} color="text.primary" mb={2}>Quick Access</Typography>

//              {/* Using CSS Grid for the 2x2 Layout within the flex item */}
//              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} flexGrow={1}>
//                {quickLinks.map((link, index) => (
//                  <QuickActionButton key={index} accentColor={link.color}>
//                     {link.icon}
//                     <Typography variant="body2" fontWeight={700}>{link.label}</Typography>
//                  </QuickActionButton>
//                ))}
//              </Box>
//           </Box>
//         </Stack>

//         {/* BOTTOM SECTION: Library & Notices */}
//         <Stack direction={isMobile ? 'column' : 'row'} spacing={3}>

//           {/* Recent Materials (Takes 70%) */}
//           <Box flexBasis={isMobile ? '100%' : '70%'} flexGrow={1}>
//             <SectionContainer elevation={0} sx={{ minHeight: '400px' }}>
//               <SectionHeader bgcolor="#f3e5f5"> {/* Light Purple Header */}
//                 <Stack direction="row" alignItems="center" spacing={1.5}>
//                   <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
//                     <MenuBookIcon fontSize="small" />
//                   </Avatar>
//                   <Box>
//                     <Typography variant="h6" fontWeight={700} color="#4a148c">Recently Added Materials</Typography>
//                     <Typography variant="caption" color="text.secondary">Latest uploads by your teachers</Typography>
//                   </Box>
//                 </Stack>
//                 <Typography 
//                   variant="caption" 
//                   color="secondary" 
//                   fontWeight={700} 
//                   sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
//                   onClick={() => navigate('/student/material')}
//                 >
//                   VIEW LIBRARY
//                 </Typography>
//               </SectionHeader>

//               <Box p={2}>
//                 <RecentlyAddedMaterials
//                   onNavigateToMaterial={handleNavigateToMaterial}
//                   maxItems={5}
//                   showHeader={false}
//                   containerStyles={{ padding: 0 }}
//                 />
//               </Box>
//             </SectionContainer>
//           </Box>

//           {/* Notices (Takes 30%) */}
//           <Box flexBasis={isMobile ? '100%' : '30%'} flexGrow={1}>
//             <SectionContainer elevation={0} sx={{ height: 'auto' }}>
//               <SectionHeader bgcolor="#fff3e0"> {/* Light Orange Header */}
//                 <Stack direction="row" alignItems="center" spacing={1.5}>
//                   <Avatar sx={{ bgcolor: '#ed6c02', width: 32, height: 32 }}>
//                     <EventNoteIcon fontSize="small" />
//                   </Avatar>
//                   <Typography variant="h6" fontWeight={700} color="#e65100">Notice Board</Typography>
//                 </Stack>
//               </SectionHeader>

//               <Box p={2}>
//                 <Stack spacing={2}>
//                   {notices.map((notice) => (
//                     <NoticePreview key={notice.id}>
//                       <Stack direction="row" justifyContent="space-between" mb={1}>
//                         <Chip 
//                           label={notice.type} 
//                           size="small" 
//                           sx={{ 
//                             height: 20, 
//                             fontSize: '0.65rem', 
//                             fontWeight: 700,
//                             borderRadius: '4px',
//                             bgcolor: notice.type === 'Holiday' ? '#ffebee' : '#e3f2fd',
//                             color: notice.type === 'Holiday' ? '#c62828' : '#1565c0'
//                           }} 
//                         />
//                         <Typography variant="caption" color="text.secondary" fontWeight={600}>{notice.date}</Typography>
//                       </Stack>
//                       <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.3 }}>
//                         {notice.title}
//                       </Typography>
//                     </NoticePreview>
//                   ))}
//                 </Stack>
//               </Box>
//             </SectionContainer>
//           </Box>

//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default StudentDashboard;


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
import {getStudentNotices, getStudent } from '../../../api/apiFunctions';
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
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>

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
                  { label: 'support@jjinstitute.com', href: 'mailto:support@jjinstitute.com', color: 'primary.main' },
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