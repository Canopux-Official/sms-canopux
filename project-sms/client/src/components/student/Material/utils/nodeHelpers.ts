import type { Node } from "../../../admin/Material/types/node";

type Named = { name?: string } | string | null | undefined;

/** Subject name if the subject is populated, else the heading, else "Untitled". */
export const getDisplayHeading = (
    node: Partial<Node> | { id: string; heading: string }
): string => {
    const subject = (node as Partial<Node>).subject;
    if (subject && typeof subject === "object" && subject.name) return subject.name;
    return node.heading || "Untitled";
};

/** Name from a populated object, or the string itself, or an empty string. */
export const getNameLabel = (field: Named): string => {
    if (!field) return "";
    if (typeof field === "object") return field.name || "";
    return field;
};

/** "Oct 10, 2026" (short) or "October 10, 2026" (long). Null if missing or invalid. */
export const formatDate = (value?: string, style: "short" | "long" = "short"): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
        month: style === "short" ? "short" : "long",
        day: "2-digit",
        year: "numeric",
    });
};

/** Colour for a due date: overdue, due within 3 days, or fine. */
export const getDueTone = (lastDate?: string): { color: string; label: string | null } => {
    if (!lastDate) return { color: "#9ca3af", label: null };
    const due = new Date(lastDate);
    if (isNaN(due.getTime())) return { color: "#9ca3af", label: null };
    due.setHours(23, 59, 59, 999);
    const days = (due.getTime() - Date.now()) / 86400000;
    if (days < 0) return { color: "#d32f2f", label: "Overdue" };
    if (days <= 3) return { color: "#ed6c02", label: "Due soon" };
    return { color: "#4b5563", label: null };
};