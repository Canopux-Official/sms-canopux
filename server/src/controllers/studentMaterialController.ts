// import express, { Request, Response } from 'express'
// import Student from '../models/Student';
// import Material from '../models/Material';


// const showClass = async (req: Request, res: Response) => {
//     try {
//         const studentId = req.user.id;

//         // Populate targetExams and stream to get the full objects with their details
//         const student = await Student.findById(studentId)
//             .populate('targetExams', 'name _id') // Populate targetExams with name and _id
//             .populate('stream', 'name _id');     // Populate stream with name and _id

//         if (!student) {
//             return res.status(404).json({
//                 message: "Student with the given id is not present",
//                 success: false
//             });
//         }

//         if (!student.isActive) {
//             return res.status(403).json({
//                 message: "Student is not active",
//                 success: false
//             });
//         }

//         const targetExams = student.targetExams; // This will be an array of populated objects
//         const stream = student.stream;           // This will be a populated object
//         const className = student.currentClass;

//         const allClasses = [];

//         // Iterate through each target exam
//         for (const exam of targetExams) {
//             // Build the query object based on whether stream exists
//             const query: any = {
//                 targetExam: exam._id,    // Always use the targetExam ObjectId
//                 classType: className     // Always use the classType (className)
//             };

//             // If stream exists, include it in the query
//             if (stream) {
//                 query.stream = stream._id; // Use stream ObjectId if available
//             }

//             // Query using ObjectId references
//             const classesMaterial = await Material.findOne(query)
//                 .populate('targetExam', 'name _id')  // Populate to return full details
//                 .populate('stream', 'name _id');     // Populate to return full details

//             if (classesMaterial) {
//                 allClasses.push(classesMaterial);
//             }
//         }

//         // Return the classes with populated data
//         return res.status(200).json({
//             message: "Fetched Successfully",
//             success: true,
//             data: allClasses,
//             studentInfo: {
//                 targetExams: targetExams,
//                 stream: stream,
//                 currentClass: className
//             }
//         });

//     } catch (error) {
//         console.log("Error in showClass:", error);
//         res.status(500).json({
//             message: 'Server Error',
//             success: false
//         });
//     }
// }


// const findByParentId = async (req: Request, res: Response) => {
//     try {
//         const parentId = req.params.id;
//         if (!parentId) {
//             return res.status(400).json({ message: 'Parent ID is required', success: false });
//         }
//         const materials = await Material.find({ parentId: parentId });
//         return res.status(200).json({ message: 'Materials fetched successfully', success: true, data: materials });
//     } catch (error) {
//         console.log("Error in createClassId:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// }


// const getRecentMaterials = async (req: Request, res: Response) => {
//     try {
//         const { limit = 10 } = req.query;
//         const userId = req.user?.id;

//         if (!userId) {
//             return res.status(401).json({
//                 message: 'Unauthorized - User not authenticated',
//                 success: false
//             });
//         }

//         // Fetch student details to get their class, stream, and targetExams
//         const student = await Student.findById(userId)
//             .select('currentClass stream targetExams');


//         if (!student) {
//             return res.status(404).json({
//                 message: 'Student not found',
//                 success: false
//             });
//         }

//         const { currentClass, stream, targetExams } = student;

//         if (!currentClass || !stream || !targetExams || targetExams.length === 0) {
//             return res.status(400).json({
//                 message: 'Student profile incomplete. Please update class, stream, and target exams.',
//                 success: false
//             });
//         }

//         // Find all materials that:
//         // 1. Match the student's class
//         // 2. Match the student's stream
//         // 3. Match ANY of the student's target exams
//         // 4. Are files (not folders)
//         // 5. Have fileDetails (actual files uploaded)
//         const materials = await Material.find({
//             classType: currentClass,
//             stream: stream,
//             targetExam: { $in: targetExams }, // Match any of the student's target exams
//             type: 'file',
//             fileDetails: { $exists: true, $ne: [] }
//         })
//             .sort({ updatedAt: -1 }) // Sort by most recently updated
//             .limit(Number(limit))
//             .select('heading description fileDetails path updatedAt createdAt tags targetExam')
//             .populate('targetExam', 'name'); // Populate target exam name

