// import { useState, useEffect, type ReactNode } from 'react'; // Import ReactNode
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import theme from './theme/theme';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false, // Prevents background refetching which might confuse users
//       retry: 1, // Only retry once on failure
//     },
//   },
// });

// // Import Pages
// import LandingPage from './pages/landing/LandingPage';
// import CoursesPage from './pages/courses/CoursesPage';
// import LoginPage from './pages/auth/LoginPage';

// // Import Dashboard Layouts
// import AdminDashboard from './pages/admin/AdminDashboard';

// // Import API check
// import { validateToken } from './api/apiFunctions';
// import StudentPage from './pages/student/StudentPage';

// // 👇 Define the props interface
// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// /**
//  * 🛡️ Protected Route Component (Async)
//  * Verifies token with backend before allowing access.
//  */
// // 👇 Apply the interface here
// const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Explicit typing for state
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem('authToken');

//       if (!token) {
//         setIsAuthenticated(false);
//         return;
//       }

//       // Verify with backend
//       const isValid = await validateToken();
//       if (!isValid) {
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('authEmail');
//         setIsAuthenticated(false);
//       } else {
//         setIsAuthenticated(true);
//       }
//     };

//     checkAuth();
//   }, [location.pathname]);

//   // 1. Loading State
//   if (isAuthenticated === null) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress color="secondary" />
//       </Box>
//     );
//   }

//   // 2. Unauthenticated State -> Redirect
//   if (isAuthenticated === false) {
//     return <Navigate to="/login" replace />;
//   }

//   // 3. Authenticated -> Render Dashboard
//   return <>{children}</>;
// };

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Router>
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/courses" element={<CoursesPage />} />
//             <Route path="/login" element={<LoginPage />} />

//             {/* 🔒 Protected Routes */}
//             <Route
//               path="/admin/*"
//               element={
//                 <ProtectedRoute>
//                   <AdminDashboard />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/student/*"
//               element={
//                 <ProtectedRoute>
//                   <StudentPage />
//                 </ProtectedRoute>
//               }
//             />

//             {/* 404 Handler */}
//             <Route path="*" element={<h1 style={{ textAlign: 'center', marginTop: '50px' }}>404: Page Not Found</h1>} />
//           </Routes>
//         </Router>
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;


import { useState, useEffect, type ReactNode } from 'react'; // Import ReactNode
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import theme from './theme/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents background refetching which might confuse users
      retry: 1, // Only retry once on failure
    },
  },
});

// Import Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Import Dashboard Layouts
import AdminDashboard from './pages/admin/AdminDashboard';

// Import API check
import { validateToken } from './api/apiFunctions';
import StudentPage from './pages/student/StudentPage';
import SplashScreen from './pages/landing/SplashScreen';

// 👇 Define the props interface
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 🛡️ Protected Route Component (Async)
 * Verifies token with backend before allowing access.
 */
// 👇 Apply the interface here
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Explicit typing for state
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Verify with backend
      const { isValid } = await validateToken();
      if (!isValid) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authEmail');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // 1. Loading State
  if (isAuthenticated === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // 2. Unauthenticated State -> Redirect
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authenticated -> Render Dashboard
  return <>{children}</>;
};

/**
 * 🎨 App Layout Component
 * Wraps protected routes with ThemeProvider
 */
function AppLayout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes (Non-LandingPage) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🔒 Protected Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <StudentPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Handler */}
        <Route path="*" element={<h1 style={{ textAlign: 'center', marginTop: '50px' }}>404: Page Not Found</h1>} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <SplashScreen>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              {/* 🌐 LandingPage Outside ThemeProvider (Has its own theme) */}
              <Route path="/" element={<LandingPage />} />

              {/* All other routes with ThemeProvider */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </SplashScreen>
    </HelmetProvider>
  );
}

export default App;