import type { FileDetail } from "./FileDetail";
import type { ReferenceDetail } from "./referenceDetails";

export interface Subject {
  _id: string;
  name: string;
}


export interface NamedEntity {
  _id: string;
  name: string;
}


export interface Node {
  _id: string;
  heading: string;
  targetExam: NamedEntity | string;
  subject?: Subject | string;  // Can be populated object or just ID
  stream: NamedEntity | string | null;
  type: 'folder' | 'file';
  parentId: string | null;
  classType: string,
  description?: string;
  tags?: string[];
  lastDate?: string;
  createdAt?: string;
  updatedAt?: string;
  fileDetails?: FileDetail[];
  referenceDetails?: ReferenceDetail[];

  path?: Array<{
    id: string;
    heading: string;
  }>;
}