// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Drawer, Box, Typography } from '@mui/material';

// // Icons
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import PeopleIcon from '@mui/icons-material/People';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
// import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
// import UploadFileIcon from '@mui/icons-material/UploadFile';
// import SchoolIcon from '@mui/icons-material/School'; // For Streams
// import QuizIcon from '@mui/icons-material/Quiz';     // For Target Exams
// import EditCalendarIcon from '@mui/icons-material/EditCalendar';
// import PushPinIcon from '@mui/icons-material/PushPin';
// import VpnKeyIcon from '@mui/icons-material/VpnKey'; // For Access Control
// import LanguageIcon from '@mui/icons-material/Language'; // For Landing Page
// import { getAdminProfile } from '../../api/apiFunctions';

// import { LogoContainer, drawerPaperStyles } from './AdminSidebar.styles';
// import LogoImg from '../../assets/logo.jpeg';

// interface AdminSidebarProps {
//   mobileOpen: boolean;
//   handleDrawerToggle: () => void;
// }

// const DRAWER_WIDTH = 260;

// const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [role, setRole] = React.useState<string>('');
//   const [permissions, setPermissions] = React.useState<Record<string, boolean> | null>(null);

//   React.useEffect(() => {
//     const fetchProfile = async () => {
//       const res = await getAdminProfile();
//       if (res.success && res.admin) {
//         const adminData = res.admin as { role: string; permissions?: Record<string, boolean> };
//         setRole(adminData.role);
//         setPermissions(adminData.permissions || {});
//       }
//     };
//     fetchProfile();
//   }, []);

//   const allMenuItems = [
//     { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', permissionKey: null },
//     { text: 'Students Directory', icon: <PeopleIcon />, path: '/admin/students', permissionKey: 'students' },

//     // Academic Configuration Group
//     { text: 'Streams Manager', icon: <SchoolIcon />, path: '/admin/streams', permissionKey: 'streams' },
//     { text: 'Target Exams Manager', icon: <QuizIcon />, path: '/admin/target-exams', permissionKey: 'targetExams' },
//     { text: 'Subjects Manager', icon: <LibraryBooksIcon />, path: '/admin/subjects', permissionKey: 'subjects' },

//     // Management Group
//     { text: 'Session Manager', icon: <SettingsSuggestIcon />, path: '/admin/session', permissionKey: 'session' },
//     { text: 'Upload Material', icon: <UploadFileIcon />, path: '/admin/upload', permissionKey: 'upload' },
//     { text: 'Add Notice', icon: <PushPinIcon />, path: '/admin/notice', permissionKey: 'notice' },

//     { text: 'Attendance', icon: <EditCalendarIcon />, path: '/admin/attendance', permissionKey: 'attendance' },
//     { text: 'Landing Page Content', icon: <LanguageIcon />, path: '/admin/landing-page', permissionKey: 'landingPage' },
//   ];

//   if (role === 'superadmin') {
//     allMenuItems.push({ text: 'Admin Access Control', icon: <VpnKeyIcon />, path: '/admin/control', permissionKey: null });
//   }

//   const menuItems = allMenuItems.filter(item => {
//     if (role === 'superadmin') return true;
//     if (!item.permissionKey) return true; // Always show things like Dashboard
//     return permissions && permissions[item.permissionKey] === true;
//   });

//   // Common content for both drawers
//   const drawerContent = (
//     <>
//       <LogoContainer>
//         <Box display="flex" alignItems="center" gap={2}>
//           {/* Logo with Round White Background */}
//           <Box
//             sx={{
//               backgroundColor: '#FFFFFF',
//               borderRadius: '50%',
//               padding: '8px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               boxShadow: '0 4px 12px rgba(6, 100, 102, 0.15)',
//               width: '48px',
//               height: '48px',
//             }}
//           >
//             <img
//               src={LogoImg}
//               alt="JJ Institute"
//               style={{
//                 height: '32px',
//                 width: '32px',
//                 objectFit: 'contain'
//               }}
//             />
//           </Box>

//           {/* Title */}
//           <Typography
//             variant="subtitle1"
//             fontWeight={800}
//             lineHeight={1.2}
//             sx={{
//               color: 'white',
//             }}
//           >
//             JJ INSTITUTE <br />
//             <span style={{
//               fontSize: '0.75rem',
//               fontWeight: 500,
//               color: '#b4acacff',
//               letterSpacing: '0.5px'
//             }}>
//               OF SCIENCE
//             </span>
//           </Typography>
//         </Box>
//       </LogoContainer>

//       <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

//       <List>
//         {menuItems.map((item) => {
//           const isActive = location.pathname === item.path;
//           return (
//             <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
//               <ListItemButton
//                 onClick={() => {
//                   navigate(item.path);
//                   if (mobileOpen) handleDrawerToggle();
//                 }}
//                 sx={{
//                   minHeight: 56,
//                   px: 3,
//                   borderLeft: isActive ? `4px solid #FFD700` : '4px solid transparent',
//                   backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
//                   '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
//                 }}
//               >
//                 <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center', color: isActive ? '#FFD700' : '#ffffff' }}>
//                   {item.icon}
//                 </ListItemIcon>
//                 <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
//               </ListItemButton>
//             </ListItem>
//           );
//         })}
//       </List>
//     </>
//   );

