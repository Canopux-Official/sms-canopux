// import React, { useState } from 'react';
// import {
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Typography,
//   Box,
//   useMediaQuery,
//   useTheme,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Link,
// } from '@mui/material';
// import {
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Folder as FolderIcon,
//   InsertDriveFile as FileIcon,
//   AttachFile as AttachFileIcon,
//   Link as LinkIcon,
// } from '@mui/icons-material';
// import type { Node } from '../types/node';

// interface SubnodeTableProps {
//   nodes: Node[];
//   onNodeClick: (nodeId: string) => void;
//   onEdit: (node: Node) => void;
//   onDelete: (nodeId: string) => void;
// }

// const SubnodeTable: React.FC<SubnodeTableProps> = ({
//   nodes,
//   onNodeClick,
//   onEdit,
//   onDelete,
// }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const isTablet = useMediaQuery(theme.breakpoints.down('md'));

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogType, setDialogType] = useState<'files' | 'references'>('files');
//   const [selectedNode, setSelectedNode] = useState<Node | null>(null);

//   const handleOpenDialog = (node: Node, type: 'files' | 'references') => {
//     setSelectedNode(node);
//     setDialogType(type);
//     setDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setDialogOpen(false);
//     setSelectedNode(null);
//   };

//   console.log(selectedNode)

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };
  

//   if (isMobile) {
//     // Mobile List View (Google Drive style)
//     return (
//       <>
//         <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//           {nodes.map((node) => (
//             <Box
//               key={node._id}
//               onClick={() => node.type === 'folder' && onNodeClick(node._id)}
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 1.5,
//                 p: 1.5,
//                 borderBottom: '1px solid #e8eaed',
//                 cursor: node.type === 'folder' ? 'pointer' : 'default',
//                 '&:hover': {
//                   backgroundColor: '#f8f9fa',
//                 },
//               }}
//             >
//               {/* Icon */}
//               {node.type === 'folder' ? (
//                 <FolderIcon sx={{ color: '#FFA726', fontSize: '1.5rem' }} />
//               ) : (
//                 <FileIcon sx={{ color: '#42A5F5', fontSize: '1.5rem' }} />
//               )}

//               {/* Name and Date */}
//               <Box sx={{ flex: 1, minWidth: 0 }}>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontWeight: 500,
//                     color: '#1a1a1a',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap',
//                   }}
//                 >
//                   {node.heading ? node.heading : (typeof node.subject === 'object' && node.subject?.name) || ''}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     color: '#5f6368',
//                     fontSize: '0.75rem',
//                   }}
//                 >
//                   {formatDate(node.lastDate)}
//                 </Typography>
//               </Box>

//               {/* Action Buttons */}
//               {node.fileDetails && node.fileDetails.length > 0 && (
//                 <IconButton
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleOpenDialog(node, 'files');
//                   }}
//                   sx={{
//                     color: '#5f6368',
//                   }}
//                 >
//                   <AttachFileIcon fontSize="small" />
//                 </IconButton>
//               )}
//               {node.referenceDetails && node.referenceDetails.length > 0 && (
//                 <IconButton
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleOpenDialog(node, 'references');
//                   }}
//                   sx={{
//                     color: '#5f6368',
//                   }}
//                 >
//                   <LinkIcon fontSize="small" />
//                 </IconButton>
//               )}
//               <IconButton
//                 size="small"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onEdit(node);
//                 }}
//                 sx={{
//                   color: '#5f6368',
//                 }}
//               >
//                 <EditIcon fontSize="small" />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete(node._id);
//                 }}
//                 sx={{
//                   color: '#5f6368',
//                 }}
//               >
//                 <DeleteIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           ))}
//         </Box>

