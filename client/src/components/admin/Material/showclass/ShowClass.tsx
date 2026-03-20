// import React, { useState, useEffect } from 'react';
// import {
//   Typography,
//   Button,
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Snackbar,
//   Alert,
//   Container,
//   Paper,
//   Fade,
//   Chip,
//   type SelectChangeEvent,
// } from '@mui/material';
// import { Add as AddIcon, School, FolderOpen, Warning } from '@mui/icons-material';
// import ClassCard from '../classcard/ClassCard';
// import ShowSubnode from '../showsubnode/ShowSubNode';

// import type { Node } from '../types/node';

// import { confirmFolderDeletion, createOrFetchClass, deleteSubFolder, getAllClasses, updateFolder } from '../services/FolderServiceApi';
// import { deleteFileFromDrive } from '../utils/googleDriveService';
// import { ClassCardSkeleton } from '../utils/CardSkeleton';
// import EditClassDialog from '../DialogForm/EditClassDialog';
// import { getTargetExams, getStreams } from '../../../../api/apiFunctions';

// // Available class options
// const CLASS_OPTIONS = [
//   { value: '9', label: 'Class 9' },
//   { value: '10', label: 'Class 10' },
//   { value: '11', label: 'Class 11' },
//   { value: '12', label: 'Class 12' },
//   { value: 'dropper-1', label: 'Dropper 1' },
//   { value: 'dropper-2', label: 'Dropper 2' },
// ];

// interface TargetExam {
//   _id: string;
//   name: string;
//   description?: string;
// }

// interface Stream {
//   _id: string;
//   name: string;
//   description?: string;
// }

// const ShowClass: React.FC = () => {
//   const [allNodes, setAllNodes] = useState<Node[]>([]);
//   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
//   const [isLoadingClasses, setIsLoadingClasses] = useState(true);

//   // Dialog states
//   const [openClassSelectionDialog, setOpenClassSelectionDialog] = useState(false);
//   const [selectedClassType, setSelectedClassType] = useState<string>('');
//   const [selectedTargetExamId, setSelectedTargetExamId] = useState<string>('');
//   const [selectedStreamId, setSelectedStreamId] = useState<string>('');
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [editingNode, setEditingNode] = useState<Node | null>(null);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);

//   // Dynamic options
//   const [targetExams, setTargetExams] = useState<TargetExam[]>([]);
//   const [streams, setStreams] = useState<Stream[]>([]);
//   const [isLoadingOptions, setIsLoadingOptions] = useState(true);

//   // Snackbar state
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: 'success' | 'error' | 'warning' | 'info';
//   }>({
//     open: false,
//     message: '',
//     severity: 'info',
//   });

//   // Fetch data when the component mounts
//   useEffect(() => {
//     const fetchClasses = async () => {
//       setIsLoadingClasses(true);
//       try {
//         const classes = await getAllClasses();
//         setAllNodes(classes);
//       } catch (error) {
//         console.error('Error fetching classes:', error);
//         setSnackbar({
//           open: true,
//           message: 'Failed to load classes',
//           severity: 'error',
//         });
//       } finally {
//         setIsLoadingClasses(false);
//       }
//     };

//     const fetchOptions = async () => {
//       setIsLoadingOptions(true);
//       try {
//         const [targetExamsResponse, streamsResponse] = await Promise.all([
//           getTargetExams(),
//           getStreams()
//         ]);

//         setTargetExams((targetExamsResponse.data as TargetExam[]) ?? []);
//         setStreams((streamsResponse.data as Stream[]) ?? []);
//       } catch (error) {
//         console.error('Error fetching options:', error);
//         setSnackbar({
//           open: true,
//           message: 'Failed to load target exams and streams',
//           severity: 'error',
//         });
//       } finally {
//         setIsLoadingOptions(false);
//       }
//     };

//     fetchClasses();
//     fetchOptions();
//   }, []);

//   // Get root classes (parentId === null)
//   const rootClasses = allNodes.filter((node) => node.parentId === null);

//   // Helper function to get name by ID
//   const getTargetExamName = (id: string): string => {
//     const exam = targetExams.find(exam => exam._id === id);
//     return exam?.name || id;
//   };

//   const getStreamName = (id: string): string => {
//     const stream = streams.find(stream => stream._id === id);
//     return stream?.name || id;
//   };

//   const handleClassClick = (classId: string) => {
//     setSelectedNodeId(classId);
//   };

//   const handleBackToClasses = () => {
//     setSelectedNodeId(null);
//   };

