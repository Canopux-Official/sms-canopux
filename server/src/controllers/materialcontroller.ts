
// import { Request, Response } from 'express';
// import Material from '../models/Material';

// // Helper function to build full path
// const buildPath = async (parentId: string | null): Promise<Array<{ id: string, heading: string }>> => {
//     if (!parentId) return [];

//     const parent = await Material.findById(parentId);
//     if (!parent) return [];

//     // Return parent's path + parent itself
//     return [
//         ...parent.path || [],
//         { id: parent._id.toString(), heading: parent.heading }
//     ];
// };

// // Helper function to update paths for all descendants when a parent's heading changes
// const updateDescendantPaths = async (nodeId: string, newHeading: string): Promise<void> => {
//     const node = await Material.findById(nodeId);
//     if (!node) return;

//     // Build the new path for this node
//     const newPath = node.parentId ? await buildPath(node.parentId.toString()) : [];

//     // Update this node's path
//     node.path = newPath;
//     await node.save();

//     // Find all direct children
//     const children = await Material.find({ parentId: nodeId });

//     // Recursively update each child's path
//     for (const child of children) {
//         // The child's new path should be: parent's path + parent
//         const childNewPath = [
//             ...newPath,
//             { id: node._id.toString(), heading: newHeading }
//         ];

//         child.path = childNewPath;
//         await child.save();

//         // Recursively update grandchildren
//         await updateDescendantPaths(child._id.toString(), child.heading);
//     }
// };

// const createClassId = async (req: Request, res: Response) => {
//     try {
//         const { className, targetExam, stream } = req.body;

//         const findExisting = await Material.findOne({
//             classType: className,
//             targetExam: targetExam,
//             stream: stream
//         });

//         if (findExisting) {
//             return res.status(200).json({
//                 message: 'Class Already Exists',
//                 success: false,
//                 data: findExisting
//             });
//         }

//         const newClass = new Material({
//             classType: className,
//             targetExam: targetExam,
//             stream,
//             parentId: null,
//             heading: `Class ${className}`,
//             path: [] // Root level has empty path
//         });

//         const savedClass = await newClass.save();
//         return res.status(201).json({
//             message: 'Class Created Successfully',
//             success: true,
//             data: savedClass
//         });
//     } catch (error) {
//         console.log("Error in createClassId:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const createSubFolder = async (req: Request, res: Response) => {
//     try {
//         const parentId = req.params.id;
//         const parent = await Material.findById(parentId);

//         if (!parent) {
//             return res.status(404).json({
//                 message: 'Parent folder not found',
//                 success: false
//             });
//         }

//         const { heading, description, fileDetails, referenceDetails, tags, lastDate, type, fileId } = req.body;

//         if (!parentId) {
//             return res.status(400).json({
//                 message: 'Parent ID is required',
//                 success: false
//             });
//         }
//         if (!heading) {
//             return res.status(400).json({
//                 message: 'Heading is required',
//                 success: false
//             });
//         }

//         // Build the full path
//         const fullPath = await buildPath(parentId);

//         const newSubMaterial = new Material({
//             heading,
//             classType: parent.classType,
//             stream: parent.stream,
//             targetExam: parent.targetExam,
//             description,
//             fileDetails,
//             referenceDetails,
//             tags,
//             lastDate,
//             parentId,
//             type,
//             fileId,
//             path: fullPath // Store the complete path
//         });

//         const savedSubMaterial = await newSubMaterial.save();

//         return res.status(201).json({
//             message: 'Sub Folder Created Successfully',
//             success: true,
//             data: savedSubMaterial,
//             breadcrumb: [...fullPath.map(p => p.heading), heading].join(' -> ')
//         });

//     } catch (error) {
//         console.log("Error in createSubFolder:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const findByParentId = async (req: Request, res: Response) => {
//     try {
//         const parentId = req.params.id;
//         if (!parentId) {
//             return res.status(400).json({
//                 message: 'Parent ID is required',
//                 success: false
//             });
//         }
//         const materials = await Material.find({ parentId: parentId });
//         return res.status(200).json({
//             message: 'Materials fetched successfully',
//             success: true,
//             data: materials
//         });
//     } catch (error) {
//         console.log("Error in findByParentId:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const deleteSubFolder = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({
//                 message: 'ID is required',
//                 success: false
//             });
//         }

//         const folder = await Material.findById(id);
//         if (!folder) {
//             return res.status(404).json({
//                 message: 'Sub Folder not found',
//                 success: false
//             });
//         }

//         const childFolders = await Material.find({ parentId: id, type: 'folder' });

//         if (childFolders.length > 0) {
//             return res.status(400).json({
//                 message: 'Please delete all subfolders before deleting this folder.',
//                 success: false
//             });
//         }

//         const childFiles = await Material.find({ parentId: id, type: 'file' });

//         if (childFiles.length > 0) {
//             const driveFileIds: string[] = [];

//             childFiles.forEach(file => {
//                 if (file.fileDetails && Array.isArray(file.fileDetails)) {
//                     file.fileDetails.forEach((detail: any) => {
//                         if (detail.fileId) {
//                             driveFileIds.push(detail.fileId);
//                         }
//                     });
//                 }
//             });

//             if (driveFileIds.length > 0) {
//                 return res.status(200).json({
//                     message: 'Files need to be deleted from Google Drive first',
//                     success: false,
//                     requiresDriveDeletion: true,
//                     driveFileIds: driveFileIds,
//                     folderId: id
//                 });
//             }

