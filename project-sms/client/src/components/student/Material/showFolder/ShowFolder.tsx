import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Node } from "../../../admin/Material/types/node";
import {
  Box,
  Container,
  Button,
  LinearProgress,
  Skeleton,
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
import { getDisplayHeading, getNameLabel } from "../utils/nodeHelpers";

const ROOT_KEY = "__root__";
const errorText = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

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

/* ---------- Skeleton placeholders (shown only when nothing is on screen yet) ---------- */

const ClassSkeletonRows: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Skeleton variant="text" width="55%" />
          </Box>
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="70%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell />
      </TableRow>
    ))}
  </>
);

const SubfolderSkeletonRows: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Skeleton variant="text" width="55%" />
          </Box>
        </TableCell>
        <TableCell>
          <Skeleton variant="rounded" width={70} height={24} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="50%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell />
      </TableRow>
    ))}
  </>
);

const MobileSkeletonList: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Skeleton variant="rounded" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="65%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      </Box>
    ))}
  </>
);

const headCellSx = {
  fontWeight: 700,
  color: "#475569",
  fontSize: "0.85rem",
  py: 2,
};

// Main App Component
const StudentFolderStructure: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [currentItems, setCurrentItems] = useState<Node[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingLevel, setLoadingLevel] = useState<"root" | "folder">("root");
  const [loadError, setLoadError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Node[]>>(new Map());
  const requestRef = useRef(0); // lets a newer click win over an older, slower one
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const loadRootClasses = useCallback(async () => {
    const requestId = ++requestRef.current;
    const cached = cacheRef.current.get(ROOT_KEY);
    setLoadError(null);
    setLoadingLevel("root");
    setSearchQuery("");
    if (cached) {
      setCurrentItems(cached); // show what we already have, refresh below
      setCurrentNode(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const classes = await fetchStudentClasses();
      if (requestId !== requestRef.current) return;
      cacheRef.current.set(ROOT_KEY, classes);
      setCurrentItems(classes);
      setCurrentNode(null);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      const message = errorText(error, "Failed to load classes. Please try again.");
      if (!cached) {
        setCurrentItems([]);
        setCurrentNode(null);
        setLoadError(message);
      }
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  const loadFolderContents = useCallback(async (node: Node) => {
    const requestId = ++requestRef.current;
    const cached = cacheRef.current.get(node._id);
    setLoadError(null);
    setLoadingLevel("folder");
    setSearchQuery("");
    if (cached) {
      setCurrentItems(cached);
      setCurrentNode(node);
      setLoading(false);
    } else {
      setLoading(true); // the current list stays visible until the new one arrives
    }
    try {
      const items = await fetchNodesByParentId(node._id);
      if (requestId !== requestRef.current) return;
      cacheRef.current.set(node._id, items);
      setCurrentItems(items);
      setCurrentNode(node);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      setSnackbar({
        open: true,
        message: errorText(error, "Failed to load folder contents. Please try again."),
        severity: "error",
      });
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  const navigateToPath = useCallback(
    async (path: Array<{ id: string; heading: string }>) => {
      if (path.length === 0) {
        await loadRootClasses();
        return;
      }

      const requestId = ++requestRef.current;
      setLoadError(null);
      setLoadingLevel(path.length > 1 ? "folder" : "root");
      setSearchQuery("");
      setLoading(true);
      try {
        if (path.length === 1) {
          const classes = await fetchStudentClasses();
          if (requestId !== requestRef.current) return;
          cacheRef.current.set(ROOT_KEY, classes);
          setCurrentItems(classes);
          setCurrentNode(null);
          setHighlightedItemId(path[0].id);
        } else {
          const parentFolderItem = path[path.length - 2];
          const items = await fetchNodesByParentId(parentFolderItem.id);
          if (requestId !== requestRef.current) return;
          cacheRef.current.set(parentFolderItem.id, items);

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
          setHighlightedItemId(path[path.length - 1].id);
        }
      } catch (error) {
        if (requestId !== requestRef.current) return;
        setSnackbar({
          open: true,
          message: `${errorText(error, "Failed to navigate.")} Showing your classes instead.`,
          severity: "error",
        });
        await loadRootClasses();
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [loadRootClasses]
  );

  // Same trigger as before: dashboard links still arrive through router state.
  useEffect(() => {
    if (locationState?.shouldNavigate && locationState?.navigateToPath) {
      navigateToPath(locationState.navigateToPath);
      window.history.replaceState({}, document.title);
    } else {
      loadRootClasses();
    }
  }, [
    locationState?.timestamp,
    locationState?.navigateToPath,
    locationState?.shouldNavigate,
    navigateToPath,
    loadRootClasses,
  ]);

  // Scroll to the row a dashboard link pointed at, once the list is on screen
  useEffect(() => {
    if (!highlightedItemId || loading) return;
    document
      .getElementById(`material-item-${highlightedItemId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedItemId, loading, currentItems]);

  // Clear the highlight after 4 seconds, and never after the page is left
  useEffect(() => {
    if (!highlightedItemId) return;
    const timer = setTimeout(() => setHighlightedItemId(null), 4000);
    return () => clearTimeout(timer);
  }, [highlightedItemId]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return currentItems;
    return currentItems.filter(
      (item) =>
        getDisplayHeading(item).toLowerCase().includes(query) ||
        getNameLabel(item.stream).toLowerCase().includes(query) ||
        getNameLabel(item.targetExam).toLowerCase().includes(query)
    );
  }, [searchQuery, currentItems]);

  const handleFolderClick = useCallback(
    async (node: Node) => {
      if (node.type === "folder") {
        await loadFolderContents(node);
      }
    },
    [loadFolderContents]
  );

  const handleBreadcrumbClick = useCallback(
    async (pathItem: { id: string; heading: string } | null) => {
      if (!pathItem) {
        await loadRootClasses();
        return;
      }
      const clickedIndex = currentNode?.path?.findIndex((p) => p.id === pathItem.id) ?? -1;
      const node =
        currentItems.find((item) => item._id === pathItem.id) ??
        ({
          _id: pathItem.id,
          heading: pathItem.heading || "Folder",
          type: "folder",
          path: clickedIndex >= 0 ? currentNode?.path?.slice(0, clickedIndex) || [] : [],
        } as Node);
      await loadFolderContents(node);
    },
    [loadRootClasses, loadFolderContents, currentItems, currentNode?.path]
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isRootLevel = !currentNode;

  const initialLoading = loading && currentItems.length === 0; // nothing to show yet: skeleton
  const navigating = loading && currentItems.length > 0; // list on screen: dim it + progress bar
  const rootColumns = initialLoading ? loadingLevel === "root" : isRootLevel;

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
                background: "linear-gradient(135deg, #06444a 0%, #1d3e46 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              <FolderOpen sx={{ color: "white", fontSize: { xs: 24, md: 28 } }} />
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #042f1b 0%, #083542 100%)",
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
                    <IconButton size="small" onClick={handleClearSearch} edge="end">
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
                        backgroundColor: loading || isLast ? undefined : "#f5f5f5",
                        transform: loading || isLast ? undefined : "translateY(-1px)",
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

        {loadError && currentItems.length === 0 && !loading ? (
          /* Error State */
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: "16px",
              border: "2px dashed #f5c2c7",
              backgroundColor: "#fff5f5",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#b42318" }}>
              Could not load your classes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {loadError}
            </Typography>
            <Button variant="outlined" onClick={() => loadRootClasses()}>
              Try again
            </Button>
          </Paper>
        ) : !loading && filteredItems.length === 0 ? (
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
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              {searchQuery ? "No matches found" : "No items found"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? `Try adjusting your search terms` : "This folder is empty"}
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
          <Box sx={{ position: "relative" }}>
            {navigating && (
              <LinearProgress
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  borderRadius: 1,
                }}
              />
            )}
            <Box
              sx={{
                opacity: navigating ? 0.55 : 1,
                pointerEvents: navigating ? "none" : "auto",
                transition: "opacity 0.15s ease",
              }}
            >
              {!isMobile ? (
                /* Desktop Table View */
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
                        <TableCell sx={headCellSx}>Name</TableCell>
                        {rootColumns ? (
                          <TableCell sx={{ ...headCellSx, width: "180px" }}>
                            Target Exam
                          </TableCell>
                        ) : (
                          <>
                            <TableCell sx={{ ...headCellSx, width: "120px" }}>
                              Type
                            </TableCell>
                            <TableCell sx={{ ...headCellSx, width: "180px" }}>
                              Attachments
                            </TableCell>
                          </>
                        )}
                        <TableCell sx={{ ...headCellSx, width: "180px" }}>
                          {rootColumns ? "Created" : "Due Date"}

                        </TableCell>
                        <TableCell sx={{ width: "100px" }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {initialLoading ? (
                        loadingLevel === "root" ? (
                          <ClassSkeletonRows rows={5} />
                        ) : (
                          <SubfolderSkeletonRows rows={6} />
                        )
                      ) : (
                        filteredItems.map((node) =>
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
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                /* Mobile List View */
                <Box
                  sx={{ backgroundColor: "white", borderRadius: 3, overflow: "hidden" }}
                >
                  {initialLoading ? (
                    <MobileSkeletonList rows={6} />
                  ) : (
                    filteredItems.map((node) =>
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
                    )
                  )}
                </Box>
              )}
            </Box>
          </Box>
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