//   const handleOpenCreateDialog = () => {
//     setOpenClassSelectionDialog(true);
//     setSelectedClassType('');
//     setSelectedTargetExamId('');
//     setSelectedStreamId('');
//   };

//   const handleCloseClassSelectionDialog = () => {
//     setOpenClassSelectionDialog(false);
//     setSelectedClassType('');
//     setSelectedTargetExamId('');
//     setSelectedStreamId('');
//   };

//   const handleClassTypeChange = (event: SelectChangeEvent<string>) => {
//     setSelectedClassType(event.target.value);
//   };

//   const handleTargetExamTypeChange = (event: SelectChangeEvent<string>) => {
//     setSelectedTargetExamId(event.target.value);
//   };

//   const handleStreamTypeChange = (event: SelectChangeEvent<string>) => {
//     setSelectedStreamId(event.target.value);
//   };

//   const handleProceedToConfirm = () => {
//     if (selectedClassType && selectedTargetExamId && selectedStreamId) {
//       setOpenClassSelectionDialog(false);
//       setOpenConfirmDialog(true);
//     }
//   };

//   const handleCloseConfirmDialog = () => {
//     setOpenConfirmDialog(false);
//     setSelectedClassType('');
//     setSelectedTargetExamId('');
//     setSelectedStreamId('');
//   };

//   const handleConfirmCreateClass = async () => {
//     if (!selectedClassType || !selectedTargetExamId || !selectedStreamId) return;

//     const selectedOption = CLASS_OPTIONS.find(opt => opt.value === selectedClassType);
//     const className = selectedOption?.value || selectedClassType;

//     try {
//       // Pass the IDs to the API
//       console.log(className)
//       const response = await createOrFetchClass(className, selectedTargetExamId, selectedStreamId);

//       if (!response.success) {
//         throw new Error(response.message || 'Failed to create class');
//       }

//       const newNode: Node = {
//         _id: (response.data as { _id: string })._id,
//         heading: "",
//         targetExam: selectedTargetExamId, // Store ID
//         stream: selectedStreamId, // Store ID
//         type: 'folder',
//         classType: className,
//         parentId: null,
//         description: '',
//         tags: [],
//         fileDetails: [],
//         referenceDetails: [],
//       };

//       setAllNodes([...allNodes, newNode]);
//       handleCloseConfirmDialog();

//       setSnackbar({
//         open: true,
//         message: response.message || 'Class created successfully',
//         severity: 'success',
//       });
//     } catch (error: unknown) {
//       console.error('Error creating class:', error);
//       setSnackbar({
//         open: true,
//         message: error instanceof Error ? error.message : 'Error creating class',
//         severity: 'error',
//       });
//     }
//   };

//   const handleEditClass = (node: Node) => {
//     setEditingNode(node);
//     setOpenEditDialog(true);
//   };

//   const handleCloseEditDialog = () => {
//     setOpenEditDialog(false);
//     setEditingNode(null);
//   };

//   // Replace the handleSaveEdit function in ShowClass.tsx with this:

//   const handleSaveEdit = async (classType: string, targetExamId: string, streamId: string) => {
//     if (!editingNode) return;

//     try {
//       const updatedNode: Node = {
//         ...editingNode,
//         classType: classType,
//         targetExam: targetExamId,
//         stream: streamId
//       };

//       const result = await updateFolder(editingNode._id, updatedNode);

//       if ((result as { success: string }).success) {
//         // IMPORTANT: Use the data returned from backend 
//         // This includes the updated heading and path
//         const returnedData = (result as { data: Node }).data;

//         const updatedNodes = allNodes.map((node) =>
//           node._id === editingNode._id ? returnedData : node
//         );

//         setAllNodes(updatedNodes);
//         handleCloseEditDialog();

//         // Show success message with breadcrumb if available
//         const breadcrumb = (result as any).breadcrumb;
//         const message = breadcrumb
//           ? `Updated: ${breadcrumb}`
//           : 'Class updated successfully';

//         setSnackbar({
//           open: true,
//           message,
//           severity: 'success',
//         });
//       } else {
//         setSnackbar({
//           open: true,
//           message: ((result as { message: string }).message) || 'Failed to update class',
//           severity: 'error',
//         });
//       }
//     } catch (error: unknown) {
//       console.error('Error updating class:', error);
//       setSnackbar({
//         open: true,
//         message: 'Error updating class',
//         severity: 'error',
//       });
//     }
//   };

//   const handleDeleteClass = (classId: string) => {
//     setDeletingNodeId(classId);
//     setOpenDeleteDialog(true);
//   };

