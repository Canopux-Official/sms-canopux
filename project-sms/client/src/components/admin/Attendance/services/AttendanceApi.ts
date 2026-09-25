import type { AttendanceResponse, AttendanceUpdate, Student, SyncResponse } from "../types";


function getAuthHeaders() {
    const token = window.localStorage.getItem("authToken");
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}


// Demo data generator
const generateDemoData = (
  currentClass: string,
  streamId?: string,
  month?: number,
  year?: number
): AttendanceResponse => {
  const now = new Date();
  const selectedMonth = month || now.getMonth() + 1;
  const selectedYear = year || now.getFullYear();
  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
  const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const lastDayToShow = isCurrentMonth ? now.getDate() : lastDayOfMonth;

  // Generate demo students
  const studentCount = 30;
  const students: Student[] = [];

  for (let i = 1; i <= studentCount; i++) {
    const days: { [key: string]: boolean | null } = {};
    
    // Generate random attendance
    for (let day = 1; day <= lastDayToShow; day++) {
      const random = Math.random();
      if (random < 0.75) {
        days[day.toString()] = true; // Present
      } else if (random < 0.9) {
        days[day.toString()] = false; // Absent
      } else {
        days[day.toString()] = null; // No record
      }
    }

    // Calculate stats
    const presentCount = Object.values(days).filter((d) => d === true).length;
    const absentCount = Object.values(days).filter((d) => d === false).length;

    students.push({
      studentId: `student-${i}`,
      name: `Student ${i}`,
      phoneNumber: `98765432${String(i).padStart(2, '0')}`,
      email: `student${i}@example.com`,
      currentClass,
      stream: ['11', '12', 'dropper-1', 'dropper-2'].includes(currentClass)
        ? streamId === 'science'
          ? 'Science'
          : streamId === 'commerce'
          ? 'Commerce'
          : 'Arts'
        : null,
      streamId: ['11', '12', 'dropper-1', 'dropper-2'].includes(currentClass)
        ? streamId || null
        : null,
      academicSession: '2025-2026',
      admissionDate: new Date(2025, 5, 1).toISOString(),
      targetExams: [
        { id: 'jee-id', name: 'JEE' },
        { id: 'neet-id', name: 'NEET' },
      ],
      subjects: [
        { id: 'math-id', name: 'Mathematics' },
        { id: 'physics-id', name: 'Physics' },
        { id: 'chemistry-id', name: 'Chemistry' },
      ],
      attendance: {
        days,
        stats: {
          present: presentCount,
          absent: absentCount,
        },
        attendanceId: `attendance-${i}`,
      },
    });
  }

  const summary = {
    totalStudents: students.length,
    studentsWithRecords: students.filter((s) => s.attendance.attendanceId)
      .length,
    studentsWithoutRecords: students.filter((s) => !s.attendance.attendanceId)
      .length,
    totalPresent: students.reduce(
      (sum, s) => sum + s.attendance.stats.present,
      0
    ),
    totalAbsent: students.reduce((sum, s) => sum + s.attendance.stats.absent, 0),
    totalDaysTracked: lastDayToShow,
    averageAttendancePercentage: (
      students.reduce((sum, s) => {
        const total = s.attendance.stats.present + s.attendance.stats.absent;
        return sum + (total > 0 ? (s.attendance.stats.present / total) * 100 : 0);
      }, 0) / students.length
    ).toFixed(2),
  };

  return {
    success: true,
    message: 'Attendance records fetched successfully',
    data: {
      month: selectedMonth,
      year: selectedYear,
      monthName: new Date(selectedYear, selectedMonth - 1).toLocaleString(
        'default',
        { month: 'long' }
      ),
      isCurrentMonth,
      dayHeaders: Array.from({ length: lastDayToShow }, (_, i) => i + 1),
      lastDayToShow,
      lastDayOfMonth,
      students,
      summary,
      filters: {
        currentClass,
        streamId: streamId || null,
      },
    },
  };
};

const host = import.meta.env.VITE_SERVER_LINK || ''; 

// API Service
class AttendanceApiService {

  private baseUrl = `${host}/admin/attendance`; // Change this to your actual API URL
  private useDemoData = false; // Set to false when ready to use real API

  async getAdminView(
    currentClass: string,
    streamId?: string,
    month?: number,
    year?: number
  ): Promise<AttendanceResponse> {
    if (this.useDemoData) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return generateDemoData(currentClass, streamId, month, year);
    }

    // Real API call
    const params = new URLSearchParams({
      currentClass,
      ...(streamId && { streamId }),
      ...(month && { month: month.toString() }),
      ...(year && { year: year.toString() }),
    });

    const response = await fetch(`${this.baseUrl}/view?${params}`,{
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }
    return response.json();
  }

  async syncAttendance(updates: AttendanceUpdate[]): Promise<SyncResponse> {
    if (this.useDemoData) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Demo response
      return {
        success: true,
        message: 'Attendance synced successfully',
        data: {
          totalUpdates: updates.length,
          validUpdates: updates.length,
          failedUpdates: 0,
          recordsModified: updates.length,
          recordsCreated: 0,
          updatedRecords: updates.map((u) => ({
            studentId: u.studentId,
            studentName: `Student ${u.studentId.split('-')[1]}`,
            year: u.year,
            month: u.month,
            stats: {
              present: Math.floor(Math.random() * 20) + 10,
              absent: Math.floor(Math.random() * 5),
            },
          })),
        },
      };
    }

    // Real API call
    const response = await fetch(`${this.baseUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync attendance');
    }
    return response.json();
  }

  setUseDemoData(useDemoData: boolean) {
    this.useDemoData = useDemoData;
  }
}

export const attendanceApi = new AttendanceApiService();