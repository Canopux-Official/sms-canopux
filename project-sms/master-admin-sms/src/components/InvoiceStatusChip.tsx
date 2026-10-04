import Chip, { type ChipProps } from '@mui/material/Chip';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';

const COLOR: Record<InvoiceStatus, ChipProps['color']> = {
  draft: 'default',
  issued: 'warning',
  paid: 'success',
  void: 'error',
};

const LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  issued: 'Unpaid',
  paid: 'Paid',
  void: 'Void',
};

interface InvoiceStatusChipProps {
  status: string;
  /** When an issued invoice has received part of its total, show "Partially paid". */
  partiallyPaid?: boolean;
}

export default function InvoiceStatusChip({ status, partiallyPaid }: InvoiceStatusChipProps) {
  const key: InvoiceStatus = status in COLOR ? (status as InvoiceStatus) : 'draft';
  const label = key === 'issued' && partiallyPaid ? 'Partially paid' : LABEL[key];
  return <Chip size="small" label={label} color={COLOR[key]} variant={key === 'draft' ? 'outlined' : 'filled'} />;
}