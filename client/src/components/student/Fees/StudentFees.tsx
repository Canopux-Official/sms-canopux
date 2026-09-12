import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Stack, Chip, CircularProgress, Alert, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { FeeContainer, SummaryCard } from './StudentFees.styles';
import { getMyFee, getMyFeePayments } from '../../../api/apiFunctions';

interface IInstallment {
  _id: string;
  label: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
}

interface IStudentFee {
  _id: string;
  academicSession: string;
  originalAmount: number;
  discountAmount: number;
  netPayable: number;
  installments: IInstallment[];
  totalPaid: number;
  totalDue: number;
  isFullyPaid: boolean;
}

interface IPayment {
  _id: string;
  receiptNumber: string;
  installmentLabel: string;
  amount: number;
  mode: string;
  paidAt: string;
}

const statusColor: Record<string, 'default' | 'warning' | 'success'> = {
  pending: 'default', partial: 'warning', paid: 'success'
};

const StudentFees: React.FC = () => {
  const [fees, setFees] = useState<IStudentFee[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [activeFeeId, setActiveFeeId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [feeRes, paymentRes] = await Promise.all([getMyFee(), getMyFeePayments()]);
      if (feeRes.success && feeRes.data && Array.isArray((feeRes.data as any).data)) {
        const list = (feeRes.data as any).data as IStudentFee[];
        setFees(list);
        setActiveFeeId(list[0]?._id || '');
      }
      if (paymentRes.success && paymentRes.data && Array.isArray((paymentRes.data as any).data)) {
        setPayments((paymentRes.data as any).data);
      }
      setLoading(false);
    })();
  }, []);

  const activeFee = fees.find(f => f._id === activeFeeId) || null;

  if (loading) return <CircularProgress sx={{ mt: 6, mx: 'auto', display: 'block' }} />;

  if (fees.length === 0) {
    return (
      <FeeContainer>
        <Typography variant="h5" fontWeight={700}>My Fees</Typography>
        <Alert severity="info">No fee has been assigned to your account yet. Please check with the office.</Alert>
      </FeeContainer>
    );
  }

  return (
    <FeeContainer>
      <Box>
        <Typography variant="h5" fontWeight={700}>My Fees</Typography>
        <Typography variant="body2" color="text.secondary">
          Your fee summary, installment schedule and payment history.
        </Typography>
      </Box>

      {fees.length > 1 && (
        <TextField
          select label="Academic Session" size="small" value={activeFeeId}
          onChange={(e) => setActiveFeeId(e.target.value)} sx={{ maxWidth: 240 }}
        >
          {fees.map(f => <MenuItem key={f._id} value={f._id}>{f.academicSession}</MenuItem>)}
        </TextField>
      )}

      {activeFee && (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SummaryCard elevation={0}>
              <Typography variant="caption" color="text.secondary">Total Payable</Typography>
              <Typography variant="h6" fontWeight={700}>₹{activeFee.netPayable.toLocaleString('en-IN')}</Typography>
            </SummaryCard>
            <SummaryCard elevation={0}>
              <Typography variant="caption" color="text.secondary">Paid</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">₹{activeFee.totalPaid.toLocaleString('en-IN')}</Typography>
            </SummaryCard>
            <SummaryCard elevation={0}>
              <Typography variant="caption" color="text.secondary">Pending</Typography>
              <Typography variant="h6" fontWeight={700} color={activeFee.totalDue > 0 ? 'warning.main' : 'success.main'}>
                ₹{activeFee.totalDue.toLocaleString('en-IN')}
              </Typography>
            </SummaryCard>
            {activeFee.discountAmount > 0 && (
              <SummaryCard elevation={0}>
                <Typography variant="caption" color="text.secondary">Scholarship / Discount</Typography>
                <Typography variant="h6" fontWeight={700}>₹{activeFee.discountAmount.toLocaleString('en-IN')}</Typography>
              </SummaryCard>
            )}
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Installment Schedule</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Installment</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeFee.installments.map(inst => (
                    <TableRow key={inst._id}>
                      <TableCell>{inst.label}</TableCell>
                      <TableCell>{new Date(inst.dueDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell align="right">₹{inst.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell align="right">₹{inst.paidAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell><Chip size="small" label={inst.status} color={statusColor[inst.status]} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Payment History</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Receipt No.</TableCell>
                <TableCell>Installment</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Date</TableCell>
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
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No payments made yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </FeeContainer>
  );
};

export default StudentFees;