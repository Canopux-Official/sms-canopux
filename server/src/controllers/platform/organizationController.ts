// server/src/controllers/platform/organizationController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Organization from '../../models/Organization';
import Admin from '../../models/Admin';
import LandingPage from '../../models/LandingPage';
import Student from '../../models/Student';
import Stream from '../../models/Stream';
import Subject from '../../models/Subject';
import TargetExam from '../../models/TargetExam';
import Test from '../../models/Test';
import Result from '../../models/Result';
import Attendance from '../../models/Attendance';
import Notice from '../../models/Notice';
import Material from '../../models/Material';
import Otp from '../../models/Otp';
import Subscription from '../../models/Subscription';
import Invoice from '../../models/Invoice';
import Counter from '../../models/Counter';
import { PlatformAuthRequest } from '../../middlewares/verifyPlatformAuth';
import { getOrganizationBillingSnapshot, serializePlan } from '../../services/billingService';

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
/** Legacy organizations created before trials were removed still carry status 'trial'; they are plain active institutes now. */
const normalizeStatus = (status: string): string => (status === 'trial' ? 'active' : status);

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
      status: normalizeStatus(org.status),
      subscriptionStatus: org.subscriptionStatus === 'trialing' ? 'active' : org.subscriptionStatus,
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
// NOTE: GET /platform/plans is now served by planController.listPlans, which returns
// every plan field (description, durationDays, pricing model, organizationsCount, ...)
// instead of just the handful below. Kept out of this file's default export so nothing
// still imports this narrower shape by mistake.
// ---------------------------------------------------------------------------

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
    const { name, slug: rawSlug, primaryContact } = req.body;

    if (
      !name ||
      !rawSlug ||
      !primaryContact?.name ||
      !primaryContact?.email ||
      !primaryContact?.phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'name, slug and primaryContact (name, email, phone) are required'
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

    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(409).json({ success: false, message: 'Slug already taken' });
    }

    const contactName = String(primaryContact.name).trim();
    const contactEmail = String(primaryContact.email).toLowerCase().trim();
    const contactPhone = String(primaryContact.phone).trim();

    createdOrganization = await Organization.create({
      name: String(name).trim(),
      slug,
      subdomain: slug,
      status: 'active',
      branding: {},
      customDomainStatus: 'none',
      subscriptionStatus: 'active',
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

// ---------------------------------------------------------------------------
// GET /platform/organizations/:id
// The "click into an institute" detail view: core org fields, its plan, billing
// history and a monthly usage/invoice summary. Deliberately one call so the detail
// page loads in one round trip; more sections (usage graphs, admin list, support
// notes, ...) can be added to this same payload later without a new endpoint.
// ---------------------------------------------------------------------------
export const getOrganizationDetail = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid organization id' });
        }

        const organization: any = await Organization.findById(id).populate('planId').lean();
        if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

        const [billing, adminCount, superAdmin] = await Promise.all([
            getOrganizationBillingSnapshot(organization._id),
            Admin.countDocuments({ organizationId: organization._id }),
            Admin.findOne({ organizationId: organization._id, role: 'superadmin' })
                .sort({ createdAt: 1 })
                .select('name email phoneNumber'),
        ]);

        return res.status(200).json({
            success: true,
            organization: {
                id: organization._id,
                name: organization.name,
                legalName: organization.legalName || '',
                slug: organization.slug,
                status: normalizeStatus(organization.status),
                subscriptionStatus: organization.subscriptionStatus === 'trialing' ? 'active' : organization.subscriptionStatus,
                plan: organization.planId ? serializePlan(organization.planId) : null,
                usage: { currentStudentCount: organization.usage?.currentStudentCount ?? 0 },
                primaryContact: organization.primaryContact || null,
                billingContact: organization.billingContact || null,
                address: organization.address || null,
                adminCount,
                superAdmin: superAdmin
                    ? { id: superAdmin._id, name: superAdmin.name, email: superAdmin.email, phoneNumber: superAdmin.phoneNumber }
                    : null,
                createdAt: organization.createdAt,
            },
            billing,
        });
    } catch (error) {
        console.error('Error fetching organization detail:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching organization detail' });
    }
};