//             await Material.deleteMany({ parentId: id, type: 'file' });
//         }

//         const folderDriveFileIds: string[] = [];
//         if (folder.fileDetails && Array.isArray(folder.fileDetails)) {
//             folder.fileDetails.forEach((detail: any) => {
//                 if (detail.fileId) {
//                     folderDriveFileIds.push(detail.fileId);
//                 }
//             });
//         }

//         if (folderDriveFileIds.length > 0) {
//             return res.status(200).json({
//                 message: 'Folder files need to be deleted from Google Drive first',
//                 success: false,
//                 requiresDriveDeletion: true,
//                 driveFileIds: folderDriveFileIds,
//                 folderId: id
//             });
//         }

//         await Material.findByIdAndDelete(id);

//         return res.status(200).json({
//             message: 'Folder and Files Deleted Successfully',
//             success: true
//         });
//     } catch (error) {
//         console.log("Error in deleteSubFolder:", error);
//         return res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// const confirmFolderDeletion = async (req: Request, res: Response) => {
//     try {
//         const { folderId } = req.body;

//         if (!folderId) {
//             return res.status(400).json({
//                 message: 'Folder ID is required',
//                 success: false
//             });
//         }

//         await Material.deleteMany({ parentId: folderId, type: 'file' });
//         await Material.findByIdAndDelete(folderId);

//         return res.status(200).json({
//             message: 'Folder and Files Deleted Successfully',
//             success: true
//         });
//     } catch (error) {
//         console.log("Error in confirmFolderDeletion:", error);
//         return res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// const updateSubFolder = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;

//         if (!id) {
//             return res.status(400).json({
//                 message: 'ID is required',
//                 success: false
//             });
//         }

//         const folder = await Material.findById(id);
//         if (!folder) {
//             return res.status(404).json({
//                 message: 'Sub Folder not found',
//                 success: false
//             });
//         }

//         const { heading, description, fileDetails, referenceDetails, tags, lastDate, type, targetExam, stream, classType } = req.body;

//         // Check if this is a root folder (no parentId)
//         const isRootFolder = !folder.parentId;

//         // Determine the new heading based on whether it's root or subfolder
//         let newHeading: string;
//         let classTypeChanged = false;

//         if (isRootFolder) {
//             // For root folders, heading is derived from classType
//             if (classType && classType !== folder.classType) {
//                 newHeading = `Class ${classType}`;
//                 classTypeChanged = true;
//             } else {
//                 newHeading = folder.heading;
//             }
//         } else {
//             // For subfolders, use the provided heading or keep existing
//             newHeading = heading || folder.heading;
//         }

//         // Check if heading changed - we'll need to update descendant paths
//         const headingChanged = newHeading !== folder.heading;
//         const oldHeading = folder.heading;

//         // Update folder fields
//         folder.heading = newHeading;
//         folder.description = description !== undefined ? description : folder.description;
//         folder.fileDetails = fileDetails !== undefined ? fileDetails : folder.fileDetails;
//         folder.targetExam = targetExam !== undefined ? targetExam : folder.targetExam;
//         folder.stream = stream !== undefined ? stream : folder.stream;
//         folder.referenceDetails = referenceDetails !== undefined ? referenceDetails : folder.referenceDetails;
//         folder.tags = tags !== undefined ? tags : folder.tags;
//         folder.lastDate = lastDate !== undefined ? lastDate : folder.lastDate;
//         folder.type = type !== undefined ? type : folder.type;
//         folder.classType = classType !== undefined ? classType : folder.classType;

//         const updatedFolder = await folder.save();

//         // If heading changed, update all descendant paths
//         if (headingChanged) {
//             await updateDescendantPaths(id, newHeading);
//         }

//         return res.status(200).json({
//             message: isRootFolder ? 'Class Updated Successfully' : 'Sub Folder Updated Successfully',
//             success: true,
//             data: updatedFolder,
//             breadcrumb: isRootFolder
//                 ? updatedFolder.heading
//                 : [...updatedFolder.path.map(p => p.heading), updatedFolder.heading].join(' -> '),
//             pathsUpdated: headingChanged,
//             isRootFolder
//         });

//     } catch (error) {
//         console.log("Error in updateSubFolder:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// const getAllClasses = async (req: Request, res: Response) => {
//     try {
//         const classes = await Material.find({ parentId: null }).sort({ createdAt: -1 });
//         return res.status(200).json({
//             message: 'Classes fetched successfully',
//             success: true,
//             data: classes
//         });
//     } catch (error) {
//         console.log("Error in getAllClasses:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const getAllFiles = async (req: Request, res: Response) => {
//     try {
//         const { search } = req.query;

//         let query: any = {
//             fileDetails: { $exists: true, $ne: [] }
//         };

//         if (search && typeof search === 'string') {
//             query.$or = [
//                 { heading: { $regex: search, $options: 'i' } },
//                 { 'fileDetails.fileName': { $regex: search, $options: 'i' } },
//                 { tags: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const materials = await Material.find(query).select('fileDetails heading type path _id');

//         const uniqueFilesMap = new Map<string, {
//             fileName: string;
//             uploadLink: string;
//             fileId?: string;
//             parentHeading: string;
//             parentId: string;
//             breadcrumb: string;
//             fullPath: Array<{ id: string, heading: string }>;
//         }>();

