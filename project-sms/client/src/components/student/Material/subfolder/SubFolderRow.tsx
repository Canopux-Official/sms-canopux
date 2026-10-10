
import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Folder,
  InsertDriveFile,
  AttachFile,
  Link as LinkIcon,
  CalendarToday,
  Visibility,
} from "@mui/icons-material";
import type { Node } from "../../../admin/Material/types/node";
import { NodeDetailModal } from "../utils/NodeDetails";
import { formatDate, getDisplayHeading, getDueTone } from "../utils/nodeHelpers";

export const SubfolderRow: React.FC<{
  node: Node;
  onClick?: () => void;
  isHighlighted?: boolean;
}> = ({ node, onClick, isHighlighted = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isFolder = node.type === "folder";

  const displayHeading = getDisplayHeading(node);

  const dueDate = formatDate(node.lastDate);
  const dueTone = getDueTone(node.lastDate);

  const fileCount = node.fileDetails?.length ?? 0;
  const refCount = node.referenceDetails?.length ?? 0;

  const handleRowClick = () => {
    if (isFolder && onClick) onClick();
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      <TableRow
        id={`material-item-${node._id}`}
        onClick={handleRowClick}
        sx={{
          cursor: isFolder ? "pointer" : "default",
          transition: "background 0.15s",
          backgroundColor: isHighlighted ? "#fffbeb" : "transparent",
          "&:hover": {
            backgroundColor: isHighlighted ? "#fef9e4" : "#f9fafb",
            "& .view-btn": { opacity: 1 },
          },
        }}
      >
        {/* Name */}
        <TableCell sx={{ py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isFolder ? (
              <Folder sx={{ color: "#f59e0b", fontSize: 22, flexShrink: 0 }} />
            ) : (
              <InsertDriveFile sx={{ color: "#3b82f6", fontSize: 22, flexShrink: 0 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#111827",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 260,
              }}
            >
              {displayHeading}
            </Typography>
          </Box>
        </TableCell>

        {/* Type */}
        <TableCell sx={{ py: 1.5 }}>
          <Chip
            label={isFolder ? "Folder" : "File"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.72rem",
              fontWeight: 600,
              bgcolor: isFolder ? "#fef3c7" : "#dbeafe",
              color: isFolder ? "#92400e" : "#1e40af",
            }}
          />
        </TableCell>

        {/* Attachments */}
        <TableCell sx={{ py: 1.5 }}>
          {fileCount > 0 || refCount > 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {fileCount > 0 && (
                <Tooltip title={`${fileCount} file${fileCount > 1 ? "s" : ""}`}>
                  <Chip
                    icon={<AttachFile sx={{ fontSize: "12px !important" }} />}
                    label={fileCount}
                    size="small"
                    sx={{ height: 22, fontSize: "0.72rem", bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 600 }}
                  />
                </Tooltip>
              )}
              {refCount > 0 && (
                <Tooltip title={`${refCount} reference${refCount > 1 ? "s" : ""}`}>
                  <Chip
                    icon={<LinkIcon sx={{ fontSize: "12px !important" }} />}
                    label={refCount}
                    size="small"
                    sx={{ height: 22, fontSize: "0.72rem", bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }}
                  />
                </Tooltip>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#d1d5db" }}>—</Typography>
          )}
        </TableCell>

        {/* Due Date */}
        <TableCell sx={{ py: 1.5 }}>
          {dueDate ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: dueTone.color }} />
              <Typography
                variant="body2"
                sx={{ fontSize: "0.82rem", color: dueTone.color, fontWeight: dueTone.label ? 600 : 500 }}
              >
                {dueDate}
              </Typography>
              {dueTone.label && (
                <Chip
                  label={dueTone.label}
                  size="small"
                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: dueTone.color, color: "#fff" }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#d1d5db" }}>—</Typography>
          )}
        </TableCell>

        {/* View */}
        <TableCell sx={{ py: 1.5, textAlign: "right", width: 60 }}>
          <Tooltip title="View details">
            <IconButton
              className="view-btn"
              size="small"
              onClick={handleViewClick}
              sx={{
                color: "#6b7280",
                bgcolor: "#f3f4f6",
                width: 30,
                height: 30,
              }}
            >
              <Visibility sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <NodeDetailModal
        node={node}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};