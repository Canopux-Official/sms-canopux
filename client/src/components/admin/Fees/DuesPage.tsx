import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, TextField, MenuItem, Button, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { FeeContainer, FeeHeader } from './FeeStructurePage.styles';
import { getFeeDues, getFeeReports, getActiveStreams } from '../../../api/apiFunctions';
import type { IDueRow } from './types';

interface ILookup { _id: string; name: string; }

interface IReportSummary {
  totalNetPayable: number;
  totalCollected: number;
  totalOutstanding: number;
  studentCount: number;
  fullyPaidCount: number;
}

const DuesPage: React.FC = () => {
  const [rows, setRows] = useState<IDueRow[]>([]);
  const [streams, setStreams] = useState<ILookup[]>([]);
  const [summary, setSummary] = useState<IReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentClass, setCurrentClass] = useState('');
  const [streamId, setStreamId] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [status, setStatus] = useState<'' | 'due' | 'paid'>('due');

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (currentClass) params.set('currentClass', currentClass);
    if (streamId) params.set('streamId', streamId);
    if (academicSession) params.set('academicSession', academicSession);
    if (status) params.set('status', status);
    return params.toString();
  };

  const fetchData = async () => {
    setLoading(true);
    const [duesRes, reportRes] = await Promise.all([
      getFeeDues(buildQuery()),
      getFeeReports(academicSession ? `academicSession=${academicSession}` : '')
    ]);
    if (duesRes.success && duesRes.data && Array.isArray((duesRes.data as any).data)) {
      setRows((duesRes.data as any).data);
    } else {
      setRows([]);
    }
    if (reportRes.success && reportRes.data) {
      setSummary((reportRes.data as any).summary);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const res = await getActiveStreams();
      if (res.success && Array.isArray(res.data)) setStreams(res.data as ILookup[]);
    })();
  }, []);

  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [currentClass, streamId, academicSession, status]);

  const exportCsv = () => {
    const header = ['Enrollment No.', 'Name', 'Phone', 'Class', 'Session', 'Net Payable', 'Paid', 'Due'];
    const lines = rows.map(r => [
      r.enrollmentNumber, r.name, r.phoneNumber, r.currentClass, r.academicSession,
      r.netPayable, r.totalPaid, r.totalDue
    ].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-dues-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FeeContainer>
      <FeeHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Dues & Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            See who owes what, filter by class/stream/session, and export the list.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={rows.length === 0}>
          Export CSV
        </Button>
      </FeeHeader>

      {summary && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Total Payable</Typography>
            <Typography variant="h6" fontWeight={700}>₹{summary.totalNetPayable.toLocaleString('en-IN')}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Collected</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">₹{summary.totalCollected.toLocaleString('en-IN')}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Outstanding</Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">₹{summary.totalOutstanding.toLocaleString('en-IN')}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Fully Paid</Typography>
            <Typography variant="h6" fontWeight={700}>{summary.fullyPaidCount} / {summary.studentCount}</Typography>
          </Paper>
        </Stack>
      )}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label="Class" size="small" value={currentClass} onChange={(e) => setCurrentClass(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All</MenuItem>
            {['9', '10', '11', '12', 'dropper-1', 'dropper-2'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField select label="Stream" size="small" value={streamId} onChange={(e) => setStreamId(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {streams.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Academic Session" size="small" placeholder="2025-26" value={academicSession} onChange={(e) => setAcademicSession(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField select label="Status" size="small" value={status} onChange={(e) => setStatus(e.target.value as any)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="due">Has Dues</MenuItem>
            <MenuItem value="paid">Fully Paid</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {loading ? <CircularProgress sx={{ mx: 'auto', display: 'block' }} /> : rows.length === 0 ? (
        <Alert severity="info">No records match these filters.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Enrollment No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Session</TableCell>
                <TableCell align="right">Net Payable</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Due</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={`${r.studentId}-${r.academicSession}`} hover>
                  <TableCell>{r.enrollmentNumber}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.currentClass}</TableCell>
                  <TableCell>{r.phoneNumber}</TableCell>
                  <TableCell>{r.academicSession}</TableCell>
                  <TableCell align="right">₹{r.netPayable.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right">₹{r.totalPaid.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right">₹{r.totalDue.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.isFullyPaid ? 'Paid' : 'Due'} color={r.isFullyPaid ? 'success' : 'warning'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </FeeContainer>
  );
};

export default DuesPage;