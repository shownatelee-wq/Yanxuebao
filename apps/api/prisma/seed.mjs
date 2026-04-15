import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PASSWORD = 'Yanxuebao@2026';
const DEVICE_CODE = 'YXB-DEV-0001';

async function main() {
  const operator = await prisma.user.upsert({
    where: { account: 'operator_demo' },
    update: { displayName: '运营演示账号', role: 'operator', passwordHash: PASSWORD, phone: '13800000001' },
    create: {
      account: 'operator_demo',
      passwordHash: PASSWORD,
      role: 'operator',
      displayName: '运营演示账号',
      phone: '13800000001',
    },
  });

  const tutor = await prisma.user.upsert({
    where: { account: 'tutor_demo' },
    update: { displayName: '导师演示账号', role: 'tutor', passwordHash: PASSWORD, phone: '13800000002' },
    create: {
      account: 'tutor_demo',
      passwordHash: PASSWORD,
      role: 'tutor',
      displayName: '导师演示账号',
      phone: '13800000002',
    },
  });

  const parent = await prisma.user.upsert({
    where: { account: 'parent_demo' },
    update: { displayName: '家长演示账号', role: 'parent', passwordHash: PASSWORD, phone: '13800000003' },
    create: {
      account: 'parent_demo',
      passwordHash: PASSWORD,
      role: 'parent',
      displayName: '家长演示账号',
      phone: '13800000003',
    },
  });

  const expert = await prisma.user.upsert({
    where: { account: 'expert_demo' },
    update: { displayName: '专家演示账号', role: 'expert', passwordHash: PASSWORD, phone: '13800000004' },
    create: {
      account: 'expert_demo',
      passwordHash: PASSWORD,
      role: 'expert',
      displayName: '专家演示账号',
      phone: '13800000004',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { account: 'student_demo' },
    update: { displayName: '学员演示账号', role: 'student', passwordHash: PASSWORD, phone: '13800000005' },
    create: {
      account: 'student_demo',
      passwordHash: PASSWORD,
      role: 'student',
      displayName: '学员演示账号',
      phone: '13800000005',
    },
  });

  const school = await prisma.organization.upsert({
    where: { id: 'org_demo_school_01' },
    update: {
      name: '南山实验学校',
      type: 'school',
      city: '深圳',
      contactName: '王老师',
      contactPhone: '13811110001',
    },
    create: {
      id: 'org_demo_school_01',
      name: '南山实验学校',
      type: 'school',
      city: '深圳',
      contactName: '王老师',
      contactPhone: '13811110001',
    },
  });

  await prisma.organization.upsert({
    where: { id: 'org_demo_base_01' },
    update: {
      name: '深圳海洋研学基地',
      type: 'base',
      city: '深圳',
      contactName: '陈老师',
      contactPhone: '13811110002',
    },
    create: {
      id: 'org_demo_base_01',
      name: '深圳海洋研学基地',
      type: 'base',
      city: '深圳',
      contactName: '陈老师',
      contactPhone: '13811110002',
    },
  });

  const student = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {
      primaryParentUserId: parent.id,
      name: '李同学',
      city: '深圳',
      school: '南山实验学校',
      grade: '五年级',
    },
    create: {
      userId: studentUser.id,
      primaryParentUserId: parent.id,
      name: '李同学',
      city: '深圳',
      school: '南山实验学校',
      grade: '五年级',
    },
  });

  const device = await prisma.device.upsert({
    where: { deviceCode: DEVICE_CODE },
    update: { mode: 'sale', platform: 'android', isActive: true, serialNumber: 'SN-0001' },
    create: {
      deviceCode: DEVICE_CODE,
      serialNumber: 'SN-0001',
      mode: 'sale',
      platform: 'android',
      isActive: true,
    },
  });

  await prisma.deviceBinding.upsert({
    where: { id: 'binding_demo_01' },
    update: { deviceId: device.id, studentId: student.id, unboundAt: null },
    create: {
      id: 'binding_demo_01',
      deviceId: device.id,
      studentId: student.id,
    },
  });

  const team = await prisma.team.upsert({
    where: { id: 'team_demo_01' },
    update: {
      name: '深圳海洋研学营第一期',
      organizationId: school.id,
      startDate: new Date('2026-04-10T09:00:00.000Z'),
      status: 'published',
    },
    create: {
      id: 'team_demo_01',
      name: '深圳海洋研学营第一期',
      organizationId: school.id,
      startDate: new Date('2026-04-10T09:00:00.000Z'),
      status: 'published',
    },
  });

  const group = await prisma.group.upsert({
    where: { id: 'group_demo_01' },
    update: { teamId: team.id, name: '海星队' },
    create: {
      id: 'group_demo_01',
      teamId: team.id,
      name: '海星队',
    },
  });

  await prisma.teamMember.upsert({
    where: { teamId_studentId: { teamId: team.id, studentId: student.id } },
    update: { groupId: group.id, roleName: '观察记录员' },
    create: {
      teamId: team.id,
      studentId: student.id,
      groupId: group.id,
      roleName: '观察记录员',
    },
  });

  const taskTemplate = await prisma.taskTemplate.upsert({
    where: { id: 'task_template_demo_01' },
    update: {
      title: '海洋生物观察记录',
      description: '完成现场观察、拍照记录并提交结论。',
      taskType: 'collect',
      abilityTags: ['观察力', '表达力'],
    },
    create: {
      id: 'task_template_demo_01',
      title: '海洋生物观察记录',
      description: '完成现场观察、拍照记录并提交结论。',
      taskType: 'collect',
      abilityTags: ['观察力', '表达力'],
    },
  });

  const task = await prisma.task.upsert({
    where: { id: 'task_demo_01' },
    update: {
      teamId: team.id,
      groupId: group.id,
      studentId: student.id,
      templateId: taskTemplate.id,
      title: '记录 3 种海洋生物特征',
      description: '拍摄至少 3 张图片，并用一句话描述每种海洋生物特征。',
      taskType: 'collect',
      status: 'published',
      dueAt: new Date('2026-04-10T12:00:00.000Z'),
    },
    create: {
      id: 'task_demo_01',
      teamId: team.id,
      groupId: group.id,
      studentId: student.id,
      templateId: taskTemplate.id,
      title: '记录 3 种海洋生物特征',
      description: '拍摄至少 3 张图片，并用一句话描述每种海洋生物特征。',
      taskType: 'collect',
      status: 'published',
      dueAt: new Date('2026-04-10T12:00:00.000Z'),
    },
  });

  const work = await prisma.work.upsert({
    where: { id: 'work_demo_01' },
    update: {
      taskId: task.id,
      studentId: student.id,
      groupId: group.id,
      type: 'text',
      content: '海星具有五角辐射对称，海胆全身有刺，水母呈透明伞状。',
    },
    create: {
      id: 'work_demo_01',
      taskId: task.id,
      studentId: student.id,
      groupId: group.id,
      type: 'text',
      content: '海星具有五角辐射对称，海胆全身有刺，水母呈透明伞状。',
    },
  });

  await prisma.scoreRecord.upsert({
    where: { id: 'score_demo_01' },
    update: {
      taskId: task.id,
      workId: work.id,
      studentId: student.id,
      groupId: group.id,
      status: 'confirmed',
      aiScore: 8.5,
      tutorScore: 9,
      comment: '观察细致，描述准确。',
    },
    create: {
      id: 'score_demo_01',
      taskId: task.id,
      workId: work.id,
      studentId: student.id,
      groupId: group.id,
      status: 'confirmed',
      aiScore: 8.5,
      tutorScore: 9,
      comment: '观察细致，描述准确。',
    },
  });

  await prisma.report.upsert({
    where: { id: 'report_demo_01' },
    update: {
      studentId: student.id,
      teamId: team.id,
      title: '深圳海洋研学营成长报告',
      status: 'generated',
      summary: {
        strengths: ['观察力', '协作力'],
        nextActions: ['多做结构化表达', '尝试主动汇报'],
      },
      publishedAt: new Date('2026-04-10T16:00:00.000Z'),
    },
    create: {
      id: 'report_demo_01',
      studentId: student.id,
      teamId: team.id,
      title: '深圳海洋研学营成长报告',
      status: 'generated',
      summary: {
        strengths: ['观察力', '协作力'],
        nextActions: ['多做结构化表达', '尝试主动汇报'],
      },
      publishedAt: new Date('2026-04-10T16:00:00.000Z'),
    },
  });

  await prisma.growthValueRecord.upsert({
    where: { id: 'growth_value_demo_01' },
    update: {
      studentId: student.id,
      sourceType: 'task_score',
      delta: 15,
      description: '完成海洋生物观察任务',
    },
    create: {
      id: 'growth_value_demo_01',
      studentId: student.id,
      sourceType: 'task_score',
      delta: 15,
      description: '完成海洋生物观察任务',
    },
  });

  await prisma.capabilityIndexRecord.upsert({
    where: { id: 'capability_demo_01' },
    update: {
      studentId: student.id,
      elementKey: 'observe',
      source: 'report',
      score: 84,
    },
    create: {
      id: 'capability_demo_01',
      studentId: student.id,
      elementKey: 'observe',
      source: 'report',
      score: 84,
    },
  });

  await prisma.course.upsert({
    where: { id: 'course_demo_01' },
    update: {
      title: '海洋科普直播课',
      summary: '带孩子认识常见海洋生物与生态系统。',
      format: 'online',
      status: 'published',
      expertUserId: expert.id,
    },
    create: {
      id: 'course_demo_01',
      title: '海洋科普直播课',
      summary: '带孩子认识常见海洋生物与生态系统。',
      format: 'online',
      status: 'published',
      expertUserId: expert.id,
    },
  });

  await prisma.knowledgeItem.upsert({
    where: { id: 'knowledge_demo_01' },
    update: {
      title: '海星为什么能再生',
      category: '海洋生物',
      content: '海星拥有较强的组织再生能力，部分种类可通过残留腕足再生。',
      expertUserId: expert.id,
    },
    create: {
      id: 'knowledge_demo_01',
      title: '海星为什么能再生',
      category: '海洋生物',
      content: '海星拥有较强的组织再生能力，部分种类可通过残留腕足再生。',
      expertUserId: expert.id,
    },
  });

  await prisma.challenge.upsert({
    where: { id: 'challenge_demo_01' },
    update: {
      title: '设计一个海洋垃圾分类方案',
      summary: '从研学现场出发，提出海洋垃圾分类与科普方案。',
      detail: '从研学现场出发，提出海洋垃圾分类与科普方案。',
      difficulty: 'medium',
      status: 'published',
      expertUserId: expert.id,
    },
    create: {
      id: 'challenge_demo_01',
      title: '设计一个海洋垃圾分类方案',
      summary: '从研学现场出发，提出海洋垃圾分类与科普方案。',
      detail: '从研学现场出发，提出海洋垃圾分类与科普方案。',
      difficulty: 'medium',
      status: 'published',
      expertUserId: expert.id,
    },
  });

  await prisma.news.upsert({
    where: { id: 'news_demo_01' },
    update: {
      title: '海洋研学营本周开营',
      summary: '深圳海洋研学营将在本周正式开营。',
      content: '深圳海洋研学营将在本周正式开营。',
      category: '活动资讯',
      publishedAt: new Date('2026-04-08T08:00:00.000Z'),
    },
    create: {
      id: 'news_demo_01',
      title: '海洋研学营本周开营',
      summary: '深圳海洋研学营将在本周正式开营。',
      content: '深圳海洋研学营将在本周正式开营。',
      category: '活动资讯',
      publishedAt: new Date('2026-04-08T08:00:00.000Z'),
    },
  });

  await prisma.message.upsert({
    where: { id: 'message_demo_01' },
    update: {
      type: 'team_broadcast',
      title: '集合提醒',
      content: '请在 10:00 前于海洋馆门口集合。',
      senderUserId: tutor.id,
      teamId: team.id,
      groupId: group.id,
    },
    create: {
      id: 'message_demo_01',
      type: 'team_broadcast',
      title: '集合提醒',
      content: '请在 10:00 前于海洋馆门口集合。',
      senderUserId: tutor.id,
      teamId: team.id,
      groupId: group.id,
    },
  });

  await prisma.aiRecord.upsert({
    where: { id: 'ai_record_demo_01' },
    update: {
      studentId: student.id,
      scene: 'ask',
      title: '问问：海胆为什么有刺',
      summary: 'AI 解释了海胆用刺进行防御与移动辅助。',
    },
    create: {
      id: 'ai_record_demo_01',
      studentId: student.id,
      scene: 'ask',
      title: '问问：海胆为什么有刺',
      summary: 'AI 解释了海胆用刺进行防御与移动辅助。',
    },
  });

  console.log(
    'Seed finished:',
    {
      operator: operator.account,
      tutor: tutor.account,
      parent: parent.account,
      expert: expert.account,
      student: studentUser.account,
      deviceCode: DEVICE_CODE,
    },
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
