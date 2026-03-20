import { Request, Response } from 'express';

import mongoose from 'mongoose';
import Attendance, { IAttendance } from '../models/Attendance';

/**
 * Get attendance data for a student for a specific year
 * Returns all 12 months with attendance data and stats
 */
export const getYearlyAttendance = async (req: Request, res: Response) => {
    try {
        // Get userId from authenticated request (req.user.id)
        const studentId = req.user?.id;
        
        // Get year from query params
        const { year } = req.query;

        // Validation
        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Year parameter is required'
            });
        }

        const yearNum = parseInt(year as string);
        
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year provided'
            });
        }

        // Get current date to determine which months are in the future
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-12

        // Fetch all attendance records for the student for the specified year
        const attendanceRecords = await Attendance.find({
            studentId: new mongoose.Types.ObjectId(studentId),
            year: yearNum
        }).sort({ month: 1 });

        // Create a map for quick lookup
        const attendanceMap = new Map<number, IAttendance>();
        attendanceRecords.forEach(record => {
            attendanceMap.set(record.month, record);
        });

        // Prepare response data for all 12 months
        const monthsData = [];
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalDaysMarked = 0;

        for (let month = 1; month <= 12; month++) {
            const record = attendanceMap.get(month);
            
            // Determine month status
            let status: 'past' | 'current' | 'future';
            if (yearNum < currentYear || (yearNum === currentYear && month < currentMonth)) {
                status = 'past';
            } else if (yearNum === currentYear && month === currentMonth) {
                status = 'current';
            } else {
                status = 'future';
            }

            if (record) {
                // Convert Map to object for easier handling in frontend
                const daysObj: { [key: string]: boolean } = {};
                if (record.days instanceof Map) {
                    record.days.forEach((value, key) => {
                        daysObj[key] = value;
                    });
                }

                totalPresent += record.stats.present;
                totalAbsent += record.stats.absent;
                totalDaysMarked += record.stats.present + record.stats.absent;

                monthsData.push({
                    month,
                    year: yearNum,
                    status,
                    hasData: true,
                    days: daysObj,
                    stats: {
                        present: record.stats.present,
                        absent: record.stats.absent,
                        total: record.stats.present + record.stats.absent
                    }
                });
            } else {
                // No record exists for this month
                monthsData.push({
                    month,
                    year: yearNum,
                    status,
                    hasData: false,
                    days: {},
                    stats: {
                        present: 0,
                        absent: 0,
                        total: 0
                    },
                    message: status === 'future' 
                        ? 'This month hasn\'t started yet' 
                        : 'No attendance data available for this month'
                });
            }
        }

        // Calculate overall statistics
        const overallStats = {
            totalDaysMarked,
            totalPresent,
            totalAbsent,
            attendancePercentage: totalDaysMarked > 0 
                ? parseFloat(((totalPresent / totalDaysMarked) * 100).toFixed(2))
                : 0
        };

        // Response
        return res.status(200).json({
            success: true,
            data: {
                studentId,
                year: yearNum,
                months: monthsData,
                overallStats,
                currentDate: {
                    year: currentYear,
                    month: currentMonth
                }
            }
        });

    } catch (error) {
        console.error('Error fetching yearly attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


/**
 * Get attendance stats summary for a student
 * Useful for dashboard/overview
 */
export const getAttendanceStats = async (req: Request, res: Response) => {
    try {
        const studentId = req.user?.id;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get all attendance records for the student
        const attendanceRecords = await Attendance.find({
            studentId: new mongoose.Types.ObjectId(studentId)
        });

        let totalPresent = 0;
        let totalAbsent = 0;
        const yearlyStats: { [key: number]: { present: number; absent: number } } = {};

        attendanceRecords.forEach(record => {
            totalPresent += record.stats.present;
            totalAbsent += record.stats.absent;

            if (!yearlyStats[record.year]) {
                yearlyStats[record.year] = { present: 0, absent: 0 };
            }
            yearlyStats[record.year].present += record.stats.present;
            yearlyStats[record.year].absent += record.stats.absent;
        });

        const totalDays = totalPresent + totalAbsent;

        return res.status(200).json({
            success: true,
            data: {
                overall: {
                    totalDays,
                    present: totalPresent,
                    absent: totalAbsent,
                    attendancePercentage: totalDays > 0 
                        ? parseFloat(((totalPresent / totalDays) * 100).toFixed(2))
                        : 0
                },
                yearlyBreakdown: Object.entries(yearlyStats).map(([year, stats]) => ({
                    year: parseInt(year),
                    present: stats.present,
                    absent: stats.absent,
                    total: stats.present + stats.absent,
                    percentage: (stats.present + stats.absent) > 0
                        ? parseFloat(((stats.present / (stats.present + stats.absent)) * 100).toFixed(2))
                        : 0
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


/**
 * Get available years for a student
 * Helps populate year dropdown
 */
export const getAvailableYears = async (req: Request, res: Response) => {
    try {
        const studentId = req.user?.id;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const years = await Attendance.distinct('year', {
            studentId: new mongoose.Types.ObjectId(studentId)
        });

        // Sort years in descending order
        years.sort((a, b) => b - a);

        return res.status(200).json({
            success: true,
            data: {
                years,
                currentYear: new Date().getFullYear()
            }
        });

    } catch (error) {
        console.error('Error fetching available years:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};