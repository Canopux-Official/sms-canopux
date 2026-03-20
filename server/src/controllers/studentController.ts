import { Request, Response } from 'express';
import Student from "../models/Student";
import Subject from "../models/Subject";
import Stream from "../models/Stream";       // Imported
import TargetExam from "../models/TargetExam"; // Imported
import Counter from "../models/Counter"; // Imported
import bcrypt from 'bcryptjs';

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

// Helper to hash passwords
const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};


// Helper: Map Subject Names -> ObjectIds
const getSubjectIds = async (subjectInput: string | string[]) => {
    if (!subjectInput) return [];
    const names = Array.isArray(subjectInput) ? subjectInput : String(subjectInput).split(',');
    if (names.length === 0) return [];
    // Case-insensitive lookup recommended, but exact match used here for speed
    const subjects = await Subject.find({ name: { $in: names } });
    return subjects.map(s => s._id);
};

// Helper: Get Stream ObjectId by Name
const getStreamId = async (streamName: string) => {
    if (!streamName || streamName.toUpperCase() === 'N/A') return null;
    const streamDoc = await Stream.findOne({ name: streamName });
    return streamDoc ? streamDoc._id : null;
};

// Helper: Get TargetExam ObjectIds by Names
const getTargetExamIds = async (examNames: string | string[]) => {
    if (!examNames) return [];
    const names = Array.isArray(examNames) ? examNames : String(examNames).split(',');
    if (names.length === 0) return [];

    const exams = await TargetExam.find({ name: { $in: names } });
    return exams.map(e => e._id);
};

// Helper: Get Next Enrollment Number
const getNextEnrollmentNumber = async () => {
    const counter = await Counter.findByIdAndUpdate(
        'enrollmentNumber',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    const seq = counter.sequence_value;
    return `JIS${String(seq).padStart(7, '0')}`;
};

// --- READ ---
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find({})
            .populate({
                path: 'enrolledSubjects',
                model: Subject,
                select: 'name stream'
            })
            .populate('stream', 'name')        // Populate Stream Name
            .populate('targetExams', 'name')   // Populate Exam Names
            .select('-password -createdAt -updatedAt')
            .sort({ admissionDate: -1 });

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: 'Error fetching students' });
    }
}

