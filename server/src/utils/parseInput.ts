// server/src/utils/parseInput.ts
// Tiny request-body parsing helpers shared by the platform controllers.

export const isBlank = (v: unknown): boolean => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Parses a Date from an ISO string / timestamp. Returns null when it's not a valid date. */
export const parseDate = (v: unknown): Date | null => {
    if (v === undefined || v === null || v === '') return null;
    const d = new Date(v as any);
    return Number.isNaN(d.getTime()) ? null : d;
};

/** Trims and length-limits a free-text field. */
export const cleanText = (v: unknown, max: number): string => String(v ?? '').trim().slice(0, max);

export const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');