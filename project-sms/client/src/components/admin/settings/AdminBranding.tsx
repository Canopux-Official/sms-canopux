// pages/admin/AdminBranding.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Paper,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Tooltip,
    InputAdornment,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckIcon from '@mui/icons-material/Check';
import type { Branding, BrandingResponse } from './types';
import { brandingService } from './services/adminBranding';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FALLBACK_DEFAULTS: Branding = {
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E293B',
    fontFamily: 'Inter',
};

const PRESETS = [
    { name: 'Ocean', primary: '#2563EB', secondary: '#1E293B' },
    { name: 'Emerald', primary: '#059669', secondary: '#064E3B' },
    { name: 'Violet', primary: '#7C3AED', secondary: '#2E1065' },
    { name: 'Crimson', primary: '#DC2626', secondary: '#450A0A' },
    { name: 'Amber', primary: '#D97706', secondary: '#451A03' },
    { name: 'Mono', primary: '#1A1A1A', secondary: '#475569' },
];

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const isUrlOk = (v: string) => v === '' || v.startsWith('/') || /^https?:\/\/.+/i.test(v);

// Same look as the Notice page inputs
const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#f8f9fa' },
};
const cardSx = {
    p: 3,
    borderRadius: 2,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
const SectionHeader = ({
    icon,
    title,
    subtitle,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    action?: React.ReactNode;
}) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#f0f0f0',
                    color: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography fontWeight={600} color="#1a1a1a" sx={{ lineHeight: 1.3 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Box>
        </Box>
        {action}
    </Box>
);

const ColorField = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) => {
    const valid = HEX_REGEX.test(value);
    return (
        <TextField
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
            error={!valid}
            helperText={!valid ? 'Use a hex color like #2563EB' : ' '}
            sx={fieldSx}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <input
                            type="color"
                            value={valid && value.length === 7 ? value : '#000000'}
                            onChange={(e) => onChange(e.target.value.toUpperCase())}
                            style={{
                                width: 28,
                                height: 28,
                                padding: 0,
                                border: '1px solid #e0e0e0',
                                borderRadius: 6,
                                background: 'none',
                                cursor: 'pointer',
                            }}
                        />
                    </InputAdornment>
                ),
            }}
        />
    );
};

