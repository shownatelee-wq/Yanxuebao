export const deviceModes = ['rental', 'sale'] as const;
export type DeviceMode = (typeof deviceModes)[number];

export const taskTypes = [
  'individual',
  'group',
  'check_in',
  'competition',
  'collect',
  'qa',
  'survey',
  'creation',
] as const;
export type TaskType = (typeof taskTypes)[number];

export const taskStatuses = ['draft', 'published', 'in_progress', 'submitted', 'scored'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const workTypes = ['text', 'image', 'audio', 'single_choice', 'multiple_choice', 'boolean'] as const;
export type WorkType = (typeof workTypes)[number];

export const scoringStatuses = ['pending', 'ai_suggested', 'confirmed'] as const;
export type ScoringStatus = (typeof scoringStatuses)[number];

export const reportStatuses = ['draft', 'generated', 'published'] as const;
export type ReportStatus = (typeof reportStatuses)[number];

export const messageTypes = ['system', 'team_broadcast', 'group_broadcast', 'direct'] as const;
export type MessageType = (typeof messageTypes)[number];

export const growthRecordTypes = ['report', 'work', 'ai_record', 'growth_value', 'capability_index'] as const;
export type GrowthRecordType = (typeof growthRecordTypes)[number];

