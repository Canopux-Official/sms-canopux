// server/src/controllers/platform/organizationController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Organization from '../../models/Organization';
import Plan from '../../models/Plan';
import Admin from '../../models/Admin';
import LandingPage from '../../models/LandingPage';

// ---------------------------------------------------------------------------
// Reserved slugs
// ---------------------------------------------------------------------------
// Track A's Task 7 introduces a shared server/src/utils/reservedSlugs.ts consumed by the
// institute-side organization-creation flow. This list is kept local (not imported) so this
// file has no compile-time dependency on a file that may not exist yet depending on merge
// order between the two tracks. If/when server/src/utils/reservedSlugs.ts lands, this local
// copy can be deleted and replaced with:
//   import { RESERVED_SLUGS } from '../../utils/reservedSlugs';
const RESERVED_SLUGS = ['admin', 'www', 'api', 'sms', 'app', 'mail', 'ftp', 'staging'];

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------
const normalizeSlug = (raw: string): string => String(raw).trim().toLowerCase();

// 3-32 chars, lowercase letters/numbers/hyphens, cannot start or end with a hyphen.
const isValidSlugFormat = (slug: string): boolean =>
  /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/.test(slug);

// ---------------------------------------------------------------------------
// Credentials email (best-effort — org creation still succeeds if this fails)
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const generateTempPassword = (): string => {
  // Random base64 chunk (letters + digits) plus a guaranteed digit+symbol suffix, so the
  // generated password always has mixed case, a digit and a symbol without needing a
  // full complexity-checking loop.
  const random = crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '');
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `${random.slice(0, 8)}${suffix}!`;
};

