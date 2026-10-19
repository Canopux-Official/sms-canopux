import React from "react";
import {
    TableRow,
    TableCell,
    Box,
    Chip,
    Typography,
    IconButton,
} from "@mui/material";
import {
    Folder,
    ChevronRight,
    CalendarToday,
} from "@mui/icons-material";
import type { Node } from "../../../admin/Material/types/node";
import { formatDate, getNameLabel } from "../utils/nodeHelpers";


export const ClassRow: React.FC<{
    node: Node;
    onClick: () => void;
    isHighlighted?: boolean;
}> = ({ node, onClick, isHighlighted = false }) => {

    // Safely extract display name from either a populated object or a raw string


    const streamLabel = getNameLabel(node.stream);
    const examLabel = getNameLabel(node.targetExam);

    const createdDate = formatDate(node.createdAt, "long");

    return (
        <TableRow
            id={`material-item-${node._id}`}
            onClick={onClick}
            sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: isHighlighted ? "#fff9e6" : "transparent",
                "&:hover": {
                    backgroundColor: isHighlighted ? "#fff9e6" : "#f5f5f5",
                    "& .row-action": {
                        opacity: 1,
                    },
                },
            }}
        >
            {/* Name Column */}
            <TableCell sx={{ py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                        <Folder sx={{ color: "#3c3702", fontSize: 28 }} />
                    </Box>

                    {/* Name and Details */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                color: "#212121",
                                mb: 0.5,
                            }}
                        >
                            {node.heading}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            {streamLabel && (
                                <Chip
                                    label={streamLabel}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: "0.7rem",
                                        fontWeight: 500,
                                        backgroundColor: "#f5f5f5",
                                        color: "#616161",
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </TableCell>

            {/* Target Exam Column */}
            <TableCell sx={{ py: 2 }}>
                {examLabel ? (
                    <Chip
                        label={examLabel}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            borderColor: "#bdbdbd",
                            color: "#616161",
                        }}
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        —
                    </Typography>
                )}
            </TableCell>

            {/* Modified Date Column */}
            <TableCell sx={{ py: 2 }}>
                {createdDate && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#757575" }}>
                        <CalendarToday sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                            {createdDate}
                        </Typography>
                    </Box>
                )}
            </TableCell>

            {/* Action Column */}
            <TableCell sx={{ py: 2, textAlign: "right" }}>
                <IconButton
                    className="row-action"
                    size="small"
                    sx={{
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                        color: "#757575",
                    }}
                >
                    <ChevronRight />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};