//         materials.forEach(material => {
//             if (material.fileDetails && Array.isArray(material.fileDetails)) {
//                 material.fileDetails.forEach((file: any) => {
//                     if (file.fileName && file.uploadLink) {
//                         if (!uniqueFilesMap.has(file.uploadLink)) {
//                             // Build breadcrumb from path
//                             const breadcrumbParts = [
//                                 ...(material.path || []).map(p => p.heading),
//                                 material.heading
//                             ];

//                             uniqueFilesMap.set(file.uploadLink, {
//                                 fileName: file.fileName,
//                                 uploadLink: file.uploadLink,
//                                 fileId: file.fileId || undefined,
//                                 parentHeading: material.heading,
//                                 parentId: material._id.toString(),
//                                 breadcrumb: breadcrumbParts.join(' -> '),
//                                 fullPath: [
//                                     ...(material.path || []),
//                                     { id: material._id.toString(), heading: material.heading }
//                                 ]
//                             });
//                         }
//                     }
//                 });
//             }
//         });

//         const allFiles = Array.from(uniqueFilesMap.values());

//         return res.status(200).json({
//             message: 'Files fetched successfully',
//             success: true,
//             count: allFiles.length,
//             data: allFiles
//         });

//     } catch (error) {
//         console.log("Error in getAllFiles:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// export default {
//     createClassId,
//     createSubFolder,
//     findByParentId,
//     deleteSubFolder,
//     updateSubFolder,
//     getAllClasses,
//     confirmFolderDeletion,
//     getAllFiles
// };


// import { Request, Response } from 'express';
// import Material from '../models/Material';
// import mongoose from 'mongoose';

// // Helper function to build full path
// const buildPath = async (parentId: string | null): Promise<Array<{ id: string, heading: string }>> => {
//     if (!parentId) return [];

//     const parent = await Material.findById(parentId).populate('subject');
//     console.log(parent)
//     if (!parent) return [];

//     // Use subject.name if subject exists, otherwise use heading
//     const parentHeading = parent.subject ? (parent.subject as any).name : parent.heading;

//     // Return parent's path + parent itself
//     return [
//         ...parent.path || [],
//         { id: parent._id.toString(), heading: parentHeading }
//     ];
// };

// // Helper function to update paths for all descendants when a parent's heading changes
// const updateDescendantPaths = async (nodeId: string, newHeading: string): Promise<void> => {
//     const node = await Material.findById(nodeId);
//     if (!node) return;

//     // Build the new path for this node
//     const newPath = node.parentId ? await buildPath(node.parentId.toString()) : [];

//     // Update this node's path
//     node.path = newPath;
//     await node.save();

//     // Find all direct children
//     const children = await Material.find({ parentId: nodeId });

//     // Recursively update each child's path
//     for (const child of children) {
//         // The child's new path should be: parent's path + parent
//         const childNewPath = [
//             ...newPath,
//             { id: node._id.toString(), heading: newHeading }
//         ];

//         child.path = childNewPath;
//         await child.save();

//         // Get child's heading (from subject or manual)
//         const childPopulated = await Material.findById(child._id).populate('subject', 'name');
//         const childHeading = childPopulated?.subject ? (childPopulated.subject as any).name : child.heading;

//         // Recursively update grandchildren
//         await updateDescendantPaths(child._id.toString(), childHeading);
//     }
// };

// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// const createClassId = async (req: Request, res: Response) => {
//     try {
//         const { className, targetExam, stream } = req.body;

//         const validStream = isValidObjectId(stream) ? stream : null;

//         const findExisting = await Material.findOne({
//             classType: className,
//             targetExam: targetExam,
//             stream: validStream
//         });

//         if (findExisting) {
//             return res.status(200).json({
//                 message: 'Class Already Exists',
//                 success: false,
//                 data: findExisting
//             });
//         }

//         const newClass = new Material({
//             classType: className,
//             targetExam: targetExam,
//             stream:validStream,
//             parentId: null,
//             heading: `Class ${className}`,
//             path: [] // Root level has empty path
//         });

//         const savedClass = await newClass.save();
//         return res.status(201).json({
//             message: 'Class Created Successfully',
//             success: true,
//             data: savedClass
//         });
//     } catch (error) {
//         console.log("Error in createClassId:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const createSubFolder = async (req: Request, res: Response) => {
//     try {
//         const parentId = req.params.id;
//         const parent = await Material.findById(parentId);

//         if (!parent) {
//             return res.status(404).json({
//                 message: 'Parent folder not found',
//                 success: false
//             });
//         }

//         const { heading, description, fileDetails, referenceDetails, tags, lastDate, type, fileId, subject } = req.body;

//         if (!parentId) {
//             return res.status(400).json({
//                 message: 'Parent ID is required',
//                 success: false
//             });
//         }

//         // Validate: Either subject OR heading must be provided
//         // if (!subject && !heading) {
//         //     return res.status(400).json({
//         //         message: 'Either subject or heading is required',
//         //         success: false
//         //     });
//         // }

//         // Build the full path
//         const fullPath = await buildPath(parentId);

//         const newSubMaterial = new Material({
//             heading: heading || null, // Store heading if provided
//             subject: subject || null, // Store subject if provided
//             classType: parent.classType,
//             stream: parent.stream,
//             targetExam: parent.targetExam,
//             description,
//             fileDetails,
//             referenceDetails,
//             tags,
//             lastDate,
//             parentId,
//             type,
//             fileId,
//             path: fullPath // Store the complete path
//         });

//         const savedSubMaterial = await newSubMaterial.save();

//         // Populate subject to get the name for response
//         const populatedMaterial = await Material.findById(savedSubMaterial._id).populate('subject', 'name');

//         // Determine display heading
//         const displayHeading = populatedMaterial?.subject 
//             ? (populatedMaterial.subject as any).name 
//             : savedSubMaterial.heading;

//         return res.status(201).json({
//             message: 'Sub Folder Created Successfully',
//             success: true,
//             data: populatedMaterial,
//             breadcrumb: [...fullPath.map(p => p.heading), displayHeading].join(' -> ')
//         });

//     } catch (error) {
//         console.log("Error in createSubFolder:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const findByParentId = async (req: Request, res: Response) => {
//     try {
//         const parentId = req.params.id;
//         if (!parentId) {
//             return res.status(400).json({
//                 message: 'Parent ID is required',
//                 success: false
//             });
//         }

//         // Populate subject to get name
//         const materials = await Material.find({ parentId: parentId }).populate('subject', 'name');

//         return res.status(200).json({
//             message: 'Materials fetched successfully',
//             success: true,
//             data: materials
//         });
//     } catch (error) {
//         console.log("Error in findByParentId:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const deleteSubFolder = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({
//                 message: 'ID is required',
//                 success: false
//             });
//         }

//         const folder = await Material.findById(id);
//         if (!folder) {
//             return res.status(404).json({
//                 message: 'Sub Folder not found',
//                 success: false
//             });
//         }

//         const childFolders = await Material.find({ parentId: id, type: 'folder' });

//         if (childFolders.length > 0) {
//             return res.status(400).json({
//                 message: 'Please delete all subfolders before deleting this folder.',
//                 success: false
//             });
//         }

//         const childFiles = await Material.find({ parentId: id, type: 'file' });

//         if (childFiles.length > 0) {
//             const driveFileIds: string[] = [];

//             childFiles.forEach(file => {
//                 if (file.fileDetails && Array.isArray(file.fileDetails)) {
//                     file.fileDetails.forEach((detail: any) => {
//                         if (detail.fileId) {
//                             driveFileIds.push(detail.fileId);
//                         }
//                     });
//                 }
//             });

//             if (driveFileIds.length > 0) {
//                 return res.status(200).json({
//                     message: 'Files need to be deleted from Google Drive first',
//                     success: false,
//                     requiresDriveDeletion: true,
//                     driveFileIds: driveFileIds,
//                     folderId: id
//                 });
//             }

//             await Material.deleteMany({ parentId: id, type: 'file' });
//         }

//         const folderDriveFileIds: string[] = [];
//         if (folder.fileDetails && Array.isArray(folder.fileDetails)) {
//             folder.fileDetails.forEach((detail: any) => {
//                 if (detail.fileId) {
//                     folderDriveFileIds.push(detail.fileId);
//                 }
//             });
//         }

//         if (folderDriveFileIds.length > 0) {
//             return res.status(200).json({
//                 message: 'Folder files need to be deleted from Google Drive first',
//                 success: false,
//                 requiresDriveDeletion: true,
//                 driveFileIds: folderDriveFileIds,
//                 folderId: id
//             });
//         }

//         await Material.findByIdAndDelete(id);

//         return res.status(200).json({
//             message: 'Folder and Files Deleted Successfully',
//             success: true
//         });
//     } catch (error) {
//         console.log("Error in deleteSubFolder:", error);
//         return res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// const confirmFolderDeletion = async (req: Request, res: Response) => {
//     try {
//         const { folderId } = req.body;

//         if (!folderId) {
//             return res.status(400).json({
//                 message: 'Folder ID is required',
//                 success: false
//             });
//         }

//         await Material.deleteMany({ parentId: folderId, type: 'file' });
//         await Material.findByIdAndDelete(folderId);

//         return res.status(200).json({
//             message: 'Folder and Files Deleted Successfully',
//             success: true
//         });
//     } catch (error) {
//         console.log("Error in confirmFolderDeletion:", error);
//         return res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// const updateSubFolder = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;

//         if (!id) {
//             return res.status(400).json({
//                 message: 'ID is required',
//                 success: false
//             });
//         }

//         const folder = await Material.findById(id).populate('subject', 'name');
//         if (!folder) {
//             return res.status(404).json({
//                 message: 'Sub Folder not found',
//                 success: false
//             });
//         }

//         const { heading, description, fileDetails, referenceDetails, tags, lastDate, type, targetExam, stream, classType, subject } = req.body;

//         // Check if this is a root folder (no parentId)
//         const isRootFolder = !folder.parentId;

//         // Get old heading for comparison
//         const oldHeading = folder.subject ? (folder.subject as any).name : folder.heading;

//         // Update folder fields
//         if (isRootFolder) {
//             // For root folders, heading is derived from classType
//             if (classType && classType !== folder.classType) {
//                 folder.heading = `Class ${classType}`;
//             }
//         } else {
//             // For subfolders, update subject and heading
//             folder.subject = subject !== undefined ? subject : folder.subject;
//             folder.heading = heading !== undefined ? heading : folder.heading;

//             // Validate: Either subject OR heading must be present
//             if (!folder.subject && !folder.heading) {
//                 return res.status(400).json({
//                     message: 'Either subject or heading is required',
//                     success: false
//                 });
//             }
//         }

