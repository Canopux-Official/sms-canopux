import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    CircularProgress,
    Alert,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Stack,
    InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { getAllAdmins, updateAdminPermissions, addAdmin, deleteAdmin, updateAdminDetails } from '../../api/apiFunctions';

interface AdminPermissions {
    students: boolean;
    streams: boolean;
    targetExams: boolean;
    subjects: boolean;
    session: boolean;
    upload: boolean;
    notice: boolean;
    attendance: boolean;
    landingPage: boolean;
}

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    permissions?: AdminPermissions;
}

const permissionLabels: Record<keyof AdminPermissions, string> = {
    students: "Students Directory",
    streams: "Streams Manager",
    targetExams: "Target Exams Manager",
    subjects: "Subjects Manager",
    session: "Session Manager",
    upload: "Upload Material",
    notice: "Add Notice",
    attendance: "Attendance",
    landingPage: "Landing Page Manager"
};

const AdminAccessControl: React.FC = () => {
    const queryClient = useQueryClient();

    // Add Admin State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '', email: '', phoneNumber: '', password: '', role: 'admin'
    });
    const [showPasswordAdd, setShowPasswordAdd] = useState(false);

    // Edit Admin State
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState({
        id: '', name: '', email: '', phoneNumber: '', password: '', role: 'admin'
    });
    const [showPasswordEdit, setShowPasswordEdit] = useState(false);

    // React Query: Fetch Admins
    const { data: adminsResponse, isLoading: loading, isError } = useQuery({
        queryKey: ['admins'],
        queryFn: getAllAdmins
    });

    const admins = adminsResponse?.success && adminsResponse?.data
        ? (adminsResponse.data as { admins: AdminUser[] }).admins || []
        : [];
    const error = isError ? "An error occurred while fetching admins." : (adminsResponse && !adminsResponse.success ? adminsResponse.message : null);

    // React Query: Mutations
    const togglePermissionMutation = useMutation({
        mutationFn: (params: { adminId: string, updatedPermissions: AdminPermissions }) => updateAdminPermissions(params.adminId, params.updatedPermissions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
        }
    });

    const addAdminMutation = useMutation({
        mutationFn: (data: typeof newAdmin & { permissions?: AdminPermissions }) => addAdmin(data),
        onSuccess: (res) => {
            if (res.success) {
                setOpenAddDialog(false);
                setNewAdmin({ name: '', email: '', phoneNumber: '', password: '', role: 'admin' });
                queryClient.invalidateQueries({ queryKey: ['admins'] });
            } else {
                alert(res.message || "Failed to add admin");
            }
        },
        onError: () => alert("An error occurred adding the admin.")
    });

    const editAdminMutation = useMutation({
        mutationFn: (params: { id: string, data: Partial<typeof editingAdmin> }) => updateAdminDetails(params.id, params.data),
        onSuccess: (res) => {
            if (res.success) {
                setOpenEditDialog(false);
                setEditingAdmin({ id: '', name: '', email: '', phoneNumber: '', password: '', role: 'admin' });
                queryClient.invalidateQueries({ queryKey: ['admins'] });
            } else {
                alert(res.message || "Failed to edit admin");
            }
        },
        onError: () => alert("An error occurred editing the admin.")
    });

    const deleteAdminMutation = useMutation({
        mutationFn: (id: string) => deleteAdmin(id),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['admins'] });
            } else {
                alert(res.message || "Failed to delete admin");
            }
        },
        onError: () => alert("An error occurred deleting the admin.")
    });

    const handleTogglePermission = async (adminId: string, currentPermissions: AdminPermissions | undefined, key: keyof AdminPermissions, adminRole: string) => {
        if (adminRole === 'superadmin') return; // Cannot toggle superadmin permissions

        const updatedPermissions = {
            ...(currentPermissions || {
                students: false, streams: false, targetExams: false,
                subjects: false, session: false, upload: false,
                notice: false, attendance: false, landingPage: false
            }),
            [key]: currentPermissions ? !currentPermissions[key] : true
        };

        togglePermissionMutation.mutate({ adminId, updatedPermissions });
    };

    const handleAddAdminSubmit = async () => {
        const adminDataToSubmit: typeof newAdmin & { permissions?: AdminPermissions } = { ...newAdmin };
        if (adminDataToSubmit.role === 'superadmin') {
            adminDataToSubmit.permissions = {
                students: true, streams: true, targetExams: true,
                subjects: true, session: true, upload: true,
                notice: true, attendance: true, landingPage: true
            };
        }
        
        // Final validation check before mutation
        if (newAdmin.phoneNumber.length !== 10) {
            alert("Phone number must be exactly 10 digits");
            return;
        }
        
        addAdminMutation.mutate(adminDataToSubmit);
    };

    const handleEditClick = (admin: AdminUser) => {
        setEditingAdmin({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            password: '', // blank unless they want to change it
            role: admin.role
        });
        setOpenEditDialog(true);
    };

    const handleEditAdminSubmit = async () => {
        const adminDataToSubmit: Partial<typeof editingAdmin> = {
            name: editingAdmin.name,
            email: editingAdmin.email,
            phoneNumber: editingAdmin.phoneNumber,
            role: editingAdmin.role
        };
        // Only send password if it was filled out
        if (editingAdmin.password.trim() !== '') {
            adminDataToSubmit.password = editingAdmin.password;
        }

        // Final validation check before mutation
        if (editingAdmin.phoneNumber.length !== 10) {
            alert("Phone number must be exactly 10 digits");
            return;
        }

        editAdminMutation.mutate({ id: editingAdmin.id, data: adminDataToSubmit });
    };

    const handleDeleteAdmin = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete administrator ${name}?`)) return;
        deleteAdminMutation.mutate(id);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#0b2021' }}>
                        Admin Access Control
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Manage feature permissions and accounts for standard administrators.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ bgcolor: '#0b2021', '&:hover': { bgcolor: '#1a3a3a' } }}
                >
                    Create Admin
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                <TableRow>
                                    <TableCell><strong>Administrator</strong></TableCell>
                                    <TableCell><strong>Contact</strong></TableCell>
                                    <TableCell><strong>Permissions</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {admins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">No standard admins found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    admins.map((admin) => (
                                        <TableRow key={admin._id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>{admin.name}</Typography>
                                                <Chip
                                                    label={admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                                    size="small"
                                                    color={admin.role === 'superadmin' ? "error" : "primary"}
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{admin.email}</Typography>
                                                <Typography variant="body2" color="text.secondary">{admin.phoneNumber}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                    {Object.keys(permissionLabels).map((key) => {
                                                        const permKey = key as keyof AdminPermissions;
                                                        const isSuperAdmin = admin.role === 'superadmin';
                                                        const isChecked = isSuperAdmin ? true : (admin.permissions ? admin.permissions[permKey] : false);
                                                        return (
                                                            <Box
                                                                key={permKey}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    bgcolor: isChecked ? 'rgba(6, 100, 102, 0.08)' : 'rgba(0,0,0,0.02)',
                                                                    borderRadius: 2,
                                                                    px: 1,
                                                                    border: '1px solid',
                                                                    borderColor: isChecked ? 'rgba(6, 100, 102, 0.2)' : 'transparent',
                                                                    minWidth: 180,
                                                                    opacity: isSuperAdmin ? 0.7 : 1
                                                                }}
                                                            >
                                                                <Switch
                                                                    size="small"
                                                                    checked={isChecked}
                                                                    disabled={isSuperAdmin}
                                                                    onChange={() => handleTogglePermission(admin._id, admin.permissions, permKey, admin.role)}
                                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                                />
                                                                <Typography variant="body2" sx={{ ml: 1, fontWeight: isChecked ? 600 : 400, color: isChecked ? '#0b2021' : 'text.secondary' }}>
                                                                    {permissionLabels[permKey]}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton color="primary" onClick={() => handleEditClick(admin)} title="Edit Admin">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDeleteAdmin(admin._id, admin.name)} title="Delete Admin">
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add Admin Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Register New Administrator</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={newAdmin.name}
                            onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={newAdmin.email}
                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={newAdmin.phoneNumber}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setNewAdmin({ ...newAdmin, phoneNumber: val });
                            }}
                            error={newAdmin.phoneNumber.length > 0 && newAdmin.phoneNumber.length !== 10}
                            helperText={newAdmin.phoneNumber.length > 0 && newAdmin.phoneNumber.length !== 10 ? "Phone number must be 10 digits" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>+91</Typography>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Initial Password"
                            type={showPasswordAdd ? 'text' : 'password'}
                            fullWidth
                            value={newAdmin.password}
                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPasswordAdd(!showPasswordAdd)}
                                            edge="end"
                                        >
                                            {showPasswordAdd ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            select
                            label="Role"
                            value={newAdmin.role}
                            onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="superadmin">Super Admin</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleAddAdminSubmit}
                        variant="contained"
                        disabled={
                            addAdminMutation.isPending || 
                            !newAdmin.name || 
                            !newAdmin.email || 
                            newAdmin.phoneNumber.length !== 10 || 
                            !newAdmin.password
                        }
                        sx={{ bgcolor: '#0b2021', '&:hover': { bgcolor: '#1a3a3a' } }}
                    >
                        {addAdminMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Edit Administrator</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={editingAdmin.name}
                            onChange={e => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={editingAdmin.email}
                            onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={editingAdmin.phoneNumber}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setEditingAdmin({ ...editingAdmin, phoneNumber: val });
                            }}
                            error={editingAdmin.phoneNumber.length > 0 && editingAdmin.phoneNumber.length !== 10}
                            helperText={editingAdmin.phoneNumber.length > 0 && editingAdmin.phoneNumber.length !== 10 ? "Phone number must be 10 digits" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>+91</Typography>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="New Password (Leave blank to keep unchanged)"
                            type={showPasswordEdit ? 'text' : 'password'}
                            fullWidth
                            defaultValue=""
                            onChange={e => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                                            edge="end"
                                        >
                                            {showPasswordEdit ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            select
                            label="Role"
                            value={editingAdmin.role}
                            onChange={e => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="superadmin">Super Admin</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleEditAdminSubmit}
                        variant="contained"
                        disabled={
                            editAdminMutation.isPending || 
                            !editingAdmin.name || 
                            !editingAdmin.email || 
                            editingAdmin.phoneNumber.length !== 10
                        }
                        sx={{ bgcolor: '#0b2021', '&:hover': { bgcolor: '#1a3a3a' } }}
                    >
                        {editAdminMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default AdminAccessControl;
