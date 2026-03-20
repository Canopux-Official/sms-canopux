import { useState } from 'react';
import type { Node } from '../types/node';
import {
  confirmFolderDeletion,
  createFolder,
  deleteSubFolder,
  getChildrenByParentId,
  updateFolder,
} from '../services/FolderServiceApi';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const useNodeOperations = (
  localNodes: Node[],
  setLocalNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  currentNodeId: string,
  onNodesUpdate?: (nodes: Node[]) => void
) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateNode = async (nodeData: Partial<Node>) => {
    try {
      const newNode: Node = {
        _id: Date.now().toString(),
        heading: nodeData.heading!,
        type: nodeData.type || 'folder',
        parentId: currentNodeId,
        targetExam: '',
        stream: '',
        classType: '',
        description: nodeData.description || '',
        tags: nodeData.tags || [],
        createdAt: new Date().toISOString(),
        lastDate: nodeData.lastDate,
        fileDetails: nodeData.fileDetails || [],
        referenceDetails: nodeData.referenceDetails || [],
        path: [],
        subject: nodeData.subject,
      };

      const result = await createFolder(currentNodeId, newNode);

      if ((result as { success: string }).success) {
        const createdNode = (result as { data: Node }).data;
        const updatedNodes = [...localNodes, createdNode];
        setLocalNodes(updatedNodes);
        onNodesUpdate?.(updatedNodes);

        const breadcrumb = (result as any).breadcrumb;
        const message = breadcrumb
          ? `Created: ${breadcrumb}`
          : ((result as { message: string }).message) || 'Folder created successfully';

        showSnackbar(message, 'success');
      } else {
        showSnackbar(
          ((result as { message: string }).message) || 'Failed to create folder',
          'error'
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Error creating folder', 'error');
    }
  };

  const handleSaveEdit = async (editingNode: Node, nodeData: Partial<Node>) => {
    try {
      const updatedNode: Node = {
        ...editingNode,
        heading: nodeData.heading!,
        type: nodeData.type || editingNode.type,
        targetExam: nodeData.targetExam || editingNode.targetExam,
        stream: nodeData.stream || editingNode.stream,
        classType: nodeData.classType || editingNode.classType,
        description: nodeData.description || editingNode.description,
        tags: nodeData.tags || editingNode.tags,
        lastDate: nodeData.lastDate || editingNode.lastDate,
        fileDetails: nodeData.fileDetails || [],
        referenceDetails: nodeData.referenceDetails || [],
        subject: nodeData.subject || editingNode.subject,
      };

      const result = await updateFolder(editingNode._id, updatedNode);

      if ((result as { success: string }).success) {
        const returnedData = (result as { data: Node }).data;
        const headingChanged = nodeData.heading && nodeData.heading !== editingNode.heading;

        if (headingChanged && (result as any).pathsUpdated) {
          const refreshedChildren = await getChildrenByParentId(currentNodeId);
          const updatedNodes = localNodes.map((node) => {
            if (node._id === editingNode._id) return returnedData;
            const refreshedNode = refreshedChildren.find((child) => child._id === node._id);
            return refreshedNode || node;
          });

          setLocalNodes(updatedNodes);
          onNodesUpdate?.(updatedNodes);
        } else {
          const updatedNodes = localNodes.map((node) =>
            node._id === editingNode._id ? returnedData : node
          );
          setLocalNodes(updatedNodes);
          onNodesUpdate?.(updatedNodes);
        }

        const breadcrumb = (result as any).breadcrumb;
        const message = breadcrumb
          ? `Updated: ${breadcrumb}`
          : ((result as { message: string }).message) || 'Folder updated successfully';

        showSnackbar(message, 'success');
      } else {
        showSnackbar(
          ((result as { message: string }).message) || 'Failed to update folder',
          'error'
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Error updating folder', 'error');
    }
  };

  const handleConfirmDelete = async (deletingNodeId: string) => {
    try {
      const result = await deleteSubFolder(deletingNodeId);

      if (result.requiresDriveDeletion && result.driveFileIds) {
        showSnackbar('Deleting files from Google Drive...', 'info');

        const confirmData = await confirmFolderDeletion(result.folderId || '');

        if (confirmData.success) {
          const updatedNodes = removeNodeAndChildren(deletingNodeId);
          setLocalNodes(updatedNodes);
          onNodesUpdate?.(updatedNodes);

          showSnackbar(
            `Deleted SuccessFully`,
            'success'
          );
        } else {
          showSnackbar(confirmData.message || 'Failed to complete folder deletion', 'error');
        }
      } else if (result.success) {
        const updatedNodes = removeNodeAndChildren(deletingNodeId);
        setLocalNodes(updatedNodes);
        onNodesUpdate?.(updatedNodes);

        showSnackbar(result.message || 'Folder deleted successfully', 'success');
      } else {
        showSnackbar(
          result.message || 'Failed to delete folder',
          result.message?.includes('subfolders') ? 'warning' : 'error'
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Error deleting folder', 'error');
    }
  };

  const removeNodeAndChildren = (nodeId: string): Node[] => {
    const deleteNodeAndChildren = (id: string): string[] => {
      const idsToDelete = [id];
      const children = localNodes.filter((node) => node.parentId === id);
      children.forEach((child) => {
        idsToDelete.push(...deleteNodeAndChildren(child._id));
      });
      return idsToDelete;
    };

    const idsToDelete = deleteNodeAndChildren(nodeId);
    return localNodes.filter((node) => !idsToDelete.includes(node._id));
  };

  return {
    snackbar,
    setSnackbar,
    handleCreateNode,
    handleSaveEdit,
    handleConfirmDelete,
  };
};