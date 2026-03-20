import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'admin' | 'superadmin';
    currentClass?: string;
  };
}

const verifyAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Access Denied: No Authorization Header"
      });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access Denied: Invalid Token Format"
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access Denied: Token Missing"
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as AuthRequest["user"];

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid Token"
      });
      return;
    }

    if (decoded.role === "student") {
      const student = await Student.findById(decoded.id).select("isActive");

      if (!student) {
        res.status(401).json({
          success: false,
          message: "Session expired. Please login again."
        });
        return;
      }

      if (student.isActive === false) {
        res.status(403).json({
          success: false,
          message:
            "Access Denied: Your account has been deactivated. Contact admin."
        });
        return;
      }
    }

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or Expired Token"
    });
  }
};

export default verifyAuth;