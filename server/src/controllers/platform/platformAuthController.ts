// server/src/controllers/platform/platformAuthController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PlatformAdmin from '../../models/PlatformAdmin';

// POST /platform/auth/login
// Matches the shared contract exactly:
//   Request:  { email, password }
//   Response: { success: true, token, user: { id, name, email, role: "platform-superadmin" } }
//   Errors:   401 { success: false, message: "Invalid credentials" }
export const platformLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server Config Error: JWT_SECRET missing'
      });
    }

    const admin = await PlatformAdmin.findOne({ email: String(email).toLowerCase().trim() });

    // Deliberately the same generic message whether the email doesn't exist or the
    // password is wrong — don't leak which platform admin emails exist.
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: 'platform-superadmin',
        name: admin.name,
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' } // shorter-lived than institute tokens (30d) — this account can touch every org
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'platform-superadmin'
      }
    });

  } catch (error) {
    console.error('Platform login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export default { platformLogin };