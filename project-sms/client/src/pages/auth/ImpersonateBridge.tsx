// project-sms/client/src/pages/auth/ImpersonateBridge.tsx
//
// Landing spot for the "Login as Superadmin" link opened from the Canopux Admin App
// (master-admin-sms). The platform admin's login-as call issues a normal institute
// superadmin JWT (organizationId + role='superadmin' already baked in) and opens
// /admin/impersonate?impersonation_token=<jwt> here. This page's only job is to move
// that token into the same localStorage key the rest of the app already reads
// (authToken), then hand off to the normal protected /admin/dashboard route — nothing
// else about the login flow changes, and verifyAuth on the server doesn't know or care
// that this token came from an impersonation session rather than a normal login.
import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

export default function ImpersonateBridge() {
  const [params] = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = params.get('impersonation_token');
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.removeItem('authEmail'); // impersonation doesn't know/need the admin's own login email
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot: write the token to localStorage (an external system), then reveal the redirect
    setReady(true);
  }, [params]);

  if (!ready) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // A fresh navigation (rather than rendering AdminDashboard directly) so ProtectedRoute's
  // own auth check mounts again and picks up the token we just stored. AdminDashboard's own
  // router treats "/admin" (not "/admin/dashboard") as its home route.
  return <Navigate to="/admin" replace />;
}