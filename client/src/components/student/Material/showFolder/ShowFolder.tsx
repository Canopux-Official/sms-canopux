// import { useState, useEffect } from "react";
// import type { Node } from "../../../admin/Material/types/node";
// import {
//   Box,
//   Container,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   TextField,
//   InputAdornment,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   useTheme,
//   useMediaQuery,
//   IconButton,
//   Typography,
//   Chip,
//   Breadcrumbs,
//   Link,
//   ToggleButtonGroup,
//   ToggleButton,
// } from "@mui/material";
// import {
//   Home,
//   NavigateNext,
//   FolderOpen,
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   ViewList,
//   ViewModule,
// } from "@mui/icons-material";
// import {
//   fetchNodesByParentId,
//   fetchStudentClasses,
// } from "../services/StudentAccessMateral.services";
// import { useLocation } from "react-router-dom";
// import { ClassRow } from "../classcard/ClassRow";
// import { SubfolderRow } from "../subfolder/SubFolderRow";
// import { MobileSubfolderCard } from "../subfolder/MobileSubFolderCard";
// import { MobileClassCard } from "../classcard/MobileClassCard";
// import { ClassCard } from "../classcard/Classcard";
// import { SubfolderCard } from "../subfolder/Subfolder";

// interface SnackbarState {
//   open: boolean;
//   message: string;
//   severity: "success" | "error" | "info" | "warning";
// }

// interface LocationState {
//   navigateToPath?: Array<{ id: string; heading: string }>;
//   shouldNavigate?: boolean;
//   timestamp?: number;
// }

// // Helper function to get display name from node
// const getDisplayHeading = (node: any): string => {
//   if (node.subject && typeof node.subject === "object" && node.subject.name) {
//     return node.subject.name;
//   }
//   return node.heading || "Untitled";
// };

// // Main App Component
// const StudentFolderStructure: React.FC = () => {
//   const location = useLocation();
//   const locationState = location.state as LocationState;
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   // const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

//   const [currentNode, setCurrentNode] = useState<Node | null>(null);
//   const [currentItems, setCurrentItems] = useState<Node[]>([]);
//   const [filteredItems, setFilteredItems] = useState<Node[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("list");
//   const [snackbar, setSnackbar] = useState<SnackbarState>({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   // Fetch root level classes on component mount
//   useEffect(() => {
//     if (locationState?.shouldNavigate && locationState?.navigateToPath) {
//       navigateToPath(locationState.navigateToPath);
//       window.history.replaceState({}, document.title);
//     } else {
//       loadRootClasses();
//     }
//   }, [locationState?.timestamp]);

//   // Filter items based on search query
//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredItems(currentItems);
//     } else {
//       const query = searchQuery.toLowerCase();
//       const filtered = currentItems.filter((item) => {
//         const heading = getDisplayHeading(item).toLowerCase();
//         const stream = (item.stream || "").toLowerCase();
//         const targetExam = (item.targetExam || "").toLowerCase();
//         const subject =
//           typeof (item as any).subject === "object"
//             ? ((item as any).subject.name || "").toLowerCase()
//             : ((item as any).subject || "").toLowerCase();

//         return (
//           heading.includes(query) ||
//           stream.includes(query) ||
//           targetExam.includes(query) ||
//           subject.includes(query)
//         );
//       });
//       setFilteredItems(filtered);
//     }
//   }, [searchQuery, currentItems]);

//   console.log(filteredItems);

//   const loadRootClasses = async () => {
//     setLoading(true);
//     try {
//       const classes = await fetchStudentClasses();
//       setCurrentItems(classes);
//       setCurrentNode(null);
//       setSearchQuery("");
//       setSnackbar({
//         open: true,
//         message: `Loaded ${classes.length} classes successfully`,
//         severity: "success",
//       });
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: "Failed to load classes. Please try again.",
//         severity: "error",
//       });
//       setCurrentItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadFolderContents = async (node: Node) => {
//     setLoading(true);
//     try {
//       const items = await fetchNodesByParentId(node._id);
//       setCurrentItems(items);
//       setCurrentNode(node);
//       setSearchQuery("");
//       if (items.length === 0) {
//         setSnackbar({
//           open: true,
//           message: "This folder is empty",
//           severity: "info",
//         });
//       }
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: "Failed to load folder contents. Please try again.",
//         severity: "error",
//       });
//       setCurrentItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateToPath = async (
//     path: Array<{ id: string; heading: string }>
//   ) => {
//     if (path.length === 0) {
//       loadRootClasses();
//       return;
//     }