//         {/* Dialog */}
//         <Dialog
//           open={dialogOpen}
//           onClose={handleCloseDialog}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               {dialogType === 'files' ? (
//                 <AttachFileIcon sx={{ color: '#e65100' }} />
//               ) : (
//                 <LinkIcon sx={{ color: '#1976d2' }} />
//               )}
//               <Typography variant="h6">
//                 {dialogType === 'files' ? 'File Details' : 'Reference Details'}
//               </Typography>
//             </Box>
//           </DialogTitle>
//           <DialogContent dividers>
//             {selectedNode && (
//               <>
//                 {dialogType === 'files' ? (
//                   // File Details
//                   selectedNode.fileDetails && selectedNode.fileDetails.length > 0 ? (
//                     selectedNode.fileDetails.map((file: any, index: number) => (
//                       <Box
//                         key={file._id || index}
//                         sx={{
//                           p: 1.5,
//                           mb: 1,
//                           borderRadius: '8px',
//                           border: '1px solid #e8eaed',
//                           '&:hover': {
//                             backgroundColor: '#f8f9fa',
//                           }
//                         }}
//                       >
//                         <Typography
//                           variant="body2"
//                           sx={{ fontWeight: 600, mb: 0.5 }}
//                         >
//                           {file.fileName || 'Unnamed File'}
//                         </Typography>
//                         {file.uploadLink && (
//                           <Link
//                             href={file.uploadLink}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             sx={{
//                               fontSize: '0.875rem',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: 0.5,
//                               textDecoration: 'none',
//                               '&:hover': {
//                                 textDecoration: 'underline',
//                               }
//                             }}
//                           >
//                             <LinkIcon sx={{ fontSize: '1rem' }} />
//                             Open File
//                           </Link>
//                         )}
//                       </Box>
//                     ))
//                   ) : (
//                     <Box sx={{ textAlign: 'center', py: 3 }}>
//                       <Typography variant="body2" sx={{ color: '#5f6368' }}>
//                         No file details available
//                       </Typography>
//                     </Box>
//                   )
//                 ) : (
//                   // Reference Details
//                   selectedNode.referenceDetails && selectedNode.referenceDetails.length > 0 ? (
//                     selectedNode.referenceDetails.map((reference: any, index: number) => (
//                       <Box
//                         key={reference._id || index}
//                         sx={{
//                           p: 1.5,
//                           mb: 1,
//                           borderRadius: '8px',
//                           border: '1px solid #e8eaed',
//                           '&:hover': {
//                             backgroundColor: '#f8f9fa',
//                           }
//                         }}
//                       >
//                         <Typography
//                           variant="body2"
//                           sx={{ fontWeight: 600, mb: 0.5 }}
//                         >
//                           {reference.fileName}
//                         </Typography>
//                         {reference.referenceLink && (
//                           <Link
//                             href={reference.referenceLink}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             sx={{
//                               fontSize: '0.875rem',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: 0.5,
//                               textDecoration: 'none',
//                               '&:hover': {
//                                 textDecoration: 'underline',
//                               }
//                             }}
//                           >
//                             <LinkIcon sx={{ fontSize: '1rem' }} />
//                             Open Link
//                           </Link>
//                         )}
//                       </Box>
//                     ))
//                   ) : (
//                     <Box sx={{ textAlign: 'center', py: 3 }}>
//                       <Typography variant="body2" sx={{ color: '#5f6368' }}>
//                         No reference details available
//                       </Typography>
//                     </Box>
//                   )
//                 )}
//               </>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </>
//     );
//   }

//   // Desktop Table View
//   return (
//     <>
//       <TableContainer
//         component={Paper}
//         elevation={0}
//         sx={{
//           borderRadius: '12px',
//           border: '1px solid #e8eaed',
//           overflow: 'hidden',
//         }}
//       >
//         <Table>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: '#fafafa' }}>
//               <TableCell sx={{ fontWeight: 600, color: '#616161' }}>
//                 Name
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
//                 Type
//               </TableCell>
//               {!isTablet && (
//                 <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
//                   Description
//                 </TableCell>
//               )}
//               <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', lg: 'table-cell' } }}>
//                 File Details
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', lg: 'table-cell' } }}>
//                 Reference Details
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
//                 Due Date
//               </TableCell>
//               <TableCell
//                 align="right"
//                 sx={{ fontWeight: 600, color: '#616161' }}
//               >
//                 Actions
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {nodes.map((node) => (
//               <TableRow
//                 key={node._id}
//                 onClick={() => node.type === 'folder' && onNodeClick(node._id)}
//                 sx={{
//                   cursor: node.type === 'folder' ? 'pointer' : 'default',
//                   backgroundColor: node.type === 'folder' ? "#eff1f192" : "white",
//                   '&:hover': {
//                     backgroundColor: '#f8f9fa',
//                   },
//                   transition: 'background-color 0.2s ease',
//                 }}
//               >
//                 {/* Name Column */}
//                 <TableCell>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                     {/* Icon based on type */}
//                     {node.type === 'folder' ? (
//                       <FolderIcon sx={{ color: '#FFA726', fontSize: '1.5rem' }} />
//                     ) : (
//                       <FileIcon sx={{ color: '#42A5F5', fontSize: '1.5rem' }} />
//                     )}

//                     {/* Display heading */}
//                     <Typography
//                       variant="body1"
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1a1a1a',
//                         fontSize: '0.95rem',
//                       }}
//                     >
//                       {node.heading ? node.heading : (typeof node.subject === 'object' && node.subject?.name) || ''}
//                     </Typography>
//                   </Box>
//                 </TableCell>

//                 {/* Type Column */}
//                 <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
//                   <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
//                     {node.type === 'folder' ? 'Folder' : 'File'}
//                   </Typography>
//                 </TableCell>

//                 {/* Description Column */}
//                 {!isTablet && (
//                   <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: '#5f6368',
//                         fontSize: '0.875rem',
//                         maxWidth: 250,
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis',
//                         whiteSpace: 'nowrap',
//                       }}
//                     >
//                       {node.description ? node.description.slice(0, 20) + "......." : '-'}
//                     </Typography>
//                   </TableCell>
//                 )}

//                 {/* File Details Column */}
//                 <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
//                   {node.fileDetails && node.fileDetails.length > 0 ? (
//                     <Button
//                       size="small"
//                       startIcon={<AttachFileIcon />}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleOpenDialog(node, 'files');
//                       }}
//                       sx={{
//                         textTransform: 'none',
//                         color: '#e65100',
//                         '&:hover': {
//                           backgroundColor: '#fff3e0',
//                         },
//                       }}
//                     >
//                       {node.fileDetails.length} {node.fileDetails.length === 1 ? 'file' : 'files'}
//                     </Button>
//                   ) : (
//                     <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
//                       N/A
//                     </Typography>
//                   )}
//                 </TableCell>

//                 {/* Reference Details Column */}
//                 <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
//                   {node.referenceDetails && node.referenceDetails.length > 0 ? (
//                     <Button
//                       size="small"
//                       startIcon={<LinkIcon />}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleOpenDialog(node, 'references');
//                       }}
//                       sx={{
//                         textTransform: 'none',
//                         color: '#1976d2',
//                         '&:hover': {
//                           backgroundColor: '#e3f2fd',
//                         },
//                       }}
//                     >
//                       {node.referenceDetails.length} {node.referenceDetails.length === 1 ? 'reference' : 'references'}
//                     </Button>
//                   ) : (
//                     <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
//                       N/A
//                     </Typography>
//                   )}
//                 </TableCell>

//                 {/* Due Date Column */}
//                 <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       color: node.lastDate ? '#d32f2f' : '#5f6368',
//                       fontSize: '0.875rem',
//                       fontWeight: node.lastDate ? 600 : 400,
//                     }}
//                   >
//                     {formatDate(node.lastDate)}
//                   </Typography>
//                 </TableCell>

//                 {/* Actions Column */}
//                 <TableCell align="right">
//                   <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
//                     <Tooltip title="Edit">
//                       <IconButton
//                         size="small"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onEdit(node);
//                         }}
//                         sx={{
//                           color: '#1976d2',
//                           '&:hover': {
//                             backgroundColor: '#e3f2fd',
//                           },
//                         }}
//                       >
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Delete">
//                       <IconButton
//                         size="small"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onDelete(node._id);
//                         }}
//                         sx={{
//                           color: '#d32f2f',
//                           '&:hover': {
//                             backgroundColor: '#ffebee',
//                           },
//                         }}
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Tooltip>
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Dialog */}
//       <Dialog
//         open={dialogOpen}
//         onClose={handleCloseDialog}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             {dialogType === 'files' ? (
//               <AttachFileIcon sx={{ color: '#e65100' }} />
//             ) : (
//               <LinkIcon sx={{ color: '#1976d2' }} />
//             )}
//             <Typography variant="h6">
//               {dialogType === 'files' ? 'File Details' : 'Reference Details'}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent dividers>
//           {selectedNode && (
//             <>
//               {dialogType === 'files' ? (
//                 // File Details
//                 selectedNode.fileDetails && selectedNode.fileDetails.length > 0 ? (
//                   selectedNode.fileDetails.map((file: any, index: number) => (
//                     <Box
//                       key={file._id || index}
//                       sx={{
//                         p: 1.5,
//                         mb: 1,
//                         borderRadius: '8px',
//                         border: '1px solid #e8eaed',
//                         '&:hover': {
//                           backgroundColor: '#f8f9fa',
//                         }
//                       }}
//                     >
//                       <Typography
//                         variant="body2"
//                         sx={{ fontWeight: 600, mb: 0.5 }}
//                       >
//                         {file.fileName || 'Unnamed File'}
//                       </Typography>
//                       {file.uploadLink && (
//                         <Link
//                           href={file.uploadLink}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           sx={{
//                             fontSize: '0.875rem',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 0.5,
//                             textDecoration: 'none',
//                             '&:hover': {
//                               textDecoration: 'underline',
//                             }
//                           }}
//                         >
//                           <LinkIcon sx={{ fontSize: '1rem' }} />
//                           Open File
//                         </Link>
//                       )}
//                     </Box>
//                   ))
//                 ) : (
//                   <Box sx={{ textAlign: 'center', py: 3 }}>
//                     <Typography variant="body2" sx={{ color: '#5f6368' }}>
//                       No file details available
//                     </Typography>
//                   </Box>
//                 )
//               ) : (
//                 // Reference Details
//                 selectedNode.referenceDetails && selectedNode.referenceDetails.length > 0 ? (
//                   selectedNode.referenceDetails.map((reference: any, index: number) => (
//                     <Box
//                       key={reference._id || index}
//                       sx={{
//                         p: 1.5,
//                         mb: 1,
//                         borderRadius: '8px',
//                         border: '1px solid #e8eaed',
//                         '&:hover': {
//                           backgroundColor: '#f8f9fa',
//                         }
//                       }}
//                     >
//                       <Typography
//                         variant="body2"
//                         sx={{ fontWeight: 600, mb: 0.5 }}
//                       >
//                         {reference.fileName}
//                       </Typography>
//                       {reference.referenceLink && (
//                         <Link
//                           href={reference.referenceLink}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           sx={{
//                             fontSize: '0.875rem',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 0.5,
//                             textDecoration: 'none',
//                             '&:hover': {
//                               textDecoration: 'underline',
//                             }
//                           }}
//                         >
//                           <LinkIcon sx={{ fontSize: '1rem' }} />
//                           Open Link
//                         </Link>
//                       )}
//                     </Box>
//                   ))
//                 ) : (
//                   <Box sx={{ textAlign: 'center', py: 3 }}>
//                     <Typography variant="body2" sx={{ color: '#5f6368' }}>
//                       No reference details available
//                     </Typography>
//                   </Box>
//                 )
//               )}
//             </>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default SubnodeTable;

import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import type { Node } from '../types/node';
import { NodeDetailModal } from '../../../student/Material/utils/NodeDetails';


interface SubnodeTableProps {
  nodes: Node[];
  onNodeClick: (nodeId: string) => void;
  onEdit: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

const SubnodeTable: React.FC<SubnodeTableProps> = ({
  nodes,
  onNodeClick,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewClick = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    setSelectedNode(node);
  };

  const getNodeName = (node: Node) =>
    node.heading
      ? node.heading
      : (typeof node.subject === 'object' && node.subject?.name) || '';

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {nodes.map((node) => (
            <Box
              key={node._id}
              onClick={() => node.type === 'folder' && onNodeClick(node._id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderBottom: '1px solid #e8eaed',
                cursor: node.type === 'folder' ? 'pointer' : 'default',
                '&:hover': { backgroundColor: '#f8f9fa' },
              }}
            >
              {/* Icon */}
              {node.type === 'folder' ? (
                <FolderIcon sx={{ color: '#FFA726', fontSize: '1.5rem', flexShrink: 0 }} />
              ) : (
                <FileIcon sx={{ color: '#42A5F5', fontSize: '1.5rem', flexShrink: 0 }} />
              )}

              {/* Name and Date */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getNodeName(node)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                  {formatDate(node.lastDate)}
                </Typography>
              </Box>

              {/* View */}
              <IconButton
                size="small"
                onClick={(e) => handleViewClick(e, node)}
                sx={{ color: '#5f6368', '&:hover': { color: '#1976d2', bgcolor: '#e3f2fd' } }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>

              {/* Edit */}
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                sx={{ color: '#5f6368' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              {/* Delete */}
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(node._id); }}
                sx={{ color: '#5f6368' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        {selectedNode && (
          <NodeDetailModal
            node={selectedNode}
            open={Boolean(selectedNode)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e8eaed',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 600, color: '#616161' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                Type
              </TableCell>
              {!isTablet && (
                <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                  Description
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                Due Date
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#616161' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nodes.map((node) => (
              <TableRow
                key={node._id}
                onClick={() => node.type === 'folder' && onNodeClick(node._id)}
                sx={{
                  cursor: node.type === 'folder' ? 'pointer' : 'default',
                  backgroundColor: node.type === 'folder' ? '#eff1f192' : 'white',
                  '&:hover': { backgroundColor: '#f8f9fa' },
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Name */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {node.type === 'folder' ? (
                      <FolderIcon sx={{ color: '#FFA726', fontSize: '1.5rem' }} />
                    ) : (
                      <FileIcon sx={{ color: '#42A5F5', fontSize: '1.5rem' }} />
                    )}
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}>
                      {getNodeName(node)}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Type */}
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                    {node.type === 'folder' ? 'Folder' : 'File'}
                  </Typography>
                </TableCell>

                {/* Description */}
                {!isTablet && (
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#5f6368',
                        fontSize: '0.875rem',
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {node.description ? node.description.slice(0, 20) + '.......' : '-'}
                    </Typography>
                  </TableCell>
                )}

                {/* Due Date */}
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: node.lastDate ? '#d32f2f' : '#5f6368',
                      fontSize: '0.875rem',
                      fontWeight: node.lastDate ? 600 : 400,
                    }}
                  >
                    {formatDate(node.lastDate)}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={(e) => handleViewClick(e, node)}
                        sx={{ color: '#5f6368', '&:hover': { backgroundColor: '#e3f2fd', color: '#1976d2' } }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                        sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onDelete(node._id); }}
                        sx={{ color: '#d32f2f', '&:hover': { backgroundColor: '#ffebee' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          open={Boolean(selectedNode)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </>
  );
};

export default SubnodeTable;