//         folder.description = description !== undefined ? description : folder.description;
//         folder.fileDetails = fileDetails !== undefined ? fileDetails : folder.fileDetails;
//         folder.targetExam = targetExam !== undefined ? targetExam : folder.targetExam;
//         folder.stream = stream !== undefined ? stream : folder.stream;
//         folder.referenceDetails = referenceDetails !== undefined ? referenceDetails : folder.referenceDetails;
//         folder.tags = tags !== undefined ? tags : folder.tags;
//         folder.lastDate = lastDate !== undefined ? lastDate : folder.lastDate;
//         folder.type = type !== undefined ? type : folder.type;
//         folder.classType = classType !== undefined ? classType : folder.classType;

//         const updatedFolder = await folder.save();

//         // Populate subject after save
//         const populatedFolder = await Material.findById(updatedFolder._id).populate('subject', 'name');

//         // Get new heading
//         const newHeading = populatedFolder?.subject 
//             ? (populatedFolder.subject as any).name 
//             : updatedFolder.heading;

//         // If heading changed, update all descendant paths
//         const headingChanged = oldHeading !== newHeading;
//         if (headingChanged) {
//             await updateDescendantPaths(id, newHeading);
//         }

//         return res.status(200).json({
//             message: isRootFolder ? 'Class Updated Successfully' : 'Sub Folder Updated Successfully',
//             success: true,
//             data: populatedFolder,
//             breadcrumb: isRootFolder
//                 ? newHeading
//                 : [...(populatedFolder?.path || []).map(p => p.heading), newHeading].join(' -> '),
//             pathsUpdated: headingChanged,
//             isRootFolder
//         });

//     } catch (error) {
//         console.log("Error in updateSubFolder:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// const getAllClasses = async (req: Request, res: Response) => {
//     try {
//         const classes = await Material.find({ parentId: null }).sort({ createdAt: -1 });
//         return res.status(200).json({
//             message: 'Classes fetched successfully',
//             success: true,
//             data: classes
//         });
//     } catch (error) {
//         console.log("Error in getAllClasses:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }

// const getAllFiles = async (req: Request, res: Response) => {
//     try {
//         const { search } = req.query;

//         let query: any = {
//             fileDetails: { $exists: true, $ne: [] }
//         };

//         if (search && typeof search === 'string') {
//             query.$or = [
//                 { heading: { $regex: search, $options: 'i' } },
//                 { 'fileDetails.fileName': { $regex: search, $options: 'i' } },
//                 { tags: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const materials = await Material.find(query)
//             .select('fileDetails heading type path _id subject')
//             .populate('subject', 'name');

//         const uniqueFilesMap = new Map<string, {
//             fileName: string;
//             uploadLink: string;
//             fileId?: string;
//             parentHeading: string;
//             parentId: string;
//             breadcrumb: string;
//             fullPath: Array<{ id: string, heading: string }>;
//         }>();

//         materials.forEach(material => {
//             if (material.fileDetails && Array.isArray(material.fileDetails)) {
//                 material.fileDetails.forEach((file: any) => {
//                     if (file.fileName && file.uploadLink) {
//                         if (!uniqueFilesMap.has(file.uploadLink)) {
//                             // Get display heading (from subject or manual heading)
//                             const displayHeading = (material as any).subject 
//                                 ? (material as any).subject.name 
//                                 : material.heading;

//                             // Build breadcrumb from path
//                             const breadcrumbParts = [
//                                 ...(material.path || []).map(p => p.heading),
//                                 displayHeading
//                             ];

//                             uniqueFilesMap.set(file.uploadLink, {
//                                 fileName: file.fileName,
//                                 uploadLink: file.uploadLink,
//                                 fileId: file.fileId || undefined,
//                                 parentHeading: displayHeading,
//                                 parentId: material._id.toString(),
//                                 breadcrumb: breadcrumbParts.join(' -> '),
//                                 fullPath: [
//                                     ...(material.path || []),
//                                     { id: material._id.toString(), heading: displayHeading }
//                                 ]
//                             });
//                         }
//                     }
//                 });
//             }
//         });

//         const allFiles = Array.from(uniqueFilesMap.values());

//         return res.status(200).json({
//             message: 'Files fetched successfully',
//             success: true,
//             count: allFiles.length,
//             data: allFiles
//         });

//     } catch (error) {
//         console.log("Error in getAllFiles:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// export default {
//     createClassId,
//     createSubFolder,
//     findByParentId,
//     deleteSubFolder,
//     updateSubFolder,
//     getAllClasses,
//     confirmFolderDeletion,
//     getAllFiles
// };


import { Request, Response } from 'express';
import Material from '../models/Material';
import Stream from '../models/Stream'; // Import Stream model
import TargetExam from '../models/TargetExam'; // Import TargetExam model
import Subject from '../models/Subject'; // Import Subject model
import mongoose from 'mongoose';

// Helper function to build full path
const buildPath = async (parentId: string | null): Promise<Array<{ id: string, heading: string }>> => {
    if (!parentId) return [];

    const parent = await Material.findById(parentId).populate('subject');
    console.log(parent)
    if (!parent) return [];

    // Use subject.name if subject exists, otherwise use heading
    const parentHeading = parent.subject ? (parent.subject as any).name : parent.heading;

    // Return parent's path + parent itself
    return [
        ...parent.path || [],
        { id: parent._id.toString(), heading: parentHeading }
    ];
};

// Helper function to update paths for all descendants when a parent's heading changes
const updateDescendantPaths = async (nodeId: string, newHeading: string): Promise<void> => {
    const node = await Material.findById(nodeId);
    if (!node) return;

    // Build the new path for this node
    const newPath = node.parentId ? await buildPath(node.parentId.toString()) : [];

    // Update this node's path
    node.path = newPath;
    await node.save();

    // Find all direct children
    const children = await Material.find({ parentId: nodeId });

    // Recursively update each child's path
    for (const child of children) {
        // The child's new path should be: parent's path + parent
        const childNewPath = [
            ...newPath,
            { id: node._id.toString(), heading: newHeading }
        ];

        child.path = childNewPath;
        await child.save();

        // Get child's heading (from subject or manual)
        const childPopulated = await Material.findById(child._id).populate('subject', 'name');
        const childHeading = childPopulated?.subject ? (childPopulated.subject as any).name : child.heading;

        // Recursively update grandchildren
        await updateDescendantPaths(child._id.toString(), childHeading);
    }
};

// Helper function to check if referenced documents exist and update isActive
const checkAndUpdateIsActive = async (materialId: string): Promise<boolean> => {
    const material = await Material.findById(materialId);
    if (!material) return false;

    let isActive = true;

    // Check if it's a root folder (no parentId)
    const isRootFolder = !material.parentId;

    if (isRootFolder) {
        // For root folders, check stream and targetExam
        if (material.stream) {
            const streamExists = await Stream.findById(material.stream);
            if (!streamExists) {
                isActive = false;
            }
        }

        if (material.targetExam) {
            const targetExamExists = await TargetExam.findById(material.targetExam);
            if (!targetExamExists) {
                isActive = false;
            }
        }
    } else {
        // For subfolders, check subject
        if (material.subject) {
            const subjectExists = await Subject.findById(material.subject);
            if (!subjectExists) {
                isActive = false;
            }
        }
    }

    // Update isActive field if it changed
    if (material.isActive !== isActive) {
        material.isActive = isActive;

        // If marked as inactive, set inactiveSince timestamp
        if (!isActive && !material.inactiveSince) {
            material.inactiveSince = new Date();
        } else if (isActive) {
            material.inactiveSince = undefined;
        }

        await material.save();
    }

    return isActive;
};

// Helper function to recursively mark descendants as inactive
const markDescendantsInactive = async (parentId: string): Promise<void> => {
    const children = await Material.find({ parentId });

    for (const child of children) {
        if (child.isActive) {
            child.isActive = false;
            if (!child.inactiveSince) {
                child.inactiveSince = new Date();
            }
            await child.save();

            // Recursively mark grandchildren
            await markDescendantsInactive(child._id.toString());
        }
    }
};

// Function to clean up inactive materials older than 3 months
const cleanupInactiveMaterials = async (): Promise<void> => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const inactiveMaterials = await Material.find({
            isActive: false,
            inactiveSince: { $lte: threeMonthsAgo }
        });

        for (const material of inactiveMaterials) {
            // Delete all descendants first
            await deleteDescendants(material._id.toString());

            // Delete the material itself
            await Material.findByIdAndDelete(material._id);
        }

        console.log(`Cleaned up ${inactiveMaterials.length} inactive materials`);
    } catch (error) {
        console.error('Error in cleanupInactiveMaterials:', error);
    }
};

