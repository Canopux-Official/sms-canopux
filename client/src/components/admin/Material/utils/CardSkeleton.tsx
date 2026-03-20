// components/LoadingSkeleton/LoadingSkeleton.tsx
import React from 'react';
import { Box, Skeleton, CircularProgress, Typography } from '@mui/material';

/**
 * Card Skeleton - for folder/file cards
 */
interface CardSkeletonProps {
  count?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  count = 8,
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  }
}) => {
  const gridColumns = {
    xs: `repeat(${columns.xs}, 1fr)`,
    sm: `repeat(${columns.sm}, 1fr)`,
    md: `repeat(${columns.md}, 1fr)`,
    lg: `repeat(${columns.lg}, 1fr)`,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: 3,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            p: 2,
            height: '180px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width="90%" height={16} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Class Card Skeleton - for class cards (larger cards)
 */
interface ClassCardSkeletonProps {
  count?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export const ClassCardSkeleton: React.FC<ClassCardSkeletonProps> = ({ 
  count = 6,
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 3,
  }
}) => {
  const gridColumns = {
    xs: `repeat(${columns.xs}, 1fr)`,
    sm: `repeat(${columns.sm}, 1fr)`,
    md: `repeat(${columns.md}, 1fr)`,
    lg: `repeat(${columns.lg}, 1fr)`,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: 3,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            p: 3,
            height: '220px',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="95%" height={16} />
          <Skeleton variant="text" width="60%" height={16} />
          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Skeleton variant="rectangular" width={70} height={28} sx={{ borderRadius: '14px' }} />
            <Skeleton variant="rectangular" width={70} height={28} sx={{ borderRadius: '14px' }} />
            <Skeleton variant="rectangular" width={70} height={28} sx={{ borderRadius: '14px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

/**
 * List Skeleton - for list items
 */
interface ListSkeletonProps {
  count?: number;
  height?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  count = 5,
  height = 60
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            p: 2,
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '4px' }} />
        </Box>
      ))}
    </Box>
  );
};

/**
 * Table Skeleton - for table rows
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5,
  columns = 4
}) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: 'flex',
            gap: 2,
            py: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Box key={colIndex} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

/**
 * Loading Spinner with Text
 */
interface LoadingSpinnerProps {
  text?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...',
  size = 16
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={size} />
      <Typography variant="caption" sx={{ color: '#5f6368' }}>
        {text}
      </Typography>
    </Box>
  );
};

/**
 * Full Page Loading - for entire page loading state
 */
interface FullPageLoadingProps {
  text?: string;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({ 
  text = 'Loading...'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" sx={{ color: '#5f6368' }}>
        {text}
      </Typography>
    </Box>
  );
};

/**
 * Content Loading - for content area loading with skeleton
 */
interface ContentLoadingProps {
  variant?: 'card' | 'list' | 'table' | 'class';
  count?: number;
}

export const ContentLoading: React.FC<ContentLoadingProps> = ({ 
  variant = 'card',
  count
}) => {
  switch (variant) {
    case 'card':
      return <CardSkeleton count={count} />;
    case 'class':
      return <ClassCardSkeleton count={count} />;
    case 'list':
      return <ListSkeleton count={count} />;
    case 'table':
      return <TableSkeleton rows={count} />;
    default:
      return <CardSkeleton count={count} />;
  }
};

// Export all components
export default {
  CardSkeleton,
  ClassCardSkeleton,
  ListSkeleton,
  TableSkeleton,
  LoadingSpinner,
  FullPageLoading,
  ContentLoading,
};