import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Avatar, Box, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Stack, Toolbar, Tooltip, Typography,
} from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LogoutIcon from '@mui/icons-material/Logout';
import { usePlatformAuth } from '../context/PlatformAuthContext';

const SIDEBAR_WIDTH = 232;

const NAV_ITEMS = [
  { label: 'Organizations', icon: <DomainIcon />, path: '/organizations', match: (p: string) => p.startsWith('/organizations') },
  { label: 'Plans', icon: <WorkspacePremiumIcon />, path: '/plans', match: (p: string) => p.startsWith('/plans') },
];

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = usePlatformAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.name || 'CA')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: '#fff',
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <Toolbar sx={{ px: 3, gap: 1.25 }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: '9px', bgcolor: 'secondary.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15,
            }}
          >
            C
          </Box>
          <Stack spacing={0} sx={{ lineHeight: 1.1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
              Canopux
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
              Platform Admin
            </Typography>
          </Stack>
        </Toolbar>

        <List sx={{ px: 1.5, mt: 1, flexGrow: 1 }}>
          {NAV_ITEMS.map((item) => {
            const selected = item.match(location.pathname);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.75)',
                  bgcolor: selected ? 'rgba(255,255,255,0.12)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontWeight: selected ? 700 : 500, fontSize: 14 }}>
                  {item.label}
                </ListItemText>
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 2 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Stack spacing={0} minWidth={0} flexGrow={1}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name || 'Platform Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }} noWrap>
              {user?.email}
            </Typography>
          </Stack>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.75)' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: { xs: 2, sm: 4 },
            py: 3,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={0.25}>
            <Typography variant="h5" fontWeight={800}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          {actions && <Stack direction="row" spacing={1.5}>{actions}</Stack>}
        </Box>
        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, flexGrow: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}