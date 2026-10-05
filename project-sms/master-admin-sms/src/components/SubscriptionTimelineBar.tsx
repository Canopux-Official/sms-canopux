import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import type { SubscriptionSummary } from '../api/platformApiFunctions';

const STATE_COLOR: Record<SubscriptionSummary['state'], string> = {
  active: '#2e7d32',
  expiring_soon: '#c77700',
  expired: '#c62828',
  replaced: '#9e9e9e',
  cancelled: '#9e9e9e',
};

const STATE_LABEL: Record<SubscriptionSummary['state'], string> = {
  active: 'Active',
  expiring_soon: 'Expiring soon',
  expired: 'Expired',
  replaced: 'Replaced',
  cancelled: 'Cancelled',
};

export default function SubscriptionTimelineBar({ subscription }: { subscription: SubscriptionSummary }) {
  const color = STATE_COLOR[subscription.state];
  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="body2" fontWeight={700} sx={{ color }}>
          {STATE_LABEL[subscription.state]}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subscription.state === 'expired'
            ? 'Ended'
            : `${subscription.daysRemaining} of ${subscription.totalDays} days left`}
        </Typography>
      </Stack>
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={subscription.progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
          }}
        />
      </Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {new Date(subscription.startDate).toLocaleDateString()}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(subscription.endDate).toLocaleDateString()}
        </Typography>
      </Stack>
    </Stack>
  );
}