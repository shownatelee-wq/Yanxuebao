import type { UserRole } from '@yanxuebao/types';

export interface AuthenticatedUser {
  sub: string;
  account: string;
  role: UserRole;
  displayName: string;
  studentId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

