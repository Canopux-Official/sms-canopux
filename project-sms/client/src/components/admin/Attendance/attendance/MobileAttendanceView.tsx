// // MobileAttendanceView.tsx

// import React, { useState } from 'react';
// import {
//     Box,
//     Card,
//     CardContent,
//     Typography,
//     Stack,
//     Chip,
//     IconButton,
//     Collapse,
//     Grid,
//     Paper,
//     Divider,
// } from '@mui/material';
// import {
//     ExpandMore as ExpandMoreIcon,
//     CheckCircle as PresentIcon,
//     Cancel as AbsentIcon,
//     Remove as NoRecordIcon,
// } from '@mui/icons-material';
// import { getWeekday, isToday } from '../utils/DateUtils';
// import type { StudentWithDirtyFlag } from '../types';

// interface MobileAttendanceViewProps {
//     students: StudentWithDirtyFlag[];
//     dayHeaders: number[];
//     month: number;
//     year: number;
//     onToggleAttendance: (studentId: string, day: number) => void;
// }

// export const MobileAttendanceView: React.FC<MobileAttendanceViewProps> = ({
//     students,
//     dayHeaders,
//     month,
//     year,
//     onToggleAttendance,
// }) => {
//     const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

//     const handleExpand = (studentId: string) => {
//         setExpandedStudent(expandedStudent === studentId ? null : studentId);
//     };

//     const getStatusColor = (status: boolean | null): string => {
//         if (status === true) return 'success.main';
//         if (status === false) return 'error.main';
//         return 'text.disabled';
//     };

//     const getStatusIcon = (status: boolean | null) => {
//         if (status === true)
//             return <PresentIcon sx={{ fontSize: 20, color: 'success.main' }} />;
//         if (status === false)
//             return <AbsentIcon sx={{ fontSize: 20, color: 'error.main' }} />;
//         return <NoRecordIcon sx={{ fontSize: 20, color: 'text.disabled' }} />;
//     };

//     const getAttendancePercentage = (student: StudentWithDirtyFlag): number => {
//         const { present, absent } = student.attendance.stats;
//         const total = present + absent;
//         return total > 0 ? Math.round((present / total) * 100) : 0;
//     };

//     const getPercentageColor = (percentage: number): string => {
//         if (percentage >= 75) return 'success';
//         if (percentage >= 50) return 'warning';
//         return 'error';
//     };

//     return (
//         <Box sx={{ pb: 2 }}>
//             {students.map((student) => {
//                 const isExpanded = expandedStudent === student.studentId;
//                 const percentage = getAttendancePercentage(student);

//                 return (
//                     <Card
//                         key={student.studentId}
//                         sx={{
//                             mb: 2,
//                             borderLeft: student.isDirty ? 4 : 0,
//                             borderColor: 'warning.main',
//                             boxShadow: student.isDirty ? 3 : 1,
//                         }}
//                     >
//                         <CardContent
//                             sx={{ p: 2, '&:last-child': { pb: 2 } }}
//                             onClick={() => handleExpand(student.studentId)}
//                         >
//                             <Stack
//                                 direction="row"
//                                 justifyContent="space-between"
//                                 alignItems="center"
//                             >
//                                 <Box sx={{ flex: 1 }}>
//                                     <Stack
//                                         direction="row"
//                                         alignItems="center"
//                                         spacing={1}
//                                         sx={{ mb: 0.5 }}
//                                     >
//                                         <Typography variant="subtitle1" fontWeight="bold">
//                                             {student.name}
//                                         </Typography>
//                                         {student.isDirty && (
//                                             <Chip
//                                                 label="Unsaved"
//                                                 size="small"
//                                                 color="warning"
//                                                 sx={{ height: 20, fontSize: '0.7rem' }}
//                                             />
//                                         )}
//                                     </Stack>

//                                     <Typography variant="caption" color="text.secondary" display="block">
//                                         {student.phoneNumber}
//                                     </Typography>

//                                     <Stack
//                                         direction="row"
//                                         spacing={1}
//                                         alignItems="center"
//                                         sx={{ mt: 1 }}
//                                     >
//                                         <Typography variant="caption" color="text.secondary">
//                                             {student.currentClass}
//                                             {student.stream && ` - ${student.stream}`}
//                                         </Typography>
//                                         <Chip
//                                             label={`${percentage}%`}
//                                             size="small"
//                                             color={getPercentageColor(percentage) as any}
//                                             sx={{ height: 18, fontSize: '0.65rem' }}
//                                         />
//                                     </Stack>

//                                     <Typography
//                                         variant="caption"
//                                         color="text.secondary"
//                                         sx={{ mt: 0.5, display: 'block' }}
//                                     >
//                                         Present: {student.attendance.stats.present} | Absent:{' '}
//                                         {student.attendance.stats.absent}
//                                     </Typography>
//                                 </Box>

//                                 <IconButton
//                                     size="small"
//                                     sx={{
//                                         transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
//                                         transition: 'transform 0.3s',
//                                     }}
//                                 >
//                                     <ExpandMoreIcon />
//                                 </IconButton>
//                             </Stack>

//                             <Collapse in={isExpanded} timeout="auto" unmountOnExit>
//                                 <Divider sx={{ my: 2 }} />

//                                 <Typography variant="subtitle2" gutterBottom>
//                                     Attendance Details
//                                 </Typography>

//                                 <Grid container spacing={1} sx={{ mt: 1 }}>
//                                     {dayHeaders.map((day) => {
//                                         const status = student.attendance.days[day.toString()];
//                                         const isTodayCell = isToday(day, month, year);
//                                         const isDirtyDay =
//                                             student.isDirty && student.dirtyDays?.has(day);

//                                         return (
//                                             <Box
//                                                 key={day}
//                                                 sx={{
//                                                     width: { xs: '33.33%', sm: '25%', md: '16.67%' },
//                                                     flexBasis: { xs: '33.33%', sm: '25%', md: '16.67%' },
//                                                     maxWidth: { xs: '33.33%', sm: '25%', md: '16.67%' },
//                                                     flexGrow: 0,
//                                                     flexShrink: 0,
//                                                 }}
//                                             >
//                                                 <Paper
//                                                     elevation={isTodayCell ? 3 : 1}
//                                                     sx={{
//                                                         p: 1,
//                                                         textAlign: 'center',
//                                                         cursor: 'pointer',
//                                                         backgroundColor: isTodayCell
//                                                             ? 'primary.light'
//                                                             : isDirtyDay
//                                                                 ? 'warning.light'
//                                                                 : 'background.paper',
//                                                         border: 2,
//                                                         borderColor: isDirtyDay
//                                                             ? 'warning.main'
//                                                             : 'transparent',
//                                                         transition: 'all 0.2s',
//                                                         '&:hover': {
//                                                             backgroundColor: 'action.hover',
//                                                             transform: 'scale(1.05)',
//                                                         },
//                                                     }}
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         onToggleAttendance(student.studentId, day);
//                                                     }}
//                                                 >
//                                                     <Typography
//                                                         variant="caption"
//                                                         fontWeight="bold"
//                                                         display="block"
//                                                         sx={{
//                                                             color: isTodayCell
//                                                                 ? 'primary.contrastText'
//                                                                 : 'text.primary',
//                                                         }}
//                                                     >
//                                                         {day}
//                                                     </Typography>
//                                                     <Typography
//                                                         variant="caption"
//                                                         display="block"
//                                                         sx={{
//                                                             fontSize: '0.6rem',
//                                                             color: isTodayCell
//                                                                 ? 'primary.contrastText'
//                                                                 : 'text.secondary',
//                                                         }}
//                                                     >
//                                                         {getWeekday(day, month, year)}
//                                                     </Typography>
//                                                     <Box sx={{ mt: 0.5 }}>{getStatusIcon(status)}</Box>
//                                                 </Paper>
//                                             </Box>
//                                         );
//                                     })}
//                                 </Grid>
//                             </Collapse>
//                         </CardContent>
//                     </Card>
//                 );
//             })}

//             {students.length === 0 && (
//                 <Box sx={{ p: 4, textAlign: 'center' }}>
//                     <Typography variant="body1" color="text.secondary">
//                         No students found for the selected filters
//                     </Typography>
//                 </Box>
//             )}
//         </Box>
//     );
// };


// MobileAttendanceView.tsx
// MobileAttendanceView.tsx

// MobileAttendanceView.tsx

import React, { useRef } from 'react';
import {
    Box,
    Typography,
    Chip,
} from '@mui/material';
import {
    CheckCircle as PresentIcon,
    Cancel as AbsentIcon,
    Remove as NoRecordIcon,
} from '@mui/icons-material';
import { getWeekday, isToday } from '../utils/DateUtils';
import type { StudentWithDirtyFlag } from '../types';

interface MobileAttendanceViewProps {
    students: StudentWithDirtyFlag[];
    dayHeaders: number[];
    month: number;
    year: number;
    onToggleAttendance: (studentId: string, day: number) => void;
}

export const MobileAttendanceView: React.FC<MobileAttendanceViewProps> = ({
    students,
    dayHeaders,
    month,
    year,
    onToggleAttendance,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const getStatusIcon = (status: boolean | null) => {
        if (status === true)
            return <PresentIcon sx={{ fontSize: 18, color: 'success.main' }} />;
        if (status === false)
            return <AbsentIcon sx={{ fontSize: 18, color: 'error.main' }} />;
        return <NoRecordIcon sx={{ fontSize: 18, color: 'text.disabled' }} />;
    };

    const getAttendancePercentage = (student: StudentWithDirtyFlag): number => {
        const { present, absent } = student.attendance.stats;
        const total = present + absent;
        return total > 0 ? Math.round((present / total) * 100) : 0;
    };

    const getPercentageColor = (percentage: number): string => {
        if (percentage >= 75) return 'success';
        if (percentage >= 50) return 'warning';
        return 'error';
    };

    if (students.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No students found for the selected filters
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                height: 'calc(100vh - 200px)',
                overflow: 'hidden',
            }}
        >
            {/* LEFT SIDE - Student Names (Fixed) */}
            <Box
                sx={{
                    width: 140,
                    minWidth: 140,
                    flexShrink: 0,
                    borderRight: 2,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 1,
                        borderBottom: 2,
                        borderColor: 'divider',
                        backgroundColor: 'primary.main',
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ color: 'primary.contrastText' }}
                    >
                        Students
                    </Typography>
                </Box>

                {/* Student List - Scrollable */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': {
                            width: 6,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 3,
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.3)',
                            },
                        },
                    }}
                    onScroll={(e) => {
                        // Sync vertical scroll with attendance grid
                        if (scrollRef.current) {
                            scrollRef.current.scrollTop = e.currentTarget.scrollTop;
                        }
                    }}
                >
                    {students.map((student) => {
                        const percentage = getAttendancePercentage(student);
                        return (
                            <Box
                                key={student.studentId}
                                sx={{
                                    p: 1,
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    borderLeft: student.isDirty ? 4 : 0,
                                    borderLeftColor: 'warning.main',
                                    backgroundColor: student.isDirty
                                        ? 'warning.lighter'
                                        : 'background.paper',
                                    height: 70,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{
                                        mb: 0.3,
                                        fontSize: '0.8rem',
                                        lineHeight: 1.2,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {student.name}
                                </Typography>
                                {student.isDirty && (
                                    <Chip
                                        label="Unsaved"
                                        size="small"
                                        color="warning"
                                        sx={{ height: 14, fontSize: '0.55rem', mb: 0.3, width: 'fit-content' }}
                                    />
                                )}
                                <Typography
                                    variant="caption"
                                    display="block"
                                    color="text.secondary"
                                    sx={{ 
                                        fontSize: '0.65rem', 
                                        mb: 0.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {student.currentClass}
                                    {student.stream && ` - ${student.stream}`}
                                </Typography>
                                <Chip
                                    label={`${percentage}%`}
                                    size="small"
                                    color={getPercentageColor(percentage) as any}
                                    sx={{ height: 14, fontSize: '0.55rem', width: 'fit-content' }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* RIGHT SIDE - Attendance Dates (Scrollable) */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Combined Header + Grid Container with synchronized scroll */}
                <Box
                    ref={scrollRef}
                    sx={{
                        flex: 1,
                        overflowX: 'auto',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: 6,
                            height: 6,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 3,
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.3)',
                            },
                        },
                    }}
                >
                    <Box sx={{ minWidth: 'max-content' }}>
                        {/* Date Headers - Sticky */}
                        <Box
                            sx={{
                                display: 'flex',
                                borderBottom: 2,
                                borderColor: 'divider',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                backgroundColor: 'primary.main',
                            }}
                        >
                            {dayHeaders.map((day) => {
                                const isTodayCell = isToday(day, month, year);
                                return (
                                    <Box
                                        key={day}
                                        sx={{
                                            minWidth: 60,
                                            width: 60,
                                            p: 1,
                                            textAlign: 'center',
                                            borderRight: 1,
                                            borderColor: 'rgba(255,255,255,0.2)',
                                            backgroundColor: isTodayCell
                                                ? 'primary.dark'
                                                : 'primary.main',
                                            height: 60,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            display="block"
                                            sx={{
                                                color: 'primary.contrastText',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {day}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            display="block"
                                            sx={{
                                                fontSize: '0.65rem',
                                                color: 'primary.contrastText',
                                                opacity: 0.9,
                                            }}
                                        >
                                            {getWeekday(day, month, year)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Attendance Grid */}
                        {students.map((student) => (
                            <Box
                                key={student.studentId}
                                sx={{
                                    display: 'flex',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    height: 70,
                                }}
                            >
                                {dayHeaders.map((day) => {
                                    const status = student.attendance.days[day.toString()];
                                    const isTodayCell = isToday(day, month, year);
                                    const isDirtyDay =
                                        student.isDirty && student.dirtyDays?.has(day);

                                    return (
                                        <Box
                                            key={day}
                                            sx={{
                                                minWidth: 60,
                                                width: 60,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRight: 1,
                                                borderColor: 'divider',
                                                cursor: 'pointer',
                                                backgroundColor: isTodayCell
                                                    ? 'primary.lighter'
                                                    : isDirtyDay
                                                        ? 'warning.lighter'
                                                        : 'background.paper',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                            onClick={() =>
                                                onToggleAttendance(student.studentId, day)
                                            }
                                        >
                                            {getStatusIcon(status)}
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};