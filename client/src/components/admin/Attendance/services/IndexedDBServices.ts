// // localStorageService.ts
// import type { StudentWithDirtyFlag } from "../types";

import type { StudentWithDirtyFlag } from "../types";


// const STORAGE_KEY = 'attendance_data';

// interface StorageData {
//     students: StudentWithDirtyFlag[];
//     month: number;
//     year: number;
// }

// class LocalStorageService {
//     // Initialize - no-op for localStorage
//     async initDB(): Promise<void> {
//         return Promise.resolve();
//     }

//     private getStorageKey(month?: number, year?: number): string {
//         if (month !== undefined && year !== undefined) {
//             console.log(month, year)
//             return `${STORAGE_KEY}_${year}_${month}`;
//         }
//         return STORAGE_KEY;
//     }

//     private getData(month?: number, year?: number): StorageData | null {
//         try {
//             const key = this.getStorageKey(month, year);
//             console.log(key, month, year)
//             const data = localStorage.getItem(key);
//             console.log(data)
//             if (!data) return null;

//             const parsed = JSON.parse(data) as StorageData;

//             // Convert dirtyDays arrays back to Sets
//             parsed.students = parsed.students.map(s => ({
//                 ...s,
//                 dirtyDays: s.dirtyDays ? new Set(s.dirtyDays as any) : new Set<number>(),
//             }));

//             console.log(parsed)

//             return parsed;
//         } catch (error) {
//             console.error('Error reading from localStorage:', error);
//             return null;
//         }
//     }

//     // private setData(data: StorageData): void {
//     //     try {
//     //         console.log(data)
//     //         const key = this.getStorageKey(data.month, data.year);

//     //         // Convert Sets to Arrays for JSON serialization
//     //         const dataToStore = {
//     //             ...data,
//     //             students: data.students.map(s => ({
//     //                 ...s,
//     //                 dirtyDays: s.dirtyDays ? Array.from(s.dirtyDays) : [],
//     //             })),
//     //         };

//     //         console.log(dataToStore)

//     //         localStorage.setItem(key, JSON.stringify(dataToStore));
//     //     } catch (error) {
//     //         console.error('Error writing to localStorage:', error);
//     //         throw error;
//     //     }
//     // }

//     private setData(data: StorageData): void {
//         try {
//             if (typeof localStorage === 'undefined') {
//                 throw new Error('localStorage is not available in this environment');
//             }

//             console.log('Original data:', data);
//             const key = this.getStorageKey(data.month, data.year);

//             // Deep clone and convert Sets to Arrays for JSON serialization
//             const dataToStore = JSON.parse(JSON.stringify({
//                 ...data,
//                 students: data.students.map(s => ({
//                     ...s,
//                     dirtyDays: s.dirtyDays ? Array.from(s.dirtyDays) : [],
//                 })),
//             })); // Use JSON.parse/stringify for deep clone if needed, but watch for non-serializable props

//             console.log('Data to store:', dataToStore);

//             // Attempt to save
//             localStorage.setItem(key, JSON.stringify(dataToStore));

//             // Verify the save by retrieving and comparing
//             const retrieved = localStorage.getItem(key);
//             if (!retrieved) {
//                 throw new Error('Failed to retrieve data from localStorage after setItem');
//             }

//             const parsedRetrieved = JSON.parse(retrieved);
//             // Basic equality check (note: this is shallow; for deep compare, use a lib like lodash)
//             if (JSON.stringify(parsedRetrieved) !== JSON.stringify(dataToStore)) {
//                 throw new Error('Stored data does not match the original dataToStore');
//             }

//             console.log('Data successfully stored and verified for key:', key);
//         } catch (error) {
//             console.error('Error writing to localStorage:', error);
//             // Optional: Fallback logic, e.g., alert user or use sessionStorage
//             // alert('Failed to save data. Please check your browser storage settings.');
//             throw error;
//         }
//     }

//     async saveStudents(
//         students: StudentWithDirtyFlag[],
//         month: number,
//         year: number
//     ): Promise<void> {
//         const studentsWithFlags = students.map(s => ({
//             ...s,
//             month,
//             year,
//             isDirty: false,
//             dirtyDays: new Set<number>(),
//         }));

//         this.setData({
//             students: studentsWithFlags,
//             month,
//             year,
//         });

//         return Promise.resolve();
//     }

//     async getStudent(studentId: string): Promise<StudentWithDirtyFlag | null> {
//         // Get all students and find the one we need
//         const allData = this.getAllStorageData();

//         for (const data of allData) {
//             const student = data.students.find(s => s.studentId === studentId);
//             if (student) {
//                 return Promise.resolve(student);
//             }
//         }

//         return Promise.resolve(null);
//     }

//     private getAllStorageData(): StorageData[] {
//         const allData: StorageData[] = [];

