// import React, { useState, useEffect, useMemo } from 'react';
// import { Box, Button, Typography, Snackbar, Alert, Fade } from '@mui/material';
// import type { Node } from '../types/node';
// import NodeDialogForm from '../DialogForm/DialogForm';

// import { ClassCardSkeleton } from '../utils/CardSkeleton';
// import { useNodeOperations } from '../subnodeUtils/UseNodeOperations';
// import { getChildrenByParentId } from '../services/FolderServiceApi';
// import SubnodeHeader from '../subnodeUtils/SubnodeHeader';
// import EmptyState from '../subnodeUtils/EmptyState';
// import SubnodeTable from '../subnodeUtils/SubnodeTable';
// import DeleteConfirmDialog from '../subnodeUtils/DeleteConfrmModal';

// interface ShowSubnodeProps {
//   nodeId: string;
//   nodes: Node[];
//   onBack: () => void;
//   onNodesUpdate?: (nodes: Node[]) => void;
// }

// const ShowSubnode: React.FC<ShowSubnodeProps> = ({
//   nodeId: initialNodeId,
//   nodes: initialNodes,
//   onBack,
//   onNodesUpdate,
// }) => {
//   const [localNodes, setLocalNodes] = useState<Node[]>(initialNodes);
//   const [currentNodeId, setCurrentNodeId] = useState<string>(initialNodeId);
//   const [navigationStack, setNavigationStack] = useState<string[]>([initialNodeId]);
//   const [isLoadingChildren, setIsLoadingChildren] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Dialog states
//   const [openCreateDialog, setOpenCreateDialog] = useState(false);
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [editingNode, setEditingNode] = useState<Node | null>(null);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [deletingNode, setDeletingNode] = useState<Node | null>(null);

//   // Custom hook for node operations
//   const { snackbar, setSnackbar, handleCreateNode, handleSaveEdit, handleConfirmDelete } =
//     useNodeOperations(localNodes, setLocalNodes, currentNodeId, onNodesUpdate);

//   // Sync with parent nodes
//   useEffect(() => {
//     setLocalNodes(initialNodes);
//   }, [initialNodes]);

//   // Fetch child nodes
//   useEffect(() => {
//     const fetchChildNodes = async () => {
//       if (!currentNodeId) return;

//       setIsLoadingChildren(true);

//       try {
//         const children = await getChildrenByParentId(currentNodeId);

//         setLocalNodes((prevNodes) => {
//           const nodesWithoutCurrentChildren = prevNodes.filter(
//             (node) => node.parentId !== currentNodeId
//           );
//           return [...nodesWithoutCurrentChildren, ...children];
//         });
//       } catch (error) {
//         console.error('Error fetching child nodes:', error);
//         setSnackbar({
//           open: true,
//           message: 'Failed to load child nodes',
//           severity: 'error',
//         });
//       } finally {
//         setIsLoadingChildren(false);
//         setIsInitialLoad(false);
//       }
//     };

//     fetchChildNodes();
//   }, [currentNodeId]);

//   // Derived state
//   const currentNode = localNodes.find((node) => node._id === currentNodeId);
//   const childNodes = localNodes.filter((node) => node.parentId === currentNodeId);

//   // Filter nodes based on search query
//   const filteredNodes = useMemo(() => {
//     if (!searchQuery.trim()) return childNodes;

//     const query = searchQuery.toLowerCase();
//     return childNodes.filter(
//       (node) =>
//         node.heading.toLowerCase().includes(query) ||
//         node.description?.toLowerCase().includes(query) ||
//         node.tags?.some((tag) => tag.toLowerCase().includes(query))
//     );
//   }, [childNodes, searchQuery]);

//   // Breadcrumb path from backend
//   const breadcrumbPath = currentNode
//     ? [...(currentNode.path || []), { id: currentNode._id, heading: currentNode.heading }]
//     : [];

//   // Handlers
//   const handleNodeClick = (childId: string) => {
//     const childNode = localNodes.find((n) => n._id === childId);
//     if (childNode?.type === 'folder') {
//       setCurrentNodeId(childId);
//       setNavigationStack([...navigationStack, childId]);
//       setSearchQuery(''); // Clear search when navigating
//     }
//   };

//   const handleBreadcrumbClick = (nodeId: string) => {
//     const pathIndex = breadcrumbPath.findIndex((p) => p.id === nodeId);

//     if (pathIndex !== -1) {
//       const newStack = breadcrumbPath.slice(0, pathIndex + 1).map((p) => p.id);
//       setNavigationStack(newStack);
//       setCurrentNodeId(nodeId);
//       setSearchQuery(''); // Clear search when navigating
//     }
//   };

//   const handleEditNode = (node: Node) => {
//     setEditingNode(node);
//     setOpenEditDialog(true);
//   };

//   const handleDeleteNode = (nodeId: string) => {
//     const node = localNodes.find((n) => n._id === nodeId);
//     if (node) {
//       setDeletingNode(node);
//       setOpenDeleteDialog(true);
//     }
//   };

