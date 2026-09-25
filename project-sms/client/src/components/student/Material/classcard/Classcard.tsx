
// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardMedia,
//   Typography,
//   Box,
//   Chip,
// } from "@mui/material";
// import { ChevronRight } from "@mui/icons-material";
// import type { Node } from "../../../admin/Material/types/node";
// import def from '../../../../../public/images/default.jpg'
// import chem from '../../../../../public/images/chemistry.jpg'

// // Subject-based banner images and colors
// const subjectThemes = {
//   Physics: {
//     image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
//     bgColor: "#EFF6FF",
//     chipColor: "#1e40af"
//   },
//   Chemistry: {
//     image: chem,
//     gradient: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
//     bgColor: "#FAF5FF",
//     chipColor: "#7e22ce"
//   },
//   Mathematics: {
//     image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
//     bgColor: "#ECFDF5",
//     chipColor: "#047857"
//   },
//   Biology: {
//     image: "https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #16a34a 0%, #84cc16 100%)",
//     bgColor: "#F0FDF4",
//     chipColor: "#15803d"
//   },
//   Geography: {
//     image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
//     bgColor: "#FFF7ED",
//     chipColor: "#c2410c"
//   },
//   History: {
//     image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #d97706 0%, #eab308 100%)",
//     bgColor: "#FFFBEB",
//     chipColor: "#b45309"
//   },
//   English: {
//     image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #0891b2 0%, #3b82f6 100%)",
//     bgColor: "#ECFEFF",
//     chipColor: "#0e7490"
//   },
//   Computer: {
//     image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
//     gradient: "linear-gradient(135deg, #475569 0%, #6b7280 100%)",
//     bgColor: "#F8FAFC",
//     chipColor: "#334155"
//   },
//   Default: {
//     image: def,
//     gradient: "linear-gradient(135deg, #4b5563 0%, #64748b 100%)",
//     bgColor: "#F9FAFB",
//     chipColor: "#374151"
//   }
// };

// // Function to detect subject from heading or use provided subject
// const getSubjectTheme = (node: Node) => {
//   const subject = (node as any).subject || node.heading;
  
//   for (const [key, theme] of Object.entries(subjectThemes)) {
//     if (subject.toLowerCase().includes(key.toLowerCase())) {
//       return theme;
//     }
//   }
  
//   return subjectThemes.Default;
// };

// export const ClassCard: React.FC<{
//   node: Node;
//   onClick: () => void;
// }> = ({ node, onClick }) => {
//   const theme = getSubjectTheme(node);
  
//   const createdDate = node.createdAt
//     ? new Date(node.createdAt).toLocaleDateString("en-US", {
//         month: "short",
//         day: "2-digit",
//         year: "numeric",
//       })
//     : null;

//   return (
//     <Card
//       onClick={onClick}
//       sx={{
//         borderRadius: 3,
//         overflow: "hidden",
//         cursor: "pointer",
//         boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
//         border: "1px solid #e5e7eb",
//         transition: "all 0.2s ease",
//         "&:hover": {
//           boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
//           transform: "translateY(-4px)",
//         },
//         "&:active": {
//           transform: "translateY(0)",
//         },
//       }}
//     >
//       {/* Banner Image */}
//       <Box sx={{ position: "relative", height: { xs: 128, sm: 144 } }}>
//         <CardMedia
//           component="img"
//           image={theme.image}
//           alt=""
//           sx={{
//             height: "100%",
//             objectFit: "cover",
//           }}
//         />
//         <Box
//           sx={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: theme.gradient,
//             opacity: 0.6,
//           }}
//         />
        
//         {/* Menu Button on Banner */}
//       </Box>

