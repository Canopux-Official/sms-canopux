export interface INamedEntity {
  _id: string;
  name: string;
}

export type TestStatus = 'draft' | 'scheduled' | 'published';

export interface Test {
  _id: string;
  heading: string;
  description?: string;
  totalMarks: number;
  testDate: string;
  classType: string;
  stream?: INamedEntity | null;
  targetExam: INamedEntity;
  status: TestStatus;
  assignedCount?: number;
  enteredCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestFormData {
  heading: string;
  description: string;
  totalMarks: number | '';
  testDate: string;
  classType: string;
  stream: string;
  targetExam: string;
}

export interface EligibleStudent {
  _id: string;
  name: string;
  enrollmentNumber: string;
  phoneNumber: string;
  isAssigned: boolean;
}

export interface MarksEntryRow {
  resultId: string;
  studentId: string;
  name: string;
  enrollmentNumber: string;
  marksObtained: number | null;
  isAbsent: boolean;
  percentage: number | null;
  rank: number | null;
}

export interface MarksEntryResponse {
  test: Test;
  results: MarksEntryRow[];
}