//   const handleCloseDeleteDialog = () => {
//     setOpenDeleteDialog(false);
//     setDeletingNodeId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (!deletingNodeId) return;

//     try {
//       const result = await deleteSubFolder(deletingNodeId);

//       if (result.requiresDriveDeletion && result.driveFileIds) {
//         handleCloseDeleteDialog();

//         setSnackbar({
//           open: true,
//           message: 'Deleting files from Google Drive...',
//           severity: 'info',
//         });

//         let deletedCount = 0;
//         for (const fileId of result.driveFileIds) {
//           try {
//             const success = await deleteFileFromDrive(fileId);
//             if (success) deletedCount++;
//           } catch (error) {
//             console.error('Error deleting file from Drive:', fileId, error);
//           }
//         }

//         const confirmData = await confirmFolderDeletion(result.folderId ? result.folderId : "");

//         if (confirmData.success) {
//           const updatedNodes = removeNodeAndChildren(deletingNodeId);
//           setAllNodes(updatedNodes);

//           setSnackbar({
//             open: true,
//             message: `Deleted ${deletedCount} file(s) from Drive and folder successfully`,
//             severity: 'success',
//           });
//         } else {
//           setSnackbar({
//             open: true,
//             message: confirmData.message || 'Failed to complete folder deletion',
//             severity: 'error',
//           });
//         }
//       } else if (result.success) {
//         const updatedNodes = removeNodeAndChildren(deletingNodeId);
//         setAllNodes(updatedNodes);
//         handleCloseDeleteDialog();

//         setSnackbar({
//           open: true,
//           message: result.message || 'Folder deleted successfully',
//           severity: 'success',
//         });
//       } else {
//         handleCloseDeleteDialog();
//         setSnackbar({
//           open: true,
//           message: result.message || 'Failed to delete folder',
//           severity: result.message?.includes('subfolders') ? 'warning' : 'error',
//         });
//       }
//     } catch (error: unknown) {
//       handleCloseDeleteDialog();
//       setSnackbar({
//         open: true,
//         message: error instanceof Error ? error.message : 'Error deleting folder',
//         severity: 'error',
//       });
//     }
//   };

//   const removeNodeAndChildren = (nodeId: string): typeof allNodes => {
//     const deleteNodeAndChildren = (id: string): string[] => {
//       const idsToDelete = [id];
//       const children = allNodes.filter((node) => node.parentId === id);
//       children.forEach((child) => {
//         idsToDelete.push(...deleteNodeAndChildren(child._id));
//       });
//       return idsToDelete;
//     };

//     const idsToDelete = deleteNodeAndChildren(nodeId);
//     return allNodes.filter((node) => !idsToDelete.includes(node._id));
//   };

//   const handleNodesUpdate = (updatedNodes: Node[]) => {
//     setAllNodes(updatedNodes);
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   console.log(allNodes)

//   if (selectedNodeId) {
//     return (
//       <ShowSubnode
//         nodeId={selectedNodeId}
//         nodes={allNodes}
//         onBack={handleBackToClasses}
//         onNodesUpdate={handleNodesUpdate}
//       />
//     );
//   }

//   const displayClasses = rootClasses.map((node) => ({
//     id: node._id,
//     name: node.heading,
//     tags: node.tags || [],
//     status: 'active' as const,
//     description: node.description,
//     classType: node.classType,
//     targetExam: getTargetExamName(node.targetExam), // Convert ID to name for display
//     stream: getStreamName(node.stream), // Convert ID to name for display
//     updatedAt: node.updatedAt,
//     fileDetails: node.fileDetails || [],
//     referenceDetails: node.referenceDetails || [],
//     createdAt: node.createdAt,
//     lastDate: node.lastDate,
//     node: node,
//   }));

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
//         pb: 6,
//       }}
//     >
//       <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
//         {/* Header Section */}
//         <Box
//           sx={{
//             mb: 4,
//             pb: 3,
//             borderBottom: '2px solid',
//             borderColor: 'divider',
//           }}
//         >
//           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               <Box
//                 sx={{
//                   width: 48,
//                   height: 48,
//                   borderRadius: '12px',
//                   background: 'linear-gradient(135deg, #124e41 0%, #175238 100%)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   mr: 2,
//                   boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
//                 }}
//               >
//                 <School sx={{ color: 'white', fontSize: 28 }} />
//               </Box>
//               <Box>
//                 <Typography
//                   variant="h4"
//                   sx={{
//                     fontWeight: 700,
//                     background: 'linear-gradient(135deg, #000705 0%, #01070e 100%)',
//                     backgroundClip: 'text',
//                     WebkitBackgroundClip: 'text',
//                     WebkitTextFillColor: 'transparent',
//                     fontSize: { xs: '1.5rem', sm: '2rem' },
//                   }}
//                 >
//                   My Classes
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                   Manage and view all your classes
//                 </Typography>
//               </Box>
//             </Box>

