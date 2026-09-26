import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/verifyAuth';
import Test from '../models/Test';
import Result from '../models/Result';
import Student from '../models/Student';

const STREAM_REQUIRED_CLASSES = ['11', '12', 'dropper-1', 'dropper-2'];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(id);

// ---------------------------------------------------------------------
// TEST CRUD (Admin)
// ---------------------------------------------------------------------

// POST /admin/marks/create-test
export const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const { heading, description, totalMarks, testDate, classType, stream, targetExam } = req.body;

    if (!heading || !totalMarks || !testDate || !classType || !targetExam) {
      return res.status(400).json({
        success: false,
        message: 'heading, totalMarks, testDate, classType and targetExam are required'
      });
    }

    if (STREAM_REQUIRED_CLASSES.includes(classType) && !stream) {
      return res.status(400).json({
        success: false,
        message: 'Stream is required for class 11, 12, and droppers'
      });
    }

    const newTest = await Test.create({
      heading: String(heading).trim(),
      description: description ? String(description).trim() : '',
      totalMarks: Number(totalMarks),
      testDate: new Date(testDate),
      classType,
      stream: STREAM_REQUIRED_CLASSES.includes(classType) ? stream : (stream || null),
      targetExam,
      status: 'draft',
      organizationId: req.user?.organizationId
    });

    const populated = await Test.findById(newTest._id)
      .populate('stream', 'name')
      .populate('targetExam', 'name');

    return res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: populated
    });
  } catch (error: any) {
    console.error('Error in createTest:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /admin/marks/all-tests
export const getAllTests = async (req: AuthRequest, res: Response) => {
  try {
    const tests = await Test.find({ organizationId: req.user?.organizationId })
      .populate('stream', 'name')
      .populate('targetExam', 'name')
      .sort({ testDate: -1 });

    const testIds = tests.map((t) => t._id);

    // Progress counts (how many students assigned / how many marks entered) shown in the list
    const counts = await Result.aggregate([
      { $match: { testId: { $in: testIds } } },
      {
        $group: {
          _id: '$testId',
          total: { $sum: 1 },
          entered: {
            $sum: {
              $cond: [
                { $or: [{ $ne: ['$marksObtained', null] }, { $eq: ['$isAbsent', true] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c]));

    const data = tests.map((t) => {
      const c = countMap.get((t._id as mongoose.Types.ObjectId).toString());
      return {
        ...t.toObject(),
        assignedCount: c ? c.total : 0,
        enteredCount: c ? c.entered : 0
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in getAllTests:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /admin/marks/test/:id
export const getTestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId }).populate('stream', 'name').populate('targetExam', 'name');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    return res.status(200).json({ success: true, data: test });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /admin/marks/update-test/:id
// While a test is still in 'draft' every field can be edited. Once students have
// been assigned (scheduled/published) the scope that filtered them — class, stream,
// targetExam, totalMarks — is locked to protect data integrity; heading, description
// and testDate remain editable regardless of status.
export const updateTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const { heading, description, testDate } = req.body;

    if (test.status !== 'draft') {
      if (heading !== undefined) test.heading = String(heading).trim();
      if (description !== undefined) test.description = String(description).trim();
      if (testDate !== undefined) test.testDate = new Date(testDate);
      await test.save();

      const populated = await Test.findById(test._id).populate('stream', 'name').populate('targetExam', 'name');
      return res.status(200).json({
        success: true,
        message: 'Test updated. Class, stream, target exam and total marks are locked because students are already assigned.',
        data: populated
      });
    }

    const { totalMarks, classType, stream, targetExam } = req.body;

    if (heading !== undefined) test.heading = String(heading).trim();
    if (description !== undefined) test.description = String(description).trim();
    if (testDate !== undefined) test.testDate = new Date(testDate);
    if (totalMarks !== undefined) test.totalMarks = Number(totalMarks);
    if (classType !== undefined) test.classType = classType;
    if (targetExam !== undefined) test.targetExam = targetExam;

    const effectiveClassType = classType !== undefined ? classType : test.classType;
    if (STREAM_REQUIRED_CLASSES.includes(effectiveClassType) && !(stream !== undefined ? stream : test.stream)) {
      return res.status(400).json({
        success: false,
        message: 'Stream is required for class 11, 12, and droppers'
      });
    }
    if (stream !== undefined) {
      test.stream = STREAM_REQUIRED_CLASSES.includes(effectiveClassType) ? stream : (stream || null);
    }

    await test.save();

    const populated = await Test.findById(test._id).populate('stream', 'name').populate('targetExam', 'name');
    return res.status(200).json({ success: true, message: 'Test updated successfully', data: populated });
  } catch (error: any) {
    console.error('Error in updateTest:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// DELETE /admin/marks/delete-test/:id
export const deleteTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = await Test.findOneAndDelete({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    await Result.deleteMany({ testId: id });

    return res.status(200).json({ success: true, message: 'Test and its results deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteTest:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ---------------------------------------------------------------------
// ASSIGNMENT (Admin)
// ---------------------------------------------------------------------

// GET /admin/marks/eligible-students/:id
// Filters students the same way Attendance/Material do: exact class match,
// stream required only for 11/12/droppers, and the student must be enrolled
// for the test's target exam.
export const getEligibleStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const studentFilter: any = {
      isActive: true,
      currentClass: test.classType,
      targetExams: test.targetExam,
      organizationId: req.user?.organizationId
    };

    if (STREAM_REQUIRED_CLASSES.includes(test.classType)) {
      if (test.stream) {
        studentFilter.stream = test.stream;
      }
    } else {
      studentFilter.stream = { $in: [null, undefined] };
    }

    const students = await Student.find(studentFilter)
      .select('name enrollmentNumber phoneNumber')
      .sort({ name: 1 })
      .lean();

    const existingResults = await Result.find({ testId: id }).select('studentId').lean();
    const assignedIds = new Set(existingResults.map((r) => r.studentId.toString()));

    const data = students.map((s: any) => ({
      _id: s._id,
      name: s.name,
      enrollmentNumber: s.enrollmentNumber,
      phoneNumber: s.phoneNumber,
      isAssigned: assignedIds.has(s._id.toString())
    }));

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in getEligibleStudents:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /admin/marks/assign/:id
// Body: { studentIds: string[] } — the final desired set of assigned students.
// Diffs against existing Result rows: creates rows for newly-added students,
// deletes rows for deselected students. A test moves from draft -> scheduled
// the first time at least one student is assigned.
export const assignStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (test.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change assigned students on a published test. Unpublish it first.'
      });
    }

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: 'studentIds must be an array' });
    }

    const validStudentIds = studentIds.filter((sid: string) => isValidObjectId(sid));

    const existing = await Result.find({ testId: id }).select('studentId').lean();
    const existingIds = new Set(existing.map((r) => r.studentId.toString()));
    const desiredIds = new Set(validStudentIds.map(String));

    const toAdd = [...desiredIds].filter((sid) => !existingIds.has(sid));
    const toRemove = [...existingIds].filter((sid) => !desiredIds.has(sid));

    if (toAdd.length > 0) {
      await Result.insertMany(
        toAdd.map((sid) => ({
          testId: id,
          studentId: sid,
          marksObtained: null,
          isAbsent: false,
          organizationId: req.user?.organizationId
        })),
        { ordered: false }
      );
    }

    if (toRemove.length > 0) {
      await Result.deleteMany({ testId: id, studentId: { $in: toRemove } });
    }

    if (test.status === 'draft' && desiredIds.size > 0) {
      test.status = 'scheduled';
      await test.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Students assigned successfully',
      added: toAdd.length,
      removed: toRemove.length,
      totalAssigned: desiredIds.size
    });
  } catch (error: any) {
    console.error('Error in assignStudents:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ---------------------------------------------------------------------
// MARKS ENTRY (Admin)
// ---------------------------------------------------------------------

// GET /admin/marks/entry/:id
export const getMarksEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId }).populate('stream', 'name').populate('targetExam', 'name');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const results = await Result.find({ testId: id })
      .populate('studentId', 'name enrollmentNumber phoneNumber')
      .lean();

    const rows = results
      .filter((r: any) => r.studentId) // guard against orphaned rows if a student was deleted
      .map((r: any) => ({
        resultId: r._id,
        studentId: r.studentId._id,
        name: r.studentId.name,
        enrollmentNumber: r.studentId.enrollmentNumber,
        marksObtained: r.marksObtained,
        isAbsent: r.isAbsent,
        percentage: r.percentage,
        rank: r.rank
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ success: true, data: { test, results: rows } });
  } catch (error: any) {
    console.error('Error in getMarksEntry:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PATCH /admin/marks/entry/:id
// Body: { entries: [{ studentId, marksObtained, isAbsent }] } — bulk save, spreadsheet-style.
export const saveMarksEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { entries } = req.body;

    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (test.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Results are published and locked. Unpublish the test to edit marks.'
      });
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'entries array is required' });
    }

    const bulkOps: any[] = [];

    for (const entry of entries) {
      const { studentId, isAbsent } = entry;
      if (!isValidObjectId(studentId)) continue;

      let marks: number | null = null;

      if (!isAbsent) {
        if (entry.marksObtained !== null && entry.marksObtained !== undefined && entry.marksObtained !== '') {
          marks = Number(entry.marksObtained);
          if (isNaN(marks) || marks < 0 || marks > test.totalMarks) {
            return res.status(400).json({
              success: false,
              message: `Invalid marks (${entry.marksObtained}) for a student — must be between 0 and ${test.totalMarks}`
            });
          }
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { testId: id, studentId },
          update: { $set: { marksObtained: marks, isAbsent: !!isAbsent } }
        }
      });
    }

    if (bulkOps.length > 0) {
      await Result.bulkWrite(bulkOps);
    }

    return res.status(200).json({ success: true, message: 'Marks saved successfully', updated: bulkOps.length });
  } catch (error: any) {
    console.error('Error in saveMarksEntry:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ---------------------------------------------------------------------
// PUBLISH / UNPUBLISH (Admin)
// ---------------------------------------------------------------------

// POST /admin/marks/publish/:id
// Computes percentage for every non-absent student and assigns competition
// ranking (1, 2, 2, 4 — ties share a rank, the next rank skips accordingly).
// Absent students get rank = null, percentage = null and are excluded from ranking.
// Results can only be published on or after the test's scheduled date.
export const publishTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (test.status === 'published') {
      return res.status(400).json({ success: false, message: 'Test is already published' });
    }

    // Compare calendar dates only (ignore time-of-day) so a test dated "today" can be
    // published today, but a test dated tomorrow or later cannot be published yet.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(test.testDate);
    scheduledDate.setHours(0, 0, 0, 0);

    if (today < scheduledDate) {
      return res.status(400).json({
        success: false,
        message: `This test is scheduled for ${scheduledDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}. Results can only be published on or after that date.`
      });
    }

    const results = await Result.find({ testId: id });
    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'No students assigned to this test yet' });
    }

    const incomplete = results.filter(
      (r) => !r.isAbsent && (r.marksObtained === null || r.marksObtained === undefined)
    );

    if (incomplete.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Marks are still pending for ${incomplete.length} student(s). Complete entry for everyone before publishing.`,
        pendingCount: incomplete.length
      });
    }

    const scored = results.filter((r) => !r.isAbsent);
    const absentees = results.filter((r) => r.isAbsent);

    scored.forEach((r) => {
      r.percentage = test.totalMarks > 0
        ? Number((((r.marksObtained as number) / test.totalMarks) * 100).toFixed(2))
        : 0;
    });

    // Competition ranking: highest marks = rank 1; ties share a rank; next rank skips.
    scored.sort((a, b) => (b.marksObtained as number) - (a.marksObtained as number));
    scored.forEach((r, index) => {
      if (index > 0 && r.marksObtained === scored[index - 1].marksObtained) {
        r.rank = scored[index - 1].rank;
      } else {
        r.rank = index + 1;
      }
    });

    absentees.forEach((r) => {
      r.rank = null;
      r.percentage = null;
    });

    await Promise.all([...scored, ...absentees].map((r) => r.save()));

    test.status = 'published';
    await test.save();

    return res.status(200).json({
      success: true,
      message: 'Results published successfully',
      totalStudents: results.length,
      scoredCount: scored.length,
      absentCount: absentees.length
    });
  } catch (error: any) {
    console.error('Error in publishTest:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /admin/marks/unpublish/:id
export const unpublishTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = await Test.findOne({ _id: id, organizationId: req.user?.organizationId });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (test.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Test is not published' });
    }

    test.status = 'scheduled';
    await test.save();

    return res.status(200).json({
      success: true,
      message: 'Test unpublished. It is hidden from students again and marks can be edited.'
    });
  } catch (error: any) {
    console.error('Error in unpublishTest:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ---------------------------------------------------------------------
// STUDENT-SIDE VIEW
// ---------------------------------------------------------------------

// GET /student/marks
export const getStudentMarks = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const results = await Result.find({ studentId })
      .populate({
        path: 'testId',
        match: { status: 'published' },
        populate: [
          { path: 'stream', select: 'name' },
          { path: 'targetExam', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    // populate's `match` nulls out testId for tests that aren't published — filter those out.
    const publishedResults = results.filter((r: any) => r.testId);

    const data = await Promise.all(
      publishedResults.map(async (r: any) => {
        const test = r.testId;

        const classResults = await Result.find({ testId: test._id, isAbsent: false })
          .select('marksObtained')
          .lean();

        const absentCount = await Result.countDocuments({ testId: test._id, isAbsent: true });

        const marksArr = classResults
          .map((cr: any) => cr.marksObtained)
          .filter((m: any): m is number => m !== null && m !== undefined);

        const classAverage = marksArr.length
          ? Number((marksArr.reduce((a, b) => a + b, 0) / marksArr.length).toFixed(2))
          : 0;
        const classHighest = marksArr.length ? Math.max(...marksArr) : 0;

        return {
          testId: test._id,
          heading: test.heading,
          description: test.description || '',
          testDate: test.testDate,
          totalMarks: test.totalMarks,
          classType: test.classType,
          stream: test.stream ? test.stream.name : null,
          targetExam: test.targetExam ? test.targetExam.name : null,
          marksObtained: r.marksObtained,
          isAbsent: r.isAbsent,
          percentage: r.percentage,
          rank: r.rank,
          totalStudents: classResults.length + absentCount,
          classAverage,
          classHighest
        };
      })
    );

    data.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in getStudentMarks:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export default {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getEligibleStudents,
  assignStudents,
  getMarksEntry,
  saveMarksEntry,
  publishTest,
  unpublishTest,
  getStudentMarks
};