//     try {
//       setLoading(true);

//       const targetName = path[path.length - 1].heading || "Unknown";
//       setSnackbar({
//         open: true,
//         message: `Navigating to ${targetName}...`,
//         severity: "info",
//       });

//       if (path.length === 1) {
//         const classes = await fetchStudentClasses();
//         setCurrentItems(classes);
//         setCurrentNode(null);
//         setHighlightedItemId(path[0].id);
//       } else {
//         const parentFolderItem = path[path.length - 2];
//         const items = await fetchNodesByParentId(parentFolderItem.id);

//         const parentNode: Node = {
//           _id: parentFolderItem.id,
//           heading: getDisplayHeading(parentFolderItem),
//           type: "folder",
//           path: path.slice(0, path.length - 2).map((p) => ({
//             id: p.id,
//             heading: getDisplayHeading(p),
//           })),
//         } as Node;

//         setCurrentNode(parentNode);
//         setCurrentItems(items);

//         const targetFileId = path[path.length - 1].id;
//         setHighlightedItemId(targetFileId);

//         setTimeout(() => {
//           const element = document.getElementById(
//             `material-item-${targetFileId}`
//           );
//           if (element) {
//             element.scrollIntoView({
//               behavior: "smooth",
//               block: "center",
//             });
//           }
//         }, 500);
//       }

//       setSnackbar({
//         open: true,
//         message: `Navigated to ${targetName}`,
//         severity: "success",
//       });
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: "Failed to navigate. Loading root instead.",
//         severity: "error",
//       });
//       loadRootClasses();
//     } finally {
//       setLoading(false);
//       setTimeout(() => setHighlightedItemId(null), 4000);
//     }
//   };

//   const handleFolderClick = async (node: Node) => {
//     if (node.type === "folder") {
//       await loadFolderContents(node);
//     }
//   };

//   const handleBreadcrumbClick = async (
//     pathItem: { id: string; heading: string } | null
//   ) => {
//     if (!pathItem) {
//       await loadRootClasses();
//     } else {
//       const node = currentItems.find((item) => item._id === pathItem.id);
//       if (node) {
//         await loadFolderContents(node);
//       } else {
//         setLoading(true);
//         try {
//           const items = await fetchNodesByParentId(pathItem.id);
//           const clickedIndex =
//             currentNode?.path?.findIndex((p) => p.id === pathItem.id) ?? -1;
//           const newPath =
//             clickedIndex >= 0 ? currentNode?.path?.slice(0, clickedIndex) || [] : [];

