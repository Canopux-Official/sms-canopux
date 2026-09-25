// // components/ClassTableRow/ClassTableRow.tsx
// import React, { useState } from 'react';
// import {
//     TableRow,
//     TableCell,
//     Typography,
//     IconButton,
//     Box,
//     Chip,
//     Tooltip,
// } from '@mui/material';
// import {
//     Edit as EditIcon,
//     Delete as DeleteIcon,
// } from '@mui/icons-material';
// import type { Node } from '../types/node';

// interface ClassTableRowProps {
//     node: Node;
//     classType: string;
//     targetExam: string;
//     stream: string;
//     description?: string;
//     createdAt?: string;
//     onClick: (id: string) => void;
//     onEdit: (node: Node) => void;
//     onDelete: (id: string) => void;
// }

// const ClassTableRow: React.FC<ClassTableRowProps> = ({
//     node,
//     classType,
//     targetExam,
//     stream,
//     onClick,
//     onEdit,
//     onDelete,
// }) => {
//     const [_, setAnchorEl] = useState<null | HTMLElement>(null);

//     // const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
//     //     event.stopPropagation();
//     //     setAnchorEl(event.currentTarget);
//     // };

//     const handleMenuClose = () => {
//         setAnchorEl(null);
//     };

//     const handleEdit = (event: React.MouseEvent) => {
//         event.stopPropagation();
//         handleMenuClose();
//         onEdit(node);
//     };

//     const handleDelete = (event: React.MouseEvent) => {
//         event.stopPropagation();
//         handleMenuClose();
//         onDelete(node._id);
//     };

//     // const formatDate = (dateString?: string) => {
//     //     return dateString
//     //         ? new Date(dateString).toLocaleDateString('en-US', {
//     //             year: 'numeric',
//     //             month: 'short',
//     //             day: 'numeric',
//     //         })
//     //         : 'N/A';
//     // };

//     return (
//         <>
//             <TableRow
//                 onClick={() => onClick(node._id)}
//                 sx={{
//                     cursor: 'pointer',
//                     '&:hover': {
//                         backgroundColor: '#f8f9fa',
//                     },
//                     transition: 'background-color 0.2s ease',
//                 }}
//             >
//                 {/* Class Name */}
//                 <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

//                         <Typography
//                             variant="body1"
//                             sx={{
//                                 fontWeight: 600,
//                                 color: '#1a1a1a',
//                                 fontSize: '0.95rem',
//                             }}
//                         >
//                             Class {classType}
//                         </Typography>
//                     </Box>
//                 </TableCell>

//                 {/* Stream */}
//                 <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
//                     <Chip
//                         label={stream ? stream : "N/A"}
//                         size="small"
//                         sx={{
//                             backgroundColor: '#f5f5f5',
//                             color: 'black',
//                             fontSize: '0.75rem',
//                             height: 26,
//                             fontWeight: 600,
//                         }}
//                     />
//                 </TableCell>

//                 {/* Target Exam */}
//                 <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
//                     <Typography
//                         variant="body2"
//                         sx={{
//                             color: '#5f6368',
//                             fontSize: '0.875rem',
//                         }}
//                     >
//                         {targetExam}
//                     </Typography>
//                 </TableCell>

//                 {/* Actions */}
//                 <TableCell align="right">
//                     <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
//                         <Tooltip title="Edit">
//                             <IconButton
//                                 size="small"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleEdit(e);
//                                 }}
//                                 sx={{
//                                     color: '#1976d2',
//                                     '&:hover': {
//                                         backgroundColor: '#e3f2fd',
//                                     },
//                                 }}
//                             >
//                                 <EditIcon fontSize="small" />
//                             </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Delete">
//                             <IconButton
//                                 size="small"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleDelete(e);
//                                 }}
//                                 sx={{
//                                     color: '#d32f2f',
//                                     '&:hover': {
//                                         backgroundColor: '#ffebee',
//                                     },
//                                 }}
//                             >
//                                 <DeleteIcon fontSize="small" />
//                             </IconButton>
//                         </Tooltip>
//                     </Box>
//                 </TableCell>
//             </TableRow>

//             {/* Actions Menu */}

//         </>
//     );
// };

// export default ClassTableRow;



// components/ClassTableRow/ClassTableRow.tsx
import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Typography,
    IconButton,
    Box,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Node } from '../types/node';

interface ClassTableRowProps {
    node: Node;
    classType: string;
    targetExam: string;
    stream: string;
    description?: string;
    createdAt?: string;
    onClick: (id: string) => void;
    onEdit: (node: Node) => void;
    onDelete: (id: string) => void;
}

const ClassTableRow: React.FC<ClassTableRowProps> = ({
    node,
    classType,
    targetExam,
    stream,
    onClick,
    onEdit,
    onDelete,
}) => {
    const [_, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onEdit(node);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onDelete(node._id);
    };

    return (
        <>
            <TableRow
                onClick={() => onClick(node._id)}
                sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f8f9fa' },
                    transition: 'background-color 0.2s ease',
                }}
            >
                {/* Class Name — on mobile, also shows stream + exam inline */}
                <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}
                        >
                            Class {classType}
                        </Typography>

                        {/* Shown ONLY on mobile (xs), hidden on sm and above */}
                        <Box
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 0.75,
                                mt: 0.25,
                            }}
                        >
                            <Chip
                                label={stream || 'N/A'}
                                size="small"
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    color: 'black',
                                    fontSize: '0.7rem',
                                    height: 22,
                                    fontWeight: 600,
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ color: '#5f6368', fontSize: '0.75rem' }}
                            >
                                {targetExam}
                            </Typography>
                        </Box>
                    </Box>
                </TableCell>

                {/* Stream — hidden on mobile */}
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip
                        label={stream || 'N/A'}
                        size="small"
                        sx={{
                            backgroundColor: '#f5f5f5',
                            color: 'black',
                            fontSize: '0.75rem',
                            height: 26,
                            fontWeight: 600,
                        }}
                    />
                </TableCell>

                {/* Target Exam — hidden on mobile */}
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                        {targetExam}
                    </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleEdit(e); }}
                                sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
                                sx={{ color: '#d32f2f', '&:hover': { backgroundColor: '#ffebee' } }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </TableCell>
            </TableRow>
        </>
    );
};

export default ClassTableRow;