import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, TextField, MenuItem, Button, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Divider, Alert, Autocomplete
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import PrintIcon from '@mui/icons-material/Print';

import { FeeContainer, FeeHeader } from './FeeStructurePage.styles';
import {
  getStudents, getStudentFeeByAdmin, getPaymentsByStudent, recordFeePayment
} from '../../../api/apiFunctions';
import { PAYMENT_MODES, type IFeePayment, type IStudentFee, type IStudentLite } from './types';

const statusColor: Record<string, 'default' | 'warning' | 'success'> = {
  pending: 'default', partial: 'warning', paid: 'success'
};

const CollectPaymentPage: React.FC = () => {
  const [students, setStudents] = useState<IStudentLite[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IStudentLite | null>(null);

  const [fees, setFees] = useState<IStudentFee[]>([]);
  const [payments, setPayments] = useState<IFeePayment[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

  const [activeFeeId, setActiveFeeId] = useState('');
  const [installmentId, setInstallmentId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [mode, setMode] = useState<IFeePayment['mode']>('cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<IFeePayment | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getStudents();
      if (res.success && Array.isArray(res.data)) setStudents(res.data as IStudentLite[]);
    })();
  }, []);

  const loadStudentFees = async (studentId: string) => {
    setLoadingFees(true);
    setLastReceipt(null);
    const [feeRes, paymentRes] = await Promise.all([
      getStudentFeeByAdmin(studentId), getPaymentsByStudent(studentId)
    ]);
    if (feeRes.success && feeRes.data && Array.isArray((feeRes.data as any).data)) {
      const feeList = (feeRes.data as any).data as IStudentFee[];
      setFees(feeList);
      setActiveFeeId(feeList[0]?._id || '');
    } else {
      setFees([]);
    }
    if (paymentRes.success && paymentRes.data && Array.isArray((paymentRes.data as any).data)) {
      setPayments((paymentRes.data as any).data);
    } else {
      setPayments([]);
    }
    setLoadingFees(false);
  };

  const handleSelectStudent = (student: IStudentLite | null) => {
    setSelectedStudent(student);
    setInstallmentId('');
    setAmount('');
    if (student) loadStudentFees(student._id);
    else { setFees([]); setPayments([]); }
  };

  const activeFee = fees.find(f => f._id === activeFeeId) || null;
  const activeInstallment = activeFee?.installments.find(i => i._id === installmentId) || null;
  const remainingOnInstallment = activeInstallment ? activeInstallment.amount - activeInstallment.paidAmount : 0;

  const handleRecordPayment = async () => {
    if (!activeFee || !activeInstallment) return alert('Pick an installment to pay against');
    if (!amount || Number(amount) <= 0) return alert('Enter a valid amount');
    if (Number(amount) > remainingOnInstallment) return alert(`Amount exceeds remaining due (₹${remainingOnInstallment})`);

    setSubmitting(true);
    const res = await recordFeePayment({
      studentFeeId: activeFee._id,
      installmentId: activeInstallment._id,
      amount: Number(amount),
      mode,
      transactionRef,
      remarks
    });
    setSubmitting(false);

    if (!res.success) {
      alert((res.message as string) || 'Failed to record payment');
      return;
    }

    const data = res.data as any;
    setLastReceipt(data.payment);
    setAmount('');
    setTransactionRef('');
    setRemarks('');
    if (selectedStudent) loadStudentFees(selectedStudent._id);
  };

  return (
    <FeeContainer>
      <FeeHeader>
        <Box>
          <Typography variant="h5" fontWeight="700">Collect Payment</Typography>
          <Typography variant="body2" color="text.secondary">
            Search a student, pick a pending installment, and record what they paid.
          </Typography>
        </Box>
      </FeeHeader>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Autocomplete
          options={students}
          getOptionLabel={(s) => `${s.name} (${s.enrollmentNumber})`}
          onChange={(_, value) => handleSelectStudent(value)}
          renderInput={(params) => <TextField {...params} label="Search student by name / enrollment no." />}
        />
      </Paper>

      {loadingFees && <CircularProgress sx={{ mx: 'auto' }} />}

      {selectedStudent && !loadingFees && fees.length === 0 && (
        <Alert severity="info">No fee has been assigned to {selectedStudent.name} yet. Go to "Assign Fees" first.</Alert>
      )}

      {selectedStudent && fees.length > 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2}>
              <TextField
                select label="Academic Session" value={activeFeeId}
                onChange={(e) => { setActiveFeeId(e.target.value); setInstallmentId(''); }}
                sx={{ minWidth: 220 }}
              >
                {fees.map(f => <MenuItem key={f._id} value={f._id}>{f.academicSession}</MenuItem>)}
              </TextField>
              {activeFee && (
                <>
                  <Chip label={`Net Payable: ₹${activeFee.netPayable.toLocaleString('en-IN')}`} />
                  <Chip label={`Paid: ₹${activeFee.totalPaid.toLocaleString('en-IN')}`} color="success" variant="outlined" />
                  <Chip label={`Due: ₹${activeFee.totalDue.toLocaleString('en-IN')}`} color={activeFee.totalDue > 0 ? 'warning' : 'success'} />
                </>
              )}
            </Stack>

            {activeFee && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Installment</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Paid</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeFee.installments.map(inst => (
                      <TableRow key={inst._id} selected={installmentId === inst._id}>
                        <TableCell>{inst.label}</TableCell>
                        <TableCell>{new Date(inst.dueDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell align="right">₹{inst.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right">₹{inst.paidAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right">₹{(inst.amount - inst.paidAmount).toLocaleString('en-IN')}</TableCell>
                        <TableCell><Chip size="small" label={inst.status} color={statusColor[inst.status]} /></TableCell>
                        <TableCell>
                          {inst.status !== 'paid' && (
                            <Button size="small" onClick={() => { setInstallmentId(inst._id); setAmount(inst.amount - inst.paidAmount); }}>
                              Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {activeInstallment && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Record Payment — {activeInstallment.label} (remaining ₹{remainingOnInstallment.toLocaleString('en-IN')})
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
                <TextField
                  label="Amount (₹)" type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  fullWidth
                />
                <TextField select label="Mode" value={mode} onChange={(e) => setMode(e.target.value as IFeePayment['mode'])} fullWidth>
                  {PAYMENT_MODES.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </TextField>
                <TextField label="Transaction Ref (optional)" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} fullWidth />
              </Stack>
              <TextField label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} fullWidth multiline rows={2} sx={{ mb: 2 }} />
              <Box textAlign="right">
                <Button variant="contained" startIcon={<PaymentIcon />} onClick={handleRecordPayment} disabled={submitting}>
                  {submitting ? <CircularProgress size={20} /> : 'Record Payment'}
                </Button>
              </Box>
            </Paper>
          )}

          {lastReceipt && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'success.main' }} id="fee-receipt">
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="success.main">Payment Recorded ✓</Typography>
                <Button size="small" startIcon={<PrintIcon />} onClick={() => window.print()}>Print Receipt</Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={0.5}>
                <Typography><b>Receipt No:</b> {lastReceipt.receiptNumber}</Typography>
                <Typography><b>Student:</b> {selectedStudent.name} ({selectedStudent.enrollmentNumber})</Typography>
                <Typography><b>Installment:</b> {lastReceipt.installmentLabel}</Typography>
                <Typography><b>Amount:</b> ₹{lastReceipt.amount.toLocaleString('en-IN')}</Typography>
                <Typography><b>Mode:</b> {lastReceipt.mode}</Typography>
                <Typography><b>Date:</b> {new Date(lastReceipt.paidAt).toLocaleString('en-IN')}</Typography>
              </Stack>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Payment History</Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Receipt No.</TableCell>
                    <TableCell>Installment</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Collected By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map(p => (
                    <TableRow key={p._id}>
                      <TableCell>{p.receiptNumber}</TableCell>
                      <TableCell>{p.installmentLabel}</TableCell>
                      <TableCell align="right">₹{p.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{p.mode}</TableCell>
                      <TableCell>{new Date(p.paidAt).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{typeof p.collectedBy === 'object' ? p.collectedBy?.name : ''}</TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center">No payments recorded yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </FeeContainer>
  );
};

export default CollectPaymentPage;