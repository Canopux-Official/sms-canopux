import React from "react";
import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

/** Rows for the class table (home level). Same cell padding as ClassRow. */
export const ClassSkeletonRows: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
                <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
                        <Box>
                            <Skeleton variant="text" width={110} height={24} />
                            <Skeleton variant="text" width={70} height={18} />
                        </Box>
                    </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="text" width={110} height={22} />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="text" width={90} height={22} />
                </TableCell>
                <TableCell />
            </TableRow>
        ))}
    </>
);

/** Rows for the folder and file table. Same cell padding as SubfolderRow. */
export const SubfolderSkeletonRows: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
                <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Skeleton variant="rectangular" width={22} height={22} sx={{ borderRadius: "4px" }} />
                        <Skeleton variant="text" width={180} height={22} />
                    </Box>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="rectangular" width={56} height={22} sx={{ borderRadius: "11px" }} />
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: "11px" }} />
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="text" width={90} height={20} />
                </TableCell>
                <TableCell sx={{ py: 1.5, width: 60 }}>
                    <Skeleton variant="circular" width={30} height={30} sx={{ ml: "auto" }} />
                </TableCell>
            </TableRow>
        ))}
    </>
);

/** Rows for the phone layout (both levels). */
export const MobileSkeletonList: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, borderBottom: "1px solid #f0f0f0" }}
            >
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="60%" height={22} />
                    <Skeleton variant="text" width="40%" height={18} />
                </Box>
                <Skeleton variant="circular" width={28} height={28} />
            </Box>
        ))}
    </>
);