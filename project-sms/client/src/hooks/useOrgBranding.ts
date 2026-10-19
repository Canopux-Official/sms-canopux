import { useEffect } from 'react';

export function useOrgBranding(orgName?: string, FaviconUrl?: string, titleSuffix = '') {
    // Tab title
    useEffect(() => {
        if (!orgName) return;
        const prev = document.title;
        document.title = titleSuffix ? `${titleSuffix} | ${orgName}` : orgName;
        return () => { document.title = prev; };
    }, [orgName, titleSuffix]);

    // Favicon
    useEffect(() => {
        if (!FaviconUrl) return;
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        const prevHref = link.href;
        link.href = FaviconUrl;
        return () => { if (link) link.href = prevHref; };
    }, [FaviconUrl]);
}