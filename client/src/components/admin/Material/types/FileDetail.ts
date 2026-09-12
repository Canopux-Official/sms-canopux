export interface FileDetail {
  fileName: string;
  uploadLink: string;
}

export interface ExistingFile {
  fileName: string;
  uploadLink: string;
  parentHeading: string;
  parentId: string;
}

export interface GetAllFilesResponse {
  message: string;
  success: boolean;
  count: number;
  data: ExistingFile[];
}
