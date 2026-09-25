import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Folder } from '@mui/icons-material';


interface EmptyStateProps {
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        textAlign: 'center',
        py: { xs: 8, sm: 10, md: 12 },
        px: 2,
        borderRadius: '12px',
        border: '2px dashed #dadce0',
        background: '#ffffff',
      }}
    >
      <Folder sx={{ fontSize: 64, color: '#dadce0', mb: 2 }} />
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: '#1a1a1a',
        }}
      >
        {searchQuery ? 'No items found' : 'This folder is empty'}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#5f6368',
        }}
      >
        {searchQuery
          ? `No items match "${searchQuery}"`
          : 'Click "Add Item" to create folders or files'}
      </Typography>
    </Paper>
  );
};

export default EmptyState;