import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type {
  AccountPasswordLoginDto,
  DeviceAuthorizationCodeLoginDto,
  DeviceMode,
  GrowthRecordType,
  MessageType,
  ReportStatus,
  ScoringStatus,
  TaskStatus,
  TaskType,
  UserRole,
  WorkType,
} from '@yanxuebao/types';
import { randomUUID } from 'node:crypto';

type DemoUser = {
  id: string;
  account: string;
  passwordHash: string;
  role: UserRole;
  displayName: string;
  phone?: string;
  studentId?: string;
};

type DemoStudent = {
  id: string;
  userId: string;
  primaryParentUserId?: string;
  name: string;
  city?: string;
  school?: string;
  grade?: string;
};

type DemoOrganization = {
  id: string;
  name: string;
  type: string;
  city?: string;
  contactName?: string;
  contactPhone?: string;
};

type DemoDevice = {
  id: string;
  deviceCode: string;
  serialNumber?: string;
  mode: DeviceMode;
  platform: string;
  isActive: boolean;
};

type DemoDeviceBinding = {
  id: string;
  deviceId: string;
  studentId: string;
  boundAt: string;
  unboundAt?: string;
};

type DemoTeam = {
  id: string;
  organizationId?: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: string;
};

type DemoGroup = {
  id: string;
  teamId: string;
  name: string;
  badgeUrl?: string;
};

type DemoTeamMember = {
  id: string;
  teamId: string;
  studentId: string;
  groupId?: string;
  roleName?: string;
};

type DemoTaskTemplate = {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  abilityTags: string[];
};

type DemoTask = {
  id: string;
  teamId?: string;
  groupId?: string;
  studentId?: string;
  templateId?: string;
  title: string;
  description: string;
  taskType: TaskType;
  status: TaskStatus;
  dueAt?: string;
};

type DemoWork = {
  id: string;
  taskId: string;
  studentId?: string;
  groupId?: string;
  type: WorkType;
  content: string;
  attachments?: unknown;
  submittedAt: string;
};

type DemoScore = {
  id: string;
  taskId: string;
  workId?: string;
  studentId?: string;
  groupId?: string;
  status: ScoringStatus;
  aiScore?: number;
  tutorScore?: number;
  comment?: string;
};

type DemoReport = {
  id: string;
  studentId: string;
  teamId?: string;
  title: string;
  status: ReportStatus;
  summary: Record<string, unknown>;
  publishedAt?: string;
};

type DemoGrowthValueRecord = {
  id: string;
  studentId: string;
  sourceType: string;
  delta: number;
  description: string;
  occurredAt: string;
};

type DemoCapabilityIndexRecord = {
  id: string;
  studentId: string;
  elementKey: string;
  source: string;
  score: number;
  recordedAt: string;
};

type DemoQuestionBankItem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: 'active' | 'draft';
};

type DemoInventoryItem = {
  id: string;
  label: string;
  category: string;
  quantity: number;
  status: string;
};

type DemoCourse = {
  id: string;
  title: string;
  summary: string;
  format: string;
  status: string;
};

type DemoKnowledgeItem = {
  id: string;
  title: string;
  category: string;
  content: string;
};

type DemoChallenge = {
  id: string;
  title: string;
  summary: string;
  difficulty: string;
  status: string;
};

type DemoNews = {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt?: string;
};

type DemoMessage = {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  createdAt: string;
};

type DemoAiRecord = {
  id: string;
  studentId: string;
  scene: 'ask' | 'observe' | 'flash_note' | 'identify';
  title: string;
  summary: string;
  createdAt: string;
};

