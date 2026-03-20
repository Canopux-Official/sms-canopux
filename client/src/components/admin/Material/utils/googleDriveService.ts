// // services/googleDrive.api.ts
// import type { FileDetail } from '../types/FileDetail';

// // Type declarations
// declare global {
//   interface Window {
//     google: any;
//     gapi: any;
//   }
// }

// // Global state
// let accessToken: string | null = null;
// let gapiInitialized = false;

// // Configuration from environment variables
// const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
// const SCOPES = import.meta.env.VITE_SCOPES;
// const DISCOVERY_DOCS = import.meta.env.VITE_DISCOVERY_DOCS;
// const DRIVE_API_BASE_URL = import.meta.env.VITE_DRIVE_API_BASE_URL;

// /**
//  * Initialize Google Drive API
//  */
// export const initGoogleDrive = (): Promise<boolean> => {
//   return new Promise((resolve) => {
//     if (gapiInitialized) {
//       resolve(true);
//       return;
//     }

//     if (window.gapi) {
//       window.gapi.load('client', async () => {
//         try {
//           await window.gapi.client.init({
//             discoveryDocs: [DISCOVERY_DOCS],
//           });
//           gapiInitialized = true;
//           console.log('✅ Google Drive API initialized');
//           resolve(true);
//         } catch (error) {
//           console.error('❌ Error initializing Google Drive:', error);
//           resolve(false);
//         }
//       });
//     } else {
//       console.error('❌ Google API not loaded');
//       resolve(false);
//     }
//   });
// };

// /**
//  * Get access token from Google OAuth
//  */
// export const getAccessToken = (): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     // Return cached token if available
//     if (accessToken) {
//       resolve(accessToken);
//       return;
//     }

//     if (!window.google?.accounts?.oauth2) {
//       reject(new Error('Google Identity Services not loaded'));
//       return;
//     }

//     const client = window.google.accounts.oauth2.initTokenClient({
//       client_id: GOOGLE_CLIENT_ID,
//       scope: SCOPES,
//       callback: (response: any) => {
//         if (response.error) {
//           reject(response);
//           return;
//         }
//         accessToken = response.access_token;
//         console.log('✅ Access token obtained');
//         resolve(response.access_token);
//       },
//     });

//     client.requestAccessToken();
//   });
// };

// /**
//  * Delete a file from Google Drive
//  */
// export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
//   try {
//     const token = await getAccessToken();

//     const response = await fetch(`${DRIVE_API_BASE_URL}/${fileId}`, {
//       method: 'DELETE',
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok || response.status === 204) {
//       console.log('✅ File deleted from Drive');
//       return true;
//     }
    
//     console.error('❌ Failed to delete file:', response.status);
//     return false;
//   } catch (error) {
//     console.error('❌ Error deleting from Drive:', error);
//     return false;
//   }
// };

// /**
//  * Make a file publicly accessible
//  */
// export const makeFilePublic = async (fileId: string): Promise<boolean> => {
//   try {
//     const token = await getAccessToken();

//     const response = await fetch(`${DRIVE_API_BASE_URL}/${fileId}/permissions`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         role: 'reader',
//         type: 'anyone',
//       }),
//     });

//     if (response.ok) {
//       console.log('✅ File made public');
//       return true;
//     }

//     console.error('❌ Failed to make file public:', response.status);
//     return false;
//   } catch (error) {
//     console.error('❌ Error making file public:', error);
//     return false;
//   }
// };

// /**
//  * Upload a single file to Google Drive with progress tracking
//  */
// export const uploadFileToDrive = async (
//   file: File,
//   onProgress?: (progress: number) => void
// ): Promise<FileDetail | null> => {
//   try {
//     console.log('Starting upload for:', file.name);

//     if (!gapiInitialized) {
//       throw new Error('Google API not initialized');
//     }

//     const token = await getAccessToken();

//     // Prepare metadata
//     const metadata = {
//       name: file.name,
//       mimeType: file.type,
//     };

//     // Create form data
//     const form = new FormData();
//     form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
//     form.append('file', file);

//     console.log('Uploading to Google Drive...');

//     // Create XMLHttpRequest for progress tracking
//     const xhr = new XMLHttpRequest();

//     const uploadPromise = new Promise<any>((resolve, reject) => {
//       // Track upload progress
//       xhr.upload.addEventListener('progress', (e) => {
//         if (e.lengthComputable && onProgress) {
//           const progress = (e.loaded / e.total) * 100;
//           onProgress(progress);
//         }
//       });

//       xhr.addEventListener('load', () => {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           resolve(JSON.parse(xhr.responseText));
//         } else {
//           reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
//         }
//       });

//       xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
//       xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

//       xhr.open(
//         'POST',
//         'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink'
//       );
//       xhr.setRequestHeader('Authorization', `Bearer ${token}`);
//       xhr.send(form);
//     });

//     const data = await uploadPromise;
//     console.log('Upload response:', data);

//     if (data.id) {
//       console.log('Making file public...');
//       await makeFilePublic(data.id);

//       console.log('✅ File uploaded successfully:', file.name);

//       return {
//         fileName: file.name,
//         uploadLink: data.webViewLink,
//         fileId: data.id,
//       };
//     }

//     return null;
//   } catch (error: any) {
//     console.error('❌ Error uploading to Drive:', error);
//     throw new Error(`Error uploading ${file.name}: ${error.message || 'Unknown error'}`);
//   }
// };

// /**
//  * Upload multiple files to Google Drive
//  */
// export const uploadMultipleFiles = async (
//   files: File[],
//   onFileProgress?: (fileName: string, progress: number) => void,
//   onFileComplete?: (fileName: string, result: FileDetail | null) => void
// ): Promise<FileDetail[]> => {
//   const uploadedFiles: FileDetail[] = [];

//   for (const file of files) {
//     try {
//       const result = await uploadFileToDrive(file, (progress) => {
//         onFileProgress?.(file.name, progress);
//       });

//       if (result) {
//         uploadedFiles.push(result);
//         onFileComplete?.(file.name, result);
//       } else {
//         onFileComplete?.(file.name, null);
//       }
//     } catch (error) {
//       console.error(`❌ Failed to upload ${file.name}:`, error);
//       onFileComplete?.(file.name, null);
//     }
//   }

//   return uploadedFiles;
// };

// /**
//  * Get file metadata from Google Drive
//  */
// export const getFileMetadata = async (fileId: string): Promise<any> => {
//   try {
//     const token = await getAccessToken();

//     const response = await fetch(
//       `${DRIVE_API_BASE_URL}/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Failed to get file metadata: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('❌ Error getting file metadata:', error);
//     throw error;
//   }
// };

// /**
//  * Check if Google Drive API is initialized
//  */
// export const isGoogleDriveInitialized = (): boolean => {
//   return gapiInitialized;
// };

// /**
//  * Clear cached access token (useful for logout/re-authentication)
//  */
// export const clearAccessToken = (): void => {
//   accessToken = null;
//   console.log('✅ Access token cleared');
// };



// services/googleDrive.api.ts
import type { FileDetail } from '../types/FileDetail';

// Type declarations
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Global state
let accessToken: string | null = null;
let gapiInitialized = false;

// Configuration from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const SCOPES = import.meta.env.VITE_SCOPES;
const DISCOVERY_DOCS = import.meta.env.VITE_DISCOVERY_DOCS;
const DRIVE_API_BASE_URL = import.meta.env.VITE_DRIVE_API_BASE_URL;

/**
 * Initialize Google Drive API
 */
export const initGoogleDrive = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (gapiInitialized) {
      resolve(true);
      return;
    }

    if (window.gapi) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOCS],
          });
          gapiInitialized = true;
          // console.log('✅ Google Drive API initialized');
          resolve(true);
        } catch (error) {
          console.error('❌ Error initializing Google Drive:', error);
          resolve(false);
        }
      });
    } else {
      console.error('❌ Google API not loaded');
      resolve(false);
    }
  });
};

