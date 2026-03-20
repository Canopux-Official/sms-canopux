// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   IconButton,
//   Box,
//   Typography,
//   Checkbox,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   CircularProgress,
//   Alert,
//   Chip,
//   InputAdornment,
// } from '@mui/material';
// import {
//   Close as CloseIcon,
//   Search as SearchIcon,
//   InsertDriveFile as FileIcon,
//   Folder as FolderIcon,
// } from '@mui/icons-material';
// import { getAllExistingFiles } from '../services/FolderServiceApi';
// import type { ExistingFile, FileDetail } from '../types/FileDetail';
// interface FileBrowserModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSelectFiles: (files: FileDetail[]) => void;
//   alreadySelectedFiles?: FileDetail[];
// }

// const FileBrowserModal: React.FC<FileBrowserModalProps> = ({
//   open,
//   onClose,
//   onSelectFiles,
//   alreadySelectedFiles = [],
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [allFiles, setAllFiles] = useState<ExistingFile[]>([]);
//   const [filteredFiles, setFilteredFiles] = useState<ExistingFile[]>([]);
//   const [selectedFiles, setSelectedFiles] = useState<ExistingFile[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch files when modal opens
//   useEffect(() => {
//     if (open) {
//       fetchFiles();
//     } else {
//       // Reset state when modal closes
//       setSearchQuery('');
//       setSelectedFiles([]);
//       setError(null);
//     }
//   }, [open]);

//   // Filter files based on search query
//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredFiles(allFiles);
//     } else {
//       const query = searchQuery.toLowerCase();
//       const filtered = allFiles.filter(
//         (file) =>
//           file.fileName.toLowerCase().includes(query) ||
//           file.parentHeading.toLowerCase().includes(query)
//       );
//       setFilteredFiles(filtered);
//     }
//   }, [searchQuery, allFiles]);

//   const fetchFiles = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await getAllExistingFiles();
//       if (response.success) {
//         // Filter out files that are already selected
//         const alreadySelectedLinks = alreadySelectedFiles.map((f) => f.uploadLink);
//         const availableFiles = response.data.filter(
//           (file) => !alreadySelectedLinks.includes(file.uploadLink)
//         );
//         setAllFiles(availableFiles);
//         setFilteredFiles(availableFiles);
//       } else {
//         setError('Failed to fetch files');
//       }
//     } catch (err) {
//       console.error('Error fetching files:', err);
//       setError('Error loading files. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleFile = (file: ExistingFile) => {
//     const isSelected = selectedFiles.some((f) => f.uploadLink === file.uploadLink);
//     if (isSelected) {
//       setSelectedFiles(selectedFiles.filter((f) => f.uploadLink !== file.uploadLink));
//     } else {
//       setSelectedFiles([...selectedFiles, file]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedFiles.length === filteredFiles.length) {
//       setSelectedFiles([]);
//     } else {
//       setSelectedFiles([...filteredFiles]);
//     }
//   };

//   const handleConfirm = () => {
//     // Convert ExistingFile to FileDetail format
//     const filesToAdd: FileDetail[] = selectedFiles.map((file) => ({
//       fileName: file.fileName,
//       uploadLink: file.uploadLink,
//       fileId: file.fileId,
//     }));
//     onSelectFiles(filesToAdd);
//     onClose();
//   };

//   const isFileSelected = (file: ExistingFile) => {
//     return selectedFiles.some((f) => f.uploadLink === file.uploadLink);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h6" sx={{ fontWeight: 600 }}>
//           Link Existing Files
//         </Typography>
//         <IconButton onClick={onClose}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent dividers>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           {/* Search Bar */}
//           <TextField
//             fullWidth
//             size="small"
//             placeholder="Search by file name or folder..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//             }}
//           />

//           {/* Select All Checkbox */}
//           {filteredFiles.length > 0 && (
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Checkbox
//                 checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
//                 indeterminate={selectedFiles.length > 0 && selectedFiles.length < filteredFiles.length}
//                 onChange={handleSelectAll}
//               />
//               <Typography variant="body2">
//                 Select All ({selectedFiles.length} of {filteredFiles.length} selected)
//               </Typography>
//             </Box>
//           )}

//           {/* Loading State */}
//           {loading && (
//             <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//               <CircularProgress />
//             </Box>
//           )}

//           {/* Error State */}
//           {error && (
//             <Alert severity="error" onClose={() => setError(null)}>
//               {error}
//             </Alert>
//           )}

//           {/* Empty State */}
//           {!loading && !error && filteredFiles.length === 0 && (
//             <Box sx={{ textAlign: 'center', py: 4 }}>
//               <Typography variant="body2" color="text.secondary">
//                 {searchQuery ? 'No files found matching your search' : 'No files available'}
//               </Typography>
//             </Box>
//           )}

