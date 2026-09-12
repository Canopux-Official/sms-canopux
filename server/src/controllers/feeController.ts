import { Response } from 'express';
import mongoose from 'mongoose';
import StudentFee, { IStudentFee, IInstallment } from '../models/StudentFee';
import FeePayment from '../models/FeePayment';
import FeeStructure from '../models/FeeStructure';
import Counter from '../models/Counter';
import { AuthRequest } from '../middlewares/verifyAuth';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

// Recompute installment statuses + running totals on a StudentFee doc.
// Called any time an installment's paidAmount changes.
const recomputeStudentFee = (fee: IStudentFee) => {
  let totalPaid = 0;

  fee.installments.forEach((inst: IInstallment) => {
    if (inst.paidAmount <= 0) inst.status = 'pending';
    else if (inst.paidAmount < inst.amount) inst.status = 'partial';
    else inst.status = 'paid';
    totalPaid += inst.paidAmount;
  });

  fee.totalPaid = totalPaid;
  fee.totalDue = Math.max(fee.netPayable - totalPaid, 0);
  fee.isFullyPaid = fee.totalDue <= 0;
};

// Reuses the same Counter collection the enrollment-number generator uses,
// just with its own counter id, so receipt numbers survive server restarts
// and are safe under concurrent requests.
const getNextReceiptNumber = async (): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    'receiptNumber',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return `RCPT${String(counter.sequence_value).padStart(7, '0')}`;
};

// ------------------------------------------------------------------
// ASSIGN FEE (single student or bulk — mirrors bulkAddStudents pattern)
// ------------------------------------------------------------------
export const assignFee = async (req: AuthRequest, res: Response) => {
  try {
    const {
      studentIds,
      feeStructureId,
      academicSession,
      discountAmount,
      discountReason,
      customInstallments
    } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'studentIds array is required' });
    }
    if (!academicSession) {
      return res.status(400).json({ success: false, message: 'academicSession is required' });
    }

    // Resolve the installment schedule: either from a template, or fully custom.
    let baseInstallments: { label: string; dueDate: Date; amount: number }[] = [];
    let originalAmount = 0;

    if (Array.isArray(customInstallments) && customInstallments.length > 0) {
      baseInstallments = customInstallments.map((i: any) => ({
        label: i.label,
        dueDate: new Date(i.dueDate),
        amount: Number(i.amount)
      }));
      originalAmount = baseInstallments.reduce((s, i) => s + i.amount, 0);
    } else if (feeStructureId) {
      const structure = await FeeStructure.findById(feeStructureId);
      if (!structure) {
        return res.status(404).json({ success: false, message: 'Fee structure not found' });
      }
      baseInstallments = structure.installments.map((i: any) => ({
        label: i.label,
        dueDate: i.dueDate,
        amount: i.amount
      }));
      originalAmount = structure.totalAmount;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either feeStructureId or customInstallments is required'
      });
    }

    const discount = Number(discountAmount) || 0;
    const netPayable = Math.max(originalAmount - discount, 0);

    const created: any[] = [];
    const failed: { studentId: string; reason: string }[] = [];

    for (const studentId of studentIds) {
      try {
        const existing = await StudentFee.findOne({ studentId, academicSession });
        if (existing) {
          failed.push({ studentId, reason: 'Fee already assigned for this academic session' });
          continue;
        }

        const installments = baseInstallments.map((i) => ({
          label: i.label,
          dueDate: i.dueDate,
          amount: i.amount,
          paidAmount: 0,
          status: 'pending' as const
        }));

        const doc = await StudentFee.create({
          studentId,
          feeStructureId: feeStructureId || null,
          academicSession,
          originalAmount,
          discountAmount: discount,
          discountReason: discountReason || '',
          netPayable,
          installments,
          totalPaid: 0,
          totalDue: netPayable,
          isFullyPaid: netPayable === 0
        });

        created.push(doc);
      } catch (err: any) {
        failed.push({
          studentId,
          reason: err.code === 11000 ? 'Fee already assigned for this session' : err.message
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Fee assignment processed',
      assignedCount: created.length,
      failedCount: failed.length,
      created,
      failed
    });
  } catch (error: any) {
    console.error('Error assigning fee:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ------------------------------------------------------------------
// ADMIN: view a single student's fee ledger(s) + payment history
// ------------------------------------------------------------------
export const getStudentFeeByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const fees = await StudentFee.find({ studentId })
      .populate('feeStructureId', 'classType academicSession')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: fees });
  } catch (error) {
    console.error('Error fetching student fee:', error);
    return res.status(500).json({ success: false, message: 'Error fetching student fee' });
  }
};

export const getPaymentsByStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const payments = await FeePayment.find({ studentId })
      .populate('collectedBy', 'name')
      .sort({ paidAt: -1 });

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
};