//       {/* Content Section */}
//       <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
//         {/* Title and Exam */}
//         <Box sx={{ mb: 2 }}>
//           <Typography
//             variant="subtitle1"
//             sx={{
//               fontWeight: 600,
//               fontSize: { xs: "1rem", sm: "1.125rem" },
//               lineHeight: 1.3,
//               mb: 1,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               display: "-webkit-box",
//               WebkitLineClamp: 2,
//               WebkitBoxOrient: "vertical",
//             }}
//           >
//             {node.heading}
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <Typography
//               variant="body2"
//               sx={{
//                 color: "text.secondary",
//                 fontSize: { xs: "0.875rem", sm: "0.875rem" },
//                 fontWeight: 500,
//               }}
//             >
//               {node.targetExam}
//             </Typography>
//             <ChevronRight
//               sx={{
//                 display: { xs: "block", sm: "none" },
//                 color: "text.secondary",
//                 fontSize: 20,
//               }}
//             />
//           </Box>
//         </Box>

//         {/* Footer */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 1,
//             pt: 2,
//             borderTop: "1px solid #f3f4f6",
//           }}
//         >
//           {node.stream && (
//             <Chip
//               label={node.stream}
//               size="small"
//               sx={{
//                 backgroundColor: theme.bgColor,
//                 color: theme.chipColor,
//                 fontSize: "0.75rem",
//                 fontWeight: 500,
//                 height: 28,
//                 borderRadius: 2,
//                 "& .MuiChip-label": {
//                   px: 1.5,
//                 },
//               }}
//             />
//           )}

//           {createdDate && (
//             <Typography
//               variant="caption"
//               sx={{
//                 color: "text.secondary",
//                 fontSize: { xs: "0.7rem", sm: "0.75rem" },
//                 whiteSpace: "nowrap",
//                 ml: "auto",
//               }}
//             >
//               {createdDate}
//             </Typography>
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { ChevronRight, School, CalendarToday } from "@mui/icons-material";
import type { Node } from "../../../admin/Material/types/node";

// Subject-based themes with gradient colors
const subjectThemes = {
  Physics: {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgColor: "#EFF6FF",
    chipColor: "#1e40af",
    accentColor: "#667eea"
  },
  Chemistry: {
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bgColor: "#FAF5FF",
    chipColor: "#7e22ce",
    accentColor: "#f093fb"
  },
  Mathematics: {
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgColor: "#ECFDF5",
    chipColor: "#047857",
    accentColor: "#4facfe"
  },
  Biology: {
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    bgColor: "#F0FDF4",
    chipColor: "#15803d",
    accentColor: "#43e97b"
  },
  Geography: {
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    bgColor: "#FFF7ED",
    chipColor: "#c2410c",
    accentColor: "#fa709a"
  },
  History: {
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    bgColor: "#FFFBEB",
    chipColor: "#b45309",
    accentColor: "#fcb69f"
  },
  English: {
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    bgColor: "#ECFEFF",
    chipColor: "#0e7490",
    accentColor: "#a8edea"
  },
  Computer: {
    gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    bgColor: "#F8FAFC",
    chipColor: "#334155",
    accentColor: "#6a11cb"
  },
  Default: {
    gradient: "linear-gradient(135deg, #868f96 0%, #596164 100%)",
    bgColor: "#F9FAFB",
    chipColor: "#374151",
    accentColor: "#868f96"
  }
};

// Function to detect subject from heading or use provided subject
const getSubjectTheme = (node: Node) => {
  const subjectValue = typeof (node as unknown as Record<string, unknown>).subject === 'string' ? (node as unknown as Record<string, unknown>).subject : node.heading;
  const subject = subjectValue as string;
  
  for (const [key, theme] of Object.entries(subjectThemes)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) {
      return { ...theme, subjectName: key };
    }
  }
  
  return { ...subjectThemes.Default, subjectName: "Course" };
};

// Extract class/grade from heading (e.g., "Class 9", "Grade 10", "9th", etc.)
const extractClassInfo = (heading: string): string => {
  // Match patterns like "Class 9", "Grade 10", "9th", "10th Standard", etc.
  const patterns = [
    /class\s*(\d+)/i,
    /grade\s*(\d+)/i,
    /(\d+)(?:st|nd|rd|th)\s*(?:class|grade|standard)?/i,
    /std\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = heading.match(pattern);
    if (match) {
      return `Class ${match[1]}`;
    }
  }

  // If no class number found, return first word or abbreviation
  const words = heading.split(/\s+/);
  if (words.length > 0) {
    const firstWord = words[0];
    // If it's a number, format as "Class X"
    if (/^\d+$/.test(firstWord)) {
      return `Class ${firstWord}`;
    }
    // Otherwise return first 2-3 characters as abbreviation
    return firstWord.substring(0, 3).toUpperCase();
  }

  return "CLS";
};

