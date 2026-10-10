import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Visibility as VisibilityIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import type { Node } from '../types/node';
import { NodeDetailModal } from '../../../student/Material/utils/NodeDetails';


interface SubnodeTableProps {
  nodes: Node[];
  onNodeClick: (nodeId: string) => void;
  onEdit: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

const SubnodeTable: React.FC<SubnodeTableProps> = ({
  nodes,
  onNodeClick,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewClick = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    setSelectedNode(node);
  };

  const getNodeName = (node: Node) =>
    node.heading
      ? node.heading
      : (typeof node.subject === 'object' && node.subject?.name) || '';

  const getDueTone = (lastDate?: string) => {
    if (!lastDate) return { color: '#5f6368', fontWeight: 400 };
    const due = new Date(lastDate);
    due.setHours(23, 59, 59, 999);
    const days = (due.getTime() - Date.now()) / 86400000;
    if (days < 0) return { color: '#d32f2f', fontWeight: 600 }; // overdue
    if (days <= 3) return { color: '#ed6c02', fontWeight: 600 }; // due soon
    return { color: '#2e7d32', fontWeight: 500 };
  };


  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {nodes.map((node) => (
            <Box
              key={node._id}
              onClick={() => node.type === 'folder' && onNodeClick(node._id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderBottom: '1px solid #e8eaed',
                cursor: node.type === 'folder' ? 'pointer' : 'default',
                '&:hover': { backgroundColor: '#f8f9fa' },
              }}
            >
              {/* Icon */}
              {node.type === 'folder' ? (
                <FolderIcon sx={{ color: '#FFA726', fontSize: '1.5rem', flexShrink: 0 }} />
              ) : (
                <FileIcon sx={{ color: '#42A5F5', fontSize: '1.5rem', flexShrink: 0 }} />
              )}

              {/* Name and Date */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}>
                  {getNodeName(node)}
                </Typography>
                {!!node.fileDetails?.length && (
                  <Tooltip title={`${node.fileDetails.length} file(s)`}>
                    <Chip
                      size="small"
                      icon={<AttachFileIcon sx={{ fontSize: '14px !important' }} />}
                      label={node.fileDetails.length}
                      sx={{ height: 22, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}
                    />
                  </Tooltip>
                )}
                {!!node.referenceDetails?.length && (
                  <Tooltip title={`${node.referenceDetails.length} reference(s)`}>
                    <Chip
                      size="small"
                      icon={<LinkIcon sx={{ fontSize: '14px !important' }} />}
                      label={node.referenceDetails.length}
                      sx={{ height: 22, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                    />
                  </Tooltip>
                )}
                <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                  {formatDate(node.lastDate)}
                </Typography>
              </Box>

              {/* View */}
              <IconButton
                size="small"
                onClick={(e) => handleViewClick(e, node)}
                sx={{ color: '#5f6368', '&:hover': { color: '#1976d2', bgcolor: '#e3f2fd' } }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>

              {/* Edit */}
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                sx={{ color: '#5f6368' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              {/* Delete */}
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(node._id); }}
                sx={{ color: '#5f6368' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        {selectedNode && (
          <NodeDetailModal
            node={selectedNode}
            open={Boolean(selectedNode)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e8eaed',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 600, color: '#616161' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                Type
              </TableCell>
              {!isTablet && (
                <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                  Description
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, color: '#616161', display: { xs: 'none', md: 'table-cell' } }}>
                Due Date
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#616161' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nodes.map((node) => (
              <TableRow
                key={node._id}
                onClick={() => node.type === 'folder' && onNodeClick(node._id)}
                sx={{
                  cursor: node.type === 'folder' ? 'pointer' : 'default',
                  backgroundColor: node.type === 'folder' ? '#eff1f192' : 'white',
                  '&:hover': { backgroundColor: '#f8f9fa' },
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Name */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {node.type === 'folder' ? (
                      <FolderIcon sx={{ color: '#FFA726', fontSize: '1.5rem' }} />
                    ) : (
                      <FileIcon sx={{ color: '#42A5F5', fontSize: '1.5rem' }} />
                    )}
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.95rem' }}>
                      {getNodeName(node)}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Type */}
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                    {node.type === 'folder' ? 'Folder' : 'File'}
                  </Typography>
                </TableCell>

                {/* Description */}
                {!isTablet && (
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography
                      variant="body2"
                      title={node.description || ''}
                      sx={{
                        color: '#5f6368',
                        fontSize: '0.875rem',
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {node.description || '-'}
                    </Typography>
                  </TableCell>
                )}

                {/* Due Date */}
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" sx={{ ...getDueTone(node.lastDate), fontSize: '0.875rem' }}>
                    {formatDate(node.lastDate)}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={(e) => handleViewClick(e, node)}
                        sx={{ color: '#5f6368', '&:hover': { backgroundColor: '#e3f2fd', color: '#1976d2' } }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                        sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onDelete(node._id); }}
                        sx={{ color: '#d32f2f', '&:hover': { backgroundColor: '#ffebee' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          open={Boolean(selectedNode)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </>
  );
};

export default SubnodeTable;