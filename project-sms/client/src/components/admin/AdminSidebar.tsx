



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
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { getAdminProfile, validateToken, type OrganizationInfo } from '../../api/apiFunctions';
import { LogoContainer, drawerPaperStyles } from './AdminSidebar.styles';
import LogoImg from '../../assets/sms-logo.png';

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
  const [organization, setOrganization] = React.useState<OrganizationInfo | null>(null);
  const [logoFailed, setLogoFailed] = React.useState(false);

  // React.useEffect(() => {
  //   const fetchProfile = async () => {
  //     const res = await getAdminProfile();
  //     if (res.success && res.admin) {
  //       const adminData = res.admin as { role: string; permissions?: Record<string, boolean> };
  //       setRole(adminData.role);
  //       setPermissions(adminData.permissions || {});
  //     }
  //   };
  //   fetchProfile();
  // }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const res = await validateToken();
      if (res.isValid) {
        setRole(res.role || '');
        setPermissions(res.user?.permissions || {});
        setOrganization(res.organization ?? null);
      }
    };
    fetchProfile();
  }, []);



  const logoSrc = organization?.logoUrl && !logoFailed ? organization.logoUrl : LogoImg;
  const orgName = organization?.name || 'Coaching';

  console.log(orgName)

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', permissionKey: null },
    { text: 'Students Directory', icon: <PeopleIcon />, path: '/admin/students', permissionKey: 'students' },
    { text: 'Streams Manager', icon: <SchoolIcon />, path: '/admin/streams', permissionKey: 'streams' },
    { text: 'Target Exams Manager', icon: <QuizIcon />, path: '/admin/target-exams', permissionKey: 'targetExams' },
    { text: 'Subjects Manager', icon: <LibraryBooksIcon />, path: '/admin/subjects', permissionKey: 'subjects' },
    { text: 'Session Manager', icon: <SettingsSuggestIcon />, path: '/admin/session', permissionKey: 'session' },
    { text: 'Upload Material', icon: <UploadFileIcon />, path: '/admin/upload', permissionKey: 'upload' },
    { text: 'Add Notice', icon: <PushPinIcon />, path: '/admin/notice', permissionKey: 'notice' },
    { text: 'Attendance', icon: <EditCalendarIcon />, path: '/admin/attendance', permissionKey: 'attendance' },
    { text: 'Marks & Exams', icon: <AssessmentIcon />, path: '/admin/marks', permissionKey: 'marks' },
    { text: 'Landing Page Content', icon: <LanguageIcon />, path: '/admin/landing-page', permissionKey: 'landingPage' },
  ];

  if (role === 'superadmin') {
    allMenuItems.push({
      text: 'Billing & Plan', icon: <ReceiptLongIcon />, path: '/admin/billing', permissionKey: null,
    });
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
        <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
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
            <img
              src={logoSrc}
              alt={orgName}
              onError={() => setLogoFailed(true)}
              style={{ height: 30, width: 30, objectFit: 'contain' }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            lineHeight={1.2}
            title={orgName}
            sx={{
              color: 'white',
              minWidth: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {orgName}
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