// ---------------------------------------------------------------------------
// POST /platform/organizations/:id/login-as
// Issues a real institute admin JWT for that organization's superadmin, so the platform
// admin can open the institute app with full superadmin power for support/setup purposes.
// The token carries an extra impersonatedByPlatformAdmin claim for traceability; verifyAuth
// on the institute side ignores unknown claims, so this needs no change on that end.
// ---------------------------------------------------------------------------
/**
 * Permanently deletes an institute and EVERYTHING that belongs to it: admins (emails, phone numbers),
 * students, attendance, tests/results, notices, materials, landing page, OTPs, subscriptions, invoices
 * and the enrollment counter. Only allowed once the institute is suspended, and the caller must
 * echo the institute's slug as a typed confirmation. This cannot be undone.
 *
 * Order matters: all child data goes first and the Organization document goes LAST. If anything
 * fails midway the institute still exists (still suspended), so the delete can simply be retried.
 */
export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid organization id' });
    }

    const organization = await Organization.findById(id).select('_id name slug status');
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (organization.status !== 'suspended') {
      return res.status(409).json({
        success: false,
        message: 'Suspend the institute first. Only a suspended institute can be deleted.'
      });
    }

    const confirmSlug = String(req.body?.confirmSlug ?? '').trim().toLowerCase();
    if (confirmSlug !== organization.slug) {
      return res.status(400).json({
        success: false,
        message: 'Confirmation does not match the institute subdomain. Nothing was deleted.'
      });
    }

    const orgId = organization._id;
    const byOrg = { organizationId: orgId };

    await Promise.all([
      Result.deleteMany(byOrg),
      Test.deleteMany(byOrg),
      Attendance.deleteMany(byOrg),
      Notice.deleteMany(byOrg),
      Material.deleteMany(byOrg),
      Otp.deleteMany(byOrg),
      Student.deleteMany(byOrg),
      Admin.deleteMany(byOrg),
      Stream.deleteMany(byOrg),
      Subject.deleteMany(byOrg),
      TargetExam.deleteMany(byOrg),
      LandingPage.deleteMany(byOrg),
      Invoice.deleteMany(byOrg),
      Subscription.deleteMany(byOrg),
      Counter.deleteOne({ _id: `enrollmentNumber_${String(orgId)}` }),
    ]);

    // Last step: once this succeeds the institute (and its slug) is gone for good.
    await Organization.deleteOne({ _id: orgId });

    return res.status(200).json({ success: true, message: `"${organization.name}" and all its data were permanently deleted.` });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting the institute. The institute still exists; please retry.'
    });
  }
};

export const impersonateOrganizationAdmin = async (req: PlatformAuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid organization id' });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: 'Server Config Error: JWT_SECRET missing' });
        }

        const organization = await Organization.findById(id).select('_id name slug');
        if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

        const admin = await Admin.findOne({ organizationId: organization._id, role: 'superadmin' }).sort({ createdAt: 1 });
        if (!admin) {
            return res.status(404).json({ success: false, message: 'This organization has no superadmin account to log in as' });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                role: admin.role,
                organizationId: organization._id,
                impersonatedByPlatformAdmin: req.platformUser?.id,
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // short-lived: this is a support session, not a standing login
        );

        return res.status(200).json({
            success: true,
            token,
            orgSlug: organization.slug,
            orgName: organization.name,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        });
    } catch (error) {
        console.error('Error impersonating organization admin:', error);
        return res.status(500).json({ success: false, message: 'Server error generating login-as session' });
    }
};

export default {
  checkSlugAvailability,
  getAllOrganizations,
  createOrganization,
  updateOrganizationStatus,
  getOrganizationDetail,
  deleteOrganization,
  impersonateOrganizationAdmin,
};