// Small square that shows the uploaded image (or a placeholder)
const ImageBox = ({ url, size, fallback }: { url: string; size: number; fallback: string }) => (
    <Box
        sx={{
            width: size,
            height: size,
            borderRadius: 1.5,
            border: '1px dashed #d0d0d0',
            bgcolor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            color: '#9a9a9a',
            fontSize: 11,
            textAlign: 'center',
        }}
    >
        {url && isUrlOk(url) ? (
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
            fallback
        )}
    </Box>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const AdminBrandingPage = () => {
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [form, setForm] = useState<Branding>(FALLBACK_DEFAULTS);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const { data: response, isLoading, isError } = useQuery<BrandingResponse>({
        queryKey: ['branding'],
        queryFn: () => brandingService.getBranding(),
    });

    const saved = response?.data;
    const defaults = response?.defaults || FALLBACK_DEFAULTS;
    const fonts = useMemo(() => response?.allowedFonts || ['Inter'], [response]);

    // Fill the form whenever fresh data arrives
    useEffect(() => {
        if (saved) {
            setName(saved.name);
            setForm(saved.branding);
        }
    }, [saved]);

    // Load the allowed Google Fonts once so the dropdown + preview can render them
    useEffect(() => {
        if (!fonts.length) return;
        const id = 'branding-fonts';
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        const families = fonts.map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&');
        link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    }, [fonts]);

    const setField = (key: keyof Branding, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    // ---------- validation ----------
    const nameError = name.trim().length < 2 || name.trim().length > 100;
    const colorsError = !HEX_REGEX.test(form.primaryColor) || !HEX_REGEX.test(form.secondaryColor);
    const urlsError = !isUrlOk(form.logoUrl) || !isUrlOk(form.faviconUrl);
    const hasError = nameError || colorsError || urlsError;

    const isDirty = useMemo(() => {
        if (!saved) return false;
        return (
            name.trim() !== saved.name ||
            (Object.keys(form) as (keyof Branding)[]).some((k) => form[k] !== saved.branding[k])
        );
    }, [name, form, saved]);

    const showSnackbar = (message: string, severity: 'success' | 'error') =>
        setSnackbar({ open: true, message, severity });

    const updateMutation = useMutation({
        mutationFn: () => brandingService.updateBranding({ name: name.trim(), branding: form }),
        onSuccess: () => {
            showSnackbar('Branding updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['branding'] });
        },
        onError: (err: any) =>
            showSnackbar(err?.response?.data?.message || 'Failed to update branding', 'error'),
    });

    const handleDiscard = () => {
        if (saved) {
            setName(saved.name);
            setForm(saved.branding);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={50} sx={{ color: '#1a1a1a' }} />
            </Box>
        );
    }

    if (isError || !saved) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Alert severity="error">Failed to load branding settings. Please refresh the page.</Alert>
            </Container>
        );
    }

    const displayName = name.trim() || 'Your Institute';
    const fontStack = `'${form.fontFamily}', sans-serif`;

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* ------------------------------ Header ------------------------------ */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h4" component="h1" fontWeight="600" color="#1a1a1a">
                                Branding
                            </Typography>
                            {isDirty && (
                                <Chip
                                    label="Unsaved changes"
                                    size="small"
                                    sx={{ bgcolor: '#fff4e5', color: '#b25e00', fontWeight: 500, height: 24 }}
                                />
                            )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Customize how your institute looks to students and staff
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            onClick={handleDiscard}
                            disabled={!isDirty || updateMutation.isPending}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                fontWeight: 600,
                                px: 3,
                                py: 1.2,
                                color: '#1a1a1a',
                                borderColor: '#d0d0d0',
                                '&:hover': { borderColor: '#1a1a1a', bgcolor: 'transparent' },
                            }}
                        >
                            Discard
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={
                                updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                            }
                            onClick={() => updateMutation.mutate()}
                            disabled={!isDirty || hasError || updateMutation.isPending}
                            sx={{
                                bgcolor: '#1a1a1a',
                                color: 'white',
                                '&:hover': { bgcolor: '#333' },
                                fontWeight: 600,
                                px: 3,
                                py: 1.2,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                boxShadow: 'none',
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>

                {/* ------------------------------ Body ------------------------------ */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 5fr) minmax(0, 6fr)' },
                        gap: 3,
                        alignItems: 'start',
                    }}
                >
                    {/* ============ LEFT: settings cards ============ */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Identity */}
                        <Paper sx={cardSx}>
                            <SectionHeader
                                icon={<BadgeOutlinedIcon fontSize="small" />}
                                title="Institute Name"
                                subtitle="Shown on your website, login page and emails"
                            />
                            <TextField
                                label="Display Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                size="small"
                                error={nameError}
                                helperText={
                                    nameError
                                        ? 'Name must be between 2 and 100 characters'
                                        : 'Only the display name changes. Your legal name is not affected.'
                                }
                                sx={fieldSx}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                                <Tooltip title="Cannot be changed here" arrow>
                                    <Chip size="small" variant="outlined" label={`Slug: ${saved.slug}`} sx={{ borderColor: '#e0e0e0' }} />
                                </Tooltip>
                                <Tooltip title="Cannot be changed here" arrow>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`Subdomain: ${saved.subdomain}`}
                                        sx={{ borderColor: '#e0e0e0' }}
                                    />
                                </Tooltip>
                            </Box>
                        </Paper>

                        {/* Logo & favicon */}
                        <Paper sx={cardSx}>
                            <SectionHeader
                                icon={<ImageOutlinedIcon fontSize="small" />}
                                title="Logo & Favicon"
                                subtitle="Paste a link to your image. Square images work best."
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <ImageBox url={form.logoUrl} size={72} fallback="No logo" />
                                    <TextField
                                        label="Logo URL"
                                        value={form.logoUrl}
                                        onChange={(e) => setField('logoUrl', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="https://..."
                                        error={!isUrlOk(form.logoUrl)}
                                        helperText={
                                            !isUrlOk(form.logoUrl)
                                                ? 'Enter a valid http(s) URL or a path starting with /'
                                                : 'Shown in the navbar and login page'
                                        }
                                        sx={fieldSx}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <ImageBox url={form.faviconUrl} size={72} fallback="No favicon" />
                                    <TextField
                                        label="Favicon URL"
                                        value={form.faviconUrl}
                                        onChange={(e) => setField('faviconUrl', e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="https://..."
                                        error={!isUrlOk(form.faviconUrl)}
                                        helperText={
                                            !isUrlOk(form.faviconUrl)
                                                ? 'Enter a valid http(s) URL or a path starting with /'
                                                : 'The small icon in the browser tab'
                                        }
                                        sx={fieldSx}
                                    />
                                </Box>
                            </Box>
                        </Paper>

                        {/* Theme colors */}
                        {/* <Paper sx={cardSx}>
                            <SectionHeader
                                icon={<PaletteOutlinedIcon fontSize="small" />}
                                title="Theme Colors"
                                subtitle="Pick a preset or set your own colors"
                                action={
                                    <Button
                                        size="small"
                                        startIcon={<RestartAltIcon />}
                                        onClick={() =>
                                            setForm((p) => ({
                                                ...p,
                                                primaryColor: defaults.primaryColor,
                                                secondaryColor: defaults.secondaryColor,
                                            }))
                                        }
                                        sx={{ textTransform: 'none', color: '#666', whiteSpace: 'nowrap' }}
                                    >
                                        Reset
                                    </Button>
                                }
                            />


                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                                {PRESETS.map((p) => {
                                    const active =
                                        form.primaryColor.toLowerCase() === p.primary.toLowerCase() &&
                                        form.secondaryColor.toLowerCase() === p.secondary.toLowerCase();
                                    return (
                                        <Tooltip key={p.name} title={p.name} arrow>
                                            <Box
                                                onClick={() =>
                                                    setForm((prev) => ({ ...prev, primaryColor: p.primary, secondaryColor: p.secondary }))
                                                }
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: 1.5,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    border: active ? '2px solid #1a1a1a' : '2px solid #e8e8e8',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'transform .15s',
                                                    '&:hover': { transform: 'translateY(-2px)' },
                                                }}
                                            >
                                                <Box sx={{ flex: 1, bgcolor: p.secondary }} />
                                                <Box sx={{ flex: 1, bgcolor: p.primary }} />
                                                {active && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <CheckIcon fontSize="small" />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <ColorField
                                    label="Primary Color"
                                    value={form.primaryColor}
                                    onChange={(v) => setField('primaryColor', v)}
                                />
                                <ColorField
                                    label="Secondary Color"
                                    value={form.secondaryColor}
                                    onChange={(v) => setField('secondaryColor', v)}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Primary is used for buttons and highlights. Secondary is used for the navbar and headings.
                            </Typography>
                        </Paper> */}

                        {/* Font */}
                        {/* <Paper sx={cardSx}>
                            <SectionHeader
                                icon={<TextFieldsIcon fontSize="small" />}
                                title="Typography"
                                subtitle="The font used across your website"
                            />
                            <FormControl size="small" fullWidth>
                                <InputLabel>Font Family</InputLabel>
                                <Select
                                    value={form.fontFamily}
                                    label="Font Family"
                                    onChange={(e) => setField('fontFamily', e.target.value)}
                                    sx={{ borderRadius: 1.5, bgcolor: '#f8f9fa' }}
                                >
                                    {fonts.map((f) => (
                                        <MenuItem key={f} value={f} sx={{ fontFamily: `'${f}', sans-serif` }}>
                                            {f}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#f8f9fa', fontFamily: fontStack }}>
                                <Typography sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 18, color: '#1a1a1a' }}>
                                    The quick brown fox jumps over the lazy dog
                                </Typography>
                                <Typography sx={{ fontFamily: 'inherit', fontSize: 13, color: '#666', mt: 0.5 }}>
                                    ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                                </Typography>
                            </Box>
                        </Paper> */}
                    </Box>

                    {/* ============ RIGHT: live preview ============ */}
                    <Paper
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            position: { lg: 'sticky' },
                            top: { lg: 24 },
                        }}
                    >
                        <Box
                            sx={{
                                px: 3,
                                py: 2,
                                bgcolor: '#f8f9fa',
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <VisibilityOutlinedIcon fontSize="small" sx={{ color: '#666' }} />
                            <Typography fontWeight={600} color="#1a1a1a">
                                Live Preview
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                Nothing is saved until you click Save Changes
                            </Typography>
                        </Box>

                        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#eef0f3' }}>
                            <Box
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid #dcdfe4',
                                    bgcolor: 'white',
                                    fontFamily: fontStack,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                }}
                            >
                                {/* Browser tab */}
                                <Box sx={{ bgcolor: '#dfe2e6', px: 1.5, pt: 1, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 0.6, pb: 1, pr: 1 }}>
                                        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                                            <Box key={c} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />
                                        ))}
                                    </Box>
                                    <Box
                                        sx={{
                                            bgcolor: 'white',
                                            px: 1.5,
                                            py: 0.75,
                                            borderTopLeftRadius: 8,
                                            borderTopRightRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            maxWidth: 220,
                                        }}
                                    >
                                        {form.faviconUrl && isUrlOk(form.faviconUrl) ? (
                                            <img src={form.faviconUrl} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                                        ) : (
                                            <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: form.primaryColor }} />
                                        )}
                                        <Typography noWrap sx={{ fontSize: 12, fontFamily: 'inherit', color: '#333' }}>
                                            {displayName}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Navbar */}
                                <Box
                                    sx={{
                                        bgcolor: form.secondaryColor,
                                        color: 'white',
                                        px: 2.5,
                                        py: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                        {form.logoUrl && isUrlOk(form.logoUrl) ? (
                                            <img src={form.logoUrl} alt="logo" style={{ height: 30, maxWidth: 90, objectFit: 'contain' }} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 1,
                                                    bgcolor: form.primaryColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {displayName.charAt(0).toUpperCase()}
                                            </Box>
                                        )}
                                        <Typography noWrap sx={{ fontWeight: 600, fontSize: 16, fontFamily: 'inherit' }}>
                                            {displayName}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2.5, fontSize: 13, opacity: 0.85 }}>
                                        <span>Dashboard</span>
                                        <span>Tests</span>
                                        <span>Notices</span>
                                    </Box>
                                </Box>

                                {/* Hero */}
                                <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                                    <Typography
                                        sx={{ fontWeight: 700, fontSize: 22, color: form.secondaryColor, fontFamily: 'inherit', mb: 0.5 }}
                                    >
                                        Welcome to {displayName}
                                    </Typography>
                                    <Typography sx={{ fontSize: 14, color: '#666', fontFamily: 'inherit', mb: 2.5 }}>
                                        This is how headings, buttons and text will look to your students.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Box
                                            sx={{
                                                bgcolor: form.primaryColor,
                                                color: 'white',
                                                px: 2.5,
                                                py: 1,
                                                borderRadius: 1.5,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            Start Test
                                        </Box>
                                        <Box
                                            sx={{
                                                border: `1.5px solid ${form.primaryColor}`,
                                                color: form.primaryColor,
                                                px: 2.5,
                                                py: 1,
                                                borderRadius: 1.5,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            View Results
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Content cards */}
                                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#fafbfc' }}>
                                    <Box
                                        sx={{
                                            bgcolor: 'white',
                                            border: '1px solid #eee',
                                            borderLeft: `4px solid ${form.primaryColor}`,
                                            borderRadius: 1.5,
                                            p: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: 14, fontFamily: 'inherit', color: form.secondaryColor }}>
                                                Class Schedule Update
                                            </Typography>
                                            <Box
                                                sx={{
                                                    fontSize: 11,
                                                    px: 1,
                                                    py: '1px',
                                                    borderRadius: 10,
                                                    bgcolor: `${HEX_REGEX.test(form.primaryColor) ? form.primaryColor : '#2563EB'}1A`,
                                                    color: form.primaryColor,
                                                    fontWeight: 600,
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                Important
                                            </Box>
                                        </Box>
                                        <Typography sx={{ fontSize: 13, color: '#777', fontFamily: 'inherit' }}>
                                            Tomorrow's classes will begin at 9:00 AM sharp.
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                        {[
                                            { label: 'Tests Taken', value: '24' },
                                            { label: 'Avg. Score', value: '78%' },
                                        ].map((s) => (
                                            <Box key={s.label} sx={{ bgcolor: 'white', border: '1px solid #eee', borderRadius: 1.5, p: 2 }}>
                                                <Typography sx={{ fontSize: 12, color: '#888', fontFamily: 'inherit' }}>{s.label}</Typography>
                                                <Typography sx={{ fontSize: 24, fontWeight: 700, color: form.primaryColor, fontFamily: 'inherit' }}>
                                                    {s.value}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default AdminBrandingPage;