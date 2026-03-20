import React from "react";
import {
    Box,
    Chip,
    Typography,
    IconButton,
    Modal,
    Divider,
    Stack,
    Avatar,
    SwipeableDrawer,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    Folder,
    InsertDriveFile,
    AttachFile,
    Link as LinkIcon,
    CalendarToday,
    OpenInNew,
    Close,
    LocalOffer,
    Description,
} from "@mui/icons-material";
import type { Node } from "../../../admin/Material/types/node";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NodeDetailModalProps {
    node: Node;
    open: boolean;
    onClose: () => void;
}

// ─── Section Label ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string; count?: number }> = ({
    icon,
    label,
    count,
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box sx={{ color: "#6b7280", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography
            variant="caption"
            sx={{
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                fontSize: "0.7rem",
            }}
        >
            {label}
            {count !== undefined && (
                <Box
                    component="span"
                    sx={{
                        ml: 0.75,
                        px: 0.75,
                        py: 0.1,
                        bgcolor: "#e5e7eb",
                        borderRadius: 10,
                        fontSize: "0.65rem",
                        color: "#374151",
                        fontWeight: 700,
                        verticalAlign: "middle",
                    }}
                >
                    {count}
                </Box>
            )}
        </Typography>
    </Box>
);

// ─── Content ──────────────────────────────────────────────────────────────────

const ModalContent: React.FC<NodeDetailModalProps & { isMobile: boolean }> = ({
    node,
    onClose,
    isMobile,
}) => {
    const isFolder = node.type === "folder";

    const displayHeading = (node as any).subject
        ? typeof (node as any).subject === "object"
            ? (node as any).subject.name
            : (node as any).subject
        : node.heading;

    const createdDate = node.createdAt
        ? new Date(node.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        })
        : null;

    const dueDate = node.lastDate
        ? new Date(node.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        })
        : null;

    const hasFiles = node.fileDetails && node.fileDetails.length > 0;
    const hasReferences = node.referenceDetails && node.referenceDetails.length > 0;
    const hasTags = node.tags && node.tags.length > 0;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: isMobile ? "100%" : "auto",
                maxHeight: isMobile ? "100%" : "85vh",
                bgcolor: "#fff",
                borderRadius: isMobile ? "20px 20px 0 0" : 3,
                overflow: "hidden",
            }}
        >
            {/* Mobile drag handle */}
            {isMobile && (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            bgcolor: "#e5e7eb",
                            borderRadius: 2,
                        }}
                    />
                </Box>
            )}

            {/* Header */}
            <Box
                sx={{
                    px: { xs: 2.5, sm: 3 },
                    pt: isMobile ? 1.5 : 3,
                    pb: 2,
                    background: isFolder
                        ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                        : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    borderBottom: "1px solid",
                    borderColor: isFolder ? "#fde68a" : "#bfdbfe",
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                        <Avatar
                            sx={{
                                width: { xs: 44, sm: 52 },
                                height: { xs: 44, sm: 52 },
                                bgcolor: isFolder ? "#fef3c7" : "#dbeafe",
                                border: "2px solid",
                                borderColor: isFolder ? "#f59e0b" : "#3b82f6",
                                flexShrink: 0,
                            }}
                        >
                            {isFolder ? (
                                <Folder sx={{ color: "#f59e0b", fontSize: { xs: 22, sm: 28 } }} />
                            ) : (
                                <InsertDriveFile sx={{ color: "#3b82f6", fontSize: { xs: 20, sm: 26 } }} />
                            )}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: "#111827",
                                    lineHeight: 1.3,
                                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                                    wordBreak: "break-word",
                                }}
                            >
                                {displayHeading}
                            </Typography>
                            <Chip
                                label={isFolder ? "Folder" : "File"}
                                size="small"
                                sx={{
                                    mt: 0.5,
                                    height: 20,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    bgcolor: isFolder ? "#fde68a" : "#bfdbfe",
                                    color: isFolder ? "#92400e" : "#1e3a8a",
                                }}
                            />
                        </Box>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            flexShrink: 0,
                            color: "#9ca3af",
                            mt: 0.25,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.06)", color: "#374151" },
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* Body — scrollable */}
            <Box
                sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: 2.5,
                    overflowY: "auto",
                    flex: 1,
                    // iOS momentum scroll
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <Stack spacing={2.5}>
                    {/* Description */}
                    {node.description && (
                        <Box>
                            <SectionLabel icon={<Description sx={{ fontSize: 16 }} />} label="Description" />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#374151",
                                    lineHeight: 1.75,
                                    pl: 3.2,
                                    fontSize: { xs: "0.88rem", sm: "0.875rem" },
                                }}
                            >
                                {node.description}
                            </Typography>
                        </Box>
                    )}

                    {node.description && (hasTags || createdDate) && (
                        <Divider sx={{ borderColor: "#f3f4f6" }} />
                    )}

                    {/* Tags */}
                    {hasTags && (
                        <Box>
                            <SectionLabel icon={<LocalOffer sx={{ fontSize: 16 }} />} label="Tags" />
                            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", pl: 3.2 }}>
                                {node.tags!.map((tag, i) => (
                                    <Chip
                                        key={i}
                                        label={tag}
                                        size="small"
                                        sx={{
                                            height: 26,
                                            fontSize: "0.78rem",
                                            bgcolor: "#f3f4f6",
                                            color: "#374151",
                                            fontWeight: 500,
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Date */}
                    {createdDate && (
                        <Box>
                            <SectionLabel icon={<CalendarToday sx={{ fontSize: 16 }} />} label="Created Date" />
                            <Typography
                                variant="body2"
                                sx={{ color: "#374151", pl: 3.2, fontWeight: 500, fontSize: { xs: "0.88rem", sm: "0.875rem" } }}
                            >
                                {createdDate}
                            </Typography>
                        </Box>
                    )}

                    {dueDate && (
                        <Box>
                            <SectionLabel icon={<CalendarToday sx={{ fontSize: 16 }} />} label="Due Date" />
                            <Typography
                                variant="body2"
                                sx={{ color: "#374151", pl: 3.2, fontWeight: 500, fontSize: { xs: "0.88rem", sm: "0.875rem" } }}
                            >
                                {dueDate}
                            </Typography>
                        </Box>
                    )}

                    {/* Files */}
                    {hasFiles && (
                        <>
                            <Divider sx={{ borderColor: "#f3f4f6" }} />
                            <Box>
                                <SectionLabel
                                    icon={<AttachFile sx={{ fontSize: 16 }} />}
                                    label="Attachments"
                                    count={node.fileDetails!.length}
                                />
                                <Stack spacing={1} sx={{ pl: { xs: 0, sm: 3.2 } }}>
                                    {node.fileDetails!.map((file, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                px: 1.5,
                                                py: { xs: 1.25, sm: 1 },
                                                bgcolor: "#f8fafc",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 2,
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                                // Larger tap target on mobile
                                                minHeight: { xs: 48, sm: 40 },
                                                "&:hover": { bgcolor: "#eff6ff", borderColor: "#93c5fd" },
                                                "&:active": { bgcolor: "#dbeafe" },
                                            }}
                                            onClick={() => window.open(file.uploadLink, "_blank")}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                                <InsertDriveFile sx={{ fontSize: 18, color: "#3b82f6", flexShrink: 0 }} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: { xs: "0.88rem", sm: "0.85rem" },
                                                        color: "#1e40af",
                                                        fontWeight: 500,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {file.fileName}
                                                </Typography>
                                            </Box>
                                            <OpenInNew sx={{ fontSize: 14, color: "#93c5fd", flexShrink: 0, ml: 1 }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </>
                    )}

                    {/* References */}
                    {hasReferences && (
                        <>
                            <Divider sx={{ borderColor: "#f3f4f6" }} />
                            <Box>
                                <SectionLabel
                                    icon={<LinkIcon sx={{ fontSize: 16 }} />}
                                    label="References"
                                    count={node.referenceDetails!.length}
                                />
                                <Stack spacing={1} sx={{ pl: { xs: 0, sm: 3.2 } }}>
                                    {node.referenceDetails!.map((ref, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                px: 1.5,
                                                py: { xs: 1.25, sm: 1 },
                                                bgcolor: "#fffbeb",
                                                border: "1px solid #fde68a",
                                                borderRadius: 2,
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                                minHeight: { xs: 48, sm: 40 },
                                                "&:hover": { bgcolor: "#fef3c7", borderColor: "#fbbf24" },
                                                "&:active": { bgcolor: "#fde68a" },
                                            }}
                                            onClick={() => window.open(ref.referenceLink, "_blank")}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                                <LinkIcon sx={{ fontSize: 18, color: "#d97706", flexShrink: 0 }} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: { xs: "0.88rem", sm: "0.85rem" },
                                                        color: "#92400e",
                                                        fontWeight: 500,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {ref.fileName}
                                                </Typography>
                                            </Box>
                                            <OpenInNew sx={{ fontSize: 14, color: "#fbbf24", flexShrink: 0, ml: 1 }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </>
                    )}

                    {/* Bottom padding for mobile safe area */}
                    {<Box sx={{ height: { xs: 16, sm: 4 } }} />}
                </Stack>
            </Box>
        </Box>
    );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Mobile: bottom sheet drawer
    if (isMobile) {
        return (
            <SwipeableDrawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                onOpen={() => { }}
                disableSwipeToOpen
                PaperProps={{
                    sx: {
                        borderRadius: "20px 20px 0 0",
                        maxHeight: "92vh",
                        overflow: "hidden",
                    },
                }}
            >
                <ModalContent node={node} open={open} onClose={onClose} isMobile />
            </SwipeableDrawer>
        );
    }

    // Desktop: centered modal
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 560,
                    maxHeight: "85vh",
                    outline: "none",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
                }}
            >
                <ModalContent node={node} open={open} onClose={onClose} isMobile={false} />
            </Box>
        </Modal>
    );
};