// components/admin/Branding/types/types.ts

export interface Branding {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
}

export interface BrandingData {
    name: string;       // display name (NOT the legal name)
    slug: string;       // read-only
    subdomain: string;  // read-only
    branding: Branding;
}

export interface BrandingResponse {
    success: boolean;
    data: BrandingData;
    defaults: Branding;
    allowedFonts: string[];
}

export interface BrandingFormData {
    name: string;
    branding: Branding;
}