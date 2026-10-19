// server/src/controllers/brandingController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/verifyAuth';
import Organization from '../models/Organization';

// ---------------------------------------------------------------------------
// Defaults used when an organization hasn't customised its branding yet.
// Stored values always win; defaults only fill the gaps in the GET response.
// ---------------------------------------------------------------------------
const DEFAULT_BRANDING = {
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#2563EB',   // blue
    secondaryColor: '#1E293B', // slate
    fontFamily: 'Inter',
};

const ALLOWED_FONTS = [
    'Inter',
    'Roboto',
    'Poppins',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Nunito',
    'Source Sans 3',
];

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isValidUrl = (value: string): boolean => {
    // allow relative upload paths (e.g. /uploads/logo.png) or absolute http(s) URLs
    if (value.startsWith('/')) return true;
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

const withDefaults = (branding: any = {}) => ({
    logoUrl: branding?.logoUrl || DEFAULT_BRANDING.logoUrl,
    faviconUrl: branding?.faviconUrl || DEFAULT_BRANDING.faviconUrl,
    primaryColor: branding?.primaryColor || DEFAULT_BRANDING.primaryColor,
    secondaryColor: branding?.secondaryColor || DEFAULT_BRANDING.secondaryColor,
    fontFamily: branding?.fontFamily || DEFAULT_BRANDING.fontFamily,
});

const formatOrg = (org: any) => ({
    name: org.name,            // display name shown on the website (NOT legalName)
    slug: org.slug,            // read-only
    subdomain: org.subdomain,  // read-only
    branding: withDefaults(org.branding),
});

// Get Branding (Admin)
export const getBranding = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const organizationId = req.user?.organizationId;

        const org = await Organization.findById(organizationId).select('name slug subdomain branding');

        if (!org) {
            res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: formatOrg(org),
            defaults: DEFAULT_BRANDING,   // for the "Reset to default" button
            allowedFonts: ALLOWED_FONTS   // for the font dropdown
        });
    } catch (error: any) {
        console.error('Error fetching branding:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to fetch branding',
            error: error.message
        });
    }
};

// Update Branding (Admin)
// Body (all optional): { name, branding: { logoUrl, faviconUrl, primaryColor, secondaryColor, fontFamily } }
// An empty string for a branding field resets it to the default.
// legalName, slug, subdomain, plan and billing are intentionally NOT editable here.
export const updateBranding = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const organizationId = req.user?.organizationId;
        const { name, branding } = req.body;

        const updates: Record<string, any> = {};
        const errors: string[] = [];

        // --- Display name ---
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
                errors.push('name must be between 2 and 100 characters');
            } else {
                updates.name = name.trim();
            }
        }

        // --- Branding ---
        if (branding !== undefined) {
            if (typeof branding !== 'object' || branding === null || Array.isArray(branding)) {
                errors.push('branding must be an object');
            } else {
                const { logoUrl, faviconUrl, primaryColor, secondaryColor, fontFamily } = branding;

                for (const [key, value] of [['logoUrl', logoUrl], ['faviconUrl', faviconUrl]] as const) {
                    if (value === undefined) continue;
                    if (typeof value !== 'string' || (value !== '' && !isValidUrl(value))) {
                        errors.push(`branding.${key} must be a valid URL or path`);
                    } else {
                        updates[`branding.${key}`] = value;
                    }
                }

                for (const [key, value] of [['primaryColor', primaryColor], ['secondaryColor', secondaryColor]] as const) {
                    if (value === undefined) continue;
                    if (typeof value !== 'string' || (value !== '' && !HEX_COLOR_REGEX.test(value))) {
                        errors.push(`branding.${key} must be a hex color like #2563EB`);
                    } else {
                        updates[`branding.${key}`] = value;
                    }
                }

                if (fontFamily !== undefined) {
                    if (typeof fontFamily !== 'string' || (fontFamily !== '' && !ALLOWED_FONTS.includes(fontFamily))) {
                        errors.push(`branding.fontFamily must be one of: ${ALLOWED_FONTS.join(', ')}`);
                    } else {
                        updates['branding.fontFamily'] = fontFamily;
                    }
                }
            }
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
            return;
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({
                success: false,
                message: 'No valid fields provided to update'
            });
            return;
        }

        // $set with dot-notation so untouched branding fields are preserved
        const org = await Organization.findByIdAndUpdate(
            organizationId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('name slug subdomain branding');

        if (!org) {
            res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Branding updated successfully',
            data: formatOrg(org)
        });
    } catch (error: any) {
        console.error('Error updating branding:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update branding',
            error: error.message
        });
    }
};