const buildCredentialsEmailHtml = (
  orgName: string,
  slug: string,
  phoneNumber: string,
  tempPassword: string
): string => {
  const loginUrl = `https://${slug}.sms.canopux.org`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #2E7D32; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Welcome to Canopux</h1>
        <p style="color: #E8F5E9; margin: 5px 0 0; font-size: 14px;">${orgName}'s account is ready</p>
      </div>
      <div style="padding: 40px 30px;">
        <p style="color: #333333; font-size: 15px; line-height: 1.6;">
          Your institute's Student Management System has been provisioned. Here are your admin login details:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; color: #777; font-size: 13px;">Login URL</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="${loginUrl}" style="color: #2E7D32;">${loginUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #777; font-size: 13px;">Phone Number</td>
            <td style="padding: 8px 0; font-size: 14px;">${phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #777; font-size: 13px;">Temporary Password</td>
            <td style="padding: 8px 0; font-size: 16px; font-family: 'Courier New', monospace; letter-spacing: 1px;">${tempPassword}</td>
          </tr>
        </table>
        <p style="color: #D32F2F; font-size: 13px;">
          For security, please log in and change this password immediately from Settings.
        </p>
        <p style="color: #999999; font-size: 12px; margin-top: 25px;">
          If you weren't expecting this email, please contact Canopux support.
        </p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #888888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Canopux. All rights reserved.</p>
      </div>
    </div>
  `;
};

// ---------------------------------------------------------------------------
// GET /platform/organizations/check-slug?slug=xyz
// ---------------------------------------------------------------------------
export const checkSlugAvailability = async (req: Request, res: Response) => {
  try {
    const rawSlug = req.query.slug;

    if (!rawSlug || typeof rawSlug !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'slug query parameter is required'
      });
    }

    const slug = normalizeSlug(rawSlug);

    if (!isValidSlugFormat(slug) || RESERVED_SLUGS.includes(slug)) {
      return res.status(200).json({ success: true, available: false });
    }

    const existing = await Organization.findOne({ slug }).select('_id');
    return res.status(200).json({ success: true, available: !existing });

  } catch (error) {
    console.error('Error checking slug availability:', error);
    return res.status(500).json({ success: false, message: 'Server error checking slug availability' });
  }
};

// ---------------------------------------------------------------------------
// GET /platform/organizations
// ---------------------------------------------------------------------------
export const getAllOrganizations = async (_req: Request, res: Response) => {
  try {
    const organizations = await Organization.find({})
      .populate('planId', 'name maxStudents')
      .sort({ createdAt: -1 })
      .lean();

    const data = organizations.map((org: any) => ({
      id: org._id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      subscriptionStatus: org.subscriptionStatus,
      plan: org.planId
        ? {
            id: org.planId._id,
            name: org.planId.name,
            maxStudents: org.planId.maxStudents ?? null
          }
        : null,
      usage: { currentStudentCount: org.usage?.currentStudentCount ?? 0 },
      createdAt: org.createdAt
    }));

    return res.status(200).json({ success: true, organizations: data });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching organizations' });
  }
};

// ---------------------------------------------------------------------------
// GET /platform/plans
// ---------------------------------------------------------------------------
export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ minStudents: 1 }).lean();

    const data = plans.map((plan: any) => ({
      id: plan._id,
      name: plan.name,
      minStudents: plan.minStudents,
      maxStudents: plan.maxStudents ?? null,
      monthlyPrice: plan.monthlyPrice,
      isCustom: plan.isCustom
    }));

    return res.status(200).json({ success: true, plans: data });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching plans' });
  }
};

// ---------------------------------------------------------------------------
// POST /platform/organizations
// Creates Organization + first (superadmin) Admin + blank LandingPage in one go,
// then emails the admin credentials. No Mongo transaction is used here (transactions
// require a replica set, which local/dev MongoDB instances on the team's machines may
// not have) — instead, if a later step fails, the earlier documents are cleaned up
// on a best-effort basis so a retry with the same slug doesn't wrongly report 409.
// ---------------------------------------------------------------------------
export const createOrganization = async (req: Request, res: Response) => {
  let createdOrganization: any = null;

  try {
    const { name, slug: rawSlug, planId, primaryContact } = req.body;

    if (
      !name ||
      !rawSlug ||
      !planId ||
      !primaryContact?.name ||
      !primaryContact?.email ||
      !primaryContact?.phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'name, slug, planId and primaryContact (name, email, phone) are required'
      });
    }

    const slug = normalizeSlug(rawSlug);

    if (!isValidSlugFormat(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Slug must be 3-32 characters: lowercase letters, numbers and hyphens only, and cannot start or end with a hyphen'
      });
    }

    if (RESERVED_SLUGS.includes(slug)) {
      return res.status(400).json({ success: false, message: 'Slug is reserved' });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid planId' });
    }

    const plan = await Plan.findOne({ _id: planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(409).json({ success: false, message: 'Slug already taken' });
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const contactName = String(primaryContact.name).trim();
    const contactEmail = String(primaryContact.email).toLowerCase().trim();
    const contactPhone = String(primaryContact.phone).trim();

    createdOrganization = await Organization.create({
      name: String(name).trim(),
      slug,
      subdomain: slug,
      status: 'trial',
      branding: {},
      customDomainStatus: 'none',
      planId: plan._id,
      subscriptionStatus: 'trialing',
      trialEndsAt,
      usage: { currentStudentCount: 0 },
      primaryContact: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone
      }
    });

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // First admin for the new org — full permissions, same shape admin.controlRoutes.ts
    // already grants a 'superadmin' role.
    await Admin.create({
      organizationId: createdOrganization._id,
      name: contactName,
      phoneNumber: contactPhone,
      email: contactEmail,
      password: hashedPassword,
      role: 'superadmin',
      permissions: {
        students: true,
        streams: true,
        targetExams: true,
        subjects: true,
        session: true,
        upload: true,
        notice: true,
        attendance: true,
        marks: true
      }
    });

    // One blank LandingPage per org — every field on the schema is optional/defaulted,
    // so this just needs the organizationId.
    await LandingPage.create({ organizationId: createdOrganization._id });

    let adminCredentialsEmailed = false;
    try {
      await transporter.sendMail({
        from: `"Canopux" <${process.env.MAIL_USER}>`,
        to: contactEmail,
        subject: `Your Canopux account for ${createdOrganization.name} is ready`,
        html: buildCredentialsEmailHtml(createdOrganization.name, createdOrganization.slug, contactPhone, tempPassword)
      });
      adminCredentialsEmailed = true;
    } catch (mailError) {
      // Don't fail the whole request just because the email provider hiccuped — the
      // organization and its admin account are already created and valid.
      console.error('Failed to email admin credentials:', mailError);
    }

    return res.status(201).json({
      success: true,
      organization: {
        id: createdOrganization._id,
        name: createdOrganization.name,
        slug: createdOrganization.slug
      },
      adminCredentialsEmailed
    });

  } catch (error: any) {
    console.error('Error creating organization:', error);

    // Best-effort rollback so a retry with the same slug/email doesn't get stuck behind
    // a half-created organization.
    if (createdOrganization?._id) {
      await Organization.findByIdAndDelete(createdOrganization._id).catch(() => undefined);
      await Admin.deleteMany({ organizationId: createdOrganization._id }).catch(() => undefined);
      await LandingPage.deleteMany({ organizationId: createdOrganization._id }).catch(() => undefined);
    }

    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Slug already taken' });
    }

    return res.status(500).json({ success: false, message: 'Server error creating organization' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /platform/organizations/:id/status
// ---------------------------------------------------------------------------
export const updateOrganizationStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid organization id' });
    }

    if (status !== 'active' && status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: "status must be 'active' or 'suspended'"
      });
    }

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).select('_id status');

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      organization: { id: organization._id, status: organization.status }
    });

  } catch (error) {
    console.error('Error updating organization status:', error);
    return res.status(500).json({ success: false, message: 'Server error updating organization status' });
  }
};

export default {
  checkSlugAvailability,
  getAllOrganizations,
  getAllPlans,
  createOrganization,
  updateOrganizationStatus
};