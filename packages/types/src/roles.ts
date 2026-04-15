export const userRoles = [
  'parent',
  'student',
  'tutor',
  'expert',
  'operator',
  'part_timer',
] as const;

export type UserRole = (typeof userRoles)[number];