@Injectable()
export class DemoDataService {
  private readonly users: DemoUser[] = [
    {
      id: 'user_operator_demo',
      account: 'operator_demo',
      passwordHash: 'Yanxuebao@2026',
      role: 'operator',
      displayName: '运营演示账号',
      phone: '13800000001',
    },
    {
      id: 'user_tutor_demo',
      account: 'tutor_demo',
      passwordHash: 'Yanxuebao@2026',
      role: 'tutor',
      displayName: '导师演示账号',
      phone: '13800000002',
    },
    {
      id: 'user_parent_demo',
      account: 'parent_demo',
      passwordHash: 'Yanxuebao@2026',
      role: 'parent',
      displayName: '家长演示账号',
      phone: '13800000003',
    },
    {
      id: 'user_expert_demo',
      account: 'expert_demo',
      passwordHash: 'Yanxuebao@2026',
      role: 'expert',
      displayName: '专家演示账号',
      phone: '13800000004',
    },
    {
      id: 'user_student_demo',
      account: 'student_demo',
      passwordHash: 'Yanxuebao@2026',
      role: 'student',
      displayName: '学员演示账号',
      phone: '13800000005',
      studentId: 'student_demo_01',
    },
  ];

  private readonly students: DemoStudent[] = [
    {
      id: 'student_demo_01',
      userId: 'user_student_demo',
      primaryParentUserId: 'user_parent_demo',
      name: '李同学',
      city: '深圳',
      school: '南山实验学校',
      grade: '五年级',
    },
  ];

  private readonly organizations: DemoOrganization[] = [
    {
      id: 'org_demo_school_01',
      name: '南山实验学校',
      type: 'school',
      city: '深圳',
      contactName: '王老师',
      contactPhone: '13811110001',
    },
    {
      id: 'org_demo_base_01',
      name: '深圳海洋研学基地',
      type: 'base',
      city: '深圳',
      contactName: '陈老师',
      contactPhone: '13811110002',
    },
  ];

  private readonly devices: DemoDevice[] = [
    {
      id: 'device_demo_01',
      deviceCode: 'YXB-DEV-0001',
      serialNumber: 'SN-0001',
      mode: 'sale',
      platform: 'android',
      isActive: true,
    },
  ];

  private readonly deviceBindings: DemoDeviceBinding[] = [
    {
      id: 'binding_demo_01',
      deviceId: 'device_demo_01',
      studentId: 'student_demo_01',
      boundAt: new Date().toISOString(),
    },
  ];

  private readonly teams: DemoTeam[] = [
    {
      id: 'team_demo_01',
      organizationId: 'org_demo_school_01',
      name: '南山实验学校海洋馆研学 5 班',
      startDate: new Date().toISOString(),
      status: 'published',
    },
  ];

  private readonly groups: DemoGroup[] = [
    {
      id: 'group_demo_01',
      teamId: 'team_demo_01',
      name: '海豚探索队',
    },
  ];

  private readonly teamMembers: DemoTeamMember[] = [
    {
      id: 'member_demo_01',
      teamId: 'team_demo_01',
      studentId: 'student_demo_01',
      groupId: 'group_demo_01',
      roleName: '组长',
    },
  ];

  private readonly taskTemplates: DemoTaskTemplate[] = [
    {
      id: 'template_demo_01',
      title: '海洋生物观察记录',
      description: '观察海洋馆中的指定生物并完成图文记录。',
      taskType: 'individual',
      abilityTags: ['观察力', '表达力'],
    },
    {
      id: 'template_demo_02',
      title: '小组海洋保护倡议',
      description: '小组共创一份海洋保护倡议书。',
      taskType: 'group',
      abilityTags: ['协作力', '领导力'],
    },
  ];

