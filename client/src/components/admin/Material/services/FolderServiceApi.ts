

// import axios from 'axios';
// import type { GetAllFilesResponse } from "../types/FileDetail";
// import type { DeleteFolderResponse } from "../types/FolderDetails";
// import type { Node } from "../types/node";

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   data?: unknown;
// }

// const host = import.meta.env.VITE_SERVER_LINK || '';

// function getAuthHeaders() {
//   const token = window.localStorage.getItem("authToken");
//   return {
//     Authorization: token ? `Bearer ${token}` : '',
//     'Content-Type': 'application/json'
//   };
// }

// export const createOrFetchClass = async (className: string, targetExam: string, stream: string): Promise<ApiResponse> => {
//   try {
//     const response = await axios.post(
//       `${host}/admin/material/create-class`,
//       { className: className, targetExam: targetExam, stream: stream },
//       { headers: getAuthHeaders() }
//     );

//     return response.data;
//   } catch (error) {
//     console.error('Error creating or fetching class:', error);
//     if (axios.isAxiosError(error)) {
//       return {
//         success: false,
//         message: error.response?.data?.message || error.message || 'Failed to process the class',
//       };
//     }
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : 'Unknown error',
//     };
//   }
// };

// export const createFolder = async (parentId: string, folderData: Node): Promise<unknown> => {
//   try {
//     const response = await axios.post(
//       `${host}/admin/material/create-sub-folder/${parentId}`,
//       folderData,
//       { headers: getAuthHeaders() }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error creating folder:', error);
//     throw error;
//   }
// };

// export const updateFolder = async (folderId: string, folderData: Node): Promise<unknown> => {
//   try {
//     const response = await axios.patch(
//       `${host}/admin/material/update-sub-folder/${folderId}`,
//       folderData,
//       { headers: getAuthHeaders() }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error updating folder:', error);
//     throw error;
//   }
// };

// export const getChildrenByParentId = async (parentId: string): Promise<Node[]> => {
//   try {
//     const response = await axios.get(
//       `${host}/admin/material/get-folders/${parentId}`,
//       { headers: getAuthHeaders() }
//     );

//     if (response.data.success) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message || 'Failed to fetch child nodes');
//     }
//   } catch (error) {
//     console.error('Error fetching children by parent ID:', error);
//     return [];
//   }
// };

// export const deleteSubFolder = async (id: string): Promise<DeleteFolderResponse> => {
//   try {
//     const response = await axios.delete(
//       `${host}/admin/material/delete-sub-folder/${id}`,
//       { headers: getAuthHeaders() }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error deleting subfolder:', error);
//     throw error;
//   }
// };

// export const getAllClasses = async (): Promise<Node[]> => {
//   try {
//     const response = await axios.get(
//       `${host}/admin/material/get-all-classes`,
//       { headers: getAuthHeaders() }
//     );

//     if (response.data.success) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message || 'Failed to fetch classes');
//     }
//   } catch (error) {
//     console.error('Error fetching classes:', error);
//     return [];
//   }
// };

// export const confirmFolderDeletion = async (folderId: string) => {
//   try {
//     const response = await axios.post(
//       `${host}/admin/material/confirm-folder-deletion`,
//       { folderId },
//       { headers: getAuthHeaders() }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error confirming folder deletion:', error);
//     throw error;
//   }
// };

// export const getAllExistingFiles = async (
//   searchQuery?: string
// ): Promise<GetAllFilesResponse> => {
//   try {
//     const url = searchQuery
//       ? `${host}/admin/material/files?search=${encodeURIComponent(searchQuery)}`
//       : `${host}/admin/material/files`;

//     const response = await axios.get(url, {
//       headers: getAuthHeaders()
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error fetching existing files:', error);
//     throw error;
//   }
// };


import axios from 'axios';
import type { GetAllFilesResponse } from "../types/FileDetail";
import type { DeleteFolderResponse } from "../types/FolderDetails";
import type { Node } from "../types/node";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

const host = import.meta.env.VITE_SERVER_LINK || '';

function getAuthHeaders() {
  const token = window.localStorage.getItem("authToken");
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

export const createOrFetchClass = async (className: string, targetExam: string, stream: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(
      `${host}/admin/material/create-class`,
      { className: className, targetExam: targetExam, stream: stream },
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating or fetching class:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to process the class',
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const createFolder = async (parentId: string, folderData: Partial<Node>): Promise<unknown> => {
  try {
    // Send the data as-is, backend will handle validation
    const response = await axios.post(
      `${host}/admin/material/create-sub-folder/${parentId}`,
      folderData,
      { headers: getAuthHeaders() }
    );
    // console.log(folderData);
    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const updateFolder = async (folderId: string, folderData: Partial<Node>): Promise<unknown> => {
  try {
    // Send the data as-is, backend will handle validation
    const response = await axios.patch(
      `${host}/admin/material/update-sub-folder/${folderId}`,
      folderData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

export const getChildrenByParentId = async (parentId: string): Promise<Node[]> => {
  try {
    const response = await axios.get(
      `${host}/admin/material/get-folders/${parentId}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      // The data now includes populated subject with name
      // Frontend should use: material.subject ? material.subject.name : material.heading
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch child nodes');
    }
  } catch (error) {
    console.error('Error fetching children by parent ID:', error);
    return [];
  }
};

export const deleteSubFolder = async (id: string): Promise<DeleteFolderResponse> => {
  try {
    const response = await axios.delete(
      `${host}/admin/material/delete-sub-folder/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting subfolder:', error);
    throw error;
  }
};

export const getAllClasses = async (): Promise<Node[]> => {
  try {
    const response = await axios.get(
      `${host}/admin/material/get-all-classes`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch classes');
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const confirmFolderDeletion = async (folderId: string) => {
  try {
    const response = await axios.post(
      `${host}/admin/material/confirm-folder-deletion`,
      { folderId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error confirming folder deletion:', error);
    throw error;
  }
};

export const getAllExistingFiles = async (
  searchQuery?: string
): Promise<GetAllFilesResponse> => {
  try {
    const url = searchQuery
      ? `${host}/admin/material/files?search=${encodeURIComponent(searchQuery)}`
      : `${host}/admin/material/files`;

    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });

    // Files response now includes populated subject data in materials
    return response.data;
  } catch (error) {
    console.error('Error fetching existing files:', error);
    throw error;
  }
};