//   const onConfirmDelete = async () => {
//     if (deletingNode) {
//       await handleConfirmDelete(deletingNode._id);
//       setOpenDeleteDialog(false);
//       setDeletingNode(null);
//     }
//   };

//   if (!currentNode && !isInitialLoad) {
//     return (
//       <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
//         <Typography variant="h6" color="error">
//           Node not found
//         </Typography>
//         <Button onClick={onBack} sx={{ mt: 2 }}>
//           Go Back
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         background: '#f8f9fa',
//         p: { xs: 2, sm: 3, md: 4 },
//       }}
//     >
//       <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
//         {/* Header Component */}
//         <SubnodeHeader
//           currentNode={currentNode}
//           breadcrumbPath={breadcrumbPath}
//           childNodesCount={filteredNodes.length}
//           isLoading={isLoadingChildren}
//           searchQuery={searchQuery}
//           onBack={onBack}
//           onBreadcrumbClick={handleBreadcrumbClick}
//           onAddClick={() => setOpenCreateDialog(true)}
//           onSearchChange={setSearchQuery}
//         />

//         {/* Content Area */}
//         {isLoadingChildren ? (
//           <ClassCardSkeleton count={6} />
//         ) : filteredNodes.length > 0 ? (
//           <Fade in={!isLoadingChildren} timeout={500}>
//             <Box>
//               <SubnodeTable
//                 nodes={filteredNodes}
//                 onNodeClick={handleNodeClick}
//                 onEdit={handleEditNode}
//                 onDelete={handleDeleteNode}
//               />
//             </Box>
//           </Fade>
//         ) : (
//           <EmptyState searchQuery={searchQuery} />
//         )}
//       </Box>

//       {/* Dialogs */}
//       <NodeDialogForm
//         open={openCreateDialog}
//         onClose={() => setOpenCreateDialog(false)}
//         onSave={handleCreateNode}
//         title="Create New Item"
//         parentId={currentNodeId}
//         depth={currentNode?.path ? currentNode.path.length + 1 : 0}
//       />

//       {editingNode && (
//         <NodeDialogForm
//           open={openEditDialog}
//           onClose={() => {
//             setOpenEditDialog(false);
//             setEditingNode(null);
//           }}
//           onSave={(nodeData) => handleSaveEdit(editingNode, nodeData)}
//           initialData={editingNode}
//           title={`Edit ${editingNode.type === 'folder' ? 'Folder' : 'File'}`}
//           parentId={editingNode.parentId || ''}
//           depth={editingNode.path ? editingNode.path.length : 0}
//         />
//       )}

//       <DeleteConfirmDialog
//         open={openDeleteDialog}
//         node={deletingNode}
//         onClose={() => {
//           setOpenDeleteDialog(false);
//           setDeletingNode(null);
//         }}
//         onConfirm={onConfirmDelete}
//       />

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{
//             width: '100%',
//             borderRadius: '8px',
//             fontWeight: 600,
//           }}
//           variant="filled"
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ShowSubnode;


import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, Snackbar, Alert, Fade } from '@mui/material';
import type { Node } from '../types/node';
import NodeDialogForm from '../DialogForm/DialogForm';

import { ClassCardSkeleton } from '../utils/CardSkeleton';
import { useNodeOperations } from '../subnodeUtils/UseNodeOperations';
import { getChildrenByParentId } from '../services/FolderServiceApi';
import SubnodeHeader from '../subnodeUtils/SubnodeHeader';
import EmptyState from '../subnodeUtils/EmptyState';
import SubnodeTable from '../subnodeUtils/SubnodeTable';
import DeleteConfirmDialog from '../subnodeUtils/DeleteConfrmModal';

interface ShowSubnodeProps {
  nodeId: string;
  nodes: Node[];
  onBack: () => void;
  onNodesUpdate?: (nodes: Node[]) => void;
}

// Helper function to get display heading
const getDisplayHeading = (node: Node): string => {
  if (node.subject && typeof node.subject === 'object' && node.subject.name) {
    return node.subject.name;
  }
  return node.heading || 'Untitled';
};