export const ClassCard: React.FC<{
  node: Node;
  onClick: () => void;
}> = ({ node, onClick }) => {
  const theme = getSubjectTheme(node);
  const classInfo = extractClassInfo(node.heading);
  
  const createdDate = node.createdAt
    ? new Date(node.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        "&:hover": {
          boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
          transform: "translateY(-6px)",
          borderColor: theme.accentColor,
          "& .class-number": {
            transform: "scale(1.05)",
          },
          "& .hover-arrow": {
            opacity: 1,
            transform: "translateX(0)",
          }
        },
        "&:active": {
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Header Section with Large Text */}
      <Box
        sx={{
          position: "relative",
          background: theme.gradient,
          minHeight: { xs: 160, sm: 180, md: 200 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)",
          }
        }}
      >
        {/* Decorative Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            filter: "blur(40px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.1)",
            filter: "blur(40px)",
          }}
        />

        {/* Large Class Text */}
        <Typography
          className="class-number"
          sx={{
            fontSize: { xs: "3.5rem", sm: "4rem", md: "4.5rem" },
            fontWeight: 800,
            color: "#ffffff",
            textShadow: "0 4px 12px rgba(0,0,0,0.15)",
            letterSpacing: "-0.02em",
            zIndex: 1,
            transition: "transform 0.3s ease",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          {classInfo}
        </Typography>

        {/* Subject Badge */}
        <Chip
          icon={<School sx={{ fontSize: 14, color: "inherit" }} />}
          label={theme.subjectName}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            backgroundColor: "rgba(255,255,255,0.95)",
            color: theme.chipColor,
            fontSize: "0.7rem",
            fontWeight: 600,
            height: 26,
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />

        {/* Hover Arrow Indicator */}
        <ChevronRight
          className="hover-arrow"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#ffffff",
            fontSize: 28,
            opacity: 0,
            transform: "translateX(-10px)",
            transition: "all 0.3s ease",
          }}
        />
      </Box>

      {/* Content Section */}
      <CardContent 
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: { xs: 2, sm: 2.5 } } 
        }}
      >
        {/* Course Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
            lineHeight: 1.4,
            mb: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "#1f2937",
          }}
        >
          {node.heading}
        </Typography>

        {/* Spacer to push footer to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Footer Section */}
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {/* Stream and Target Exam Row */}
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={1}
            sx={{
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {node.stream && (
              <Chip
                label={String(typeof node.stream === 'string' ? node.stream : (typeof node.stream === 'object' && node.stream !== null && 'name' in node.stream ? (node.stream as unknown as Record<string, unknown>).name : 'Stream'))}
                size="small"
                sx={{
                  backgroundColor: theme.bgColor,
                  color: theme.chipColor,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  height: 28,
                  borderRadius: 2,
                  border: `1px solid ${theme.chipColor}20`,
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
            )}

            {node.targetExam && (
              <Chip
                label={String(typeof node.targetExam === 'string' ? node.targetExam : (typeof node.targetExam === 'object' && node.targetExam !== null && 'name' in node.targetExam ? (node.targetExam as unknown as Record<string, unknown>).name : 'Exam'))}
                size="small"
                variant="outlined"
                sx={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  height: 28,
                  borderRadius: 2,
                  borderColor: "#e2e8f0",
                  backgroundColor: "#f8fafc",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
            )}
          </Stack>

          {/* Date */}
          {createdDate && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#9ca3af",
              }}
            >
              <CalendarToday sx={{ fontSize: 14 }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  fontWeight: 500,
                }}
              >
                {createdDate}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* Bottom Accent Line */}
      <Box
        sx={{
          height: 4,
          background: theme.gradient,
          opacity: 0.8,
        }}
      />
    </Card>
  );
};