//           {/* Files List */}
//           {!loading && !error && filteredFiles.length > 0 && (
//             <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
//               {filteredFiles.map((file, index) => (
//                 <ListItem key={index} disablePadding>
//                   <ListItemButton onClick={() => handleToggleFile(file)} dense>
//                     <ListItemIcon>
//                       <Checkbox
//                         edge="start"
//                         checked={isFileSelected(file)}
//                         tabIndex={-1}
//                         disableRipple
//                       />
//                     </ListItemIcon>
//                     <ListItemIcon>
//                       <FileIcon color="primary" />
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
//                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                             {file.fileName}
//                           </Typography>
//                           {file.fileId && (
//                             <Chip label="Drive" size="small" color="primary" variant="outlined" />
//                           )}
//                         </Box>
//                       }
//                       secondary={
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
//                           <FolderIcon sx={{ fontSize: 14 }} />
//                           <Typography variant="caption" color="text.secondary">
//                             {file.parentHeading}
//                           </Typography>
//                         </Box>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, py: 2 }}>
//         <Button onClick={onClose} variant="outlined">
//           Cancel
//         </Button>
//         <Button
//           onClick={handleConfirm}
//           variant="contained"
//           disabled={selectedFiles.length === 0}
//         >
//           Add {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default FileBrowserModal;


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  TextField,
  Checkbox,
  CircularProgress,
  Chip,
  InputAdornment,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import type { FileDetail } from '../types/FileDetail';
import { getAccessToken, isGoogleDriveInitialized } from '../utils/googleDriveService';

interface FileBrowserModalProps {
  open: boolean;
  onClose: () => void;
  onSelectFiles: (files: FileDetail[]) => void;
  alreadySelectedFiles?: FileDetail[];
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink: string;
  webContentLink?: string;
  createdTime: string;
  modifiedTime: string;
}

const FileBrowserModal: React.FC<FileBrowserModalProps> = ({
  open,
  onClose,
  onSelectFiles,
  alreadySelectedFiles = [],
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Fetch files from Google Drive
  const fetchDriveFiles = async () => {
    if (!isGoogleDriveInitialized()) {
      setError('Google Drive API is not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();

      // Fetch all files (not folders) from Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        new URLSearchParams({
          pageSize: '100',
          fields: 'files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime)',
          q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
          orderBy: 'modifiedTime desc',
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const data = await response.json();
      setDriveFiles(data.files || []);
      // console.log('✅ Fetched files from Google Drive:', data.files?.length || 0);
    } catch (err: any) {
      console.error('❌ Error fetching Drive files:', err);
      setError(err.message || 'Failed to fetch files from Google Drive');
    } finally {
      setLoading(false);
    }
  };

  // Fetch files when modal opens
  useEffect(() => {
    if (open) {
      fetchDriveFiles();
      setSelectedFiles(new Set());
      setSearchQuery('');
    }
  }, [open]);

  // Filter files based on search query
  const filteredFiles = driveFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a file is already selected in the parent form
  const isAlreadyLinked = (fileId: string): boolean => {
    return alreadySelectedFiles.some((f) => f.fileId === fileId);
  };

  // Toggle file selection
  const toggleFileSelection = (file: DriveFile) => {
    const newSelected = new Set(selectedFiles);
    
    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      newSelected.add(file.id);
    }
    
    setSelectedFiles(newSelected);
  };

  // Handle adding selected files
  const handleAddFiles = () => {
    const filesToAdd: FileDetail[] = driveFiles
      .filter((file) => selectedFiles.has(file.id))
      .map((file) => ({
        fileName: file.name,
        uploadLink: file.webViewLink,
        fileId: file.id,
      }));

    onSelectFiles(filesToAdd);
    onClose();
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string): React.ReactNode => {
    if (mimeType.startsWith('image/')) {
      return <FileIcon color="primary" />;
    } else if (mimeType.includes('pdf')) {
      return <FileIcon color="error" />;
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return <FileIcon color="info" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileIcon color="success" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <FileIcon color="warning" />;
    }
    return <FileIcon />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Browse Google Drive Files
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchDriveFiles} disabled={loading} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: '60vh', maxHeight: '60vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          {/* Search Bar */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Info Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Loading...' : `${filteredFiles.length} file(s) found`}
            </Typography>
            {selectedFiles.size > 0 && (
              <Chip
                label={`${selectedFiles.size} selected`}
                color="primary"
                size="small"
              />
            )}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty State */}
          {!loading && !error && driveFiles.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
              <FolderIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                No files found in Google Drive
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload some files first to see them here
              </Typography>
            </Box>
          )}

          {/* No Search Results */}
          {!loading && !error && driveFiles.length > 0 && filteredFiles.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                No files match "{searchQuery}"
              </Typography>
              <Button onClick={() => setSearchQuery('')}>Clear search</Button>
            </Box>
          )}

          {/* Files List */}
          {!loading && !error && filteredFiles.length > 0 && (
            <List sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
              {filteredFiles.map((file, index) => {
                const isSelected = selectedFiles.has(file.id);
                const isLinked = isAlreadyLinked(file.id);

                return (
                  <React.Fragment key={file.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      disablePadding
                      secondaryAction={
                        isLinked ? (
                          <Chip
                            label="Already linked"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : isSelected ? (
                          <CheckCircleIcon color="primary" />
                        ) : null
                      }
                    >
                      <ListItemButton
                        onClick={() => !isLinked && toggleFileSelection(file)}
                        disabled={isLinked}
                        selected={isSelected}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={isSelected || isLinked}
                            disabled={isLinked}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemIcon>
                          {getFileIcon(file.mimeType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                              {file.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Modified: {formatDate(file.modifiedTime)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleAddFiles}
          variant="contained"
          disabled={selectedFiles.size === 0}
          startIcon={<CheckCircleIcon />}
        >
          Add {selectedFiles.size > 0 ? `${selectedFiles.size} ` : ''}File{selectedFiles.size !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileBrowserModal;