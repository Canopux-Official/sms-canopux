// types/attendance.types.ts

export interface MonthData {
  month: number;
  year: number;
  status: 'past' | 'current' | 'future';
  hasData: boolean;
  days: { [key: string]: boolean };
  stats: {
    present: number;
    absent: number;
    total: number;
  };
  message?: string;
}

export interface OverallStats {
  totalDaysMarked: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
}

export interface AttendanceData {
  studentId: string;
  year: number;
  months: MonthData[];
  overallStats: OverallStats;
  currentDate: {
    year: number;
    month: number;
  };
}

export interface ApiResponse {
  success: boolean;
  data: AttendanceData;
  message?: string;
}