  private readonly tasks: DemoTask[] = [
    {
      id: 'task_demo_01',
      teamId: 'team_demo_01',
      templateId: 'template_demo_01',
      title: '观察海洋生物',
      description: '完成 1 份图片 + 文字观察记录。',
      taskType: 'individual',
      status: 'submitted',
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_demo_02',
      teamId: 'team_demo_01',
      groupId: 'group_demo_01',
      templateId: 'template_demo_02',
      title: '完成海洋保护倡议',
      description: '以小组名义提交倡议书内容。',
      taskType: 'group',
      status: 'in_progress',
      dueAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_demo_03',
      studentId: 'student_demo_01',
      title: '家庭研学：记录 3 个家庭节水行动',
      description: '结合家庭生活场景，提交文字或图片记录并完成家长复盘。',
      taskType: 'check_in',
      status: 'published',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  private readonly works: DemoWork[] = [
    {
      id: 'work_demo_01',
      taskId: 'task_demo_01',
      studentId: 'student_demo_01',
      type: 'text',
      content: '我观察到了海豚在团队协作中的高效配合。',
      submittedAt: new Date().toISOString(),
    },
  ];

  private readonly scores: DemoScore[] = [
    {
      id: 'score_demo_01',
      taskId: 'task_demo_01',
      workId: 'work_demo_01',
      studentId: 'student_demo_01',
      status: 'ai_suggested',
      aiScore: 8.5,
    },
  ];

  private readonly reports: DemoReport[] = [
    {
      id: 'report_demo_01',
      studentId: 'student_demo_01',
      teamId: 'team_demo_01',
      title: '海洋馆研学报告',
      status: 'generated',
      summary: {
        strengths: ['观察力', '表达力'],
        suggestions: ['提升团队表达的结构性'],
      },
      publishedAt: new Date().toISOString(),
    },
  ];

  private readonly growthValueRecords: DemoGrowthValueRecord[] = [
    {
      id: 'growth_value_demo_01',
      studentId: 'student_demo_01',
      sourceType: 'team_task',
      delta: 100,
      description: '完成团体研学任务奖励',
      occurredAt: new Date().toISOString(),
    },
  ];

  private readonly capabilityIndexRecords: DemoCapabilityIndexRecord[] = [
    {
      id: 'capability_demo_01',
      studentId: 'student_demo_01',
      elementKey: 'observation',
      source: 'team_task',
      score: 8.6,
      recordedAt: new Date().toISOString(),
    },
    {
      id: 'capability_demo_02',
      studentId: 'student_demo_01',
      elementKey: 'cooperation',
      source: 'team_task',
      score: 8.2,
      recordedAt: new Date().toISOString(),
    },
  ];

  private readonly questionBank: DemoQuestionBankItem[] = [
    {
      id: 'question_demo_01',
      title: '当团队任务出现分歧时，你会如何推进讨论？',
      category: '领导执行',
      difficulty: '基础',
      status: 'active',
    },
    {
      id: 'question_demo_02',
      title: '请判断以下关于观察记录的描述是否准确。',
      category: '学习思辨',
      difficulty: '中等',
      status: 'active',
    },
  ];

  private readonly inventory: DemoInventoryItem[] = [
    {
      id: 'inventory_demo_01',
      label: '研学宝设备库存',
      category: 'device',
      quantity: 120,
      status: 'available',
    },
    {
      id: 'inventory_demo_02',
      label: '租赁待回收设备',
      category: 'device',
      quantity: 18,
      status: 'renting',
    },
  ];

  private readonly courses: DemoCourse[] = [
    {
      id: 'course_demo_01',
      title: '海洋生态保护入门',
      summary: '围绕海洋生态与研学任务展开的专家课程。',
      format: 'video',
      status: 'published',
    },
  ];

  private readonly knowledgeItems: DemoKnowledgeItem[] = [
    {
      id: 'knowledge_demo_01',
      title: '海豚协作行为知识卡',
      category: '海洋生态',
      content: '海豚通过声波和队形协作进行捕食与保护幼崽。',
    },
  ];

  private readonly challenges: DemoChallenge[] = [
    {
      id: 'challenge_demo_01',
      title: '设计一份海洋垃圾减量倡议方案',
      summary: '围绕真实生活场景给出可执行减量方案。',
      difficulty: '中级',
      status: 'published',
    },
  ];

  private readonly news: DemoNews[] = [
    {
      id: 'news_demo_01',
      title: '深圳海洋馆推出新研学路线',
      summary: '围绕海洋生态保护主题设计沉浸式研学路线。',
      category: '研学资讯',
      publishedAt: new Date().toISOString(),
    },
  ];

  private readonly messages: DemoMessage[] = [
    {
      id: 'message_demo_01',
      type: 'team_broadcast',
      title: '集合提醒',
      content: '请全体同学 15 分钟后在海洋馆一层大厅集合。',
      createdAt: new Date().toISOString(),
    },
  ];

  private readonly aiRecords: DemoAiRecord[] = [
    {
      id: 'ai_record_demo_01',
      studentId: 'student_demo_01',
      scene: 'ask',
      title: '问问：海豚为什么会结队行动？',
      summary: 'AI 从协作捕食、保护幼崽和声波交流三个角度给出了儿童版解释。',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ai_record_demo_02',
      studentId: 'student_demo_01',
      scene: 'flash_note',
      title: '闪记：海洋馆任务观察摘要',
      summary: '已自动整理为 3 条观察结论和 1 条延伸思考问题。',
      createdAt: new Date().toISOString(),
    },
  ];

  validateWebLogin(payload: AccountPasswordLoginDto) {
    const user = this.users.find((item) => item.account === payload.account);
    if (!user || user.passwordHash !== payload.password) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return user;
  }

  validateDeviceLogin(payload: DeviceAuthorizationCodeLoginDto) {
    const mode = payload.mode ?? 'rental';
    if (mode === 'rental' && payload.code !== '123456') {
      throw new UnauthorizedException('授权码无效');
    }
    return this.users.find((item) => item.role === 'student')!;
  }

  findUserById(userId: string) {
    return this.users.find((item) => item.id === userId);
  }

  listOrganizations() {
    return this.organizations;
  }

  createOrganization(input: Omit<DemoOrganization, 'id'>) {
    const organization = {
      id: randomUUID(),
      ...input,
    };
    this.organizations.unshift(organization);
    return organization;
  }

  listTaskTemplates() {
    return this.taskTemplates;
  }

  createTaskTemplate(input: Omit<DemoTaskTemplate, 'id'>) {
    const template = {
      id: randomUUID(),
      ...input,
    };
    this.taskTemplates.unshift(template);
    return template;
  }

  listQuestionBank() {
    return this.questionBank;
  }

  listInventory() {
    return this.inventory;
  }

  listStudents() {
    return this.students.map((student) => ({
      ...student,
      primaryParent: this.users.find((user) => user.id === student.primaryParentUserId)?.displayName,
    }));
  }

  createStudent(input: {
    name: string;
    city?: string;
    school?: string;
    grade?: string;
    parentUserId?: string;
  }) {
    const studentId = randomUUID();
    const studentUserId = randomUUID();
    const account = `student_${this.students.length + 1}`;

    this.users.push({
      id: studentUserId,
      account,
      passwordHash: 'Yanxuebao@2026',
      role: 'student',
      displayName: input.name,
      phone: undefined,
      studentId,
    });

    const student: DemoStudent = {
      id: studentId,
      userId: studentUserId,
      primaryParentUserId: input.parentUserId,
      name: input.name,
      city: input.city,
      school: input.school,
      grade: input.grade,
    };

    this.students.unshift(student);
    return {
      ...student,
      primaryParent: this.users.find((user) => user.id === student.primaryParentUserId)?.displayName,
      loginAccount: account,
      initialPassword: 'Yanxuebao@2026',
    };
  }

  getStudent(studentId: string) {
    const student = this.students.find((item) => item.id === studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  getStudentOverview(studentId: string) {
    const student = this.getStudent(studentId);
    return {
      ...student,
      reportsCount: this.reports.filter((item) => item.studentId === studentId).length,
      growthValue: this.growthValueRecords
        .filter((item) => item.studentId === studentId)
        .reduce((sum, item) => sum + item.delta, 0),
      deviceBindings: this.deviceBindings.filter((item) => item.studentId === studentId),
    };
  }

  bindDevice(input: { studentId: string; deviceCode: string; mode?: DeviceMode }) {
    this.getStudent(input.studentId);
    let device = this.devices.find((item) => item.deviceCode === input.deviceCode);

    if (!device) {
      device = {
        id: randomUUID(),
        deviceCode: input.deviceCode,
        serialNumber: undefined,
        mode: input.mode ?? 'sale',
        platform: 'android',
        isActive: true,
      };
      this.devices.push(device);
    }

    const binding: DemoDeviceBinding = {
      id: randomUUID(),
      deviceId: device.id,
      studentId: input.studentId,
      boundAt: new Date().toISOString(),
    };

    this.deviceBindings.unshift(binding);
    return {
      ...binding,
      device,
    };
  }

  getDeviceByCode(deviceCode: string) {
    return this.devices.find((item) => item.deviceCode === deviceCode) ?? null;
  }

  listTeams() {
    return this.teams.map((team) => ({
      ...team,
      organizationName: this.organizations.find((org) => org.id === team.organizationId)?.name ?? '未分配机构',
      studentCount: this.teamMembers.filter((member) => member.teamId === team.id).length,
      groupCount: this.groups.filter((group) => group.teamId === team.id).length,
    }));
  }

  getTeam(teamId: string) {
    const team = this.teams.find((item) => item.id === teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return {
      ...team,
      groups: this.groups.filter((item) => item.teamId === teamId),
      members: this.teamMembers
        .filter((item) => item.teamId === teamId)
        .map((item) => ({
          ...item,
          student: this.students.find((student) => student.id === item.studentId),
        })),
    };
  }

  createTeam(input: { name: string; organizationId?: string; startDate?: string }) {
    const team: DemoTeam = {
      id: randomUUID(),
      name: input.name,
      organizationId: input.organizationId,
      startDate: input.startDate ?? new Date().toISOString(),
      status: 'draft',
    };
    this.teams.unshift(team);
    return team;
  }

  listGroups(teamId?: string) {
    return this.groups.filter((item) => (teamId ? item.teamId === teamId : true));
  }

  createGroup(input: { teamId: string; name: string }) {
    this.getTeam(input.teamId);
    const group: DemoGroup = {
      id: randomUUID(),
      teamId: input.teamId,
      name: input.name,
    };
    this.groups.unshift(group);
    return group;
  }

  listTasks(filters?: { teamId?: string; studentId?: string }) {
    return this.tasks
      .filter((item) => (filters?.teamId ? item.teamId === filters.teamId : true))
      .filter((item) => (filters?.studentId ? item.studentId === filters.studentId : true))
      .map((task) => ({
        ...task,
        teamName: task.teamId ? this.teams.find((team) => team.id === task.teamId)?.name : undefined,
        groupName: task.groupId ? this.groups.find((group) => group.id === task.groupId)?.name : undefined,
        studentName: task.studentId ? this.students.find((student) => student.id === task.studentId)?.name : undefined,
      }));
  }

  getTask(taskId: string) {
    const task = this.tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return {
      ...task,
      works: this.works.filter((work) => work.taskId === taskId),
      scores: this.scores.filter((score) => score.taskId === taskId),
    };
  }

  createTask(input: {
    teamId?: string;
    groupId?: string;
    studentId?: string;
    templateId?: string;
    title: string;
    description: string;
    taskType: TaskType;
    dueAt?: string;
  }) {
    const task: DemoTask = {
      id: randomUUID(),
      teamId: input.teamId,
      groupId: input.groupId,
      studentId: input.studentId,
      templateId: input.templateId,
      title: input.title,
      description: input.description,
      taskType: input.taskType,
      status: 'published',
      dueAt: input.dueAt,
    };
    this.tasks.unshift(task);
    return task;
  }

  submitWork(input: {
    taskId: string;
    studentId?: string;
    groupId?: string;
    type: WorkType;
    content: string;
  }) {
    this.getTask(input.taskId);
    const work: DemoWork = {
      id: randomUUID(),
      taskId: input.taskId,
      studentId: input.studentId,
      groupId: input.groupId,
      type: input.type,
      content: input.content,
      submittedAt: new Date().toISOString(),
    };
    this.works.unshift(work);

    const score: DemoScore = {
      id: randomUUID(),
      taskId: input.taskId,
      workId: work.id,
      studentId: input.studentId,
      groupId: input.groupId,
      status: 'ai_suggested',
      aiScore: 8.0,
    };
    this.scores.unshift(score);
    return { work, score };
  }

  updateWork(workId: string, input: { content: string }) {
    const work = this.works.find((item) => item.id === workId);
    if (!work) {
      throw new NotFoundException('Work not found');
    }
    work.content = input.content;
    work.submittedAt = new Date().toISOString();
    return work;
  }

  listScores(filters?: { teamId?: string; studentId?: string }) {
    const teamTaskIds = filters?.teamId
      ? this.tasks.filter((task) => task.teamId === filters.teamId).map((task) => task.id)
      : null;

    return this.scores
      .filter((item) => (teamTaskIds ? teamTaskIds.includes(item.taskId) : true))
      .filter((item) => (filters?.studentId ? item.studentId === filters.studentId : true))
      .map((score) => ({
        ...score,
        taskTitle: this.tasks.find((task) => task.id === score.taskId)?.title,
        studentName: score.studentId
          ? this.students.find((student) => student.id === score.studentId)?.name
          : undefined,
      }));
  }

  confirmScore(scoreId: string, tutorScore: number, comment?: string) {
    const score = this.scores.find((item) => item.id === scoreId);
    if (!score) {
      throw new NotFoundException('Score not found');
    }
    score.tutorScore = tutorScore;
    score.comment = comment;
    score.status = 'confirmed';
    return score;
  }

  listReports(studentId?: string) {
    return this.reports.filter((item) => (studentId ? item.studentId === studentId : true));
  }

  generateReport(input: { studentId: string; teamId?: string; title?: string }) {
    this.getStudent(input.studentId);
    const report: DemoReport = {
      id: randomUUID(),
      studentId: input.studentId,
      teamId: input.teamId,
      title: input.title ?? '新生成的研学报告',
      status: 'generated',
      summary: {
        strengths: ['观察力', '协作力'],
        nextActions: ['加强任务表达结构', '在小组汇报中承担更多输出角色'],
      },
      publishedAt: new Date().toISOString(),
    };
    this.reports.unshift(report);
    return report;
  }

  getGrowth(studentId: string) {
    this.getStudent(studentId);
    return {
      student: this.getStudent(studentId),
      records: [
        ...this.growthValueRecords
          .filter((item) => item.studentId === studentId)
          .map((item) => ({
            id: item.id,
            type: 'growth_value' as GrowthRecordType,
            title: item.description,
            value: item.delta,
            occurredAt: item.occurredAt,
          })),
        ...this.capabilityIndexRecords
          .filter((item) => item.studentId === studentId)
          .map((item) => ({
            id: item.id,
            type: 'capability_index' as GrowthRecordType,
            title: item.elementKey,
            value: item.score,
            occurredAt: item.recordedAt,
          })),
      ],
      growthValueRecords: this.growthValueRecords.filter((item) => item.studentId === studentId),
      capabilityIndexRecords: this.capabilityIndexRecords.filter((item) => item.studentId === studentId),
      reports: this.reports.filter((item) => item.studentId === studentId),
    };
  }

  listCourses() {
    return this.courses;
  }

  createCourse(input: Omit<DemoCourse, 'id'>) {
    const course = {
      id: randomUUID(),
      ...input,
    };
    this.courses.unshift(course);
    return course;
  }

  listKnowledgeItems() {
    return this.knowledgeItems;
  }

  createKnowledgeItem(input: Omit<DemoKnowledgeItem, 'id'>) {
    const knowledgeItem = {
      id: randomUUID(),
      ...input,
    };
    this.knowledgeItems.unshift(knowledgeItem);
    return knowledgeItem;
  }

  listChallenges() {
    return this.challenges;
  }

  createChallenge(input: Omit<DemoChallenge, 'id'>) {
    const challenge = {
      id: randomUUID(),
      ...input,
    };
    this.challenges.unshift(challenge);
    return challenge;
  }

  listNews() {
    return this.news;
  }

  createNews(input: Omit<DemoNews, 'id'>) {
    const news = {
      id: randomUUID(),
      ...input,
    };
    this.news.unshift(news);
    return news;
  }

  listMessages() {
    return this.messages;
  }

  listAiRecords(studentId?: string) {
    return this.aiRecords.filter((item) => (studentId ? item.studentId === studentId : true));
  }
}
