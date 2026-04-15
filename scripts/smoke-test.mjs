const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001/api';
const PASSWORD = 'Yanxuebao@2026';

async function request(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (!(options.body instanceof FormData) && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${path}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return { status: response.status, data };
}

async function login(account, role = 'web') {
  const path = role === 'device' ? '/auth/device/login' : '/auth/web/login';
  const payload =
    role === 'device'
      ? { mode: 'rental', code: '123456', deviceCode: 'YXB-DEV-0001' }
      : { account, password: PASSWORD };

  const { status, data } = await request(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return { status, token: data.accessToken, session: data };
}

async function authorized(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

async function main() {
  const tutorLogin = await login('tutor_demo');
  const parentLogin = await login('parent_demo');
  const expertLogin = await login('expert_demo');
  const deviceLogin = await login('', 'device');

  const createTeam = await authorized('/teams', tutorLogin.token, {
    method: 'POST',
    body: JSON.stringify({
      name: `烟测团队-${Date.now()}`,
      organizationId: 'org_demo_school_01',
    }),
  });

  const createdTeamId = createTeam.data.id;
  const listStudents = await authorized('/students', parentLogin.token);
  const studentId = listStudents.data.items?.[0]?.id ?? listStudents.data[0]?.id;

  const createTask = await authorized('/tasks', tutorLogin.token, {
    method: 'POST',
    body: JSON.stringify({
      teamId: createdTeamId,
      studentId,
      title: `烟测任务-${Date.now()}`,
      description: '请用一句话描述你观察到的海洋生物特征',
      taskType: 'collect',
    }),
  });

  const pagedTasks = await authorized(`/tasks?teamId=${createdTeamId}&page=1&pageSize=5`, tutorLogin.token);

  const uploadData = new FormData();
  uploadData.append('file', new Blob(['yanxuebao smoke upload'], { type: 'text/plain' }), 'smoke-upload.txt');
  uploadData.append('studentId', studentId);
  const uploadAsset = await authorized('/files/upload', deviceLogin.token, {
    method: 'POST',
    body: uploadData,
  });

  const submitWork = await authorized('/works', deviceLogin.token, {
    method: 'POST',
    body: JSON.stringify({
      taskId: createTask.data.id,
      studentId,
      type: 'text',
      content: `我观察到海星的身体呈放射状，颜色鲜艳。\n附件：${uploadAsset.data.file.originalName} (${uploadAsset.data.file.publicUrl})`,
    }),
  });

  const confirmScore = await authorized('/scores/confirm', tutorLogin.token, {
    method: 'POST',
    body: JSON.stringify({
      scoreId: submitWork.data.score.id,
      tutorScore: 9,
      comment: '烟测评分通过',
    }),
  });

  const report = await authorized('/reports/generate', tutorLogin.token, {
    method: 'POST',
    body: JSON.stringify({
      studentId,
      teamId: createdTeamId,
      title: '烟测生成报告',
    }),
  });

  const parentGrowthRecords = await authorized(`/growth/${studentId}/records`, parentLogin.token);
  const aiRecords = await authorized(`/messages/ai-records?studentId=${studentId}`, parentLogin.token);

  const createCourse = await authorized('/courses', expertLogin.token, {
    method: 'POST',
    body: JSON.stringify({
      title: `烟测课程-${Date.now()}`,
      summary: '用于专家内容链路验证',
      format: 'online',
    }),
  });

  console.log(
    JSON.stringify(
      {
        tutorLogin: tutorLogin.status,
        parentLogin: parentLogin.status,
        deviceLogin: deviceLogin.status,
        expertLogin: expertLogin.status,
        createTeam: createTeam.status,
        createTask: createTask.status,
        listTasksItems: pagedTasks.data.items?.length ?? 0,
        uploadFile: uploadAsset.status,
        submitWork: submitWork.status,
        confirmScore: confirmScore.status,
        report: report.status,
        parentGrowthRecords:
          parentGrowthRecords.data.records?.length ?? parentGrowthRecords.data.growthValueRecords?.length ?? 0,
        parentStudents: listStudents.data.total ?? listStudents.data.length ?? 0,
        aiRecords: aiRecords.data.length ?? 0,
        createCourse: createCourse.status,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