const ShowSubnode: React.FC<ShowSubnodeProps> = ({
  nodeId: initialNodeId,
  nodes: initialNodes,
  onBack,
  onNodesUpdate,
}) => {
  const [localNodes, setLocalNodes] = useState<Node[]>(initialNodes);
  const [currentNodeId, setCurrentNodeId] = useState<string>(initialNodeId);
  const [navigationStack, setNavigationStack] = useState<string[]>([initialNodeId]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingNode, setDeletingNode] = useState<Node | null>(null);

  // Custom hook for node operations
  const { snackbar, setSnackbar, handleCreateNode, handleSaveEdit, handleConfirmDelete } =
    useNodeOperations(localNodes, setLocalNodes, currentNodeId, onNodesUpdate);

  // Sync with parent nodes
  useEffect(() => {
    setLocalNodes(initialNodes);
  }, [initialNodes]);

  // Fetch child nodes
  useEffect(() => {
    const fetchChildNodes = async () => {
      if (!currentNodeId) return;

      setIsLoadingChildren(true);

      try {
        // Nodes are returned with populated subject from backend
        const children = await getChildrenByParentId(currentNodeId);

        setLocalNodes((prevNodes) => {
          const nodesWithoutCurrentChildren = prevNodes.filter(
            (node) => node.parentId !== currentNodeId
          );
          return [...nodesWithoutCurrentChildren, ...children];
        });
      } catch (error) {
        console.error('Error fetching child nodes:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load child nodes',
          severity: 'error',
        });
      } finally {
        setIsLoadingChildren(false);
        setIsInitialLoad(false);
      }
    };

    fetchChildNodes();
  }, [currentNodeId]);

  // Derived state
  const currentNode = localNodes.find((node) => node._id === currentNodeId);
  const childNodes = localNodes.filter((node) => node.parentId === currentNodeId);

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return childNodes;

    const query = searchQuery.toLowerCase();
    return childNodes.filter((node) => {
      const displayHeading = getDisplayHeading(node);
      const subjectName = node.subject && typeof node.subject === 'object'
        ? node.subject.name?.toLowerCase()
        : '';

      return (
        displayHeading.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query) ||
        node.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        subjectName.includes(query)
      );
    });
  }, [childNodes, searchQuery]);


  // console.log(filteredNodes);

  // Breadcrumb path from backend - use display heading
  const breadcrumbPath = currentNode
    ? [
      ...(currentNode.path || []),
      { id: currentNode._id, heading: getDisplayHeading(currentNode) }
    ]
    : [];

  // Handlers
  const handleNodeClick = (childId: string) => {
    const childNode = localNodes.find((n) => n._id === childId);
    if (childNode?.type === 'folder') {
      setCurrentNodeId(childId);
      setNavigationStack([...navigationStack, childId]);
      setSearchQuery(''); // Clear search when navigating
    }
  };

  const handleBreadcrumbClick = (nodeId: string) => {
    const pathIndex = breadcrumbPath.findIndex((p) => p.id === nodeId);

    if (pathIndex !== -1) {
      const newStack = breadcrumbPath.slice(0, pathIndex + 1).map((p) => p.id);
      setNavigationStack(newStack);
      setCurrentNodeId(nodeId);
      setSearchQuery(''); // Clear search when navigating
    }
  };

  const handleEditNode = (node: Node) => {
    setEditingNode(node);
    setOpenEditDialog(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    const node = localNodes.find((n) => n._id === nodeId);
    if (node) {
      setDeletingNode(node);
      setOpenDeleteDialog(true);
    }
  };

  const onConfirmDelete = async () => {
    if (deletingNode) {
      await handleConfirmDelete(deletingNode._id);
      setOpenDeleteDialog(false);
      setDeletingNode(null);
    }
  };

  if (!currentNode && !isInitialLoad) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h6" color="error">
          Node not found
        </Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f8f9fa',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Component */}
        <SubnodeHeader
          currentNode={currentNode}
          breadcrumbPath={breadcrumbPath}
          childNodesCount={filteredNodes.length}
          isLoading={isLoadingChildren}
          searchQuery={searchQuery}
          onBack={onBack}
          onBreadcrumbClick={handleBreadcrumbClick}
          onAddClick={() => setOpenCreateDialog(true)}
          onSearchChange={setSearchQuery}
        />

        {/* Content Area */}
        {isLoadingChildren ? (
          <ClassCardSkeleton count={6} />
        ) : filteredNodes.length > 0 ? (
          <Fade in={!isLoadingChildren} timeout={500}>
            <Box>
              <SubnodeTable
                nodes={filteredNodes}
                onNodeClick={handleNodeClick}
                onEdit={handleEditNode}
                onDelete={handleDeleteNode}
              />
            </Box>
          </Fade>
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </Box>

      {/* Dialogs */}
      <NodeDialogForm
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSave={handleCreateNode}
        title="Create New Item"
        parentId={currentNodeId}
        depth={currentNode?.path ? currentNode.path.length + 1 : 0}
      />

      {editingNode && (
        <NodeDialogForm
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setEditingNode(null);
          }}
          onSave={(nodeData) => handleSaveEdit(editingNode, nodeData)}
          initialData={editingNode}
          title={`Edit ${editingNode.type === 'folder' ? 'Folder' : 'File'}`}
          parentId={editingNode.parentId || ''}
          depth={editingNode.path ? editingNode.path.length : 0}
        />
      )}

      <DeleteConfirmDialog
        open={openDeleteDialog}
        node={deletingNode}
        onClose={() => {
          setOpenDeleteDialog(false);
          setDeletingNode(null);
        }}
        onConfirm={onConfirmDelete}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: '8px',
            fontWeight: 600,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShowSubnode;