import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { noticeService } from '../../components/admin/Notice/services/adminNotics';
import { getStreams, getTargetExams } from '../../api/apiFunctions';
import NoticeModal from '../../components/admin/Notice/modals/NoticeModel';
import type { Notice, NoticeFormData, Stream, TargetExam } from '../../components/admin/Notice/types/types';

const AdminNoticePage = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [filterClassType, setFilterClassType] = useState('All');
  const [filterStream, setFilterStream] = useState('All');
  const [filterTargetExam, setFilterTargetExam] = useState('All');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Queries
  const { data: noticesResponse, isLoading: loadingNotices } = useQuery({
    queryKey: ['notices'],
    queryFn: () => noticeService.getAllNotices()
  });

  const { data: streamsResponse, isLoading: loadingStreams } = useQuery({
    queryKey: ['streams'],
    queryFn: getStreams
  });

  const { data: examsResponse, isLoading: loadingExams } = useQuery({
    queryKey: ['targetExams'],
    queryFn: getTargetExams
  });

  const notices: Notice[] = useMemo(() => noticesResponse?.data || [], [noticesResponse]);
  const streams: Stream[] = useMemo(() => (streamsResponse?.data as Stream[]) || [], [streamsResponse]);
  const targetExams: TargetExam[] = useMemo(() => (examsResponse?.data as TargetExam[]) || [], [examsResponse]);

  const loading = loadingNotices || loadingStreams || loadingExams;

  const filteredNotices = useMemo(() => {
    let filtered = notices;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((notice) =>
        notice.heading?.toLowerCase().includes(query) ||
        notice.description?.toLowerCase().includes(query) ||
        notice.tag?.toLowerCase().includes(query) ||
        notice.streams?.some(s => s.name?.toLowerCase().includes(query)) ||
        notice.targetExams?.some(e => e.name?.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (filterTag !== 'All') {
      filtered = filtered.filter((notice) => notice.tag === filterTag);
    }

    // Class Type filter
    if (filterClassType !== 'All') {
      filtered = filtered.filter((notice) => notice.classType === filterClassType);
    }

    // Stream filter
    if (filterStream !== 'All') {
      filtered = filtered.filter((notice) =>
        notice.streams?.some(stream => stream.name === filterStream)
      );
    }

    // Target Exam filter
    if (filterTargetExam !== 'All') {
      filtered = filtered.filter((notice) =>
        notice.targetExams?.some(exam => exam.name === filterTargetExam)
      );
    }

    return filtered;
  }, [notices, searchQuery, filterTag, filterClassType, filterStream, filterTargetExam]);

  // Reset page when filters change
  useMemo(() => setPage(0), [searchQuery, filterTag, filterClassType, filterStream, filterTargetExam]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setSelectedNotice(null);
    setModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setModalOpen(true);
  };

  const createNoticeMutation = useMutation({
    mutationFn: (data: NoticeFormData) => noticeService.createNotice(data),
    onSuccess: () => {
      showSnackbar('Notice created successfully', 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => showSnackbar('Failed to create notice', 'error')
  });

  const updateNoticeMutation = useMutation({
    mutationFn: (params: { id: string; data: NoticeFormData }) => noticeService.updateNotice(params.id, params.data),
    onSuccess: () => {
      showSnackbar('Notice updated successfully', 'success');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => showSnackbar('Failed to update notice', 'error')
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: (id: string) => noticeService.deleteNotice(id),
    onSuccess: () => {
      showSnackbar('Notice deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => showSnackbar('Failed to delete notice', 'error')
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    deleteNoticeMutation.mutate(id);
  };

  const handleSubmit = async (data: NoticeFormData) => {
    if (selectedNotice) {
      updateNoticeMutation.mutate({ id: selectedNotice._id, data });
    } else {
      createNoticeMutation.mutate(data);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedNotices = filteredNotices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: 'error' | 'warning' | 'info' | 'success' | 'default' } = {
      urgent: 'error',
      important: 'warning',
      general: 'info',
      announcement: 'success',
    };
    return colors[tag?.toLowerCase()] || 'default';
  };

  // Get unique tags and class types for filters
  const uniqueTags = Array.from(new Set(notices.map(n => n.tag).filter(Boolean)));
  const uniqueClassTypes = ['9', '10', '11', '12', 'Dropper 1', 'Dropper 2'];

  return (
    <Box sx={{ bgcolor: '#fafbfc', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="600" color="#1a1a1a">
                Notice Board Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage and organize all notices for students and staff
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                bgcolor: '#1a1a1a',
                color: 'white',
                '&:hover': { bgcolor: '#333' },
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none'
              }}
            >
              Add Notice
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Search - full width on all screens */}
            <TextField
              placeholder="Search heading, description, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#f8f9fa',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              size="small"
            />

            {/* Filters row - wraps on mobile */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr',        // 2 columns on mobile
                  sm: 'repeat(4, 1fr)', // 4 columns on tablet
                  md: 'repeat(4, 1fr) auto', // 4 + clear button on desktop
                },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>Tag</InputLabel>
                <Select
                  value={filterTag}
                  label="Tag"
                  onChange={(e) => setFilterTag(e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: '#f8f9fa' }}
                >
                  <MenuItem value="All">All Tags</MenuItem>
                  {uniqueTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Class Type</InputLabel>
                <Select
                  value={filterClassType}
                  label="Class Type"
                  onChange={(e) => setFilterClassType(e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: '#f8f9fa' }}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  {uniqueClassTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Stream</InputLabel>
                <Select
                  value={filterStream}
                  label="Stream"
                  onChange={(e) => setFilterStream(e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: '#f8f9fa' }}
                >
                  <MenuItem value="All">All Streams</MenuItem>
                  {streams.map((stream) => (
                    <MenuItem key={stream._id} value={stream.name}>{stream.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Target Exam</InputLabel>
                <Select
                  value={filterTargetExam}
                  label="Target Exam"
                  onChange={(e) => setFilterTargetExam(e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: '#f8f9fa' }}
                >
                  <MenuItem value="All">All Exams</MenuItem>
                  {targetExams.map((exam) => (
                    <MenuItem key={exam._id} value={exam.name}>{exam.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear button - spans full width on mobile, auto on desktop */}
              <Box
                sx={{
                  gridColumn: { xs: '1 / -1', md: 'auto' },
                  display: 'flex',
                  justifyContent: { xs: 'flex-end', md: 'center' },
                }}
              >
                <Tooltip title="Clear Filters">
                  <IconButton
                    onClick={() => {
                      setSearchQuery('');
                      setFilterTag('All');
                      setFilterClassType('All');
                      setFilterStream('All');
                      setFilterTargetExam('All');
                    }}
                    sx={{
                      bgcolor: '#f8f9fa',
                      borderRadius: 1.5,
                      px: { xs: 2, md: 1 },
                      '&:hover': { bgcolor: '#e9ecef' },
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Results count */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing {filteredNotices.length} of {notices.length} notices
          </Typography>
        </Paper>

        {/* Main Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={50} sx={{ color: '#1a1a1a' }} />
          </Box>
        ) : (
          <Paper sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem', py: 2 }}>
                      Heading
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                      Tag
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                      Class Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                      Streams
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                      Target Exams
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedNotices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          {searchQuery || filterTag !== 'All' || filterClassType !== 'All' || filterStream !== 'All' || filterTargetExam !== 'All'
                            ? 'No notices match your search criteria'
                            : 'No notices found. Create your first notice!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedNotices.map((notice, index) => (
                      <TableRow
                        key={notice._id}
                        sx={{
                          '&:hover': { bgcolor: '#fafbfc' },
                          borderBottom: index === paginatedNotices.length - 1 ? 'none' : '1px solid #f0f0f0'
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography variant="body2" fontWeight="500" color="#1a1a1a">
                            {notice.heading}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={notice.description || 'No description'} arrow>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 250,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {notice.description || 'N/A'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {notice.tag ? (
                            <Chip
                              label={notice.tag}
                              color={getTagColor(notice.tag)}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {notice.classType || (notice.isForAll ? 'ALL' : '—')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 220 }}>
                            {notice.streams && notice.streams.length > 0 ? (
                              <>
                                {notice.streams.slice(0, 2).map((stream, idx) => (
                                  <Chip
                                    key={idx}
                                    label={stream.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: '0.7rem',
                                      height: 22,
                                      borderColor: '#e0e0e0'
                                    }}
                                  />
                                ))}
                                {notice.streams.length > 2 && (
                                  <Chip
                                    label={`+${notice.streams.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: '0.7rem',
                                      height: 22,
                                      borderColor: '#e0e0e0'
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">{notice.isForAll ? 'ALL' : '—'}</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 220 }}>
                            {notice.targetExams && notice.targetExams.length > 0 ? (
                              <>
                                {notice.targetExams.slice(0, 2).map((exam, idx) => (
                                  <Chip
                                    key={idx}
                                    label={exam.name}
                                    size="small"
                                    sx={{
                                      fontSize: '0.7rem',
                                      height: 22,
                                      bgcolor: '#f0f4ff',
                                      color: '#1a5fff',
                                      border: '1px solid #d0dfff'
                                    }}
                                  />
                                ))}
                                {notice.targetExams.length > 2 && (
                                  <Chip
                                    label={`+${notice.targetExams.length - 2}`}
                                    size="small"
                                    sx={{
                                      fontSize: '0.7rem',
                                      height: 22,
                                      bgcolor: '#f0f4ff',
                                      color: '#1a5fff',
                                      border: '1px solid #d0dfff'
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">{notice.isForAll ? 'ALL' : '—'}</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Edit" arrow>
                              <IconButton
                                onClick={() => handleEdit(notice)}
                                size="small"
                                sx={{
                                  color: '#666',
                                  '&:hover': { bgcolor: '#f5f5f5', color: '#1a1a1a' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton
                                onClick={() => handleDelete(notice._id)}
                                size="small"
                                sx={{
                                  color: '#666',
                                  '&:hover': { bgcolor: '#fff5f5', color: '#d32f2f' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              component="div"
              count={filteredNotices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid #f0f0f0',
                bgcolor: '#fafbfc'
              }}
            />
          </Paper>
        )}

        <NoticeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          notice={selectedNotice}
          streams={streams}
          targetExams={targetExams}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminNoticePage;