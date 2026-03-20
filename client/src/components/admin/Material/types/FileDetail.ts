export interface FileDetail {
  fileName: string;
  uploadLink: string;
  fileId?: string;
}

export interface ExistingFile {
  fileName: string;
  uploadLink: string;
  fileId?: string;
  parentHeading: string;
  parentId: string;
}

export interface GetAllFilesResponse {
  message: string;
  success: boolean;
  count: number;
  data: ExistingFile[];
}
