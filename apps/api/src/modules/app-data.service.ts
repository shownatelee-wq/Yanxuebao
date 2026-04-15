import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { DeviceMode, GrowthRecordType, MessageType, TaskType, WorkType } from '@yanxuebao/types';
import { PrismaService } from '../prisma/prisma.service';
import { DemoDataService } from './demo-data.service';

type PageQuery = {
  page?: number;
  pageSize?: number;
};

@Injectable()
export class AppDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly demoDataService: DemoDataService,
  ) {}

  private useFallback() {
    return !this.prisma.isAvailable;
  }

  async validateWebLogin(payload: { account: string; password: string }) {
    if (this.useFallback()) {
      return this.demoDataService.validateWebLogin(payload);
    }

    const user = await this.prisma.user.findUnique({
      where: { account: payload.account },
      include: { studentProfile: true },
    });

    if (!user || user.passwordHash !== payload.password) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return {
      id: user.id,
      account: user.account,
      role: user.role,
      displayName: user.displayName,
      studentId: user.studentProfile?.id,
    };
  }

  async validateDeviceLogin(payload: { code?: string; deviceCode?: string; mode?: DeviceMode }) {
    if (this.useFallback()) {
      return this.demoDataService.validateDeviceLogin(payload);
    }

    const mode = payload.mode ?? 'rental';

    if (mode === 'rental' && payload.code !== '123456') {
      throw new UnauthorizedException('授权码无效');
    }

    const studentUser = await this.prisma.user.findFirst({
      where: { role: 'student' },
      include: { studentProfile: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!studentUser) {
      throw new UnauthorizedException('未找到可用学员账号');
    }

    return {
      id: studentUser.id,
      account: studentUser.account,
      role: studentUser.role,
      displayName: studentUser.displayName,
      studentId: studentUser.studentProfile?.id,
    };
  }

  async findUserById(userId: string) {
    if (this.useFallback()) {
      return this.demoDataService.findUserById(userId);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      account: user.account,
      role: user.role,
      displayName: user.displayName,
      studentId: user.studentProfile?.id,
    };
  }

  async listOrganizations() {
    if (this.useFallback()) {
      return this.demoDataService.listOrganizations();
    }

    const organizations = await this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      type: organization.type,
      city: organization.city ?? undefined,
      contactName: organization.contactName ?? undefined,
      contactPhone: organization.contactPhone ?? undefined,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
    }));
  }

  async createOrganization(input: {
    name: string;
    type: string;
    city?: string;
    contactName?: string;
    contactPhone?: string;
  }) {
    if (this.useFallback()) {
      return this.demoDataService.createOrganization(input);
    }

    return this.prisma.organization.create({
      data: input,
    });
  }

  async listTaskTemplates() {
    if (this.useFallback()) {
      return this.demoDataService.listTaskTemplates();
    }

    const templates = await this.prisma.taskTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return templates.map((template) => ({
      id: template.id,
      title: template.title,
      description: template.description,
      taskType: template.taskType,
      abilityTags: template.abilityTags,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }));
  }

  async createTaskTemplate(input: {
    title: string;
    description: string;
    taskType: TaskType;
    abilityTags: string[];
  }) {
    if (this.useFallback()) {
      return this.demoDataService.createTaskTemplate(input);
    }

    return this.prisma.taskTemplate.create({
      data: input,
    });
  }

  listQuestionBank() {
    return this.demoDataService.listQuestionBank();
  }

  listInventory() {
    return this.demoDataService.listInventory();
  }

  async listStudents() {
    if (this.useFallback()) {
      return this.demoDataService.listStudents();
    }

    const students = await this.prisma.studentProfile.findMany({
      include: {
        primaryParent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return students.map((student) => ({
      id: student.id,
      userId: student.userId,
      primaryParentUserId: student.primaryParentUserId ?? undefined,
      name: student.name,
      city: student.city ?? undefined,
      school: student.school ?? undefined,
      grade: student.grade ?? undefined,
      primaryParent: student.primaryParent?.displayName,
    }));
  }

  async createStudent(input: {
    name: string;
    city?: string;
    school?: string;
    grade?: string;
    parentUserId?: string;
  }) {
    if (this.useFallback()) {
      return this.demoDataService.createStudent(input);
    }

    const studentCount = await this.prisma.studentProfile.count();
    const account = `student_${studentCount + 1}`;

    const student = await this.prisma.studentProfile.create({
      data: {
        name: input.name,
        city: input.city,
        school: input.school,
        grade: input.grade,
        primaryParent: input.parentUserId
          ? {
              connect: { id: input.parentUserId },
            }
          : undefined,
        user: {
          create: {
            account,
            passwordHash: 'Yanxuebao@2026',
            role: 'student',
            displayName: input.name,
          },
        },
      },
      include: {
        primaryParent: true,
      },
    });

    return {
      id: student.id,
      userId: student.userId,
      primaryParentUserId: student.primaryParentUserId ?? undefined,
      name: student.name,
      city: student.city ?? undefined,
      school: student.school ?? undefined,
      grade: student.grade ?? undefined,
      primaryParent: student.primaryParent?.displayName,
      loginAccount: account,
      initialPassword: 'Yanxuebao@2026',
    };
  }

  async getStudent(studentId: string) {
    if (this.useFallback()) {
      return this.demoDataService.getStudent(studentId);
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        primaryParent: true,
        deviceBindings: {
          include: { device: true },
          orderBy: { boundAt: 'desc' },
        },
        reports: true,
        growthValueRecords: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      id: student.id,
      userId: student.userId,
      primaryParentUserId: student.primaryParentUserId ?? undefined,
      name: student.name,
      city: student.city ?? undefined,
      school: student.school ?? undefined,
      grade: student.grade ?? undefined,
      primaryParent: student.primaryParent
        ? {
            id: student.primaryParent.id,
            displayName: student.primaryParent.displayName,
          }
        : undefined,
      deviceBindings: student.deviceBindings.map((binding) => ({
        id: binding.id,
        deviceCode: binding.device.deviceCode,
        mode: binding.device.mode,
        boundAt: binding.boundAt.toISOString(),
        unboundAt: binding.unboundAt?.toISOString(),
      })),
      reports: student.reports.map((report) => ({
        id: report.id,
        studentId: report.studentId,
        teamId: report.teamId ?? undefined,
        title: report.title,
        status: report.status,
        summary: report.summary,
        publishedAt: report.publishedAt?.toISOString(),
      })),
      growthValueRecords: student.growthValueRecords.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        sourceType: record.sourceType,
        delta: record.delta,
        description: record.description,
        occurredAt: record.occurredAt.toISOString(),
      })),
    };
  }

  async getStudentOverview(studentId: string) {
    if (this.useFallback()) {
      return this.demoDataService.getStudentOverview(studentId);
    }

    const student = (await this.getStudent(studentId)) as {
      id: string;
      userId: string;
      primaryParentUserId?: string;
      name: string;
      city?: string;
      school?: string;
      grade?: string;
      reports: Array<{ id: string }>;
      growthValueRecords: Array<{ delta: number }>;
      deviceBindings: Array<{ id: string; deviceCode: string; mode: DeviceMode; boundAt: string }>;
    };

    return {
      id: student.id,
      userId: student.userId,
      primaryParentUserId: student.primaryParentUserId ?? undefined,
      name: student.name,
      city: student.city ?? undefined,
      school: student.school ?? undefined,
      grade: student.grade ?? undefined,
      reportsCount: student.reports.length,
      growthValue: student.growthValueRecords.reduce((sum: number, item: { delta: number }) => sum + item.delta, 0),
      deviceBindings: student.deviceBindings.map((binding) => ({
        id: binding.id,
        deviceCode: binding.deviceCode,
        mode: binding.mode,
        boundAt: binding.boundAt,
      })),
    };
  }

  async bindDevice(input: { studentId: string; deviceCode: string; mode?: DeviceMode }) {
    if (this.useFallback()) {
      return this.demoDataService.bindDevice(input);
    }

    await this.getStudent(input.studentId);

    const device = await this.prisma.device.upsert({
      where: { deviceCode: input.deviceCode },
      create: {
        deviceCode: input.deviceCode,
        mode: input.mode ?? 'sale',
        platform: 'android',
        isActive: true,
      },
      update: {
        mode: input.mode ?? 'sale',
        isActive: true,
      },
    });

    const binding = await this.prisma.deviceBinding.create({
      data: {
        deviceId: device.id,
        studentId: input.studentId,
      },
    });

    return {
      ...binding,
      boundAt: binding.boundAt.toISOString(),
      device,
    };
  }

  async getDeviceByCode(deviceCode: string) {
    if (this.useFallback()) {
      return this.demoDataService.getDeviceByCode(deviceCode);
    }

    return this.prisma.device.findUnique({
      where: { deviceCode },
    });
  }

  async listTeams() {
    if (this.useFallback()) {
      return this.demoDataService.listTeams();
    }

    const teams = await this.prisma.team.findMany({
      include: {
        organization: true,
        members: true,
        groups: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return teams.map((team) => ({
      id: team.id,
      organizationId: team.organizationId ?? undefined,
      name: team.name,
      startDate: team.startDate.toISOString(),
      endDate: team.endDate?.toISOString(),
      status: team.status,
      organizationName: team.organization?.name ?? '未分配机构',
      studentCount: team.members.length,
      groupCount: team.groups.length,
    }));
  }

  async getTeam(teamId: string) {
    if (this.useFallback()) {
      return this.demoDataService.getTeam(teamId);
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        groups: true,
        members: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return {
      id: team.id,
      organizationId: team.organizationId ?? undefined,
      name: team.name,
      startDate: team.startDate.toISOString(),
      endDate: team.endDate?.toISOString(),
      status: team.status,
      groups: team.groups,
      members: team.members.map((member) => ({
        ...member,
        student: member.student
          ? {
              id: member.student.id,
              name: member.student.name,
            }
          : undefined,
      })),
    };
  }

  async createTeam(input: { name: string; organizationId?: string; startDate?: string }) {
    if (this.useFallback()) {
      return this.demoDataService.createTeam(input);
    }

    const team = await this.prisma.team.create({
      data: {
        name: input.name,
        organizationId: input.organizationId,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        status: 'draft',
      },
    });

    return {
      ...team,
      startDate: team.startDate.toISOString(),
      endDate: team.endDate?.toISOString(),
    };
  }

  async listGroups(teamId?: string) {
    if (this.useFallback()) {
      return this.demoDataService.listGroups(teamId);
    }

    return this.prisma.group.findMany({
      where: {
        ...(teamId ? { teamId } : {}),
      },
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGroup(input: { teamId: string; name: string }) {
    if (this.useFallback()) {
      return this.demoDataService.createGroup(input);
    }

    await this.getTeam(input.teamId);

    return this.prisma.group.create({
      data: input,
    });
  }

  async listTasks(filters?: { teamId?: string; studentId?: string }) {
    if (this.useFallback()) {
      return this.demoDataService.listTasks(filters);
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        ...(filters?.teamId ? { teamId: filters.teamId } : {}),
        ...(filters?.studentId ? { studentId: filters.studentId } : {}),
      },
      include: {
        team: true,
        group: true,
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task) => ({
      id: task.id,
      teamId: task.teamId ?? undefined,
      groupId: task.groupId ?? undefined,
      studentId: task.studentId ?? undefined,
      templateId: task.templateId ?? undefined,
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      status: task.status,
      dueAt: task.dueAt?.toISOString(),
      teamName: task.team?.name,
      groupName: task.group?.name,
      studentName: task.student?.name,
    }));
  }

  async getTask(taskId: string) {
    if (this.useFallback()) {
      return this.demoDataService.getTask(taskId);
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        works: true,
        scores: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      id: task.id,
      teamId: task.teamId ?? undefined,
      groupId: task.groupId ?? undefined,
      studentId: task.studentId ?? undefined,
      templateId: task.templateId ?? undefined,
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      status: task.status,
      dueAt: task.dueAt?.toISOString(),
      works: task.works.map((work) => ({
        ...work,
        submittedAt: work.submittedAt.toISOString(),
      })),
      scores: task.scores.map((score) => ({
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
      })),
    };
  }

  async createTask(input: {
    teamId?: string;
    groupId?: string;
    studentId?: string;
    templateId?: string;
    title: string;
    description: string;
    taskType: TaskType;
    dueAt?: string;
  }) {
    if (this.useFallback()) {
      return this.demoDataService.createTask(input);
    }

    const task = await this.prisma.task.create({
      data: {
        teamId: input.teamId,
        groupId: input.groupId,
        studentId: input.studentId,
        templateId: input.templateId,
        title: input.title,
        description: input.description,
        taskType: input.taskType,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        status: 'published',
      },
    });

    return {
      ...task,
      dueAt: task.dueAt?.toISOString(),
    };
  }

  async submitWork(input: {
    taskId: string;
    studentId?: string;
    groupId?: string;
    type: WorkType;
    content: string;
  }) {
    if (this.useFallback()) {
      return this.demoDataService.submitWork(input);
    }

    await this.getTask(input.taskId);

    const work = await this.prisma.work.create({
      data: {
        taskId: input.taskId,
        studentId: input.studentId,
        groupId: input.groupId,
        type: input.type,
        content: input.content,
      },
    });

    const score = await this.prisma.scoreRecord.create({
      data: {
        taskId: input.taskId,
        workId: work.id,
        studentId: input.studentId,
        groupId: input.groupId,
        status: 'ai_suggested',
        aiScore: 8,
      },
    });

    await this.prisma.task.update({
      where: { id: input.taskId },
      data: { status: 'submitted' },
    });

    return {
      work: {
        ...work,
        submittedAt: work.submittedAt.toISOString(),
      },
      score: {
        ...score,
        createdAt: score.createdAt.toISOString(),
        updatedAt: score.updatedAt.toISOString(),
      },
    };
  }

  async updateWork(workId: string, input: { content: string }) {
    if (this.useFallback()) {
      return this.demoDataService.updateWork(workId, input);
    }

    const work = await this.prisma.work.update({
      where: { id: workId },
      data: {
        content: input.content,
        submittedAt: new Date(),
      },
    });

    return {
      ...work,
      submittedAt: work.submittedAt.toISOString(),
    };
  }

  async listScores(filters?: { teamId?: string; studentId?: string }) {
    if (this.useFallback()) {
      return this.demoDataService.listScores(filters);
    }

    const scores = await this.prisma.scoreRecord.findMany({
      where: {
        ...(filters?.studentId ? { studentId: filters.studentId } : {}),
        ...(filters?.teamId
          ? {
              task: {
                teamId: filters.teamId,
              },
            }
          : {}),
      },
      include: {
        task: true,
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return scores.map((score) => ({
      id: score.id,
      taskId: score.taskId,
      workId: score.workId ?? undefined,
      studentId: score.studentId ?? undefined,
      groupId: score.groupId ?? undefined,
      status: score.status,
      aiScore: score.aiScore ?? undefined,
      tutorScore: score.tutorScore ?? undefined,
      comment: score.comment ?? undefined,
      taskTitle: score.task?.title,
      studentName: score.student?.name,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
    }));
  }

  async confirmScore(scoreId: string, tutorScore: number, comment?: string) {
    if (this.useFallback()) {
      return this.demoDataService.confirmScore(scoreId, tutorScore, comment);
    }

    const score = await this.prisma.scoreRecord.update({
      where: { id: scoreId },
      data: {
        tutorScore,
        comment,
        status: 'confirmed',
      },
    });

    await this.prisma.task.update({
      where: { id: score.taskId },
      data: { status: 'scored' },
    });

    return {
      ...score,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
    };
  }

  async listReports(studentId?: string) {
    if (this.useFallback()) {
      return this.demoDataService.listReports(studentId);
    }

    const reports = await this.prisma.report.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) => ({
      id: report.id,
      studentId: report.studentId,
      teamId: report.teamId ?? undefined,
      title: report.title,
      status: report.status,
      summary: (report.summary as Record<string, unknown> | null) ?? {},
      publishedAt: report.publishedAt?.toISOString(),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }));
  }

  async generateReport(input: { studentId: string; teamId?: string; title?: string }) {
    if (this.useFallback()) {
      return this.demoDataService.generateReport(input);
    }

    await this.getStudent(input.studentId);

    const report = await this.prisma.report.create({
      data: {
        studentId: input.studentId,
        teamId: input.teamId,
        title: input.title ?? '新生成的研学报告',
        status: 'generated',
        summary: {
          strengths: ['观察力', '协作力'],
          nextActions: ['加强任务表达结构', '在小组汇报中承担更多输出角色'],
        },
        publishedAt: new Date(),
      },
    });

    return {
      ...report,
      publishedAt: report.publishedAt?.toISOString(),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }

  async getGrowth(studentId: string) {
    if (this.useFallback()) {
      return this.demoDataService.getGrowth(studentId);
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [growthValueRecords, capabilityIndexRecords, reports] = await Promise.all([
      this.prisma.growthValueRecord.findMany({
        where: { studentId },
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.capabilityIndexRecord.findMany({
        where: { studentId },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.report.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const records = [
      ...growthValueRecords.map((item) => ({
        id: item.id,
        type: 'growth_value' as GrowthRecordType,
        title: item.description,
        value: item.delta,
        occurredAt: item.occurredAt.toISOString(),
      })),
      ...capabilityIndexRecords.map((item) => ({
        id: item.id,
        type: 'capability_index' as GrowthRecordType,
        title: item.elementKey,
        value: item.score,
        occurredAt: item.recordedAt.toISOString(),
      })),
      ...reports.map((item) => ({
        id: item.id,
        type: 'report' as GrowthRecordType,
        title: item.title,
        value: 1,
        occurredAt: item.createdAt.toISOString(),
      })),
    ].sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());

    return {
      student: {
        id: student.id,
        name: student.name,
        city: student.city ?? undefined,
        school: student.school ?? undefined,
        grade: student.grade ?? undefined,
      },
      records,
      growthValueRecords: growthValueRecords.map((item) => ({
        ...item,
        occurredAt: item.occurredAt.toISOString(),
      })),
      capabilityIndexRecords: capabilityIndexRecords.map((item) => ({
        ...item,
        recordedAt: item.recordedAt.toISOString(),
      })),
      reports: reports.map((item) => ({
        ...item,
        publishedAt: item.publishedAt?.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }

  async listCourses() {
    if (this.useFallback()) {
      return this.demoDataService.listCourses();
    }

    const courses = await this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return courses.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      format: item.format,
      status: item.status,
      expertUserId: item.expertUserId ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createCourse(input: { title: string; summary: string; format: string; status: string }) {
    if (this.useFallback()) {
      return this.demoDataService.createCourse(input);
    }

    return this.prisma.course.create({
      data: input,
    });
  }

  async listKnowledgeItems() {
    if (this.useFallback()) {
      return this.demoDataService.listKnowledgeItems();
    }

    const items = await this.prisma.knowledgeItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      content: item.content,
      expertUserId: item.expertUserId ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createKnowledgeItem(input: { title: string; category: string; content: string }) {
    if (this.useFallback()) {
      return this.demoDataService.createKnowledgeItem(input);
    }

    return this.prisma.knowledgeItem.create({
      data: input,
    });
  }

  async listChallenges() {
    if (this.useFallback()) {
      return this.demoDataService.listChallenges();
    }

    const challenges = await this.prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return challenges.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      difficulty: item.difficulty,
      status: item.status,
      expertUserId: item.expertUserId ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createChallenge(input: {
    title: string;
    summary: string;
    difficulty: string;
    status: string;
  }) {
    if (this.useFallback()) {
      return this.demoDataService.createChallenge(input);
    }

    return this.prisma.challenge.create({
      data: {
        title: input.title,
        summary: input.summary,
        detail: input.summary,
        difficulty: input.difficulty,
        status: input.status,
      },
    });
  }

  async listNews() {
    if (this.useFallback()) {
      return this.demoDataService.listNews();
    }

    const news = await this.prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return news.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category,
      publishedAt: item.publishedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createNews(input: {
    title: string;
    summary: string;
    category: string;
    publishedAt: string;
  }) {
    if (this.useFallback()) {
      return this.demoDataService.createNews(input);
    }

    return this.prisma.news.create({
      data: {
        title: input.title,
        summary: input.summary,
        content: input.summary,
        category: input.category,
        publishedAt: new Date(input.publishedAt),
      },
    });
  }

  async listMessages() {
    if (this.useFallback()) {
      return this.demoDataService.listMessages();
    }

    const messages = await this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return messages.map((item) => ({
      id: item.id,
      type: item.type as MessageType,
      title: item.title,
      content: item.content,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async listAiRecords(studentId?: string) {
    if (this.useFallback()) {
      return this.demoDataService.listAiRecords(studentId);
    }

    const records = await this.prisma.aiRecord.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async createFileAsset(input: {
    studentId?: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    publicUrl: string;
  }) {
    if (this.useFallback()) {
      return {
        id: input.fileName,
        ...input,
        createdAt: new Date().toISOString(),
      };
    }

    const asset = await this.prisma.fileAsset.create({
      data: input,
    });

    return {
      ...asset,
      createdAt: asset.createdAt.toISOString(),
    };
  }

  paginate<T>(items: T[], query?: PageQuery) {
    const page = Math.max(query?.page ?? 1, 1);
    const pageSize = Math.max(query?.pageSize ?? 20, 1);
    const start = (page - 1) * pageSize;

    return {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    };
  }
}