//         // Transform the data to include file-specific information
//         const recentMaterials = materials.map(material => {
//             // Build the breadcrumb from path
//             const breadcrumbParts = [
//                 ...(material.path || []).map(p => p.heading),
//                 material.heading
//             ];

//             // Get subject from the path (usually first item after root class)
//             const subject = material.path && material.path.length > 0
//                 ? material.path[1]?.heading || 'General' // Index 1 because 0 is the class
//                 : 'General';

//             // Determine if this was added today, yesterday, or earlier
//             const now = new Date();
//             const updatedDate = new Date(material.updatedAt);
//             const createdDate = new Date(material.createdAt);
//             const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
//             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//             let timeLabel = '';
//             const wasJustCreated = Math.abs(createdDate.getTime() - updatedDate.getTime()) < 60000; // Within 1 minute

//             if (diffDays === 0) {
//                 timeLabel = wasJustCreated ? 'Added Today' : 'Updated Today';
//             } else if (diffDays === 1) {
//                 timeLabel = wasJustCreated ? 'Added Yesterday' : 'Updated Yesterday';
//             } else {
//                 timeLabel = wasJustCreated
//                     ? `Added ${diffDays} days ago`
//                     : `Updated ${diffDays} days ago`;
//             }

//             return {
//                 _id: material._id,
//                 heading: material.heading,
//                 description: material.description,
//                 subject,
//                 breadcrumb: breadcrumbParts.join(' → '),
//                 path: material.path,
//                 fullPath: [
//                     ...(material.path || []),
//                     { id: material._id.toString(), heading: material.heading }
//                 ],
//                 fileCount: material.fileDetails?.length || 0,
//                 fileDetails: material.fileDetails,
//                 tags: material.tags,
//                 targetExam: (material.targetExam as any)?.name || 'N/A',
//                 updatedAt: material.updatedAt,
//                 createdAt: material.createdAt,
//                 timeLabel,
//                 wasRecentlyUpdated: !wasJustCreated
//             };
//         });

//         return res.status(200).json({
//             message: 'Recent materials fetched successfully',
//             success: true,
//             count: recentMaterials.length,
//             data: recentMaterials
//         });

//     } catch (error) {
//         console.log("Error in getRecentMaterials:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// };

// // Get material statistics for dashboard
// const getMaterialStats = async (req: Request, res: Response) => {
//     try {
//         const userId = req.user?.id;

//         if (!userId) {
//             return res.status(401).json({
//                 message: 'Unauthorized - User not authenticated',
//                 success: false
//             });
//         }

//         // Fetch student details
//         const student = await Student.findById(userId)
//             .select('currentClass stream targetExams');

//         if (!student) {
//             return res.status(404).json({
//                 message: 'Student not found',
//                 success: false
//             });
//         }

//         const { currentClass, stream, targetExams } = student;

//         if (!currentClass || !stream || !targetExams || targetExams.length === 0) {
//             return res.status(400).json({
//                 message: 'Student profile incomplete',
//                 success: false
//             });
//         }

//         // Get counts for different time periods
//         const now = new Date();
//         const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//         const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

//         const baseQuery = {
//             classType: currentClass,
//             stream: stream,
//             targetExam: { $in: targetExams },
//             type: 'file',
//             fileDetails: { $exists: true, $ne: [] }
//         };

//         const [todayCount, weekCount, totalCount] = await Promise.all([
//             Material.countDocuments({
//                 ...baseQuery,
//                 updatedAt: { $gte: oneDayAgo }
//             }),
//             Material.countDocuments({
//                 ...baseQuery,
//                 updatedAt: { $gte: oneWeekAgo }
//             }),
//             Material.countDocuments(baseQuery)
//         ]);

//         return res.status(200).json({
//             message: 'Material stats fetched successfully',
//             success: true,
//             data: {
//                 today: todayCount,
//                 thisWeek: weekCount,
//                 total: totalCount
//             }
//         });

//     } catch (error) {
//         console.log("Error in getMaterialStats:", error);
//         res.status(500).json({ message: 'Server Error', success: false });
//     }
// };


// export default { showClass, findByParentId, getMaterialStats, getRecentMaterials };


import express, { Request, Response } from 'express'
import Student from '../models/Student';
import Material from '../models/Material';


const showClass = async (req: Request, res: Response) => {
    try {
        const studentId = req.user.id;

        // Populate targetExams and stream to get the full objects with their details
        const student = await Student.findById(studentId)
            .populate('targetExams', 'name _id') // Populate targetExams with name and _id
            .populate('stream', 'name _id');     // Populate stream with name and _id

        if (!student) {
            return res.status(404).json({
                message: "Student with the given id is not present",
                success: false
            });
        }

        if (!student.isActive) {
            return res.status(403).json({
                message: "Student is not active",
                success: false
            });
        }

        const targetExams = student.targetExams; // This will be an array of populated objects
        const stream = student.stream;           // This will be a populated object
        const className = student.currentClass;

        console.log(targetExams, stream, className);

        const allClasses = [];

        // Iterate through each target exam
        for (const exam of targetExams) {
            // Build the query object based on whether stream exists
            const query: any = {
                targetExam: exam._id,    // Always use the targetExam ObjectId
                classType: className,     // Always use the classType (className)
                isActive: true           // Only fetch active materials
            };

            // If stream exists, include it in the query
            if (stream) {
                query.stream = stream._id; // Use stream ObjectId if available
            }

            // Query using ObjectId references
            const classesMaterial = await Material.findOne(query)
                .populate('targetExam', 'name _id')  // Populate to return full details
                .populate('stream', 'name _id');     // Populate to return full details

            if (classesMaterial) {
                allClasses.push(classesMaterial);
            }
        }

        console.log(allClasses)

        // Return the classes with populated data
        return res.status(200).json({
            message: "Fetched Successfully",
            success: true,
            data: allClasses,
            studentInfo: {
                targetExams: targetExams,
                stream: stream,
                currentClass: className
            }
        });

    } catch (error) {
        console.log("Error in showClass:", error);
        res.status(500).json({
            message: 'Server Error',
            success: false
        });
    }
}