//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={handleOpenCreateDialog}
//               disabled={isLoadingClasses || isLoadingOptions}
//               sx={{
//                 background: 'linear-gradient(135deg, #031c19 0%, #042d20 100%)',
//                 color: 'white',
//                 textTransform: 'none',
//                 borderRadius: '10px',
//                 px: 3,
//                 py: 1.25,
//                 fontWeight: 600,
//                 boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
//                 '&:hover': {
//                   background: 'linear-gradient(135deg, #031c19 0%, #042d20 100%)',
//                   transform: 'translateY(-2px)',
//                   boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
//                 },
//                 transition: 'all 0.3s ease',
//               }}
//             >
//               Create Class
//             </Button>
//           </Box>

//           {/* Class Count Chip */}
//           {!isLoadingClasses && displayClasses.length > 0 && (
//             <Box sx={{ mt: 2 }}>
//               <Chip
//                 label={`${displayClasses.length} ${displayClasses.length === 1 ? 'class' : 'classes'}`}
//                 size="small"
//                 sx={{
//                   backgroundColor: '#afaeae',
//                   color: 'black',
//                   fontWeight: 600,
//                   fontSize: '0.75rem',
//                 }}
//               />
//             </Box>
//           )}
//         </Box>

//         {/* Loading or Class Display */}
//         {isLoadingClasses ? (
//           <ClassCardSkeleton count={6} />
//         ) : (
//           <Fade in={!isLoadingClasses} timeout={500}>
//             <Box>
//               {displayClasses.length === 0 ? (
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     textAlign: 'center',
//                     py: 8,
//                     borderRadius: '16px',
//                     border: '2px dashed #e0e0e0',
//                     backgroundColor: '#fafafa',
//                   }}
//                 >
//                   <FolderOpen
//                     sx={{
//                       fontSize: 64,
//                       color: '#bdbdbd',
//                       mb: 2,
//                     }}
//                   />
//                   <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
//                     No classes found
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//                     Get started by creating your first class
//                   </Typography>
//                   <Button
//                     variant="contained"
//                     startIcon={<AddIcon />}
//                     onClick={handleOpenCreateDialog}
//                     sx={{
//                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                       color: 'white',
//                       textTransform: 'none',
//                       borderRadius: '10px',
//                       px: 3,
//                       py: 1.25,
//                       fontWeight: 600,
//                     }}
//                   >
//                     Create Your First Class
//                   </Button>
//                 </Paper>
//               ) : (
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     gap: 3,
//                     '& > *': {
//                       flexBasis: {
//                         xs: '100%',
//                         sm: 'calc(50% - 12px)',
//                         md: 'calc(50% - 12px)',
//                       },
//                       flexGrow: 0,
//                       flexShrink: 0,
//                     },
//                   }}
//                 >
//                   {displayClasses.map((classItem) => (
//                     <Box key={classItem.id}>
//                       <ClassCard
//                         {...classItem}
//                         onClick={handleClassClick}
//                         onEdit={handleEditClass}
//                         onDelete={handleDeleteClass}
//                       />
//                     </Box>
//                   ))}
//                 </Box>
//               )}
//             </Box>
//           </Fade>
//         )}
//       </Container>

