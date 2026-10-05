import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../../models/Student';
import Admin from '../../models/Admin';
import Session from '../../models/Session'; // Session tracking

// Added resendOtp to imports
import { sendOtp, verifyOtp, resendOtp } from '../../controllers/otpController';
import { changePassword, getAllStudentProfiles } from '../../controllers/studentController';
import verifyAuth, { AuthRequest } from '../../middlewares/verifyAuth';
import bcrypt from 'bcryptjs';
import resolveTenant, { TenantRequest } from '../../middlewares/resolveTenant';

const router = express.Router();
const jwt_secret = process.env.JWT_SECRET;

router.post('/getLoggedInUser', resolveTenant, async (req: TenantRequest, res): Promise<any> => {
    const { name, dob, phoneNumber, currentClass, password, role, enrollmentNumber } = req.body;

    if (!jwt_secret) {
        return res.status(500).json({ success: false, message: 'Server Config Error: JWT_SECRET missing error here' });
    }

    try {
        // admin login flow
        if (role === 'admin' || role === 'superadmin') {
            const admin = await Admin.findOne({ phoneNumber, role, organizationId: req.organizationId });

            if (!admin) {
                return res.status(404).json({ success: false, message: 'Admin not found' });
            }
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }
            const otpResponse = await sendOtp(admin.email, admin._id, 'admin', req.organizationId as any)
            if (!otpResponse.success) {
                // Send the error message from the controller (e.g. "Email service auth failed") back to frontend
                return res.status(500).json(otpResponse);
            }

            return res.status(200).json({
                success: true,
                message: 'Credentials verified. OTP sent to email.',
                email: admin.email,
                authToken: null
            });

        }

        // student login flow
        const student = await Student.findOne({
            enrollmentNumber: enrollmentNumber,
            organizationId: req.organizationId
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found. Please check your Enrollment Number.'
            });
        }
        if (!student.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Access Denied: Your account has been deactivated. Please contact the administrator.'
            });
        }
        const isMatch = await bcrypt.compare(password, student.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Case A: No Email -> Immediate Login
        if (!student.email) {
            const payload = { id: student._id, role: "student", organizationId: student.organizationId, currentClass: student.currentClass };
            const authToken = jwt.sign(
                payload,
                jwt_secret,
                { expiresIn: '15m' }
            );
            const refreshToken = jwt.sign(
                payload,
                jwt_secret,
                { expiresIn: '7d' }
            );

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Store session
            await Session.create({
                userId: student._id,
                userType: 'Student',
                organizationId: student.organizationId,
                refreshToken: refreshToken,
                userAgent: req.headers['user-agent'] || 'unknown',
                ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return res.status(200).json({
                success: true,
                message: 'Login Successful (No email linked)',
                email: null,
                authToken: authToken
            });
        }

        // Case B: Email Exists -> Require OTP
        const otpResponse = await sendOtp(student.email, student._id, "student", req.organizationId as any)
        if (!otpResponse.success) {
            // Send the error message from the controller (e.g. "Email service auth failed") back to frontend
            return res.status(500).json(otpResponse);
        }

        return res.status(200).json({
            success: true,
            message: 'Credentials verified. OTP sent to email.',
            email: student.email,
            enrollmentNumber: student.enrollmentNumber,
            authToken: null
        });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

router.post('/resendOtp', resolveTenant, async (req: TenantRequest, res): Promise<any> => {
    const { email } = req.body;
    try {
        const result = await resendOtp(email, req.organizationId as any);

        // If the controller returns a specific message indicating cooldown
        if (result.message && result.message.includes('Please wait')) {
            return res.status(429).json({ success: false, message: result.message });
        }

        if (result.message === "Failed to resend OTP") {
            return res.status(500).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

router.post('/verifyOtp', resolveTenant, async (req: TenantRequest, res): Promise<any> => {
    const { email, otp, enrollmentNumber } = req.body;
    try {
        const result = await verifyOtp(email, otp, req.organizationId as string);

        if (result.success) {
            let user: any = await Admin.findOne({ email, organizationId: req.organizationId });
            let userRole = "student";

            if (user) {
                userRole = user.role;
            } else {
                user = await Student.findOne({
                    enrollmentNumber: enrollmentNumber,
                    organizationId: req.organizationId
                });
            }

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const payload = (userRole === "admin" || userRole === "superadmin")
                ? { id: user._id, role: userRole, organizationId: user.organizationId }
                : { id: user._id, role: "student", organizationId: user.organizationId, currentClass: user.currentClass };

            const authToken = jwt.sign(
                payload,
                jwt_secret as string,
                { expiresIn: '15m' }
            );
            
            const refreshToken = jwt.sign(
                payload,
                jwt_secret as string,
                { expiresIn: '7d' }
            );

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Store session
            await Session.create({
                userId: user._id,
                userType: (userRole === "admin" || userRole === "superadmin") ? 'Admin' : 'Student',
                organizationId: user.organizationId,
                refreshToken: refreshToken,
                userAgent: req.headers['user-agent'] || 'unknown',
                ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
                email: user.email,
                authToken
            });
        }

        // Return error with attempts remaining if available
        return res.status(400).json({
            success: false,
            message: result.message,
            // @ts-ignore - Check if controller returns this property
            remainingAttempts: result.remainingAttempts
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, message: 'Server Error', error });
    }
});

router.get('/verifyToken', verifyAuth, async (req: AuthRequest, res): Promise<any> => {
    try {
        const { id, role } = req.user!; // Extracted by middleware

        let userExists = null;

        // Check Database based on Role
        if (role === 'admin' || role === 'superadmin') {
            userExists = await Admin.findById(id).select('-password'); // Exclude password
        } else if (role === 'student') {
            userExists = await Student.findById(id).select('-password');
        }

        // If user was deleted from DB but still has a valid token
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User record not found. Please login again.' });
        }
        // Success: User is real and token is valid
        return res.status(200).json({
            success: true,
            user: userExists,
            role: role
        });

    } catch (error) {
        console.error("Token Verification Error:", error);
        return res.status(500).json({ success: false, message: 'Server Error during verification' });
    }
});

router.post('/changePassword', verifyAuth, changePassword);
router.get('/getAllStudentProfiles', resolveTenant, getAllStudentProfiles);

// --- Token Management ---

router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, jwt_secret as string) as any;
        
        // Verify session exists in DB
        const session = await Session.findOne({ refreshToken });
        if (!session) {
            return res.status(403).json({ success: false, message: 'Session expired or invalidated' });
        }

        const payload = { id: decoded.id, role: decoded.role, organizationId: decoded.organizationId, currentClass: decoded.currentClass };
        
        const newAccessToken = jwt.sign(payload, jwt_secret as string, { expiresIn: '15m' });
        
        return res.status(200).json({
            success: true,
            authToken: newAccessToken
        });
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }
});

router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        await Session.deleteOne({ refreshToken });
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;