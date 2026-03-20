// attendance.types.ts

export interface Student {
  studentId: string;
  name: string;
  phoneNumber: string;
  email: string;
  currentClass: string;
  stream: string | null;
  streamId: string | null;
  academicSession: string;
  admissionDate: string;
  targetExams: Array<{
    id: string;
    name: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
  }>;
  attendance: {
    days: { [key: string]: boolean | null };
    stats: {
      present: number;
      absent: number;
    };
    attendanceId: string | null;
  };
}

export interface Stream {
  _id: string;
  name: string;
  description?: string;
}

export interface TargetExam {
  _id: string;
  name: string;
  description?: string;
}

export interface AttendanceDay {
  day: number;
  status: boolean | null; // true = Present, false = Absent, null = No record
}

export interface StudentWithDirtyFlag extends Student {
  isDirty?: boolean;
  dirtyDays?: Set<number>; // Track which specific days are dirty
}

export interface AttendanceFilters {
  currentClass: string;
  streamId?: string;
  month?: number;
  year?: number;
}

export interface AttendanceSummary {
  totalStudents: number;
  studentsWithRecords: number;
  studentsWithoutRecords: number;
  totalPresent: number;
  totalAbsent: number;
  totalDaysTracked: number;
  averageAttendancePercentage: string;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: {
    month: number;
    year: number;
    monthName: string;
    isCurrentMonth: boolean;
    dayHeaders: number[];
    lastDayToShow: number;
    lastDayOfMonth: number;
    students: Student[];
    summary: AttendanceSummary;
    filters: {
      currentClass: string | null;
      streamId: string | null;
    };
  };
}

export interface AttendanceUpdate {
  studentId: string;
  year: number;
  month: number;
  day: number;
  status: 'P' | 'A' | "";
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data: {
    totalUpdates: number;
    validUpdates: number;
    failedUpdates: number;
    recordsModified: number;
    recordsCreated: number;
    updatedRecords: Array<{
      studentId: string;
      studentName: string;
      year: number;
      month: number;
      stats: {
        present: number;
        absent: number;
      };
    }>;
  };
  warnings?: string[];
}

export type AttendanceStatus = 'P' | 'A' | null;