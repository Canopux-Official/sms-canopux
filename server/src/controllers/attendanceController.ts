import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student';
import Attendance from '../models/Attendance';

/**
 * GET /api/attendance/admin-view
 * Fetch merged list of active students and their attendance records for a specific month/year
 */
export const getAdminAttendanceView = async (req: Request, res: Response) => {
  try {
    const {
      currentClass,
      streamId,
      month,
      year
    } = req.query;

    // Get current date for defaults
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // Use provided month/year or default to current
    const selectedMonth = month ? parseInt(month as string) : currentMonth;
    const selectedYear = year ? parseInt(year as string) : currentYear;

    // Validate month and year ranges
    if (selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    if (selectedYear < 2000 || selectedYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year'
      });
    }

    // Determine if we're viewing the current month/year
    const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;

    // Calculate the last day to show
    // If current month: show only up to today (e.g., 1-7 for Feb 7)
    // If previous month: show full month (e.g., 1-31 for January)
    const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const lastDayToShow = isCurrentMonth ? currentDay : lastDayOfMonth;

    // Build student filter based on provided parameters
    const studentFilter: any = {
      isActive: true,
      admissionDate: { $lte: new Date(selectedYear, selectedMonth - 1, lastDayToShow, 23, 59, 59, 999) }
    };

    // Add currentClass filter (required - enum value, not ObjectId)
    if (!currentClass) {
      return res.status(400).json({
        success: false,
        message: 'currentClass is required'
      });
    }
    studentFilter.currentClass = currentClass;

    // Handle stream filter based on class
    // Class 9 & 10: No stream (stream should be null)
    // Class 11, 12, droppers: Stream is required
    if (['9', '10'].includes(currentClass as string)) {
      // For class 9 and 10, stream must be null or missing
      studentFilter.stream = { $in: [null, undefined] };

      // If streamId is provided for class 9/10, return error
      if (streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream filter is not applicable for class 9 and 10'
        });
      }
    } else if (['11', '12', 'dropper-1', 'dropper-2'].includes(currentClass as string)) {
      // For class 11, 12, and droppers, stream is required
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: 'Stream is required for class 11, 12, and droppers'
        });
      }
      studentFilter.stream = new mongoose.Types.ObjectId(streamId as string);
    }

    console.log(`[DEBUG] Fetching attendance view with filter:`, JSON.stringify(studentFilter, null, 2));

    // Aggregation pipeline to merge students with their attendance
    const result = await Student.aggregate([
      // Stage 1: Filter active students based on criteria
      {
        $match: studentFilter
      },

      // Stage 2: Lookup attendance records for the specific month/year
      {
        $lookup: {
          from: 'attendances',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $eq: ['$month', selectedMonth] },
                    { $eq: ['$year', selectedYear] }
                  ]
                }
              }
            }
          ],
          as: 'attendanceRecord'
        }
      },

      // Stage 3: Unwind attendance (or create empty if not exists)
      {
        $unwind: {
          path: '$attendanceRecord',
          preserveNullAndEmptyArrays: true
        }
      },

      // Stage 4: Lookup stream details (if exists)
      {
        $lookup: {
          from: 'streams',
          localField: 'stream',
          foreignField: '_id',
          as: 'streamInfo'
        }
      },

      // Stage 5: Lookup target exam details (for display only, not filtering)
      {
        $lookup: {
          from: 'targetexams',
          localField: 'targetExams',
          foreignField: '_id',
          as: 'targetExamInfo'
        }
      },

      // Stage 6: Lookup enrolled subjects
      {
        $lookup: {
          from: 'subjects',
          localField: 'enrolledSubjects',
          foreignField: '_id',
          as: 'subjectInfo'
        }
      },

      // Stage 7: Project the final structure
      {
        $project: {
          studentId: '$_id',
          name: 1,
          phoneNumber: 1,
          email: 1,
          currentClass: 1,
          academicSession: 1,
          admissionDate: 1,
          stream: {
            $cond: {
              if: { $gt: [{ $size: '$streamInfo' }, 0] },
              then: { $arrayElemAt: ['$streamInfo.name', 0] },
              else: null
            }
          },
          streamId: '$stream',
          targetExams: {
            $map: {
              input: '$targetExamInfo',
              as: 'exam',
              in: {
                id: '$$exam._id',
                name: '$$exam.name'
              }
            }
          },
          subjects: {
            $map: {
              input: '$subjectInfo',
              as: 'subject',
              in: {
                id: '$$subject._id',
                name: '$$subject.name'
              }
            }
          },
          attendance: {
            $cond: {
              if: { $ifNull: ['$attendanceRecord', false] },
              then: {
                days: {
                  $objectToArray: '$attendanceRecord.days'
                },
                stats: '$attendanceRecord.stats',
                attendanceId: '$attendanceRecord._id'
              },
              else: {
                days: [],
                stats: { present: 0, absent: 0 },
                attendanceId: null
              }
            }
          }
        }
      },

      // Stage 8: Sort by name
      {
        $sort: { name: 1 }
      }
    ]);

    // Process attendance days to create a proper grid structure
    // For current month: day 1 to current day (e.g., 1-7)
    // For previous months: day 1 to last day of that month (e.g., 1-31)
    const processedResult = result.map(student => {
      const daysMap: { [key: string]: boolean | null } = {};

      // Initialize days from 1 to lastDayToShow
      for (let day = 1; day <= lastDayToShow; day++) {
        daysMap[day.toString()] = null; // null means no record
      }

      // Fill in actual attendance data (only for days within our range)
      if (student.attendance.days && student.attendance.days.length > 0) {
        student.attendance.days.forEach((dayObj: any) => {
          const dayNum = parseInt(dayObj.k);
          const isPresent = dayObj.v;

          // Only include days within our display range
          if (dayNum >= 1 && dayNum <= lastDayToShow) {
            daysMap[dayNum.toString()] = isPresent;
          }
        });
      }

      // Recalculate stats for the visible days only
      let presentCount = 0;
      let absentCount = 0;

      Object.values(daysMap).forEach(status => {
        if (status === true) presentCount++;
        if (status === false) absentCount++;
      });

      return {
        ...student,
        attendance: {
          days: daysMap,
          stats: {
            present: presentCount,
            absent: absentCount
          },
          attendanceId: student.attendance.attendanceId
        }
      };
    });

    // Calculate summary statistics
    const summary = {
      totalStudents: processedResult.length,
      studentsWithRecords: processedResult.filter(s => s.attendance.attendanceId).length,
      studentsWithoutRecords: processedResult.filter(s => !s.attendance.attendanceId).length,
      totalPresent: processedResult.reduce((sum, s) => sum + (s.attendance.stats.present || 0), 0),
      totalAbsent: processedResult.reduce((sum, s) => sum + (s.attendance.stats.absent || 0), 0),
      totalDaysTracked: lastDayToShow,
      averageAttendancePercentage: processedResult.length > 0
        ? ((processedResult.reduce((sum, s) => {
          const total = s.attendance.stats.present + s.attendance.stats.absent;
          return sum + (total > 0 ? (s.attendance.stats.present / total) * 100 : 0);
        }, 0) / processedResult.length).toFixed(2))
        : 0
    };

    // Generate day headers for the grid
    const dayHeaders = Array.from({ length: lastDayToShow }, (_, i) => i + 1);

    return res.status(200).json({
      success: true,
      message: 'Attendance records fetched successfully',
      data: {
        month: selectedMonth,
        year: selectedYear,
        monthName: new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' }),
        isCurrentMonth,
        dayHeaders,
        lastDayToShow,
        lastDayOfMonth,
        students: processedResult,
        summary,
        filters: {
          currentClass: currentClass,
          streamId: streamId || null
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin attendance view:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};



interface AttendanceUpdate {
  studentId: string;
  year: number;
  month: number;
  day: number;
  status: 'P' | 'A' | ""; // P = Present, A = Absent
}

interface BulkSyncRequest {
  updates: AttendanceUpdate[];
}

/**
 * Helper function to safely convert to ObjectId
 */
const toObjectId = (id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId => {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
};

/**
 * POST /api/attendance/sync
 * Bulk sync attendance records - handles both creating new records and updating existing ones
 */
export const bulkSyncAttendance = async (req: Request, res: Response) => {
  try {
    const { updates }: BulkSyncRequest = req.body;

    // Validation
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and must not be empty'
      });
    }

    // Validate each update
    for (const update of updates) {
      if (!update.studentId || !update.year || !update.month || !update.day) {
        return res.status(400).json({
          success: false,
          message: 'Each update must have studentId, year, month, day'
        });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(update.studentId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid studentId format: ${update.studentId}`
        });
      }

      if (!['P', 'A', ""].includes(update.status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "P" (Present) or "A" (Absent) or empty string (default)'
        });
      }

      if (update.month < 1 || update.month > 12) {
        return res.status(400).json({
          success: false,
          message: 'Month must be between 1 and 12'
        });
      }

      if (update.day < 1 || update.day > 31) {
        return res.status(400).json({
          success: false,
          message: 'Day must be between 1 and 31'
        });
      }
    }

    // Get unique student IDs and convert to ObjectIds
    const studentIds = [...new Set(updates.map(u => u.studentId))];
    const studentObjectIds = studentIds.map(id => toObjectId(id));

    // Fetch all students to validate enrollment dates and existence
    const students = await Student.find({
      _id: { $in: studentObjectIds },
      isActive: true
    });

    // Create a map for quick student lookup
    const studentMap = new Map(
      students.map(s => [s._id.toString(), s])
    );

    // Validate ghost attendance (marking before enrollment)
    const ghostAttendanceErrors: string[] = [];
    const validUpdates: AttendanceUpdate[] = [];

    for (const update of updates) {
      const student = studentMap.get(update.studentId);

      if (!student) {
        ghostAttendanceErrors.push(
          `Student ${update.studentId} not found or inactive`
        );
        continue;
      }

      // Check if marking attendance before enrollment date
      const attendanceDate = new Date(update.year, update.month - 1, update.day);
      const enrollmentDate = new Date(student.admissionDate);
      enrollmentDate.setHours(0, 0, 0, 0);

      if (attendanceDate < enrollmentDate) {
        ghostAttendanceErrors.push(
          `Cannot mark attendance for ${student.name} on ${update.day}/${update.month}/${update.year} - Student enrolled on ${enrollmentDate.toLocaleDateString()}`
        );
        continue;
      }

      // Check if marking attendance in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (attendanceDate > today) {
        ghostAttendanceErrors.push(
          `Cannot mark attendance for ${student.name} on ${update.day}/${update.month}/${update.year} - Date is in the future`
        );
        continue;
      }

      validUpdates.push(update);
    }

    // If there are validation errors and no valid updates, return error
    if (ghostAttendanceErrors.length > 0 && validUpdates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All updates failed validation',
        errors: ghostAttendanceErrors
      });
    }

    // Group updates by studentId, year, and month for efficient processing
    const groupedUpdates = new Map<string, AttendanceUpdate[]>();

    for (const update of validUpdates) {
      const key = `${update.studentId}_${update.year}_${update.month}`;
      if (!groupedUpdates.has(key)) {
        groupedUpdates.set(key, []);
      }
      groupedUpdates.get(key)!.push(update);
    }

    // Prepare bulk operations
    const bulkOps: any[] = [];
    const affectedRecords = new Map<string, any>();

    for (const [key, monthUpdates] of groupedUpdates.entries()) {
      const [studentId, year, month] = key.split('_');

      // Create updates for days object
      const daysUpdate: any = {};
      for (const update of monthUpdates) {
        if (update.status == "") {
          daysUpdate[`days.${update.day}`] = null; // Treat empty string as null (no record)
        }
        else {
          daysUpdate[`days.${update.day}`] = update.status === 'P';
        }

      }

      // Upsert operation: update if exists, create if doesn't
      bulkOps.push({
        updateOne: {
          filter: {
            studentId: toObjectId(studentId),
            year: parseInt(year),
            month: parseInt(month)
          },
          update: {
            $set: daysUpdate,
            $setOnInsert: {
              studentId: toObjectId(studentId),
              year: parseInt(year),
              month: parseInt(month),
              stats: {
                present: 0,
                absent: 0
              }
            }
          },
          upsert: true
        }
      });

      affectedRecords.set(key, {
        studentId: toObjectId(studentId),
        year: parseInt(year),
        month: parseInt(month)
      });
    }

    // Execute bulk write
    let bulkWriteResult;
    if (bulkOps.length > 0) {
      bulkWriteResult = await Attendance.bulkWrite(bulkOps);
    }

    // Recalculate stats for all affected records
    const statsUpdates: any[] = [];

    for (const [key, record] of affectedRecords.entries()) {
      // Fetch the updated record
      const attendanceRecord = await Attendance.findOne({
        studentId: record.studentId,
        year: record.year,
        month: record.month
      });

      if (attendanceRecord) {
        // Calculate present and absent counts
        let presentCount = 0;
        let absentCount = 0;

        const daysMap = attendanceRecord.days as Map<string, boolean>;

        if (daysMap && daysMap instanceof Map) {
          for (const [day, isPresent] of daysMap.entries()) {
            if (isPresent === true) {
              presentCount++;
            } else if (isPresent === false) {
              absentCount++;
            }
          }
        } else if (daysMap && typeof daysMap === 'object') {
          // Handle case where days might be stored as plain object
          Object.values(daysMap).forEach(isPresent => {
            if (isPresent === true) {
              presentCount++;
            } else if (isPresent === false) {
              absentCount++;
            }
          });
        }

        // Update stats
        statsUpdates.push({
          updateOne: {
            filter: {
              studentId: record.studentId,
              year: record.year,
              month: record.month
            },
            update: {
              $set: {
                'stats.present': presentCount,
                'stats.absent': absentCount
              }
            }
          }
        });
      }
    }

    // Execute stats updates
    if (statsUpdates.length > 0) {
      await Attendance.bulkWrite(statsUpdates);
    }

    // Fetch final updated records to return
    const updatedRecords = await Attendance.find({
      $or: Array.from(affectedRecords.values()).map(r => ({
        studentId: r.studentId,
        year: r.year,
        month: r.month
      }))
    }).populate('studentId', 'name phoneNumber email currentClass');

    // Prepare response
    const response = {
      success: true,
      message: 'Attendance synced successfully',
      data: {
        totalUpdates: updates.length,
        validUpdates: validUpdates.length,
        failedUpdates: ghostAttendanceErrors.length,
        recordsModified: bulkWriteResult ? bulkWriteResult.modifiedCount : 0,
        recordsCreated: bulkWriteResult ? bulkWriteResult.upsertedCount : 0,
        updatedRecords: updatedRecords.map(record => ({
          studentId: record.studentId,
          studentName: (record.studentId as any).name,
          year: record.year,
          month: record.month,
          stats: record.stats
        }))
      },
      warnings: ghostAttendanceErrors.length > 0 ? ghostAttendanceErrors : undefined
    };

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('Error syncing attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync attendance',
      error: error.message
    });
  }
};