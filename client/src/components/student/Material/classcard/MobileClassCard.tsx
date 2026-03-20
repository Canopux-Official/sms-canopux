import React from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Folder,
  MoreVert,
  CalendarToday,
} from "@mui/icons-material";
import type { Node } from "../../../admin/Material/types/node";

// Helper to get subject name
// const getSubjectName = (node: Node): string => {
//   if ((node as any).subject) {
//     return typeof (node as any).subject === "object"
//       ? (node as any).subject.name
//       : (node as any).subject;
//   }
//   return node.heading || "Course";
// };

// const extractClassInfo = (heading: string | null | undefined): string => {
//   // Handle null or undefined heading
//   if (!heading || typeof heading !== 'string') {
//     return "CLS";
//   }

//   const patterns = [
//     /class\s*(\d+)/i,
//     /grade\s*(\d+)/i,
//     /(\d+)(?:st|nd|rd|th)\s*(?:class|grade|standard)?/i,
//     /std\s*(\d+)/i,
//   ];

//   for (const pattern of patterns) {
//     const match = heading.match(pattern);
//     if (match) {
//       return `Class ${match[1]}`;
//     }
//   }

//   return "CLS";
// };

export const MobileClassCard: React.FC<{
  node: Node;
  onClick: () => void;
  isHighlighted?: boolean;
}> = ({ node, onClick, isHighlighted = false }) => {

  // Safely extract display name from either a populated object or a raw string
  const getNameLabel = (field: { name?: string } | string | null | undefined): string => {
    if (!field) return '';
    if (typeof field === 'object' && field.name) return field.name;
    return typeof field === 'string' ? field : '';
  };

  const streamLabel = getNameLabel(node.stream);
  const examLabel = getNameLabel(node.targetExam);

  const createdDate = node.createdAt
    ? new Date(node.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : null;

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        cursor: "pointer",
        backgroundColor: isHighlighted ? "#fff9e6" : "white",
        borderBottom: "1px solid #e0e0e0",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: isHighlighted ? "#fff9e6" : "#f5f5f5",
        },
        "&:active": {
          backgroundColor: "#eeeeee",
        },
      }}
    >
      {/* Folder Icon - Grey */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Folder sx={{ color: "#757575", fontSize: 28 }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#212121",
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {node.heading}
        </Typography>

        {/* Metadata Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {createdDate && (
            <>
              <Typography
                variant="caption"
                sx={{ color: "#9e9e9e", fontSize: "0.7rem" }}
              >
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 12, color: "#9e9e9e" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "#757575", fontSize: "0.7rem" }}
                >
                  {createdDate}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Stream and Target Exam */}
        {(streamLabel || examLabel) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            {streamLabel && (
              <Chip
                label={streamLabel}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  backgroundColor: "#f5f5f5",
                  color: "#616161",
                }}
              />
            )}
            {examLabel && (
              <Chip
                label={examLabel}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  borderColor: "#bdbdbd",
                  color: "#616161",
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* More Options Button */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          // Handle more options
        }}
        sx={{
          flexShrink: 0,
          color: "#9e9e9e",
        }}
      >
        <MoreVert />
      </IconButton>
    </Paper>
  );
};