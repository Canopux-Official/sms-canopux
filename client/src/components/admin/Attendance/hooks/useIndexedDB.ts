

// useLocalStorage.ts

import { useState, useEffect, useCallback } from 'react';
import { localStorageService } from '../services/IndexedDBServices';
import type { StudentWithDirtyFlag } from '../types';

export const useLocalStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await localStorageService.initDB();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize storage');
      }
    };
    init();
  }, []);

  const saveStudents = useCallback(
    async (students: StudentWithDirtyFlag[], month: number, year: number) => {
      try {
        await localStorageService.saveStudents(students, month, year);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save students');
        throw err;
      }
    },
    []
  );

  const getStudent = useCallback(async (studentId: string, month: number, year: number) => {
    try {
      return await localStorageService.getStudent(studentId, month, year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get student');
      throw err;
    }
  }, []);

  const getAllStudents = useCallback(async (month: number, year: number) => {
    try {
      return await localStorageService.getAllStudents(month, year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get students');
      throw err;
    }
  }, []);

  const updateAttendance = useCallback(
    async (studentId: string, day: number, status: boolean | null, month: number, year: number) => {
      try {
        await localStorageService.updateStudentAttendance(studentId, day, status, month, year);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update attendance'
        );
        throw err;
      }
    },
    []
  );

  const getDirtyStudents = useCallback(async (month: number, year: number) => {
    try {
      return await localStorageService.getDirtyStudents(month, year);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get dirty students'
      );
      throw err;
    }
  }, []);

  const clearDirtyFlags = useCallback(async (month: number, year: number) => {
    try {
      await localStorageService.clearDirtyFlags(month, year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear flags');
      throw err;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await localStorageService.clearAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
      throw err;
    }
  }, []);

  return {
    isInitialized,
    error,
    saveStudents,
    getStudent,
    getAllStudents,
    updateAttendance,
    getDirtyStudents,
    clearDirtyFlags,
    clearAll,
  };
};