export const getStudentById = async (req: Request, res: Response) => {
    console.log(req.user);
    try {
        const student = await Student.findById(req.user?.id)
            .populate('enrolledSubjects', 'name stream')
            .populate('stream', 'name')
            .populate('targetExams', 'name');

        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch {
        res.status(500).json({ message: 'Error fetching student details' });
    }
}

// --- CREATE ---
export const addStudent = async (req: Request, res: Response) => {
    try {
        let students = [];
        if (req.body.students && Array.isArray(req.body.students)) {
            students = req.body.students;
        } else if (req.body.name || req.body.phoneNumber) {
            students = [req.body];
        } else {
            return res.status(400).json({ message: "Invalid data: No student data found." });
        }

        const addedStudents = [];
        const failedStudents = [];

        for (const student of students) {
            const { name, phoneNumber, dob, email } = student;
            const currentClass = student.currentClass || student.studentClass || student.class || student.standard;
            const academicSession = student.academicSession;

            // Raw Inputs
            const rawStream = student.stream ? String(student.stream).trim() : null;
            const rawTargetExams = student.targetExams || [];

            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!phoneNumber) missingFields.push('phoneNumber');
            if (!dob) missingFields.push('dob');
            if (!currentClass) missingFields.push('currentClass');
            if (!academicSession) missingFields.push('academicSession');
            if (!rawTargetExams || rawTargetExams.length === 0) missingFields.push('targetExams');

            if (missingFields.length > 0) {
                failedStudents.push({
                    name: name || 'Unknown',
                    phoneNumber: phoneNumber || 'N/A',
                    reason: `Missing required fields: ${missingFields.join(', ')}`
                });
                continue;
            }

            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
                failedStudents.push({ name, phoneNumber, reason: "Invalid Date of Birth format" });
                continue;
            }

            // Use provided URL from frontend directly (uploaded to Cloudinary)
            const profilePhotoUrl = student.profilePhoto || '';

            // --- RESOLVE IDS ---
            let subjectIds: any[] = [];
            let streamId: any = null;
            let targetExamIds: any[] = [];

            try {
                // 1. Resolve Subjects
                subjectIds = await getSubjectIds(student.enrolledSubjects);

                // 2. Resolve Stream
                if (rawStream) {
                    streamId = await getStreamId(rawStream);
                    // Optional: If stream provided but not found, you might want to warn or fail
                }

                // 3. Resolve Target Exams
                targetExamIds = await getTargetExamIds(rawTargetExams);

            } catch (err) {
                console.error("Reference lookup failed", err);
            }

            const passwordToHash = student.password || phoneNumber;
            const hashedPassword = await hashPassword(String(passwordToHash));

            const existingStudent = await Student.findOne({
                name: name,
                phoneNumber: phoneNumber,
                currentClass: currentClass,
                dob: dobDate
            });

            if (existingStudent) {
                failedStudents.push({
                    name,
                    phoneNumber,
                    reason: "Duplicate: Name, Phone, Class & DOB match an existing student."
                });
            } else {
                try {
                    const newStudent = await Student.create({
                        name,
                        phoneNumber,
                        profilePhoto: profilePhotoUrl,
                        dob: dobDate,
                        currentClass,
                        academicSession,
                        password: hashedPassword,

                        // Pass RESOLVED IDs here, not strings
                        targetExams: targetExamIds,
                        enrolledSubjects: subjectIds,
                        stream: streamId,

                        email: email || undefined, // undefined prevents storing 'N/A' strings
                        parentPhoneNumber: student.parentPhoneNumber || undefined,
                        isActive: true,
                        admissionDate: new Date(),
                        enrollmentNumber: await getNextEnrollmentNumber()
                    });

                    addedStudents.push(newStudent);
                } catch (createError: any) {
                    failedStudents.push({
                        name,
                        phoneNumber,
                        reason: createError.message.includes('E11000')
                            ? "Phone number or Email already exists."
                            : `Database Error: ${createError.message}`
                    });
                }
            }
        }

        return res.status(200).json({
            message: "Process completed",
            addedCount: addedStudents.length,
            failedCount: failedStudents.length,
            addedStudents,
            failedStudents,
        });

    } catch (error) {
        console.error("Error in addStudent controller:", error);
        return res.status(500).json({
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;


        // --- RESOLVE REFERENCES IF UPDATING ---

        // 1. Resolve Subjects
        if (updates.enrolledSubjects && Array.isArray(updates.enrolledSubjects)) {
            // Check if it looks like names (strings) instead of ObjectIds
            const firstItem = updates.enrolledSubjects[0];
            const isName = typeof firstItem === 'string' && !firstItem.match(/^[0-9a-fA-F]{24}$/);

            if (isName) {
                updates.enrolledSubjects = await getSubjectIds(updates.enrolledSubjects);
            }
        }

        // 2. Resolve Stream
        if (updates.stream && typeof updates.stream === 'string') {
            // Only resolve if it's not already an ObjectId
            if (!updates.stream.match(/^[0-9a-fA-F]{24}$/)) {
                updates.stream = await getStreamId(updates.stream);
            }
        }
        else {
            updates.stream = null;
        }

        // 3. Resolve Target Exams
        if (updates.targetExams && Array.isArray(updates.targetExams)) {
            const firstItem = updates.targetExams[0];
            const isName = typeof firstItem === 'string' && !firstItem.match(/^[0-9a-fA-F]{24}$/);

            if (isName) {
                updates.targetExams = await getTargetExamIds(updates.targetExams);
            }
        }

        // 4. Hash Password if provided
        if (updates.password && updates.password.trim() !== "") {
            updates.password = await hashPassword(updates.password.trim());
        } else {
            // Delete password from updates if it's empty or not provided to avoid overwriting with null/empty
            delete updates.password;
        }

        const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true })
            .populate('enrolledSubjects', 'name')
            .populate('stream', 'name')
            .populate('targetExams', 'name');

        if (!updatedStudent) return res.status(404).json({ message: "Student not found" });

        res.status(200).json({ success: true, message: "Student updated", student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating student' });
    }
}

// --- DELETE (Soft Delete) ---
export const toggleStudentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);

        if (!student) return res.status(404).json({ message: "Student not found" });

        // Toggle Status
        student.isActive = !student.isActive;
        await student.save();

        res.status(200).json({ success: true, message: `Student marked as ${student.isActive ? 'Active' : 'Inactive'}` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
}

// --- BULK IMPORT ---

export const bulkAddStudents = async (req: Request, res: Response) => {
    try {
        const { students } = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: "Invalid data format: 'students' array is required." });
        }

        const addedStudents = [];
        const failedStudents = [];

        for (const s of students) {
            try {
                // --- 1. Safe Type Conversion & Sanitization ---

                const name = s.name ? String(s.name).trim() : "";
                const phoneNumber = s.phoneNumber ? String(s.phoneNumber).trim() : "";
                const email = s.email ? String(s.email).trim() : undefined;
                const dobRaw = s.dob;

                // Handle Class Aliases
                const rawClass = s.currentClass || s.studentClass || s.class || s.standard;
                const currentClass = rawClass ? String(rawClass).trim() : "";

                const academicSession = s.academicSession ? String(s.academicSession).trim() : "";
                const parentPhoneNumber = s.parentPhoneNumber ? String(s.parentPhoneNumber).trim() : undefined;

                // Raw Inputs for References
                const rawStream = s.stream ? String(s.stream).trim() : null;
                let rawTargetExams: string[] = [];
                if (typeof s.targetExams === 'string') {
                    rawTargetExams = s.targetExams.split(/[|,]/).map((t: string) => t.trim()).filter((t: string) => t);
                } else if (Array.isArray(s.targetExams)) {
                    rawTargetExams = s.targetExams;
                }

                // --- 2. Validation ---
                const missingFields = [];
                if (!name) missingFields.push('name');
                if (!phoneNumber) missingFields.push('phoneNumber');
                if (!dobRaw) missingFields.push('dob');
                if (!currentClass) missingFields.push('currentClass');
                if (!academicSession) missingFields.push('academicSession');
                if (rawTargetExams.length === 0) missingFields.push('targetExams');

                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                // --- 3. Date Parsing ---
                const dobDate = new Date(dobRaw);
                if (isNaN(dobDate.getTime())) {
                    throw new Error("Invalid Date of Birth format");
                }

                // --- 4. Resolve References (IDs) ---

                // A. Subjects
                let subjectIds: any[] = [];
                try {
                    let subjectInput = s.enrolledSubjects;
                    if (typeof subjectInput === 'string') {
                        // Split by comma or pipe
                        subjectInput = subjectInput.split(/[|,]/).map((sub: string) => sub.trim());
                    }
                    subjectIds = await getSubjectIds(subjectInput || []);
                } catch (err) {
                    console.error(`Subject lookup warning for ${name}:`, err);
                }

                // B. Stream
                let streamId = null;
                if (rawStream) {
                    streamId = await getStreamId(rawStream);
                }

                // C. Target Exams
                const targetExamIds = await getTargetExamIds(rawTargetExams);

                // --- 5. Password Hashing ---
                const passwordToHash = s.password || phoneNumber;
                const hashedPassword = await hashPassword(String(passwordToHash));

                // --- 6. Duplicate Check ---
                const existingStudent = await Student.findOne({
                    name: name,
                    phoneNumber: phoneNumber,
                    currentClass: currentClass,
                    dob: dobDate
                });

                if (existingStudent) {
                    throw new Error("Duplicate: Name, Phone, Class & DOB match an existing student.");
                }

                // --- 7. Database Creation ---
                const newStudent = await Student.create({
                    name,
                    phoneNumber,
                    dob: dobDate,
                    currentClass,
                    academicSession,
                    password: hashedPassword,

                    // Use Resolved IDs
                    targetExams: targetExamIds,
                    enrolledSubjects: subjectIds,
                    stream: streamId,

                    email,
                    parentPhoneNumber,
                    isActive: true,
                    admissionDate: new Date(),
                    enrollmentNumber: await getNextEnrollmentNumber()
                });

                addedStudents.push(newStudent);

            } catch (err: any) {
                let reason = err.message;
                if (err.message && err.message.includes('E11000')) {
                    reason = "Phone number or Email already exists.";
                }
                failedStudents.push({
                    name: s.name || 'Unknown',
                    phoneNumber: s.phoneNumber || 'N/A',
                    reason: reason
                });
            }
        }

        return res.status(200).json({
            message: "Process completed",
            addedCount: addedStudents.length,
            failedCount: failedStudents.length,
            addedStudents,
            failedStudents,
        });

    } catch (error: any) {
        console.error("Error in bulkAddStudents controller:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message || "Unknown error"
        });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID required' });
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) return res.status(404).json({ success: false, message: 'Not found' });
        return res.status(200).json({ success: true, message: 'Student deleted', deletedStudent });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const getAllActiveStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find({ isActive: true })
            .populate({
                path: 'enrolledSubjects',
                model: Subject,
                select: 'name stream'
            })
            .populate('stream', 'name')        // Populate Stream Name
            .populate('targetExams', 'name')   // Populate Exam Names
            .select('-password -createdAt -updatedAt')
            .sort({ admissionDate: -1 });

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: 'Error fetching students' });
    }
}


export const changePassword = async (req: Request, res: Response) => {
    try {
        const { current, new: newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not found." });
        }

        if (!current || !newPassword) {
            return res.status(400).json({ message: "Please provide both current and new passwords." });
        }

        const student = await Student.findById(userId);

        if (!student) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(current, student.password);
        //const isMatch = current == student.password;
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password." });
        }

        const hashedPassword = await hashPassword(newPassword);

        student.password = hashedPassword;
        await student.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating password."
        });
    }
};

export const getStudentCount = async () => {
    try {
        const count = await Student.countDocuments({});
        return count;
    } catch (error) {
        return {
            message: "Error fetching student count",
            error
        };
    }
};
export const getActiveStudentCount = async () => {
    try {
        const count = await Student.countDocuments({ isActive: true });
        return count;
    } catch (error) {
        return {
            message: "Error fetching active student count",
            error
        };
    }
};

export const getAllStudentProfiles = async (req: Request, res: Response) => {
    try {
        const students = await Student.find({ isActive: true })
            .select('enrollmentNumber profilePhoto -_id')
            .lean();
        
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching student profiles:", error);
        res.status(500).json({ success: false, message: 'Error fetching student profiles' });
    }
};