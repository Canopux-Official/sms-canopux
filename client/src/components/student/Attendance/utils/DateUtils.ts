// utils/dateUtils.ts

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Get number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get the starting day of week for a month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month - 1, 1).getDay();
};

/**
 * Format attendance percentage
 */
export const formatPercentage = (percentage: number): string => {
  return percentage.toFixed(1);
};

/**
 * Check if a month is in the future
 */
export const isMonthInFuture = (year: number, month: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  return year > currentYear || (year === currentYear && month > currentMonth);
};

/**
 * Get current month and year
 */
export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};