import Chip, { type ChipProps } from '@mui/material/Chip';

export type OrganizationStatus = 'active' | 'suspended' | 'cancelled';

const STATUS_COLOR: Record<OrganizationStatus, ChipProps['color']> = {
  active: 'success',
  suspended: 'error',
  cancelled: 'default',
};

const STATUS_LABEL: Record<OrganizationStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
};

interface OrgStatusBadgeProps {
  status: string;
}

export default function OrgStatusBadge({ status }: OrgStatusBadgeProps) {
  const key: OrganizationStatus = status in STATUS_COLOR ? (status as OrganizationStatus) : 'cancelled';

  return (
    <Chip
      label={STATUS_LABEL[key]}
      color={STATUS_COLOR[key]}
      size="small"
      variant={key === 'cancelled' ? 'outlined' : 'filled'}
    />
  );
}