// ------------------------------------------------------------------
// RECORD PAYMENT — the core money-moving endpoint
// ------------------------------------------------------------------
export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { studentFeeId, installmentId, amount, mode, transactionRef, remarks } = req.body;

    if (!studentFeeId || !installmentId || !amount || !mode) {
      return res.status(400).json({
        success: false,
        message: 'studentFeeId, installmentId, amount and mode are required'
      });
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    const validModes = ['cash', 'upi', 'card', 'bank_transfer', 'cheque'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ success: false, message: 'Invalid payment mode' });
    }

    const fee = await StudentFee.findById(studentFeeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const installment = (fee.installments as any).id(installmentId) as IInstallment | null;
    if (!installment) {
      return res.status(404).json({ success: false, message: 'Installment not found' });
    }

    const remainingOnInstallment = installment.amount - installment.paidAmount;
    if (numericAmount > remainingOnInstallment) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds the remaining due on this installment (₹${remainingOnInstallment})`
      });
    }

    installment.paidAmount += numericAmount;
    recomputeStudentFee(fee);
    await fee.save();

    const receiptNumber = await getNextReceiptNumber();

    const payment = await FeePayment.create({
      studentFeeId: fee._id,
      studentId: fee.studentId,
      installmentId: installment._id,
      installmentLabel: installment.label,
      amount: numericAmount,
      mode,
      transactionRef: transactionRef || '',
      receiptNumber,
      collectedBy: req.user?.id,
      remarks: remarks || '',
      status: 'success',
      paidAt: new Date()
    });

    const populatedPayment = await FeePayment.findById(payment._id).populate('collectedBy', 'name');

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment: populatedPayment, fee }
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ------------------------------------------------------------------
// DUES / DEFAULTERS VIEW (aggregation, same style as attendance view)
// ------------------------------------------------------------------
export const getDues = async (req: AuthRequest, res: Response) => {
  try {
    const { currentClass, streamId, academicSession, status } = req.query;

    const feeMatch: any = {};
    if (academicSession) feeMatch.academicSession = academicSession;
    if (status === 'due') feeMatch.totalDue = { $gt: 0 };
    if (status === 'paid') feeMatch.isFullyPaid = true;

    const studentMatch: any = { 'student.isActive': true };
    if (currentClass) studentMatch['student.currentClass'] = currentClass;
    if (streamId) studentMatch['student.stream'] = new mongoose.Types.ObjectId(streamId as string);

    const result = await StudentFee.aggregate([
      { $match: feeMatch },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $match: studentMatch },
      {
        $project: {
          studentId: '$student._id',
          name: '$student.name',
          enrollmentNumber: '$student.enrollmentNumber',
          phoneNumber: '$student.phoneNumber',
          currentClass: '$student.currentClass',
          academicSession: 1,
          netPayable: 1,
          totalPaid: 1,
          totalDue: 1,
          isFullyPaid: 1,
          installments: 1
        }
      },
      { $sort: { totalDue: -1 } }
    ]);

    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    console.error('Error fetching dues:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ------------------------------------------------------------------
// REPORTS — collection totals, by mode, overall pending
// ------------------------------------------------------------------
export const getFeeReports = async (req: AuthRequest, res: Response) => {
  try {
    const { academicSession, from, to } = req.query;

    const paymentMatch: any = { status: 'success' };
    if (from || to) {
      paymentMatch.paidAt = {};
      if (from) paymentMatch.paidAt.$gte = new Date(from as string);
      if (to) paymentMatch.paidAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    const feeMatch: any = {};
    if (academicSession) feeMatch.academicSession = academicSession;

    const [collectionByMode, feeSummary] = await Promise.all([
      FeePayment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: '$mode', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      StudentFee.aggregate([
        { $match: feeMatch },
        {
          $group: {
            _id: null,
            totalNetPayable: { $sum: '$netPayable' },
            totalCollected: { $sum: '$totalPaid' },
            totalOutstanding: { $sum: '$totalDue' },
            studentCount: { $sum: 1 },
            fullyPaidCount: { $sum: { $cond: ['$isFullyPaid', 1, 0] } }
          }
        }
      ])
    ]);

    const totalCollectedInRange = collectionByMode.reduce((sum, m) => sum + m.total, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalCollectedInRange,
        collectionByMode,
        summary: feeSummary[0] || {
          totalNetPayable: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          studentCount: 0,
          fullyPaidCount: 0
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating fee reports:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ------------------------------------------------------------------
// STUDENT SELF-SERVICE
// ------------------------------------------------------------------
export const getMyFee = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const fees = await StudentFee.find({ studentId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: fees });
  } catch (error) {
    console.error('Error fetching own fee:', error);
    return res.status(500).json({ success: false, message: 'Error fetching your fee details' });
  }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const payments = await FeePayment.find({ studentId }).sort({ paidAt: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching own payments:', error);
    return res.status(500).json({ success: false, message: 'Error fetching your payment history' });
  }
};

export default {
  assignFee,
  getStudentFeeByAdmin,
  getPaymentsByStudent,
  recordPayment,
  getDues,
  getFeeReports,
  getMyFee,
  getMyPayments
};