// Helper function to delete all descendants
const deleteDescendants = async (parentId: string): Promise<void> => {
    const children = await Material.find({ parentId });

    for (const child of children) {
        // Recursively delete grandchildren
        await deleteDescendants(child._id.toString());

        // Delete the child
        await Material.findByIdAndDelete(child._id);
    }
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createClassId = async (req: Request, res: Response) => {
    try {
        const { className, targetExam, stream } = req.body;

        const validStream = isValidObjectId(stream) ? stream : null;

        const findExisting = await Material.findOne({
            classType: className,
            targetExam: targetExam,
            stream: validStream
        });

        if (findExisting) {
            return res.status(200).json({
                message: 'Class Already Exists',
                success: false,
                data: findExisting
            });
        }

        const newClass = new Material({
            classType: className,
            targetExam: targetExam,
            stream: validStream,
            parentId: null,
            heading: `Class ${className}`,
            path: [], // Root level has empty path
            isActive: true // Default is true
        });

        const savedClass = await newClass.save();

        // Check and update isActive status
        await checkAndUpdateIsActive(savedClass._id.toString());

        // Fetch updated material
        const updatedClass = await Material.findById(savedClass._id);

        return res.status(201).json({
            message: 'Class Created Successfully',
            success: true,
            data: updatedClass
        });
    } catch (error) {
        console.log("Error in createClassId:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
}

const createSubFolder = async (req: Request, res: Response) => {
    try {
        const parentId = req.params.id;
        const parent = await Material.findById(parentId);

        if (!parent) {
            return res.status(404).json({
                message: 'Parent folder not found',
                success: false
            });
        }

        // Check if parent is active
        if (!parent.isActive) {
            return res.status(400).json({
                message: 'Cannot create subfolder under inactive parent',
                success: false
            });
        }

        const { heading, description, fileDetails, referenceDetails, tags, lastDate, type, fileId, subject } = req.body;

        if (!parentId) {
            return res.status(400).json({
                message: 'Parent ID is required',
                success: false
            });
        }

        // Build the full path
        const fullPath = await buildPath(parentId);

        const newSubMaterial = new Material({
            heading: heading || null,
            subject: subject || null,
            classType: parent.classType,
            stream: parent.stream,
            targetExam: parent.targetExam,
            description,
            fileDetails,
            referenceDetails,
            tags,
            lastDate,
            parentId,
            type,
            fileId,
            path: fullPath,
            isActive: true // Default is true
        });

        const savedSubMaterial = await newSubMaterial.save();

        // Check and update isActive status
        await checkAndUpdateIsActive(savedSubMaterial._id.toString());

        // Populate subject to get the name for response
        const populatedMaterial = await Material.findById(savedSubMaterial._id).populate('subject', 'name');

        // Determine display heading
        const displayHeading = populatedMaterial?.subject
            ? (populatedMaterial.subject as any).name
            : savedSubMaterial.heading;

        return res.status(201).json({
            message: 'Sub Folder Created Successfully',
            success: true,
            data: populatedMaterial,
            breadcrumb: [...fullPath.map(p => p.heading), displayHeading].join(' -> ')
        });

    } catch (error) {
        console.log("Error in createSubFolder:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
}

const findByParentId = async (req: Request, res: Response) => {
    try {
        const parentId = req.params.id;
        if (!parentId) {
            return res.status(400).json({
                message: 'Parent ID is required',
                success: false
            });
        }

        // Find materials and populate subject
        const materials = await Material.find({ parentId: parentId }).populate('subject', 'name');

        // Check and update isActive for each material
        for (const material of materials) {
            await checkAndUpdateIsActive(material._id.toString());
        }

        // Fetch updated materials and filter only active ones
        const updatedMaterials = await Material.find({
            parentId: parentId,
            isActive: true
        }).populate('subject', 'name');

        return res.status(200).json({
            message: 'Materials fetched successfully',
            success: true,
            data: updatedMaterials
        });
    } catch (error) {
        console.log("Error in findByParentId:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
}

const deleteSubFolder = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                message: 'ID is required',
                success: false
            });
        }

        const folder = await Material.findById(id);
        if (!folder) {
            return res.status(404).json({
                message: 'Sub Folder not found',
                success: false
            });
        }

        const childFolders = await Material.find({ parentId: id, type: 'folder' });

        if (childFolders.length > 0) {
            return res.status(400).json({
                message: 'Please delete all subfolders before deleting this folder.',
                success: false
            });
        }

        const childFiles = await Material.find({ parentId: id, type: 'file' });

        if (childFiles.length > 0) {
            const driveFileIds: string[] = [];

            childFiles.forEach(file => {
                if (file.fileDetails && Array.isArray(file.fileDetails)) {
                    file.fileDetails.forEach((detail: any) => {
                        if (detail.fileId) {
                            driveFileIds.push(detail.fileId);
                        }
                    });
                }
            });

            if (driveFileIds.length > 0) {
                return res.status(200).json({
                    message: 'Files need to be deleted from Google Drive first',
                    success: false,
                    requiresDriveDeletion: true,
                    driveFileIds: driveFileIds,
                    folderId: id
                });
            }

            await Material.deleteMany({ parentId: id, type: 'file' });
        }

        const folderDriveFileIds: string[] = [];
        if (folder.fileDetails && Array.isArray(folder.fileDetails)) {
            folder.fileDetails.forEach((detail: any) => {
                if (detail.fileId) {
                    folderDriveFileIds.push(detail.fileId);
                }
            });
        }

        if (folderDriveFileIds.length > 0) {
            return res.status(200).json({
                message: 'Folder files need to be deleted from Google Drive first',
                success: false,
                requiresDriveDeletion: true,
                driveFileIds: folderDriveFileIds,
                folderId: id
            });
        }

        await Material.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Folder and Files Deleted Successfully',
            success: true
        });
    } catch (error) {
        console.log("Error in deleteSubFolder:", error);
        return res.status(500).json({ message: 'Server Error', success: false });
    }
};

const confirmFolderDeletion = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.body;

        if (!folderId) {
            return res.status(400).json({
                message: 'Folder ID is required',
                success: false
            });
        }

        await Material.deleteMany({ parentId: folderId, type: 'file' });
        await Material.findByIdAndDelete(folderId);

        return res.status(200).json({
            message: 'Folder and Files Deleted Successfully',
            success: true
        });
    } catch (error) {
        console.log("Error in confirmFolderDeletion:", error);
        return res.status(500).json({ message: 'Server Error', success: false });
    }
};

