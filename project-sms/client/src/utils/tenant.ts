export function getOrgSlug(): string {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return import.meta.env.VITE_DEV_ORG_SLUG || '';
    }

    const parts = hostname.split('.');
    return parts.length > 2 ? parts[0] : '';
}