
import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
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

export const MobileSubfolderCard: React.FC<{
  node: Node;
  onClick?: () => void;
  isHighlighted?: boolean;
}> = ({ node, onClick, isHighlighted = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isFolder = node.type === "folder";

  const iconColor = isFolder ? "#f59e0b" : "#10b981";
  const iconBgColor = isFolder ? "#fef3c7" : "#d1fae5";

  const displayHeading = getDisplayHeading(node);

  const dueDate = formatDate(node.lastDate);
  const dueTone = getDueTone(node.lastDate);


  const hasFiles = node.fileDetails && node.fileDetails.length > 0;
  const hasReferences = node.referenceDetails && node.referenceDetails.length > 0;
  const fileCount = node.fileDetails?.length ?? 0;
  const refCount = node.referenceDetails?.length ?? 0;

  const handleCardClick = () => {
    if (isFolder && onClick) onClick();
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      <Paper
        id={`material-item-${node._id}`}
        onClick={handleCardClick}
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: isFolder ? "pointer" : "default",
          backgroundColor: isHighlighted ? "#fff9e6" : "white",
          borderBottom: "1px solid #f0f0f0",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: isHighlighted ? "#fff9e6" : "#f9fafb",
          },
          "&:active": {
            backgroundColor: isFolder ? "#f3f4f6" : undefined,
          },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            backgroundColor: iconBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isFolder ? (
            <Folder sx={{ color: iconColor, fontSize: 24 }} />
          ) : (
            <InsertDriveFile sx={{ color: iconColor, fontSize: 22 }} />
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayHeading}
          </Typography>

          {/* Meta row: type + attachments + date */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, flexWrap: "wrap" }}>
            {/* Type */}
            <Chip
              label={isFolder ? "Folder" : "File"}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 600,
                bgcolor: isFolder ? "#fef3c7" : "#dbeafe",
                color: isFolder ? "#92400e" : "#1e40af",
              }}
            />

            {/* File count */}
            {hasFiles && (
              <Chip
                icon={<AttachFile sx={{ fontSize: "10px !important" }} />}
                label={fileCount}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: "#dbeafe",
                  color: "#1e40af",
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            )}

            {/* Reference count */}
            {hasReferences && (
              <Chip
                icon={<LinkIcon sx={{ fontSize: "10px !important" }} />}
                label={refCount}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: "#fef3c7",
                  color: "#92400e",
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            )}

            {/* Date */}
            {dueDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <CalendarToday sx={{ fontSize: 11, color: dueTone.color }} />
                <Typography
                  variant="caption"
                  sx={{ color: dueTone.color, fontSize: "0.68rem", fontWeight: dueTone.label ? 700 : 400 }}
                >
                  Due {dueDate}{dueTone.label ? ` · ${dueTone.label}` : ""}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* View button */}
        <IconButton
          size="small"
          onClick={handleViewClick}
          sx={{
            flexShrink: 0,
            color: "#9ca3af",
            width: 34,
            height: 34,
            bgcolor: "#f3f4f6",
            "&:hover": { bgcolor: "#e5e7eb", color: "#374151" },
            "&:active": { bgcolor: "#d1d5db" },
          }}
        >
          <Visibility sx={{ fontSize: 17 }} />
        </IconButton>
      </Paper>

      <NodeDetailModal
        node={node}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};