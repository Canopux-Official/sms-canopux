import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

// 1. Import Theme (Adjust path to where theme.ts is located)
import theme from '../../theme/theme'; 

// 2. Import Layout
import StudentLayout from '../../components/student/StudentLayout';

// 3. Import Feature Components
import StudentDashboard from '../../components/student/Dashboard/StudentDashboard';
import StudentProfile from '../../components/student/Profile/StudentProfile';
import NoticeBoardPage from '../../components/student/Notices/NoticeBoardPage';
import StudentFolderStructure from '../../components/student/Material/showFolder/ShowFolder';
import StudentAttendance from '../../components/student/Attendance/components/StudentAttendance';

const StudentPage: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<StudentLayout />}>
          
          {/* Default Route: Redirect to Dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Feature Routes */}
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="notices" element={<NoticeBoardPage />} />
          <Route path="material" element={<StudentFolderStructure />} />
          <Route path="attendance" element={<StudentAttendance />} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default StudentPage;