//   return (
//     <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 }}}>

//       {/* 1. MOBILE DRAWER (Temporary) */}
//       <Drawer
//         variant="temporary"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{ keepMounted: true , style: { zIndex: 1200 }}} // Better open performance on mobile.
//         sx={{
//           display: { xs: 'block', sm: 'none' },
//           '& .MuiDrawer-paper': {
//             boxSizing: 'border-box',
//             width: DRAWER_WIDTH,
//             ...drawerPaperStyles
//           },
//           zIndex: 1200
//         }}
//       >
//         {drawerContent}
//       </Drawer>

//       {/* 2. DESKTOP DRAWER (Permanent) */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           display: { xs: 'none', sm: 'block' },
//           '& .MuiDrawer-paper': {
//             boxSizing: 'border-box',
//             width: DRAWER_WIDTH,
//             ...drawerPaperStyles
//           }
//         }}
//         open
//       >
//         {drawerContent}
//       </Drawer>
//     </Box>
//   );
// };

// export default AdminSidebar;


// AdminSidebar.tsx — clean responsive version, close to original
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Drawer, Box, Typography,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import PushPinIcon from '@mui/icons-material/PushPin';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LanguageIcon from '@mui/icons-material/Language';

import { getAdminProfile } from '../../api/apiFunctions';
import { LogoContainer, drawerPaperStyles } from './AdminSidebar.styles';
import LogoImg from '../../assets/logo.jpeg';

interface AdminSidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

// Single source of truth — AdminDashboard.tsx no longer needs its own copy
export const DRAWER_WIDTH = 220;

const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = React.useState('');
  const [permissions, setPermissions] = React.useState<Record<string, boolean> | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const res = await getAdminProfile();
      if (res.success && res.admin) {
        const adminData = res.admin as { role: string; permissions?: Record<string, boolean> };
        setRole(adminData.role);
        setPermissions(adminData.permissions || {});
      }
    };
    fetchProfile();
  }, []);

  const allMenuItems = [
    { text: 'Dashboard',            icon: <DashboardIcon />,      path: '/admin',              permissionKey: null },
    { text: 'Students Directory',   icon: <PeopleIcon />,         path: '/admin/students',     permissionKey: 'students' },
    { text: 'Streams Manager',      icon: <SchoolIcon />,         path: '/admin/streams',      permissionKey: 'streams' },
    { text: 'Target Exams Manager', icon: <QuizIcon />,           path: '/admin/target-exams', permissionKey: 'targetExams' },
    { text: 'Subjects Manager',     icon: <LibraryBooksIcon />,   path: '/admin/subjects',     permissionKey: 'subjects' },
    { text: 'Session Manager',      icon: <SettingsSuggestIcon />,path: '/admin/session',      permissionKey: 'session' },
    { text: 'Upload Material',      icon: <UploadFileIcon />,     path: '/admin/upload',       permissionKey: 'upload' },
    { text: 'Add Notice',           icon: <PushPinIcon />,        path: '/admin/notice',       permissionKey: 'notice' },
    { text: 'Attendance',           icon: <EditCalendarIcon />,   path: '/admin/attendance',   permissionKey: 'attendance' },
    { text: 'Landing Page Content', icon: <LanguageIcon />,       path: '/admin/landing-page', permissionKey: 'landingPage' },
  ];

  if (role === 'superadmin') {
    allMenuItems.push({
      text: 'Admin Access Control', icon: <VpnKeyIcon />, path: '/admin/control', permissionKey: null,
    });
  }

  const menuItems = allMenuItems.filter((item) => {
    if (role === 'superadmin') return true;
    if (!item.permissionKey) return true;
    return permissions?.[item.permissionKey] === true;
  });

  const drawerContent = (
    <>
      <LogoContainer>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            padding: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6,100,102,0.15)',
            width: 44,
            height: 44,
            flexShrink: 0,
          }}>
            <img src={LogoImg} alt="JJ Institute" style={{ height: 30, width: 30, objectFit: 'contain' }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2} sx={{ color: 'white', whiteSpace: 'nowrap' }}>
            JJ INSTITUTE <br />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#b4acacff', letterSpacing: '0.5px' }}>
              OF SCIENCE
            </span>
          </Typography>
        </Box>
      </LogoContainer>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ px: 0.75, py: 0.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.25 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
                sx={{
                  minHeight: 48,
                  px: 2,
                  borderRadius: 1.5,
                  borderLeft: isActive ? '3px solid #FFD700' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(255,215,0,0.07)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: 1.5,
                  justifyContent: 'center',
                  color: isActive ? '#FFD700' : '#ffffff',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400,
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    // This Box IS the nav — AdminDashboard should NOT wrap this in another Box nav
    <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
      {/* Mobile: temporary */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true, style: { zIndex: 1200 } }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, ...drawerPaperStyles },
          zIndex: 1200,
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Tablet + Desktop: permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, ...drawerPaperStyles },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;