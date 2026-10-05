export const getCurrentAcademicSession = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0 = Jan, 3 = April)

  // In India, academic sessions typically run from April to March
  if (month < 3) {
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};