//       {/* Class Selection Dialog */}
//       <Dialog
//         open={openClassSelectionDialog}
//         onClose={handleCloseClassSelectionDialog}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: '16px',
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
//           Create New Class
//         </DialogTitle>
//         <DialogContent sx={{ pt: 3 }}>
//           <FormControl fullWidth sx={{ mb: 3 }}>
//             <InputLabel>Class</InputLabel>
//             <Select
//               value={selectedClassType}
//               label="Class"
//               onChange={handleClassTypeChange}
//               sx={{ borderRadius: '10px' }}
//             >
//               {CLASS_OPTIONS.map((option) => (
//                 <MenuItem key={option.value} value={option.value}>
//                   {option.label}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl fullWidth sx={{ mb: 3 }}>
//             <InputLabel>Target Exam</InputLabel>
//             <Select
//               value={selectedTargetExamId}
//               label="Target Exam"
//               onChange={handleTargetExamTypeChange}
//               sx={{ borderRadius: '10px' }}
//               disabled={isLoadingOptions || targetExams.length === 0}
//             >
//               {targetExams.map((exam) => (
//                 <MenuItem key={exam._id} value={exam._id}>
//                   {exam.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl fullWidth>
//             <InputLabel>Stream</InputLabel>
//             <Select
//               value={selectedStreamId}
//               label="Stream"
//               onChange={handleStreamTypeChange}
//               sx={{ borderRadius: '10px' }}
//               disabled={isLoadingOptions || streams.length === 0}
//             >
//               {streams.map((stream) => (
//                 <MenuItem key={stream._id} value={stream._id}>
//                   {stream.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <Paper
//             elevation={0}
//             sx={{
//               mt: 3,
//               p: 2,
//               backgroundColor: '#f5f5f5',
//               borderRadius: '10px',
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               Select the class details to create a new curriculum structure.
//             </Typography>
//           </Paper>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={handleCloseClassSelectionDialog} sx={{ textTransform: 'none' }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleProceedToConfirm}
//             variant="contained"
//             disabled={!selectedClassType || !selectedTargetExamId || !selectedStreamId}
//             sx={{
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               textTransform: 'none',
//               borderRadius: '8px',
//               px: 3,
//             }}
//           >
//             Continue
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Confirmation Dialog */}
//       <Dialog
//         open={openConfirmDialog}
//         onClose={handleCloseConfirmDialog}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: '16px',
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
//           Confirm Class Creation
//         </DialogTitle>
//         <DialogContent sx={{ pt: 3 }}>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             Are you sure you want to create this class?
//           </Typography>
//           <Paper
//             elevation={0}
//             sx={{
//               p: 2.5,
//               backgroundColor: '#f5f5f5',
//               borderRadius: '12px',
//             }}
//           >
//             <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
//               {CLASS_OPTIONS.find(opt => opt.value === selectedClassType)?.label}
//               {' • '}
//               {getTargetExamName(selectedTargetExamId)}
//               {' • '}
//               {getStreamName(selectedStreamId)}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               This will create a new class with default structure.
//             </Typography>
//           </Paper>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={handleCloseConfirmDialog} sx={{ textTransform: 'none' }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirmCreateClass}
//             variant="contained"
//             sx={{
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               textTransform: 'none',
//               borderRadius: '8px',
//               px: 3,
//             }}
//           >
//             Create Class
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Edit Class Dialog */}
//       {editingNode && (
//         <EditClassDialog
//           open={openEditDialog}
//           onClose={handleCloseEditDialog}
//           onSave={handleSaveEdit}
//           initialClassType={editingNode.heading}
//           initialTargetExamId={editingNode.targetExam} // Pass ID instead of name
//           initialStreamId={editingNode.stream} // Pass ID instead of name
//           targetExams={targetExams}
//           streams={streams}
//         />
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={openDeleteDialog}
//         onClose={handleCloseDeleteDialog}
//         PaperProps={{
//           sx: {
//             borderRadius: '16px',
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             fontWeight: 600,
//             color: '#d32f2f',
//             pb: 1,
//             borderBottom: '1px solid rgba(211, 47, 47, 0.2)',
//           }}
//         >
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Warning />
//             Confirm Delete
//           </Box>
//         </DialogTitle>
//         <DialogContent sx={{ pt: 3 }}>
//           <Typography color="text.secondary" sx={{ mb: 2 }}>
//             Are you sure you want to delete this class? This action cannot be undone.
//           </Typography>
//           <Paper
//             elevation={0}
//             sx={{
//               p: 2,
//               backgroundColor: '#ffebee',
//               borderRadius: '10px',
//               border: '1px solid #ffcdd2',
//             }}
//           >
//             <Typography sx={{ color: '#d32f2f', fontWeight: 500, fontSize: '0.9rem' }}>
//               ⚠️ This will delete all folders, files, and content inside this class.
//             </Typography>
//           </Paper>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={handleCloseDeleteDialog} sx={{ textTransform: 'none' }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirmDelete}
//             variant="contained"
//             color="error"
//             sx={{
//               textTransform: 'none',
//               borderRadius: '8px',
//               px: 3,
//             }}
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           sx={{
//             width: '100%',
//             borderRadius: '12px',
//             fontWeight: 500,
//           }}
//           variant="filled"
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ShowClass;

// ShowClass.tsx - Simplified Main Component
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning,
  FilterList,
} from '@mui/icons-material';
import ShowSubnode from '../showsubnode/ShowSubNode';

import type { Node } from '../types/node';

import {
  confirmFolderDeletion,
  createOrFetchClass,
  deleteSubFolder,
  getAllClasses,
  updateFolder,
} from '../services/FolderServiceApi';
import { deleteFileFromDrive } from '../utils/googleDriveService';
import EditClassDialog from '../DialogForm/EditClassDialog';
import { getTargetExams, getActiveStreams } from '../../../../api/apiFunctions';
import ClassFilters from '../classcardUtils/ClassFilters';
import ClassTableRow from '../classcardUtils/ClassTableRow';

const CLASS_OPTIONS = [
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
  { value: 'dropper-1', label: 'Dropper 1' },
  { value: 'dropper-2', label: 'Dropper 2' },
];

interface TargetExam {
  _id: string;
  name: string;
  description?: string;
}

interface Stream {
  _id: string;
  name: string;
  description?: string;
}

const ShowClass: React.FC = () => {
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Dialog states
  const [openClassSelectionDialog, setOpenClassSelectionDialog] = useState(false);
  const [selectedClassType, setSelectedClassType] = useState<string>('');
  const [selectedTargetExamId, setSelectedTargetExamId] = useState<string>('');
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);

  // Dynamic options
  const [targetExams, setTargetExams] = useState<TargetExam[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterClassType, setFilterClassType] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [filterTargetExam, setFilterTargetExam] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Fetch data
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const classes = await getAllClasses();
        setAllNodes(classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load classes',
          severity: 'error',
        });
      } finally {
        setIsLoadingClasses(false);
      }
    };

    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [targetExamsResponse, streamsResponse] = await Promise.all([
          getTargetExams(),
          getActiveStreams(),
        ]);

        setTargetExams((targetExamsResponse.data as TargetExam[]) ?? []);
        setStreams((streamsResponse.data as Stream[]) ?? []);
      } catch (error) {
        console.error('Error fetching options:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load target exams and streams',
          severity: 'error',
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchClasses();
    fetchOptions();
  }, []);

  // Get root classes
  const rootClasses = allNodes.filter((node) => node.parentId === null);

  // Safely extract stream/targetExam name from populated object or raw string/ID
  const getNameFromField = (field: { _id?: string; name?: string } | string | null | undefined): string => {
    if (!field) return '';
    if (typeof field === 'object' && field.name) return field.name;
    if (typeof field === 'string') {
      // It's a raw ID string — look it up in the loaded lists
      return field;
    }
    return '';
  };

  // console.log(allNodes[0])

  const getTargetExamName = (field: typeof allNodes[0]['targetExam']): string => getNameFromField(field as { _id?: string; name?: string } | string);
  const getStreamName = (field: typeof allNodes[0]['stream']): string => getNameFromField(field as { _id?: string; name?: string } | string | null);



  // Filter logic
  const filteredClasses = rootClasses.filter((node) => {
    const matchesSearch =
      searchTerm === '' ||
      node.classType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTargetExamName(node.targetExam).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStreamName(node.stream).toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTargetExam = filterTargetExam === '' || getTargetExamName(node.targetExam) === filterTargetExam;
    const matchesStream = filterStream === '' || getStreamName(node.stream) === filterStream;
    const matchesClassType = filterClassType === '' || node.classType === filterClassType;

    return matchesSearch && matchesTargetExam && matchesStream && matchesClassType;
  });

  // Handlers
  const handleClassClick = (classId: string) => {
    setSelectedNodeId(classId);
  };

  const handleBackToClasses = () => {
    setSelectedNodeId(null);
  };

  const handleOpenCreateDialog = () => {
    setOpenClassSelectionDialog(true);
    setSelectedClassType('');
    setSelectedTargetExamId('');
    setSelectedStreamId('');
  };

  const handleCloseClassSelectionDialog = () => {
    setOpenClassSelectionDialog(false);
  };

  const handleProceedToConfirm = () => {
    if (selectedClassType && selectedTargetExamId) {
      setOpenClassSelectionDialog(false);
      setOpenConfirmDialog(true);
    }
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedClassType('');
    setSelectedTargetExamId('');
    setSelectedStreamId('');
  };

  const handleConfirmCreateClass = async () => {
    if (!selectedClassType || !selectedTargetExamId) return;

    const className = CLASS_OPTIONS.find((opt) => opt.value === selectedClassType)?.value || selectedClassType;

    try {
      const response = await createOrFetchClass(className, selectedTargetExamId, selectedStreamId);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create class');
      }

      const newNode: Node = {
        _id: (response.data as { _id: string })._id,
        heading: '',
        targetExam: selectedTargetExamId,
        stream: selectedStreamId,
        type: 'folder',
        classType: className,
        parentId: null,
        description: '',
        tags: [],
        fileDetails: [],
        referenceDetails: [],
      };

      setAllNodes([...allNodes, newNode]);
      handleCloseConfirmDialog();

      setSnackbar({
        open: true,
        message: response.message || 'Class created successfully',
        severity: 'success',
      });
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error creating class:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error creating class',
        severity: 'error',
      });
    }
  };

  const handleEditClass = (node: Node) => {
    setEditingNode(node);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingNode(null);
  };

  const handleSaveEdit = async (classType: string, targetExamId: string, streamId: string) => {
    if (!editingNode) return;

    try {
      const updatedNode: Node = {
        ...editingNode,
        classType: classType,
        targetExam: targetExamId,
        stream: streamId,
      };

      interface UpdateFolderResponse {
        success: boolean;
        message?: string;
        data?: Node;
        breadcrumb?: string;
      }

      const result = (await updateFolder(editingNode._id, updatedNode)) as UpdateFolderResponse;

      if (result.success) {
        const returnedData = result.data as Node;

        const updatedNodes = allNodes.map((node) =>
          node._id === editingNode._id ? returnedData : node
        );

        setAllNodes(updatedNodes);
        handleCloseEditDialog();

        const breadcrumb = result.breadcrumb;
        const message = breadcrumb ? `Updated: ${breadcrumb}` : 'Class updated successfully';

        setSnackbar({
          open: true,
          message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update class',
          severity: 'error',
        });
      }
    } catch (error: unknown) {
      console.error('Error updating class:', error);
      setSnackbar({
        open: true,
        message: 'Error updating class',
        severity: 'error',
      });
    }
  };

  const handleDeleteClass = (classId: string) => {
    setDeletingNodeId(classId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingNodeId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNodeId) return;

    try {
      const result = await deleteSubFolder(deletingNodeId);

      if (result.requiresDriveDeletion && result.driveFileIds) {
        handleCloseDeleteDialog();

        setSnackbar({
          open: true,
          message: 'Deleting files from Google Drive...',
          severity: 'info',
        });

        let deletedCount = 0;
        for (const fileId of result.driveFileIds) {
          try {
            const success = await deleteFileFromDrive(fileId);
            if (success) deletedCount++;
          } catch (error) {
            console.error('Error deleting file from Drive:', fileId, error);
          }
        }

        const confirmData = await confirmFolderDeletion(result.folderId ? result.folderId : '');

        if (confirmData.success) {
          const updatedNodes = removeNodeAndChildren(deletingNodeId);
          setAllNodes(updatedNodes);

          setSnackbar({
            open: true,
            message: `Deleted ${deletedCount} file(s) from Drive and folder successfully`,
            severity: 'success',
          });
        } else {
          setSnackbar({
            open: true,
            message: confirmData.message || 'Failed to complete folder deletion',
            severity: 'error',
          });
        }
      } else if (result.success) {
        const updatedNodes = removeNodeAndChildren(deletingNodeId);
        setAllNodes(updatedNodes);
        handleCloseDeleteDialog();

        setSnackbar({
          open: true,
          message: result.message || 'Folder deleted successfully',
          severity: 'success',
        });
      } else {
        handleCloseDeleteDialog();
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete folder',
          severity: result.message?.includes('subfolders') ? 'warning' : 'error',
        });
      }
    } catch (error: unknown) {
      handleCloseDeleteDialog();
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error deleting folder',
        severity: 'error',
      });
    }
  };

  const removeNodeAndChildren = (nodeId: string): typeof allNodes => {
    const deleteNodeAndChildren = (id: string): string[] => {
      const idsToDelete = [id];
      const children = allNodes.filter((node) => node.parentId === id);
      children.forEach((child) => {
        idsToDelete.push(...deleteNodeAndChildren(child._id));
      });
      return idsToDelete;
    };

    const idsToDelete = deleteNodeAndChildren(nodeId);
    return allNodes.filter((node) => !idsToDelete.includes(node._id));
  };

  const handleNodesUpdate = (updatedNodes: Node[]) => {
    setAllNodes(updatedNodes);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (selectedNodeId) {
    return (
      <ShowSubnode
        nodeId={selectedNodeId}
        nodes={allNodes}
        onBack={handleBackToClasses}
        onNodesUpdate={handleNodesUpdate}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        pb: 6,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4, pb: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ mb: { xs: 2, sm: 0 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              Material Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and organize all classes for students
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={isLoadingClasses || isLoadingOptions}
            sx={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              textTransform: 'none',
              borderRadius: '8px',
              px: { xs: 3, sm: 3 }, // Padding for mobile
              py: { xs: 1.5, sm: 1.25 }, // Adjust vertical padding for mobile
              fontWeight: 600,
              fontSize: { xs: '16px', sm: '16px' }, // Adjust font size for mobile
              width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on larger screens
              '&:hover': {
                backgroundColor: '#333',
              },
            }}
          >
            Create A Class
          </Button>
        </Box>


        {/* Filters */}
        <ClassFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterTag={filterTag}
          onTagChange={setFilterTag}
          filterClassType={filterClassType}
          onClassTypeChange={setFilterClassType}
          filterStream={filterStream}
          onStreamChange={setFilterStream}
          filterTargetExam={filterTargetExam}
          onTargetExamChange={setFilterTargetExam}
          targetExams={targetExams}
          streams={streams}
          classOptions={CLASS_OPTIONS}
        />

        {/* Results count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList sx={{ color: '#9e9e9e', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Showing {filteredClasses.length} of {rootClasses.length} classes
          </Typography>
        </Box>

        {/* Table */}
        {isLoadingClasses ? (
          <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          </Paper>
        ) : filteredClasses.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 8,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              No classes found. Create your first classes!
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#616161' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                    Streams
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', sm: 'table-cell' } }}>
                    Target Exams
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#616161' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClasses.map((node) => (
                  <ClassTableRow
                    key={node._id}
                    node={node}
                    classType={node.classType || ''}
                    targetExam={getTargetExamName(node.targetExam)}
                    stream={getStreamName(node.stream)}
                    description={node.description}
                    createdAt={node.createdAt}
                    onClick={handleClassClick}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClass}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Dialogs remain the same... */}
      <Dialog
        open={openClassSelectionDialog}
        onClose={handleCloseClassSelectionDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
          Create New Class
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClassType}
              label="Class"
              onChange={(e: SelectChangeEvent<string>) => setSelectedClassType(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              {CLASS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Target Exam</InputLabel>
            <Select
              value={selectedTargetExamId}
              label="Target Exam"
              onChange={(e: SelectChangeEvent<string>) => setSelectedTargetExamId(e.target.value)}
              sx={{ borderRadius: '10px' }}
              disabled={isLoadingOptions || targetExams.length === 0}
            >
              {targetExams.map((exam) => (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedClassType === '9' || selectedClassType === '10' ? (null) : (
            <FormControl fullWidth>
              <InputLabel>Stream</InputLabel>
              <Select
                value={selectedStreamId}
                label="Stream"
                onChange={(e: SelectChangeEvent<string>) => setSelectedStreamId(e.target.value)}
                sx={{ borderRadius: '10px' }}
                disabled={isLoadingOptions || streams.length === 0}
              >
                {streams.map((stream) => (
                  <MenuItem key={stream._id} value={stream._id}>
                    {stream.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}


        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseClassSelectionDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleProceedToConfirm}
            variant="contained"
            disabled={!selectedClassType || !selectedTargetExamId}
            sx={{
              background: '#1a1a1a',
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Class Creation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to create this class?
          </Typography>
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {CLASS_OPTIONS.find((opt) => opt.value === selectedClassType)?.label}
              {' • '}
              {targetExams.find((e) => e._id === selectedTargetExamId)?.name ?? selectedTargetExamId}
              {selectedStreamId && (
                <>
                  {' • '}
                  {streams.find((s) => s._id === selectedStreamId)?.name ?? selectedStreamId}
                </>
              )}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmCreateClass} variant="contained">
            Create Class
          </Button>
        </DialogActions>
      </Dialog>

      {editingNode && (
        <EditClassDialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEdit}
          initialClassType={editingNode.heading}
          initialTargetExamId={
            typeof editingNode.targetExam === 'object' && editingNode.targetExam
              ? (editingNode.targetExam as { _id: string })._id
              : (editingNode.targetExam as string) ?? ''
          }
          initialStreamId={
            typeof editingNode.stream === 'object' && editingNode.stream
              ? (editingNode.stream as { _id: string })._id
              : (editingNode.stream as string) ?? ''
          }
          targetExams={targetExams}
          streams={streams}
        />
      )}

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ color: '#d32f2f' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete this class? This action cannot be undone.
          </Typography>
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: '8px' }}>
            <Typography sx={{ color: '#d32f2f', fontWeight: 500, fontSize: '0.9rem' }}>
              ⚠️ This will delete all folders, files, and content inside this class.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShowClass;