import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Toolbar, Avatar,
  Stack, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; // Added for Materials
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { RootContainer, StyledDrawer, StyledAppBar, MainContent, LogoSection } from './StudentLayout.styles';
import LogoImg from '../../assets/logo.jpeg';
import { getStudentProfile } from '../../api/apiFunctions';

interface StudentData {
  name?: string;
  targetExams?: { name?: string }[];
  currentClass?: string;
  stream?: { name?: string };
}

const StudentLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [student, setStudent] = useState<StudentData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/student/dashboard' },
    { text: 'My Profile', icon: <PersonIcon />, path: '/student/profile' },
    { text: 'Study Materials', icon: <LibraryBooksIcon />, path: '/student/material' },
    { text: 'Notice Board', icon: <NotificationsIcon />, path: '/student/notices' },
    { text: 'Attendance', icon: <CalendarMonthIcon />, path: '/student/attendance' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes] = await Promise.all([
          getStudentProfile()
        ]);

        if (profileRes.success && profileRes.data) {
          // Backend returns the student document directly (not wrapped in { student })
          setStudent(profileRes.data as StudentData);
        }
      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    };

    fetchData();
  }, []);

  // console.log(student)

  const studentName = student?.name || "Student";

  const drawerContent = (
    <>
      <LogoSection>
        <Avatar src={LogoImg} sx={{ bgcolor: 'white', p: 0.5, width: 40, height: 40 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="white">JJ INSTITUTE</Typography>
          <Typography variant="caption" color="#b4acac">Student Portal</Typography>
        </Box>
      </LogoSection>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderLeft: isActive ? '4px solid #4caf50' : '4px solid transparent', // Green accent
                  bgcolor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#4caf50' : 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <RootContainer>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Profile Preview */}
            <Box display="flex" alignItems="center" gap={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={600}>{studentName}</Typography>
                <Typography variant="caption" color="text.secondary">Class {student?.currentClass || "0"} - {student?.stream?.name || 'General'}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 36, height: 36, fontSize: '0.9rem' }}>{student?.name ? student.name.charAt(0).toUpperCase() : 'S'}</Avatar>
            </Box>

            {/* Logout Button (Directly in Navbar) */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={() => setLogoutOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: '#ffcdd2',
                color: '#d32f2f',
                '&:hover': {
                  borderColor: '#d32f2f',
                  bgcolor: '#ffebee',
                },
              }}
            >
              Logout
            </Button>

            <Dialog
              open={logoutOpen}
              onClose={() => setLogoutOpen(false)}
              PaperProps={{
                sx: { borderRadius: 3, p: 1 }
              }}
            >
              <DialogTitle sx={{ fontWeight: 700, color: '#0a2540' }}>Confirm Logout</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: '#475569' }}>
                  Are you sure you want to log out of the student portal?
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ pb: 2, pr: 3 }}>
                <Button onClick={() => setLogoutOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    window.localStorage.removeItem('authToken');
                    navigate('/login');
                  }}
                  sx={{
                    bgcolor: '#d32f2f',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#b71c1c' }
                  }}
                >
                  Logout
                </Button>
              </DialogActions>
            </Dialog>

          </Stack>
        </Toolbar>
      </StyledAppBar>

      <Box component="nav">
        <StyledDrawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' } }}>
          {drawerContent}
        </StyledDrawer>
        <StyledDrawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' } }} open>
          {drawerContent}
        </StyledDrawer>
      </Box>

      <MainContent as="main">
        <Outlet />
      </MainContent>
    </RootContainer>
  );
};

export default StudentLayout;