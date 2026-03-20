
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   IconButton,
//   Chip,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   Paper,
//   Divider,
//   CircularProgress,
//   LinearProgress,
// } from '@mui/material';
// import {
//   Close as CloseIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   InsertDriveFile as FileIcon,
//   Link as LinkIcon,
//   CloudUpload as CloudUploadIcon,
// } from '@mui/icons-material';
// import type { Node } from '../types/node';
// import type { FileDetail } from '../types/FileDetail';
// import type { ReferenceDetail } from '../types/referenceDetails';
// import { deleteFileFromDrive, initGoogleDrive, isGoogleDriveInitialized, uploadMultipleFiles } from '../utils/googleDriveService';
// import FileBrowserModal from './FileBrowserModal';
// import { getAllSubjects } from '../../../../api/apiFunctions';


// interface NodeDialogFormProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (node: Partial<Node>) => void;
//   initialData?: Partial<Node>;
//   title: string;
//   parentId: string;
//   depth?: number; // Add depth prop to know if this is first level
// }

// interface ISubjectUI {
//   _id: string;
//   name: string;
//   isActive: boolean;
// }

// interface ISubjectResponse {
//   subjects: ISubjectUI[];
// }

// const NodeDialogForm: React.FC<NodeDialogFormProps> = ({
//   open,
//   onClose,
//   onSave,
//   initialData = {},
//   title,
//   parentId,
//   depth = 0,
// }) => {
//   const isEdit = !!initialData._id;
//   const isFirstDepth = depth === 1; // Check if this is first depth (child of root)

//   const [formData, setFormData] = useState<Partial<Node>>({
//     heading: initialData.heading || '',
//     type: initialData.type || 'folder',
//     description: initialData.description || '',
//     tags: initialData.tags || [],
//     lastDate: initialData.lastDate || '',
//     fileDetails: initialData.fileDetails || [],
//     referenceDetails: initialData.referenceDetails || [],
//   });

//   const [currentTag, setCurrentTag] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
//   const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
//   const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
//   const [newFile, setNewFile] = useState<FileDetail>({
//     fileName: '',
//     uploadLink: '',
//   });
//   const [newReference, setNewReference] = useState<ReferenceDetail>({
//     fileName: '',
//     referenceLink: '',
//   });

//   // Subject-related state
//   const [subjects, setSubjects] = useState<any[]>([]);
//   const [loadingSubjects, setLoadingSubjects] = useState(false);
//   const [selectedSubject, setSelectedSubject] = useState('');

//   const initialDataRef = useRef(initialData);
//   const cancelUpload = useRef<boolean>(false);

//   useEffect(() => {
//     initialDataRef.current = initialData;
//   }, [initialData]);

//   // Fetch subjects when dialog opens and it's first depth
//   useEffect(() => {
//     const fetchSubjects = async () => {
//       if (!isFirstDepth) return;

//       setLoadingSubjects(true);
//       try {
//         const res = await getAllSubjects();
//         if (res.success && res.data && (res.data as ISubjectResponse).subjects) {
//           setSubjects((res.data as ISubjectResponse).subjects);
//         }
//       } catch (error) {
//         console.error('Error fetching subjects:', error);
//       } finally {
//         setLoadingSubjects(false);
//       }
//     };

//     if (open) {
//       fetchSubjects();
//       initGoogleDrive();
//     }
//   }, [open, isFirstDepth]);

//   // Reset form when dialog opens
//   useEffect(() => {
//     if (open) {
//       const data = initialDataRef.current;
//       setFormData({
//         heading: data.heading || '',
//         type: data.type || 'folder',
//         description: data.description || '',
//         tags: data.tags || [],
//         lastDate: data.lastDate || '',
//         fileDetails: data.fileDetails || [],
//         referenceDetails: data.referenceDetails || [],
//       });

//       setCurrentTag('');
//       setNewFile({ fileName: '', uploadLink: '' });
//       setNewReference({ fileName: '', referenceLink: '' });
//       setSelectedFiles(null);
//       setUploadProgress({});
//       setUploading(false);
//       cancelUpload.current = false;
//       setSelectedSubject(data.heading || ''); // Pre-select if editing
//     }
//   }, [open]);

//   // Handle subject selection
//   const handleSubjectChange = (event: any) => {
//     const subjectName = event.target.value;
//     setSelectedSubject(subjectName);
//     setFormData({ ...formData, heading: subjectName });
//   };

//   // Handle file selection
//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       setSelectedFiles(files);
//     }
//   };

//   // Handle file upload using the centralized API
//   const handleUploadClick = async () => {
//     if (!selectedFiles || selectedFiles.length === 0) return;

//     if (!isGoogleDriveInitialized()) {
//       alert('Google Drive API is not initialized. Please try again.');
//       return;
//     }

//     setUploading(true);
//     cancelUpload.current = false;
//     const filesArray = Array.from(selectedFiles);

//     try {
//       const uploadedFiles = await uploadMultipleFiles(
//         filesArray,
//         (fileName, progress) => {
//           setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
//         },
//         (fileName, result) => {
//           if (!result) {
//             alert(`Failed to upload ${fileName}`);
//           }
//         }
//       );

//       if (uploadedFiles.length > 0) {
//         setFormData({
//           ...formData,
//           fileDetails: [...(formData.fileDetails || []), ...uploadedFiles],
//         });
//       }

//       setSelectedFiles(null);
//       setUploadProgress({});
//     } catch (error: unknown) {
//       console.error('Upload error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       alert(`Upload failed: ${errorMessage}`);
//     } finally {
//       setUploading(false);
//       setUploadProgress({});
//     }
//   };

//   // Delete file using centralized API
//   const handleRemoveFile = async (index: number) => {
//     const fileToRemove = formData.fileDetails?.[index];

//     if (fileToRemove?.fileId) {
//       const deleted = await deleteFileFromDrive(fileToRemove.fileId);
//       if (!deleted) {
//         alert('Failed to delete file from Google Drive. Removing from list anyway.');
//       }
//     }

//     setFormData({
//       ...formData,
//       fileDetails: (formData.fileDetails || []).filter((_, i) => i !== index),
//     });
//   };

