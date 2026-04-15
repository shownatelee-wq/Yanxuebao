import type { DeviceMode, ReportStatus, ScoringStatus, TaskStatus, TaskType, WorkType } from './domain';
import type { UserRole } from './roles';

export interface AuthSessionDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: UserRole;
}

export interface SessionUserDto {
  id: string;
  account: string;
  displayName: string;
  role: UserRole;
  studentId?: string;
}

export interface PagedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccountPasswordLoginDto {
  account: string;
  password: string;
}

export interface DeviceAuthorizationCodeLoginDto {
  code?: string;
  deviceCode?: string;
  mode?: DeviceMode;
}

export interface StudentProfileDto {
  id: string;
  name: string;
  city?: string;
  school?: string;
  grade?: string;
}

export interface DeviceBindingDto {
  id: string;
  studentId: string;
  deviceCode: string;
  mode: DeviceMode;
  boundAt: string;
}

export interface TeamSummaryDto {
  id: string;
  name: string;
  organizationName: string;
  startDate: string;
  endDate?: string;
}

export interface GroupSummaryDto {
  id: string;
  teamId: string;
  name: string;
  memberCount: number;
}

export interface TaskSummaryDto {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  dueAt?: string;
}

export interface TaskDetailDto extends TaskSummaryDto {
  description: string;
  requirements: string[];
}

export interface WorkSubmissionDto {
  taskId: string;
  type: WorkType;
  content: string;
}

export interface ScoreSummaryDto {
  id: string;
  taskId: string;
  status: ScoringStatus;
  aiScore?: number;
  tutorScore?: number;
}

export interface ReportSummaryDto {
  id: string;
  studentId: string;
  status: ReportStatus;
  title: string;
}
