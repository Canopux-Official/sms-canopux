// // AttendanceManagement.tsx

// import React, { useState } from 'react';
// import {
//     Box,
//     CircularProgress,
//     Alert,
//     Snackbar,
//     useMediaQuery,
//     useTheme,
//     Container,
// } from '@mui/material';

// import { AttendanceHeader } from './AttendanceHeader';
// import { StudentList } from './StudentList';
// import { AttendanceGrid } from './AttendanceGrid';
// import { MobileAttendanceView } from './MobileAttendanceView';
// import { AttendanceFilters } from './AttendanceFilter';
// import { useAttendance } from '../hooks/useAttendance';
// import { Stack } from '@mui/system';


// const AttendanceManagement: React.FC = () => {
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//     const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
//     const [snackbar, setSnackbar] = useState<{
//         open: boolean;
//         message: string;
//         severity: 'success' | 'error' | 'info' | 'warning';
//     }>({
//         open: false,
//         message: '',
//         severity: 'success',
//     });

//     const {
//         students,
//         loading,
//         syncing,
//         error,
//         filters,
//         dayHeaders,
//         monthName,
//         isCurrentMonth,
//         dirtyCount,
//         updateFilters,
//         toggleAttendance,
//         markAllForDay,
//         syncChanges,
//     } = useAttendance();

//     const handleFilterChange = (newFilters: any) => {
//         updateFilters(newFilters);
//     };

//     const handleToggleAttendance = (studentId: string, day: number) => {
//         toggleAttendance(studentId, day);
//     };

//     const handleMarkAllPresent = (day: number) => {
//         markAllForDay(day, true);
//         setSnackbar({
//             open: true,
//             message: `Marked all students as Present for Day ${day}`,
//             severity: 'success',
//         });
//     };

//     const handleMarkAllAbsent = (day: number) => {
//         markAllForDay(day, false);
//         setSnackbar({
//             open: true,
//             message: `Marked all students as Absent for Day ${day}`,
//             severity: 'success',
//         });
//     };

//     const handleSaveChanges = async () => {
//         try {
//             const result = await syncChanges();
//             setSnackbar({
//                 open: true,
//                 message: `Successfully synced ${result?.data.validUpdates || dirtyCount} attendance records`,
//                 severity: 'success',
//             });
//         } catch (err) {
//             setSnackbar({
//                 open: true,
//                 message: error || 'Failed to sync changes',
//                 severity: 'error',
//             });
//         }
//     };

//     const handleSnackbarClose = () => {
//         setSnackbar({ ...snackbar, open: false });
//     };

//     if (loading) {
//         return (
//             <Box
//                 sx={{
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     height: '100vh',
//                 }}
//             >
//                 <CircularProgress />
//             </Box>
//         );
//     }

//     return (
//         <Container maxWidth="xl" sx={{ py: 3 }}>
//             <Box sx={{ flexGrow: 1 }}>
//                 {/* Filters */}
//                 <Box sx={{ mb: 3 }}>
//                     <AttendanceFilters
//                         filters={filters}
//                         onFilterChange={handleFilterChange}
//                     />
//                 </Box>

//                 {/* Header with Actions */}
//                 <Box sx={{ mb: 3 }}>
//                     <AttendanceHeader
//                         monthName={monthName}
//                         year={filters.year!}
//                         dirtyCount={dirtyCount}
//                         dayHeaders={dayHeaders}
//                         isCurrentMonth={isCurrentMonth}
//                         syncing={syncing}
//                         onMarkAllPresent={handleMarkAllPresent}
//                         onMarkAllAbsent={handleMarkAllAbsent}
//                         onSaveChanges={handleSaveChanges}
//                     />
//                 </Box>

//                 {/* Error Alert */}
//                 {error && (
//                     <Alert severity="error" sx={{ mb: 3 }} onClose={() => { }}>
//                         {error}
//                     </Alert>
//                 )}

//                 {/* Main Content */}
//                 {isMobile ? (
//                     // Mobile View: Single column with expandable cards
//                     <MobileAttendanceView
//                         students={students}
//                         dayHeaders={dayHeaders}
//                         month={filters.month!}
//                         year={filters.year!}
//                         onToggleAttendance={handleToggleAttendance}
//                     />
//                 ) : (
//                     // Desktop View: Split layout
//                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ height: 'calc(100vh - 350px)' }}>
//                         {/* Student List - Left Side */}
//                         <Box sx={{ width: { xs: '100%', md: '25%' }, height: { xs: 'auto', md: '100%' } }}>
//                             <Box sx={{ height: '100%' }}>
//                                 <StudentList
//                                     students={students}
//                                     selectedStudentId={selectedStudentId}
//                                     onStudentSelect={setSelectedStudentId}
//                                 />
//                             </Box>
//                         </Box>

//                         {/* Attendance Grid - Right Side */}
//                         <Box sx={{ width: { xs: '100%', md: '75%' }, height: { xs: 'auto', md: '100%' } }}>
//                             <Box sx={{ height: '100%' }}>
//                                 <AttendanceGrid
//                                     students={students}
//                                     dayHeaders={dayHeaders}
//                                     month={filters.month!}
//                                     year={filters.year!}
//                                     onToggleAttendance={handleToggleAttendance}
//                                 />
//                             </Box>
//                         </Box>
//                     </Stack>
//                 )}

//                 {/* Snackbar for notifications */}
//                 <Snackbar
//                     open={snackbar.open}
//                     autoHideDuration={4000}
//                     onClose={handleSnackbarClose}
//                     anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//                 >
//                     <Alert
//                         onClose={handleSnackbarClose}
//                         severity={snackbar.severity}
//                         sx={{ width: '100%' }}
//                     >
//                         {snackbar.message}
//                     </Alert>
//                 </Snackbar>
//             </Box>
//         </Container>
//     );
// };

// export default AttendanceManagement;


// AttendanceManagement.tsx

import React, { useState } from 'react';
import {
    Box,
    CircularProgress,
    Alert,
    Snackbar,
    useMediaQuery,
    useTheme,
    Container,
} from '@mui/material';
import { Stack } from '@mui/system';

import { AttendanceHeader } from './AttendanceHeader';
// import { StudentList } from './StudentList';
import { AttendanceGrid } from './AttendanceGrid';
import { MobileAttendanceView } from './MobileAttendanceView';
import { AttendanceFilters } from './AttendanceFilter';
import { useAttendance } from '../hooks/useAttendance';

const AttendanceManagement: React.FC = () => {
    const theme = useTheme();
    // Show mobile card view only on small phones
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    // const showStudentList = useMediaQuery('(min-width:850px)');
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const {
        students,
        loading,
        syncing,
        error,
        filters,
        dayHeaders,
        monthName,
        isCurrentMonth,
        dirtyCount,
        updateFilters,
        toggleAttendance,
        markAllForDay,
        syncChanges,
    } = useAttendance();

    const handleFilterChange = (newFilters: any) => {
        updateFilters(newFilters);
    };

    const handleToggleAttendance = (studentId: string, day: number) => {
        toggleAttendance(studentId, day);
    };

    const handleMarkAllPresent = (day: number) => {
        markAllForDay(day, true);
        setSnackbar({
            open: true,
            message: `Marked all students as Present for Day ${day}`,
            severity: 'success',
        });
    };

    const handleMarkAllAbsent = (day: number) => {
        markAllForDay(day, false);
        setSnackbar({
            open: true,
            message: `Marked all students as Absent for Day ${day}`,
            severity: 'success',
        });
    };

    const handleSaveChanges = async () => {
        try {
            const result = await syncChanges();
            setSnackbar({
                open: true,
                message: `Successfully synced ${result?.data.validUpdates || dirtyCount} attendance records`,
                severity: 'success',
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: error || 'Failed to sync changes',
                severity: 'error',
            });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: { xs: 2, sm: 2.5, md: 3 },
                px: { xs: 1.5, sm: 2, md: 3 },
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                {/* Filters */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <AttendanceFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </Box>

                {/* Header with Actions */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <AttendanceHeader
                        monthName={monthName}
                        year={filters.year!}
                        dirtyCount={dirtyCount}
                        dayHeaders={dayHeaders}
                        isCurrentMonth={isCurrentMonth}
                        syncing={syncing}
                        onMarkAllPresent={handleMarkAllPresent}
                        onMarkAllAbsent={handleMarkAllAbsent}
                        onSaveChanges={handleSaveChanges}
                    />
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => { }}>
                        {error}
                    </Alert>
                )}

                {/* Main Content */}
                {isMobile ? (
                    // Phone: stacked card view
                    <MobileAttendanceView
                        students={students}
                        dayHeaders={dayHeaders}
                        month={filters.month!}
                        year={filters.year!}
                        onToggleAttendance={handleToggleAttendance}
                    />
                ) : (
                    // Tablet + Desktop: side-by-side split layout
                    <Stack
                        direction="row"
                        spacing={{ xs: 1.5, md: 3 }}
                        sx={{
                            height: {
                                sm: 'calc(100vh - 320px)',
                                md: 'calc(100vh - 350px)',
                            },
                            minHeight: 400,
                        }}
                    >
                        {/* Student List */}
                        {/* {showStudentList && (
                            <Box
                                sx={{
                                    width: { sm: '30%', md: '25%' },
                                    flexShrink: 0,
                                    height: '100%',
                                    overflow: 'hidden',
                                }}
                            >
                                <StudentList
                                    students={students}
                                    selectedStudentId={selectedStudentId}
                                    onStudentSelect={setSelectedStudentId}
                                />
                            </Box>
                        )} */}

                        {/* Attendance Grid */}
                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                height: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            <AttendanceGrid
                                students={students}
                                dayHeaders={dayHeaders}
                                month={filters.month!}
                                year={filters.year!}
                                onToggleAttendance={handleToggleAttendance}
                            />
                        </Box>
                    </Stack>
                )}

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default AttendanceManagement;