// import React from 'react';
// import { Typography, IconButton, Avatar, Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// // import {Badge} from '@mui/material';;
// //import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
// import LogoutIcon from '@mui/icons-material/Logout';
// import { StyledAppBar, HeaderContent, ProfileSection } from './AdminHeader.styles';
// import { useLocation, useNavigate } from 'react-router-dom';

// interface AdminHeaderProps {
//   handleDrawerToggle: () => void;
// }

// const AdminHeader: React.FC<AdminHeaderProps> = ({ handleDrawerToggle }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [logoutOpen, setLogoutOpen] = React.useState(false);
//   const headName = location.pathname.split('/')[2] ? location.pathname.split('/')[2].toLocaleUpperCase() : 'DASHBOARD';


//   return (
//     <StyledAppBar position="sticky" elevation={0}>
//       <HeaderContent>
//         <Box display="flex" alignItems="center">
//           {/* MOBILE TOGGLE BUTTON */}
//           <IconButton
//             color="inherit"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 2, display: { sm: 'none' } }} // Hide on Desktop (sm and up)
//           >
//             <MenuIcon />
//           </IconButton>

//           <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//             {headName}
//           </Typography>
//         </Box>

//         <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
//           <IconButton color="inherit">
//             {/* <Badge badgeContent={4} color="error">
//               <NotificationsNoneIcon />
//             </Badge> */}
//           </IconButton>
//           <Button
//             variant="outlined"
//             color="error"
//             size="small"
//             startIcon={<LogoutIcon />}
//             onClick={() => setLogoutOpen(true)}
//             sx={{
//               borderRadius: 2,
//               textTransform: 'none',
//               borderColor: '#ffcdd2',
//               color: '#d32f2f',
//               '&:hover': {
//                 borderColor: '#d32f2f',
//                 bgcolor: '#ffebee',
//               },
//             }}
//           >
//             Logout
//           </Button>

//           <Dialog
//             open={logoutOpen}
//             onClose={() => setLogoutOpen(false)}
//             PaperProps={{
//               sx: { borderRadius: 3, p: 1 }
//             }}
//           >
//             <DialogTitle sx={{ fontWeight: 700, color: '#0a2540' }}>Confirm Logout</DialogTitle>
//             <DialogContent>
//               <DialogContentText sx={{ color: '#475569' }}>
//                 Are you sure you want to log out of the admin dashboard?
//               </DialogContentText>
//             </DialogContent>
//             <DialogActions sx={{ pb: 2, pr: 3 }}>
//               <Button onClick={() => setLogoutOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={() => {
//                   window.localStorage.removeItem('authToken');
//                   navigate('/login');
//                 }}
//                 sx={{
//                   bgcolor: '#d32f2f',
//                   fontWeight: 600,
//                   '&:hover': { bgcolor: '#b71c1c' }
//                 }}
//               >
//                 Logout
//               </Button>
//             </DialogActions>
//           </Dialog>
//           <ProfileSection>
//             {/* Hide text on mobile to save space */}
//             <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
//               <Typography variant="subtitle2" fontWeight="700">Admin User</Typography>
//               <Typography variant="caption" color="text.secondary">JJ Institue Of Science</Typography>
//             </Box>


//             <Avatar
//               sx={{
//                 bgcolor: 'secondary.main',
//                 color: 'secondary.contrastText',
//                 width: { xs: 32, sm: 40 },
//                 height: { xs: 32, sm: 40 },
//                 fontSize: { xs: '0.9rem', sm: '1.2rem' }
//               }}
//             >
//               JJ
//             </Avatar>
//           </ProfileSection>
//         </Box>
//       </HeaderContent>
//     </StyledAppBar>
//   );
// };

// export default AdminHeader;


// AdminHeader.tsx
import React from 'react';
import {
  Typography, IconButton, Avatar, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { StyledAppBar, HeaderContent, ProfileSection } from './AdminHeader.styles';
import { useLocation, useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  handleDrawerToggle: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const headName = location.pathname.split('/')[2]
    ? location.pathname.split('/')[2].toLocaleUpperCase()
    : 'DASHBOARD';

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <HeaderContent>
        {/* ── Left: hamburger + page title ── */}
        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' }, flexShrink: 0 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
              minWidth: 0,
            }}
          >
            {headName}
          </Typography>
        </Box>

        {/* ── Right: logout + profile ── */}
        <Box display="flex" alignItems="center" gap={{ xs: 0.75, sm: 1.5 }} sx={{ flexShrink: 0 }}>

          {/* Logout — icon only on mobile, full button on sm+ */}
          {isMobile ? (
            <IconButton
              size="small"
              onClick={() => setLogoutOpen(true)}
              sx={{ color: '#d32f2f' }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          ) : (
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
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: '#d32f2f', bgcolor: '#ffebee' },
              }}
            >
              Logout
            </Button>
          )}

          {/* Profile */}
          <ProfileSection>
            <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                JJ Institute Of Science
              </Typography>
            </Box>

            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                width: { xs: 30, sm: 38 },
                height: { xs: 30, sm: 38 },
                fontSize: { xs: '0.8rem', sm: '1rem' },
                flexShrink: 0,
              }}
            >
              JJ
            </Avatar>
          </ProfileSection>
        </Box>
      </HeaderContent>

      {/* Logout Dialog */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0a2540' }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569' }}>
            Are you sure you want to log out of the admin dashboard?
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
            sx={{ bgcolor: '#d32f2f', fontWeight: 600, '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </StyledAppBar>
  );
};

export default AdminHeader;