//         // Iterate through all localStorage keys
//         for (let i = 0; i < localStorage.length; i++) {
//             const key = localStorage.key(i);
//             console.log(key)
//             if (key && key.startsWith(STORAGE_KEY)) {
//                 console.log(key.split('_'))
//                 const year = parseInt(key.split('_')[2]);
//                 const month = parseInt(key.split('_')[3]);
//                 const data = this.getData(month, year);
//                 if (data) {
//                     allData.push(data);
//                 }
//             }
//         }

//         return allData;
//     }

//     async getAllStudents(month?: number, year?: number): Promise<StudentWithDirtyFlag[]> {
//         const data = this.getData(month, year);
//         return Promise.resolve(data ? data.students : []);
//     }

//     async updateStudentAttendance(
//         studentId: string,
//         day: number,
//         status: boolean | null
//     ): Promise<void> {
//         // Find which month/year this student belongs to
//         const allData = this.getAllStorageData();
//         console.log(allData)

//         console.log(studentId, day, status)

//         for (const data of allData) {
//             console.log(data.students)
//             const studentIndex = data.students.findIndex(s => s.studentId === studentId);
//             console.log(studentIndex)

//             if (studentIndex !== -1) {
//                 const student = data.students[studentIndex];

//                 // Update attendance
//                 student.attendance.days[day.toString()] = status;

//                 // Mark as dirty
//                 student.isDirty = true;
//                 if (!student.dirtyDays) {
//                     student.dirtyDays = new Set<number>();
//                 }
//                 student.dirtyDays.add(day);

//                 // Save back to localStorage
//                 this.setData(data);
//                 return Promise.resolve();
//             }
//         }

//         console.log(this.setData)



//         return Promise.reject(new Error('Student not found'));
//     }

//     async getDirtyStudents(): Promise<StudentWithDirtyFlag[]> {
//         const allData = this.getAllStorageData();
//         const dirtyStudents: StudentWithDirtyFlag[] = [];

//         for (const data of allData) {
//             const dirty = data.students.filter(s => s.isDirty);
//             dirtyStudents.push(...dirty);
//         }

//         return Promise.resolve(dirtyStudents);
//     }

//     async clearDirtyFlags(): Promise<void> {
//         const allData = this.getAllStorageData();

//         for (const data of allData) {
//             data.students = data.students.map(s => ({
//                 ...s,
//                 isDirty: false,
//                 dirtyDays: new Set<number>(),
//             }));

//             this.setData(data);
//         }

//         return Promise.resolve();
//     }

//     async clearByMonthYear(month: number, year: number): Promise<void> {
//         const key = this.getStorageKey(month, year);
//         localStorage.removeItem(key);
//         return Promise.resolve();
//     }

//     async clearAll(): Promise<void> {
//         // Remove all attendance-related keys
//         const keysToRemove: string[] = [];

//         for (let i = 0; i < localStorage.length; i++) {
//             const key = localStorage.key(i);
//             if (key && key.startsWith(STORAGE_KEY)) {
//                 keysToRemove.push(key);
//             }
//         }

//         keysToRemove.forEach(key => localStorage.removeItem(key));
//         return Promise.resolve();
//     }
// }

// export const localStorageService = new LocalStorageService();



// localStorageService.ts


// localStorageService.ts


const STORAGE_KEY = 'attendance_data';

interface StorageData {
  students: StudentWithDirtyFlag[];
  month: number;
  year: number;
}

class LocalStorageService {
  // Initialize - no-op for localStorage
  async initDB(): Promise<void> {
    return Promise.resolve();
  }

  private getStorageKey(month: number, year: number): string {
    return `${STORAGE_KEY}_${year}_${month}`;
  }

  private getData(month: number, year: number): StorageData | null {
    try {
      const key = this.getStorageKey(month, year);
      const data = localStorage.getItem(key);

      if (!data) {
        // console.log(`No data found for key: ${key}`);
        return null;
      }

      const parsed = JSON.parse(data) as StorageData;

      // Convert dirtyDays arrays back to Sets
      parsed.students = parsed.students.map(s => ({
        ...s,
        dirtyDays: Array.isArray(s.dirtyDays)
          ? new Set(s.dirtyDays)
          : new Set<number>(),
      }));

      // console.log(`Loaded ${parsed.students.length} students from ${key}`);
      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private setData(data: StorageData): void {
    try {
      const key = this.getStorageKey(data.month, data.year);

      // Convert Sets to Arrays for JSON serialization
      const dataToStore = {
        ...data,
        students: data.students.map(s => ({
          ...s,
          dirtyDays: s.dirtyDays ? Array.from(s.dirtyDays) : [],
        })),
      };

      localStorage.setItem(key, JSON.stringify(dataToStore));
      // console.log(`Saved ${dataToStore.students.length} students to ${key}`);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw error;
    }
  }

  // async saveStudents(
  //   students: StudentWithDirtyFlag[],
  //   month: number,
  //   year: number
  // ): Promise<void> {
  //   const studentsWithFlags = students.map(s => ({
  //     ...s,
  //     month,
  //     year,
  //     isDirty: false,
  //     dirtyDays: new Set<number>(),
  //   }));

  //   this.setData({
  //     students: studentsWithFlags,
  //     month,
  //     year,
  //   });

  //   return Promise.resolve();
  // }

  async saveStudents(students: StudentWithDirtyFlag[], month: number, year: number): Promise<void> {
    const existing = this.getData(month, year);
    const existingMap = new Map(existing?.students.map(s => [s.studentId, s]) ?? []);

    const studentsToSave = students.map(s => {
      const existingStudent = existingMap.get(s.studentId);
      // Preserve dirty flags if student already has unsaved changes
      if (existingStudent?.isDirty) {
        return existingStudent;
      }
      return {
        ...s,
        isDirty: false,
        dirtyDays: new Set<number>(),
      };
    });

    this.setData({ students: studentsToSave, month, year });
  }

  async getStudent(studentId: string, month: number, year: number): Promise<StudentWithDirtyFlag | null> {
    const data = this.getData(month, year);

    if (!data) {
      return Promise.resolve(null);
    }

    const student = data.students.find(s => s.studentId === studentId);
    return Promise.resolve(student || null);
  }

  async getAllStudents(month: number, year: number): Promise<StudentWithDirtyFlag[]> {
    const data = this.getData(month, year);
    return Promise.resolve(data ? data.students : []);
  }

  async updateStudentAttendance(
    studentId: string,
    day: number,
    status: boolean | null,
    month: number,
    year: number
  ): Promise<void> {
    // console.log(`Updating attendance: ${studentId}, Day ${day}, Status: ${status}, Month: ${month}, Year: ${year}`);

    try {
      // Get current data for this month/year
      const data = this.getData(month, year);

      if (!data) {
        console.error(`No data found for ${month}/${year}`);
        return Promise.reject(new Error(`No data found for ${month}/${year}`));
      }

      // Find student
      const studentIndex = data.students.findIndex(s => s.studentId === studentId);

      if (studentIndex === -1) {
        console.error(`Student ${studentId} not found`);
        return Promise.reject(new Error('Student not found'));
      }

      const student = data.students[studentIndex];

      console.log(`Before update:`, {
        studentId: student.studentId,
        day,
        oldStatus: student.attendance.days[day.toString()],
        newStatus: status,
        isDirty: student.isDirty,
        dirtyDays: Array.from(student.dirtyDays || [])
      });

      // Update attendance
      student.attendance.days[day.toString()] = status;

      // Mark as dirty
      student.isDirty = true;
      if (!student.dirtyDays) {
        student.dirtyDays = new Set<number>();
      }
      student.dirtyDays.add(day);

      // Recalculate stats
      let presentCount = 0;
      let absentCount = 0;

      Object.entries(student.attendance.days).forEach(([_, dayStatus]) => {
        if (dayStatus === true) presentCount++;
        if (dayStatus === false) absentCount++;
      });

      student.attendance.stats = {
        present: presentCount,
        absent: absentCount,
      };

      console.log(`After update:`, {
        studentId: student.studentId,
        day,
        status: student.attendance.days[day.toString()],
        isDirty: student.isDirty,
        dirtyDays: Array.from(student.dirtyDays),
        stats: student.attendance.stats
      });

      // Save back to localStorage
      this.setData(data);

      // console.log(`✅ Successfully updated attendance for student ${studentId}`);

      return Promise.resolve();
    } catch (error) {
      console.error('Update attendance error:', error);
      return Promise.reject(error);
    }
  }

  async getDirtyStudents(month: number, year: number): Promise<StudentWithDirtyFlag[]> {
    const data = this.getData(month, year);

    if (!data) {
      return Promise.resolve([]);
    }

    const dirtyStudents = data.students.filter(s => s.isDirty);
    // console.log(`Found ${dirtyStudents.length} dirty students`);

    return Promise.resolve(dirtyStudents);
  }

  async clearDirtyFlags(month: number, year: number): Promise<void> {
    const data = this.getData(month, year);

    if (!data) {
      return Promise.resolve();
    }

    data.students = data.students.map(s => ({
      ...s,
      isDirty: false,
      dirtyDays: new Set<number>(),
    }));

    this.setData(data);
    // console.log(`Cleared dirty flags for ${month}/${year}`);

    return Promise.resolve();
  }

  async clearByMonthYear(month: number, year: number): Promise<void> {
    const key = this.getStorageKey(month, year);
    localStorage.removeItem(key);
    // console.log(`Cleared data for ${key}`);
    return Promise.resolve();
  }

  async clearAll(): Promise<void> {
    // Remove all attendance-related keys
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    // console.log(`Cleared ${keysToRemove.length} attendance keys`);

    return Promise.resolve();
  }
}

export const localStorageService = new LocalStorageService();