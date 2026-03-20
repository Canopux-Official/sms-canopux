
import React from "react";
import {
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { AttachFile, Link as LinkIcon } from "@mui/icons-material";
import { ClickableCard, FileChip, LinkChip, StyledCard } from "../theme/material.styles";
import type { Node } from "../../../admin/Material/types/node";
import def from '../../../../../public/images/default.jpg'
import chem from '../../../../../public/images/chemistry.jpg'

// Function to detect subject from heading or use provided subject
const getSubjectTheme = (node: Node) => {
  // Handle both populated subject object and plain heading
  let subjectName: string = '';

  if ((node as any).subject) {
    // If subject is populated, it will be an object with a 'name' field
    subjectName = typeof (node as any).subject === 'object'
      ? (node as any).subject.name
      : (node as any).subject;
  } else if (node.heading) {
    // Fallback to heading if subject doesn't exist
    subjectName = node.heading;
  }

  const subjectThemes = {
    Physics: {
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
      bgColor: "#EFF6FF",
      chipColor: "#1e40af"
    },
    Chemistry: {
      image: chem,
      gradient: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
      bgColor: "#FAF5FF",
      chipColor: "#dfccef"
    },
    Mathematics: {
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
      bgColor: "#ECFDF5",
      chipColor: "#047857"
    },
    Biology: {
      image: "https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #16a34a 0%, #84cc16 100%)",
      bgColor: "#F0FDF4",
      chipColor: "#15803d"
    },
    Geography: {
      image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
      bgColor: "#FFF7ED",
      chipColor: "#c2410c"
    },
    History: {
      image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #d97706 0%, #eab308 100%)",
      bgColor: "#FFFBEB",
      chipColor: "#b45309"
    },
    English: {
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #0891b2 0%, #3b82f6 100%)",
      bgColor: "#ECFEFF",
      chipColor: "#0e7490"
    },
    Computer: {
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
      gradient: "linear-gradient(135deg, #475569 0%, #6b7280 100%)",
      bgColor: "#F8FAFC",
      chipColor: "#334155"
    },
    Default: {
      image: def,
      gradient: "linear-gradient(135deg, #4b5563 0%, #64748b 100%)",
      bgColor: "#F9FAFB",
      chipColor: "#374151"
    }
  };

  // Only try to match if we have a valid string
  if (subjectName && typeof subjectName === 'string') {
    for (const [key, theme] of Object.entries(subjectThemes)) {
      if (subjectName.toLowerCase().includes(key.toLowerCase())) {
        return theme;
      }
    }
  }

  return subjectThemes.Default;
};

export const SubfolderCard: React.FC<{ node: Node; onClick?: () => void }> = ({ node, onClick }) => {
  const isFolder = node.type === 'folder';
  const theme = getSubjectTheme(node);

  // Get display heading (from subject or manual heading)
  const displayHeading = (node as any).subject
    ? (typeof (node as any).subject === 'object'
      ? (node as any).subject.name
      : (node as any).subject)
    : node.heading;

  const handleFileClick = (link: string) => {
    window.open(link, '_blank');
  };

  const createdDate = node.createdAt
    ? new Date(node.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : null;

  const CardWrapper = isFolder ? ClickableCard : StyledCard;

  return (
    <CardWrapper onClick={isFolder ? onClick : undefined} sx={{ overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 3 }}>
      {/* Banner Image */}
      <Box sx={{ position: "relative", height: 140 }}>
        <CardMedia
          component="img"
          image={theme.image}
          alt="Subject Banner"
          sx={{ height: "100%", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.gradient,
            opacity: 0.6,
          }}
        />
      </Box>

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Title */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {displayHeading}
        </Typography>

        {/* Description */}
        {node.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
            {node.description}
          </Typography>
        )}

        {/* Files */}
        {node.fileDetails && node.fileDetails.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Files:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {node.fileDetails.map((file, index) => (
                <FileChip
                  key={index}
                  icon={<AttachFile sx={{ fontSize: 14 }} />}
                  label={file.fileName}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileClick(file.uploadLink);
                  }}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* References */}
        {node.referenceDetails && node.referenceDetails.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>References:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {node.referenceDetails.map((ref, index) => (
                <LinkChip
                  key={index}
                  icon={<LinkIcon sx={{ fontSize: 14 }} />}
                  label={ref.fileName}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileClick(ref.referenceLink);
                  }}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
            {node.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: '#fafafa',
                  fontSize: '0.7rem',
                  height: '22px',
                }}
              />
            ))}
          </Box>
        )}

        {/* Footer */}
        {createdDate && (
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem", whiteSpace: "nowrap", ml: "auto" }}>
            {createdDate}
          </Typography>
        )}
      </CardContent>
    </CardWrapper>
  );
};
