// services/attendanceService.ts

import type { ApiResponse } from "../types";


const API_BASE_URL = import.meta.env.VITE_SERVER_LINK || 'http://localhost:5173';

function getAuthHeaders() {
    const token = window.localStorage.getItem("authToken");
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}

export const attendanceService = {
    /**
     * Get yearly attendance data
     */
    getYearlyAttendance: async (year: number): Promise<ApiResponse> => {
        try {

            const response = await fetch(`${API_BASE_URL}/student/attendance/yearly?year=${year}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attendance data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching attendance:', error);
            throw error;
        }
    },

    /**
     * Get available years
     */
    getAvailableYears: async (): Promise<{ success: boolean; data: { years: number[]; currentYear: number } }> => {
        try {

            const response = await fetch(`${API_BASE_URL}/student/attendance/years`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch available years');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching years:', error);
            throw error;
        }
    },
};