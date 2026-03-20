import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Collapse,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { loginStyles } from './LoginPage.styles';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JIS from '../../assets/logo/JIS Logo.png';

// Import functions from your API file
import { getLoggedInUser, verifyOtp, resendOtp, validateToken } from '../../api/apiFunctions';
import SEO from '../../components/SEO';

const LoginPage = () => {
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Timer State
  const [timer, setTimer] = useState(90);
  const [canResend, setCanResend] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phoneNumber: '',
    currentClass: '',
    enrollmentNumber: '',
    password: '',
    role: 'student' as 'student' | 'admin' | 'superadmin'
  });

  const [otp, setOtp] = useState('');

  // --- ADMIN LOGIC ---
  const isAdmin = formData.role === 'admin' || formData.role === 'superadmin';

  // --- AUTO-LOGIN IF VALID TOKEN ---
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setLoading(true);
        const { isValid, role } = await validateToken();
        if (isValid) {
          if (role === 'admin' || role === 'superadmin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    if (prop === 'phoneNumber') {
      value = value.replace(/[^0-9]/g, '');

      if (value.length > 10) {
        return;
      }
    }

    setFormData({ ...formData, [prop]: value });

    if (errors[prop]) {
      setErrors({ ...errors, [prop]: '' });
    }
  };

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: 'student' | 'admin' | 'superadmin' | null
  ) => {
    if (newRole !== null) {
      setFormData({ ...formData, role: newRole });
    }
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const { phoneNumber, password, enrollmentNumber } = formData;

    // 1. Phone Number Validation (Admin Only)
    if (isAdmin) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!phoneRegex.test(phoneNumber)) {
        newErrors.phoneNumber = "Enter a valid 10-digit mobile number";
      }
    } else {
      // Student Validations
      if (!enrollmentNumber) {
        newErrors.enrollmentNumber = "Enrollment Number is required";
      } else if (!enrollmentNumber.startsWith("JIS")) {
        newErrors.enrollmentNumber = "Enrollment Number must start with JIS";
      }
    }

    // 2. Password Validation
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Handle Initial Login Submission
  const handleLoginSubmit = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setLoading(true);

    try {
      const response = await getLoggedInUser(formData);
      if (!response.success || !response.data) {
        setLoading(false);
        // Show error specifically on phone/password if generic login failure, or alert
        if (response.message?.toLowerCase().includes("user")) {
          setErrors({ phoneNumber: response.message });
        } else if (response.message?.toLowerCase().includes("password")) {
          setErrors({ password: response.message });
        } else {
          alert(response.message || 'Login failed');
        }
        return;
      }

      const responseData = response.data as { email?: string | null, authToken?: string | null, enrollmentNumber?: string | null };
      const authToken = responseData.authToken;
      const email = responseData.email;

      if (email && !authToken) {
        localStorage.setItem('authEmail', email); // Use email for OTP later
        if (responseData.enrollmentNumber) {
            localStorage.setItem('authEnrollmentNumber', responseData.enrollmentNumber);
        }
        const atIndex = email.indexOf("@");
        const visibleStart = email.substring(0, 2);
        const visibleEnd = email.substring(atIndex - 2);
        setMaskedEmail(`${visibleStart}****${visibleEnd}`);

        // Reset Timer for new OTP
        setTimer(90);
        setCanResend(false);

        setLoading(false);
        setStep('OTP');
      }
      else if (authToken) {
        localStorage.setItem('authToken', authToken);
        setLoading(false);
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
      else {
        setLoading(false);
        alert("Unexpected login state. Please contact support.");
      }

    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('An unexpected error occurred');
    }
  };

  // Step 2: Handle OTP Verification
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return alert('Please enter the full 6-digit OTP');
    setLoading(true);

    try {
      const email = localStorage.getItem('authEmail') || '';
      const enrollmentNumber = localStorage.getItem('authEnrollmentNumber') || '';

      if (!email) {
        alert("Session expired. Please login again.");
        setStep('FORM');
        return;
      }

      const response = await verifyOtp({ otp, email, enrollmentNumber });

      setLoading(false);

      if (response.success) {
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        alert(response.message || 'Invalid OTP');
      }
    } catch {
      setLoading(false);
      alert('Error verifying OTP');
    }
  };

  // Step 3: Handle Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem('authEmail');
      if (!email) {
        alert("Email not found. Please try logging in again.");
        setStep('FORM');
        return;
      }

      const response = await resendOtp({ email });

      if (response.success) {
        alert("OTP Resent successfully!");
        setTimer(90); // Reset timer
        setCanResend(false);
      } else {
        alert(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error(error);
      alert("Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={loginStyles.container}>
      <SEO 
        title="Student & Admin Portal | JJ Institute of Science" 
        description="Login to the JJ Institute of Science portal to access your courses, dashboard, and educational resources."
      />
      {/* LEFT SECTION */}
      <Box sx={loginStyles.leftSection}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
              mb: 4,
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              padding: '30px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Box
                component="img"
                src={JIS}
                alt="JJ Institute Logo"
                sx={{
                  height: { xs: '100px', md: '140px' },
                  width: { xs: '100px', md: '140px' },
                  objectFit: 'contain',
                }}
              />
            </Box>

            <Typography variant="h1" sx={loginStyles.welcomeText}>
              JJ Institute Of Science
            </Typography>

            <Typography variant="h6" sx={loginStyles.subText}>
              The path to excellence in <br />
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>JEE, NEET & Boards.</span>
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* RIGHT SECTION */}
      <Box sx={loginStyles.rightSection}>
        <Box sx={loginStyles.formBox}>
          <Typography variant="h4" sx={loginStyles.brandLogo} onClick={() => navigate('/')}>
            JJ Institute Of Science
          </Typography>

          {/* Dynamic Title based on Admin State */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            {isAdmin && <AdminPanelSettingsIcon color={formData.role === 'superadmin' ? 'error' : 'primary'} fontSize="large" />}
            <Typography variant="h5" fontWeight={700}>
              {formData.role === 'superadmin' ? 'Super Admin Portal' : formData.role === 'admin' ? 'Admin Access Portal' : 'Student Portal'}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {step === 'FORM'
              ? (isAdmin ? 'Please verify credentials to continue' : 'Please enter your details to login')
              : `Enter the OTP sent to registered email ${maskedEmail}`
            }
          </Typography>

          <AnimatePresence mode='wait'>
            {step === 'FORM' ? (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* ROLE SELECTION */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <ToggleButtonGroup
                    value={formData.role}
                    exclusive
                    onChange={handleRoleChange}
                    aria-label="user role"
                    color="primary"
                    fullWidth
                  >
                    <ToggleButton value="student" aria-label="student login">
                      Student
                    </ToggleButton>
                    <ToggleButton value="admin" aria-label="admin login">
                      Admin
                    </ToggleButton>
                    <ToggleButton value="superadmin" aria-label="superadmin login">
                      Super Admin
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* 1. PHONE FIELD (ADMIN ONLY) */}
                <Collapse in={isAdmin}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    placeholder="9876543210"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange('phoneNumber')}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    sx={loginStyles.inputField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AdminPanelSettingsIcon color="primary" sx={{ mr: 0.5 }} />
                          <Typography variant="body1" color="text.secondary" fontWeight="bold">+91</Typography>
                        </InputAdornment>
                      )
                    }}
                  />
                </Collapse>

                {/* 2. ENROLLMENT NUMBER FIELD (STUDENT ONLY) */}
                <Collapse in={!isAdmin}>
                  <TextField
                    fullWidth
                    label="Enrollment Number"
                    placeholder="JISXXXXXXX"
                    value={formData.enrollmentNumber}
                    onChange={handleChange('enrollmentNumber')}
                    error={!!errors.enrollmentNumber}
                    helperText={errors.enrollmentNumber}
                    sx={loginStyles.inputField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" sx={{ mr: 0.5 }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Collapse>

                {/* 3. PASSWORD FIELD */}
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={loginStyles.inputField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLoginSubmit}
                  disabled={loading}
                  sx={
                    formData.role === 'superadmin'
                      ? loginStyles.superAdminActionBtn
                      : formData.role === 'admin'
                        ? loginStyles.adminActionBtn
                        : loginStyles.actionBtn
                  }
                >
                  {loading ? 'Checking...' : (isAdmin ? 'Verify & Send OTP' : 'Secure Login')}
                </Button>
              </motion.div>
            ) : (
              // OTP STEP
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TextField
                  fullWidth
                  label="One Time Password"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={loginStyles.inputField}
                  type="password"
                  inputProps={{ style: { letterSpacing: 8, textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><VpnKeyIcon color="primary" /></InputAdornment>,
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  sx={loginStyles.actionBtn}
                >
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                </Button>

                {/* TIMER & RESEND LOGIC */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                  {!canResend ? (
                    <>
                      <AccessTimeIcon fontSize="small" color="disabled" />
                      <Typography variant="body2" color="text.secondary">
                        Resend OTP in <b>{formatTime(timer)}</b>
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      onClick={handleResendOtp}
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        '&:hover': { color: 'primary.dark' }
                      }}
                    >
                      Resend OTP
                    </Typography>
                  )}
                </Box>

                <Typography
                  onClick={() => setStep('FORM')}
                  sx={{
                    cursor: 'pointer',
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    mt: 2
                  }}
                >
                  Incorrect details? Go back
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          <Box onClick={() => navigate('/')} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ...loginStyles.backLink, mt: 4 }}>
            <ArrowBackIcon fontSize="inherit" /> Back to Website
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;