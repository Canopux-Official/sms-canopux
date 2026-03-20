import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp";

const COOLDOWN_MS = 90 * 1000; // 90 seconds
const MAX_ATTEMPTS = 5;


// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// DON'T DELETE THIS BELOW COMMENTED PART

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT), // 465
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
});

authenticator.options = { digits: 6, step: 300 };

const getEmailTemplate = (otp: string, isResend: boolean, currentAttempts: number) => {
  const title = isResend ? "New Verification Code" : "Login Verification Code";
  const subText = isResend ? "Here is your new login code." : "You requested a secure login.";

  // Calculate attempts left
  const attemptsLeft = MAX_ATTEMPTS - currentAttempts;
  const attemptColor = attemptsLeft < 3 ? "#D32F2F" : "#1B5E20"; // Red if low on attempts, Green otherwise

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #2E7D32; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">JJ Institute of Science</h1>
        <p style="color: #E8F5E9; margin: 5px 0 0; font-size: 14px;">Excellence in JEE, NEET & Boards</p>
      </div>

      <div style="padding: 40px 30px; text-align: center;">
        <p style="color: #333333; font-size: 16px; margin-bottom: 25px;">Hello,</p>
        <p style="color: #555555; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
          ${subText} Please use the verification code below to complete the process.
        </p>
        
        <div style="background-color: #F1F8F6; border: 2px dashed #4CAF50; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 20px;">
          <span style="font-size: 36px; font-weight: bold; color: #1B5E20; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
        </div>

        <div style="margin-bottom: 30px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0;">
            <p style="color: #555; font-size: 13px; margin: 0;">
               Security Check: <strong style="color: ${attemptColor}">Attempt ${currentAttempts} of ${MAX_ATTEMPTS} used</strong>
            </p>
            <p style="color: #777; font-size: 12px; margin: 5px 0 0;">
               (${attemptsLeft} attempts remaining before block)
            </p>
        </div>

        <p style="color: #777777; font-size: 14px; margin-bottom: 5px;">This code is valid for <strong>5 minutes</strong>.</p>
        <p style="color: #999999; font-size: 13px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>

      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #888888; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} JJ Institute of Science. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

const handleControllerError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (error.code === 'EAUTH') {
    return { success: false, message: "Email service authentication failed. Contact Admin." };
  }
  return { success: false, message: `Failed to ${context} (System Error)` };
};

export const sendOtp = async (
  email: string,
  userId: mongoose.Types.ObjectId | string,
  onModel: 'student' | 'admin'
) => {
  try {
    if (!email) throw new Error("Email is required");
    if (!userId || !onModel) throw new Error("User ID and Model type are required");

    // Check if OTP exists -> Treat as Resend
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const resendResult = await resendOtp(email);
      if (!resendResult.success) {
        return resendResult;
      }
      return { success: true, message: "OTP sent successfully (Resent)" };
    }

    // --- NORMAL FLOW (Fresh) ---
    const otp = authenticator.generate(email + process.env.OTP_SECRET);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp: hashedOtp,
      attempts: 0,
      userId: new mongoose.Types.ObjectId(userId),
      onModel,
      createdAt: new Date()
    });

    await transporter.sendMail({
      from: `"JJ Institute Auth" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Login Verification Code",
      html: getEmailTemplate(otp, false, 0), // 0 attempts used initially
    });

    return { success: true, message: "OTP sent successfully" };

  } catch (error) {
    return handleControllerError(error, "send OTP");
  }
};


export const verifyOtp = async (email: string, otp: string) => {
  try {
    if (!email || !otp) {
      return { success: false, message: "Email and OTP required" };
    }

    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc) {
      return { success: false, message: "OTP expired or not found" };
    }

    // Check Block
    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      return { success: false, message: "Too many attempts. Maximum limit reached. Please Login again." };
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otp);

    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      if (otpDoc.attempts >= MAX_ATTEMPTS) {
        return { success: false, message: "Too many attempts. Maximum limit reached. Please Login again." };
      }

      return {
        success: false,
        message: "Invalid OTP",
        remainingAttempts: MAX_ATTEMPTS - otpDoc.attempts,
      };
    }

    await Otp.deleteOne({ email });

    return { success: true, message: "OTP verified successfully" };

  } catch (error) {
    return handleControllerError(error, "verify OTP");
  }
};

export const resendOtp = async (email: string) => {
  try {
    if (!email) throw new Error("Email is required");

    const existingOtp = await Otp.findOne({ email });

    if (!existingOtp) {
      return {
        success: false,
        message: "OTP expired. Please login again."
      };
    }

    if (existingOtp.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        message: "Maximum attempts reached. You cannot resend. Please Login again."
      };
    }

    const elapsed = Date.now() - existingOtp.createdAt.getTime();
    if (elapsed < COOLDOWN_MS) {
      return {
        success: false,
        message: `Please wait ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)} seconds before resending`,
      };
    }

    const otp = authenticator.generate(email + process.env.OTP_SECRET);
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update OTP but KEEP attempts count (so security isn't bypassed)
    existingOtp.otp = hashedOtp;
    existingOtp.createdAt = new Date();

    await existingOtp.save();

    await transporter.sendMail({
      from: `"JJ Institute Auth" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your New Verification Code",
      html: getEmailTemplate(otp, true, existingOtp.attempts), // Pass current attempts
    });

    return { success: true, message: "OTP resent successfully" };

  } catch (error) {
    return handleControllerError(error, "resend OTP");
  }
};