/**
 * Get access token from Google OAuth
 */
export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Return cached token if available
    if (accessToken) {
      resolve(accessToken);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(response);
          return;
        }
        accessToken = response.access_token;
        // console.log('✅ Access token obtained');
        resolve(response.access_token);
      },
    });

    client.requestAccessToken();
  });
};

/**
 * Delete a file from Google Drive
 * 
 * NOTE: This function is available but should be used with caution.
 * In the NodeDialogForm, files are only unlinked from nodes, not deleted from Drive.
 * Users should manage file deletion manually from Google Drive interface.
 * 
 * This function can be used in dedicated file management interfaces where
 * explicit file deletion is intended.
 */
export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${DRIVE_API_BASE_URL}/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok || response.status === 204) {
      // console.log('✅ File deleted from Drive');
      return true;
    }
    
    console.error('❌ Failed to delete file:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error deleting from Drive:', error);
    return false;
  }
};

/**
 * Make a file publicly accessible
 */
export const makeFilePublic = async (fileId: string): Promise<boolean> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${DRIVE_API_BASE_URL}/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });

    if (response.ok) {
      // console.log('✅ File made public');
      return true;
    }

    console.error('❌ Failed to make file public:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error making file public:', error);
    return false;
  }
};

/**
 * Upload a single file to Google Drive with progress tracking
 */
export const uploadFileToDrive = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileDetail | null> => {
  try {
    // console.log('Starting upload for:', file.name);

    if (!gapiInitialized) {
      throw new Error('Google API not initialized');
    }

    const token = await getAccessToken();

    // Prepare metadata
    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    // Create form data
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    // console.log('Uploading to Google Drive...');

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    const uploadPromise = new Promise<any>((resolve, reject) => {
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open(
        'POST',
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink'
      );
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(form);
    });

    const data = await uploadPromise;
    // console.log('Upload response:', data);

    if (data.id) {
      // console.log('Making file public...');
      await makeFilePublic(data.id);

      // console.log('✅ File uploaded successfully:', file.name);

      return {
        fileName: file.name,
        uploadLink: data.webViewLink,
        fileId: data.id,
      };
    }

    return null;
  } catch (error: any) {
    console.error('❌ Error uploading to Drive:', error);
    throw new Error(`Error uploading ${file.name}: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Upload multiple files to Google Drive
 */
export const uploadMultipleFiles = async (
  files: File[],
  onFileProgress?: (fileName: string, progress: number) => void,
  onFileComplete?: (fileName: string, result: FileDetail | null) => void
): Promise<FileDetail[]> => {
  const uploadedFiles: FileDetail[] = [];

  for (const file of files) {
    try {
      const result = await uploadFileToDrive(file, (progress) => {
        onFileProgress?.(file.name, progress);
      });

      if (result) {
        uploadedFiles.push(result);
        onFileComplete?.(file.name, result);
      } else {
        onFileComplete?.(file.name, null);
      }
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
      onFileComplete?.(file.name, null);
    }
  }

  return uploadedFiles;
};

/**
 * Get file metadata from Google Drive
 */
export const getFileMetadata = async (fileId: string): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${DRIVE_API_BASE_URL}/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting file metadata:', error);
    throw error;
  }
};

/**
 * Check if Google Drive API is initialized
 */
export const isGoogleDriveInitialized = (): boolean => {
  return gapiInitialized;
};

/**
 * Clear cached access token (useful for logout/re-authentication)
 */
export const clearAccessToken = (): void => {
  accessToken = null;
  // console.log('✅ Access token cleared');
};