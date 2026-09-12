export interface IInstallmentTemplate {
  label: string;
  dueDate: string; // ISO date string
  amount: number;
}

export interface IFeeStructure {
  _id: string;
  classType: '9' | '10' | '11' | '12' | 'dropper-1' | 'dropper-2';
  stream?: { _id: string; name: string } | null;
  targetExam: { _id: string; name: string };
  academicSession: string;
  totalAmount: number;
  installments: IInstallmentTemplate[];
  isActive: boolean;
}

export interface IInstallment {
  _id: string;
  label: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
}

export interface IStudentFee {
  _id: string;
  studentId: string;
  feeStructureId?: string | null;
  academicSession: string;
  originalAmount: number;
  discountAmount: number;
  discountReason?: string;
  netPayable: number;
  installments: IInstallment[];
  totalPaid: number;
  totalDue: number;
  isFullyPaid: boolean;
  createdAt?: string;
}

export interface IDueRow {
  studentId: string;
  name: string;
  enrollmentNumber: string;
  phoneNumber: string;
  currentClass: string;
  academicSession: string;
  netPayable: number;
  totalPaid: number;
  totalDue: number;
  isFullyPaid: boolean;
  installments: IInstallment[];
}

export interface IFeePayment {
  _id: string;
  studentFeeId: string;
  studentId: string;
  installmentId: string;
  installmentLabel: string;
  amount: number;
  mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  transactionRef?: string;
  receiptNumber: string;
  collectedBy?: { _id: string; name: string } | string;
  remarks?: string;
  status: 'success' | 'refunded';
  paidAt: string;
}

export interface IStudentLite {
  _id: string;
  name: string;
  enrollmentNumber: string;
  phoneNumber: string;
  currentClass: string;
  academicSession: string;
  stream?: { _id: string; name: string } | null;
  targetExams?: { _id: string; name: string }[];
}

export const PAYMENT_MODES: { value: IFeePayment['mode']; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' }
];

export const CLASS_TYPES = ['9', '10', '11', '12', 'dropper-1', 'dropper-2'] as const;