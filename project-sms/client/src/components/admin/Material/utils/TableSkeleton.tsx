import React from 'react';
import {
    Box,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useMediaQuery,
    useTheme,
} from '@mui/material';

const headCell = { fontWeight: 600, color: '#616161' };
const pill = { borderRadius: '13px' };

/** Same columns and breakpoints as the class table in ShowClass. */
export const ClassTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Table>
            <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                    <TableCell sx={headCell}>Class</TableCell>
                    <TableCell sx={{ ...headCell, display: { xs: 'none', md: 'table-cell' } }}>Streams</TableCell>
                    <TableCell sx={{ ...headCell, display: { xs: 'none', sm: 'table-cell' } }}>Target Exams</TableCell>
                    <TableCell align="right" sx={headCell}>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <Skeleton variant="text" width={90} height={24} />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <Skeleton variant="rectangular" width={80} height={26} sx={pill} />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <Skeleton variant="text" width={120} height={22} />
                        </TableCell>
                        <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                <Skeleton variant="circular" width={30} height={30} />
                                <Skeleton variant="circular" width={30} height={30} />
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

/** Same layout as SubnodeTable: a list on phones, a table everywhere else. */
export const SubnodeTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {Array.from({ length: rows }).map((_, i) => (
                    <Box
                        key={i}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderBottom: '1px solid #e8eaed' }}
                    >
                        <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: '4px', flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Skeleton variant="text" width="65%" height={20} />
                            <Skeleton variant="text" width="35%" height={16} />
                        </Box>
                        <Skeleton variant="circular" width={28} height={28} />
                        <Skeleton variant="circular" width={28} height={28} />
                        <Skeleton variant="circular" width={28} height={28} />
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: '12px', border: '1px solid #e8eaed', overflow: 'hidden' }}
        >
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#fafafa' }}>
                        <TableCell sx={headCell}>Name</TableCell>
                        <TableCell sx={{ ...headCell, display: { xs: 'none', md: 'table-cell' } }}>Type</TableCell>
                        {!isTablet && (
                            <TableCell sx={{ ...headCell, display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                        )}
                        <TableCell sx={{ ...headCell, display: { xs: 'none', md: 'table-cell' } }}>Due Date</TableCell>
                        <TableCell align="right" sx={headCell}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: '4px' }} />
                                    <Skeleton variant="text" width={160} height={24} />
                                </Box>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                <Skeleton variant="text" width={50} height={20} />
                            </TableCell>
                            {!isTablet && (
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                    <Skeleton variant="text" width={170} height={20} />
                                </TableCell>
                            )}
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                <Skeleton variant="text" width={80} height={20} />
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                    <Skeleton variant="circular" width={30} height={30} />
                                    <Skeleton variant="circular" width={30} height={30} />
                                    <Skeleton variant="circular" width={30} height={30} />
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};