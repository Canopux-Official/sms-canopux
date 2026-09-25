import React, { useEffect, useState } from 'react';
import { 
  Typography, Avatar, Button, TextField, Box, Stack, Chip, Divider, 
  CircularProgress, Alert, Snackbar 
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';

import { 
  ProfileHeader, SectionCard, LabelText, ValueText, Badge, ActionButton 
} from './StudentProfile.styles';

import { getStudent, changePassword } from '../../../api/apiFunctions'; 

// --- Interfaces matching Backend Data Structure ---

interface INamedEntity {
  _id: string;
  name: string;
}

interface ISubject {
  _id: string;
  name: string;
  stream?: string; 
}

interface IStudentProfile {
  _id: string;
  name: string;
  profilePhoto?: string;
  dob: string;
  phoneNumber: string;
  enrollmentNumber?: string;
  parentPhoneNumber: string;
  email: string;
  currentClass: string;
  stream?: INamedEntity | null; 
  targetExams: INamedEntity[];  
  enrolledSubjects: ISubject[]; 
  academicSession: string;
  isActive: boolean;
  admissionDate: string;
}

const StudentProfile: React.FC = () => {
  // Data State
  const [student, setStudent] = useState<IStudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Password State
  const [passwordData, setPasswordData] = useState({ current: '', new: '' });
  const [passLoading, setPassLoading] = useState(false);
  
  // UI State
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  // --- Fetch Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getStudent(); 
        // console.log(response)
        if (response.success && response.data) {
          setStudent(response.data as IStudentProfile);
        } else {
          setError("Failed to load profile data.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- Handlers ---

  const handlePasswordUpdate = async () => {
    if (!passwordData.current || !passwordData.new) {
        setToast({ open: true, message: "Please fill in both password fields", severity: 'error' });
        return;
    }

    setPassLoading(true);
    try {
        const response = await changePassword(passwordData);
        
        if (response.success) {
            setToast({ open: true, message: "Password updated successfully!", severity: 'success' });
            setPasswordData({ current: '', new: '' }); // Clear inputs
        } else {
            setToast({ open: true, message: response.message || "Failed to update password", severity: 'error' });
        }
    } catch (err) {
        console.error(err);
        setToast({ open: true, message: "An unexpected error occurred.", severity: 'error' });
    } finally {
        setPassLoading(false);
    }
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  // --- Helpers ---

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    } catch { return 'Invalid Date'; }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    try {
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch { return 0; }
  };

  const calculateTenure = (admissionDate: string) => {
    if (!admissionDate) return 0;
    try {
        const start = new Date(admissionDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    } catch { return 0; }
  };

  // --- Render ---

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box p={4}>
        <Alert severity="error">{error || "No student data found."}</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="lg">
      {/* HEADER SECTION */}
      <ProfileHeader>
        <Avatar 
            src={student.profilePhoto || undefined}
            sx={{ width: 100, height: 100, fontSize: 40, bgcolor: 'primary.main', color: '#fff', border: '4px solid #fff', boxShadow: 2 }}
        >
          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
        </Avatar>
        <Box flex={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
             <Typography variant="h4" fontWeight={700} textTransform="capitalize">{student.name}</Typography>
             <Badge colorType={student.isActive ? 'active' : 'inactive'}>
                 {student.isActive ? 'Active Student' : 'Inactive'}
             </Badge>
          </Stack>
          
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Class {student.currentClass} • {student.stream?.name || 'General'} Stream
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
             Member for {calculateTenure(student.admissionDate)} days
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} disabled>
            Edit Profile
        </Button>
      </ProfileHeader>

      <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={3}>
        
        {/* LEFT COLUMN: INFO */}
        <Box flex={2}>
          <SectionCard elevation={0}>
            <Typography variant="h6" fontWeight={700} mb={3} color="primary">Basic Identity</Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
              <Box flex={1}>
                <LabelText>Enrollment Number (Login ID)</LabelText>
                <ValueText sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {student.enrollmentNumber || 'N/A'}
                </ValueText>
              </Box>
              <Box flex={1}>
                <LabelText>Phone Number</LabelText>
                <ValueText>{student.phoneNumber}</ValueText>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
               <Box flex={1}>
                <LabelText>Email Address</LabelText>
                <ValueText>{student.email || 'N/A'}</ValueText>
              </Box>
               <Box flex={1}>
                <LabelText>Parent Phone</LabelText>
                <ValueText>{student.parentPhoneNumber || 'N/A'}</ValueText>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
              <Box flex={1}>
                <LabelText>Date of Birth</LabelText>
                <ValueText>
                    {formatDate(student.dob)} ({calculateAge(student.dob)} years)
                </ValueText>
              </Box>
            </Stack>
            
            <Box mt={4} mb={3}><Divider /></Box>
            
            <Typography variant="h6" fontWeight={700} mb={3} color="primary">Academic Details</Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
              <Box flex={1}>
                <LabelText>Current Session</LabelText>
                <ValueText>{student.academicSession}</ValueText>
              </Box>
               <Box flex={1}>
                <LabelText>Admission Date</LabelText>
                <ValueText>{formatDate(student.admissionDate)}</ValueText>
              </Box>
            </Stack>

            <Box mb={3}>
                <LabelText>Target Exams</LabelText>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {student.targetExams && student.targetExams.length > 0 ? (
                    student.targetExams.map((ex) => (
                        <Chip 
                            key={ex._id} 
                            label={ex.name} 
                            color="primary" 
                            variant="outlined" 
                            size="small"
                        />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">None Selected</Typography>
                  )}
                </Stack>
            </Box>

            <Box>
                <LabelText>Enrolled Subjects</LabelText>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {student.enrolledSubjects && student.enrolledSubjects.length > 0 ? (
                    student.enrolledSubjects.map((sub) => (
                        <Chip 
                            key={sub._id} 
                            label={sub.name}
                            sx={{ bgcolor: '#f1f8e9', color: '#33691e', fontWeight: 600, border: '1px solid #dcedc8' }} 
                        />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No subjects enrolled</Typography>
                  )}
                </Stack>
            </Box>

          </SectionCard>
        </Box>

        {/* RIGHT COLUMN: SECURITY */}
        <Box flex={1}>
          <SectionCard elevation={0}>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <LockResetIcon color="primary" /> 
              <Typography variant="h6" fontWeight={700}>Security</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                Keep your account secure by using a strong password.
            </Typography>
            
            <Stack spacing={3}>
              <TextField 
                label="Current Password" type="password" size="small" fullWidth 
                value={passwordData.current} 
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
              />
              <TextField 
                label="New Password" type="password" size="small" fullWidth 
                value={passwordData.new} 
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
              />
              <ActionButton 
                fullWidth 
                onClick={handlePasswordUpdate} 
                disabled={passLoading || !passwordData.current || !passwordData.new}
              >
                  {passLoading ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
              </ActionButton>
            </Stack>
          </SectionCard>
        </Box>

      </Box>

      {/* NOTIFICATION TOAST */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentProfile;