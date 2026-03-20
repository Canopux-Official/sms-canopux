
import { Request, Response } from 'express';
import Notice from '../models/Notice';
import Student from '../models/Student';

// Create Notice (Admin)
const createNotice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { heading, description, imageLink, tag, classType, streams, targetExams, isForAll } = req.body;

        // If isForAll is true, set classType, streams, targetExams to default values
        const noticeData = {
            heading,
            description,
            imageLink,
            tag,
            classType: isForAll ? '' : classType || '',
            streams: isForAll ? [] : (Array.isArray(streams) ? streams.filter(s => s) : []),
            targetExams: isForAll ? [] : (Array.isArray(targetExams) ? targetExams.filter(e => e) : []),
            isForAll
        };

        const notice = await Notice.create(noticeData);

        // Populate the created notice to return full data
        await notice.populate('streams');
        await notice.populate('targetExams');

        // console.log('Created notice:', noticeData);

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            data: notice
        });
    } catch (error: any) {
        console.error('Error creating notice:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create notice',
            error: error.message
        });
    }
};

// Edit Notice (Admin)
const editNotice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { heading, description, imageLink, tag, classType, streams, targetExams, isForAll } = req.body;

        const notice = await Notice.findById(id);

        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
            return;
        }

        // Update fields
        notice.heading = heading ?? notice.heading;
        notice.description = description ?? notice.description;
        notice.imageLink = imageLink ?? notice.imageLink;
        notice.tag = tag ?? notice.tag;
        notice.isForAll = isForAll ?? notice.isForAll;

        // If isForAll is true, clear arrays
        if (notice.isForAll) {
            notice.classType = '';
            notice.streams = [];
            notice.targetExams = [];
        } else {
            notice.classType = classType !== undefined ? classType : notice.classType;
            notice.streams = streams !== undefined ? (Array.isArray(streams) ? streams.filter(s => s) : []) : notice.streams;
            notice.targetExams = targetExams !== undefined ? (Array.isArray(targetExams) ? targetExams.filter(e => e) : []) : notice.targetExams;
        }

        await notice.save();

        // Populate before sending response
        await notice.populate('streams');
        await notice.populate('targetExams');

        res.status(200).json({
            success: true,
            message: 'Notice updated successfully',
            data: notice
        });
    } catch (error: any) {
        console.error('Error updating notice:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update notice',
            error: error.message
        });
    }
};

// Delete Notice (Admin)
const deleteNotice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const notice = await Notice.findByIdAndDelete(id);

        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Notice deleted successfully'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Failed to delete notice',
            error: error.message
        });
    }
};

// Get All Notices (Admin)
const getAllNoticesAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch all notices and populate the 'streams' and 'targetExams' fields
        const notices = await Notice.find()
            .populate('streams')
            .populate('targetExams')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notices
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Failed to fetch notices',
            error: error.message
        });
    }
};

// Get Notices for Student (Student)
const getNoticesForStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Fetch student details from Student schema
        const student = await Student.findById(userId).select('currentClass stream targetExams');

        if (!student) {
            res.status(404).json({
                success: false,
                message: 'Student not found'
            });
            return;
        }

        // Build query to fetch relevant notices
        const query: any = {
            $or: [
                { isForAll: true }, // Notices for all students
                {
                    // Match by class and target exams (stream optional)
                    classType: student.currentClass,
                    targetExams: { $in: student.targetExams }
                },
                {
                    // Match by class, target exams, and stream (when stream exists)
                    classType: student.currentClass,
                    targetExams: { $in: student.targetExams },
                    ...(student.stream && { streams: student.stream })
                }
            ]
        };

        const notices = await Notice.find(query)
            .populate('streams')
            .populate('targetExams')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: notices,
            count: notices.length
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Failed to fetch notices',
            error: error.message
        });
    }
};


// Get Single Notice
const getNoticeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id)
            .populate('streams')
            .populate('targetExams');

        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: notice
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Failed to fetch notice',
            error: error.message
        });
    }
};

export default {
    createNotice, editNotice, deleteNotice, getAllNoticesAdmin, getNoticeById, getNoticesForStudent
};