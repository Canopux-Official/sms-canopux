export type ClassType = '9' | '10' | '11' | '12' | 'dropper-1' | 'dropper-2';

export interface Stream {
  _id: string;
  name: string;
}

export interface TargetExam {
  _id: string;
  name: string;
}

export interface Notice {
  _id: string;
  heading: string;
  description?: string;
  imageLink?: string;
  tag?: string;
  classType?: string;
  streams?: Stream[]; // Changed to array
  targetExams?: TargetExam[]; // Changed to array
  isForAll: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFormData {
  heading: string;
  description: string;
  imageLink: string;
  tag: string;
  classType: string;
  streams: string[]; // Changed to array of IDs
  targetExams: string[]; // Changed to array of IDs
  isForAll: boolean;
}