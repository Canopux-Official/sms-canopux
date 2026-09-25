import React from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { LoadingSpinner } from '../utils/CardSkeleton';
import type { Node } from '../types/node';

interface SubnodeHeaderProps {
  currentNode: Node | undefined;
  breadcrumbPath: Array<{ id: string; heading: string }>;
  childNodesCount: number;
  isLoading: boolean;
  searchQuery: string;
  onBack: () => void;
  onBreadcrumbClick: (nodeId: string) => void;
  onAddClick: () => void;
  onSearchChange: (query: string) => void;
}

const SubnodeHeader: React.FC<SubnodeHeaderProps> = ({
  currentNode,
  breadcrumbPath,
  childNodesCount,
  isLoading,
  searchQuery,
  onBack,
  onBreadcrumbClick,
  onAddClick,
  onSearchChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #e8eaed',
      }}
    >
      {/* Breadcrumbs Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#80868b' }} />}
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap' },
          }}
        >
          <Box
            onClick={onBack}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: '#5f6368',
              transition: 'all 0.2s ease',
              padding: '4px 8px',
              borderRadius: '6px',
              '&:hover': {
                color: '#1a472a',
                backgroundColor: '#f1f3f4',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: '1.25rem' }} />
          </Box>

          {breadcrumbPath.map((pathItem, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            return (
              <Typography
                key={pathItem.id}
                onClick={() => !isLast && onBreadcrumbClick(pathItem.id)}
                sx={{
                  cursor: isLast ? 'default' : 'pointer',
                  color: isLast ? '#1a472a' : '#5f6368',
                  fontSize: '0.875rem',
                  fontWeight: isLast ? 600 : 400,
                  maxWidth: { xs: '120px', sm: '180px', md: 'none' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  ...(!isLast && {
                    '&:hover': {
                      color: '#1a472a',
                      backgroundColor: '#f1f3f4',
                    },
                  }),
                }}
              >
                {pathItem.heading}
              </Typography>
            );
          })}
        </Breadcrumbs>
      </Box>

      {/* Title, Search, and Add Button Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        {/* Title and Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              wordBreak: 'break-word',
            }}
          >
            {currentNode?.heading}
          </Typography>

          {!isLoading && (
            <Chip
              label={`${childNodesCount} item${childNodesCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                backgroundColor: '#e8f5e9',
                color: '#1a472a',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}

          {currentNode?.lastDate && (
            <Chip
              label={`Due: ${new Date(currentNode.lastDate).toLocaleDateString()}`}
              size="small"
              sx={{
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}

          {isLoading && <LoadingSpinner text="Loading..." />}
        </Box>

        {/* Search Bar */}
        <TextField
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 300px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#ffffff', // Changed background color to white
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9e9e9e', fontSize: 20 }} /> {/* Adjusted color and size */}
              </InputAdornment>
            ),
          }}
        />


        {/* Add Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          disabled={isLoading}
          sx={{
            background: '#1a472a',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: '8px',
            px: 2.5,
            py: 0.75,
            fontSize: '0.875rem',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            minWidth: 'fit-content',
            '&:hover': {
              background: '#0d2818',
            },
            '&:disabled': {
              background: '#e0e0e0',
              color: '#9e9e9e',
            },
          }}
        >
          {isMobile ? 'Add' : 'Add Item'}
        </Button>
      </Box>

      {/* Description */}
      {currentNode?.description && (
        <Typography
          variant="body2"
          sx={{
            color: '#5f6368',
            mt: 1.5,
            lineHeight: 1.5,
            fontSize: '0.875rem',
          }}
        >
          {currentNode.description}
        </Typography>
      )}
    </Paper>
  );
};

export default SubnodeHeader;