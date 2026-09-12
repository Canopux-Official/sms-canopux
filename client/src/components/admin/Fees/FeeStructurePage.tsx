import React, { useEffect, useState } from 'react';
import {
  Typography, Button, Box, IconButton, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Stack, Divider, MenuItem,
  InputAdornment, CircularProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import { FeeContainer, FeeHeader, FeeGrid, FeeCard } from './FeeStructurePage.styles';
import {
  getFeeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure,
  getActiveStreams, getActiveTargetExams
} from '../../../api/apiFunctions';
import { CLASS_TYPES, type IFeeStructure, type IInstallmentTemplate } from './types';

interface ILookup { _id: string; name: string; }

const emptyInstallment = (): IInstallmentTemplate => ({ label: '', dueDate: '', amount: 0 });

const FeeStructurePage: React.FC = () => {
  const [structures, setStructures] = useState<IFeeStructure[]>([]);
  const [streams, setStreams] = useState<ILookup[]>([]);
  const [targetExams, setTargetExams] = useState<ILookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    classType: '11' as string,
    stream: '',
    targetExam: '',
    academicSession: '',
    isActive: true
  });
  const [installments, setInstallments] = useState<IInstallmentTemplate[]>([emptyInstallment()]);

  const needsStream = !['9', '10'].includes(formData.classType);
  const totalAmount = installments.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const fetchAll = async () => {
    setLoading(true);
    const [structRes, streamRes, examRes] = await Promise.all([
      getFeeStructures(), getActiveStreams(), getActiveTargetExams()
    ]);
    if (structRes.success && structRes.data && Array.isArray((structRes.data as any).data)) {
      setStructures((structRes.data as any).data);
    }
    if (streamRes.success && Array.isArray(streamRes.data)) setStreams(streamRes.data as ILookup[]);
    if (examRes.success && Array.isArray(examRes.data)) setTargetExams(examRes.data as ILookup[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpenDialog = (structure?: IFeeStructure) => {
    if (structure) {
      setEditingId(structure._id);
      setFormData({
        classType: structure.classType,
        stream: structure.stream?._id || '',
        targetExam: structure.targetExam?._id || '',
        academicSession: structure.academicSession,
        isActive: structure.isActive
      });
      setInstallments(
        structure.installments.map(i => ({
          label: i.label,
          dueDate: i.dueDate ? i.dueDate.substring(0, 10) : '',
          amount: i.amount
        }))
      );
    } else {
      setEditingId(null);
      setFormData({ classType: '11', stream: '', targetExam: '', academicSession: '', isActive: true });
      setInstallments([emptyInstallment()]);
    }
    setOpenDialog(true);
  };

  const handleInstallmentChange = (index: number, field: keyof IInstallmentTemplate, value: string) => {
    setInstallments(prev => prev.map((inst, i) =>
      i === index ? { ...inst, [field]: field === 'amount' ? Number(value) : value } : inst
    ));
  };

  const addInstallmentRow = () => setInstallments(prev => [...prev, emptyInstallment()]);
  const removeInstallmentRow = (index: number) => setInstallments(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!formData.targetExam) return alert('Target exam is required');
    if (!formData.academicSession.trim()) return alert('Academic session is required (e.g. 2025-26)');
    if (needsStream && !formData.stream) return alert('Stream is required for class 11, 12 and droppers');
    if (installments.some(i => !i.label.trim() || !i.dueDate || !i.amount)) {
      return alert('Every installment needs a label, due date and amount');
    }

    setSaving(true);
    const payload = {
      ...formData,
      stream: needsStream ? formData.stream : null,
      installments
    };

    const res = editingId
      ? await updateFeeStructure(editingId, payload)
      : await addFeeStructure(payload);

    setSaving(false);

    if (!res.success) {
      alert((res.message as string) || 'Failed to save fee structure');
      return;
    }
    setOpenDialog(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('⚠️ Delete this fee structure? Students already assigned to it keep their existing ledger.')) {
      const res = await deleteFeeStructure(id);
      if (res.success) fetchAll();
      else alert('Failed to delete fee structure');
    }
  };

  const handleToggleActive = async (structure: IFeeStructure) => {
    await updateFeeStructure(structure._id, { isActive: !structure.isActive });
    fetchAll();
  };

  const filtered = structures.filter(s =>
    `${s.classType} ${s.stream?.name || ''} ${s.targetExam?.name || ''} ${s.academicSession}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <FeeContainer>
      <FeeHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Fee Structures</Typography>
          <Typography variant="body2" color="text.secondary">
            Define fee templates per class, stream, target exam and academic session.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small" placeholder="Search..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Fee Structure
          </Button>
        </Stack>
      </FeeHeader>

      {loading ? <CircularProgress sx={{ mt: 4, mx: 'auto', display: 'block' }} /> : (
        <FeeGrid>
          {filtered.map((structure) => (
            <FeeCard key={structure._id} elevation={0} sx={{ opacity: structure.isActive ? 1 : 0.7 }}>
              <Box p={2} flexGrow={1}>
                <Stack direction="row" alignItems="center" gap={1} mb={1}>
                  <AccountBalanceWalletIcon color={structure.isActive ? 'primary' : 'disabled'} />
                  <Typography variant="h6">Class {structure.classType}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                  <Chip size="small" label={structure.targetExam?.name || 'N/A'} />
                  {structure.stream && <Chip size="small" label={structure.stream.name} variant="outlined" />}
                  <Chip size="small" label={structure.academicSession} variant="outlined" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {structure.installments.length} installment(s)
                </Typography>
                <Typography variant="h6" color="primary.main" mt={0.5}>
                  ₹{structure.totalAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" p={1} bgcolor="#f8fafc">
                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(structure)}>Edit</Button>
                <Box>
                  <Switch size="small" checked={structure.isActive} onChange={() => handleToggleActive(structure)} color="success" />
                  <IconButton size="small" onClick={() => handleDelete(structure._id)}>
                    <DeleteForeverIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Box>
            </FeeCard>
          ))}
        </FeeGrid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} pt={1}>
            <Stack direction="row" spacing={2}>
              <TextField
                select label="Class" fullWidth value={formData.classType}
                onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
              >
                {CLASS_TYPES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField
                label="Academic Session" fullWidth placeholder="2025-26"
                value={formData.academicSession}
                onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                select label="Target Exam" fullWidth value={formData.targetExam}
                onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
              >
                {targetExams.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
              </TextField>
              <TextField
                select label="Stream" fullWidth disabled={!needsStream}
                value={formData.stream}
                helperText={!needsStream ? 'Not applicable for class 9/10' : ''}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
              >
                {streams.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </TextField>
            </Stack>

            <FormControlLabel
              control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} color="success" />}
              label="Active Status"
            />

            <Divider />
            <Typography variant="subtitle2" fontWeight={700}>Installment Schedule</Typography>

            {installments.map((inst, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Label" size="small" value={inst.label}
                  onChange={(e) => handleInstallmentChange(index, 'label', e.target.value)}
                  sx={{ flex: 1.2 }}
                />
                <TextField
                  label="Due Date" size="small" type="date" value={inst.dueDate}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Amount" size="small" type="number" value={inst.amount || ''}
                  onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => removeInstallmentRow(index)} disabled={installments.length === 1}>
                  <RemoveCircleOutlineIcon fontSize="small" color="error" />
                </IconButton>
              </Stack>
            ))}

            <Button size="small" startIcon={<AddIcon />} onClick={addInstallmentRow} sx={{ alignSelf: 'flex-start' }}>
              Add Installment
            </Button>

            <Box textAlign="right">
              <Typography variant="subtitle1" fontWeight={700}>
                Total: ₹{totalAmount.toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (editingId ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </FeeContainer>
  );
};

export default FeeStructurePage;