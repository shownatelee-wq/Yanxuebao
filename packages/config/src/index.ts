export const appModules = [
  'auth',
  'users',
  'organizations',
  'devices',
  'teams-groups',
  'tasks-works',
  'scoring-reports',
  'growth',
  'courses-content',
  'messages',
  'files',
  'ai-gateway',
] as const;

export const requirementStates = ['正式', '演示', '待对接'] as const;

export const appDisplayNames = {
  admin: '运营后台',
  tutor: '导师端',
  parent: '家长端',
  expert: '专家端',
  device: '设备端 H5 外壳',
} as const;

