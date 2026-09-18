export const AVAILABLE_BRANCHES = [
  'CSE',
  'ECE',
  'ME',
  'CE',
  'EE',
  'IT',
  'MCA',
  'MBA',
  'CSE(AI/ML)',
];

export const normalizeBranch = (branch) => {
  return (branch || '').toLowerCase().replace(/[\s\(\)\/_\-]/g, '');
};

export const isBranchEligible = (allowedBranches = [], studentBranch = '') => {
  if (!studentBranch || !allowedBranches || allowedBranches.length === 0) return false;
  if (allowedBranches.includes(studentBranch)) return true;
  const normStudent = normalizeBranch(studentBranch);
  return allowedBranches.some((b) => normalizeBranch(b) === normStudent);
};
