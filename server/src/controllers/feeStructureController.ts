import { Request, Response } from 'express';
import FeeStructure from '../models/FeeStructure';

// Helper: derive totalAmount from the installment list so it can never drift.
const sumInstallments = (installments: any[]): number =>
  (installments || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);

// --- READ ---
export const getAllFeeStructures = async (req: Request, res: Response) => {
  try {
    const structures = await FeeStructure.find({})
      .populate('stream', 'name')
      .populate('targetExam', 'name')
      .sort({ classType: 1, academicSession: -1 });

    return res.status(200).json({ success: true, data: structures });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    return res.status(500).json({ success: false, message: 'Error fetching fee structures' });
  }
};

export const getActiveFeeStructures = async (req: Request, res: Response) => {
  try {
    const structures = await FeeStructure.find({ isActive: true })
      .populate('stream', 'name')
      .populate('targetExam', 'name')
      .sort({ classType: 1 });

    return res.status(200).json({ success: true, data: structures });
  } catch (error) {
    console.error('Error fetching active fee structures:', error);
    return res.status(500).json({ success: false, message: 'Error fetching active fee structures' });
  }
};

// --- CREATE ---
export const addFeeStructure = async (req: Request, res: Response) => {
  try {
    const { classType, stream, targetExam, academicSession, installments } = req.body;

    const missing: string[] = [];
    if (!classType) missing.push('classType');
    if (!targetExam) missing.push('targetExam');
    if (!academicSession) missing.push('academicSession');
    if (!Array.isArray(installments) || installments.length === 0) missing.push('installments');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Class 9/10 has no stream in this system; enforce the same rule Material/Attendance use.
    const resolvedStream = ['9', '10'].includes(classType) ? null : (stream || null);

    const existing = await FeeStructure.findOne({
      classType,
      stream: resolvedStream,
      targetExam,
      academicSession
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A fee structure already exists for this class, stream, exam and session.'
      });
    }

    const structure = await FeeStructure.create({
      classType,
      stream: resolvedStream,
      targetExam,
      academicSession,
      installments,
      totalAmount: sumInstallments(installments)
    });

    const populated = await FeeStructure.findById(structure._id)
      .populate('stream', 'name')
      .populate('targetExam', 'name');

    return res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: populated
    });
  } catch (error: any) {
    console.error('Error creating fee structure:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating fee structure',
      error: error.message
    });
  }
};

// --- UPDATE ---
export const updateFeeStructure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: any = { ...req.body };

    if (Array.isArray(updates.installments)) {
      updates.totalAmount = sumInstallments(updates.installments);
    }

    if (updates.classType && ['9', '10'].includes(updates.classType)) {
      updates.stream = null;
    }

    const updated = await FeeStructure.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate('stream', 'name')
      .populate('targetExam', 'name');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Fee structure updated successfully',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating fee structure:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating fee structure',
      error: error.message
    });
  }
};

// --- DELETE ---
export const deleteFeeStructure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await FeeStructure.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    return res.status(200).json({ success: true, message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    return res.status(500).json({ success: false, message: 'Error deleting fee structure' });
  }
};

export default {
  getAllFeeStructures,
  getActiveFeeStructures,
  addFeeStructure,
  updateFeeStructure,
  deleteFeeStructure
};