//   const handleAddTag = () => {
//     if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
//       setFormData({ ...formData, tags: [...(formData.tags || []), currentTag.trim()] });
//       setCurrentTag('');
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData({
//       ...formData,
//       tags: (formData.tags || []).filter((t) => t !== tagToRemove),
//     });
//   };

//   const handleAddFile = () => {
//     if (newFile.fileName.trim() && newFile.uploadLink.trim()) {
//       setFormData({
//         ...formData,
//         fileDetails: [...(formData.fileDetails || []), { ...newFile }],
//       });
//       setNewFile({ fileName: '', uploadLink: '' });
//     }
//   };

//   const handleAddReference = () => {
//     if (newReference.fileName.trim() && newReference.referenceLink.trim()) {
//       setFormData({
//         ...formData,
//         referenceDetails: [...(formData.referenceDetails || []), { ...newReference }],
//       });
//       setNewReference({ fileName: '', referenceLink: '' });
//     }
//   };

//   const handleRemoveReference = (index: number) => {
//     setFormData({
//       ...formData,
//       referenceDetails: (formData.referenceDetails || []).filter((_, i) => i !== index),
//     });
//   };

//   const handleSave = () => {
//     if (!formData.heading?.trim()) return;

//     onSave({
//       ...formData,
//       heading: formData.heading.trim(),
//       parentId,
//       type: formData.type,
//       tags: formData.tags?.length ? formData.tags : undefined,
//       fileDetails: formData.fileDetails?.length ? formData.fileDetails : undefined,
//       referenceDetails: formData.referenceDetails?.length ? formData.referenceDetails : undefined,
//     });

//     onClose();
//   };

//   const handleCancel = () => {
//     cancelUpload.current = true;
//     setUploading(false);
//     setUploadProgress({});
//     setSelectedFiles(null);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h6" sx={{ fontWeight: 600 }}>
//           {title}
//         </Typography>
//         <IconButton onClick={handleCancel}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent dividers sx={{ maxHeight: '70vh' }}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
//           {/* Type Selection */}
//           <FormControl fullWidth disabled={isFirstDepth ? true : false}>
//             <InputLabel>Type</InputLabel>
//             <Select
//               value={formData.type || 'folder'}
//               label="Type"
//               onChange={(e) => setFormData({ ...formData, type: e.target.value as 'folder' | 'file' })}
//             >
//               <MenuItem value="folder">Folder</MenuItem>
//               <MenuItem value="file">File</MenuItem>
//             </Select>
//           </FormControl>

//           {/* Subject Dropdown for First Depth OR Regular Heading Input */}
//           {isFirstDepth ? (
//             <FormControl fullWidth required>
//               <InputLabel>Select Subject</InputLabel>
//               <Select
//                 value={selectedSubject}
//                 label="Select Subject"
//                 onChange={handleSubjectChange}
//                 disabled={loadingSubjects}
//               >
//                 {loadingSubjects ? (
//                   <MenuItem disabled>
//                     <CircularProgress size={20} sx={{ mr: 1 }} />
//                     Loading subjects...
//                   </MenuItem>
//                 ) : subjects.length === 0 ? (
//                   <MenuItem disabled>No subjects available</MenuItem>
//                 ) : (
//                   subjects.map((subject) => (
//                     <MenuItem key={subject._id || subject.id} value={subject.name || subject.subjectName}>
//                       {subject.name || subject.subjectName}
//                     </MenuItem>
//                   ))
//                 )}
//               </Select>
//             </FormControl>
//           ) : (
//             <TextField
//               label={formData.type === 'folder' ? 'Folder Name' : 'File Name'}
//               required
//               fullWidth
//               value={formData.heading || ''}
//               onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
//               placeholder={formData.type === 'folder' ? 'e.g., Chapter 1: Limits' : 'e.g., Lecture Notes.pdf'}
//             />
//           )}

//           {/* Description */}
//           <TextField
//             label="Description (optional)"
//             multiline
//             rows={3}
//             fullWidth
//             value={formData.description || ''}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           />

//           {/* Due Date */}
//           <TextField
//             label="Due Date (optional)"
//             type="date"
//             fullWidth
//             InputLabelProps={{ shrink: true }}
//             value={formData.lastDate || ''}
//             onChange={(e) => setFormData({ ...formData, lastDate: e.target.value || undefined })}
//           />

//           {/* Tags */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
//               Tags (optional)
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//               <TextField
//                 size="small"
//                 fullWidth
//                 value={currentTag}
//                 onChange={(e) => setCurrentTag(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     e.preventDefault();
//                     handleAddTag();
//                   }
//                 }}
//                 placeholder="Type tag and press Enter"
//               />
//               <Button variant="outlined" onClick={handleAddTag} startIcon={<AddIcon />}>
//                 Add
//               </Button>
//             </Box>
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//               {(formData.tags || []).map((tag) => (
//                 <Chip
//                   key={tag}
//                   label={tag}
//                   onDelete={() => handleRemoveTag(tag)}
//                   color="primary"
//                   variant="outlined"
//                 />
//               ))}
//             </Box>
//           </Box>

//           <Divider />

//           {/* File Details Section with Upload */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
//               <FileIcon fontSize="small" />
//               {formData.type === 'folder' ? 'Prerequisite (optional)' : 'File Details (optional)'}
//             </Typography>

//             {/* Upload Files to Google Drive */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                   Upload files directly to Google Drive (Multiple files supported)
//                 </Typography>

//                 <Button
//                   variant="outlined"
//                   component="label"
//                   startIcon={<CloudUploadIcon />}
//                   fullWidth
//                   disabled={uploading}
//                 >
//                   Select Files
//                   <input type="file" hidden multiple onChange={handleFileSelect} />
//                 </Button>

//                 {selectedFiles && selectedFiles.length > 0 && (
//                   <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
//                     <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                       Selected Files ({selectedFiles.length}):
//                     </Typography>
//                     {Array.from(selectedFiles).map((file, idx) => (
//                       <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
//                         • {file.name} ({(file.size / 1024).toFixed(1)} KB)
//                       </Typography>
//                     ))}
//                   </Box>
//                 )}

//                 <Button
//                   variant="contained"
//                   onClick={handleUploadClick}
//                   startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
//                   disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
//                   fullWidth
//                 >
//                   {uploading ? 'Uploading...' : 'Upload to Google Drive'}
//                 </Button>

//                 {Object.keys(uploadProgress).length > 0 && (
//                   <Box sx={{ mt: 1 }}>
//                     {Object.entries(uploadProgress).map(([fileName, progress]) => (
//                       <Box key={fileName} sx={{ mb: 1 }}>
//                         <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
//                           {fileName}
//                         </Typography>
//                         <LinearProgress variant="determinate" value={progress} />
//                       </Box>
//                     ))}
//                   </Box>
//                 )}
//               </Box>
//             </Paper>

//             {/* Link Existing Files Button */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, color: "white" }}>
//                 <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                   Link files that are already uploaded in other folders
//                 </Typography>
//                 <Button
//                   variant="contained"
//                   sx={{ color: "white" }}
//                   onClick={() => setFileBrowserOpen(true)}
//                   startIcon={<LinkIcon />}
//                   fullWidth
//                 >
//                   Browse Existing Files
//                 </Button>
//               </Box>
//             </Paper>

//             <FileBrowserModal
//               open={fileBrowserOpen}
//               onClose={() => setFileBrowserOpen(false)}
//               onSelectFiles={(files) => {
//                 setFormData({
//                   ...formData,
//                   fileDetails: [...(formData.fileDetails || []), ...files],
//                 });
//               }}
//               alreadySelectedFiles={formData.fileDetails}
//             />

//             {/* Manual Link Entry */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
//               <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
//                 Or add link manually
//               </Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <TextField
//                   size="small"
//                   label="File Name"
//                   fullWidth
//                   value={newFile.fileName}
//                   onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
//                   placeholder="e.g., Lecture_Notes_Week1.pdf"
//                 />
//                 <TextField
//                   size="small"
//                   label="Upload Link / URL"
//                   fullWidth
//                   value={newFile.uploadLink}
//                   onChange={(e) => setNewFile({ ...newFile, uploadLink: e.target.value })}
//                   placeholder="e.g., https://drive.google.com/..."
//                 />
//                 <Button
//                   variant="contained"
//                   onClick={handleAddFile}
//                   startIcon={<AddIcon />}
//                   disabled={!newFile.fileName.trim() || !newFile.uploadLink.trim()}
//                   size="small"
//                 >
//                   Add File Link
//                 </Button>
//               </Box>
//             </Paper>

//             {/* Existing Files List */}
//             {(formData.fileDetails || []).length > 0 && (
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                   Uploaded Files ({formData.fileDetails?.length})
//                 </Typography>
//                 {formData.fileDetails?.map((file, index) => (
//                   <Paper key={index} variant="outlined" sx={{ p: 2 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
//                           {file.fileName}
//                         </Typography>
//                         <Typography
//                           variant="caption"
//                           color="text.secondary"
//                           sx={{
//                             wordBreak: 'break-all',
//                             display: 'block',
//                             '& a': { color: 'primary.main', textDecoration: 'none' },
//                           }}
//                         >
//                           <a href={file.uploadLink} target="_blank" rel="noopener noreferrer">
//                             {file.uploadLink}
//                           </a>
//                         </Typography>
//                         {file.fileId && (
//                           <Chip label="Google Drive" size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
//                         )}
//                       </Box>
//                       <IconButton size="small" onClick={() => handleRemoveFile(index)} color="error">
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </Paper>
//                 ))}
//               </Box>
//             )}
//           </Box>

//           <Divider />

//           {/* Reference Details Section */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
//               <LinkIcon fontSize="small" />
//               Reference Details (optional)
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <TextField
//                   size="small"
//                   label="Reference Name"
//                   fullWidth
//                   value={newReference.fileName}
//                   onChange={(e) => setNewReference({ ...newReference, fileName: e.target.value })}
//                   placeholder="e.g., Textbook Chapter 3"
//                 />
//                 <TextField
//                   size="small"
//                   label="Reference Link / URL"
//                   fullWidth
//                   value={newReference.referenceLink}
//                   onChange={(e) => setNewReference({ ...newReference, referenceLink: e.target.value })}
//                   placeholder="e.g., https://example.com/resource"
//                 />
//                 <Button
//                   variant="contained"
//                   onClick={handleAddReference}
//                   startIcon={<AddIcon />}
//                   disabled={!newReference.fileName.trim() || !newReference.referenceLink.trim()}
//                   size="small"
//                 >
//                   Add Reference
//                 </Button>
//               </Box>
//             </Paper>

//             {(formData.referenceDetails || []).length > 0 && (
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 {formData.referenceDetails?.map((ref, index) => (
//                   <Paper key={index} variant="outlined" sx={{ p: 2 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
//                           {ref.fileName}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
//                           <a href={ref.referenceLink} target="_blank" rel="noopener noreferrer">
//                             {ref.referenceLink}
//                           </a>
//                         </Typography>
//                       </Box>
//                       <IconButton size="small" onClick={() => handleRemoveReference(index)} color="error">
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </Paper>
//                 ))}
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, py: 2 }}>
//         <Button onClick={handleCancel} variant="outlined">
//           Cancel
//         </Button>
//         <Button onClick={handleSave} variant="contained" disabled={!formData.heading?.trim() || uploading}>
//           {isEdit ? 'Save Changes' : 'Create'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default NodeDialogForm;


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   IconButton,
//   Chip,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   Paper,
//   Divider,
//   CircularProgress,
//   LinearProgress,
// } from '@mui/material';
// import {
//   Close as CloseIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   InsertDriveFile as FileIcon,
//   Link as LinkIcon,
//   CloudUpload as CloudUploadIcon,
// } from '@mui/icons-material';
// import type { Node } from '../types/node';
// import type { FileDetail } from '../types/FileDetail';
// import type { ReferenceDetail } from '../types/referenceDetails';
// import { deleteFileFromDrive, initGoogleDrive, isGoogleDriveInitialized, uploadMultipleFiles } from '../utils/googleDriveService';
// import FileBrowserModal from './FileBrowserModal';
// import { getAllSubjects } from '../../../../api/apiFunctions';


// interface NodeDialogFormProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (node: Partial<Node>) => void;
//   initialData?: Partial<Node>;
//   title: string;
//   parentId: string;
//   depth?: number;
// }

// interface ISubjectUI {
//   _id: string;
//   name: string;
//   isActive: boolean;
// }

// interface ISubjectResponse {
//   subjects: ISubjectUI[];
// }

// const NodeDialogForm: React.FC<NodeDialogFormProps> = ({
//   open,
//   onClose,
//   onSave,
//   initialData = {},
//   title,
//   parentId,
//   depth = 0,
// }) => {
//   const isEdit = !!initialData._id;
//   const isFirstDepth = depth === 1; // Check if this is first depth (child of root)

//   const [formData, setFormData] = useState<Partial<Node>>({
//     heading: initialData.heading || '',
//     type: initialData.type || 'folder',
//     description: initialData.description || '',
//     tags: initialData.tags || [],
//     lastDate: initialData.lastDate || '',
//     fileDetails: initialData.fileDetails || [],
//     referenceDetails: initialData.referenceDetails || [],
//     subject: initialData.subject || undefined,
//   });

//   const [currentTag, setCurrentTag] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
//   const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
//   const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
//   const [newFile, setNewFile] = useState<FileDetail>({
//     fileName: '',
//     uploadLink: '',
//   });
//   const [newReference, setNewReference] = useState<ReferenceDetail>({
//     fileName: '',
//     referenceLink: '',
//   });

//   // Subject-related state
//   const [subjects, setSubjects] = useState<ISubjectUI[]>([]);
//   const [loadingSubjects, setLoadingSubjects] = useState(false);
//   const [selectedSubjectId, setSelectedSubjectId] = useState('');
//   const [useManualHeading, setUseManualHeading] = useState(false);

//   const initialDataRef = useRef(initialData);
//   const cancelUpload = useRef<boolean>(false);

//   useEffect(() => {
//     initialDataRef.current = initialData;
//   }, [initialData]);

//   // Fetch subjects when dialog opens and it's first depth
//   useEffect(() => {
//     const fetchSubjects = async () => {
//       if (!isFirstDepth) return;

//       setLoadingSubjects(true);
//       try {
//         const res = await getAllSubjects();
//         console.log(res.data)
//         if (res.success && res.data && (res.data as ISubjectResponse).subjects) {
//           setSubjects((res.data as ISubjectResponse).subjects);
//         }
//       } catch (error) {
//         console.error('Error fetching subjects:', error);
//       } finally {
//         setLoadingSubjects(false);
//       }
//     };

//     if (open) {
//       fetchSubjects();
//       initGoogleDrive();
//     }
//   }, [open, isFirstDepth]);

//   // Reset form when dialog opens
//   useEffect(() => {
//     if (open) {
//       const data = initialDataRef.current;

//       // Determine if we're using subject or manual heading
//       const hasSubject = data.subject && typeof data.subject === 'object'
//         ? data?.subject?._id
//         : data.subject;

//       const subjectId =
//         typeof data.subject === 'object' && data.subject !== null && '_id' in data.subject
//           ? data.subject._id
//           : null;

//       console.log(subjectId);

//       setFormData({
//         heading: data.heading || '',
//         type: data.type || 'folder',
//         description: data.description || '',
//         tags: data.tags || [],
//         lastDate: data.lastDate || '',
//         fileDetails: data.fileDetails || [],
//         referenceDetails: data.referenceDetails || [],
//         subject: subjectId || undefined,
//       });

//       setCurrentTag('');
//       setNewFile({ fileName: '', uploadLink: '' });
//       setNewReference({ fileName: '', referenceLink: '' });
//       setSelectedFiles(null);
//       setUploadProgress({});
//       setUploading(false);
//       cancelUpload.current = false;

//       // Set subject selection state
//       if (hasSubject) {
//         setSelectedSubjectId(subjectId || '');
//         setUseManualHeading(false);
//       } else if (data.heading) {
//         setSelectedSubjectId('');
//         setUseManualHeading(true);
//       } else {
//         setSelectedSubjectId('');
//         setUseManualHeading(false);
//       }
//     }
//   }, [open]);

//   // Handle subject selection
//   const handleSubjectChange = (event: any) => {
//     const subjectId = event.target.value;

//     if (subjectId === 'manual') {
//       // User wants to enter manual heading
//       setUseManualHeading(true);
//       setSelectedSubjectId('');
//       setFormData({ ...formData, subject: undefined, heading: '' });
//     } else {
//       // User selected a subject
//       setUseManualHeading(false);
//       setSelectedSubjectId(subjectId);
//       setFormData({ ...formData, subject: subjectId, heading: '' });
//     }
//   };

//   // Handle manual heading input
//   const handleManualHeadingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, heading: event.target.value, subject: undefined });
//   };

//   // Handle file selection
//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       setSelectedFiles(files);
//     }
//   };

//   // Handle file upload using the centralized API
//   const handleUploadClick = async () => {
//     if (!selectedFiles || selectedFiles.length === 0) return;

//     if (!isGoogleDriveInitialized()) {
//       alert('Google Drive API is not initialized. Please try again.');
//       return;
//     }

//     setUploading(true);
//     cancelUpload.current = false;
//     const filesArray = Array.from(selectedFiles);

//     try {
//       const uploadedFiles = await uploadMultipleFiles(
//         filesArray,
//         (fileName, progress) => {
//           setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
//         },
//         (fileName, result) => {
//           if (!result) {
//             alert(`Failed to upload ${fileName}`);
//           }
//         }
//       );

//       if (uploadedFiles.length > 0) {
//         setFormData({
//           ...formData,
//           fileDetails: [...(formData.fileDetails || []), ...uploadedFiles],
//         });
//       }

//       setSelectedFiles(null);
//       setUploadProgress({});
//     } catch (error: unknown) {
//       console.error('Upload error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       alert(`Upload failed: ${errorMessage}`);
//     } finally {
//       setUploading(false);
//       setUploadProgress({});
//     }
//   };

//   // Delete file using centralized API
//   const handleRemoveFile = async (index: number) => {
//     const fileToRemove = formData.fileDetails?.[index];

//     if (fileToRemove?.fileId) {
//       const deleted = await deleteFileFromDrive(fileToRemove.fileId);
//       if (!deleted) {
//         alert('Failed to delete file from Google Drive. Removing from list anyway.');
//       }
//     }

//     setFormData({
//       ...formData,
//       fileDetails: (formData.fileDetails || []).filter((_, i) => i !== index),
//     });
//   };

//   const handleAddTag = () => {
//     if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
//       setFormData({ ...formData, tags: [...(formData.tags || []), currentTag.trim()] });
//       setCurrentTag('');
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData({
//       ...formData,
//       tags: (formData.tags || []).filter((t) => t !== tagToRemove),
//     });
//   };

//   const handleAddFile = () => {
//     if (newFile.fileName.trim() && newFile.uploadLink.trim()) {
//       setFormData({
//         ...formData,
//         fileDetails: [...(formData.fileDetails || []), { ...newFile }],
//       });
//       setNewFile({ fileName: '', uploadLink: '' });
//     }
//   };

//   const handleAddReference = () => {
//     if (newReference.fileName.trim() && newReference.referenceLink.trim()) {
//       setFormData({
//         ...formData,
//         referenceDetails: [...(formData.referenceDetails || []), { ...newReference }],
//       });
//       setNewReference({ fileName: '', referenceLink: '' });
//     }
//   };

//   const handleRemoveReference = (index: number) => {
//     setFormData({
//       ...formData,
//       referenceDetails: (formData.referenceDetails || []).filter((_, i) => i !== index),
//     });
//   };

//   const handleSave = () => {
//     console.log('handleSave called with formData:', formData);
//     console.log('selectedSubjectId:', selectedSubjectId);
//     console.log('useManualHeading:', useManualHeading);
//     console.log('isFirstDepth:', isFirstDepth);

//     // Validation: Either subject or heading must be present
//     if (isFirstDepth && !formData.subject && !formData.heading?.trim()) {
//       alert('Please select a subject or enter a heading');
//       return;
//     }

//     if (!isFirstDepth && !formData.heading?.trim()) {
//       alert('Please enter a heading');
//       return;
//     }

//     const dataToSave: Partial<Node> = {
//       type: formData.type,
//       tags: formData.tags?.length ? formData.tags : undefined,
//       fileDetails: formData.fileDetails?.length ? formData.fileDetails : undefined,
//       referenceDetails: formData.referenceDetails?.length ? formData.referenceDetails : undefined,
//       description: formData.description || undefined,
//       lastDate: formData.lastDate || undefined,
//     };

//     // Only add parentId for create operations
//     if (!isEdit) {
//       dataToSave.parentId = parentId;
//     }

//     // Add subject OR heading based on what's selected
//     if (isFirstDepth) {
//       if (formData.subject) {
//         dataToSave.subject = formData.subject || formData.subject;
//         // Don't send heading if subject is set
//       } else if (formData.heading?.trim()) {
//         dataToSave.heading = formData.heading.trim();
//         // Don't send subject if heading is set
//       }
//     } else {
//       dataToSave.heading = formData.heading?.trim();
//     }

//     console.log('dataToSave:', dataToSave);
//     onSave(dataToSave);
//     onClose();
//   };

//   const handleCancel = () => {
//     cancelUpload.current = true;
//     setUploading(false);
//     setUploadProgress({});
//     setSelectedFiles(null);
//     onClose();
//   };

//   // Get display name for selected subject
//   const getSelectedSubjectName = () => {
//     if (selectedSubjectId) {
//       const subject = subjects.find(s => s._id === selectedSubjectId);
//       return subject?.name || '';
//     }
//     return '';
//   };

//   // Check if save button should be disabled
//   const isSaveDisabled = () => {
//     if (uploading) return true;

//     if (isFirstDepth) {
//       // For first depth: either subject OR heading must be present
//       return !formData.subject && !formData.heading?.trim();
//     } else {
//       // For other depths: heading must be present
//       return !formData.heading?.trim();
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h6" sx={{ fontWeight: 600 }}>
//           {title}
//         </Typography>
//         <IconButton onClick={handleCancel}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent dividers sx={{ maxHeight: '70vh' }}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
//           {/* Type Selection */}
//           <FormControl fullWidth disabled={isFirstDepth}>
//             <InputLabel>Type</InputLabel>
//             <Select
//               value={formData.type || 'folder'}
//               label="Type"
//               onChange={(e) => setFormData({ ...formData, type: e.target.value as 'folder' | 'file' })}
//             >
//               <MenuItem value="folder">Folder</MenuItem>
//               <MenuItem value="file">File</MenuItem>
//             </Select>
//           </FormControl>

//           {/* Subject Selection or Manual Heading for First Depth */}
//           {isFirstDepth ? (
//             <>
//               {!useManualHeading ? (
//                 <FormControl fullWidth required>
//                   <InputLabel>Select Subject</InputLabel>
//                   <Select
//                     value={selectedSubjectId || ''}
//                     label="Select Subject"
//                     onChange={handleSubjectChange}
//                     disabled={loadingSubjects}
//                   >
//                     {loadingSubjects ? (
//                       <MenuItem disabled>
//                         <CircularProgress size={20} sx={{ mr: 1 }} />
//                         Loading subjects...
//                       </MenuItem>
//                     ) : subjects.length === 0 ? (
//                       <MenuItem disabled>No subjects available</MenuItem>
//                     ) : (
//                       [
//                         ...subjects.map((subject) => (
//                           <MenuItem key={subject._id} value={subject._id}>
//                             {subject.name}
//                           </MenuItem>
//                         )),
//                         <Divider key="divider" />,
//                         <MenuItem key="manual" value="manual">
//                           <em>Enter custom heading instead</em>
//                         </MenuItem>
//                       ]
//                     )}
//                   </Select>
//                 </FormControl>
//               ) : (
//                 <Box>
//                   <TextField
//                     label="Custom Heading"
//                     required
//                     fullWidth
//                     value={formData.heading || ''}
//                     onChange={handleManualHeadingChange}
//                     placeholder="e.g., Introduction"
//                   />
//                   <Button
//                     size="small"
//                     onClick={() => {
//                       setUseManualHeading(false);
//                       setFormData({ ...formData, heading: '', subject: undefined });
//                     }}
//                     sx={{ mt: 1 }}
//                   >
//                     ← Back to subject selection
//                   </Button>
//                 </Box>
//               )}

//               {/* Show selected subject name for clarity */}
//               {selectedSubjectId && !useManualHeading && (
//                 <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
//                   <Typography variant="body2" color="primary">
//                     <strong>Selected:</strong> {getSelectedSubjectName()}
//                   </Typography>
//                 </Box>
//               )}
//             </>
//           ) : (
//             <TextField
//               label={formData.type === 'folder' ? 'Folder Name' : 'File Name'}
//               required
//               fullWidth
//               value={formData.heading || ''}
//               onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
//               placeholder={formData.type === 'folder' ? 'e.g., Chapter 1: Limits' : 'e.g., Lecture Notes.pdf'}
//             />
//           )}

//           {/* Description */}
//           <TextField
//             label="Description (optional)"
//             multiline
//             rows={3}
//             fullWidth
//             value={formData.description || ''}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           />

//           {/* Due Date */}
//           <TextField
//             label="Due Date (optional)"
//             type="date"
//             fullWidth
//             InputLabelProps={{ shrink: true }}
//             value={formData.lastDate || ''}
//             onChange={(e) => setFormData({ ...formData, lastDate: e.target.value || undefined })}
//           />

//           {/* Tags */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
//               Tags (optional)
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//               <TextField
//                 size="small"
//                 fullWidth
//                 value={currentTag}
//                 onChange={(e) => setCurrentTag(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     e.preventDefault();
//                     handleAddTag();
//                   }
//                 }}
//                 placeholder="Type tag and press Enter"
//               />
//               <Button variant="outlined" onClick={handleAddTag} startIcon={<AddIcon />}>
//                 Add
//               </Button>
//             </Box>
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//               {(formData.tags || []).map((tag) => (
//                 <Chip
//                   key={tag}
//                   label={tag}
//                   onDelete={() => handleRemoveTag(tag)}
//                   color="primary"
//                   variant="outlined"
//                 />
//               ))}
//             </Box>
//           </Box>

//           <Divider />

//           {/* File Details Section with Upload */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
//               <FileIcon fontSize="small" />
//               {formData.type === 'folder' ? 'Prerequisite (optional)' : 'Material Details (optional)'}
//             </Typography>

//             {/* Upload Files to Google Drive */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                   Upload files directly to Google Drive (Multiple files supported)
//                 </Typography>

//                 <Button
//                   variant="outlined"
//                   component="label"
//                   startIcon={<CloudUploadIcon />}
//                   fullWidth
//                   disabled={uploading}
//                 >
//                   Select Files
//                   <input type="file" hidden multiple onChange={handleFileSelect} />
//                 </Button>

//                 {selectedFiles && selectedFiles.length > 0 && (
//                   <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
//                     <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                       Selected Files ({selectedFiles.length}):
//                     </Typography>
//                     {Array.from(selectedFiles).map((file, idx) => (
//                       <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
//                         • {file.name} ({(file.size / 1024).toFixed(1)} KB)
//                       </Typography>
//                     ))}
//                   </Box>
//                 )}

//                 <Button
//                   variant="contained"
//                   onClick={handleUploadClick}
//                   startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
//                   disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
//                   fullWidth
//                 >
//                   {uploading ? 'Uploading...' : 'Upload to Google Drive'}
//                 </Button>

//                 {Object.keys(uploadProgress).length > 0 && (
//                   <Box sx={{ mt: 1 }}>
//                     {Object.entries(uploadProgress).map(([fileName, progress]) => (
//                       <Box key={fileName} sx={{ mb: 1 }}>
//                         <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
//                           {fileName}
//                         </Typography>
//                         <LinearProgress variant="determinate" value={progress} />
//                       </Box>
//                     ))}
//                   </Box>
//                 )}
//               </Box>
//             </Paper>

//             {/* Link Existing Files Button */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                   Link files that are already uploaded in other folders
//                 </Typography>
//                 <Button
//                   variant="contained"
//                   onClick={() => setFileBrowserOpen(true)}
//                   startIcon={<LinkIcon />}
//                   fullWidth
//                 >
//                   Browse Existing Files
//                 </Button>
//               </Box>
//             </Paper>

//             <FileBrowserModal
//               open={fileBrowserOpen}
//               onClose={() => setFileBrowserOpen(false)}
//               onSelectFiles={(files) => {
//                 setFormData({
//                   ...formData,
//                   fileDetails: [...(formData.fileDetails || []), ...files],
//                 });
//               }}
//               alreadySelectedFiles={formData.fileDetails}
//             />

//             {/* Manual Link Entry */}
//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
//               <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
//                 Or add link manually
//               </Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <TextField
//                   size="small"
//                   label="File Name"
//                   fullWidth
//                   value={newFile.fileName}
//                   onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
//                   placeholder="e.g., Lecture_Notes_Week1.pdf"
//                 />
//                 <TextField
//                   size="small"
//                   label="Upload Link / URL"
//                   fullWidth
//                   value={newFile.uploadLink}
//                   onChange={(e) => setNewFile({ ...newFile, uploadLink: e.target.value })}
//                   placeholder="e.g., https://drive.google.com/..."
//                 />
//                 <Button
//                   variant="contained"
//                   onClick={handleAddFile}
//                   startIcon={<AddIcon />}
//                   disabled={!newFile.fileName.trim() || !newFile.uploadLink.trim()}
//                   size="small"
//                 >
//                   Add File Link
//                 </Button>
//               </Box>
//             </Paper>

//             {/* Existing Files List */}
//             {(formData.fileDetails || []).length > 0 && (
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                   Uploaded Files ({formData.fileDetails?.length})
//                 </Typography>
//                 {formData.fileDetails?.map((file, index) => (
//                   <Paper key={index} variant="outlined" sx={{ p: 2 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
//                           {file.fileName}
//                         </Typography>
//                         <Typography
//                           variant="caption"
//                           color="text.secondary"
//                           sx={{
//                             wordBreak: 'break-all',
//                             display: 'block',
//                             '& a': { color: 'primary.main', textDecoration: 'none' },
//                           }}
//                         >
//                           <a href={file.uploadLink} target="_blank" rel="noopener noreferrer">
//                             {file.uploadLink}
//                           </a>
//                         </Typography>
//                         {file.fileId && (
//                           <Chip label="Google Drive" size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
//                         )}
//                       </Box>
//                       <IconButton size="small" onClick={() => handleRemoveFile(index)} color="error">
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </Paper>
//                 ))}
//               </Box>
//             )}
//           </Box>

//           <Divider />

//           {/* Reference Details Section */}
//           <Box>
//             <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
//               <LinkIcon fontSize="small" />
//               Reference Details (optional)
//             </Typography>

//             <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <TextField
//                   size="small"
//                   label="Reference Name"
//                   fullWidth
//                   value={newReference.fileName}
//                   onChange={(e) => setNewReference({ ...newReference, fileName: e.target.value })}
//                   placeholder="e.g., Textbook Chapter 3"
//                 />
//                 <TextField
//                   size="small"
//                   label="Reference Link / URL"
//                   fullWidth
//                   value={newReference.referenceLink}
//                   onChange={(e) => setNewReference({ ...newReference, referenceLink: e.target.value })}
//                   placeholder="e.g., https://example.com/resource"
//                 />
//                 <Button
//                   variant="contained"
//                   onClick={handleAddReference}
//                   startIcon={<AddIcon />}
//                   disabled={!newReference.fileName.trim() || !newReference.referenceLink.trim()}
//                   size="small"
//                 >
//                   Add Reference
//                 </Button>
//               </Box>
//             </Paper>

//             {(formData.referenceDetails || []).length > 0 && (
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 {formData.referenceDetails?.map((ref, index) => (
//                   <Paper key={index} variant="outlined" sx={{ p: 2 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
//                           {ref.fileName}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
//                           <a href={ref.referenceLink} target="_blank" rel="noopener noreferrer">
//                             {ref.referenceLink}
//                           </a>
//                         </Typography>
//                       </Box>
//                       <IconButton size="small" onClick={() => handleRemoveReference(index)} color="error">
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </Paper>
//                 ))}
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, py: 2 }}>
//         <Button onClick={handleCancel} variant="outlined">
//           Cancel
//         </Button>
//         <Button onClick={handleSave} variant="contained" disabled={isSaveDisabled()}>
//           {isEdit ? 'Save Changes' : 'Create'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default NodeDialogForm;

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import type { Node } from '../types/node';
import type { FileDetail } from '../types/FileDetail';
import type { ReferenceDetail } from '../types/referenceDetails';
import { initGoogleDrive, isGoogleDriveInitialized, uploadMultipleFiles } from '../utils/googleDriveService';
import FileBrowserModal from './FileBrowserModal';
import { getAllSubjects } from '../../../../api/apiFunctions';


interface NodeDialogFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (node: Partial<Node>) => void;
  initialData?: Partial<Node>;
  title: string;
  parentId: string;
  depth?: number;
}

interface ISubjectUI {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ISubjectResponse {
  subjects: ISubjectUI[];
}

const NodeDialogForm: React.FC<NodeDialogFormProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
  title,
  parentId,
  depth = 0,
}) => {
  const isEdit = !!initialData._id;
  const isFirstDepth = depth === 1; // Check if this is first depth (child of root)

  const [formData, setFormData] = useState<Partial<Node>>({
    heading: initialData.heading || '',
    type: initialData.type || 'folder',
    description: initialData.description || '',
    tags: initialData.tags || [],
    lastDate: initialData.lastDate || '',
    fileDetails: initialData.fileDetails || [],
    referenceDetails: initialData.referenceDetails || [],
    subject: initialData.subject || undefined,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  const [newFile, setNewFile] = useState<FileDetail>({
    fileName: '',
    uploadLink: '',
  });
  const [newReference, setNewReference] = useState<ReferenceDetail>({
    fileName: '',
    referenceLink: '',
  });

  // Subject-related state
  const [subjects, setSubjects] = useState<ISubjectUI[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [useManualHeading, setUseManualHeading] = useState(false);

  const initialDataRef = useRef(initialData);
  const cancelUpload = useRef<boolean>(false);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  // Fetch subjects when dialog opens and it's first depth
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!isFirstDepth) return;

      setLoadingSubjects(true);
      try {
        const res = await getAllSubjects();
        // console.log(res.data)
        if (res.success && res.data && (res.data as ISubjectResponse).subjects) {
          setSubjects((res.data as ISubjectResponse).subjects);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    if (open) {
      fetchSubjects();
      initGoogleDrive();
    }
  }, [open, isFirstDepth]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const data = initialDataRef.current;

      // Determine if we're using subject or manual heading
      const hasSubject = data.subject && typeof data.subject === 'object'
        ? data?.subject?._id
        : data.subject;

      const subjectId =
        typeof data.subject === 'object' && data.subject !== null && '_id' in data.subject
          ? data.subject._id
          : null;

      // console.log(subjectId);

      setFormData({
        heading: data.heading || '',
        type: data.type || 'folder',
        description: data.description || '',
        tags: data.tags || [],
        lastDate: data.lastDate || '',
        fileDetails: data.fileDetails || [],
        referenceDetails: data.referenceDetails || [],
        subject: subjectId || undefined,
      });

      setCurrentTag('');
      setNewFile({ fileName: '', uploadLink: '' });
      setNewReference({ fileName: '', referenceLink: '' });
      setSelectedFiles(null);
      setUploadProgress({});
      setUploading(false);
      cancelUpload.current = false;

      // Set subject selection state
      if (hasSubject) {
        setSelectedSubjectId(subjectId || '');
        setUseManualHeading(false);
      } else if (data.heading) {
        setSelectedSubjectId('');
        setUseManualHeading(true);
      } else {
        setSelectedSubjectId('');
        setUseManualHeading(false);
      }
    }
  }, [open]);

  // Handle subject selection
  const handleSubjectChange = (event: any) => {
    const subjectId = event.target.value;

    if (subjectId === 'manual') {
      // User wants to enter manual heading
      setUseManualHeading(true);
      setSelectedSubjectId('');
      setFormData({ ...formData, subject: undefined, heading: '' });
    } else {
      // User selected a subject
      setUseManualHeading(false);
      setSelectedSubjectId(subjectId);
      setFormData({ ...formData, subject: subjectId, heading: '' });
    }
  };

  // Handle manual heading input
  const handleManualHeadingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, heading: event.target.value, subject: undefined });
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  // Handle file upload using the centralized API
  const handleUploadClick = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (!isGoogleDriveInitialized()) {
      alert('Google Drive API is not initialized. Please try again.');
      return;
    }

    setUploading(true);
    cancelUpload.current = false;
    const filesArray = Array.from(selectedFiles);

    try {
      const uploadedFiles = await uploadMultipleFiles(
        filesArray,
        (fileName, progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
        },
        (fileName, result) => {
          if (!result) {
            alert(`Failed to upload ${fileName}`);
          }
        }
      );

      if (uploadedFiles.length > 0) {
        setFormData({
          ...formData,
          fileDetails: [...(formData.fileDetails || []), ...uploadedFiles],
        });
      }

      setSelectedFiles(null);
      setUploadProgress({});
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Remove file from form only (don't delete from Drive)
  // const handleRemoveFile = (index: number) => {
  //   // Only remove from form state, don't delete from Google Drive
  //   // Users can manually delete files from Drive if needed
  //   setFormData({
  //     ...formData,
  //     fileDetails: (formData.fileDetails || []).filter((_, i) => i !== index),
  //   });
  // };

  // const handleAddTag = () => {
  //   if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
  //     setFormData({ ...formData, tags: [...(formData.tags || []), currentTag.trim()] });
  //     setCurrentTag('');
  //   }
  // };

  // const handleRemoveTag = (tagToRemove: string) => {
  //   setFormData({
  //     ...formData,
  //     tags: (formData.tags || []).filter((t) => t !== tagToRemove),
  //   });
  // };

  // const handleAddFile = () => {
  //   if (newFile.fileName.trim() && newFile.uploadLink.trim()) {
  //     setFormData({
  //       ...formData,
  //       fileDetails: [...(formData.fileDetails || []), { ...newFile }],
  //     });
  //     setNewFile({ fileName: '', uploadLink: '' });
  //   }
  // };

  // const handleAddReference = () => {
  //   if (newReference.fileName.trim() && newReference.referenceLink.trim()) {
  //     setFormData({
  //       ...formData,
  //       referenceDetails: [...(formData.referenceDetails || []), { ...newReference }],
  //     });
  //     setNewReference({ fileName: '', referenceLink: '' });
  //   }
  // };

  // const handleRemoveReference = (index: number) => {
  //   setFormData({
  //     ...formData,
  //     referenceDetails: (formData.referenceDetails || []).filter((_, i) => i !== index),
  //   });
  // };

  // const handleSave = () => {
  //   console.log('handleSave called with formData:', formData);
  //   console.log('selectedSubjectId:', selectedSubjectId);
  //   console.log('useManualHeading:', useManualHeading);
  //   console.log('isFirstDepth:', isFirstDepth);

  //   // Validation: Either subject or heading must be present
  //   if (isFirstDepth && !formData.subject && !formData.heading?.trim()) {
  //     alert('Please select a subject or enter a heading');
  //     return;
  //   }

  //   if (!isFirstDepth && !formData.heading?.trim()) {
  //     alert('Please enter a heading');
  //     return;
  //   }

  //   const dataToSave: Partial<Node> = {
  //     type: formData.type,
  //     // Only include arrays if they have items, otherwise set to undefined
  //     tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
  //     fileDetails: formData.fileDetails && formData.fileDetails.length > 0 ? formData.fileDetails : undefined,
  //     referenceDetails: formData.referenceDetails && formData.referenceDetails.length > 0 ? formData.referenceDetails : undefined,
  //     // Only include description if it has content
  //     description: formData.description && formData.description.trim() ? formData.description.trim() : undefined,
  //     // Only include lastDate if it has a value
  //     lastDate: formData.lastDate && formData.lastDate.trim() ? formData.lastDate : undefined,
  //   };

  //   // Only add parentId for create operations
  //   if (!isEdit) {
  //     dataToSave.parentId = parentId;
  //   }

  //   // Add subject OR heading based on what's selected
  //   if (isFirstDepth) {
  //     if (formData.subject) {
  //       dataToSave.subject = formData.subject;
  //       // Don't send heading if subject is set
  //     } else if (formData.heading?.trim()) {
  //       dataToSave.heading = formData.heading.trim();
  //       // Don't send subject if heading is set
  //     }
  //   } else {
  //     dataToSave.heading = formData.heading?.trim();
  //   }

  //   console.log('dataToSave:', dataToSave);
  //   onSave(dataToSave);
  //   onClose();
  // };

  // Delete file using centralized API
  const handleRemoveFile = async (index: number) => {
    const fileToRemove = formData.fileDetails?.[index];
    console.log(fileToRemove)

    setFormData({
      ...formData,
      fileDetails: (formData.fileDetails || []).filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleAddFile = () => {
    if (newFile.fileName.trim() && newFile.uploadLink.trim()) {
      setFormData({
        ...formData,
        fileDetails: [...(formData.fileDetails || []), { ...newFile }],
      });
      setNewFile({ fileName: '', uploadLink: '' });
    }
  };

  const handleAddReference = () => {
    if (newReference.fileName.trim() && newReference.referenceLink.trim()) {
      setFormData({
        ...formData,
        referenceDetails: [...(formData.referenceDetails || []), { ...newReference }],
      });
      setNewReference({ fileName: '', referenceLink: '' });
    }
  };

  const handleRemoveReference = (index: number) => {
    const fileToRemove = formData.referenceDetails?.[index];
    console.log(fileToRemove)
    setFormData({
      ...formData,
      referenceDetails: (formData.referenceDetails || []).filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    // console.log('handleSave called with formData:', formData);
    // console.log('selectedSubjectId:', selectedSubjectId);
    // console.log('useManualHeading:', useManualHeading);
    // console.log('isFirstDepth:', isFirstDepth);

    // Validation: Either subject or heading must be present
    if (isFirstDepth && !formData.subject && !formData.heading?.trim()) {
      alert('Please select a subject or enter a heading');
      return;
    }

    if (!isFirstDepth && !formData.heading?.trim()) {
      alert('Please enter a heading');
      return;
    }

    const dataToSave: Partial<Node> = {
      type: formData.type,
      tags: formData.tags?.length ? formData.tags : undefined,
      fileDetails: formData.fileDetails?.length ? formData.fileDetails : undefined,
      referenceDetails: formData.referenceDetails?.length ? formData.referenceDetails : undefined,
      description: formData.description || undefined,
      lastDate: formData.lastDate || undefined,
    };

    // Only add parentId for create operations
    if (!isEdit) {
      dataToSave.parentId = parentId;
    }

    // Add subject OR heading based on what's selected
    if (isFirstDepth) {
      if (formData.subject) {
        dataToSave.subject = formData.subject || formData.subject;
        // Don't send heading if subject is set
      } else if (formData.heading?.trim()) {
        dataToSave.heading = formData.heading.trim();
        // Don't send subject if heading is set
      }
    } else {
      dataToSave.heading = formData.heading?.trim();
    }

    // console.log('dataToSave:', dataToSave);
    onSave(dataToSave);
    onClose();
  };

  const handleCancel = () => {
    cancelUpload.current = true;
    setUploading(false);
    setUploadProgress({});
    setSelectedFiles(null);
    onClose();
  };

  // Get display name for selected subject
  const getSelectedSubjectName = () => {
    if (selectedSubjectId) {
      const subject = subjects.find(s => s._id === selectedSubjectId);
      return subject?.name || '';
    }
    return '';
  };

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    if (uploading) return true;

    if (isFirstDepth) {
      // For first depth: either subject OR heading must be present
      return !formData.subject && !formData.heading?.trim();
    } else {
      // For other depths: heading must be present
      return !formData.heading?.trim();
    }
  };

  // check whether the given url is a valid url or a simple text
  const isValidUrl = (url: string) =>
    /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+(\/\S*)?$/.test(url.trim())

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Type Selection */}
          <FormControl fullWidth disabled={isFirstDepth}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type || 'folder'}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'folder' | 'file' })}
            >
              <MenuItem value="folder">Folder</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>
          </FormControl>

          {/* Subject Selection or Manual Heading for First Depth */}
          {isFirstDepth ? (
            <>
              {!useManualHeading ? (
                <FormControl fullWidth required>
                  <InputLabel>Select Subject</InputLabel>
                  <Select
                    value={selectedSubjectId || ''}
                    label="Select Subject"
                    onChange={handleSubjectChange}
                    disabled={loadingSubjects}
                  >
                    {loadingSubjects ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading subjects...
                      </MenuItem>
                    ) : subjects.length === 0 ? (
                      <MenuItem disabled>No subjects available</MenuItem>
                    ) : (
                      [
                        ...subjects.map((subject) => (
                          <MenuItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </MenuItem>
                        )),
                        <Divider key="divider" />,
                        <MenuItem key="manual" value="manual">
                          <em>Enter custom heading instead</em>
                        </MenuItem>
                      ]
                    )}
                  </Select>
                </FormControl>
              ) : (
                <Box>
                  <TextField
                    label="Custom Heading"
                    required
                    fullWidth
                    value={formData.heading || ''}
                    onChange={handleManualHeadingChange}
                    placeholder="e.g., Introduction"
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      setUseManualHeading(false);
                      setFormData({ ...formData, heading: '', subject: undefined });
                    }}
                    sx={{ mt: 1 }}
                  >
                    ← Back to subject selection
                  </Button>
                </Box>
              )}

              {/* Show selected subject name for clarity */}
              {selectedSubjectId && !useManualHeading && (
                <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary">
                    <strong>Selected:</strong> {getSelectedSubjectName()}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <TextField
              label={formData.type === 'folder' ? 'Folder Name' : 'File Name'}
              required
              fullWidth
              value={formData.heading || ''}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              placeholder={formData.type === 'folder' ? 'e.g., Chapter 1: Limits' : 'e.g., Lecture Notes.pdf'}
            />
          )}

          {/* Description */}
          <TextField
            label="Description (optional)"
            multiline
            rows={3}
            fullWidth
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Due Date */}
          <TextField
            label="Due Date (optional)"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            value={formData.lastDate || ''}
            onChange={(e) => setFormData({ ...formData, lastDate: e.target.value || undefined })}
          />

          {/* Tags */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Tags (optional)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Enter"
              />
              <Button variant="outlined" onClick={handleAddTag} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(formData.tags || []).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {/* File Details Section with Upload */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon fontSize="small" />
              {formData.type === 'folder' ? 'Prerequisite (optional)' : 'Material Details (optional)'}
            </Typography>

            {/* Upload Files to Google Drive */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Upload files directly to Google Drive (Multiple files supported)
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  disabled={uploading}
                >
                  Select Files
                  <input type="file" hidden multiple onChange={handleFileSelect} />
                </Button>

                {selectedFiles && selectedFiles.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Selected Files ({selectedFiles.length}):
                    </Typography>
                    {Array.from(selectedFiles).map((file, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                        • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </Typography>
                    ))}
                  </Box>
                )}

                <Button
                  variant="contained"
                  onClick={handleUploadClick}
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                  disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
                  fullWidth
                >
                  {uploading ? 'Uploading...' : 'Upload to Google Drive'}
                </Button>

                {Object.keys(uploadProgress).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <Box key={fileName} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                          {fileName}
                        </Typography>
                        <LinearProgress variant="determinate" value={progress} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Link Existing Files Button */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Link files that are already uploaded in other folders
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setFileBrowserOpen(true)}
                  startIcon={<LinkIcon />}
                  fullWidth
                >
                  Browse Existing Files
                </Button>
              </Box>
            </Paper>

            <FileBrowserModal
              open={fileBrowserOpen}
              onClose={() => setFileBrowserOpen(false)}
              onSelectFiles={(files) => {
                setFormData({
                  ...formData,
                  fileDetails: [...(formData.fileDetails || []), ...files],
                });
              }}
              alreadySelectedFiles={formData.fileDetails}
            />

            {/* Manual Link Entry */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                Or add link manually
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="File Name"
                  fullWidth
                  value={newFile.fileName}
                  onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
                  placeholder="e.g., Lecture_Notes_Week1.pdf"
                />
                <TextField
                  size="small"
                  label="Upload Link / URL"
                  fullWidth
                  value={newFile.uploadLink}
                  onChange={(e) => setNewFile({ ...newFile, uploadLink: e.target.value })}
                  placeholder="e.g., https://drive.google.com/..."
                />
                <Button
                  variant="contained"
                  onClick={handleAddFile}
                  startIcon={<AddIcon />}
                  disabled={!newFile.fileName.trim() || !newFile.uploadLink.trim()}
                  size="small"
                >
                  Add File Link
                </Button>
              </Box>
            </Paper>

            {/* Existing Files List */}
            {(formData.fileDetails || []).length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Linked Files ({formData.fileDetails?.length})
                </Typography>
                {formData.fileDetails?.map((file, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {file.fileName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            wordBreak: 'break-all',
                            display: 'block',
                            '& a': { color: 'primary.main', textDecoration: 'none' },
                          }}
                        >
                          <a href={file.uploadLink} target="_blank" rel="noopener noreferrer">
                            {file.uploadLink}
                          </a>
                        </Typography>
                        {file.fileId && (
                          <Chip label="Google Drive" size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        color="error"
                        title="Remove from this node (file will remain in Google Drive)"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                  Note: Removing files here only unlinks them from this node. Files remain in Google Drive.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Reference Details Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon fontSize="small" />
              Reference Details (optional)
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  size="small"
                  label="Reference Name"
                  fullWidth
                  value={newReference.fileName}
                  onChange={(e) => setNewReference({ ...newReference, fileName: e.target.value })}
                  placeholder="e.g., Textbook Chapter 3"
                />
                <TextField
                  size="small"
                  label="Reference Link / URL"
                  fullWidth
                  value={newReference.referenceLink}
                  onChange={(e) => setNewReference({ ...newReference, referenceLink: e.target.value })}
                  placeholder="e.g., https://example.com/resource"
                  error={!!newReference.referenceLink && !isValidUrl(newReference.referenceLink)}
                  helperText={
                    !!newReference.referenceLink && !isValidUrl(newReference.referenceLink)
                      ? 'Please enter a valid URL starting with http:// or https://'
                      : ''
                  }
                />

                <Button
                  variant="contained"
                  onClick={handleAddReference}
                  startIcon={<AddIcon />}
                  disabled={
                    !newReference.fileName.trim() ||
                    !newReference.referenceLink.trim() ||
                    !isValidUrl(newReference.referenceLink)  // ← added
                  }
                  size="small"
                >
                  Add Reference
                </Button>
              </Box>
            </Paper>

            {(formData.referenceDetails || []).length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.referenceDetails?.map((ref, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {ref.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                          <a href={ref.referenceLink} target="_blank" rel="noopener noreferrer">
                            {ref.referenceLink}
                          </a>
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveReference(index)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaveDisabled()}>
          {isEdit ? 'Save Changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeDialogForm;