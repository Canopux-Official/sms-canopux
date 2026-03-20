import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    Alert,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    LinearProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getLandingPage, updateLandingPage } from '../../api/apiFunctions';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../../components/landing_new/theme/theme';
import Header from '../../components/landing_new/Header';
import Hero from '../../components/landing_new/Hero';
import Results from '../../components/landing_new/Results';
import Courses from '../../components/landing_new/Courses';
import Faculty from '../../components/landing_new/Faculty';
import FAQ from '../../components/landing_new/FAQ';
import Footer from '../../components/landing_new/Footer';
import { uploadImageToCloudinary } from '../../components/landing_new/service/cloudinary_service';
import Gallery from '../../components/landing_new/Gallery';
import CollectionsIcon from '@mui/icons-material/Collections'
import BrowseImageModal from './BrowseImageModal';



// Define Interfaces for Type Safety
interface Stat {
    target: number;
    label: string;
    suffix: string;
    divisor: number;
}

interface Hero {
    heading: string;
    subheading: string;
    image?: string;
    stats: Stat[];
}

interface Course {
    courseId: string;
    title: string;
    description: string;
    level: string;
    students: number;
    duration: string;
    features: string[];
    gradient: string;
}

interface FacultyStat {
    value: string;
    label: string;
}

interface FacultyMember {
    name: string;
    title: string;
    subject: string;
    experience: string;
    qualification: string;
    specialty: string;
    initials: string;
    image: string;
    bio: string;
}

interface ScoreEntry {
    exam: string;
    score: string;
}

interface Result {
    name: string;
    scores: ScoreEntry[];        // ✅ multiple exam scores
    course: string;
    image: string;
    bio: string;
    currentStatus: string[];     // ✅ multiple status lines
    youtubeLink?: string;
}

// interface Result {
//     name: string;
//     score: string;
//     scoreLabel: string;
//     exam: string;
//     course: string;
//     image: string;
//     bio: string;
//     achievement: string;
//     youtubeLink?: string;
// }

interface FAQ {
    q: string;
    a: string;
}

interface SocialLinks {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
}

interface Footer {
    phones: string[];
    email: string;
    address: string;
    copyrightText: string;
    socialLinks: SocialLinks;
}

interface GalleryImage {
    url: string;
    publicId?: string;
}

interface LandingData {
    hero: Hero;
    courses: Course[];
    faculty: FacultyMember[];
    facultyStats: FacultyStat[];
    results: Result[];
    faqs: FAQ[];
    gallery: GalleryImage[];
    footer: Footer;
}

const GRADIENT_PRESETS = [
    { label: 'Soft Blue', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { label: 'Peach Sunrise', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { label: 'Mint Glow', value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
    { label: 'Soft Lavender', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
    { label: 'Warm Sunlight', value: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)' },
    { label: 'Clean Gray', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
    { label: 'Pink Dust', value: 'linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)' },
    { label: 'Aqua Splash', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { label: 'Pearl White', value: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' },
    { label: 'Dawn Glow', value: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)' },
];

const AdminLandingPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [landingData, setLandingData] = useState<LandingData | null>(null);

    const [browseModal, setBrowseModal] = useState<{ open: boolean; targetIndex: number } | null>(null)

    // New state for Edit Mode and Resizing
    const [isEditing, setIsEditing] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50); // percentage 0-100
    const [isDragging, setIsDragging] = useState(false);

    // Unsaved changes tracking
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const isFirstLoad = useRef(true);

    const [imageUploading, setImageUploading] = useState(false);
    const [imageUploadProgress, setImageUploadProgress] = useState(0);

    // Publish confirmation dialog
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    // Refs for drag logic
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        // Constrain width between 20% and 80%
        if (newWidth >= 20 && newWidth <= 80) {
            setLeftWidth(newWidth);
        }
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        fetchData();
    }, []);

    // Mark dirty whenever landingData changes after initial fetch
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        setHasUnsavedChanges(true);
    }, [landingData]);

    // Warn on browser refresh / tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const fetchData = async () => {
        try {
            const res = await getLandingPage();
            if (res.success) {
                const payload = res.data as { data: LandingData };
                const data = payload.data as LandingData;
                if (data) {
                    setLandingData(data);
                } else {
                    // Initialize empty state if no data exists
                    setLandingData({
                        hero: { heading: '', subheading: '', stats: [] },
                        courses: [],
                        faculty: [],
                        facultyStats: [],
                        results: [],
                        faqs: [],
                        gallery: [],
                        footer: {
                            phones: [],
                            email: '',
                            address: '',
                            copyrightText: '© 2025 JJ Institute Of Science. All rights reserved.',
                            socialLinks: { facebook: '', instagram: '', linkedin: '', twitter: '' }
                        }
                    });
                }
            } else {
                setError(res.message || 'Failed to fetch landing page data');
            }
        } catch (err: unknown) {
            console.error('Error fetching data:', err);
            setError('An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!landingData) return;
        setSaving(true);
        setError(null);
        setPublishDialogOpen(false);
        try {
            const res = await updateLandingPage(landingData);
            if (res.success) {
                setSuccess(true);
                setHasUnsavedChanges(false);
            } else {
                setError(res.message || 'Failed to update landing page');
            }
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'An error occurred while updating';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleNestedChange = (path: string, value: unknown) => {
        if (!landingData) return;
        const keys = path.split('.');
        const newData = { ...landingData } as Record<string, unknown>;
        let current: Record<string, unknown> = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
            current = current[keys[i]] as Record<string, unknown>;
        }
        current[keys[keys.length - 1]] = value;
        setLandingData(newData as unknown as LandingData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                if (img.width < 500 || img.height < 500) {
                    setError(`Image is too small (${img.width}x${img.height}). Minimum dimensions are 500x500 pixels.`);
                    return;
                }
                if (Math.abs(img.width - img.height) > 10) {
                    setError(`Please upload a square image. Uploaded image is ${img.width}x${img.height}.`);
                    return;
                }
                handleNestedChange('hero.image', event.target?.result);
                setError(null);
                setImageUploading(true);
                setImageUploadProgress(0);

                try {
                    const imageUrl = await uploadImageToCloudinary(file, (progress) => {
                        setImageUploadProgress(progress);
                    });
                    handleNestedChange('hero.image', imageUrl); // ✅ direct URL, works in <img src> instantly
                } catch (err: any) {
                    setError(`Upload failed: ${err.message}`);
                } finally {
                    setImageUploading(false);
                    setImageUploadProgress(0);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };


    const handleArrayItemChange = (section: keyof LandingData, index: number, field: string, value: unknown) => {
        if (!landingData) return;
        const sectionArray = landingData[section] as unknown[];
        if (!Array.isArray(sectionArray)) return;
        const updatedArray = [...sectionArray];
        updatedArray[index] = { ...(updatedArray[index] as object), [field]: value };
        setLandingData({ ...landingData, [section]: updatedArray } as unknown as LandingData);
    };

    const addItem = (section: keyof LandingData, template: unknown) => {
        if (!landingData) return;
        const sectionArray = landingData[section] || ([] as unknown[]);
        if (!Array.isArray(sectionArray)) return;
        setLandingData({
            ...landingData,
            [section]: [...sectionArray, template]
        } as unknown as LandingData);
    };

    const removeItem = (section: keyof LandingData, index: number) => {
        if (!landingData) return;
        const sectionArray = landingData[section] as unknown[];
        if (!Array.isArray(sectionArray)) return;
        const updatedArray = sectionArray.filter((_, i) => i !== index);
        setLandingData({ ...landingData, [section]: updatedArray } as unknown as LandingData);
    };

    const handleFeatureChange = (courseIndex: number, featureIndex: number, value: string) => {
        if (!landingData) return;
        const updatedCourses = [...landingData.courses];
        updatedCourses[courseIndex].features = [...updatedCourses[courseIndex].features];
        updatedCourses[courseIndex].features[featureIndex] = value;
        setLandingData({ ...landingData, courses: updatedCourses });
    };

    const addFeature = (courseIndex: number) => {
        if (!landingData) return;
        const updatedCourses = [...landingData.courses];
        updatedCourses[courseIndex].features = [...updatedCourses[courseIndex].features, ''];
        setLandingData({ ...landingData, courses: updatedCourses });
    };

    const removeFeature = (courseIndex: number, featureIndex: number) => {
        if (!landingData) return;
        const updatedCourses = [...landingData.courses];
        updatedCourses[courseIndex].features = updatedCourses[courseIndex].features.filter((_, i) => i !== featureIndex);
        setLandingData({ ...landingData, courses: updatedCourses });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    // default stats
    const defaultStats = [
        { value: '6+', label: 'Expert Educators' },
        { value: '88 yrs', label: 'Combined Experience' },
        { value: '95%', label: 'Success Rate' },
        { value: '4', label: 'Subjects Covered' }
    ];

    return (
        <Box
            ref={containerRef}
            sx={{
                display: 'flex',
                height: 'calc(100vh - 64px)',
                overflow: 'hidden',
                // Change cursor globally while resizing to prevent text selection cursor
                cursor: isDragging ? 'col-resize' : 'default',
                userSelect: isDragging ? 'none' : 'auto'
            }}
        >
            {/* Left Side: Editor */}
            {isEditing && (
                <Box sx={{
                    width: { xs: '100%', md: `${leftWidth}%` },
                    overflowY: 'auto',
                    p: { xs: 2, sm: 3, md: 4 },
                    bgcolor: '#f5f5f5'
                }}>
                    <Container maxWidth="md" disableGutters>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="h4" fontWeight={800} sx={{ color: '#0b2021', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>Landing Page Manager</Typography>
                                <Typography variant="body2" color="text.secondary">Customize the content and layout of your public landing page.</Typography>
                            </Box>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => setIsEditing(false)}
                                    fullWidth
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                >
                                    Exit Edit Mode
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    onClick={() => setPublishDialogOpen(true)}
                                    disabled={saving || !hasUnsavedChanges}
                                    fullWidth
                                    sx={{
                                        bgcolor: '#0b2021',
                                        px: 3,
                                        py: 1,
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#1a3a3a' },
                                        '&.Mui-disabled': {
                                            bgcolor: 'rgba(0,0,0,0.12)',
                                            color: 'rgba(0,0,0,0.26)'
                                        }
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Publish Changes'}
                                </Button>
                            </Stack>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

                        <Tabs
                            value={activeTab}
                            onChange={(_, val) => setActiveTab(val)}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                            sx={{
                                mb: 4,
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } },
                                '& .Mui-selected': { color: '#0b2021 !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#0b2021' }
                            }}
                        >
                            <Tab label="Hero & Stats" />
                            <Tab label="Success Stories" />
                            <Tab label="Course List" />
                            <Tab label="Faculty Team" />
                            <Tab label="FAQs" />
                            <Tab label="Gallery" />   {/* ✅ add this */}
                            <Tab label="Footer & Social" />

                        </Tabs>

                        {/* Tab Panels */}
                        {activeTab === 0 && (
                            <Stack spacing={4}>
                                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Main Hero Content</Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                                            <TextField
                                                label="Main Heading"
                                                fullWidth
                                                variant="outlined"
                                                helperText="The large text at the very top of the landing page."
                                                value={landingData?.hero?.heading || ''}
                                                onChange={(e) => handleNestedChange('hero.heading', e.target.value)}
                                            />
                                            <TextField
                                                label="Subheading Description"
                                                fullWidth
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                                helperText="The paragraph text right below the main heading."
                                                value={landingData?.hero?.subheading || ''}
                                                onChange={(e) => handleNestedChange('hero.subheading', e.target.value)}
                                            />
                                            <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                    Group Photo (Top Candidates)
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                                    Upload a square image (minimum 500×500 px) to be displayed on the right side of the Hero section.
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                                    {/* Preview */}
                                                    <Box
                                                        component="img"
                                                        src={landingData?.hero?.image}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            objectFit: 'cover',
                                                            borderRadius: 2,
                                                            border: '1px solid #ddd',
                                                            bgcolor: '#fff',
                                                            flexShrink: 0,
                                                        }}
                                                    />

                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {/* Upload button */}
                                                        <Button
                                                            variant="outlined"
                                                            component="label"
                                                            startIcon={imageUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                                            disabled={imageUploading}
                                                        >
                                                            {imageUploading ? `Uploading… ${imageUploadProgress}%` : 'Upload Square Image'}
                                                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                                        </Button>

                                                        {/* Progress bar — only visible while uploading */}
                                                        {imageUploading && (
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={imageUploadProgress}
                                                                sx={{ borderRadius: 1, height: 6, width: 220 }}
                                                            />
                                                        )}

                                                        {/* Stored link — visible once image is set */}
                                                        {landingData?.hero?.image && !imageUploading && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    maxWidth: 260,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                🔗{' '}
                                                                <a href={landingData.hero.image} target="_blank" rel="noreferrer">
                                                                    {landingData.hero.image}
                                                                </a>
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>Stats Counters</Typography>
                                                <Typography variant="body2" color="text.secondary">Manage the animated numbers shown on the landing page.</Typography>
                                            </Box>
                                            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => {
                                                if (landingData) {
                                                    const newStats = [...(landingData.hero.stats || []), { target: 0, label: '', suffix: '', divisor: 1 }];
                                                    handleNestedChange('hero.stats', newStats);
                                                }
                                            }}>Add Stat</Button>
                                        </Box>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
                                            {landingData?.hero?.stats?.map((stat: Stat, index: number) => (
                                                <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: '8px', bgcolor: '#fcfcfc' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                        <Typography variant="subtitle2" fontWeight={700}>Stat: {stat.label || `Item ${index + 1}`}</Typography>
                                                        <IconButton size="small" color="error" onClick={() => {
                                                            if (landingData) {
                                                                const updatedStats = landingData.hero.stats.filter((_, i) => i !== index);
                                                                handleNestedChange('hero.stats', updatedStats);
                                                            }
                                                        }}><DeleteIcon /></IconButton>
                                                    </Box>
                                                    <Stack spacing={2}>
                                                        <TextField label="Label (e.g. Students)" size="small" fullWidth value={stat.label} onChange={(e) => {
                                                            const updatedStats = [...landingData.hero.stats];
                                                            updatedStats[index].label = e.target.value;
                                                            handleNestedChange('hero.stats', updatedStats);
                                                        }} />
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <TextField label="Target Number" type="number" size="small" value={stat.target} onChange={(e) => {
                                                                const updatedStats = [...landingData.hero.stats];
                                                                updatedStats[index].target = Number(e.target.value);
                                                                handleNestedChange('hero.stats', updatedStats);
                                                            }} />
                                                            <TextField label="Suffix (e.g. K+)" size="small" sx={{ width: '100px' }} value={stat.suffix} onChange={(e) => {
                                                                const updatedStats = [...landingData.hero.stats];
                                                                updatedStats[index].suffix = e.target.value;
                                                                handleNestedChange('hero.stats', updatedStats);
                                                            }} />
                                                        </Box>
                                                        <TextField
                                                            label="Divisor"
                                                            type="number"
                                                            size="small"
                                                            helperText="Value to divide target by for display (e.g. 1000 for K)"
                                                            value={stat.divisor}
                                                            onChange={(e) => {
                                                                const updatedStats = [...landingData.hero.stats];
                                                                updatedStats[index].divisor = Number(e.target.value);
                                                                handleNestedChange('hero.stats', updatedStats);
                                                            }}
                                                        />
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Stack>
                        )}

                        {/* {activeTab === 1 && (
                            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Success Stories</Typography>
                                            <Typography variant="body2" color="text.secondary">Showcase student achievements and ranks.</Typography>
                                        </Box>
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addItem('results', { name: '', score: '', scoreLabel: '', exam: '', course: '', image: '', bio: '', achievement: '', youtubeLink: '' })}>Add Story</Button>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                        {landingData?.results?.map((student: Result, index: number) => (
                                            <Paper key={index} variant="outlined" sx={{ p: 3, borderRadius: '8px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="subtitle1" fontWeight={700}>Student: {student.name || `New Entry ${index + 1}`}</Typography>
                                                    <IconButton color="error" onClick={() => removeItem('results', index)}><DeleteIcon /></IconButton>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                                    <TextField size="small" label="Student Name" fullWidth value={student.name} onChange={(e) => handleArrayItemChange('results', index, 'name', e.target.value)} />
                                                    <TextField size="small" label="Course (e.g. JEE Main)" fullWidth value={student.course} onChange={(e) => handleArrayItemChange('results', index, 'course', e.target.value)} />
                                                    <TextField size="small" label="Exam (e.g. IIT-JEE '24)" fullWidth value={student.exam} onChange={(e) => handleArrayItemChange('results', index, 'exam', e.target.value)} />
                                                    <TextField size="small" label="Final Achievement" fullWidth value={student.achievement} onChange={(e) => handleArrayItemChange('results', index, 'achievement', e.target.value)} />
                                                    <TextField size="small" label="Score/Rank Value" fullWidth value={student.score} onChange={(e) => handleArrayItemChange('results', index, 'score', e.target.value)} />
                                                    <TextField size="small" label="Label (e.g. AIR 42)" fullWidth value={student.scoreLabel} onChange={(e) => handleArrayItemChange('results', index, 'scoreLabel', e.target.value)} />
                                                    <Box sx={{ gridColumn: 'span 2' }}>
                                                        <TextField
                                                            size="small"
                                                            label="Youtube Link (Optional)"
                                                            fullWidth
                                                            value={student.youtubeLink || ''}
                                                            onChange={(e) => handleArrayItemChange('results', index, 'youtubeLink', e.target.value)}
                                                            sx={{ mb: 2 }}
                                                            helperText="⚠️ Only 9:16 vertical videos (YouTube Shorts) are supported. Landscape videos will appear distorted."
                                                            FormHelperTextProps={{ sx: { color: 'warning.main', fontWeight: 500 } }}
                                                        />
                                                        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                                Upload Image (Replaces Photo URL)
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Box
                                                                    component="img"
                                                                    src={student.image || 'https://via.placeholder.com/60?text=No+Img'}
                                                                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                                                                />
                                                                <Button
                                                                    variant="outlined"
                                                                    component="label"
                                                                    size="small"
                                                                    startIcon={imageUploading ? <CircularProgress size={14} /> : <CloudUploadIcon />}
                                                                    disabled={imageUploading}
                                                                >
                                                                    {imageUploading ? `${imageUploadProgress}%` : 'Upload Image'}
                                                                    <input type="file" hidden accept="image/*" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        if (!file.type.startsWith('image/')) {
                                                                            setError('Please select a valid image file');
                                                                            return;
                                                                        }

                                                                        setImageUploading(true);
                                                                        setImageUploadProgress(0);

                                                                        try {
                                                                            const imageUrl = await uploadImageToCloudinary(file, (progress) => {
                                                                                setImageUploadProgress(progress);
                                                                            });
                                                                            handleArrayItemChange('results', index, 'image', imageUrl);
                                                                            setError(null);
                                                                        } catch (err: any) {
                                                                            setError(`Upload failed: ${err.message}`);
                                                                        } finally {
                                                                            setImageUploading(false);
                                                                            setImageUploadProgress(0);
                                                                            e.target.value = '';
                                                                        }
                                                                    }} />
                                                                </Button>

                                                                {imageUploading && (
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={imageUploadProgress}
                                                                        sx={{ mt: 1, borderRadius: 1, height: 5 }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                        <TextField size="small" label="Testimonial / Bio" multiline rows={3} fullWidth value={student.bio} onChange={(e) => handleArrayItemChange('results', index, 'bio', e.target.value)} />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )} */}

                        {activeTab === 1 && (
                            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Success Stories</Typography>
                                            <Typography variant="body2" color="text.secondary">Showcase student achievements and ranks.</Typography>
                                        </Box>
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() =>
                                            addItem('results', {
                                                name: '', scores: [], course: '', image: '',
                                                bio: '', currentStatus: [], youtubeLink: ''
                                            })
                                        }>Add Story</Button>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                        {landingData?.results?.map((student: Result, index: number) => (
                                            <Paper key={index} variant="outlined" sx={{ p: 3, borderRadius: '8px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        Student: {student.name || `New Entry ${index + 1}`}
                                                    </Typography>
                                                    <IconButton color="error" onClick={() => removeItem('results', index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>

                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                                    <TextField size="small" label="Student Name" fullWidth
                                                        value={student.name}
                                                        onChange={(e) => handleArrayItemChange('results', index, 'name', e.target.value)}
                                                    />
                                                    <TextField size="small" label="Enrolled For (e.g. JEE Main)" fullWidth
                                                        value={student.course}
                                                        onChange={(e) => handleArrayItemChange('results', index, 'course', e.target.value)}
                                                    />

                                                    {/* ── Scores Section ── */}
                                                    <Box sx={{ gridColumn: 'span 2' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                            <Typography variant="subtitle2" fontWeight={700}>
                                                                Exam Scores
                                                            </Typography>
                                                            <Button size="small" startIcon={<AddIcon />} onClick={() => {
                                                                const updated = [...landingData.results]
                                                                updated[index] = {
                                                                    ...updated[index],
                                                                    scores: [...(updated[index].scores || []), { exam: '', score: '' }]
                                                                }
                                                                setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                            }}>
                                                                Add Score
                                                            </Button>
                                                        </Box>
                                                        <Stack spacing={1}>
                                                            {(student.scores || []).map((entry: ScoreEntry, sIdx: number) => (
                                                                <Box key={sIdx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                    <TextField
                                                                        size="small"
                                                                        label="Exam (e.g. JEE Main)"
                                                                        sx={{ flex: 1.2 }}
                                                                        value={entry.exam}
                                                                        onChange={(e) => {
                                                                            const updated = [...landingData.results]
                                                                            const newScores = [...(updated[index].scores || [])]
                                                                            newScores[sIdx] = { ...newScores[sIdx], exam: e.target.value }
                                                                            updated[index] = { ...updated[index], scores: newScores }
                                                                            setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                                        }}
                                                                    />
                                                                    <TextField
                                                                        size="small"
                                                                        label="Score (e.g. AIR 42)"
                                                                        sx={{ flex: 1 }}
                                                                        value={entry.score}
                                                                        onChange={(e) => {
                                                                            const updated = [...landingData.results]
                                                                            const newScores = [...(updated[index].scores || [])]
                                                                            newScores[sIdx] = { ...newScores[sIdx], score: e.target.value }
                                                                            updated[index] = { ...updated[index], scores: newScores }
                                                                            setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                                        }}
                                                                    />
                                                                    <IconButton size="small" color="error" onClick={() => {
                                                                        const updated = [...landingData.results]
                                                                        updated[index] = {
                                                                            ...updated[index],
                                                                            scores: updated[index].scores.filter((_, i) => i !== sIdx)
                                                                        }
                                                                        setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                                    }}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            ))}
                                                            {(!student.scores || student.scores.length === 0) && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                                                                    No scores yet — click "Add Score" to add exam results
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </Box>

                                                    {/* ── Current Status Section ── */}
                                                    <Box sx={{ gridColumn: 'span 2' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight={700}>Current Status</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    e.g. "Selected at Google", "IIT Delhi — CS 2024"
                                                                </Typography>
                                                            </Box>
                                                            <Button size="small" startIcon={<AddIcon />} onClick={() => {
                                                                const updated = [...landingData.results]
                                                                updated[index] = {
                                                                    ...updated[index],
                                                                    currentStatus: [...(updated[index].currentStatus || []), '']
                                                                }
                                                                setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                            }}>
                                                                Add Status
                                                            </Button>
                                                        </Box>
                                                        <Stack spacing={1}>
                                                            {(student.currentStatus || []).map((status: string, stIdx: number) => (
                                                                <Box key={stIdx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                    <TextField
                                                                        size="small"
                                                                        fullWidth
                                                                        placeholder={`Status line ${stIdx + 1}`}
                                                                        value={status}
                                                                        onChange={(e) => {
                                                                            const updated = [...landingData.results]
                                                                            const newStatus = [...(updated[index].currentStatus || [])]
                                                                            newStatus[stIdx] = e.target.value
                                                                            updated[index] = { ...updated[index], currentStatus: newStatus }
                                                                            setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                                        }}
                                                                    />
                                                                    <IconButton size="small" color="error" onClick={() => {
                                                                        const updated = [...landingData.results]
                                                                        updated[index] = {
                                                                            ...updated[index],
                                                                            currentStatus: updated[index].currentStatus.filter((_, i) => i !== stIdx)
                                                                        }
                                                                        setLandingData(prev => prev ? { ...prev, results: updated } : prev)
                                                                    }}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            ))}
                                                            {(!student.currentStatus || student.currentStatus.length === 0) && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                                                                    No status lines yet — click "Add Status"
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </Box>

                                                    {/* ── Image + Bio ── (unchanged) */}
                                                    <Box sx={{ gridColumn: 'span 2' }}>
                                                        <TextField
                                                            size="small" label="Youtube Link (Optional)" fullWidth
                                                            value={student.youtubeLink || ''}
                                                            onChange={(e) => handleArrayItemChange('results', index, 'youtubeLink', e.target.value)}
                                                            sx={{ mb: 2 }}
                                                            helperText="⚠️ Only 9:16 vertical videos (YouTube Shorts) are supported."
                                                            FormHelperTextProps={{ sx: { color: 'warning.main', fontWeight: 500 } }}
                                                        />
                                                        {/* <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                                Upload Image
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Box component="img"
                                                                    src={student.image || 'https://via.placeholder.com/60?text=No+Img'}
                                                                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                                                                />
                                                                <Button variant="outlined" component="label" size="small"
                                                                    startIcon={imageUploading ? <CircularProgress size={14} /> : <CloudUploadIcon />}
                                                                    disabled={imageUploading}
                                                                >
                                                                    {imageUploading ? `${imageUploadProgress}%` : 'Upload Image'}
                                                                    <input type="file" hidden accept="image/*" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file || !file.type.startsWith('image/')) return;
                                                                        setImageUploading(true); setImageUploadProgress(0);
                                                                        try {
                                                                            const imageUrl = await uploadImageToCloudinary(file, (p) => setImageUploadProgress(p));
                                                                            handleArrayItemChange('results', index, 'image', imageUrl);
                                                                        } catch (err: any) {
                                                                            setError(`Upload failed: ${err.message}`);
                                                                        } finally {
                                                                            setImageUploading(false); setImageUploadProgress(0); e.target.value = '';
                                                                        }
                                                                    }} />
                                                                </Button>
                                                                {imageUploading && (
                                                                    <LinearProgress variant="determinate" value={imageUploadProgress}
                                                                        sx={{ mt: 1, borderRadius: 1, height: 5 }} />
                                                                )}
                                                            </Box>
                                                        </Box> */}
                                                        {/* ── Image Section with Browse + Upload ── */}
                                                        {/* ── Image Section ── */}
                                                        <Box sx={{ gridColumn: 'span 2' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                <Box
                                                                    component="img"
                                                                    src={student.image || 'https://via.placeholder.com/60?text=No+Img'}
                                                                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd', flexShrink: 0 }}
                                                                />
                                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        startIcon={<CollectionsIcon />}
                                                                        onClick={() => setBrowseModal({ open: true, targetIndex: index })}
                                                                    >
                                                                        Browse Existing
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        component="label"
                                                                        startIcon={imageUploading ? <CircularProgress size={14} /> : <CloudUploadIcon />}
                                                                        disabled={imageUploading}
                                                                    >
                                                                        {imageUploading ? `${imageUploadProgress}%` : 'Upload New'}
                                                                        <input type="file" hidden accept="image/*" onChange={async (e) => {
                                                                            const file = e.target.files?.[0]
                                                                            if (!file || !file.type.startsWith('image/')) return
                                                                            setImageUploading(true); setImageUploadProgress(0)
                                                                            try {
                                                                                const imageUrl = await uploadImageToCloudinary(file, (p) => setImageUploadProgress(p))
                                                                                handleArrayItemChange('results', index, 'image', imageUrl)
                                                                            } catch (err: any) {
                                                                                setError(`Upload failed: ${err.message}`)
                                                                            } finally {
                                                                                setImageUploading(false); setImageUploadProgress(0); e.target.value = ''
                                                                            }
                                                                        }} />
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                            {imageUploading && (
                                                                <LinearProgress variant="determinate" value={imageUploadProgress}
                                                                    sx={{ mb: 2, borderRadius: 1, height: 5 }} />
                                                            )}
                                                        </Box>
                                                        <TextField size="small" label="Testimonial / Bio" multiline rows={3} fullWidth
                                                            value={student.bio}
                                                            onChange={(e) => handleArrayItemChange('results', index, 'bio', e.target.value)}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Paper>

                                        ))}
                                        <BrowseImageModal
                                            open={browseModal?.open ?? false}
                                            onClose={() => setBrowseModal(null)}
                                            onSelect={(imageUrl) => {
                                                if (browseModal?.targetIndex !== undefined)
                                                    handleArrayItemChange('results', browseModal.targetIndex, 'image', imageUrl)
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tab 2: Course List */}
                        {activeTab === 2 && (
                            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Offered Courses</Typography>
                                            <Typography variant="body2" color="text.secondary">Manage course cards and their features.</Typography>
                                        </Box>
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addItem('courses', { courseId: '', title: '', description: '', level: '', students: 0, duration: '', features: [], gradient: '' })}>Add Course</Button>
                                    </Box>
                                    <Stack spacing={3}>
                                        {landingData?.courses?.map((course: Course, index: number) => (
                                            <Paper key={index} variant="outlined" sx={{ p: 3, borderRadius: '8px', borderLeft: '4px solid #0b2021' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                                    <Typography variant="subtitle1" fontWeight={700}>Course: {course.title || `New Course ${index + 1}`}</Typography>
                                                    <IconButton color="error" onClick={() => removeItem('courses', index)}><DeleteIcon /></IconButton>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 2 }}>
                                                    <Box sx={{ gridColumn: { xs: 'auto', md: 'span 4' } }}>
                                                        <TextField size="small" label="Course ID (Internal)" fullWidth value={course.courseId} onChange={(e) => handleArrayItemChange('courses', index, 'courseId', e.target.value)} />
                                                    </Box>
                                                    <Box sx={{ gridColumn: { xs: 'auto', md: 'span 8' } }}>
                                                        <TextField size="small" label="Course Title" fullWidth value={course.title} onChange={(e) => handleArrayItemChange('courses', index, 'title', e.target.value)} />
                                                    </Box>
                                                    <Box sx={{ gridColumn: { xs: 'auto', md: 'span 4' } }}>
                                                        <TextField size="small" label="Level (e.g. Advanced)" fullWidth value={course.level} onChange={(e) => handleArrayItemChange('courses', index, 'level', e.target.value)} />
                                                    </Box>
                                                    <Box sx={{ gridColumn: { xs: 'auto', md: 'span 4' } }}>
                                                        <TextField size="small" label="Duration (e.g. 1 Yr)" fullWidth value={course.duration} onChange={(e) => handleArrayItemChange('courses', index, 'duration', e.target.value)} />
                                                    </Box>
                                                    <Box sx={{ gridColumn: { xs: 'auto', md: 'span 4' } }}>
                                                        <TextField size="small" label="Students Enrolled" type="number" fullWidth value={course.students} onChange={(e) => handleArrayItemChange('courses', index, 'students', Number(e.target.value))} />
                                                    </Box>
                                                    <Box sx={{ gridColumn: 'span 12' }}>
                                                        <TextField size="small" label="Description" multiline rows={2} fullWidth value={course.description} onChange={(e) => handleArrayItemChange('courses', index, 'description', e.target.value)} sx={{ mb: 2 }} />

                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Theme Gradient</InputLabel>
                                                            <Select
                                                                value={course.gradient || GRADIENT_PRESETS[0].value}
                                                                label="Theme Gradient"
                                                                onChange={(e) => handleArrayItemChange('courses', index, 'gradient', e.target.value)}
                                                            >
                                                                {GRADIENT_PRESETS.map((preset) => (
                                                                    <MenuItem key={preset.value} value={preset.value}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                            <Box sx={{ width: 24, height: 24, borderRadius: 1, background: preset.value, border: '1px solid #ddd' }} />
                                                                            {preset.label}
                                                                        </Box>
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>

                                                    {/* Course Features */}
                                                    <Box sx={{ gridColumn: 'span 12', mt: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight={600}>Key Features</Typography>
                                                            <Button size="small" startIcon={<AddIcon />} onClick={() => addFeature(index)}>Add Feature</Button>
                                                        </Box>
                                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                                                            {course.features?.map((feature: string, fIndex: number) => (
                                                                <Box key={fIndex} sx={{ display: 'flex', gap: 1 }}>
                                                                    <TextField size="small" fullWidth value={feature} onChange={(e) => handleFeatureChange(index, fIndex, e.target.value)} />
                                                                    <IconButton size="small" color="error" onClick={() => removeFeature(index, fIndex)}><DeleteIcon /></IconButton>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tab 3: Faculty Team */}
                        {activeTab === 3 && (
                            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                <CardContent sx={{ p: 3 }}>

                                    {/* Faculty Stats Section */}
                                    <Box sx={{ mb: 5, pb: 4, borderBottom: '1px solid #eaeaea' }}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" fontWeight={700}>Faculty Page Stats</Typography>
                                            <Typography variant="body2" color="text.secondary">The 4 dynamic stats shown at the top of the Faculty section.</Typography>
                                        </Box>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                            {(() => {

                                                const statsArray = landingData?.facultyStats ?? defaultStats;

                                                return statsArray.map((stat, idx) => (
                                                    <Paper key={`fstat-${idx}`} variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#555' }}>Stat Box #{idx + 1}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            {/* <TextField
                                                                size="small"
                                                                label="Value (e.g. 6+)"
                                                                sx={{ width: '40%' }}
                                                                value={stat.value}
                                                                onChange={(e) => {
                                                                    const newStats = [...statsArray];
                                                                    newStats[idx] = { ...newStats[idx], value: e.target.value };
                                                                    setLandingData(prev => prev ? ({ ...prev, facultyStats: newStats }) : prev);
                                                                }}
                                                            /> */}
                                                            <TextField
                                                                value={stat.value}
                                                                onChange={(e) => {
                                                                    const newStats = statsArray.map((s, i) =>   // ← use .map, safer than spread+index
                                                                        i === idx ? { ...s, value: e.target.value } : s
                                                                    );
                                                                    setLandingData(prev => prev ? { ...prev, facultyStats: newStats } : prev);
                                                                }}
                                                            />
                                                            <TextField
                                                                size="small"
                                                                label="Label (e.g. Expert Educators)"
                                                                sx={{ width: '60%' }}
                                                                value={stat.label}
                                                                onChange={(e) => {
                                                                    const newStats = [...statsArray];
                                                                    newStats[idx] = { ...newStats[idx], label: e.target.value };
                                                                    setLandingData(prev => prev ? ({ ...prev, facultyStats: newStats }) : prev);
                                                                }}
                                                            />
                                                        </Box>
                                                    </Paper>
                                                ));
                                            })()}
                                        </Box>
                                    </Box>

                                    {/* Faculty Members Array */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Our Faculty</Typography>
                                            <Typography variant="body2" color="text.secondary">Manage teacher profiles and backgrounds.</Typography>
                                        </Box>
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addItem('faculty', { name: '', title: '', subject: '', experience: '', qualification: '', specialty: '', initials: '', image: '', bio: '' })}>Add Teacher</Button>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                        {landingData?.faculty?.map((member: FacultyMember, index: number) => (
                                            <Paper key={index} variant="outlined" sx={{ p: 3, borderRadius: '8px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="subtitle1" fontWeight={700}>Faculty: {member.name || `New Member ${index + 1}`}</Typography>
                                                    <IconButton color="error" onClick={() => removeItem('faculty', index)}><DeleteIcon /></IconButton>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                                    <TextField size="small" label="Full Name" fullWidth value={member.name} onChange={(e) => handleArrayItemChange('faculty', index, 'name', e.target.value)} />
                                                    <TextField size="small" label="Job Title" fullWidth value={member.title} onChange={(e) => handleArrayItemChange('faculty', index, 'title', e.target.value)} />
                                                    <TextField size="small" label="Subject" fullWidth value={member.subject} onChange={(e) => handleArrayItemChange('faculty', index, 'subject', e.target.value)} />
                                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                                        <TextField size="small" label="Experience" fullWidth value={member.experience} onChange={(e) => handleArrayItemChange('faculty', index, 'experience', e.target.value)} />
                                                        <TextField size="small" label="Initials (Fallback)" fullWidth value={member.initials} onChange={(e) => handleArrayItemChange('faculty', index, 'initials', e.target.value)} />
                                                    </Box>
                                                    <Box sx={{ gridColumn: 'span 2' }}>
                                                        <TextField size="small" label="Qualification" fullWidth value={member.qualification} onChange={(e) => handleArrayItemChange('faculty', index, 'qualification', e.target.value)} sx={{ mb: 2 }} />
                                                        <TextField size="small" label="Expertise Area" fullWidth value={member.specialty} onChange={(e) => handleArrayItemChange('faculty', index, 'specialty', e.target.value)} sx={{ mb: 2 }} />
                                                        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                                Upload Photo
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Box
                                                                    component="img"
                                                                    src={member.image || 'https://via.placeholder.com/60?text=No+Img'}
                                                                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', border: '2px solid #e0e0e0' }}
                                                                />
                                                                <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadIcon />}>
                                                                    {imageUploading ? `${imageUploadProgress}%` : 'Upload Photo'}
                                                                    <input type="file" hidden accept="image/*" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        if (!file.type.startsWith('image/')) {
                                                                            setError('Please select a valid image file');
                                                                            return;
                                                                        }

                                                                        setImageUploading(true);
                                                                        setImageUploadProgress(0);

                                                                        try {
                                                                            const imageUrl = await uploadImageToCloudinary(file, (progress) => {
                                                                                setImageUploadProgress(progress);
                                                                            });
                                                                            handleArrayItemChange('faculty', index, 'image', imageUrl);
                                                                            setError(null);
                                                                        } catch (err: any) {
                                                                            setError(`Upload failed: ${err.message}`);
                                                                        } finally {
                                                                            setImageUploading(false);
                                                                            setImageUploadProgress(0);
                                                                            e.target.value = '';
                                                                        }
                                                                    }} />
                                                                </Button>
                                                                {imageUploading && (
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={imageUploadProgress}
                                                                        sx={{ mt: 1, borderRadius: 1, height: 5 }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                        <TextField size="small" label="Detailed Bio" multiline rows={3} fullWidth value={member.bio} onChange={(e) => handleArrayItemChange('faculty', index, 'bio', e.target.value)} />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tab 4: FAQs */}
                        {activeTab === 4 && (
                            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>FAQ Management</Typography>
                                            <Typography variant="body2" color="text.secondary">Questions and answers for student support.</Typography>
                                        </Box>
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addItem('faqs', { q: '', a: '' })}>Add FAQ</Button>
                                    </Box>
                                    <Stack spacing={2}>
                                        {landingData?.faqs?.map((item: FAQ, index: number) => (
                                            <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: '8px', bgcolor: '#fcfcfc' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="subtitle2" fontWeight={700}>Q: {item.q ? (item.q.length > 40 ? `${item.q.substring(0, 40)}...` : item.q) : `New FAQ ${index + 1}`}</Typography>
                                                    <IconButton color="error" onClick={() => removeItem('faqs', index)}><DeleteIcon /></IconButton>
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        label="Question"
                                                        fullWidth
                                                        sx={{ mb: 2 }}
                                                        value={item.q}
                                                        onChange={(e) => handleArrayItemChange('faqs', index, 'q', e.target.value)}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        label="Answer"
                                                        multiline
                                                        rows={2}
                                                        fullWidth
                                                        value={item.a}
                                                        onChange={(e) => handleArrayItemChange('faqs', index, 'a', e.target.value)}
                                                    />
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tab 6: Gallery */}
                        {activeTab === 5 && (
                            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Photo Gallery</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Upload photos — displayed as a collage. Each image keeps its original size and ratio.
                                            </Typography>
                                        </Box>

                                        {/* Upload Button */}
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={imageUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                            disabled={imageUploading}
                                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                                        >
                                            {imageUploading ? `Uploading… ${imageUploadProgress}%` : 'Upload Photos'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                multiple
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (!files.length) return;

                                                    setImageUploading(true);
                                                    setImageUploadProgress(0);

                                                    try {
                                                        const uploaded: GalleryImage[] = [];
                                                        for (let i = 0; i < files.length; i++) {
                                                            const file = files[i];
                                                            if (!file.type.startsWith('image/')) continue;
                                                            const url = await uploadImageToCloudinary(file, (progress) => {
                                                                // Show overall progress across all files
                                                                const overall = Math.round(((i / files.length) * 100) + (progress / files.length));
                                                                setImageUploadProgress(overall);
                                                            });
                                                            uploaded.push({ url });
                                                        }
                                                        const existing = landingData?.gallery || [];
                                                        setLandingData(prev => prev ? {
                                                            ...prev,
                                                            gallery: [...existing, ...uploaded]
                                                        } : prev);
                                                        setError(null);
                                                    } catch (err: any) {
                                                        setError(`Upload failed: ${err.message}`);
                                                    } finally {
                                                        setImageUploading(false);
                                                        setImageUploadProgress(0);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </Box>

                                    {/* Upload progress bar */}
                                    {imageUploading && (
                                        <LinearProgress
                                            variant="determinate"
                                            value={imageUploadProgress}
                                            sx={{ mb: 3, borderRadius: 1, height: 6 }}
                                        />
                                    )}

                                    {/* Empty state */}
                                    {(!landingData?.gallery || landingData.gallery.length === 0) && !imageUploading && (
                                        <Box sx={{
                                            border: '2px dashed rgba(10,37,64,0.2)',
                                            borderRadius: '12px',
                                            p: 6,
                                            textAlign: 'center',
                                        }}>
                                            <CloudUploadIcon sx={{ fontSize: 40, color: 'rgba(10,37,64,0.2)', mb: 1.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                No photos yet — click "Upload Photos" to add some
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Masonry Collage Grid */}
                                    {landingData?.gallery && landingData.gallery.length > 0 && (() => {
                                        const cols: GalleryImage[][] = [[], [], []]
                                        landingData.gallery.forEach((img, i) => cols[i % 3].push(img))

                                        return (
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                                                gap: '8px',
                                                alignItems: 'start',
                                            }}>
                                                {cols.map((col, colIdx) => (
                                                    <Box key={colIdx} sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {col.map((img, imgIdx) => {
                                                            const realIdx = imgIdx * 3 + colIdx  // recover original index
                                                            return (
                                                                <Box
                                                                    key={realIdx}
                                                                    sx={{
                                                                        position: 'relative',
                                                                        borderRadius: '10px',
                                                                        overflow: 'hidden',
                                                                        lineHeight: 0,
                                                                        '&:hover .gallery-delete': { opacity: 1 },
                                                                    }}
                                                                >
                                                                    <Box
                                                                        component="img"
                                                                        src={img.url}
                                                                        alt=""
                                                                        sx={{
                                                                            width: '100%',
                                                                            height: 'auto',        // ✅ never crop
                                                                            display: 'block',
                                                                        }}
                                                                    />
                                                                    {/* Delete overlay */}
                                                                    <Box
                                                                        className="gallery-delete"
                                                                        sx={{
                                                                            position: 'absolute', inset: 0,
                                                                            bgcolor: 'rgba(10,37,64,0.5)',
                                                                            opacity: 0,
                                                                            transition: 'opacity 0.2s ease',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                const updated = landingData.gallery.filter((_, i) => i !== realIdx)
                                                                                setLandingData(prev => prev ? { ...prev, gallery: updated } : prev)
                                                                            }}
                                                                            sx={{
                                                                                bgcolor: 'rgba(255,255,255,0.92)',
                                                                                color: '#e53935',
                                                                                '&:hover': { bgcolor: '#fff' },
                                                                                borderRadius: '8px',
                                                                            }}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Box>
                                                            )
                                                        })}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )
                                    })()}
                                </CardContent>
                            </Card>
                        )}

                        {/* Tab 5: Footer & Social */}
                        {activeTab === 6 && (
                            <Stack spacing={4}>

                                {/* Card 1: Contact Info */}
                                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Contact Information</Typography>
                                        <Stack spacing={3}>
                                            <TextField
                                                label="Primary Email"
                                                fullWidth
                                                value={landingData?.footer?.email || ''}
                                                onChange={(e) => handleNestedChange('footer.email', e.target.value)}
                                            />
                                            <TextField
                                                label="Physical Address"
                                                fullWidth
                                                multiline
                                                rows={2}
                                                value={landingData?.footer?.address || ''}
                                                onChange={(e) => handleNestedChange('footer.address', e.target.value)}
                                            />
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight={600}>Phone Numbers</Typography>
                                                    <Button size="small" startIcon={<AddIcon />} onClick={() => {
                                                        const updatedPhones = [...(landingData.footer?.phones || []), ''];
                                                        handleNestedChange('footer.phones', updatedPhones);
                                                    }}>Add Phone</Button>
                                                </Box>
                                                <Stack spacing={1}>
                                                    {landingData?.footer?.phones?.map((phone: string, idx: number) => (
                                                        <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                                                            <TextField size="small" fullWidth placeholder="e.g. +91 98765 43210" value={phone} onChange={(e) => {
                                                                const updatedPhones = [...landingData.footer.phones];
                                                                updatedPhones[idx] = e.target.value;
                                                                handleNestedChange('footer.phones', updatedPhones);
                                                            }} />
                                                            <IconButton size="small" color="error" onClick={() => {
                                                                if (landingData) {
                                                                    const updatedPhones = landingData.footer.phones.filter((_, i) => i !== idx);
                                                                    handleNestedChange('footer.phones', updatedPhones);
                                                                }
                                                            }}><DeleteIcon /></IconButton>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Card 3: Social & Copyright */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 4 }}>
                                    <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight={700} gutterBottom>Social Media Links</Typography>
                                            <Stack spacing={2}>
                                                <TextField label="Facebook URL" size="small" value={landingData?.footer?.socialLinks?.facebook || ''} onChange={(e) => handleNestedChange('footer.socialLinks.facebook', e.target.value)} />
                                                <TextField label="Instagram URL" size="small" value={landingData?.footer?.socialLinks?.instagram || ''} onChange={(e) => handleNestedChange('footer.socialLinks.instagram', e.target.value)} />
                                                <TextField label="LinkedIn URL" size="small" value={landingData?.footer?.socialLinks?.linkedin || ''} onChange={(e) => handleNestedChange('footer.socialLinks.linkedin', e.target.value)} />
                                                <TextField label="Twitter/X URL" size="small" value={landingData?.footer?.socialLinks?.twitter || ''} onChange={(e) => handleNestedChange('footer.socialLinks.twitter', e.target.value)} />
                                            </Stack>
                                        </CardContent>
                                    </Card>

                                    <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight={700} gutterBottom>Copyright</Typography>
                                            <TextField
                                                label="Copyright Text"
                                                fullWidth
                                                multiline
                                                rows={3}
                                                helperText='Shown at the bottom of the footer. e.g. "© 2025 JJ Institute..."'
                                                value={landingData?.footer?.copyrightText || ''}
                                                onChange={(e) => handleNestedChange('footer.copyrightText', e.target.value)}
                                            />
                                        </CardContent>
                                    </Card>
                                </Box>

                            </Stack>
                        )}




                        {/* Publish Confirmation Dialog */}
                        <Dialog
                            open={publishDialogOpen}
                            onClose={() => setPublishDialogOpen(false)}
                            PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
                        >
                            <DialogTitle sx={{ fontWeight: 700, color: '#0b2021' }}>Publish Changes?</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    This will overwrite the live landing page for all visitors. Are you sure you want to publish your changes?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                                <Button
                                    onClick={() => setPublishDialogOpen(false)}
                                    variant="outlined"
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    sx={{
                                        bgcolor: '#0b2021',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#1a3a3a' }
                                    }}
                                >
                                    Yes, Publish
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Snackbar
                            open={success}
                            autoHideDuration={6000}
                            onClose={() => setSuccess(false)}
                        >
                            <Alert severity="success" variant="filled" sx={{ width: '100%' }}>Landing page updated successfully!</Alert>
                        </Snackbar>
                    </Container>
                </Box>
            )}

            {/* Draggable Divider (Hidden on Mobile) */}
            {isEditing && (
                <Box
                    onMouseDown={handleMouseDown}
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: '8px',
                        cursor: 'col-resize',
                        bgcolor: isDragging ? '#c47a3a' : '#ddd',
                        transition: 'background-color 0.2s',
                        zIndex: 10,
                        '&:hover': {
                            bgcolor: '#c47a3a'
                        }
                    }}
                />
            )}

            {/* Right Side: Live Preview */}
            <Box sx={{
                display: { xs: isEditing ? 'none' : 'block', md: 'block' },
                width: { xs: '100%', md: isEditing ? `calc(${100 - leftWidth}% - 8px)` : '100%' },
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#fff'
            }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {/* Scale down slightly more when editing to fit more content */}
                    <Box sx={{
                        transform: isEditing ? 'scale(0.85)' : 'scale(1)',
                        transformOrigin: 'top center',
                        width: isEditing ? '117.6%' : '100%', // 100 / 0.85 = 117.6%
                        transition: 'all 0.3s ease'
                    }}>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            {/* Disabled pointer events on header to prevent navigation away in preview */}
                            <Box sx={{ pointerEvents: 'none', position: 'relative', zIndex: 1000 }}>
                                <Header />
                            </Box>

                            <Hero data={landingData?.hero} />
                            <Results data={landingData?.results} />
                            <Courses data={landingData?.courses} />
                            <Faculty data={landingData?.faculty} />
                            <FAQ data={landingData?.faqs} />
                            <Gallery data={landingData?.gallery} />
                            <Footer data={landingData?.footer} />
                        </ThemeProvider>
                    </Box>
                </Box>

                {/* Floating Edit Button (Only visible when NOT editing) */}
                {!isEditing && (
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: 'auto', sm: 24 },
                        bottom: { xs: 24, sm: 'auto' },
                        left: { xs: '50%', sm: 24 },
                        transform: { xs: 'translateX(-50%)', sm: 'none' },
                        zIndex: 100
                    }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => setIsEditing(true)}
                            sx={{
                                bgcolor: '#0b2021',
                                color: 'white',
                                borderRadius: 5,
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1.25, sm: 1.5 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 700,
                                boxShadow: '0 8px 24px rgba(11, 32, 33, 0.4)',
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                    bgcolor: '#1a3a3a',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            Edit Landing Page
                        </Button>
                    </Box>
                )}

                {isEditing && (
                    <Box sx={{
                        position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 2, py: 0.5, borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, pointerEvents: 'none', zIndex: 2000
                    }}>
                        Live Preview
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AdminLandingPage;
