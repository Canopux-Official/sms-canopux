// server/src/middlewares/verifyPlatformAuth.ts
//
// Auth guard for the /platform/* namespace (Canopux Admin App / master-admin-sms).
// This is intentionally a SEPARATE middleware from verifyAuth.ts, not an extension of it:
// institute tokens (role 'admin' | 'superadmin' | 'student', carrying organizationId) and
// platform tokens (role 'platform-superadmin', no organizationId) must never be usable for
// each other's routes. Both middlewares currently verify against the same process.env.JWT_SECRET,
// so the separation is enforced purely by checking the decoded role below — do not remove that
// check when touching this file.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface PlatformAuthRequest extends Request {
  platformUser?: {
    id: string;
    role: 'platform-superadmin';
    name?: string;
    email?: string;
  };
}

const verifyPlatformAuth = (
  req: PlatformAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Access Denied: No Authorization Header'
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access Denied: Invalid Token Format'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access Denied: Token Missing'
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET missing');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as PlatformAuthRequest['platformUser'];

    if (!decoded || decoded.role !== 'platform-superadmin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Platform admin access required'
      });
      return;
    }

    req.platformUser = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or Expired Token'
    });
  }
};

export default verifyPlatformAuth;