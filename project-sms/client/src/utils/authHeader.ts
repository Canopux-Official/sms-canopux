import { getOrgSlug } from "./tenant";


export function getAuthHeaders() {
    const token = window.localStorage.getItem("authToken");
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'X-Org-Slug': getOrgSlug()
    };
}