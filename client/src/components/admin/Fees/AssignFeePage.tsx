import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Stack, TextField, MenuItem, Button, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Chip, Divider, Alert, ToggleButtonGroup, ToggleButton, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { FeeContainer, FeeHeader } from './FeeStructurePage.styles';
import { getStudents, getActiveFeeStructures, assignFee } from '../../../api/apiFunctions';
import type { IFeeStructure, IInstallmentTemplate, IStudentLite } from './types';

const emptyInstallment = (): IInstallmentTemplate => ({ label: '', dueDate: '', amount: 0 });

const AssignFeePage: React.FC = () => {
  const [students, setStudents] = useState<IStudentLite[]>([]);
  const [structures, setStructures] = useState<IFeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ assignedCount: number; failedCount: number; failed: any[] } | null>(null);

  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [feeStructureId, setFeeStructureId] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [customInstallments, setCustomInstallments] = useState<IInstallmentTemplate[]>([emptyInstallment()]);

  const fetchData = async () => {
    setLoading(true);
    const [studentRes, structureRes] = await Promise.all([getStudents(), getActiveFeeStructures()]);
    if (studentRes.success && Array.isArray(studentRes.data)) setStudents(studentRes.data as IStudentLite[]);
    if (structureRes.success && structureRes.data && Array.isArray((structureRes.data as any).data)) {
      setStructures((structureRes.data as any).data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const selectedStructure = useMemo(
    () => structures.find(s => s._id === feeStructureId) || null,
    [structures, feeStructureId]
  );

  // Auto-fill the academic session once a template is picked.
  useEffect(() => {
    if (selectedStructure) setAcademicSession(selectedStructure.academicSession);
  }, [selectedStructure]);

  const filteredStudents = students.filter(s => {
    const matchesClass = !classFilter || s.currentClass === classFilter;
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentNumber.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    const allVisibleSelected = filteredStudents.every(s => selected.has(s._id));
    setSelected(prev => {
      const next = new Set(prev);
      filteredStudents.forEach(s => allVisibleSelected ? next.delete(s._id) : next.add(s._id));
      return next;
    });
  };

  const handleAssign = async () => {
    if (selected.size === 0) return alert('Select at least one student');
    if (!academicSession.trim()) return alert('Academic session is required');
    if (mode === 'template' && !feeStructureId) return alert('Pick a fee structure template');
    if (mode === 'custom' && customInstallments.some(i => !i.label.trim() || !i.dueDate || !i.amount)) {
      return alert('Every custom installment needs a label, due date and amount');
    }

    setSubmitting(true);
    setResult(null);

    const res = await assignFee({
      studentIds: Array.from(selected),
      academicSession,
      discountAmount: Number(discountAmount) || 0,
      discountReason,
      ...(mode === 'template' ? { feeStructureId } : { customInstallments })
    });

    setSubmitting(false);

    if (!res.success) {
      alert((res.message as string) || 'Failed to assign fee');
      return;
    }

    const data = res.data as any;
    setResult({ assignedCount: data.assignedCount, failedCount: data.failedCount, failed: data.failed });
    setSelected(new Set());
  };

  return (
    <FeeContainer>
      <FeeHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Assign Fees</Typography>
          <Typography variant="body2" color="text.secondary">
            Apply a fee template to a batch of students, with optional scholarship/discount.
          </Typography>
        </Box>
      </FeeHeader>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <ToggleButtonGroup
            value={mode} exclusive size="small"
            onChange={(_, v) => v && setMode(v)}
          >
            <ToggleButton value="template">Use Template</ToggleButton>
            <ToggleButton value="custom">Custom (this batch only)</ToggleButton>
          </ToggleButtonGroup>

          {mode === 'template' ? (
            <TextField
              select label="Fee Structure Template" value={feeStructureId}
              onChange={(e) => setFeeStructureId(e.target.value)}
              helperText={selectedStructure ? `₹${selectedStructure.totalAmount.toLocaleString('en-IN')} · ${selectedStructure.installments.length} installment(s)` : ''}
            >
              {structures.map(s => (
                <MenuItem key={s._id} value={s._id}>
                  Class {s.classType} · {s.targetExam?.name} {s.stream ? `· ${s.stream.name}` : ''} · {s.academicSession} (₹{s.totalAmount.toLocaleString('en-IN')})
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="info">
                This custom schedule applies only to the students selected below — it isn't saved as a reusable template.
              </Alert>
              {customInstallments.map((inst, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Label" size="small" value={inst.label}
                    onChange={(e) => setCustomInstallments(prev => prev.map((it, i) => i === index ? { ...it, label: e.target.value } : it))}
                    sx={{ flex: 1.2 }}
                  />
                  <TextField
                    label="Due Date" size="small" type="date" value={inst.dueDate}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setCustomInstallments(prev => prev.map((it, i) => i === index ? { ...it, dueDate: e.target.value } : it))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Amount" size="small" type="number" value={inst.amount || ''}
                    onChange={(e) => setCustomInstallments(prev => prev.map((it, i) => i === index ? { ...it, amount: Number(e.target.value) } : it))}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    disabled={customInstallments.length === 1}
                    onClick={() => setCustomInstallments(prev => prev.filter((_, i) => i !== index))}
                  >
                    <RemoveCircleOutlineIcon fontSize="small" color="error" />
                  </IconButton>
                </Stack>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => setCustomInstallments(prev => [...prev, emptyInstallment()])} sx={{ alignSelf: 'flex-start' }}>
                Add Installment
              </Button>
              <Typography variant="subtitle2" fontWeight={700} textAlign="right">
                Total: ₹{customInstallments.reduce((s, i) => s + (Number(i.amount) || 0), 0).toLocaleString('en-IN')}
              </Typography>
            </Stack>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Academic Session" value={academicSession} placeholder="2025-26"
              onChange={(e) => setAcademicSession(e.target.value)} fullWidth
            />
            <TextField
              label="Discount / Scholarship (₹)" type="number" value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Number(e.target.value))} fullWidth
            />
            <TextField
              label="Discount Reason" value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)} fullWidth
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems={{ sm: 'center' }}>
          <TextField
            select label="Filter by Class" size="small" value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)} sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Classes</MenuItem>
            {['9', '10', '11', '12', 'dropper-1', 'dropper-2'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField
            size="small" label="Search name / enrollment no." value={search}
            onChange={(e) => setSearch(e.target.value)} fullWidth
          />
          <Chip label={`${selected.size} selected`} color={selected.size ? 'primary' : 'default'} />
        </Stack>

        {loading ? <CircularProgress /> : (
          <TableContainer sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={filteredStudents.length > 0 && filteredStudents.every(s => selected.has(s._id))}
                      onChange={toggleSelectAllVisible}
                    />
                  </TableCell>
                  <TableCell>Enrollment No.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Stream</TableCell>
                  <TableCell>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map(s => (
                  <TableRow key={s._id} hover selected={selected.has(s._id)} onClick={() => toggleSelected(s._id)} sx={{ cursor: 'pointer' }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.has(s._id)} onChange={() => toggleSelected(s._id)} onClick={(e) => e.stopPropagation()} />
                    </TableCell>
                    <TableCell>{s.enrollmentNumber}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.currentClass}</TableCell>
                    <TableCell>{s.stream?.name || '-'}</TableCell>
                    <TableCell>{s.phoneNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {result && (
        <Alert severity={result.failedCount ? 'warning' : 'success'}>
          Assigned to {result.assignedCount} student(s). {result.failedCount > 0 && `${result.failedCount} failed (likely already had a fee for this session).`}
          {result.failed.length > 0 && (
            <Box mt={1}>
              {result.failed.map((f: any, i: number) => (
                <Typography key={i} variant="caption" display="block">{f.studentId}: {f.reason}</Typography>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Divider />
      <Box textAlign="right">
        <Button variant="contained" size="large" onClick={handleAssign} disabled={submitting}>
          {submitting ? <CircularProgress size={22} /> : `Assign Fee to ${selected.size} Student(s)`}
        </Button>
      </Box>
    </FeeContainer>
  );
};

export default AssignFeePage;