
import React from "react";
import {
    Typography,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    Close as CloseIcon,
    OpenInNew,
} from "@mui/icons-material";


export const FilesDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    files: any[];
    title: string;
    icon: React.ReactNode;
    accentColor: string;
}> = ({ open, onClose, files, title, icon, accentColor }) => {
    const handleFileClick = (link: string) => {
        window.open(link, '_blank');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 1,
                    mx: 2,
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Chip
                        label={files.length}
                        size="small"
                        sx={{
                            ml: 1,
                            backgroundColor: accentColor,
                            color: 'white',
                            fontWeight: 600,
                            height: 24
                        }}
                    />
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                <List sx={{ py: 0 }}>
                    {files.map((file, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                sx={{
                                    py: 2,
                                    px: 3,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    }
                                }}
                                onClick={() => handleFileClick(file.uploadLink || file.referenceLink)}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.fileName}
                                    secondary={file.uploadLink || file.referenceLink}
                                    primaryTypographyProps={{
                                        fontWeight: 500,
                                        sx: {
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                    secondaryTypographyProps={{
                                        sx: {
                                            fontSize: '0.75rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                />
                                <IconButton size="small" sx={{ color: accentColor }}>
                                    <OpenInNew fontSize="small" />
                                </IconButton>
                            </ListItem>
                            {index < files.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};