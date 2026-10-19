import { useRef, useState } from 'react';
import type { Node } from '../types/node';
import {
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

const errorMessage = (error: any, fallback: string): string =>
  error?.response?.data?.message || error?.message || fallback;

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
  const [isSaving, setIsSaving] = useState(false);

  // Always points at the newest list, so a slow request never works on an old copy.
  const nodesRef = useRef<Node[]>(localNodes);
  nodesRef.current = localNodes;

  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity });
  };

  const commit = (updatedNodes: Node[]) => {
    nodesRef.current = updatedNodes;
    setLocalNodes(updatedNodes);
    onNodesUpdate?.(updatedNodes);
  };

  const handleCreateNode = async (nodeData: Partial<Node>): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
    try {
      // Payload is unchanged on purpose: the backend receives what it receives today.
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
        commit([...nodesRef.current, createdNode]);

        const breadcrumb = (result as any).breadcrumb;
        showSnackbar(
          breadcrumb
            ? `Created: ${breadcrumb}`
            : (result as { message: string }).message || 'Folder created successfully',
          'success'
        );
        return true;
      }

      showSnackbar((result as { message: string }).message || 'Failed to create folder', 'error');
      return false;
    } catch (error: any) {
      showSnackbar(errorMessage(error, 'Error creating folder'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (editingNode: Node, nodeData: Partial<Node>): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
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
          commit(
            nodesRef.current.map((node) => {
              if (node._id === editingNode._id) return returnedData;
              const refreshedNode = refreshedChildren.find((child) => child._id === node._id);
              return refreshedNode || node;
            })
          );
        } else {
          commit(
            nodesRef.current.map((node) => (node._id === editingNode._id ? returnedData : node))
          );
        }

        const breadcrumb = (result as any).breadcrumb;
        showSnackbar(
          breadcrumb
            ? `Updated: ${breadcrumb}`
            : (result as { message: string }).message || 'Folder updated successfully',
          'success'
        );
        return true;
      }

      showSnackbar((result as { message: string }).message || 'Failed to update folder', 'error');
      return false;
    } catch (error: any) {
      showSnackbar(errorMessage(error, 'Error updating folder'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const removeNodeAndChildren = (nodeId: string): Node[] => {
    const all = nodesRef.current;
    const collect = (id: string): string[] => {
      const ids = [id];
      all.filter((node) => node.parentId === id).forEach((child) => ids.push(...collect(child._id)));
      return ids;
    };
    const idsToDelete = collect(nodeId);
    return all.filter((node) => !idsToDelete.includes(node._id));
  };

  const handleConfirmDelete = async (deletingNodeId: string): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
    try {
      const result = await deleteSubFolder(deletingNodeId);

      if (result.success) {
        commit(removeNodeAndChildren(deletingNodeId));
        showSnackbar(result.message || 'Folder deleted successfully', 'success');
        return true;
      }

      showSnackbar(
        result.message || 'Failed to delete folder',
        result.message?.includes('subfolders') ? 'warning' : 'error'
      );
      return false;
    } catch (error: any) {
      showSnackbar(errorMessage(error, 'Error deleting folder'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    snackbar,
    setSnackbar,
    isSaving,
    handleCreateNode,
    handleSaveEdit,
    handleConfirmDelete,
  };
};