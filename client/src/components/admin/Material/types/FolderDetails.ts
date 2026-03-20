export interface DeleteFolderResponse {
  success: boolean;
  message: string;
  requiresDriveDeletion?: boolean;
  driveFileIds?: string[];
  folderId?: string;
}