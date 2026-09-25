
// useAttendance.ts

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useIndexedDB';
import type { AttendanceFilters, AttendanceUpdate, StudentWithDirtyFlag } from '../types';
import { attendanceApi } from '../services/AttendanceApi';

// Add this helper function outside the hook


export const useAttendance = () => {
  const [students, setStudents] = useState<StudentWithDirtyFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>(() => {
    try {
      const saved = localStorage.getItem('attendanceFilters');
      if (saved) return JSON.parse(saved);
    } catch { }
    return {
      currentClass: '9',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };
  });
  const [dayHeaders, setDayHeaders] = useState<number[]>([]);
  const [monthName, setMonthName] = useState<string>('');
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);
  const [dirtyCount, setDirtyCount] = useState(0);


  // useEffect(() => {
  //   const scheduleCleanup = () => {
  //     const now = new Date();
  //     const midnight = new Date();
  //     midnight.setHours(24, 0, 0, 0);
  //     const msUntilMidnight = midnight.getTime() - now.getTime();

  //     return setTimeout(() => {
  //       const keysToDelete = Object.keys(localStorage).filter(
  //         (key) =>
  //           key.startsWith('attendance_data_') ||
  //           key === 'attendanceFilters'
  //       );
  //       keysToDelete.forEach((key) => localStorage.removeItem(key));
  //       console.log(`🧹 Cleaned ${keysToDelete.length} attendance keys`);

  //       // ✅ Reschedule for next midnight
  //       scheduleCleanup();
  //     }, msUntilMidnight);
  //   };

  //   const timer = scheduleCleanup();
  //   return () => clearTimeout(timer);
  // }, []);

  const {
    isInitialized,
    saveStudents,
    getAllStudents,
    updateAttendance,
    getDirtyStudents,
    clearDirtyFlags,
  } = useLocalStorage();

  // Fetch attendance data
  // const fetchAttendance = useCallback(async () => {
  //   if (!isInitialized) return;

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await attendanceApi.getAdminView(
  //       filters.currentClass,
  //       filters.streamId,
  //       filters.month,
  //       filters.year
  //     );

  //     if (response.success) {
  //       const { students: fetchedStudents, dayHeaders, monthName, isCurrentMonth } =
  //         response.data;


  //       // Save to localStorage
  //       await saveStudents(fetchedStudents, filters.month!, filters.year!);

  //       // Get from localStorage (to ensure consistency)
  //       const localStudents = await getAllStudents(
  //         filters.month!,
  //         filters.year!
  //       );

  //       console.log(`Loaded ${localStudents.length} students from localStorage`);

  //       setStudents(localStudents);
  //       setDayHeaders(dayHeaders);
  //       setMonthName(monthName);
  //       setIsCurrentMonth(isCurrentMonth);
  //       setDirtyCount(0);
  //     }
  //   } catch (err) {
  //     console.error('Fetch attendance error:', err);
  //     setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [
  //   isInitialized,
  //   filters,
  //   saveStudents,
  //   getAllStudents,
  // ]);

  // useAttendance.ts - fetchAttendance function

  const fetchAttendance = useCallback(async () => {
    if (!isInitialized) return;

    setLoading(true);
    setError(null);

    try {
      const response = await attendanceApi.getAdminView(
        filters.currentClass,
        filters.streamId,
        filters.month,
        filters.year
      );

      if (response.success) {
        const { students: fetchedStudents, dayHeaders, monthName, isCurrentMonth } =
          response.data;

        // ✅ Check if we have existing local data with dirty flags
        const existingStudents = await getAllStudents(filters.month!, filters.year!);
        const hasDirtyData = existingStudents.some(s => s.isDirty);

        if (hasDirtyData) {
          // Merge: keep dirty local changes, update rest from API
          const mergedStudents: any = fetchedStudents.map(apiStudent => {
            const localStudent = existingStudents.find(
              s => s.studentId === apiStudent.studentId
            );

            if (!localStudent?.isDirty) {
              // No local changes - use API data
              return apiStudent;
            }

            // Has local changes - merge attendance days
            const mergedDays = { ...apiStudent.attendance.days };

            // Overlay dirty days from local storage
            if (localStudent.dirtyDays) {
              localStudent.dirtyDays.forEach(day => {
                mergedDays[day.toString()] = localStudent.attendance.days[day.toString()];
              });
            }

            // Recalculate stats
            let present = 0, absent = 0;
            Object.values(mergedDays).forEach(status => {
              if (status === true) present++;
              if (status === false) absent++;
            });

            return {
              ...apiStudent,
              attendance: {
                days: mergedDays,
                stats: { present, absent },
              },
              isDirty: localStudent.isDirty,
              dirtyDays: localStudent.dirtyDays,
            };
          });

          // Save merged data back
          await saveStudents(mergedStudents, filters.month!, filters.year!);

          // Re-apply dirty flags (saveStudents clears them)
          // So load back from storage which has them
        } else {
          // ✅ No dirty data - safe to overwrite with fresh API data
          await saveStudents(fetchedStudents, filters.month!, filters.year!);
        }

        const localStudents = await getAllStudents(filters.month!, filters.year!);

        // ✅ Re-apply dirty flags if we had dirty data (saveStudents resets them)
        if (hasDirtyData) {
          const dirtyMap = new Map(
            existingStudents
              .filter(s => s.isDirty)
              .map(s => [s.studentId, s])
          );

          const studentsWithFlags = localStudents.map(s => {
            const dirty = dirtyMap.get(s.studentId);
            if (dirty) {
              return {
                ...s,
                isDirty: true,
                dirtyDays: dirty.dirtyDays,
              };
            }
            return s;
          });

          setStudents(studentsWithFlags);
          setDirtyCount(studentsWithFlags.filter(s => s.isDirty).length);
        } else {
          setStudents(localStudents);
          setDirtyCount(0);
        }

        setDayHeaders(dayHeaders);
        setMonthName(monthName);
        setIsCurrentMonth(isCurrentMonth);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, [isInitialized, filters, saveStudents, getAllStudents]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AttendanceFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      localStorage.setItem('attendanceFilters', JSON.stringify(next));
      return next;
    });
  }, []);

  // Toggle attendance for a single day
  const toggleAttendance = useCallback(
    async (studentId: string, day: number) => {
      // console.log(`Toggle clicked: ${studentId}, Day ${day}`);

      try {
        const student = students.find((s) => s.studentId === studentId);
        if (!student) {
          console.error('Student not found in state');
          return;
        }

        // Check enrollment date - prevent marking attendance before enrollment
        const attendanceDate = new Date(filters.year!, filters.month! - 1, day);
        const enrollmentDate = new Date(student.admissionDate);
        enrollmentDate.setHours(0, 0, 0, 0);
        attendanceDate.setHours(0, 0, 0, 0);

        if (attendanceDate < enrollmentDate) {
          setError(`Cannot mark attendance before enrollment date: ${enrollmentDate.toLocaleDateString()}`);
          return;
        }

        const currentStatus = student.attendance.days[day.toString()];
        let newStatus: boolean | null;

        // Cycle: null -> true (P) -> false (A) -> null
        if (currentStatus === null || currentStatus === undefined) {
          newStatus = true;
        } else if (currentStatus === true) {
          newStatus = false;
        } else {
          newStatus = null;
        }

        // console.log(`Toggling: ${studentId} Day ${day} from ${currentStatus} to ${newStatus}`);

        // Update in localStorage with month and year
        await updateAttendance(studentId, day, newStatus, filters.month!, filters.year!);

        // console.log('Update complete, refreshing from localStorage...');

        // Force refresh from localStorage
        const updatedStudents = await getAllStudents(
          filters.month!,
          filters.year!
        );

        // console.log(`Refreshed ${updatedStudents.length} students from localStorage`);

        setStudents(updatedStudents);

        // Update dirty count
        const dirtyStudents = updatedStudents.filter((s) => s.isDirty);
        setDirtyCount(dirtyStudents.length);

        // console.log(`✅ Toggle complete. Dirty count: ${dirtyStudents.length}`);
      } catch (err) {
        console.error('Toggle attendance error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to update attendance'
        );
      }
    },
    [students, filters, updateAttendance, getAllStudents]
  );

  // Mark all students for a specific day
  const markAllForDay = useCallback(
    async (day: number, status: boolean) => {
      try {
        // console.log(`Marking all students for day ${day} as ${status ? 'Present' : 'Absent'}`);

        // Update all students
        const updatePromises = students.map((student) =>
          updateAttendance(student.studentId, day, status, filters.month!, filters.year!)
        );
        await Promise.all(updatePromises);

        // Refresh from localStorage
        const updatedStudents = await getAllStudents(
          filters.month!,
          filters.year!
        );
        setStudents(updatedStudents);

        // Update dirty count
        const dirtyStudents = updatedStudents.filter((s) => s.isDirty);
        setDirtyCount(dirtyStudents.length);

        // console.log(`✅ Marked all complete. Dirty count: ${dirtyStudents.length}`);
      } catch (err) {
        console.error('Mark all error:', err);
        setError(err instanceof Error ? err.message : 'Failed to mark all');
      }
    },
    [students, filters, updateAttendance, getAllStudents]
  );

  // Sync changes to backend
  const syncChanges = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      const dirtyStudents = await getDirtyStudents(filters.month!, filters.year!);

      // console.log(`Found ${dirtyStudents.length} dirty students to sync`);

      if (dirtyStudents.length === 0) {
        setError('No changes to sync');
        setSyncing(false);
        return;
      }

      // Build updates array - ONLY include non-null statuses
      const updates: AttendanceUpdate[] = [];

      dirtyStudents.forEach((student) => {
        if (student.dirtyDays && student.dirtyDays.size > 0) {
          student.dirtyDays.forEach((day) => {
            const status = student.attendance.days[day.toString()];

            // IMPORTANT: Only send updates for Present (true) or Absent (false)
            // Don't send null - null means "delete this record" in backend
            let statusCode: 'P' | 'A' | '';

            if (status === true) {
              statusCode = 'P';
            } else if (status === false) {
              statusCode = 'A';
            } else {
              statusCode = ''; // Null status
            }
            updates.push({
              studentId: student.studentId,
              year: filters.year!,
              month: filters.month!,
              day,
              status: statusCode,
            });
          });
        }
      });

      // Check if we have any valid updates after filtering out nulls
      if (updates.length === 0) {
        setError('No valid attendance records to sync (all changes were deletions)');
        setSyncing(false);

        // Clear dirty flags even if no updates - user removed all marked attendance
        await clearDirtyFlags(filters.month!, filters.year!);

        // Refresh to update UI
        const updatedStudents = await getAllStudents(filters.month!, filters.year!);
        setStudents(updatedStudents);
        setDirtyCount(0);

        return;
      }

      // console.log(`Syncing ${updates.length} attendance updates...`);

      // Send to backend
      const response = await attendanceApi.syncAttendance(updates);

      if (response.success) {
        // console.log('✅ Sync successful');

        // Clear dirty flags
        await clearDirtyFlags(filters.month!, filters.year!);

        const keysToDelete = Object.keys(localStorage).filter(
          (key) =>
            key.startsWith('attendance_data_') ||
            key === 'attendanceFilters'
        );
        keysToDelete.forEach((key) => localStorage.removeItem(key));
        // console.log(`🧹 Cleared ${keysToDelete.length} attendance keys after sync`);

        // Refresh data from backend
        await fetchAttendance();

        return response;
      }
    } catch (err) {
      console.error('Sync error:', err);
      await clearDirtyFlags(filters.month!, filters.year!);

      const keysToDelete = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith('attendance_data_')
      );
      keysToDelete.forEach((key) => localStorage.removeItem(key));
      // console.log(`🧹 Cleared ${keysToDelete.length} attendance keys after sync`);

      // Refresh data from backend
      await fetchAttendance();
      setError(err instanceof Error ? err.message : 'Failed to sync changes');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [filters, getDirtyStudents, clearDirtyFlags, fetchAttendance, getAllStudents]);

  // Fetch on mount and filter change
  useEffect(() => {
    if (isInitialized && filters.currentClass) {
      fetchAttendance();
    }
  }, [isInitialized, filters.currentClass, filters.streamId, filters.month, filters.year]);

  return {
    students,
    loading,
    syncing,
    error,
    filters,
    dayHeaders,
    monthName,
    isCurrentMonth,
    dirtyCount,
    updateFilters,
    toggleAttendance,
    markAllForDay,
    syncChanges,
    refetch: fetchAttendance,
  };
};