// dateUtils.ts

export const getMonthName = (month: number): string => {
  const date = new Date(2000, month - 1);
  return date.toLocaleString('default', { month: 'long' });
};

export const getMonthOptions = (): Array<{ value: number; label: string }> => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));
};

export const getYearOptions = (yearsBack: number = 5): Array<{ value: number; label: string }> => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsBack + 1 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString(),
  }));
};

export const getClassOptions = (): Array<{ value: string; label: string }> => {
  return [
    { value: '9', label: 'Class 9' },
    { value: '10', label: 'Class 10' },
    { value: '11', label: 'Class 11' },
    { value: '12', label: 'Class 12' },
    { value: 'dropper-1', label: 'Dropper 1' },
    { value: 'dropper-2', label: 'Dropper 2' },
  ];
};

export const needsStream = (currentClass: string): boolean => {
  return ['11', '12', 'dropper-1', 'dropper-2'].includes(currentClass);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const isToday = (day: number, month: number, year: number): boolean => {
  const today = new Date();
  return (
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear()
  );
};

export const getWeekday = (day: number, month: number, year: number): string => {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
};