//           setCurrentNode({
//             _id: pathItem.id,
//             heading: pathItem.heading || "Folder",
//             type: "folder",
//             path: newPath,
//           } as Node);
//           setCurrentItems(items);
//         } catch (error) {
//           setSnackbar({
//             open: true,
//             message: "Failed to load folder contents. Please try again.",
//             severity: "error",
//           });
//         } finally {
//           setLoading(false);
//         }
//       }
//     }
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const handleClearSearch = () => {
//     setSearchQuery("");
//   };

//   const handleViewModeChange = (
//     _: React.MouseEvent<HTMLElement>,
//     newMode: "grid" | "list" | null
//   ) => {
//     if (newMode !== null) {
//       setViewMode(newMode);
//     }
//   };

//   const isRootLevel = !currentNode;

//   const currentBreadcrumb = currentNode
//     ? [
//         ...(currentNode.path || []),
//         { id: currentNode._id, heading: getDisplayHeading(currentNode) },
//       ]
//     : [];

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         backgroundColor: "#fafafa",
//         pb: 6,
//       }}
//     >
//       <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 4 }, pb: 2 }}>
//         {/* Header Section */}
//         <Box
//           sx={{
//             mb: 3,
//             pb: 2,
//             borderBottom: "2px solid",
//             borderColor: "divider",
//           }}
//         >
//           {/* Title Row */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               mb: 2,
//               flexWrap: "wrap",
//               gap: 2,
//             }}
//           >
//             <Box sx={{ display: "flex", alignItems: "center" }}>
//               <Box
//                 sx={{
//                   width: { xs: 40, md: 48 },
//                   height: { xs: 40, md: 48 },
//                   borderRadius: "12px",
//                   background:
//                     "linear-gradient(135deg, #06444a 0%, #1d3e46 100%)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   mr: 2,
//                   boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
//                 }}
//               >
//                 <FolderOpen
//                   sx={{ color: "white", fontSize: { xs: 24, md: 28 } }}
//                 />
//               </Box>
//               <Typography
//                 variant={isMobile ? "h5" : "h4"}
//                 sx={{
//                   fontWeight: 700,
//                   background:
//                     "linear-gradient(135deg, #042f1b 0%, #083542 100%)",
//                   backgroundClip: "text",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 My Classes
//               </Typography>
//             </Box>

//             {/* View Mode Toggle - Desktop Only */}
//             {!isMobile && (
//               <ToggleButtonGroup
//                 value={viewMode}
//                 exclusive
//                 onChange={handleViewModeChange}
//                 size="small"
//                 sx={{
//                   backgroundColor: "white",
//                   borderRadius: 2,
//                   "& .MuiToggleButton-root": {
//                     border: "1px solid #e0e0e0",
//                     "&.Mui-selected": {
//                       backgroundColor: "#06444a",
//                       color: "white",
//                       "&:hover": {
//                         backgroundColor: "#083542",
//                       },
//                     },
//                   },
//                 }}
//               >
//                 <ToggleButton value="list" aria-label="list view">
//                   <ViewList sx={{ mr: 0.5, fontSize: 20 }} />
//                   List
//                 </ToggleButton>
//                 <ToggleButton value="grid" aria-label="grid view">
//                   <ViewModule sx={{ mr: 0.5, fontSize: 20 }} />
//                   Grid
//                 </ToggleButton>
//               </ToggleButtonGroup>
//             )}
//           </Box>

//           {/* Search Bar */}
//           <Box sx={{ mb: 2 }}>
//             <TextField
//               fullWidth
//               placeholder="Search classes, subjects, or exams..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               size={isMobile ? "small" : "medium"}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon sx={{ color: "#9ca3af" }} />
//                   </InputAdornment>
//                 ),
//                 endAdornment: searchQuery && (
//                   <InputAdornment position="end">
//                     <IconButton
//                       size="small"
//                       onClick={handleClearSearch}
//                       edge="end"
//                     >
//                       <ClearIcon fontSize="small" />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//               sx={{
//                 backgroundColor: "white",
//                 borderRadius: 2,
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: 2,
//                   "&:hover fieldset": {
//                     borderColor: "#06444a",
//                   },
//                   "&.Mui-focused fieldset": {
//                     borderColor: "#06444a",
//                   },
//                 },
//               }}
//             />
//           </Box>

//           {/* Breadcrumbs */}
//           <Paper
//             elevation={0}
//             sx={{
//               p: { xs: 1.5, md: 2 },
//               backgroundColor: "#ffffff",
//               borderRadius: "12px",
//               border: "1px solid #e0e0e0",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
//             }}
//           >
//             <Breadcrumbs
//               separator={<NavigateNext fontSize="small" sx={{ color: "#9e9e9e" }} />}
//               sx={{
//                 "& .MuiBreadcrumbs-ol": {
//                   flexWrap: isMobile ? "wrap" : "nowrap",
//                 },
//               }}
//             >
//               <Link
//                 component="button"
//                 underline="none"
//                 onClick={() => handleBreadcrumbClick(null)}
//                 disabled={loading}
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   cursor: loading ? "not-allowed" : "pointer",
//                   px: { xs: 1, md: 1.5 },
//                   py: 0.75,
//                   borderRadius: "8px",
//                   fontWeight: isRootLevel ? 600 : 500,
//                   fontSize: { xs: "0.85rem", md: "0.95rem" },
//                   color: isRootLevel ? "#114a50" : "#0b3c54",
//                   backgroundColor: isRootLevel ? "#e2f6f6" : "transparent",
//                   transition: "all 0.2s ease",
//                   opacity: loading ? 0.6 : 1,
//                   "&:hover": {
//                     backgroundColor: loading
//                       ? undefined
//                       : isRootLevel
//                       ? "#e3fffd"
//                       : "#def3f6",
//                     transform: loading ? undefined : "translateY(-1px)",
//                   },
//                 }}
//               >
//                 <Home sx={{ mr: 0.5, fontSize: { xs: 16, md: 18 } }} />
//                 Home
//               </Link>

//               {currentBreadcrumb.map((pathItem, index) => {
//                 const isLast = index === currentBreadcrumb.length - 1;
//                 const displayName = getDisplayHeading(pathItem);

//                 return (
//                   <Link
//                     key={pathItem.id}
//                     component="button"
//                     underline="none"
//                     onClick={() => !isLast && handleBreadcrumbClick(pathItem)}
//                     disabled={loading || isLast}
//                     sx={{
//                       cursor: loading || isLast ? "default" : "pointer",
//                       px: { xs: 1, md: 1.5 },
//                       py: 0.75,
//                       borderRadius: "8px",
//                       fontWeight: isLast ? 600 : 500,
//                       fontSize: { xs: "0.85rem", md: "0.95rem" },
//                       color: isLast ? "#105d65" : "#616161",
//                       backgroundColor: isLast ? "#f0fffa" : "transparent",
//                       transition: "all 0.2s ease",
//                       maxWidth: { xs: "150px", md: "200px" },
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                       opacity: loading ? 0.6 : 1,
//                       "&:hover": {
//                         backgroundColor:
//                           loading || isLast ? undefined : "#f5f5f5",
//                         transform:
//                           loading || isLast ? undefined : "translateY(-1px)",
//                       },
//                     }}
//                   >
//                     {displayName}
//                   </Link>
//                 );
//               })}
//             </Breadcrumbs>
//           </Paper>

//           {/* Results Info */}
//           {!loading && (
//             <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
//               <Chip
//                 label={`${filteredItems.length} ${
//                   filteredItems.length === 1 ? "item" : "items"
//                 }${searchQuery ? " found" : ""}`}
//                 size="small"
//                 sx={{
//                   backgroundColor: "#e8eaf6",
//                   color: "#5c6bc0",
//                   fontWeight: 600,
//                   fontSize: "0.75rem",
//                 }}
//               />
//               {searchQuery && (
//                 <Typography variant="body2" color="text.secondary">
//                   searching for <strong>"{searchQuery}"</strong>
//                 </Typography>
//               )}
//             </Box>
//           )}
//         </Box>

//         {/* Loading State */}
//         {loading ? (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               py: 8,
//             }}
//           >
//             <CircularProgress size={60} sx={{ mb: 2 }} />
//             <Typography variant="body1" color="text.secondary">
//               Loading...
//             </Typography>
//           </Box>
//         ) : filteredItems.length === 0 ? (
//           /* Empty State */
//           <Paper
//             elevation={0}
//             sx={{
//               textAlign: "center",
//               py: 8,
//               borderRadius: "16px",
//               border: "2px dashed #e0e0e0",
//               backgroundColor: "#fafafa",
//             }}
//           >
//             <FolderOpen sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
//             <Typography
//               variant="h6"
//               color="text.secondary"
//               sx={{ fontWeight: 500 }}
//             >
//               {searchQuery ? "No matches found" : "No items found"}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               {searchQuery
//                 ? `Try adjusting your search terms`
//                 : "This folder is empty"}
//             </Typography>
//             {searchQuery && (
//               <Box sx={{ mt: 2 }}>
//                 <Link
//                   component="button"
//                   onClick={handleClearSearch}
//                   sx={{
//                     color: "#06444a",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     textDecoration: "underline",
//                   }}
//                 >
//                   Clear search
//                 </Link>
//               </Box>
//             )}
//           </Paper>
//         ) : (
//           /* Content Display */
//           <>
//             {/* Desktop Table View */}
//             {!isMobile && viewMode === "list" ? (
//               <TableContainer
//                 component={Paper}
//                 elevation={0}
//                 sx={{
//                   borderRadius: 1,
//                   border: "1px solid #e0e0e0",
//                   overflow: "hidden",
//                 }}
//               >
//                 <Table>
//                   <TableHead>
//                     <TableRow
//                       sx={{
//                         backgroundColor: "#f8fafc",
//                         borderBottom: "2px solid #e2e8f0",
//                       }}
//                     >
//                       <TableCell
//                         sx={{
//                           fontWeight: 700,
//                           color: "#475569",
//                           fontSize: "0.85rem",
//                           py: 2,
//                         }}
//                       >
//                         Name
//                       </TableCell>
//                       {isRootLevel ? (
//                         <>
//                           <TableCell
//                             sx={{
//                               fontWeight: 700,
//                               color: "#475569",
//                               fontSize: "0.85rem",
//                               py: 2,
//                               width: "180px",
//                             }}
//                           >
//                             Target Exam
//                           </TableCell>
//                         </>
//                       ) : (
//                         <>
//                           <TableCell
//                             sx={{
//                               fontWeight: 700,
//                               color: "#475569",
//                               fontSize: "0.85rem",
//                               py: 2,
//                               width: "120px",
//                             }}
//                           >
//                             Type
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontWeight: 700,
//                               color: "#475569",
//                               fontSize: "0.85rem",
//                               py: 2,
//                               width: "180px",
//                             }}
//                           >
//                             Attachments
//                           </TableCell>
//                         </>
//                       )}
//                       <TableCell
//                         sx={{
//                           fontWeight: 700,
//                           color: "#475569",
//                           fontSize: "0.85rem",
//                           py: 2,
//                           width: "180px",
//                         }}
//                       >
//                         Modified
//                       </TableCell>
//                       <TableCell sx={{ width: "100px" }} />
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filteredItems.map((node) =>
//                       isRootLevel ? (
//                         <ClassRow
//                           key={node._id}
//                           node={node}
//                           onClick={() => handleFolderClick(node)}
//                           isHighlighted={node._id === highlightedItemId}
//                         />
//                       ) : (
//                         <SubfolderRow
//                           key={node._id}
//                           node={node}
//                           onClick={
//                             node.type === "folder"
//                               ? () => handleFolderClick(node)
//                               : undefined
//                           }
//                           isHighlighted={node._id === highlightedItemId}
//                         />
//                       )
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             ) : isMobile ? (
//               /* Mobile List View */
//               <Box sx={{ backgroundColor: "white", borderRadius: 3, overflow: "hidden" }}>
//                 {filteredItems.map((node) =>
//                   isRootLevel ? (
//                     <MobileClassCard
//                       key={node._id}
//                       node={node}
//                       onClick={() => handleFolderClick(node)}
//                       isHighlighted={node._id === highlightedItemId}
//                     />
//                   ) : (
//                     <MobileSubfolderCard
//                       key={node._id}
//                       node={node}
//                       onClick={
//                         node.type === "folder"
//                           ? () => handleFolderClick(node)
//                           : undefined
//                       }
//                       isHighlighted={node._id === highlightedItemId}
//                     />
//                   )
//                 )}
//               </Box>
//             ) : (
//               /* Grid View (Desktop & Tablet) or Subfolder View */
//               <Box
//                 sx={{
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: 3,
//                   "& > *": {
//                     flexBasis: {
//                       xs: "100%",
//                       sm: isRootLevel ? "calc(50% - 12px)" : "calc(50% - 12px)",
//                       md: isRootLevel
//                         ? "calc(33.333% - 16px)"
//                         : "calc(33.333% - 16px)",
//                       lg: isRootLevel ? "calc(25% - 18px)" : "calc(33.333% - 16px)",
//                     },
//                     flexGrow: 0,
//                     flexShrink: 0,
//                   },
//                 }}
//               >
//                 {filteredItems.map((node) => (
//                   <Box
//                     key={node._id}
//                     id={`material-item-${node._id}`}
//                     sx={{
//                       transition: "all 0.3s ease",
//                       ...(node._id === highlightedItemId && {
//                         animation: "pulse 2s ease-in-out",
//                         "@keyframes pulse": {
//                           "0%, 100%": {
//                             boxShadow: "0 0 0 0 rgba(255, 193, 7, 0.7)",
//                           },
//                           "50%": {
//                             boxShadow: "0 0 0 10px rgba(255, 193, 7, 0)",
//                           },
//                         },
//                       }),
//                     }}
//                   >
//                     {isRootLevel ? (
//                       <ClassCard
//                         node={node}
//                         onClick={() => handleFolderClick(node)}
//                       />
//                     ) : (
//                       <SubfolderCard
//                         node={node}
//                         onClick={
//                           node.type === "folder"
//                             ? () => handleFolderClick(node)
//                             : undefined
//                         }
//                       />
//                     )}
//                   </Box>
//                 ))}
//               </Box>
//             )}
//           </>
//         )}
//       </Container>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default StudentFolderStructure;



import { useState, useEffect, useCallback } from "react";
import type { Node } from "../../../admin/Material/types/node";
import {
  Box,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Typography,
  Chip,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Home,
  NavigateNext,
  FolderOpen,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  fetchNodesByParentId,
  fetchStudentClasses,
} from "../services/StudentAccessMateral.services";
import { useLocation } from "react-router-dom";
import { ClassRow } from "../classcard/ClassRow";
import { SubfolderRow } from "../subfolder/SubFolderRow";
import { MobileSubfolderCard } from "../subfolder/MobileSubFolderCard";
import { MobileClassCard } from "../classcard/MobileClassCard";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface LocationState {
  navigateToPath?: Array<{ id: string; heading: string }>;
  shouldNavigate?: boolean;
  timestamp?: number;
}

// Helper function to get display name from node
const getDisplayHeading = (node: Node | { id: string; heading: string }): string => {
  if ('subject' in node && node.subject && typeof node.subject === "object") {
    const subject = node.subject as { name: string };
    if (subject.name) return subject.name;
  }
  return node.heading || "Untitled";
};

// Main App Component
const StudentFolderStructure: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [currentItems, setCurrentItems] = useState<Node[]>([]);
  const [filteredItems, setFilteredItems] = useState<Node[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const loadRootClasses = useCallback(async () => {
    setLoading(true);
    try {
      const classes = await fetchStudentClasses();
      setCurrentItems(classes);
      setCurrentNode(null);
      setSearchQuery("");
      setSnackbar({
        open: true,
        message: `Loaded ${classes.length} classes successfully`,
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to load classes. Please try again.",
        severity: "error",
      });
      setCurrentItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFolderContents = useCallback(async (node: Node) => {
    setLoading(true);
    try {
      const items = await fetchNodesByParentId(node._id);
      setCurrentItems(items);
      setCurrentNode(node);
      setSearchQuery("");
      if (items.length === 0) {
        setSnackbar({
          open: true,
          message: "This folder is empty",
          severity: "info",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to load folder contents. Please try again.",
        severity: "error",
      });
      setCurrentItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateToPath = useCallback(async (
    path: Array<{ id: string; heading: string }>
  ) => {
    if (path.length === 0) {
      loadRootClasses();
      return;
    }

    try {
      setLoading(true);

      const targetName = path[path.length - 1].heading || "Unknown";
      setSnackbar({
        open: true,
        message: `Navigating to ${targetName}...`,
        severity: "info",
      });

      if (path.length === 1) {
        const classes = await fetchStudentClasses();
        setCurrentItems(classes);
        setCurrentNode(null);
        setHighlightedItemId(path[0].id);
      } else {
        const parentFolderItem = path[path.length - 2];
        const items = await fetchNodesByParentId(parentFolderItem.id);

        const parentNode: Node = {
          _id: parentFolderItem.id,
          heading: getDisplayHeading(parentFolderItem),
          type: "folder",
          path: path.slice(0, path.length - 2).map((p) => ({
            id: p.id,
            heading: getDisplayHeading(p),
          })),
        } as Node;

        setCurrentNode(parentNode);
        setCurrentItems(items);

        const targetFileId = path[path.length - 1].id;
        setHighlightedItemId(targetFileId);

        setTimeout(() => {
          const element = document.getElementById(
            `material-item-${targetFileId}`
          );
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);
      }

      setSnackbar({
        open: true,
        message: `Navigated to ${targetName}`,
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to navigate. Loading root instead.",
        severity: "error",
      });
      loadRootClasses();
    } finally {
      setLoading(false);
      setTimeout(() => setHighlightedItemId(null), 4000);
    }
  }, [loadRootClasses]);

  // Fetch root level classes on component mount
  useEffect(() => {
    if (locationState?.shouldNavigate && locationState?.navigateToPath) {
      navigateToPath(locationState.navigateToPath);
      window.history.replaceState({}, document.title);
    } else {
      loadRootClasses();
    }
  }, [locationState?.timestamp, locationState?.navigateToPath, locationState?.shouldNavigate, navigateToPath, loadRootClasses]);

  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(currentItems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = currentItems.filter((item) => {
        const heading = getDisplayHeading(item).toLowerCase();

        const stream = (typeof item.stream === "string" ? item.stream : item.stream?.name || "").toLowerCase();
        const targetExam = (typeof item.targetExam === "string" ? item.targetExam : item.targetExam?.name || "").toLowerCase();

        const subjectValue = item.subject;
        const subject =
          subjectValue && typeof subjectValue === "object" && "name" in subjectValue
            ? ((subjectValue as { name: string }).name || "").toLowerCase()
            : (typeof subjectValue === "string" ? subjectValue : "").toLowerCase();

        return (
          heading.includes(query) ||
          stream.includes(query) ||
          targetExam.includes(query) ||
          subject.includes(query)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, currentItems]);

  // console.log(filteredItems);



  const handleFolderClick = useCallback(async (node: Node) => {
    if (node.type === "folder") {
      await loadFolderContents(node);
    }
  }, [loadFolderContents]);

  const handleBreadcrumbClick = useCallback(async (
    pathItem: { id: string; heading: string } | null
  ) => {
    if (!pathItem) {
      await loadRootClasses();
    } else {
      const node = currentItems.find((item) => item._id === pathItem.id);
      if (node) {
        await loadFolderContents(node);
      } else {
        setLoading(true);
        try {
          const items = await fetchNodesByParentId(pathItem.id);
          const clickedIndex =
            currentNode?.path?.findIndex((p) => p.id === pathItem.id) ?? -1;
          const newPath =
            clickedIndex >= 0 ? currentNode?.path?.slice(0, clickedIndex) || [] : [];

          setCurrentNode({
            _id: pathItem.id,
            heading: pathItem.heading || "Folder",
            type: "folder",
            path: newPath,
          } as Node);
          setCurrentItems(items);
        } catch {
          setSnackbar({
            open: true,
            message: "Failed to load folder contents. Please try again.",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      }
    }
  }, [loadRootClasses, currentItems, loadFolderContents, currentNode?.path]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isRootLevel = !currentNode;

  const currentBreadcrumb = currentNode
    ? [
      ...(currentNode.path || []),
      { id: currentNode._id, heading: getDisplayHeading(currentNode) },
    ]
    : [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        pb: 6,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 4 }, pb: 2 }}>
        {/* Header Section */}
        <Box
          sx={{
            mb: 3,
            pb: 2,
            borderBottom: "2px solid",
            borderColor: "divider",
          }}
        >
          {/* Title Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #06444a 0%, #1d3e46 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              <FolderOpen
                sx={{ color: "white", fontSize: { xs: 24, md: 28 } }}
              />
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #042f1b 0%, #083542 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              My Classes
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search classes, subjects, or exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#06444a",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#06444a",
                  },
                },
              }}
            />
          </Box>

          {/* Breadcrumbs */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" sx={{ color: "#9e9e9e" }} />}
              sx={{
                "& .MuiBreadcrumbs-ol": {
                  flexWrap: isMobile ? "wrap" : "nowrap",
                },
              }}
            >
              <Link
                component="button"
                underline="none"
                onClick={() => handleBreadcrumbClick(null)}
                disabled={loading}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: loading ? "not-allowed" : "pointer",
                  px: { xs: 1, md: 1.5 },
                  py: 0.75,
                  borderRadius: "8px",
                  fontWeight: isRootLevel ? 600 : 500,
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                  color: isRootLevel ? "#114a50" : "#0b3c54",
                  backgroundColor: isRootLevel ? "#e2f6f6" : "transparent",
                  transition: "all 0.2s ease",
                  opacity: loading ? 0.6 : 1,
                  "&:hover": {
                    backgroundColor: loading
                      ? undefined
                      : isRootLevel
                        ? "#e3fffd"
                        : "#def3f6",
                    transform: loading ? undefined : "translateY(-1px)",
                  },
                }}
              >
                <Home sx={{ mr: 0.5, fontSize: { xs: 16, md: 18 } }} />
                Home
              </Link>

              {currentBreadcrumb.map((pathItem, index) => {
                const isLast = index === currentBreadcrumb.length - 1;
                const displayName = getDisplayHeading(pathItem);

                return (
                  <Link
                    key={pathItem.id}
                    component="button"
                    underline="none"
                    onClick={() => !isLast && handleBreadcrumbClick(pathItem)}
                    disabled={loading || isLast}
                    sx={{
                      cursor: loading || isLast ? "default" : "pointer",
                      px: { xs: 1, md: 1.5 },
                      py: 0.75,
                      borderRadius: "8px",
                      fontWeight: isLast ? 600 : 500,
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      color: isLast ? "#105d65" : "#616161",
                      backgroundColor: isLast ? "#f0fffa" : "transparent",
                      transition: "all 0.2s ease",
                      maxWidth: { xs: "150px", md: "200px" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      opacity: loading ? 0.6 : 1,
                      "&:hover": {
                        backgroundColor:
                          loading || isLast ? undefined : "#f5f5f5",
                        transform:
                          loading || isLast ? undefined : "translateY(-1px)",
                      },
                    }}
                  >
                    {displayName}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Paper>

          {/* Results Info */}
          {!loading && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${filteredItems.length} ${filteredItems.length === 1 ? "item" : "items"
                  }${searchQuery ? " found" : ""}`}
                size="small"
                sx={{
                  backgroundColor: "#e8eaf6",
                  color: "#5c6bc0",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
              {searchQuery && (
                <Typography variant="body2" color="text.secondary">
                  searching for <strong>"{searchQuery}"</strong>
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: "16px",
              border: "2px dashed #e0e0e0",
              backgroundColor: "#fafafa",
            }}
          >
            <FolderOpen sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {searchQuery ? "No matches found" : "No items found"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery
                ? `Try adjusting your search terms`
                : "This folder is empty"}
            </Typography>
            {searchQuery && (
              <Box sx={{ mt: 2 }}>
                <Link
                  component="button"
                  onClick={handleClearSearch}
                  sx={{
                    color: "#06444a",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear search
                </Link>
              </Box>
            )}
          </Paper>
        ) : (
          /* Content Display - List View Only */
          <>
            {/* Desktop Table View */}
            {!isMobile ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.85rem",
                          py: 2,
                        }}
                      >
                        Name
                      </TableCell>
                      {isRootLevel ? (
                        <>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              color: "#475569",
                              fontSize: "0.85rem",
                              py: 2,
                              width: "180px",
                            }}
                          >
                            Target Exam
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              color: "#475569",
                              fontSize: "0.85rem",
                              py: 2,
                              width: "120px",
                            }}
                          >
                            Type
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              color: "#475569",
                              fontSize: "0.85rem",
                              py: 2,
                              width: "180px",
                            }}
                          >
                            Attachments
                          </TableCell>
                        </>
                      )}
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.85rem",
                          py: 2,
                          width: "180px",
                        }}
                      >
                        Modified
                      </TableCell>
                      <TableCell sx={{ width: "100px" }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((node) =>
                      isRootLevel ? (
                        <ClassRow
                          key={node._id}
                          node={node}
                          onClick={() => handleFolderClick(node)}
                          isHighlighted={node._id === highlightedItemId}
                        />
                      ) : (
                        <SubfolderRow
                          key={node._id}
                          node={node}
                          onClick={
                            node.type === "folder"
                              ? () => handleFolderClick(node)
                              : undefined
                          }
                          isHighlighted={node._id === highlightedItemId}
                        />
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* Mobile List View */
              <Box sx={{ backgroundColor: "white", borderRadius: 3, overflow: "hidden" }}>
                {filteredItems.map((node) =>
                  isRootLevel ? (
                    <MobileClassCard
                      key={node._id}
                      node={node}
                      onClick={() => handleFolderClick(node)}
                      isHighlighted={node._id === highlightedItemId}
                    />
                  ) : (
                    <MobileSubfolderCard
                      key={node._id}
                      node={node}
                      onClick={
                        node.type === "folder"
                          ? () => handleFolderClick(node)
                          : undefined
                      }
                      isHighlighted={node._id === highlightedItemId}
                    />
                  )
                )}
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentFolderStructure;