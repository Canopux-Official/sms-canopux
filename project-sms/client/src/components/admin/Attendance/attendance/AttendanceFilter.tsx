// // AttendanceFilters.tsx

// import React, { useEffect, useState } from 'react';
// import {
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     Paper,
//     Stack,
//     CircularProgress,
//     type SelectChangeEvent,
// } from '@mui/material';
// import type { Stream } from '../types';
// import { getClassOptions, getMonthOptions, getYearOptions, needsStream } from '../utils/DateUtils';
// import { getStreams } from '../../../../api/apiFunctions';
// import type { AttendanceFilters as Filters } from '../types';

// interface AttendanceFiltersProps {
//     filters: Filters;
//     onFilterChange: (filters: Partial<Filters>) => void;
// }

// export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
//     filters,
//     onFilterChange,
// }) => {
//     const [streams, setStreams] = useState<Stream[]>([]);
//     const [loadingStreams, setLoadingStreams] = useState(false);

//     // Fetch streams on component mount
//     useEffect(() => {
//         const fetchStreams = async () => {
//             setLoadingStreams(true);
//             try {
//                 const response = await getStreams();
//                 setStreams((response.data as Stream[]) ?? []);
//             } catch (error) {
//                 console.error('Error fetching streams:', error);
//             } finally {
//                 setLoadingStreams(false);
//             }
//         };

//         fetchStreams();
//     }, []);

//     const handleClassChange = (event: SelectChangeEvent<string>) => {
//         const currentClass = event.target.value;
//         const updates: Partial<Filters> = { currentClass };

//         // Reset stream if switching to class 9/10
//         if (!needsStream(currentClass)) {
//             updates.streamId = undefined;
//         }

//         onFilterChange(updates);
//     };

//     const handleStreamChange = (event: SelectChangeEvent<string>) => {
//         onFilterChange({ streamId: event.target.value });
//     };

//     const handleMonthChange = (event: SelectChangeEvent<number>) => {
//         onFilterChange({ month: Number(event.target.value) });
//     };

//     const handleYearChange = (event: SelectChangeEvent<number>) => {
//         onFilterChange({ year: Number(event.target.value) });
//     };

//     const showStream = needsStream(filters.currentClass);

//     return (
//         <Paper
//             elevation={0}
//             sx={{
//                 p: { xs: 2, md: 3 },
//                 backgroundColor: 'background.default',
//                 borderRadius: 2,
//             }}
//         >
//             <Stack
//                 direction={{ xs: 'column', sm: 'row' }}
//                 spacing={2}
//                 sx={{ width: '100%' }}
//             >
//                 <FormControl fullWidth size="small">
//                     <InputLabel>Class Filter</InputLabel>
//                     <Select
//                         value={filters.currentClass}
//                         label="Class Filter"
//                         onChange={handleClassChange}
//                     >
//                         {getClassOptions().map((option) => (
//                             <MenuItem key={option.value} value={option.value}>
//                                 {option.label}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>

//                 {showStream && (
//                     <FormControl fullWidth size="small">
//                         <InputLabel>Stream Filter</InputLabel>
//                         <Select
//                             value={filters.streamId || ''}
//                             label="Stream Filter"
//                             onChange={handleStreamChange}
//                             disabled={loadingStreams}
//                             endAdornment={
//                                 loadingStreams ? (
//                                     <CircularProgress size={20} sx={{ mr: 2 }} />
//                                 ) : null
//                             }
//                         >
//                             <MenuItem value="">
//                                 <em>Select Stream</em>
//                             </MenuItem>
//                             {streams.map((stream) => (
//                                 <MenuItem key={stream._id} value={stream._id}>
//                                     {stream.name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 )}

//                 <FormControl fullWidth size="small" sx={{ minWidth: { sm: 150 } }}>
//                     <InputLabel>Month</InputLabel>
//                     <Select
//                         value={filters.month || new Date().getMonth() + 1}
//                         label="Month"
//                         onChange={handleMonthChange}
//                     >
//                         {getMonthOptions().map((option) => (
//                             <MenuItem key={option.value} value={option.value}>
//                                 {option.label}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>

//                 <FormControl fullWidth size="small" sx={{ minWidth: { sm: 120 } }}>
//                     <InputLabel>Year</InputLabel>
//                     <Select
//                         value={filters.year || new Date().getFullYear()}
//                         label="Year"
//                         onChange={handleYearChange}
//                     >
//                         {getYearOptions().map((option) => (
//                             <MenuItem key={option.value} value={option.value}>
//                                 {option.label}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>
//             </Stack>
//         </Paper>
//     );
// };


// AttendanceFilters.tsx

// AttendanceFilters.tsx

import React, { useEffect, useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Stack,
    CircularProgress,
    useMediaQuery,
    useTheme,
    type SelectChangeEvent,
} from '@mui/material';
import type { Stream } from '../types';
import { getClassOptions, getMonthOptions, getYearOptions, needsStream } from '../utils/DateUtils';
import { getStreams } from '../../../../api/apiFunctions';
import type { AttendanceFilters as Filters } from '../types';

interface AttendanceFiltersProps {
    filters: Filters;
    onFilterChange: (filters: Partial<Filters>) => void;
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
    filters,
    onFilterChange,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [streams, setStreams] = useState<Stream[]>([]);
    const [loadingStreams, setLoadingStreams] = useState(false);

    useEffect(() => {
        const fetchStreams = async () => {
            setLoadingStreams(true);
            try {
                const response = await getStreams();
                setStreams((response.data as Stream[]) ?? []);
            } catch (error) {
                console.error('Error fetching streams:', error);
            } finally {
                setLoadingStreams(false);
            }
        };
        fetchStreams();
    }, []);

    const handleClassChange = (event: SelectChangeEvent<string>) => {
        const currentClass = event.target.value;
        const updates: Partial<Filters> = { currentClass };
        if (!needsStream(currentClass)) updates.streamId = undefined;
        onFilterChange(updates);
    };

    const handleStreamChange = (event: SelectChangeEvent<string>) => {
        onFilterChange({ streamId: event.target.value });
    };

    const handleMonthChange = (event: SelectChangeEvent<number>) => {
        onFilterChange({ month: Number(event.target.value) });
    };

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        onFilterChange({ year: Number(event.target.value) });
    };

    const showStream = needsStream(filters.currentClass);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                backgroundColor: 'background.default',
                borderRadius: 2,
            }}
        >
            {isMobile ? (
                // Mobile (< sm): 2-column stacked grid
                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Class</InputLabel>
                            <Select value={filters.currentClass} label="Class" onChange={handleClassChange}>
                                {getClassOptions().map((o) => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {showStream && (
                            <FormControl fullWidth size="small">
                                <InputLabel>Stream</InputLabel>
                                <Select
                                    value={filters.streamId || ''}
                                    label="Stream"
                                    onChange={handleStreamChange}
                                    disabled={loadingStreams}
                                    endAdornment={loadingStreams ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {streams.map((s) => (
                                        <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={filters.month || new Date().getMonth() + 1}
                                label="Month"
                                onChange={handleMonthChange}
                            >
                                {getMonthOptions().map((o) => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={filters.year || new Date().getFullYear()}
                                label="Year"
                                onChange={handleYearChange}
                            >
                                {getYearOptions().map((o) => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            ) : (
                // Tablet + Desktop (>= sm): always a single row using CSS grid
                // CSS grid ensures equal columns that NEVER wrap regardless of sidebar width
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: showStream
                            ? 'repeat(4, 1fr)'  // Class | Stream | Month | Year
                            : 'repeat(3, 1fr)', // Class | Month | Year
                        gap: 2,
                        alignItems: 'center',
                    }}
                >
                    <FormControl size="small" fullWidth>
                        <InputLabel>Class Filter</InputLabel>
                        <Select value={filters.currentClass} label="Class Filter" onChange={handleClassChange}>
                            {getClassOptions().map((o) => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {showStream && (
                        <FormControl size="small" fullWidth>
                            <InputLabel>Stream Filter</InputLabel>
                            <Select
                                value={filters.streamId || ''}
                                label="Stream Filter"
                                onChange={handleStreamChange}
                                disabled={loadingStreams}
                                endAdornment={loadingStreams ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
                            >
                                <MenuItem value=""><em>Select Stream</em></MenuItem>
                                {streams.map((s) => (
                                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <FormControl size="small" fullWidth>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={filters.month || new Date().getMonth() + 1}
                            label="Month"
                            onChange={handleMonthChange}
                        >
                            {getMonthOptions().map((o) => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={filters.year || new Date().getFullYear()}
                            label="Year"
                            onChange={handleYearChange}
                        >
                            {getYearOptions().map((o) => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}
        </Paper>
    );
};