const updateSubFolder = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: 'ID is required',
                success: false
            });
        }

        const folder = await Material.findById(id).populate('subject', 'name');
        if (!folder) {
            return res.status(404).json({
                message: 'Sub Folder not found',
                success: false
            });
        }

        const { heading, description, fileDetails, referenceDetails, tags, lastDate, type, targetExam, stream, classType, subject } = req.body;

        // Check if this is a root folder (no parentId)
        const isRootFolder = !folder.parentId;

        // Get old heading for comparison
        const oldHeading = folder.subject ? (folder.subject as any).name : folder.heading;

        // Update folder fields
        if (isRootFolder) {
            // For root folders, heading is derived from classType
            if (classType && classType !== folder.classType) {
                folder.heading = `Class ${classType}`;
            }
        } else {
            // For subfolders, update subject and heading
            folder.subject = subject !== undefined ? subject : folder.subject;
            folder.heading = heading !== undefined ? heading : folder.heading;

            // Validate: Either subject OR heading must be present
            if (!folder.subject && !folder.heading) {
                return res.status(400).json({
                    message: 'Either subject or heading is required',
                    success: false
                });
            }
        }

        folder.description = description !== undefined ? description : folder.description;
        folder.fileDetails = fileDetails !== undefined ? fileDetails : folder.fileDetails;
        folder.targetExam = targetExam !== undefined ? targetExam : folder.targetExam;
        folder.stream = stream !== undefined ? stream : folder.stream;
        folder.referenceDetails = referenceDetails !== undefined ? referenceDetails : folder.referenceDetails;
        folder.tags = tags !== undefined ? tags : folder.tags;
        folder.lastDate = lastDate !== undefined ? lastDate : folder.lastDate;
        folder.type = type !== undefined ? type : folder.type;
        folder.classType = classType !== undefined ? classType : folder.classType;

        const updatedFolder = await folder.save();

        // Check and update isActive status
        const isActive = await checkAndUpdateIsActive(updatedFolder._id.toString());

        // If folder became inactive, mark all descendants as inactive
        if (!isActive) {
            await markDescendantsInactive(updatedFolder._id.toString());
        }

        // Populate subject after save
        const populatedFolder = await Material.findById(updatedFolder._id).populate('subject', 'name');

        // Get new heading
        const newHeading = populatedFolder?.subject
            ? (populatedFolder.subject as any).name
            : updatedFolder.heading;

        // If heading changed, update all descendant paths
        const headingChanged = oldHeading !== newHeading;
        if (headingChanged) {
            await updateDescendantPaths(id, newHeading);
        }

        return res.status(200).json({
            message: isRootFolder ? 'Class Updated Successfully' : 'Sub Folder Updated Successfully',
            success: true,
            data: populatedFolder,
            breadcrumb: isRootFolder
                ? newHeading
                : [...(populatedFolder?.path || []).map(p => p.heading), newHeading].join(' -> '),
            pathsUpdated: headingChanged,
            isRootFolder
        });

    } catch (error) {
        console.log("Error in updateSubFolder:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
};

const getAllClasses = async (req: Request, res: Response) => {
    try {
        const classes = await Material.find({ parentId: null }).sort({ createdAt: -1 });

        // Check and update isActive for each class
        for (const classItem of classes) {
            const wasActive = classItem.isActive;
            const isActive = await checkAndUpdateIsActive(classItem._id.toString());

            // If class became inactive, mark all descendants as inactive
            if (wasActive && !isActive) {
                await markDescendantsInactive(classItem._id.toString());
            }
        }

        // Fetch updated classes and filter only active ones, with populated refs
        const activeClasses = await Material.find({
            parentId: null,
            isActive: true
        })
            .populate('stream', 'name')
            .populate('targetExam', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Classes fetched successfully',
            success: true,
            data: activeClasses
        });
    } catch (error) {
        console.log("Error in getAllClasses:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
}

const getAllFiles = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        let query: any = {
            fileDetails: { $exists: true, $ne: [] },
            isActive: true // Only fetch files from active materials
        };

        if (search && typeof search === 'string') {
            query.$or = [
                { heading: { $regex: search, $options: 'i' } },
                { 'fileDetails.fileName': { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const materials = await Material.find(query)
            .select('fileDetails heading type path _id subject')
            .populate('subject', 'name');

        const uniqueFilesMap = new Map<string, {
            fileName: string;
            uploadLink: string;
            fileId?: string;
            parentHeading: string;
            parentId: string;
            breadcrumb: string;
            fullPath: Array<{ id: string, heading: string }>;
        }>();

        materials.forEach(material => {
            if (material.fileDetails && Array.isArray(material.fileDetails)) {
                material.fileDetails.forEach((file: any) => {
                    if (file.fileName && file.uploadLink) {
                        if (!uniqueFilesMap.has(file.uploadLink)) {
                            // Get display heading (from subject or manual heading)
                            const displayHeading = (material as any).subject
                                ? (material as any).subject.name
                                : material.heading;

                            // Build breadcrumb from path
                            const breadcrumbParts = [
                                ...(material.path || []).map(p => p.heading),
                                displayHeading
                            ];

                            uniqueFilesMap.set(file.uploadLink, {
                                fileName: file.fileName,
                                uploadLink: file.uploadLink,
                                fileId: file.fileId || undefined,
                                parentHeading: displayHeading,
                                parentId: material._id.toString(),
                                breadcrumb: breadcrumbParts.join(' -> '),
                                fullPath: [
                                    ...(material.path || []),
                                    { id: material._id.toString(), heading: displayHeading }
                                ]
                            });
                        }
                    }
                });
            }
        });

        const allFiles = Array.from(uniqueFilesMap.values());

        return res.status(200).json({
            message: 'Files fetched successfully',
            success: true,
            count: allFiles.length,
            data: allFiles
        });

    } catch (error) {
        console.log("Error in getAllFiles:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
};

// Endpoint to manually trigger cleanup (can be called by cron job)
const triggerCleanup = async (req: Request, res: Response) => {
    try {
        await cleanupInactiveMaterials();
        return res.status(200).json({
            message: 'Cleanup completed successfully',
            success: true
        });
    } catch (error) {
        console.log("Error in triggerCleanup:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
};

export default {
    createClassId,
    createSubFolder,
    findByParentId,
    deleteSubFolder,
    updateSubFolder,
    getAllClasses,
    confirmFolderDeletion,
    getAllFiles,
    triggerCleanup,
    cleanupInactiveMaterials // Export for use in cron job
};