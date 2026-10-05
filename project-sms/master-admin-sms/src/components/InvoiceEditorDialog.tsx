import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, Stack, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { updateInvoice, type InvoiceItem, type InvoiceSummary } from '../api/platformApiFunctions';

interface InvoiceEditorDialogProps {
  open: boolean;
  invoice: InvoiceSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

type DraftItem = { description: string; quantity: number; unitPrice: number };

const toDraft = (items: InvoiceItem[]): DraftItem[] =>
  items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice }));

const toDateInput = (v: string | null) => (v ? v.slice(0, 10) : '');

export default function InvoiceEditorDialog({ open, invoice, onClose, onSaved }: InvoiceEditorDialogProps) {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [billedToName, setBilledToName] = useState('');
  const [billedToEmail, setBilledToEmail] = useState('');
  const [billedToPhone, setBilledToPhone] = useState('');
  const [billedToAddress, setBilledToAddress] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !invoice) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- populating the form from the invoice on open
    setItems(toDraft(invoice.items));
    setDiscountPercent(invoice.discountPercent);
    setTaxPercent(invoice.taxPercent);
    setDueDate(toDateInput(invoice.dueDate));
    setNotes(invoice.notes);
    setTerms(invoice.terms);
    setBilledToName(invoice.billedTo.name);
    setBilledToEmail(invoice.billedTo.email);
    setBilledToPhone(invoice.billedTo.phone);
    setBilledToAddress(invoice.billedTo.address);
    setError(null);
  }, [open, invoice]);

  const currency = invoice?.currency || 'INR';
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * taxPercent) / 100;
  const total = taxable + taxAmount;
  const money = (n: number) => `${currency} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const updateItem = (idx: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setError(null);

    const cleaned = items.filter((i) => i.description.trim());
    if (cleaned.length === 0) return setError('At least one line item with a description is required');

    setSaving(true);
    const result = await updateInvoice(invoice.id, {
      items: cleaned,
      discountPercent,
      taxPercent,
      dueDate: dueDate || undefined,
      notes,
      terms,
      billedTo: { name: billedToName, email: billedToEmail, phone: billedToPhone, address: billedToAddress },
    });
    setSaving(false);

    if (result.success) {
      onSaved();
    } else {
      setError(result.message || 'Failed to save invoice');
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit {invoice.invoiceNumber}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="subtitle2" fontWeight={700}>Billed to</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Name" value={billedToName} onChange={(e) => setBilledToName(e.target.value)} fullWidth />
              <TextField label="Email" value={billedToEmail} onChange={(e) => setBilledToEmail(e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Phone" value={billedToPhone} onChange={(e) => setBilledToPhone(e.target.value)} fullWidth />
              <TextField label="Address" value={billedToAddress} onChange={(e) => setBilledToAddress(e.target.value)} fullWidth />
            </Stack>

            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>Line items</Typography>
              <Button size="small" startIcon={<AddIcon fontSize="small" />} onClick={addItem}>Add item</Button>
            </Stack>

            <Stack spacing={1.5}>
              {items.map((item, idx) => (
                <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                  <TextField
                    label="Description" value={item.description} sx={{ flexGrow: 1 }}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                  />
                  <TextField
                    label="Qty" type="number" value={item.quantity} sx={{ width: 90 }}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} slotProps={{ htmlInput: { min: 0, step: '1' } }}
                  />
                  <TextField
                    label="Unit price" type="number" value={item.unitPrice} sx={{ width: 140 }}
                    onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  />
                  <Typography sx={{ width: 130, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {money(item.quantity * item.unitPrice)}
                  </Typography>
                  <IconButton size="small" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Discount %" type="number" fullWidth value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))} slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
              <TextField
                label="Tax %" type="number" fullWidth value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))} slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
              <TextField
                label="Due date" type="date" fullWidth value={dueDate}
                onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Stack spacing={0.5} sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }} alignItems="flex-end">
              <Typography variant="body2" color="text.secondary">Subtotal: {money(subtotal)}</Typography>
              {discountPercent > 0 && <Typography variant="body2" color="text.secondary">Discount ({discountPercent}%): - {money(discountAmount)}</Typography>}
              {taxPercent > 0 && <Typography variant="body2" color="text.secondary">Tax ({taxPercent}%): {money(taxAmount)}</Typography>}
              <Typography variant="h6" fontWeight={800}>Total: {money(total)}</Typography>
            </Stack>

            <TextField label="Notes (shown on the invoice)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline minRows={2} />
            <TextField label="Terms & conditions" value={terms} onChange={(e) => setTerms(e.target.value)} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3, pb: 2.5, pt: 2,
            position: 'sticky', bottom: 0, bgcolor: 'background.paper',
            borderTop: '1px solid', borderColor: 'divider', zIndex: 1,
          }}
        >
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}