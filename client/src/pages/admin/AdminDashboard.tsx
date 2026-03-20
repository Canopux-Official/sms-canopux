// import React, { useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { CssBaseline, Box } from '@mui/material';
// import { LayoutRoot, MainContent, ContentWrapper } from './AdminDashboard.styles';

// // Internal Components
// import AdminSidebar from '../../components/admin/AdminSidebar';
// import AdminHeader from '../../components/admin/AdminHeader';

// // Page Components
// import DashboardHome from '../../components/admin/DashboardHome';
// import StudentsPage from '../../components/admin/StudentPage';
// import SubjectsPage from './../../components/admin/SubjectPage';
// import SessionPage from '../../components/admin/SessionPage';
// import ShowClass from '../../components/admin/Material/showclass/ShowClass';

// // NEW COMPONENTS
// import StreamPage from '../../components/admin/StreamPage';
// import TargetExamPage from '../../components/admin/TargetExamPage';
// import AdminNoticePage from './AdminNotice';
// import AttendanceManagement from '../../components/admin/Attendance/attendance/AttendanceManagement';
// import AdminAccessControl from './AdminAccessControl';
// import AdminLandingPage from './AdminLandingPage';

// const DRAWER_WIDTH = 260;

// const AdminDashboard: React.FC = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   return (
//     <LayoutRoot>
//       <CssBaseline />

//       {/* Sidebar Wrapper */}
//       <Box
//         component="nav"
//         sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
//         aria-label="mailbox folders"
//       >
//         <AdminSidebar
//           mobileOpen={mobileOpen}
//           handleDrawerToggle={handleDrawerToggle}
//         />
//       </Box>

//       {/* Main Content Area */}
//       <MainContent>
//         <AdminHeader handleDrawerToggle={handleDrawerToggle} />

//         <ContentWrapper>
//           <Routes>
//             <Route path="/" element={<DashboardHome />} />
//             <Route path="students" element={<StudentsPage />} />
//             <Route path="subjects" element={<SubjectsPage />} />
//             <Route path="session" element={<SessionPage />} />
//             <Route path="upload" element={<ShowClass />} />
//             <Route path="notice" element={<AdminNoticePage />} />
//             <Route path="attendance" element={<AttendanceManagement />} />

//             {/* NEW ROUTES */}
//             <Route path="streams" element={<StreamPage />} />
//             <Route path="target-exams" element={<TargetExamPage />} />
//             <Route path="landing-page" element={<AdminLandingPage />} />
//             <Route path="control" element={<AdminAccessControl />} />

//             <Route path="*" element={<Navigate to="/admin" replace />} />
//           </Routes>
//         </ContentWrapper>
//       </MainContent>
//     </LayoutRoot>
//   );
// };

// export default AdminDashboard;

// AdminDashboard.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LayoutRoot, MainContent, ContentWrapper } from './AdminDashboard.styles';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

import DashboardHome from '../../components/admin/DashboardHome';
import StudentsPage from '../../components/admin/StudentPage';
import SubjectsPage from './../../components/admin/SubjectPage';
import SessionPage from '../../components/admin/SessionPage';
import ShowClass from '../../components/admin/Material/showclass/ShowClass';
import StreamPage from '../../components/admin/StreamPage';
import TargetExamPage from '../../components/admin/TargetExamPage';
import AdminNoticePage from './AdminNotice';
import AttendanceManagement from '../../components/admin/Attendance/attendance/AttendanceManagement';
import AdminAccessControl from './AdminAccessControl';
import AdminLandingPage from './AdminLandingPage';

const AdminDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((o) => !o);

  return (
    <LayoutRoot>
      <CssBaseline />

      {/* Sidebar — no extra Box wrapper, AdminSidebar handles its own nav Box */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <MainContent>
        <AdminHeader handleDrawerToggle={handleDrawerToggle} />
        <ContentWrapper>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="session" element={<SessionPage />} />
            <Route path="upload" element={<ShowClass />} />
            <Route path="notice" element={<AdminNoticePage />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="streams" element={<StreamPage />} />
            <Route path="target-exams" element={<TargetExamPage />} />
            <Route path="landing-page" element={<AdminLandingPage />} />
            <Route path="control" element={<AdminAccessControl />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </ContentWrapper>
      </MainContent>
    </LayoutRoot>
  );
};

export default AdminDashboard;