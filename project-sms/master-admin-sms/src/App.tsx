import type { ReactNode } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme/theme';
import { PlatformAuthProvider, usePlatformAuth } from './context/PlatformAuthContext';
import Login from './pages/Login';
import OrganizationList from './pages/OrganizationList';
import CreateOrganization from './pages/CreateOrganization';
import OrganizationDetail from './pages/OrganizationDetail';
import PlansPage from './pages/PlansPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePlatformAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = usePlatformAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/organizations" replace /> : <Login />}
      />
      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <OrganizationList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/new"
        element={
          <ProtectedRoute>
            <CreateOrganization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/:id"
        element={
          <ProtectedRoute>
            <OrganizationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <PlansPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/organizations" replace />} />
      <Route
        path="*"
        element={
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <h1>404 — Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PlatformAuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PlatformAuthProvider>
    </ThemeProvider>
  );
}

export default App;