const findByParentId = async (req: Request, res: Response) => {
    try {
        const parentId = req.params.id;
        if (!parentId) {
            return res.status(400).json({ message: 'Parent ID is required', success: false });
        }

        // Only fetch active materials
        const materials = await Material.find({
            parentId: parentId,
            isActive: true
        }).populate('subject', 'name');

        return res.status(200).json({
            message: 'Materials fetched successfully',
            success: true,
            data: materials
        });
    } catch (error) {
        console.log("Error in findByParentId:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
}


const getRecentMaterials = async (req: Request, res: Response) => {
    try {
        const { limit = 10 } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized - User not authenticated',
                success: false
            });
        }

        // Fetch student details to get their class, stream, and targetExams
        const student = await Student.findById(userId)
            .select('currentClass stream targetExams');


        if (!student) {
            return res.status(404).json({
                message: 'Student not found',
                success: false
            });
        }

        const { currentClass, stream, targetExams } = student;

        if (!currentClass || !targetExams || targetExams.length === 0) {
            return res.status(400).json({
                message: 'Student profile incomplete. Please update class and target exams.',
                success: false
            });
        }

        // Build the query object based on whether stream exists
        const query: any = {
            classType: currentClass,
            targetExam: { $in: targetExams }, // Match any of the student's target exams
            type: 'file',
            fileDetails: { $exists: true, $ne: [] },
            isActive: true // Only fetch active materials
        };

        // If stream exists, include it in the query
        if (stream) {
            query.stream = stream;
        }

        // Find all materials that:
        // 1. Match the student's class
        // 2. Match the student's stream (if stream exists)
        // 3. Match ANY of the student's target exams
        // 4. Are files (not folders)
        // 5. Have fileDetails (actual files uploaded)
        // 6. Are active
        const materials = await Material.find(query)
            .sort({ updatedAt: -1 }) // Sort by most recently updated
            .limit(Number(limit))
            .select('heading description fileDetails path updatedAt createdAt tags targetExam subject')
            .populate('targetExam', 'name')
            .populate('subject', 'name'); // Populate subject as well

        // Transform the data to include file-specific information
        const recentMaterials = materials.map(material => {
            // Get display heading (from subject or manual heading)
            const displayHeading = (material as any).subject
                ? (material as any).subject.name
                : material.heading;

            // Build the breadcrumb from path
            const breadcrumbParts = [
                ...(material.path || []).map(p => p.heading),
                displayHeading
            ];

            // Get subject from the path (usually first item after root class)
            const subject = material.path && material.path.length > 0
                ? material.path[1]?.heading || 'General' // Index 1 because 0 is the class
                : 'General';

            // Determine if this was added today, yesterday, or earlier
            const now = new Date();
            const updatedDate = new Date(material.updatedAt);
            const createdDate = new Date(material.createdAt);
            const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let timeLabel = '';
            const wasJustCreated = Math.abs(createdDate.getTime() - updatedDate.getTime()) < 60000; // Within 1 minute

            if (diffDays === 0) {
                timeLabel = wasJustCreated ? 'Added Today' : 'Updated Today';
            } else if (diffDays === 1) {
                timeLabel = wasJustCreated ? 'Added Yesterday' : 'Updated Yesterday';
            } else {
                timeLabel = wasJustCreated
                    ? `Added ${diffDays} days ago`
                    : `Updated ${diffDays} days ago`;
            }

            return {
                _id: material._id,
                heading: displayHeading,
                description: material.description,
                subject,
                breadcrumb: breadcrumbParts.join(' → '),
                path: material.path,
                fullPath: [
                    ...(material.path || []),
                    { id: material._id.toString(), heading: displayHeading }
                ],
                fileCount: material.fileDetails?.length || 0,
                fileDetails: material.fileDetails,
                tags: material.tags,
                targetExam: (material.targetExam as any)?.name || 'N/A',
                updatedAt: material.updatedAt,
                createdAt: material.createdAt,
                timeLabel,
                wasRecentlyUpdated: !wasJustCreated
            };
        });

        return res.status(200).json({
            message: 'Recent materials fetched successfully',
            success: true,
            count: recentMaterials.length,
            data: recentMaterials
        });

    } catch (error) {
        console.log("Error in getRecentMaterials:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
};

// Get material statistics for dashboard
const getMaterialStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized - User not authenticated',
                success: false
            });
        }

        // Fetch student details
        const student = await Student.findById(userId)
            .select('currentClass stream targetExams');

        if (!student) {
            return res.status(404).json({
                message: 'Student not found',
                success: false
            });
        }

        const { currentClass, stream, targetExams } = student;

        if (!currentClass || !targetExams || targetExams.length === 0) {
            return res.status(400).json({
                message: 'Student profile incomplete',
                success: false
            });
        }

        // Get counts for different time periods
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Build the base query object based on whether stream exists
        const baseQuery: any = {
            classType: currentClass,
            targetExam: { $in: targetExams },
            type: 'file',
            fileDetails: { $exists: true, $ne: [] },
            isActive: true // Only count active materials
        };

        // If stream exists, include it in the query
        if (stream) {
            baseQuery.stream = stream;
        }

        const [todayCount, weekCount, totalCount] = await Promise.all([
            Material.countDocuments({
                ...baseQuery,
                updatedAt: { $gte: oneDayAgo }
            }),
            Material.countDocuments({
                ...baseQuery,
                updatedAt: { $gte: oneWeekAgo }
            }),
            Material.countDocuments(baseQuery)
        ]);

        return res.status(200).json({
            message: 'Material stats fetched successfully',
            success: true,
            data: {
                today: todayCount,
                thisWeek: weekCount,
                total: totalCount
            }
        });

    } catch (error) {
        console.log("Error in getMaterialStats:", error);
        res.status(500).json({ message: 'Server Error', success: false });
    }
};


export default { showClass, findByParentId, getMaterialStats, getRecentMaterials };