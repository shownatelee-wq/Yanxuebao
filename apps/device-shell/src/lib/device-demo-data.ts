const now = new Date().toISOString();

export type DemoWorkCategory =
  | '学习型'
  | '研究型'
  | '打卡型'
  | '探究型'
  | '观察型'
  | '创作型'
  | '记录型'
  | '论证型'
  | '服务型'
  | '体验型'
  | '演绎型';

export type DemoResourceDocSection = {
  title: string;
  imageLabel: string;
  description: string;
  accent: 'blue' | 'green' | 'orange' | 'purple';
};

export type DemoResourcePdfPageBlock = {
  title?: string;
  content: string;
  tone?: 'paragraph' | 'table' | 'tip';
};

export type DemoResourcePdfPage = {
  pageTitle: string;
  pageHint: string;
  blocks: DemoResourcePdfPageBlock[];
};

export type DemoWorkFormField =
  | {
      id: string;
      kind: 'fill_blank';
      label: string;
      placeholder: string;
      helper?: string;
      required?: boolean;
      tools?: Array<'ask' | 'identify' | 'ai_draw' | 'ai_video' | 'flash_note' | 'camera' | 'checkin' | 'voice_text'>;
    }
  | {
      id: string;
      kind: 'single_choice' | 'multiple_choice';
      label: string;
      helper?: string;
      options: string[];
      required?: boolean;
      tools?: Array<'ask' | 'identify' | 'ai_draw' | 'ai_video' | 'flash_note' | 'camera' | 'checkin' | 'voice_text'>;
    }
  | {
      id: string;
      kind: 'image_upload' | 'video_upload' | 'audio_upload' | 'link_upload';
      label: string;
      helper?: string;
      limitText?: string;
      required?: boolean;
      tools?: Array<'ask' | 'identify' | 'ai_draw' | 'ai_video' | 'flash_note' | 'camera' | 'checkin' | 'voice_text'>;
    };

export type DemoWorkMedia = {
  id: string;
  type: '照片' | '视频' | '音频' | '链接' | '闪记引用' | '打卡证明' | 'AI回答' | 'AI识图' | 'AI绘图' | 'AI视频';
  title: string;
  url: string;
  duration?: string;
  locationLabel?: string;
  capturedAt?: string;
  flashNoteId?: string;
  summary?: string;
};

export type DemoWorkAnswer =
  | {
      fieldId: string;
      kind: 'fill_blank';
      label: string;
      value: string;
    }
  | {
      fieldId: string;
      kind: 'single_choice' | 'multiple_choice';
      label: string;
      value: string[];
    }
  | {
      fieldId: string;
      kind: 'image_upload' | 'video_upload' | 'audio_upload' | 'link_upload';
      label: string;
      files: DemoWorkMedia[];
    };

export type DemoReviewRubricItem = {
  dimension: string;
  score: number;
  level: string;
  comment: string;
};

export type DemoReviewRubric = {
  role: '自评' | '互评';
  targetName: string;
  totalScore: number;
  summary: string;
  completedAt: string;
  items: DemoReviewRubricItem[];
};

export type DemoTask = {
  id: string;
  title: string;
  description: string;
  intro: string;
  taskType: string;
  taskDescription: string;
  status: 'todo' | 'in_progress' | 'submitted';
  dueAt?: string;
  category: 'study' | 'daily' | 'project';
  target: '个人' | '小组';
  requirement: string;
  infoSummary: string;
  worksSubmitted: number;
  worksRequired: number;
  score?: number;
  rating?: 'A' | 'B' | 'C' | 'D';
  sequence: number;
  timeLimit: string;
  capabilityTags: string[];
  capabilityTagSource?: 'manual' | 'ai';
  taskSheets: Array<{
    id: string;
    title: string;
    topicType: '感想' | '创作地图' | '画作' | '讲解视频' | 'AI 探究' | '打卡记录' | '闪记' | '寻宝收集' | '问答' | '调查';
    workCategory: DemoWorkCategory;
    workMode: '独立完成' | '小组协作';
    workKind:
      | 'ai_link'
      | 'flash_note'
      | 'explain_video'
      | 'checkin_treasure'
      | 'rich_text'
      | 'image'
      | 'video';
    sheetTemplateKind?: 'observation' | 'ai_proof' | 'speed_checkin' | 'treasure_collect' | 'creative_research' | 'qa_research' | 'survey';
    gameplayKind?: 'speed_checkin' | 'treasure_collect' | 'creative_research' | 'qa_research' | 'survey';
    requirement: string;
    mediaTypes: Array<'照片' | '视频' | '文字' | '音频' | '链接' | '定位打卡'>;
    status: '待开始' | '进行中' | '已完成';
    submissionStatus: '待填写' | '待提交' | '已提交';
    workForm: DemoWorkFormField[];
  }>;
  resourcePacks: Array<{
    id: string;
    title: string;
    type: 'doc' | 'pdf' | 'video' | 'ai_reference' | 'ai';
    summary: string;
    previewMode: 'doc' | 'pdf' | 'video' | 'ai_reference' | 'ai';
    coverImage?: string;
    duration?: string;
    aiSummary?: string;
    defaultPrompt?: string;
    allowEditPrompt?: boolean;
    questions?: string[];
    docSections?: DemoResourceDocSection[];
    pdfPages?: DemoResourcePdfPage[];
  }>;
};

export type DemoTaskWork = {
  id: string;
  taskId: string;
  taskSheetId?: string;
  authorName: string;
  groupName?: string;
  title: string;
  workCategory: DemoWorkCategory;
  topicType: '感想' | '创作地图' | '画作' | '讲解视频' | 'AI 探究' | '打卡记录' | '闪记' | '寻宝收集' | '问答' | '调查';
  workMode: '独立完成' | '小组协作';
  type: '文字' | '图片' | '音频' | '视频';
  workKind:
    | 'ai_link'
    | 'flash_note'
    | 'explain_video'
    | 'checkin_treasure'
    | 'rich_text'
    | 'image'
    | 'video';
  summary: string;
  textContent?: string;
  voiceTranscript?: string;
  media: DemoWorkMedia[];
  attachments?: DemoWorkMedia[];
  formAnswers?: DemoWorkAnswer[];
  capabilityTags?: string[];
  linkedFlashNotes?: Array<{
    id: string;
    title: string;
    type?: 'voice_note' | 'video_note';
    transcript?: string;
    photoCount?: number;
    duration?: string;
  }>;
  audioPreview?: { title: string; duration?: string };
  canResubmit?: boolean;
  collaborators?: Array<{ id: string; name: string; role: string }>;
  sharedInputs?: Array<{ id: string; member: string; content: string }>;
  selfReview?: { score: number; comment: string; completedAt: string };
  peerReviews?: Array<{ reviewer: string; score: number; comment: string; completedAt: string }>;
  selfReviewDetail?: DemoReviewRubric;
  peerReviewDetails?: DemoReviewRubric[];
  teacherReview?: { status: '待评价' | '已评价'; score?: number; comment?: string; completedAt?: string };
  growthValueDelta?: number;
  capabilityScoreDelta?: number;
  updatedAt: string;
  status: '草稿' | '已提交';
};

export type DemoMessage = {
  id: string;
  title: string;
  content: string;
  type: 'broadcast' | 'group' | 'family' | 'system' | 'subscription';
  read?: boolean;
  from: string;
  sentAt: string;
  targetPath?: string;
  detailSections?: Array<{
    title: string;
    content: string;
  }>;
  actionHint?: string;
};

export type DemoCourseChapter = {
  id: string;
  title: string;
  duration: string;
  progress: number;
};

export type DemoCourseNote = {
  id: string;
  title: string;
  createdAt: string;
  linkedChapterTitle: string;
  linkedPositionLabel: string;
  content: string;
};

export type DemoCourse = {
  id: string;
  title: string;
  summary: string;
  type: '视频' | '音频' | '难题挑战';
  progress: number;
  cover: string;
  purchased: boolean;
  resumeHint: string;
  lastPositionLabel: string;
  favorite?: boolean;
  shared?: boolean;
  aiCompanionTitle: string;
  statusText: string;
  chapters: DemoCourseChapter[];
  notes: DemoCourseNote[];
};

export type DemoKnowledge = { id: string; title: string; category: string; content: string; prompt: string };

export type DemoAiRecord = {
  id: string;
  scene: string;
  title: string;
  summary: string;
  createdAt: string;
};

export type DemoGrowthRecord = {
  id: string;
  type: string;
  category: '研学任务成长值' | '专家课程成长值' | '日常使用成长值';
  sourceType: 'task' | 'self_review' | 'parent_review' | 'teacher_review' | 'self_test';
  title: string;
  value: number;
  delta: number;
  occurredAt: string;
  summary: string;
  displaySource: string;
};

export type DemoCapabilityLevel = '优秀' | '良好' | '待提升' | '待改进';

export type DemoCapability = {
  id: string;
  elementKey: string;
  planeKey: 'self' | 'learning' | 'social' | 'future';
  planeTitle: string;
  score: number;
  averageScore: number;
  level: DemoCapabilityLevel;
  source: string;
  recordedAt: string;
  sourceBreakdown: Array<{ label: string; value: number }>;
  indicatorDimensions: Array<{ label: string; score: number; average: number }>;
};

export type DemoCapabilityPlaneSummary = {
  planeKey: 'self' | 'learning' | 'social' | 'future';
  planeTitle: string;
  score: number;
  averageScore: number;
};

export type DemoCapabilityRadarSeries = {
  label: string;
  color: string;
  values: number[];
};

export type DemoCapabilityOverview = {
  currentIndex: number;
  currentLevel: DemoCapabilityLevel;
  planes: DemoCapabilityPlaneSummary[];
  strongest: DemoCapability[];
  weakest: DemoCapability[];
};

export type DemoTeamJoinStatus = 'joined' | 'joinable' | 'ended';
export type DemoTeamLifecycleStatus = '招募中' | '待出行' | '进行中' | '已结束';
export type DemoTeamMembershipStatus = '已加入' | '待审批' | '未加入' | '历史可查看';
export type DemoTeamSourceType = '学校团体研学' | '机构团体研学' | '研学旅行推荐';

export type DemoTeam = {
  id: string;
  name: string;
  organizationName?: string;
  status?: string;
  studyDate: string;
  days: number;
  destination: string;
  studentCount: number;
  joinStatus: DemoTeamJoinStatus;
  lifecycleStatus: DemoTeamLifecycleStatus;
  membershipStatus: DemoTeamMembershipStatus;
  sourceType: DemoTeamSourceType;
  schoolName?: string;
  shareTarget?: 'parent';
  canScanJoin?: boolean;
  canCodeJoin?: boolean;
  shareSummary?: string;
  isActive?: boolean;
};

export type DemoTeamHandbookMaterial = {
  id: string;
  title: string;
  type: 'doc' | 'pdf' | 'video' | 'ai_reference';
  summary: string;
  previewMode: 'doc' | 'pdf' | 'video' | 'ai_reference';
  coverImage?: string;
  duration?: string;
  aiSummary?: string;
  questions?: string[];
  docSections?: Array<{
    title: string;
    imageLabel: string;
    description: string;
  }>;
  pdfPages?: Array<{
    pageTitle: string;
    blocks: Array<{
      title: string;
      content: string;
      tone?: 'default' | 'table';
    }>;
  }>;
};

export type DemoTeamMember = {
  id: string;
  name: string;
  roleName: string;
  rolePreset?: string;
  customRoleName?: string;
  note?: string;
  isCurrentStudent?: boolean;
  canManageRoles?: boolean;
  canManageGroupProfile?: boolean;
};

export type DemoTeamGroup = {
  id: string;
  serialNo: number;
  customName?: string;
  displayName: string;
  name: string;
  topic: string;
  badgeTitle: string;
  badgeEmoji: string;
  badgeImage?: string;
  score: number;
  rank: number;
  members: DemoTeamMember[];
  joined?: boolean;
};

export type DemoTeamRankingSummary = {
  score: number;
  rank: number;
  total: number;
};

export type DemoTeamReviewTask = {
  id: string;
  title: string;
  role: '自评' | '互评';
  summary: string;
  status: '待完成' | '已完成';
  enabled: boolean;
  targetName?: string;
};

export type DemoTeamEvaluationPhase = '过程性评价' | '总结性评价';

export type DemoTeamEvaluationItem = {
  id: string;
  phase: DemoTeamEvaluationPhase;
  dimension: string;
  coreIndicator: string;
  scores: Array<{
    role: '学生自评' | '同学互评' | '老师评价' | '小组自评' | '专家评价';
    score: number;
  }>;
  note?: string;
};

export type DemoTeamReviewConfig = {
  allowSelfReview: boolean;
  allowPeerReview: boolean;
  evaluationItems?: DemoTeamEvaluationItem[];
  rubricItems: Array<{
    id: string;
    dimension: string;
    standard: string;
  }>;
  selfReviewTask: DemoTeamReviewTask;
  peerReviewTask: DemoTeamReviewTask;
};

export type DemoTeamDetail = {
  id: string;
  teamSummary: string;
  handbookTitle: string;
  groupName: string;
  groupRole: string;
  badge: string;
  joinMode: '授权码加入';
  joinCode: string;
  myMember: DemoTeamMember;
  myGroupId?: string;
  myRole: string;
  myRank: DemoTeamRankingSummary;
  myGroupRank: DemoTeamRankingSummary;
  handbookMaterials: DemoTeamHandbookMaterial[];
  groups: DemoTeamGroup[];
  reviewConfig: DemoTeamReviewConfig;
  personalRankings: DemoPersonalRanking[];
  groupRankings: DemoRanking[];
  selfReviewResult?: DemoReviewRubric;
  peerReviewResult?: DemoReviewRubric;
};

export type DemoTeamGroupOption = DemoTeamGroup;

export type DemoTeamRoleOption = {
  id: string;
  title: string;
  summary: string;
  active?: boolean;
};

export type DemoTeamBadge = {
  id: string;
  title: string;
  emoji: string;
  active?: boolean;
};

export type DemoReport = {
  id: string;
  teamId: string;
  title: string;
  status: string;
  publishedAt?: string;
  summary: string;
  certificateId?: string;
  certificateTitle?: string;
};

export type DemoPlazaContent = { id: string; title: string; summary: string; tag: string; path: string };

export type DemoPlazaCategory =
  | '科技'
  | '文艺'
  | '健康'
  | '商业'
  | '成长'
  | '创作';

export type DemoPlazaNewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  autoNext: boolean;
  audioDuration: string;
  paragraphs: string[];
};

export type DemoPlazaCourseNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type DemoPlazaCourseLesson = {
  id: string;
  title: string;
  duration: string;
  status: '已学完' | '学习中' | '待学习';
};

export type DemoPlazaCourse = {
  id: string;
  title: string;
  summary: string;
  tutor: string;
  isPreviewFree: boolean;
  progress: number;
  resumeHint: string;
  favorite?: boolean;
  shared?: boolean;
  chapters: DemoPlazaCourseLesson[];
  notes: DemoPlazaCourseNote[];
};

export type DemoPlazaChallenge = {
  id: string;
  title: string;
  mode: '个人挑战' | '团队挑战';
  summary: string;
  status: '进行中' | '待开始' | '已完成';
  targetPath: string;
};

export type DemoPlazaAgent = {
  id: string;
  title: string;
  shortTitle: string;
  logo: string;
  accent: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'pink';
  desc: string;
  expertName: string;
  expertAvatarOrLogo: string;
  operatorName?: string;
  oneLineIntro: string;
  companionModes: Array<'text' | 'voice' | 'image'>;
  tag: string;
  category: DemoPlazaCategory;
  recent?: boolean;
  desk?: boolean;
  subscribed?: boolean;
  scenes: string[];
  openPath: string;
  subscriptionSummary: string;
  news: DemoPlazaNewsItem[];
  courses: DemoPlazaCourse[];
  challenges: DemoPlazaChallenge[];
};

export type DemoFriend = {
  id: string;
  name: string;
  note: string;
  status: 'online' | 'offline';
  relation: '同学' | '家人' | '导师';
  unread?: number;
};

export type DemoChatMessage = {
  id: string;
  author: string;
  type: 'text' | 'voice' | 'image' | 'task';
  content: string;
  self?: boolean;
  time: string;
};

export type DemoMicrochatThread = {
  id: string;
  friendId: string;
  title: string;
  unread: number;
  lastMessage: string;
  messages: DemoChatMessage[];
};

export type DemoGroupChat = {
  id: string;
  title: string;
  badge: string;
  unread: number;
  members: string[];
  messages: DemoChatMessage[];
};

export type DemoMeeting = {
  id: string;
  title: string;
  status: '进行中' | '待开始' | '已结束';
  startedAt: string;
  participants: string[];
  summary: string;
};

export type DemoMoment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  liked?: boolean;
};

export type DemoWalletRecord = {
  id: string;
  title: string;
  amount: string;
  status: '成功' | '处理中';
  createdAt: string;
};

export type DemoCloudCategory = {
  id: string;
  title: string;
  count: number;
  icon: 'image' | 'video' | 'audio' | 'document';
};

export type DemoCloudFile = {
  id: string;
  categoryId: string;
  title: string;
  size: string;
  updatedAt: string;
  type: '图片' | '视频' | '音频' | '文档';
  source: '夸克网盘' | '百度网盘';
  preview: string;
};

export type DemoSosFlow = {
  recordingSeconds: number;
  sendMode: '自动发送' | '手动发送';
  recipients: string[];
};

export type DemoSettingItem = {
  id: string;
  title: string;
  summary: string;
  path: string;
};

export type DemoAlbumItem = {
  id: string;
  title: string;
  type: '照片' | '视频';
  capturedAt: string;
  previewLabel?: string;
  accent?: 'blue' | 'green' | 'orange' | 'purple';
  primaryLabel?: string;
  recognizedNames?: string[];
  identifySummary?: string;
  identifySource?: '拍照识别' | '关键帧识别';
  confidence?: number;
};

export type DemoFlashWork = {
  id: string;
  title: string;
  type: '语音闪记' | '视频闪记';
  duration: string;
  status: '草稿' | '已同步';
};

export type DemoRanking = {
  id: string;
  name: string;
  score: number;
  trend: 'up' | 'flat';
};

export type DemoPersonalRanking = {
  id: string;
  name: string;
  pending: number;
  completed: number;
  score: number;
  progress: number;
};

export type DemoReview = {
  id: string;
  title: string;
  role: '自评' | '互评';
  summary: string;
  status: '待完成' | '已完成';
};

export type DemoSelfTestPlane = {
  id: string;
  title: string;
  summary: string;
  elements: string[];
};

export type DemoSelfTestQuestion = {
  id: string;
  planeKey: 'self' | 'learning' | 'social' | 'future';
  elementKey: string;
  title: string;
  options: string[];
};

export type DemoGrowthRule = {
  id: string;
  group: '研学任务成长值' | '专家课程成长值' | '日常使用成长值';
  title: string;
  summary: string;
};

export type DemoGrowthMallItem = {
  id: string;
  title: string;
  type: '皮肤' | '道具' | '课程' | '优惠券' | '体验商品';
  cost: number;
  status: '可兑换' | '已兑换';
  exchangeNote: string;
};

export type DemoGrowthValueSummary = {
  total: number;
  available: number;
  used: number;
};

export type DemoSelfTestHistory = {
  id: string;
  reportType: '学员自测报告';
  planeTitle: string;
  planeKey: 'self' | 'learning' | 'social' | 'future' | 'all';
  element: string;
  score: number;
  latestIndex: number;
  average: number;
  totalScore: number;
  elementCount: number;
  testedAt: string;
};

export type DemoSelfTestSessionResult = {
  planeId: string;
  planeTitle: string;
  elements: Array<{
    elementKey: string;
    score: number;
    latestIndex: number;
    average: number;
  }>;
  totalScore: number;
  completedAt: string;
};

export type DemoSelfTestReport = {
  id: string;
  reportType: '学员自测报告';
  planeId: string;
  planeTitle: string;
  totalScore: number;
  completedAt: string;
  elementCount: number;
  rows: Array<{
    elementKey: string;
    score: number;
    latestIndex: number;
    average: number;
  }>;
};

export type DemoDiary = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

export type DemoFavorite = {
  id: string;
  title: string;
  type: '课程' | '知识卡' | '作品';
  summary: string;
};

export const demoTasks: DemoTask[] = [
  {
    id: 'task_demo_01',
    title: '观察海洋生物',
    description: '把观察、打卡、寻宝、创作、问答、调查都变成可提交的海洋生物挑战。',
    intro: '围绕海豚、海狮或水母完成观察、问答、打卡、寻宝、创作和调查，让现场发现变成更有趣、更完整的研学作品。',
    taskType: '团队研学活动',
    taskDescription: '在海洋馆主馆区完成生物观察，记录典型行为与现场证据，形成个人观察作品。',
    status: 'in_progress',
    dueAt: now,
    category: 'study',
    target: '个人',
    requirement: '完成观察记录、AI 探究、竞速打卡、寻宝收集、创作研究、问答挑战和现场调查。',
    infoSummary: '海洋馆主馆区 · 个人观察任务',
    worksSubmitted: 1,
    worksRequired: 7,
    score: 95,
    rating: 'A',
    sequence: 1,
    timeLimit: '今天 16:30 前',
    capabilityTags: ['观察能力', '提问能力', '科学素养', '表达能力', '探究能力'],
    capabilityTagSource: 'ai',
    taskSheets: [
      {
        id: 'sheet_demo_01',
        title: '闪记观察：海豚行为记录',
        topicType: '闪记',
        workCategory: '观察型',
        workMode: '独立完成',
        workKind: 'flash_note',
        requirement: '用闪记记录海豚行为，可以补充照片、语音、文字或视频。',
        mediaTypes: ['照片', '文字'],
        status: '已完成',
        submissionStatus: '已提交',
        workForm: [
          { id: 'sheet_01_observe', kind: 'fill_blank', label: '观察到了什么行为', placeholder: '例如：海豚会并排游动后再跃出水面', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_01_reason', kind: 'fill_blank', label: '你觉得这个行为说明了什么', placeholder: '写出你的判断或感受', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_01_photo', kind: 'image_upload', label: '上传观察照片', helper: '至少 1 张能看清行为的照片', limitText: '最多上传 2 张', required: false, tools: ['identify', 'camera', 'checkin'] },
        ],
      },
      {
        id: 'sheet_demo_01_ai',
        title: 'AI探究过程证明',
        topicType: 'AI 探究',
        workCategory: '探究型',
        workMode: '独立完成',
        workKind: 'ai_link',
        requirement: '提交 1 条问问/AI识物/AI创作过程链接或截图，并写下 AI 帮你发现的新问题。',
        mediaTypes: ['链接', '照片', '文字'],
        status: '进行中',
        submissionStatus: '待填写',
        workForm: [
          {
            id: 'sheet_01_ai_link',
            kind: 'link_upload',
            label: 'AI探究或创作链接',
            helper: '可粘贴问问、AI识物、AI绘图、AI视频等过程链接',
            tools: ['ask'],
          },
          {
            id: 'sheet_01_ai_question',
            kind: 'fill_blank',
            label: 'AI帮你发现了什么新问题',
            placeholder: '例如：为什么海豚能听懂训练员的手势？',
            tools: ['ask', 'flash_note', 'voice_text'],
          },
          {
            id: 'sheet_01_ai_screenshot',
            kind: 'image_upload',
            label: '上传AI过程截图',
            helper: '可上传 AI 对话、AI识物或AI创作截图',
            limitText: '最多上传 2 张',
            required: false,
            tools: ['identify', 'ai_draw', 'camera'],
          },
        ],
      },
      {
        id: 'sheet_demo_01_checkin',
        title: '竞速打卡：找到海豚主池',
        topicType: '打卡记录',
        workCategory: '打卡型',
        workMode: '独立完成',
        workKind: 'checkin_treasure',
        gameplayKind: 'speed_checkin',
        requirement: '在 8 分钟内找到海豚主池或主池标志牌，完成带时间和地点的拍照打卡。',
        mediaTypes: ['照片', '文字', '定位打卡'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_01_checkin_photo', kind: 'image_upload', label: '上传主池打卡照片', helper: '照片需带地点和时间水印', limitText: '上传 1 张图片', required: false, tools: ['checkin', 'camera'] },
          { id: 'sheet_01_checkin_mark', kind: 'fill_blank', label: '你找到的标志物是什么', placeholder: '例如：海豚主池蓝色入口牌', tools: ['ask', 'flash_note', 'voice_text'] },
        ],
      },
      {
        id: 'sheet_demo_01_treasure',
        title: '寻宝收集：找到 3 个海豚线索',
        topicType: '寻宝收集',
        workCategory: '探究型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'treasure_collect',
        requirement: '寻找 3 个与海豚有关的线索，至少拍照上传 2 个，并写出收集进度。',
        mediaTypes: ['照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_01_treasure_photo', kind: 'image_upload', label: '上传海豚线索照片', helper: '可以是科普牌、标本、互动装置', limitText: '最多上传 3 张', required: false, tools: ['identify', 'camera'] },
          { id: 'sheet_01_treasure_progress', kind: 'fill_blank', label: '收集进度', placeholder: '例如：已找到 2/3 个线索', tools: ['ask', 'flash_note', 'voice_text'] },
          {
            id: 'sheet_01_treasure_kind',
            kind: 'multiple_choice',
            label: '你找到了哪些线索',
            options: ['科普标牌', '海豚动作', '互动装置', '导师提示'],
            tools: ['ask'],
          },
        ],
      },
      {
        id: 'sheet_demo_01_creative',
        title: '创作研究：设计海豚守护海报',
        topicType: '创作地图',
        workCategory: '创作型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'creative_research',
        requirement: '根据观察结果完成一张海豚守护海报，可用 AI 绘图、AI 视频辅助构思并上传作品。',
        mediaTypes: ['照片', '视频', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_01_creative_idea', kind: 'fill_blank', label: '你的创作主题', placeholder: '例如：安静观演，守护海豚沟通环境', tools: ['ask', 'ai_draw', 'ai_video', 'flash_note', 'voice_text'] },
          { id: 'sheet_01_creative_image', kind: 'image_upload', label: '上传创作作品', helper: '可以上传手绘海报或 AI 绘图作品', limitText: '最多上传 2 张', required: false, tools: ['ai_draw', 'camera'] },
          { id: 'sheet_01_creative_video', kind: 'video_upload', label: '上传创作说明视频', helper: '可选，用 15 秒说明你的设计想法', limitText: '上传 1 段视频', required: false, tools: ['ai_video'] },
        ],
      },
      {
        id: 'sheet_demo_01_qa',
        title: '问答挑战：海豚为什么会配合表演',
        topicType: '问答',
        workCategory: '研究型',
        workMode: '独立完成',
        workKind: 'flash_note',
        gameplayKind: 'qa_research',
        requirement: '研究后用录音和照片回答：海豚为什么能和训练员配合完成表演动作？',
        mediaTypes: ['音频', '照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_01_qa_answer', kind: 'fill_blank', label: '你的研究答案', placeholder: '写出你的判断，并说明你从哪里看出来', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_01_qa_audio', kind: 'audio_upload', label: '上传语音答案', helper: '可用闪记录制一段研究回答', limitText: '上传 1 段音频', required: false, tools: ['flash_note'] },
          { id: 'sheet_01_qa_photo', kind: 'image_upload', label: '上传支持答案的照片', helper: '拍下训练动作、手势或现场提示牌', limitText: '上传 1 张图片', required: false, tools: ['identify', 'camera'] },
        ],
      },
      {
        id: 'sheet_demo_01_survey',
        title: '现场调查：哪种观察证据最有用',
        topicType: '调查',
        workCategory: '论证型',
        workMode: '独立完成',
        workKind: 'rich_text',
        gameplayKind: 'survey',
        requirement: '比较照片、语音、AI 识图和现场笔记，选出你认为最有用的观察证据并说明理由。',
        mediaTypes: ['文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          {
            id: 'sheet_01_survey_choice',
            kind: 'single_choice',
            label: '你认为哪种观察证据最有用',
            options: ['连续观察照片', '语音闪记', 'AI识图结果', '现场文字记录'],
            tools: ['ask'],
          },
          { id: 'sheet_01_survey_reason', kind: 'fill_blank', label: '选择理由', placeholder: '写出它为什么最能帮助你完成任务', tools: ['ask', 'flash_note', 'voice_text'] },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_01',
        title: 'AI 行前指导',
        type: 'ai',
        summary: '点击后进入 AI 对话框，按统一提示词生成适合本次活动的行前指导。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“海豚行为观察”研学活动生成一份行前指导资源，面向学生和家长，内容包含活动概述、行前准备、学生注意事项、家长配合事项、带队老师检查清单、安全提醒和活动收获引导。要求语言正式但容易理解，内容具体可执行。',
      },
      {
        id: 'resource_demo_01',
        title: '海豚观察提示卡',
        type: 'doc',
        summary: '先看海豚互动动作，再记录时间点与观察线索。',
        previewMode: 'doc',
        docSections: [
          {
            title: '动作观察卡',
            imageLabel: '动作示意图',
            description: '先观察海豚是单独行动还是结伴行动，再记录跃出水面的时间点。',
            accent: 'blue',
          },
          {
            title: '证据拍摄卡',
            imageLabel: '取景示意图',
            description: '拍照时尽量让海豚和主池边缘一起入镜，方便后续说明观察位置。',
            accent: 'green',
          },
          {
            title: '感想整理卡',
            imageLabel: '观察笔记示意',
            description: '从“看到什么、想到什么、还想知道什么”三个角度整理你的观察。',
            accent: 'orange',
          },
        ],
      },
      {
        id: 'resource_demo_02',
        title: '海洋馆观察任务说明',
        type: 'pdf',
        summary: '任务前必读，包含观察步骤、馆区路线和安全提醒。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 观察流程',
            pageHint: '进馆后先集合，再开始个人观察。',
            blocks: [
              { title: '流程', content: '集合确认 -> 阅读提示卡 -> 进入主池区观察 -> 拍摄证据 -> 整理学习作品', tone: 'table' },
              { title: '提醒', content: '表演开始前先找好固定观察点，不要频繁走动。', tone: 'tip' },
            ],
          },
          {
            pageTitle: '第 2 页 · 观察记录表',
            pageHint: '记录时间点、动作特征和你的判断。',
            blocks: [
              { title: '记录表', content: '时间点 | 动作表现 | 可能原因 | 对应照片编号', tone: 'table' },
              { content: '示例：13:20 | 两只海豚同时跃起 | 可能是在配合训练 | 照片 01', tone: 'paragraph' },
            ],
          },
          {
            pageTitle: '第 3 页 · 安全提醒',
            pageHint: '靠近水池边缘时注意和导师保持视线联系。',
            blocks: [
              { content: '不要把手伸入围栏；拍照时身体不要前倾；发现人群拥挤时先退到安全线后。', tone: 'tip' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'task_demo_02',
    title: '环保倡议卡',
    description: '整理你的小组观点，提交给导师。',
    intro: '以小组为单位完成环保倡议展示，先统一观点，再共同提交倡议内容与视觉作品。',
    taskType: '团队研学活动',
    taskDescription: '围绕海洋环保主题完成小组倡议，输出倡议感想、创作地图和主题海报三项作品。',
    status: 'in_progress',
    dueAt: now,
    category: 'project',
    target: '小组',
    requirement: '写清倡议主题、口号和 2 条行动建议。',
    infoSummary: '海洋馆出口区域 · 小组协作任务',
    worksSubmitted: 1,
    worksRequired: 3,
    score: 88,
    rating: 'B',
    sequence: 2,
    timeLimit: '今天 17:00 前',
    capabilityTags: ['合作能力', '创新能力', '表达能力', '环境意识', '协作能力'],
    capabilityTagSource: 'manual',
    taskSheets: [
      {
        id: 'sheet_demo_02',
        title: '环保倡议感想',
        topicType: '感想',
        workCategory: '学习型',
        workMode: '独立完成',
        workKind: 'rich_text',
        requirement: '每位组员补充 1 条环保倡议感想，可语音转文字。',
        mediaTypes: ['文字'],
        status: '进行中',
        submissionStatus: '待提交',
        workForm: [
          { id: 'sheet_02_theme', kind: 'fill_blank', label: '倡议主题', placeholder: '例如：减少一次性塑料' },
          { id: 'sheet_02_slogan', kind: 'fill_blank', label: '倡议口号', placeholder: '用一句短句说清你的倡议' },
          {
            id: 'sheet_02_action',
            kind: 'single_choice',
            label: '你最想先推动哪一条行动建议',
            options: ['自带水杯和餐具', '按区域分类回收垃圾', '减少景区一次性包装', '提醒同伴文明参观'],
          },
        ],
      },
      {
        id: 'sheet_demo_03',
        title: '倡议创作地图',
        topicType: '创作地图',
        workCategory: '创作型',
        workMode: '小组协作',
        workKind: 'image',
        requirement: '共同绘制倡议地图，上传照片并补充 3 条说明。',
        mediaTypes: ['照片', '文字'],
        status: '进行中',
        submissionStatus: '已提交',
        workForm: [
          { id: 'sheet_03_title', kind: 'fill_blank', label: '地图主题', placeholder: '例如：海洋馆低塑行动图' },
          { id: 'sheet_03_spot', kind: 'fill_blank', label: '需要重点改进的馆区位置', placeholder: '写出区域和原因' },
          {
            id: 'sheet_03_reason',
            kind: 'multiple_choice',
            label: '这张创作地图主要表达了哪些倡议重点',
            options: ['垃圾分类', '减少塑料', '文明观演', '节约用水'],
          },
          { id: 'sheet_03_photo', kind: 'image_upload', label: '上传创作地图照片', helper: '拍清楚文字与路线标注', limitText: '最多上传 3 张', required: false },
        ],
      },
      {
        id: 'sheet_demo_04',
        title: '主题海报画作',
        topicType: '讲解视频',
        workCategory: '创作型',
        workMode: '小组协作',
        workKind: 'explain_video',
        requirement: '完成海报画作并拍摄 1 段 15 秒解说视频。',
        mediaTypes: ['照片', '视频', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_04_title', kind: 'fill_blank', label: '海报主题', placeholder: '写出海报想传达的主题' },
          { id: 'sheet_04_copy', kind: 'fill_blank', label: '海报主文案', placeholder: '写一句最醒目的宣传语' },
          {
            id: 'sheet_04_focus',
            kind: 'multiple_choice',
            label: '海报准备突出哪些内容',
            options: ['海洋动物保护', '减少垃圾', '文明参观', '小组分工成果'],
          },
          { id: 'sheet_04_photo', kind: 'image_upload', label: '上传海报照片', helper: '没有照片也可以先提交其他内容', limitText: '最多上传 2 张', required: false },
          { id: 'sheet_04_video', kind: 'video_upload', label: '上传解说视频', helper: '没有视频也可以先提交海报内容', limitText: '上传 1 段视频', required: false },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_02',
        title: 'AI 倡议表达助手',
        type: 'ai',
        summary: '根据小组环保主题生成倡议文案、口号和行动建议。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“环保倡议卡”团队研学活动生成一份环保倡议资源，内容包含倡议主题、问题发现、倡议口号、两条行动建议、小组分工提示和展示表达稿。要求适合小学生小组协作，语言有感染力但不夸张。',
      },
      {
        id: 'resource_demo_03',
        title: '环保倡议案例',
        type: 'doc',
        summary: '查看适合儿童研学场景的倡议表达结构和示例。',
        previewMode: 'doc',
        docSections: [
          {
            title: '案例一：低塑观演',
            imageLabel: '案例海报 01',
            description: '用“先发现问题，再给出行动建议”的结构写倡议，适合低年级学生模仿。',
            accent: 'green',
          },
          {
            title: '案例二：海洋垃圾分类',
            imageLabel: '案例海报 02',
            description: '通过路线图标注垃圾高发点，帮助小组把观察和行动建议对应起来。',
            accent: 'blue',
          },
          {
            title: '案例三：小组口号设计',
            imageLabel: '口号排版示意',
            description: '口号要短、容易记，最好和画面里的主图形成呼应。',
            accent: 'purple',
          },
        ],
      },
      {
        id: 'resource_demo_04',
        title: '倡议卡模板资源包',
        type: 'pdf',
        summary: '包含倡议卡模板、填写示例和提交格式要求。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 倡议卡结构',
            pageHint: '先定主题，再补行动建议。',
            blocks: [
              { title: '模板栏位', content: '主题 | 口号 | 问题发现 | 行动建议 1 | 行动建议 2', tone: 'table' },
              { content: '建议每个栏位都尽量使用短句表达，方便展示在海报上。', tone: 'paragraph' },
            ],
          },
          {
            pageTitle: '第 2 页 · 提交示例',
            pageHint: '图文和视频内容要相互对应。',
            blocks: [
              { title: '图片要求', content: '海报正面清晰入镜，文字无遮挡，建议横向拍摄。', tone: 'paragraph' },
              { title: '视频要求', content: '1 人讲解，其他同学持图，15 秒内说明主题与亮点。', tone: 'table' },
            ],
          },
          {
            pageTitle: '第 3 页 · 评价维度',
            pageHint: '作品提交后可直接查看和重新填写。',
            blocks: [
              { title: '作品项', content: '内容完整度 | 表达清晰度 | 小组协作度 | 现场证据真实性', tone: 'table' },
              { content: '完成作品后可直接查看作品详情，如需补充内容可重新填写并覆盖更新。', tone: 'tip' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'task_demo_03',
    title: '今日步行打卡',
    description: '完成研学路线 1200 米步行记录。',
    intro: '按路线完成步行打卡，用语音或图文方式记录步行观察结果。',
    taskType: '家庭研学活动',
    taskDescription: '在家庭陪同下完成步行打卡与沿途观察，提交路线截图和步行观察记录。',
    status: 'todo',
    dueAt: now,
    category: 'daily',
    target: '个人',
    requirement: '完成路线后上传步行截图或语音说明。',
    infoSummary: '馆区步行路线 · 日常任务',
    worksSubmitted: 0,
    worksRequired: 1,
    score: 0,
    sequence: 3,
    timeLimit: '今天 18:00 前',
    capabilityTags: ['身体健康', '适应能力', '实践能力', '环境意识', '自主学习'],
    capabilityTagSource: 'ai',
    taskSheets: [
      {
        id: 'sheet_demo_05',
        title: '步行观察记录',
        topicType: '打卡记录',
        workCategory: '打卡型',
        workMode: '独立完成',
        workKind: 'checkin_treasure',
        requirement: '提交 1 张路线截图，并写 1 条沿途观察。',
        mediaTypes: ['照片', '文字', '定位打卡'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_05_photo', kind: 'image_upload', label: '上传步行路线截图', helper: '截图里尽量带上时间和路线', limitText: '上传 1 张图片', required: false },
          { id: 'sheet_05_find', kind: 'fill_blank', label: '沿途观察到了什么', placeholder: '写一句步行中最明显的发现' },
          {
            id: 'sheet_05_feel',
            kind: 'single_choice',
            label: '今天的步行体验更像哪一种',
            options: ['轻松完成', '有点累但坚持完成', '需要同伴提醒', '还想再走一段'],
          },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_03',
        title: 'AI 活动路线图',
        type: 'ai',
        summary: '根据活动地点、任务和打卡要求，智能生成一份路线图说明。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“海洋馆步行打卡”研学活动生成一份活动路线图说明，内容包含路线总览、时间安排、站点顺序、每个站点活动内容、转场提醒、安全注意事项和带队老师执行清单。要求路线清晰、时间安排合理，信息不足时用“待补充”标记。',
      },
      {
        id: 'resource_demo_doc_03',
        title: '步行观察提示卡',
        type: 'doc',
        summary: '帮助学生在步行中记录路线、环境变化和安全提醒。',
        previewMode: 'doc',
        docSections: [
          {
            title: '路线记录',
            imageLabel: '路线草图',
            description: '每经过一个打卡点，记录当前位置、看到的标志物和下一站方向。',
            accent: 'blue',
          },
          {
            title: '沿途观察',
            imageLabel: '观察提示',
            description: '关注人流、指示牌、场馆声音和环境变化，选择一个最明显的发现写下来。',
            accent: 'green',
          },
          {
            title: '安全提醒',
            imageLabel: '同行示意',
            description: '保持小组同行，不边走边低头操作设备，需要拍照时先停在安全位置。',
            accent: 'orange',
          },
        ],
      },
      {
        id: 'resource_demo_05',
        title: '步行路线说明',
        type: 'pdf',
        summary: '查看打卡点位、路线和安全提示。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 路线总览',
            pageHint: '按 3 个打卡点完成步行。',
            blocks: [
              { title: '路线', content: '起点集合处 -> 海豚馆侧道 -> 出口广场 -> 回到集合点', tone: 'table' },
            ],
          },
          {
            pageTitle: '第 2 页 · 打卡提醒',
            pageHint: '每到一个点位都停留 30 秒观察。',
            blocks: [
              { content: '打卡时先看周围有什么变化，再拍一张最能说明环境特点的图片。', tone: 'paragraph' },
              { content: '步行途中不要单独离队。', tone: 'tip' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'task_demo_04',
    title: '海狮馆声音采样',
    description: '用闪记、问问、识图和创作图研究声音变化。',
    intro: '在海狮馆内完成声音采样、声音问答和变化图创作，对比不同环节声音强弱和环境变化。',
    taskType: '团队研学活动',
    taskDescription: '围绕海狮表演的不同环节采集声音样本，并通过图文整理声音变化特征。',
    status: 'todo',
    dueAt: now,
    category: 'study',
    target: '个人',
    requirement: '完成声音闪记、声音问答、竞速打卡和声音变化创作图。',
    infoSummary: '海狮馆 · 声音观察任务',
    worksSubmitted: 0,
    worksRequired: 4,
    score: 0,
    sequence: 4,
    timeLimit: '今天 17:40 前',
    capabilityTags: ['提问能力', '科学素养', '探究能力', '快速学习', '观察能力'],
    capabilityTagSource: 'ai',
    taskSheets: [
      {
        id: 'sheet_demo_06',
        title: '闪记采样：表演前环境声音',
        topicType: '闪记',
        workCategory: '观察型',
        workMode: '独立完成',
        workKind: 'flash_note',
        requirement: '用闪记记录表演前环境声音，可包含语音、文字、照片或视频。',
        mediaTypes: ['文字', '音频'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_06_audio', kind: 'audio_upload', label: '上传环境声音', helper: '可用新建闪记保存录音，也可选择已有闪记', limitText: '上传 1 段音频', required: false, tools: ['flash_note'] },
          { id: 'sheet_06_scene', kind: 'fill_blank', label: '表演前听到了什么声音', placeholder: '例如：观众交谈声、提示广播声', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_06_change', kind: 'fill_blank', label: '你觉得这些声音说明了什么', placeholder: '写出你的判断', tools: ['ask', 'flash_note', 'voice_text'] },
          {
            id: 'sheet_06_loudness',
            kind: 'single_choice',
            label: '表演前整体声音强弱',
            options: ['很安静', '比较平稳', '逐渐变大', '已经很热闹'],
            tools: ['ask'],
          },
        ],
      },
      {
        id: 'sheet_demo_06_qa',
        title: '问答挑战：声音为什么会变大',
        topicType: '问答',
        workCategory: '研究型',
        workMode: '独立完成',
        workKind: 'flash_note',
        gameplayKind: 'qa_research',
        requirement: '研究后用录音和照片回答：为什么表演开始后声音会明显变大？',
        mediaTypes: ['音频', '照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_06_qa_answer', kind: 'fill_blank', label: '你的研究答案', placeholder: '写出声音变大的原因', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_06_qa_audio', kind: 'audio_upload', label: '上传语音答案', helper: '可用闪记录制一段回答', limitText: '上传 1 段音频', required: false, tools: ['flash_note'] },
          { id: 'sheet_06_qa_photo', kind: 'image_upload', label: '上传现场证据照片', helper: '拍下音响、观众区或表演环节', limitText: '上传 1 张图片', required: false, tools: ['identify', 'camera'] },
        ],
      },
      {
        id: 'sheet_demo_07',
        title: '创作研究：声音变化图',
        topicType: '创作地图',
        workCategory: '研究型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'creative_research',
        requirement: '用图文或 AI 绘图展示声音变化节奏。',
        mediaTypes: ['照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_07_peak', kind: 'fill_blank', label: '声音最大的时候发生了什么', placeholder: '写出当时的场景', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_07_reason', kind: 'fill_blank', label: '你认为声音变化和什么有关', placeholder: '例如：动作、灯光、观众互动', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_07_image', kind: 'image_upload', label: '上传声音变化图', helper: '可以是手绘图、AI 绘图或表格拍照', limitText: '上传 1 张图片', required: false, tools: ['ai_draw', 'camera', 'identify'] },
        ],
      },
      {
        id: 'sheet_demo_07_checkin',
        title: '竞速打卡：找到最佳录音点',
        topicType: '打卡记录',
        workCategory: '打卡型',
        workMode: '独立完成',
        workKind: 'checkin_treasure',
        gameplayKind: 'speed_checkin',
        requirement: '根据任务说明在 5 分钟内找到你认为最适合录音的位置，拍照打卡并写出判断依据。',
        mediaTypes: ['照片', '文字', '定位打卡'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_07_checkin_photo', kind: 'image_upload', label: '上传录音点照片', helper: '照片需带地点和时间水印', limitText: '上传 1 张图片', required: false, tools: ['checkin', 'camera'] },
          { id: 'sheet_07_checkin_reason', kind: 'fill_blank', label: '你为什么选这里录音', placeholder: '例如：这里既能听到表演声，也能听到观众反应', tools: ['ask', 'flash_note', 'voice_text'] },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_04',
        title: 'AI 声音采样方案',
        type: 'ai',
        summary: '根据海狮馆任务自动生成声音采样步骤和记录建议。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“海狮馆声音采样”研学活动生成一份声音采样资源，内容包含采样目标、采样位置、记录方法、问答引导、声音变化图整理建议和安全提醒。要求适合学生现场使用，步骤清楚。',
      },
      {
        id: 'resource_demo_06',
        title: '声音采样方法',
        type: 'doc',
        summary: '告诉学员如何录音、如何记录声音变化。',
        previewMode: 'doc',
        docSections: [
          {
            title: '采样位置建议',
            imageLabel: '站位示意',
            description: '选择靠近导师、远离音响正前方的位置，便于观察又不会被过大音量干扰。',
            accent: 'blue',
          },
          {
            title: '记录表样式',
            imageLabel: '声音变化表',
            description: '把“时间点、声音来源、变化原因”做成三列，后续更容易整理成学习作品。',
            accent: 'orange',
          },
        ],
      },
      {
        id: 'resource_demo_pdf_04',
        title: '海狮馆声音任务单',
        type: 'pdf',
        summary: '包含声音采样流程、记录表和提交要求。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 采样流程',
            pageHint: '按表演前、表演中、表演后三个阶段记录。',
            blocks: [
              { title: '流程', content: '到达录音点 -> 试听环境声 -> 开始闪记 -> 标注时间点 -> 提交声音变化图', tone: 'table' },
              { title: '提醒', content: '录音时不要靠近音响设备，不影响他人通行。', tone: 'tip' },
            ],
          },
          {
            pageTitle: '第 2 页 · 记录表',
            pageHint: '记录声音强弱、来源和你的判断。',
            blocks: [
              { title: '记录表', content: '时间 | 声音来源 | 强弱变化 | 可能原因 | 证据编号', tone: 'table' },
              { content: '示例：14:05 | 观众掌声 | 明显变强 | 表演开始 | 音频 01', tone: 'paragraph' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'task_demo_05',
    title: '家庭观察日记',
    description: '家庭自然寻宝、调查和创作研究都在这里完成。',
    intro: '围绕家庭周边自然观察或基地打卡，完成自然寻宝、现场调查、观察感想和创作作品。',
    taskType: '家庭研学活动',
    taskDescription: '本次活动由家长协助陪同完成，学生需要记录观察过程并提交家庭研学感想。',
    status: 'in_progress',
    dueAt: now,
    category: 'study',
    target: '个人',
    requirement: '完成家庭观察感想、自然寻宝、现场调查、问答挑战和观察创作。',
    infoSummary: '社区自然观察点 · 家庭研学活动',
    worksSubmitted: 0,
    worksRequired: 5,
    score: 76,
    rating: 'B',
    sequence: 5,
    timeLimit: '今晚 20:00 前',
    capabilityTags: ['独立自主', '勤于反思', '表达能力', '审美能力', '尊重生命'],
    capabilityTagSource: 'manual',
    taskSheets: [
      {
        id: 'sheet_demo_08',
        title: '闪记日记：家庭观察感想',
        topicType: '感想',
        workCategory: '观察型',
        workMode: '独立完成',
        workKind: 'rich_text',
        requirement: '用闪记和问问整理本次家庭观察最深的 3 个发现。',
        mediaTypes: ['文字'],
        status: '进行中',
        submissionStatus: '待提交',
        workForm: [
          { id: 'sheet_08_find_1', kind: 'fill_blank', label: '发现一', placeholder: '写一个你最先观察到的现象', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_08_find_2', kind: 'fill_blank', label: '发现二', placeholder: '再写一个你觉得特别的地方', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_08_find_3', kind: 'fill_blank', label: '发现三', placeholder: '写一个你回家后还记得的画面', tools: ['ask', 'flash_note', 'voice_text'] },
          {
            id: 'sheet_08_mood',
            kind: 'single_choice',
            label: '这次家庭观察更像哪种体验',
            options: ['安静观察', '边走边讨论', '家长带着一起分析', '自己主导记录'],
            tools: ['ask'],
          },
        ],
      },
      {
        id: 'sheet_demo_08_treasure',
        title: '寻宝收集：找到 3 个自然线索',
        topicType: '寻宝收集',
        workCategory: '探究型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'treasure_collect',
        requirement: '在社区或家庭研学点寻找 3 个自然线索，拍照上传并写出收集进度。',
        mediaTypes: ['照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_08_treasure_photo', kind: 'image_upload', label: '上传自然线索照片', helper: '可以是植物、昆虫、水边痕迹、标识牌', limitText: '最多上传 3 张', required: false, tools: ['identify', 'camera'] },
          { id: 'sheet_08_treasure_progress', kind: 'fill_blank', label: '收集进度', placeholder: '例如：已找到 2/3 个自然线索', tools: ['ask', 'flash_note', 'voice_text'] },
          {
            id: 'sheet_08_treasure_kind',
            kind: 'multiple_choice',
            label: '你找到了哪些自然线索',
            options: ['植物叶片', '昆虫活动', '水边痕迹', '科普标识'],
            tools: ['ask'],
          },
        ],
      },
      {
        id: 'sheet_demo_08_survey',
        title: '现场调查：哪种观察方式最有效',
        topicType: '调查',
        workCategory: '论证型',
        workMode: '独立完成',
        workKind: 'rich_text',
        gameplayKind: 'survey',
        requirement: '家庭研学后选择你认为最有效的观察方式，并补充理由。',
        mediaTypes: ['文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          {
            id: 'sheet_08_survey_choice',
            kind: 'single_choice',
            label: '你认为哪种观察方式最有效',
            options: ['安静观察 5 分钟', '边拍照边记录', '请家长提问', '先问问再验证'],
            tools: ['ask'],
          },
          { id: 'sheet_08_survey_reason', kind: 'fill_blank', label: '选择理由', placeholder: '写出你为什么选择这种方式', tools: ['ask', 'flash_note', 'voice_text'] },
        ],
      },
      {
        id: 'sheet_demo_09',
        title: '创作研究：家庭观察画作',
        topicType: '画作',
        workCategory: '创作型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'creative_research',
        requirement: '根据家庭观察完成一张创作，可以用 AI 绘图或拍照上传作品。',
        mediaTypes: ['照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_09_photo', kind: 'image_upload', label: '上传观察画作', helper: '画面要完整清晰，可上传手绘或 AI 绘图', limitText: '上传 1 张图片', required: false, tools: ['ai_draw', 'camera', 'identify'] },
          { id: 'sheet_09_desc', kind: 'fill_blank', label: '一句作品说明', placeholder: '说说你为什么这样画', tools: ['ask', 'ai_draw', 'flash_note', 'voice_text'] },
        ],
      },
      {
        id: 'sheet_demo_09_qa',
        title: '问答挑战：为什么这里最值得继续观察',
        topicType: '问答',
        workCategory: '研究型',
        workMode: '独立完成',
        workKind: 'flash_note',
        gameplayKind: 'qa_research',
        requirement: '根据家庭研学研究后，用录音和照片回答：为什么这个观察点最值得继续观察？',
        mediaTypes: ['音频', '照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_09_qa_answer', kind: 'fill_blank', label: '你的观察答案', placeholder: '写出你为什么认为这里值得继续观察', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_09_qa_audio', kind: 'audio_upload', label: '上传语音答案', helper: '可用语音闪记保存研究回答', limitText: '上传 1 段音频', required: false, tools: ['flash_note'] },
          { id: 'sheet_09_qa_photo', kind: 'image_upload', label: '上传现场证据照片', helper: '拍下能支持判断的观察点或现象', limitText: '上传 1 张图片', required: false, tools: ['identify', 'camera'] },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_05',
        title: 'AI 家庭观察指导',
        type: 'ai',
        summary: '根据家庭观察场景生成家长提问、学生记录和作品整理建议。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“家庭观察日记”研学活动生成一份家庭观察指导资源，内容包含观察步骤、家长提问建议、学生记录模板、自然线索收集方法、作品整理建议和安全提醒。要求亲子共用，表达温和清楚。',
      },
      {
        id: 'resource_demo_07',
        title: '家庭观察指南',
        type: 'pdf',
        summary: '家长陪同观察流程、提问建议和安全提醒。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 家长陪同步骤',
            pageHint: '先观察，再提问，最后整理学习作品。',
            blocks: [
              { title: '流程', content: '一起观察 5 分钟 -> 家长提问 -> 学生回答 -> 拍照记录 -> 填写感想', tone: 'table' },
            ],
          },
          {
            pageTitle: '第 2 页 · 提问建议',
            pageHint: '问题要具体，帮助孩子说出证据。',
            blocks: [
              { content: '你刚刚看到的变化是什么？你是从哪里看出来的？如果明天再来，你还想观察什么？', tone: 'paragraph' },
            ],
          },
        ],
      },
      {
        id: 'resource_demo_08',
        title: '感想写作提示卡',
        type: 'doc',
        summary: '帮助学生从看到、想到、做到三个角度整理内容。',
        previewMode: 'doc',
        docSections: [
          {
            title: '看到什么',
            imageLabel: '观察提示图',
            description: '先写你最确定的现象，不要一上来就写结论。',
            accent: 'blue',
          },
          {
            title: '想到什么',
            imageLabel: '思考提示图',
            description: '把现象和已有知识联系起来，说出你的理解。',
            accent: 'purple',
          },
          {
            title: '想怎么做',
            imageLabel: '行动提示图',
            description: '补一句你之后还想继续观察或改进的方向。',
            accent: 'green',
          },
        ],
      },
    ],
  },
  {
    id: 'task_demo_06',
    title: '海洋馆导览地图',
    description: '整理导览路线并完成创作地图填写。',
    intro: '围绕海洋馆多个场馆的参观顺序与重点内容，完成个人导览地图和知识点整理。',
    taskType: '团队研学活动',
    taskDescription: '本次活动聚焦海洋馆导览路线规划，要求学生用创作地图记录重点场馆与观察收获。',
    status: 'todo',
    dueAt: now,
    category: 'project',
    target: '个人',
    requirement: '提交 1 张导览创作地图和 1 条路线说明。',
    infoSummary: '海洋馆全馆导览 · 路线规划活动',
    worksSubmitted: 0,
    worksRequired: 2,
    score: 0,
    sequence: 6,
    timeLimit: '今天 19:00 前',
    capabilityTags: ['逻辑思维', '资源整合', '表达能力', '创新能力', '快速学习'],
    capabilityTagSource: 'manual',
    taskSheets: [
      {
        id: 'sheet_demo_10',
        title: '导览创作地图',
        topicType: '创作地图',
        workCategory: '创作型',
        workMode: '独立完成',
        workKind: 'image',
        requirement: '以创作地图形式呈现场馆路线与重点展区。',
        mediaTypes: ['照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_10_map', kind: 'image_upload', label: '上传导览创作地图', helper: '拍清路线和标注', limitText: '上传 1 张图片', required: false },
          { id: 'sheet_10_key', kind: 'fill_blank', label: '最重要的展区', placeholder: '写出一个你最想推荐的展区' },
          { id: 'sheet_10_reason', kind: 'fill_blank', label: '推荐理由', placeholder: '说说为什么推荐这里' },
        ],
      },
      {
        id: 'sheet_demo_11',
        title: '路线说明',
        topicType: '感想',
        workCategory: '记录型',
        workMode: '独立完成',
        workKind: 'rich_text',
        requirement: '写 1 段路线说明，介绍你的导览顺序和理由。',
        mediaTypes: ['文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_11_order', kind: 'fill_blank', label: '你的导览顺序', placeholder: '按照先后顺序写出路线' },
          {
            id: 'sheet_11_strategy',
            kind: 'single_choice',
            label: '你设计路线时最优先考虑什么',
            options: ['观察内容最丰富', '行走最省力', '先看最想看的场馆', '方便和小组协作'],
          },
          { id: 'sheet_11_reason', kind: 'fill_blank', label: '设计理由', placeholder: '补充 1 句说明' },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_06',
        title: 'AI 导览讲解稿',
        type: 'ai',
        summary: '根据导览地图任务生成路线说明和小讲解员表达稿。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“海洋馆导览地图”研学活动生成一份导览讲解资源，内容包含导览路线、重点场馆说明、地图标注建议、讲解词模板、分工建议和安全提醒。要求适合学生制作导览地图并进行口头展示。',
      },
      {
        id: 'resource_demo_09',
        title: '导览地图示例',
        type: 'doc',
        summary: '示例展示如何把观察重点整理成创作地图。',
        previewMode: 'doc',
        docSections: [
          {
            title: '路线布局示例',
            imageLabel: '地图草图 01',
            description: '用箭头表示路线方向，用颜色区分不同场馆重点。',
            accent: 'blue',
          },
          {
            title: '重点标注示例',
            imageLabel: '地图草图 02',
            description: '每个重点展区旁边补一句观察关键词，避免地图只有路线没有内容。',
            accent: 'green',
          },
        ],
      },
      {
        id: 'resource_demo_10',
        title: '导览路线任务包',
        type: 'pdf',
        summary: '包含路线草图、重点场馆说明和提交要求。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 场馆路线草图',
            pageHint: '建议按主线参观，避免来回折返。',
            blocks: [
              { title: '推荐路线', content: '海豚馆 -> 海狮馆 -> 水母馆 -> 出口互动区', tone: 'table' },
            ],
          },
          {
            pageTitle: '第 2 页 · 提交要求',
            pageHint: '创作地图和路线说明需要相互对应。',
            blocks: [
              { content: '地图中标出的重点展区，必须在路线说明里写出为什么推荐。', tone: 'paragraph' },
              { content: '避免只写馆名不写理由。', tone: 'tip' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'task_demo_07',
    title: '趣味任务集',
    description: '打卡、寻宝、创作、问答、调查一次体验。',
    intro: '把研学任务拆成更有趣的挑战：到点打卡、寻宝收集、AI 辅助创作、语音问答和现场调查。',
    taskType: '团队研学活动',
    taskDescription: '本任务集用于演示研学宝 AI 研学任务的趣味化完成方式。',
    status: 'todo',
    dueAt: now,
    category: 'study',
    target: '个人',
    requirement: '任选一个趣味任务开始，使用题目下方工具完成采集并提交作品。',
    infoSummary: '海洋馆全馆 · 趣味挑战',
    worksSubmitted: 0,
    worksRequired: 5,
    score: 0,
    sequence: 7,
    timeLimit: '今天 19:30 前',
    capabilityTags: ['实践能力', '问题解决', '创新能力', '表达能力', '智能素养'],
    capabilityTagSource: 'manual',
    taskSheets: [
      {
        id: 'sheet_demo_12',
        title: '竞速打卡：找到海豚馆入口',
        topicType: '打卡记录',
        workCategory: '打卡型',
        workMode: '独立完成',
        workKind: 'checkin_treasure',
        gameplayKind: 'speed_checkin',
        requirement: '在 10 分钟内到达海豚馆入口或找到入口标志物，完成拍照打卡。',
        mediaTypes: ['照片', '文字', '定位打卡'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_12_checkin', kind: 'image_upload', label: '上传打卡照片', helper: '照片需带地点和时间水印', limitText: '上传 1 张图片', required: false, tools: ['checkin', 'camera'] },
          { id: 'sheet_12_mark', kind: 'fill_blank', label: '你找到了哪个标志物', placeholder: '例如：海豚馆入口蓝色指示牌', tools: ['ask', 'flash_note', 'voice_text'] },
        ],
      },
      {
        id: 'sheet_demo_13',
        title: '寻宝收集：找到 3 个海洋线索',
        topicType: '寻宝收集',
        workCategory: '探究型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'treasure_collect',
        requirement: '寻找 3 个指定海洋线索，至少拍照上传 2 个，并写出收集进度。',
        mediaTypes: ['照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_13_collect_photo', kind: 'image_upload', label: '上传收集到的线索照片', helper: '例如标本、指示牌、互动装置', limitText: '最多上传 3 张', required: false, tools: ['camera', 'identify'] },
          { id: 'sheet_13_progress', kind: 'fill_blank', label: '收集进度', placeholder: '例如：已找到 2/3 个线索', tools: ['ask', 'flash_note', 'voice_text'] },
          {
            id: 'sheet_13_kind',
            kind: 'multiple_choice',
            label: '你收集到了哪些线索',
            options: ['动物标本', '科普标牌', '互动装置', '导师提示卡'],
            tools: ['ask'],
          },
        ],
      },
      {
        id: 'sheet_demo_14',
        title: '创作研究：设计海洋守护徽章',
        topicType: '创作地图',
        workCategory: '创作型',
        workMode: '独立完成',
        workKind: 'image',
        gameplayKind: 'creative_research',
        requirement: '根据海洋保护主题完成一份创作，可以使用 AI 绘图或 AI 视频辅助构思。',
        mediaTypes: ['照片', '视频', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_14_idea', kind: 'fill_blank', label: '创作想法', placeholder: '写出你想表达的海洋守护主题', tools: ['ask', 'ai_draw', 'ai_video', 'flash_note', 'voice_text'] },
          { id: 'sheet_14_image', kind: 'image_upload', label: '上传创作作品', helper: '可以上传手绘作品或 AI 绘图作品', limitText: '最多上传 2 张', required: false, tools: ['ai_draw', 'camera'] },
          { id: 'sheet_14_video', kind: 'video_upload', label: '上传创作说明视频', helper: '可选，用 15 秒说明创意', limitText: '上传 1 段视频', required: false, tools: ['ai_video', 'flash_note'] },
        ],
      },
      {
        id: 'sheet_demo_15',
        title: '问答挑战：为什么海豚会结队',
        topicType: '问答',
        workCategory: '研究型',
        workMode: '独立完成',
        workKind: 'flash_note',
        gameplayKind: 'qa_research',
        requirement: '研究后用录音和照片回答问题：为什么海豚常常结队活动？',
        mediaTypes: ['音频', '照片', '文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          { id: 'sheet_15_answer', kind: 'fill_blank', label: '你的答案', placeholder: '写出研究后的判断', tools: ['ask', 'flash_note', 'voice_text'] },
          { id: 'sheet_15_audio', kind: 'audio_upload', label: '上传语音答案', helper: '可用闪记保存录音', limitText: '上传 1 段音频', required: false, tools: ['flash_note'] },
          { id: 'sheet_15_photo', kind: 'image_upload', label: '上传观察照片', helper: '拍下能支持答案的现场证据', limitText: '上传 1 张图片', required: false, tools: ['identify', 'camera'] },
        ],
      },
      {
        id: 'sheet_demo_16',
        title: '现场调查：哪种保护方式最有效',
        topicType: '调查',
        workCategory: '论证型',
        workMode: '独立完成',
        workKind: 'rich_text',
        gameplayKind: 'survey',
        requirement: '研学研究后选择你认为最有效的保护方式，并补充理由。',
        mediaTypes: ['文字'],
        status: '待开始',
        submissionStatus: '待填写',
        workForm: [
          {
            id: 'sheet_16_choice',
            kind: 'single_choice',
            label: '你认为哪种保护方式最有效',
            options: ['减少一次性塑料', '设置安静观演区', '加强科普讲解', '增加垃圾分类点'],
            tools: ['ask'],
          },
          { id: 'sheet_16_reason', kind: 'fill_blank', label: '选择理由', placeholder: '写出你调查或观察后的理由', tools: ['ask', 'flash_note', 'voice_text'] },
        ],
      },
    ],
    resourcePacks: [
      {
        id: 'resource_demo_ai_07',
        title: 'AI 趣味任务攻略',
        type: 'ai',
        summary: '按竞速、寻宝、创作、问答和调查任务生成完成攻略。',
        previewMode: 'ai',
        allowEditPrompt: true,
        defaultPrompt:
          '请为“趣味任务集”研学活动生成一份任务攻略资源，内容包含竞速打卡方法、寻宝收集提示、创作研究建议、问答挑战思路、现场调查问题和小组协作提醒。要求有趣、清晰、可执行。',
      },
      {
        id: 'resource_demo_11',
        title: '趣味任务说明卡',
        type: 'doc',
        summary: '包含打卡、寻宝、创作、问答、调查的完成规则。',
        previewMode: 'doc',
        docSections: [
          {
            title: '完成方式',
            imageLabel: '挑战流程',
            description: '每道题都可以使用题目下方的工具完成采集，采纳后会进入作品。',
            accent: 'blue',
          },
          {
            title: '提交提醒',
            imageLabel: '作品证据',
            description: '照片、音频、视频和 AI 结果都要能在作品详情中回看。',
            accent: 'green',
          },
        ],
      },
      {
        id: 'resource_demo_pdf_07',
        title: '趣味任务流程表',
        type: 'pdf',
        summary: '包含五类趣味任务的完成顺序、提交材料和评分提醒。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 · 任务总览',
            pageHint: '先完成打卡和寻宝，再整理创作与问答内容。',
            blocks: [
              { title: '顺序', content: '竞速打卡 -> 寻宝收集 -> 创作研究 -> 问答挑战 -> 现场调查', tone: 'table' },
              { title: '提交物', content: '定位打卡、照片证据、创作图、问答答案、调查选择与理由', tone: 'table' },
            ],
          },
          {
            pageTitle: '第 2 页 · 小组提醒',
            pageHint: '每个成员至少承担一个明确角色。',
            blocks: [
              { content: '组长负责节奏，记录员负责整理证据，观察员负责拍照，讲解员负责最后表达。', tone: 'paragraph' },
              { content: '竞速不等于奔跑，所有打卡必须在安全前提下完成。', tone: 'tip' },
            ],
          },
        ],
      },
    ],
  },
];

export const demoTaskWorks: DemoTaskWork[] = [
  {
    id: 'work_demo_01',
    taskId: 'task_demo_01',
    taskSheetId: 'sheet_demo_01',
    authorName: '小明',
    title: '海豚主池观察',
    workCategory: '观察型',
    topicType: '感想',
    workMode: '独立完成',
    type: '图片',
    workKind: 'image',
    summary: '上传了 1 张主池照片，并补了一句观察。',
    textContent: '我看到海豚会先并排游动，再一起跃出水面，像在合作表演。',
    media: [{ id: 'media_work_01', type: '照片', title: '海豚主池照片', url: '/mock/dolphin-photo.jpg' }],
    attachments: [{ id: 'media_work_01', type: '照片', title: '海豚主池照片', url: '/mock/dolphin-photo.jpg' }],
    capabilityTags: ['观察能力', '提问能力', '科学素养', '表达能力', '探究能力'],
    canResubmit: true,
    formAnswers: [
      { fieldId: 'sheet_01_observe', kind: 'fill_blank', label: '观察到了什么行为', value: '海豚先并排游动，再同时跃出水面。' },
      { fieldId: 'sheet_01_reason', kind: 'fill_blank', label: '你觉得这个行为说明了什么', value: '我觉得它们像是在合作完成训练动作。' },
      {
        fieldId: 'sheet_01_photo',
        kind: 'image_upload',
        label: '上传观察照片',
        files: [{ id: 'media_work_01', type: '照片', title: '海豚主池照片', url: '/mock/dolphin-photo.jpg' }],
      },
    ],
    selfReview: { score: 4, comment: '我把现场动作和照片对应起来了，内容比较完整。', completedAt: '今天 13:31' },
    selfReviewDetail: {
      role: '自评',
      targetName: '小明',
      totalScore: 12,
      summary: '我能把现场观察、图片证据和自己的判断连起来，内容比较完整。',
      completedAt: '今天 13:31',
      items: [
        { dimension: '内容完整度', score: 4, level: '优秀', comment: '写出了观察对象、动作和判断。' },
        { dimension: '证据清晰度', score: 4, level: '优秀', comment: '上传的照片能看出观察位置和主体。' },
        { dimension: '表达清晰度', score: 4, level: '优秀', comment: '句子简洁，老师和同学都能看懂。' },
      ],
    },
    teacherReview: { status: '已评价', score: 95, comment: '观察准确，证据清晰。', completedAt: '今天 14:05' },
    growthValueDelta: 12,
    capabilityScoreDelta: 0.8,
    updatedAt: '今天 13:28',
    status: '已提交',
  },
  {
    id: 'work_demo_02',
    taskId: 'task_demo_02',
    taskSheetId: 'sheet_demo_02',
    authorName: '小明',
    groupName: '1组：海豚探索队',
    title: '倡议卡第一版',
    workCategory: '学习型',
    topicType: '感想',
    workMode: '独立完成',
    type: '文字',
    workKind: 'rich_text',
    summary: '已写主题、口号和 1 条建议。',
    textContent: '少用一次性塑料，保护海洋动物的家园。',
    voiceTranscript: '少用一次性塑料，保护海洋动物的家园。',
    media: [],
    attachments: [],
    capabilityTags: ['合作能力', '创新能力', '表达能力', '环境意识', '协作能力'],
    audioPreview: { title: '语音转写预览', duration: '00:12' },
    canResubmit: true,
    formAnswers: [
      { fieldId: 'sheet_02_theme', kind: 'fill_blank', label: '倡议主题', value: '减少一次性塑料' },
      { fieldId: 'sheet_02_slogan', kind: 'fill_blank', label: '倡议口号', value: '少用一件塑料，多护一片海洋。' },
      { fieldId: 'sheet_02_action', kind: 'single_choice', label: '你最想先推动哪一条行动建议', value: ['自带水杯和餐具'] },
    ],
    selfReview: { score: 4, comment: '我已经写出了主题和口号，还需要补充行动建议。', completedAt: '今天 14:18' },
    selfReviewDetail: {
      role: '自评',
      targetName: '小明',
      totalScore: 10,
      summary: '主题和口号已经比较明确，但行动建议还不够展开。',
      completedAt: '今天 14:18',
      items: [
        { dimension: '主题明确度', score: 4, level: '优秀', comment: '主题和口号对应清楚。' },
        { dimension: '行动建议完整度', score: 3, level: '良好', comment: '还需要再补 1 条更具体的建议。' },
        { dimension: '表达清晰度', score: 3, level: '良好', comment: '整体表达清楚，但还能更有感染力。' },
      ],
    },
    teacherReview: { status: '待评价' },
    growthValueDelta: 6,
    capabilityScoreDelta: 0.3,
    updatedAt: '今天 14:16',
    status: '草稿',
  },
  {
    id: 'work_demo_03',
    taskId: 'task_demo_02',
    taskSheetId: 'sheet_demo_03',
    authorName: '小明',
    groupName: '海豚探索队',
    title: '海洋低塑倡议地图',
    workCategory: '创作型',
    topicType: '创作地图',
    workMode: '小组协作',
    type: '图片',
    workKind: 'flash_note',
    summary: '已经提交小组倡议地图，并补充了重点区域和倡议说明。',
    textContent: '我们建议在出口区域增加海洋垃圾分类互动装置，并在观演区设置低塑提醒牌。',
    voiceTranscript: '我们建议在出口区域增加海洋垃圾分类互动装置，并在观演区设置低塑提醒牌。',
    media: [
      { id: 'media_work_03', type: '照片', title: '倡议地图照片', url: '/mock/eco-map.jpg' },
      { id: 'media_work_04', type: '视频', title: '小组解说视频', url: '/mock/eco-video.mp4' },
    ],
    attachments: [
      { id: 'media_work_03', type: '照片', title: '倡议地图照片', url: '/mock/eco-map.jpg' },
      { id: 'media_work_04', type: '视频', title: '小组解说视频', url: '/mock/eco-video.mp4', duration: '00:23' },
      { id: 'flash_ref_01', type: '闪记引用', title: '出口区观察闪记', url: '', flashNoteId: 'flash_work_01' },
    ],
    capabilityTags: ['合作能力', '创新能力', '表达能力', '环境意识', '协作能力'],
    linkedFlashNotes: [{ id: 'flash_work_01', title: '出口区观察闪记' }],
    canResubmit: true,
    formAnswers: [
      { fieldId: 'sheet_03_title', kind: 'fill_blank', label: '地图主题', value: '海洋馆低塑行动图' },
      { fieldId: 'sheet_03_spot', kind: 'fill_blank', label: '需要重点改进的馆区位置', value: '出口互动区，因为离场时最容易产生包装垃圾。' },
      {
        fieldId: 'sheet_03_reason',
        kind: 'multiple_choice',
        label: '这张创作地图主要表达了哪些倡议重点',
        value: ['垃圾分类', '减少塑料', '文明观演'],
      },
      {
        fieldId: 'sheet_03_photo',
        kind: 'image_upload',
        label: '上传创作地图照片',
        files: [{ id: 'media_work_03', type: '照片', title: '倡议地图照片', url: '/mock/eco-map.jpg' }],
      },
    ],
    collaborators: [
      { id: 'collab_01', name: '陈同学', role: '组长' },
      { id: 'collab_02', name: '李同学', role: '记录员' },
      { id: 'collab_03', name: '小明', role: '讲解员' },
    ],
    sharedInputs: [
      { id: 'shared_01', member: '陈同学', content: '补充了倡议主题和口号。' },
      { id: 'shared_02', member: '李同学', content: '上传了小组创作地图照片。' },
      { id: 'shared_03', member: '小明', content: '录制了 23 秒解说，并整理了倡议重点。' },
    ],
    selfReview: { score: 5, comment: '我完成了讲解部分，和小组同学配合顺畅。', completedAt: '今天 14:25' },
    selfReviewDetail: {
      role: '自评',
      targetName: '小明',
      totalScore: 14,
      summary: '我负责讲解和整理倡议重点，和小组配合顺畅，作品完整度比较高。',
      completedAt: '今天 14:25',
      items: [
        { dimension: '内容完整度', score: 5, level: '优秀', comment: '主题、重点区域和倡议内容都写清楚了。' },
        { dimension: '表达清晰度', score: 4, level: '良好', comment: '讲解逻辑清楚，能对应地图内容。' },
        { dimension: '协作表现', score: 5, level: '优秀', comment: '和同组同学分工明确，衔接顺畅。' },
      ],
    },
    peerReviews: [
      { reviewer: '陈同学', score: 4, comment: '解说完整，节奏很好。', completedAt: '今天 14:32' },
      { reviewer: '李同学', score: 5, comment: '视频解释清楚，帮助我们完善倡议图。', completedAt: '今天 14:35' },
    ],
    peerReviewDetails: [
      {
        role: '互评',
        targetName: '小明',
        totalScore: 12,
        summary: '小明的讲解帮助小组把地图逻辑说清楚了。',
        completedAt: '今天 14:32',
        items: [
          { dimension: '内容完整度', score: 4, level: '良好', comment: '把倡议重点都讲到了。' },
          { dimension: '表达清晰度', score: 4, level: '良好', comment: '讲解节奏稳定，能跟着听懂。' },
          { dimension: '协作表现', score: 4, level: '良好', comment: '能主动接上组长的内容。' },
        ],
      },
      {
        role: '互评',
        targetName: '小明',
        totalScore: 14,
        summary: '小明的解说让我们的小组作品更完整了。',
        completedAt: '今天 14:35',
        items: [
          { dimension: '内容完整度', score: 5, level: '优秀', comment: '把重点区域和行动建议讲得很完整。' },
          { dimension: '表达清晰度', score: 4, level: '良好', comment: '语速合适，表达清楚。' },
          { dimension: '协作表现', score: 5, level: '优秀', comment: '能根据同伴补充即时调整讲解。' },
        ],
      },
    ],
    teacherReview: { status: '已评价', score: 90, comment: '协作清晰，表达完整。', completedAt: '今天 15:00' },
    growthValueDelta: 16,
    capabilityScoreDelta: 1.2,
    updatedAt: '今天 14:22',
    status: '已提交',
  },
  {
    id: 'work_demo_04',
    taskId: 'task_demo_05',
    taskSheetId: 'sheet_demo_08',
    authorName: '小明',
    title: '家庭观察感想',
    workCategory: '观察型',
    topicType: '感想',
    workMode: '独立完成',
    type: '文字',
    workKind: 'rich_text',
    summary: '已完成家庭观察中的三个发现整理并提交。',
    textContent: '我发现社区小池塘边有很多蜻蜓，水边植物可以给小动物提供躲藏的地方。',
    voiceTranscript: '我发现社区小池塘边有很多蜻蜓，水边植物可以给小动物提供躲藏的地方。',
    media: [],
    attachments: [],
    capabilityTags: ['独立自主', '勤于反思', '表达能力', '审美能力', '尊重生命'],
    canResubmit: true,
    formAnswers: [
      { fieldId: 'sheet_08_find_1', kind: 'fill_blank', label: '发现一', value: '池塘边蜻蜓特别多，而且总在水面附近飞。' },
      { fieldId: 'sheet_08_find_2', kind: 'fill_blank', label: '发现二', value: '水边植物比草地里的植物更高，也更密。' },
      { fieldId: 'sheet_08_find_3', kind: 'fill_blank', label: '发现三', value: '有些小虫会停在芦苇叶子背面。' },
      { fieldId: 'sheet_08_mood', kind: 'single_choice', label: '这次家庭观察更像哪种体验', value: ['家长带着一起分析'] },
    ],
    selfReview: { score: 4, comment: '内容比较完整，还可以再补一张照片。', completedAt: '今天 19:05' },
    selfReviewDetail: {
      role: '自评',
      targetName: '小明',
      totalScore: 11,
      summary: '我已经写出了三个发现，接下来还想补充现场照片让证据更完整。',
      completedAt: '今天 19:05',
      items: [
        { dimension: '观察数量', score: 4, level: '优秀', comment: '三个发现都写出来了。' },
        { dimension: '观察深度', score: 4, level: '优秀', comment: '能说出植物和小动物之间的关系。' },
        { dimension: '证据完整度', score: 3, level: '良好', comment: '如果再补照片会更完整。' },
      ],
    },
    teacherReview: { status: '待评价' },
    growthValueDelta: 8,
    capabilityScoreDelta: 0.5,
    updatedAt: '今天 19:02',
    status: '已提交',
  },
  {
    id: 'work_demo_07',
    taskId: 'task_demo_05',
    taskSheetId: 'sheet_demo_08_treasure',
    authorName: '小明',
    title: '家庭自然线索收集',
    workCategory: '探究型',
    topicType: '寻宝收集',
    workMode: '独立完成',
    type: '图片',
    workKind: 'image',
    summary: '已收集 3 个自然线索并上传关键照片。',
    textContent: '我找到了芦苇叶片、蜻蜓停留点和池边科普牌三个自然线索。',
    media: [
      { id: 'media_work_08', type: '照片', title: '芦苇线索照片', url: '/mock/task-photo.jpg' },
      { id: 'media_work_09', type: '照片', title: '池边科普牌', url: '/mock/dolphin-photo.jpg' },
    ],
    attachments: [
      { id: 'media_work_08', type: '照片', title: '芦苇线索照片', url: '/mock/task-photo.jpg' },
      { id: 'media_work_09', type: '照片', title: '池边科普牌', url: '/mock/dolphin-photo.jpg' },
    ],
    capabilityTags: ['独立自主', '勤于反思', '表达能力', '审美能力', '尊重生命'],
    canResubmit: true,
    formAnswers: [
      {
        fieldId: 'sheet_08_treasure_photo',
        kind: 'image_upload',
        label: '上传自然线索照片',
        files: [
          { id: 'media_work_08', type: '照片', title: '芦苇线索照片', url: '/mock/task-photo.jpg' },
          { id: 'media_work_09', type: '照片', title: '池边科普牌', url: '/mock/dolphin-photo.jpg' },
        ],
      },
      { fieldId: 'sheet_08_treasure_progress', kind: 'fill_blank', label: '收集进度', value: '已找到 3/3 个自然线索。' },
      {
        fieldId: 'sheet_08_treasure_kind',
        kind: 'multiple_choice',
        label: '你找到了哪些自然线索',
        value: ['植物叶片', '昆虫活动', '科普标识'],
      },
    ],
    teacherReview: { status: '待评价' },
    growthValueDelta: 10,
    capabilityScoreDelta: 0.6,
    updatedAt: '今天 19:06',
    status: '已提交',
  },
  {
    id: 'work_demo_08',
    taskId: 'task_demo_05',
    taskSheetId: 'sheet_demo_08_survey',
    authorName: '小明',
    title: '家庭观察方式调查',
    workCategory: '论证型',
    topicType: '调查',
    workMode: '独立完成',
    type: '文字',
    workKind: 'rich_text',
    summary: '已完成观察方式选择并补充理由。',
    textContent: '我觉得先安静观察 5 分钟最有效，因为这样能先看到稳定现象，再决定拍什么。',
    media: [],
    attachments: [],
    capabilityTags: ['独立自主', '勤于反思', '表达能力', '审美能力', '尊重生命'],
    canResubmit: true,
    formAnswers: [
      {
        fieldId: 'sheet_08_survey_choice',
        kind: 'single_choice',
        label: '你认为哪种观察方式最有效',
        value: ['安静观察 5 分钟'],
      },
      { fieldId: 'sheet_08_survey_reason', kind: 'fill_blank', label: '选择理由', value: '先安静观察更容易发现重复出现的现象，再去拍照会更有针对性。' },
    ],
    teacherReview: { status: '待评价' },
    growthValueDelta: 8,
    capabilityScoreDelta: 0.4,
    updatedAt: '今天 19:08',
    status: '已提交',
  },
  {
    id: 'work_demo_09',
    taskId: 'task_demo_05',
    taskSheetId: 'sheet_demo_09',
    authorName: '小明',
    title: '家庭观察画作',
    workCategory: '创作型',
    topicType: '画作',
    workMode: '独立完成',
    type: '图片',
    workKind: 'image',
    summary: '已上传家庭观察画作并写出作品说明。',
    textContent: '我把池塘边的蜻蜓和芦苇画在一起，想表现它们共享同一个环境。',
    media: [{ id: 'media_work_10', type: '照片', title: '家庭观察画作', url: '/mock/ai-proof-screenshot.png' }],
    attachments: [{ id: 'media_work_10', type: '照片', title: '家庭观察画作', url: '/mock/ai-proof-screenshot.png' }],
    capabilityTags: ['独立自主', '勤于反思', '表达能力', '审美能力', '尊重生命'],
    canResubmit: true,
    formAnswers: [
      {
        fieldId: 'sheet_09_photo',
        kind: 'image_upload',
        label: '上传观察画作',
        files: [{ id: 'media_work_10', type: '照片', title: '家庭观察画作', url: '/mock/ai-proof-screenshot.png' }],
      },
      { fieldId: 'sheet_09_desc', kind: 'fill_blank', label: '一句作品说明', value: '蜻蜓、芦苇和水面是一起组成这个小生态的。' },
    ],
    teacherReview: { status: '待评价' },
    growthValueDelta: 12,
    capabilityScoreDelta: 0.7,
    updatedAt: '今天 19:10',
    status: '已提交',
  },
  {
    id: 'work_demo_10',
    taskId: 'task_demo_05',
    taskSheetId: 'sheet_demo_09_qa',
    authorName: '小明',
    title: '家庭观察问答挑战',
    workCategory: '研究型',
    topicType: '问答',
    workMode: '独立完成',
    type: '音频',
    workKind: 'flash_note',
    summary: '已用语音和照片回答为什么这里值得继续观察。',
    textContent: '这里值得继续观察，因为同一处地方能同时看到植物、昆虫和水边环境的变化。',
    media: [
      { id: 'media_work_11', type: '音频', title: '家庭观察语音答案', url: '/mock/audio-note.mp3', duration: '00:18' },
      { id: 'media_work_12', type: '照片', title: '观察点证据照片', url: '/mock/task-photo.jpg' },
    ],
    attachments: [
      { id: 'media_work_11', type: '音频', title: '家庭观察语音答案', url: '/mock/audio-note.mp3', duration: '00:18' },
      { id: 'media_work_12', type: '照片', title: '观察点证据照片', url: '/mock/task-photo.jpg' },
    ],
    capabilityTags: ['独立自主', '勤于反思', '表达能力', '审美能力', '尊重生命'],
    audioPreview: { title: '家庭观察语音答案', duration: '00:18' },
    canResubmit: true,
    formAnswers: [
      { fieldId: 'sheet_09_qa_answer', kind: 'fill_blank', label: '你的观察答案', value: '这里能同时观察到植物、昆虫和水边环境变化，所以最值得继续观察。' },
      {
        fieldId: 'sheet_09_qa_audio',
        kind: 'audio_upload',
        label: '上传语音答案',
        files: [{ id: 'media_work_11', type: '音频', title: '家庭观察语音答案', url: '/mock/audio-note.mp3', duration: '00:18' }],
      },
      {
        fieldId: 'sheet_09_qa_photo',
        kind: 'image_upload',
        label: '上传现场证据照片',
        files: [{ id: 'media_work_12', type: '照片', title: '观察点证据照片', url: '/mock/task-photo.jpg' }],
      },
    ],
    teacherReview: { status: '待评价' },
    growthValueDelta: 11,
    capabilityScoreDelta: 0.6,
    updatedAt: '今天 19:12',
    status: '已提交',
  },
  {
    id: 'work_demo_05',
    taskId: 'task_demo_02',
    taskSheetId: 'sheet_demo_03',
    authorName: '陈同学',
    groupName: '海豚探索队',
    title: '低塑地图补充版',
    workCategory: '创作型',
    topicType: '创作地图',
    workMode: '小组协作',
    type: '图片',
    workKind: 'image',
    summary: '补充了出口区域和垃圾分类互动点的说明。',
    textContent: '我把出口区域和垃圾分类装置的位置补在了地图上，还加了一条提醒路线。',
    media: [{ id: 'media_work_05', type: '照片', title: '陈同学地图照片', url: '/mock/peer-map-chen.jpg' }],
    attachments: [{ id: 'media_work_05', type: '照片', title: '陈同学地图照片', url: '/mock/peer-map-chen.jpg' }],
    capabilityTags: ['合作能力', '创新能力', '表达能力', '环境意识', '协作能力'],
    canResubmit: false,
    formAnswers: [
      { fieldId: 'sheet_03_title', kind: 'fill_blank', label: '地图主题', value: '出口区低塑提醒图' },
      { fieldId: 'sheet_03_spot', kind: 'fill_blank', label: '需要重点改进的馆区位置', value: '出口区域，因为人流集中、垃圾容易堆积。' },
      { fieldId: 'sheet_03_reason', kind: 'multiple_choice', label: '这张创作地图主要表达了哪些倡议重点', value: ['垃圾分类', '减少塑料'] },
      {
        fieldId: 'sheet_03_photo',
        kind: 'image_upload',
        label: '上传创作地图照片',
        files: [{ id: 'media_work_05', type: '照片', title: '陈同学地图照片', url: '/mock/peer-map-chen.jpg' }],
      },
    ],
    selfReview: { score: 4, comment: '地图内容比较清楚，但图例还能再细化。', completedAt: '今天 14:20' },
    teacherReview: { status: '待评价' },
    growthValueDelta: 10,
    capabilityScoreDelta: 0.6,
    updatedAt: '今天 14:20',
    status: '已提交',
  },
  {
    id: 'work_demo_06',
    taskId: 'task_demo_02',
    taskSheetId: 'sheet_demo_04',
    authorName: '李同学',
    groupName: '海豚探索队',
    title: '海洋守护主题海报',
    workCategory: '创作型',
    topicType: '讲解视频',
    workMode: '小组协作',
    type: '视频',
    workKind: 'explain_video',
    summary: '海报和解说视频已经上传，突出海洋动物保护主题。',
    textContent: '我们的海报主文案是“把垃圾带走，把海洋留给未来”。',
    media: [
      { id: 'media_work_06', type: '照片', title: '主题海报照片', url: '/mock/poster-li.jpg' },
      { id: 'media_work_07', type: '视频', title: '李同学解说视频', url: '/mock/poster-li-video.mp4' },
    ],
    attachments: [
      { id: 'media_work_06', type: '照片', title: '主题海报照片', url: '/mock/poster-li.jpg' },
      { id: 'media_work_07', type: '视频', title: '李同学解说视频', url: '/mock/poster-li-video.mp4', duration: '00:15' },
    ],
    capabilityTags: ['合作能力', '创新能力', '表达能力', '环境意识', '协作能力'],
    canResubmit: false,
    formAnswers: [
      { fieldId: 'sheet_04_title', kind: 'fill_blank', label: '海报主题', value: '海洋守护行动' },
      { fieldId: 'sheet_04_copy', kind: 'fill_blank', label: '海报主文案', value: '把垃圾带走，把海洋留给未来。' },
      { fieldId: 'sheet_04_focus', kind: 'multiple_choice', label: '海报准备突出哪些内容', value: ['海洋动物保护', '减少垃圾', '小组分工成果'] },
      {
        fieldId: 'sheet_04_photo',
        kind: 'image_upload',
        label: '上传海报照片',
        files: [{ id: 'media_work_06', type: '照片', title: '主题海报照片', url: '/mock/poster-li.jpg' }],
      },
      {
        fieldId: 'sheet_04_video',
        kind: 'video_upload',
        label: '上传解说视频',
        files: [{ id: 'media_work_07', type: '视频', title: '李同学解说视频', url: '/mock/poster-li-video.mp4' }],
      },
    ],
    selfReview: { score: 5, comment: '海报主题清楚，视频也把重点说出来了。', completedAt: '今天 14:28' },
    teacherReview: { status: '待评价' },
    growthValueDelta: 14,
    capabilityScoreDelta: 0.9,
    updatedAt: '今天 14:28',
    status: '已提交',
  },
];

export const demoMessages: DemoMessage[] = [
  {
    id: 'message_broadcast_01',
    title: '导师广播',
    content: '10 分钟后海豚馆东门集合，带上观察卡。',
    type: 'broadcast',
    from: '王导师',
    sentAt: now,
    read: false,
    detailSections: [
      { title: '广播内容', content: '请海豚探索队、海狮观察队在 10 分钟后到海洋剧场东门集合，集合前带好观察卡和已拍摄的现场证据。' },
      { title: '集合要求', content: '组长先清点人数；记录员准备汇报本组当前学习作品进度；迟到同学请直接联系导师。' },
    ],
    actionHint: '收到广播后先确认小组成员，再前往团队页面查看集合安排。',
  },
  {
    id: 'message_group_01',
    title: '海豚探索队',
    content: '我已经把第一张海豚照片发到群里啦。',
    type: 'group',
    from: '海豚探索队',
    sentAt: now,
    read: false,
    detailSections: [
      { title: '群消息内容', content: '陈同学刚把第一张海豚主池照片发到群里，建议大家用这张照片统一说明观察位置。' },
      { title: '当前分工', content: '陈同学负责素材汇总，李同学负责文字记录，你可以继续补充观察感想或上传辅助照片。' },
    ],
    actionHint: '可以进入群聊继续确认分工，也可以回到任务里完善当前学习作品。',
  },
  {
    id: 'message_family_01',
    title: '妈妈',
    content: '晚上把观察照片讲给家里人听。',
    type: 'family',
    from: '妈妈',
    sentAt: now,
    read: false,
    detailSections: [
      { title: '留言内容', content: '晚上回家后，把你今天观察到的海豚动作和照片讲给家里人听，再一起整理成成长日记。' },
      { title: '建议动作', content: '如果你已经完成学习作品，可以回家后再补一段自己的收获，方便家长一起回顾。' },
    ],
    actionHint: '家庭留言通常和作品回顾、成长记录相关，可以回到任务页继续整理。',
  },
  {
    id: 'message_system_01',
    title: '系统通知',
    content: '成长日记草稿已生成。',
    type: 'system',
    from: '系统',
    sentAt: now,
    read: true,
    detailSections: [
      { title: '系统更新', content: '系统已根据你今天提交的学习作品和成长记录，生成了一份成长日记草稿。' },
      { title: '后续处理', content: '你可以进入成长页面查看草稿内容，补充个人感想后再保存。' },
    ],
    actionHint: '系统通知会同步到成长页和报告页，建议及时查看并补充内容。',
  },
  {
    id: 'message_subscription_01',
    title: '订阅消息',
    content: '海洋知识助手推送了“海狮表演观察技巧”和 1 个新挑战。',
    type: 'subscription',
    from: '海洋知识助手',
    sentAt: now,
    read: false,
    targetPath: '/plaza/agents/plaza_agent_03',
    detailSections: [
      { title: '推送内容', content: '海洋知识助手刚推送了“海狮表演观察技巧”，包括观察位置建议、声音变化记录法和互动提问示例。' },
      { title: '新挑战', content: '新增挑战题：请尝试解释为什么表演开始前后观众声音会明显变化，并把你的判断整理成学习作品。' },
    ],
    actionHint: '订阅消息适合直接跳到对应智能体或内容页继续查看。',
  },
];

export const demoCourses: DemoCourse[] = [
  {
    id: 'course_demo_01',
    title: '海洋馆观察小课',
    summary: '学习如何记录海豚、海狮和水母的观察重点。',
    type: '视频',
    progress: 68,
    cover: '海洋馆',
    purchased: true,
    resumeHint: '上次学习到 第 2 章《观察记录方法》',
    lastPositionLabel: '第 2 章 04:10',
    favorite: true,
    shared: false,
    aiCompanionTitle: '海洋知识助手',
    statusText: '视频课程可从上次位置继续播放。',
    chapters: [
      { id: 'course_01_ch_01', title: '海豚馆看什么', duration: '06:20', progress: 100 },
      { id: 'course_01_ch_02', title: '观察记录方法', duration: '05:40', progress: 82 },
      { id: 'course_01_ch_03', title: '课后小测', duration: '03:10', progress: 0 },
    ],
    notes: [
      {
        id: 'course_note_01',
        title: '观察顺序闪记',
        createdAt: '今天 13:36',
        linkedChapterTitle: '观察记录方法',
        linkedPositionLabel: '04:10',
        content: '先写观察对象，再写动作和变化，最后补自己的判断。',
      },
      {
        id: 'course_note_02',
        title: '海豚馆提示',
        createdAt: '昨天 18:20',
        linkedChapterTitle: '海豚馆看什么',
        linkedPositionLabel: '02:05',
        content: '观察海豚时重点看呼吸、队形和跃出水面的时机。',
      },
    ],
  },
  {
    id: 'course_demo_02',
    title: '环保倡议表达课',
    summary: '学习如何把现场观察整理成清晰的倡议内容。',
    type: '音频',
    progress: 36,
    cover: '倡议课',
    purchased: true,
    resumeHint: '上次收听到 第 2 章《怎么写口号》',
    lastPositionLabel: '第 2 章 01:40',
    favorite: false,
    shared: true,
    aiCompanionTitle: '社会责任顾问',
    statusText: '音频课程支持断点续播和边听边记。',
    chapters: [
      { id: 'course_02_ch_01', title: '如何提炼主题', duration: '04:20', progress: 100 },
      { id: 'course_02_ch_02', title: '怎么写口号', duration: '03:30', progress: 45 },
    ],
    notes: [
      {
        id: 'course_note_03',
        title: '口号闪记',
        createdAt: '今天 12:18',
        linkedChapterTitle: '怎么写口号',
        linkedPositionLabel: '01:40',
        content: '口号要短、清楚、能直接对应行动建议。',
      },
    ],
  },
  {
    id: 'course_demo_03',
    title: '海洋馆难题挑战',
    summary: '根据现场观察完成 3 个挑战题，提升观察力与思辨力。',
    type: '难题挑战',
    progress: 18,
    cover: '挑战题',
    purchased: true,
    resumeHint: '当前挑战进行到 挑战 2《如何减少观演区垃圾？》',
    lastPositionLabel: '挑战 2',
    favorite: false,
    shared: false,
    aiCompanionTitle: '海洋知识助手',
    statusText: '挑战课程已同步到任务链路，可继续提交研究型作品。',
    chapters: [
      { id: 'course_03_ch_01', title: '为什么海豚结队行动？', duration: '挑战 1', progress: 100 },
      { id: 'course_03_ch_02', title: '如何减少观演区垃圾？', duration: '挑战 2', progress: 0 },
      { id: 'course_03_ch_03', title: '请设计你的观察地图', duration: '挑战 3', progress: 0 },
    ],
    notes: [
      {
        id: 'course_note_04',
        title: '挑战思路',
        createdAt: '昨天 20:10',
        linkedChapterTitle: '如何减少观演区垃圾？',
        linkedPositionLabel: '挑战 2',
        content: '可以从“垃圾来源-提醒方式-执行人”三部分整理解决方案。',
      },
    ],
  },
];

export const demoKnowledge: DemoKnowledge[] = [
  {
    id: 'knowledge_demo_01',
    title: '海豚协作知识卡',
    category: '海洋生态',
    content: '海豚会用声波和队形协作，也会一起保护幼崽。',
    prompt: '海豚为什么喜欢结队行动？',
  },
  {
    id: 'knowledge_demo_02',
    title: '水母安全知识卡',
    category: '安全提醒',
    content: '观察水母时要保持安全距离，不随意触碰。',
    prompt: '哪些水母不能接触？',
  },
];

export const demoAiRecords: DemoAiRecord[] = [
  {
    id: 'ai_record_demo_01',
    scene: 'ask',
    title: '海豚为什么结队？',
    summary: 'AI 已给出儿童版解释。',
    createdAt: now,
  },
  {
    id: 'ai_record_demo_02',
    scene: 'identify',
    title: '识物：海豚',
    summary: '已生成海豚知识卡，可加入任务。',
    createdAt: now,
  },
];

export const demoGrowthRecords: DemoGrowthRecord[] = [
  {
    id: 'growth_value_demo_01',
    type: 'growth_value',
    category: '研学任务成长值',
    sourceType: 'task',
    title: '团队任务奖励',
    value: 100,
    delta: 100,
    occurredAt: now,
    summary: '完成海豚观察任务并主动分享观点。',
    displaySource: '团体研学任务',
  },
  {
    id: 'growth_value_demo_02',
    type: 'course_reward',
    category: '专家课程成长值',
    sourceType: 'teacher_review',
    title: '专家课程学习奖励',
    value: 50,
    delta: 50,
    occurredAt: now,
    summary: '完成一节海洋生态专家课程学习并同步学习记录。',
    displaySource: '专家课程',
  },
  {
    id: 'growth_value_demo_03',
    type: 'daily_check_in',
    category: '日常使用成长值',
    sourceType: 'self_review',
    title: '每日打卡奖励',
    value: 10,
    delta: 10,
    occurredAt: now,
    summary: '完成今天的成长打卡并同步到成长记录。',
    displaySource: '每日打卡',
  },
  {
    id: 'growth_value_demo_04',
    type: 'ai_create',
    category: '日常使用成长值',
    sourceType: 'self_review',
    title: 'AI 创作奖励',
    value: 10,
    delta: 10,
    occurredAt: now,
    summary: '使用 AI 创作生成了一张海豚观察主题海报。',
    displaySource: 'AI 创作',
  },
  {
    id: 'growth_value_demo_05',
    type: 'device_usage',
    category: '日常使用成长值',
    sourceType: 'self_review',
    title: '设备使用时长奖励',
    value: 10,
    delta: 10,
    occurredAt: now,
    summary: '今日使用研学宝满 30 分钟，已获得时长成长值。',
    displaySource: '使用时长',
  },
];

const capabilitySourceBreakdown = [
  { label: '学员自测', value: 20 },
  { label: '家长评测', value: 20 },
  { label: '研学评价', value: 60 },
];

const makeIndicatorDimensions = (items: Array<[string, number, number]>) =>
  items.map(([label, score, average]) => ({ label, score, average }));

export const demoCapabilities: DemoCapability[] = [
  { id: 'capability_demo_01', elementKey: '身心健康', planeKey: 'self', planeTitle: '自主发展', score: 8.4, averageScore: 7.8, level: '良好', source: 'teacher_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['身体健康', 8.8, 7.9], ['心理健康', 8.1, 7.6], ['合作能力', 8.3, 7.8], ['适应能力', 8.4, 7.7]]) },
  { id: 'capability_demo_02', elementKey: '自我管理', planeKey: 'self', planeTitle: '自主发展', score: 8.1, averageScore: 7.5, level: '良好', source: 'team_task', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['自主学习', 8.3, 7.5], ['独立自主', 8.0, 7.4], ['勤于反思', 8.1, 7.6], ['情绪管理', 7.9, 7.3], ['生涯规划', 8.2, 7.7]]) },
  { id: 'capability_demo_03', elementKey: '问题解决', planeKey: 'self', planeTitle: '自主发展', score: 8.7, averageScore: 7.9, level: '良好', source: 'self_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['发现问题', 8.9, 8.0], ['问题解决', 8.6, 7.8], ['实践能力', 8.5, 7.9]]) },
  { id: 'capability_demo_04', elementKey: '批判思维', planeKey: 'self', planeTitle: '自主发展', score: 7.6, averageScore: 7.2, level: '待提升', source: 'self_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['判断能力', 7.6, 7.2]]) },
  { id: 'capability_demo_05', elementKey: '人文审美', planeKey: 'learning', planeTitle: '科技素养', score: 8.2, averageScore: 7.6, level: '良好', source: 'team_task', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['人文修养', 8.1, 7.5], ['审美能力', 8.3, 7.7]]) },
  { id: 'capability_demo_06', elementKey: '语言沟通', planeKey: 'learning', planeTitle: '科技素养', score: 7.9, averageScore: 7.3, level: '待提升', source: 'self_test', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['语言基础', 7.8, 7.2], ['阅读理解', 7.9, 7.4], ['表达能力', 8.0, 7.3]]) },
  { id: 'capability_demo_07', elementKey: '科技应用', planeKey: 'learning', planeTitle: '科技素养', score: 8.3, averageScore: 7.6, level: '良好', source: 'team_task', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['科学素养', 8.4, 7.6], ['探究能力', 8.2, 7.5]]) },
  { id: 'capability_demo_08', elementKey: '数字素养', planeKey: 'learning', planeTitle: '科技素养', score: 8.0, averageScore: 7.4, level: '良好', source: 'teacher_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['数字素养', 8.1, 7.4], ['提问能力', 7.9, 7.3]]) },
  { id: 'capability_demo_09', elementKey: '创新思维', planeKey: 'future', planeTitle: '创新发展', score: 8.9, averageScore: 7.8, level: '良好', source: 'team_task', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['创新能力', 8.9, 7.8]]) },
  { id: 'capability_demo_10', elementKey: '跨学科融合', planeKey: 'future', planeTitle: '创新发展', score: 8.5, averageScore: 7.7, level: '良好', source: 'teacher_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['跨学科融合', 8.5, 7.7]]) },
  { id: 'capability_demo_11', elementKey: '领导能力', planeKey: 'future', planeTitle: '创新发展', score: 7.8, averageScore: 7.3, level: '待提升', source: 'team_task', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['领导能力', 7.7, 7.2], ['协作能力', 8.0, 7.4], ['资源整合', 7.8, 7.3]]) },
  { id: 'capability_demo_12', elementKey: '商业思维', planeKey: 'future', planeTitle: '创新发展', score: 8.2, averageScore: 7.6, level: '良好', source: 'parent_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['商业思维', 8.1, 7.6], ['财商思维', 8.3, 7.5], ['创业思维', 8.2, 7.7]]) },
  { id: 'capability_demo_13', elementKey: '公民道德', planeKey: 'social', planeTitle: '社会参与', score: 9.1, averageScore: 7.9, level: '优秀', source: 'task_creation', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['尊重生命', 9.2, 8.0], ['公平争议', 8.9, 7.7], ['孝亲仁爱', 9.3, 8.1], ['诚信守信', 9.0, 7.8]]) },
  { id: 'capability_demo_14', elementKey: '社会责任', planeKey: 'social', planeTitle: '社会参与', score: 7.8, averageScore: 7.0, level: '待提升', source: 'self_test', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['劳动意识', 7.7, 7.0], ['集体意识', 8.0, 7.2], ['环境意识', 7.8, 6.9], ['法律意识', 7.6, 6.8]]) },
  { id: 'capability_demo_15', elementKey: '国家认同', planeKey: 'social', planeTitle: '社会参与', score: 8.4, averageScore: 7.5, level: '良好', source: 'team_task', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['民族精神', 8.5, 7.6], ['政治觉悟', 8.2, 7.3], ['家国情怀', 8.6, 7.6]]) },
  { id: 'capability_demo_16', elementKey: '国际理解', planeKey: 'social', planeTitle: '社会参与', score: 7.6, averageScore: 7.0, level: '待提升', source: 'parent_review', recordedAt: now, sourceBreakdown: capabilitySourceBreakdown, indicatorDimensions: makeIndicatorDimensions([['国际视野', 7.5, 6.9], ['发展共存', 7.7, 7.0], ['尊重包容', 7.6, 7.1]]) },
];

export const demoTeams: DemoTeam[] = [
  {
    id: 'team_demo_01',
    name: '海洋馆研学 5 班',
    organizationName: '南山实验学校',
    status: '执行中',
    studyDate: '2026.04.14',
    days: 1,
    destination: '深圳海洋馆',
    studentCount: 24,
    joinStatus: 'joined',
    lifecycleStatus: '进行中',
    membershipStatus: '已加入',
    sourceType: '学校团体研学',
    schoolName: '南山实验学校',
    canScanJoin: true,
    canCodeJoin: true,
    isActive: true,
  },
  {
    id: 'team_demo_02',
    name: '生态农场春游团',
    organizationName: '恒超研学',
    status: '待出发',
    studyDate: '2026.04.20',
    days: 1,
    destination: '南山生态农场',
    studentCount: 18,
    joinStatus: 'joined',
    lifecycleStatus: '待出行',
    membershipStatus: '已加入',
    sourceType: '机构团体研学',
    canScanJoin: true,
    canCodeJoin: true,
  },
  {
    id: 'team_demo_03',
    name: '植物园观察营',
    organizationName: '南山实验学校',
    status: '已结束',
    studyDate: '2026.03.28',
    days: 2,
    destination: '深圳植物园',
    studentCount: 20,
    joinStatus: 'ended',
    lifecycleStatus: '已结束',
    membershipStatus: '历史可查看',
    sourceType: '学校团体研学',
    schoolName: '南山实验学校',
  },
  {
    id: 'team_demo_04',
    name: '鹏城湿地探究营',
    organizationName: '南山实验学校',
    status: '审核中',
    studyDate: '2026.04.23',
    days: 1,
    destination: '深圳湾湿地',
    studentCount: 30,
    joinStatus: 'joinable',
    lifecycleStatus: '招募中',
    membershipStatus: '待审批',
    sourceType: '学校团体研学',
    schoolName: '南山实验学校',
    canScanJoin: true,
    canCodeJoin: true,
  },
  {
    id: 'team_demo_05',
    name: '冷湖少年科创营',
    organizationName: '恒超研学',
    status: '推荐中',
    studyDate: '2026.05.01',
    days: 3,
    destination: '青海冷湖',
    studentCount: 40,
    joinStatus: 'joinable',
    lifecycleStatus: '招募中',
    membershipStatus: '未加入',
    sourceType: '研学旅行推荐',
    shareTarget: 'parent',
    shareSummary: '面向家长分享的研学旅行推荐团，报名与购买在小程序中完成。',
    canScanJoin: false,
    canCodeJoin: false,
  },
  {
    id: 'team_demo_06',
    name: '西双版纳雨林观察营',
    organizationName: '恒超研学',
    status: '推荐中',
    studyDate: '2026.05.10',
    days: 4,
    destination: '云南西双版纳',
    studentCount: 32,
    joinStatus: 'joinable',
    lifecycleStatus: '招募中',
    membershipStatus: '未加入',
    sourceType: '研学旅行推荐',
    shareTarget: 'parent',
    shareSummary: '面向家长分享的自然生态主题研学团，重点体验雨林观察、植物识别和夜观课程。',
    canScanJoin: false,
    canCodeJoin: false,
  },
  {
    id: 'team_demo_07',
    name: '敦煌丝路艺术营',
    organizationName: '星野研学',
    status: '推荐中',
    studyDate: '2026.05.18',
    days: 5,
    destination: '甘肃敦煌',
    studentCount: 28,
    joinStatus: 'joinable',
    lifecycleStatus: '招募中',
    membershipStatus: '未加入',
    sourceType: '研学旅行推荐',
    shareTarget: 'parent',
    shareSummary: '面向家长分享的历史艺术主题研学团，包含壁画临摹、丝路故事和博物馆课程。',
    canScanJoin: false,
    canCodeJoin: false,
  },
  {
    id: 'team_demo_08',
    name: '珠海航天探索营',
    organizationName: '未来星研学',
    status: '推荐中',
    studyDate: '2026.06.01',
    days: 2,
    destination: '珠海太空中心',
    studentCount: 36,
    joinStatus: 'joinable',
    lifecycleStatus: '招募中',
    membershipStatus: '未加入',
    sourceType: '研学旅行推荐',
    shareTarget: 'parent',
    shareSummary: '面向家长分享的航天科技主题研学团，适合对火箭、卫星和太空任务感兴趣的学生。',
    canScanJoin: false,
    canCodeJoin: false,
  },
];

export const demoTeamDetails: Record<string, DemoTeamDetail> = {
  team_demo_01: {
    id: 'team_demo_01',
    teamSummary: '今天围绕海洋馆研学任务进行团队协作、观察记录和现场展示。',
    handbookTitle: '海洋馆研学小队守则',
    groupName: '海豚探索队',
    groupRole: '组长',
    badge: '蓝鲸徽章',
    joinMode: '授权码加入',
    joinCode: '240514',
    myMember: {
      id: 'member_demo_me_01',
      name: '小明',
      roleName: '组长',
      rolePreset: '组长',
      note: '本轮演示默认以组长身份进入，可修改小组名称、徽章和岗位。',
      isCurrentStudent: true,
      canManageRoles: true,
      canManageGroupProfile: true,
    },
    myGroupId: 'group_demo_01',
    myRole: '组长',
    myRank: { score: 94, rank: 2, total: 24 },
    myGroupRank: { score: 96, rank: 1, total: 3 },
    handbookMaterials: [
      {
        id: 'handbook_material_01',
        title: '海洋馆路线图',
        type: 'doc',
        summary: '查看馆区路线、集合点和观察站位。',
        previewMode: 'doc',
        docSections: [
          { title: '入馆顺序', imageLabel: '路线图 01', description: '从海豚馆东门进入，先完成主池观察，再前往海狮馆和水母馆。' },
          { title: '集合点提醒', imageLabel: '集合点示意', description: '第一次集合在海豚馆东门，第二次集合在海狮馆门口。' },
          { title: '站位建议', imageLabel: '观察站位', description: '记录员靠近讲解牌，摄影同学站在护栏后方拍摄，避免挡住通道。' },
        ],
      },
      {
        id: 'handbook_material_02',
        title: '海洋馆安全须知',
        type: 'pdf',
        summary: '任务前必读，包含安全提示、任务流程和注意事项。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 安全提醒',
            blocks: [
              { title: '基本要求', content: '入馆后跟随小组行动，不单独离队，不在护栏前追跑打闹。' },
              { title: '安静提醒', content: '表演开始前调低音量，拍照时不使用闪光灯。', tone: 'table' },
            ],
          },
          {
            pageTitle: '第 2 页 任务流程',
            blocks: [
              { title: '流程', content: '先看手册，再完成个人记录，最后汇总小组观点并准备展示。' },
              { title: '提交顺序', content: '记录员先检查作品是否齐全，再由组长确认素材已同步到任务作品。', tone: 'table' },
            ],
          },
        ],
      },
      {
        id: 'handbook_material_05',
        title: '海豚观察讲解视频',
        type: 'video',
        previewMode: 'video',
        summary: '出发前先看 2 分钟观察示范，熟悉讲解顺序和站位。',
        coverImage: '海豚馆视频封面',
        duration: '02:18',
      },
      {
        id: 'handbook_material_06',
        title: 'AI 观察参考卡',
        type: 'ai_reference',
        previewMode: 'ai_reference',
        summary: '根据海豚观察任务整理出的 AI 追问建议和表达模板。',
        aiSummary: '建议从“它在做什么、为什么会这样、我有什么证据”三个角度和专家继续讨论。',
        questions: ['海豚为什么喜欢结队活动？', '我拍到的动作能说明什么？', '怎么把观察结果讲清楚？'],
      },
    ],
    groups: [
      {
        id: 'group_demo_01',
        serialNo: 1,
        customName: '海豚探索队',
        displayName: '1组：海豚探索队',
        name: '海豚探索队',
        topic: '负责海豚主池观察、路线记录和展示说明。',
        badgeTitle: '蓝鲸徽章',
        badgeEmoji: '🐋',
        badgeImage: 'ai-badge-whale.png',
        score: 96,
        rank: 1,
        joined: true,
        members: [
          { id: 'member_demo_01', name: '陈同学', roleName: '记录员', rolePreset: '记录员', note: '负责分工提醒和素材汇总。' },
          { id: 'member_demo_me_01', name: '小明', roleName: '组长', rolePreset: '组长', note: '本轮演示默认以组长身份进入。', isCurrentStudent: true, canManageRoles: true, canManageGroupProfile: true },
          { id: 'member_demo_02', name: '李同学', roleName: '观察员', rolePreset: '观察员', note: '负责拍照和现场观察。' },
          { id: 'member_demo_03', name: '王同学', roleName: '讲解员', rolePreset: '讲解员', note: '负责展示说明和汇报。' },
        ],
      },
      {
        id: 'group_demo_02',
        serialNo: 2,
        customName: '海狮观察队',
        displayName: '2组：海狮观察队',
        name: '海狮观察队',
        topic: '负责海狮表演观察和互动记录。',
        badgeTitle: '海狮徽章',
        badgeEmoji: '🦭',
        score: 92,
        rank: 2,
        members: [
          { id: 'member_demo_04', name: '张同学', roleName: '组长', rolePreset: '组长', note: '负责带队完成海狮馆观察。', canManageRoles: true, canManageGroupProfile: true },
          { id: 'member_demo_05', name: '周同学', roleName: '记录员', rolePreset: '记录员' },
          { id: 'member_demo_06', name: '吴同学', roleName: '摄影师', rolePreset: '摄影员' },
          { id: 'member_demo_07', name: '郑同学', roleName: '安全员', rolePreset: '安全员' },
        ],
      },
      {
        id: 'group_demo_03',
        serialNo: 3,
        customName: '企鹅记录队',
        displayName: '3组：企鹅记录队',
        name: '企鹅记录队',
        topic: '负责企鹅馆路线记录与习性整理。',
        badgeTitle: '企鹅徽章',
        badgeEmoji: '🐧',
        score: 88,
        rank: 3,
        members: [
          { id: 'member_demo_08', name: '何同学', roleName: '组长', rolePreset: '组长', canManageRoles: true, canManageGroupProfile: true },
          { id: 'member_demo_09', name: '马同学', roleName: '观察员', rolePreset: '观察员' },
          { id: 'member_demo_10', name: '许同学', roleName: '记录员', rolePreset: '记录员' },
          { id: 'member_demo_11', name: '孙同学', roleName: '汇报员', rolePreset: '讲解员' },
        ],
      },
    ],
    reviewConfig: {
      allowSelfReview: true,
      allowPeerReview: true,
      evaluationItems: [
        {
          id: 'team_eval_process_01',
          phase: '过程性评价',
          dimension: '形成性评价',
          coreIndicator: '1.认真参与实践',
          scores: [
            { role: '学生自评', score: 8.8 },
            { role: '同学互评', score: 9.0 },
            { role: '老师评价', score: 9.2 },
          ],
          note: '能按时参与观察、记录和集合，现场投入度较高。',
        },
        {
          id: 'team_eval_process_02',
          phase: '过程性评价',
          dimension: '形成性评价',
          coreIndicator: '2.团队分工协作',
          scores: [
            { role: '学生自评', score: 9.4 },
            { role: '同学互评', score: 9.3 },
            { role: '老师评价', score: 9.5 },
          ],
          note: '组内岗位明确，组长能推动记录员、观察员和讲解员协作。',
        },
        {
          id: 'team_eval_process_03',
          phase: '过程性评价',
          dimension: '形成性评价',
          coreIndicator: '3.记录完整性',
          scores: [
            { role: '学生自评', score: 9.0 },
            { role: '同学互评', score: 8.8 },
            { role: '老师评价', score: 9.1 },
          ],
          note: '观察记录有照片、文字和路线信息，个别证据还可补充来源说明。',
        },
        {
          id: 'team_eval_summary_01',
          phase: '总结性评价',
          dimension: '总结性评价',
          coreIndicator: '1.理解生态基本概念，有主动保护生态的意识',
          scores: [
            { role: '小组自评', score: 8.9 },
            { role: '同学互评', score: 9.1 },
            { role: '专家评价', score: 9.0 },
          ],
          note: '能把海洋动物行为与生态保护意识联系起来。',
        },
        {
          id: 'team_eval_summary_02',
          phase: '总结性评价',
          dimension: '总结性评价',
          coreIndicator: '2.成果设计科学创新，实用性较强',
          scores: [
            { role: '小组自评', score: 8.7 },
            { role: '同学互评', score: 8.6 },
            { role: '专家评价', score: 8.8 },
          ],
          note: '成果有明确主题和行动建议，创新表达还可继续增强。',
        },
        {
          id: 'team_eval_summary_03',
          phase: '总结性评价',
          dimension: '总结性评价',
          coreIndicator: '3.成果展示清晰，表现效果好',
          scores: [
            { role: '小组自评', score: 9.2 },
            { role: '同学互评', score: 9.0 },
            { role: '专家评价', score: 9.3 },
          ],
          note: '讲解分工清楚，展示节奏完整，能回应现场问题。',
        },
      ],
      rubricItems: [
        { id: 'team_review_01', dimension: '岗位完成度', standard: '今天是否主动完成自己的岗位工作。' },
        { id: 'team_review_02', dimension: '协作主动性', standard: '是否主动与组员协作并补位。' },
        { id: 'team_review_03', dimension: '现场表达力', standard: '是否能清楚表达观察与结论。' },
        { id: 'team_review_04', dimension: '规范与安全意识', standard: '是否遵守集合、安全和礼仪要求。' },
        { id: 'team_review_05', dimension: '问题发现与思考', standard: '是否提出了有价值的问题和判断。' },
      ],
      selfReviewTask: { id: 'team_self_review_01', title: '团队协作自评', role: '自评', summary: '对今天在小组中的表现逐项自评。', status: '待完成', enabled: true },
      peerReviewTask: { id: 'team_peer_review_01', title: '组内互评', role: '互评', summary: '选择一名组员填写互评。', status: '待完成', enabled: true },
    },
    personalRankings: [
      { id: 'student_rank_01', name: '陈同学', pending: 0, completed: 5, score: 98, progress: 100 },
      { id: 'student_rank_02', name: '小明', pending: 1, completed: 4, score: 94, progress: 80 },
      { id: 'student_rank_03', name: '李同学', pending: 1, completed: 4, score: 92, progress: 80 },
      { id: 'student_rank_04', name: '王同学', pending: 2, completed: 3, score: 90, progress: 60 },
    ],
    groupRankings: [
      { id: 'ranking_01', name: '海豚探索队', score: 96, trend: 'up' },
      { id: 'ranking_02', name: '海狮观察队', score: 92, trend: 'flat' },
      { id: 'ranking_03', name: '企鹅记录队', score: 88, trend: 'up' },
    ],
    selfReviewResult: {
      role: '自评',
      targetName: '小明',
      totalScore: 0,
      summary: '',
      completedAt: '',
      items: [],
    },
  },
  team_demo_02: {
    id: 'team_demo_02',
    teamSummary: '农场研学将围绕种植观察、环保倡议和团队协作展开。',
    handbookTitle: '生态农场研学说明',
    groupName: '待分组',
    groupRole: '待分配',
    badge: '未设置',
    joinMode: '授权码加入',
    joinCode: '240520',
    myMember: {
      id: 'member_demo_me_02',
      name: '小明',
      roleName: '待分配',
      note: '你已进入待出行名单，出发前可先查看手册和集合提醒。',
      isCurrentStudent: true,
    },
    myRole: '待分配',
    myRank: { score: 0, rank: 0, total: 18 },
    myGroupRank: { score: 0, rank: 0, total: 0 },
    handbookMaterials: [
      {
        id: 'handbook_material_03',
        title: '农场任务说明',
        type: 'doc',
        summary: '查看种植观察点、集合流程和工具领取说明。',
        previewMode: 'doc',
        docSections: [
          { title: '观察点位', imageLabel: '农场分区图', description: '分为育苗区、果蔬区、堆肥区三个主要观察点。' },
          { title: '工具领取', imageLabel: '工具清单', description: '入场后先领取手套、记录卡和种植工具，再按小组行动。' },
        ],
      },
    ],
    groups: [
      {
        id: 'group_demo_04',
        serialNo: 1,
        customName: '向阳种植队',
        displayName: '1组：向阳种植队',
        name: '向阳种植队',
        topic: '负责育苗区观察与记录。',
        badgeTitle: '向日葵徽章',
        badgeEmoji: '🌻',
        score: 0,
        rank: 0,
        members: [
          { id: 'member_demo_12', name: '林同学', roleName: '组长', rolePreset: '组长', canManageRoles: true, canManageGroupProfile: true },
          { id: 'member_demo_13', name: '赵同学', roleName: '记录员', rolePreset: '记录员' },
        ],
      },
      {
        id: 'group_demo_05',
        serialNo: 2,
        customName: '绿色行动队',
        displayName: '2组：绿色行动队',
        name: '绿色行动队',
        topic: '负责环保倡议和农场分类记录。',
        badgeTitle: '树叶徽章',
        badgeEmoji: '🍃',
        score: 0,
        rank: 0,
        members: [
          { id: 'member_demo_14', name: '谢同学', roleName: '组长', rolePreset: '组长', canManageRoles: true, canManageGroupProfile: true },
          { id: 'member_demo_15', name: '许同学', roleName: '观察员', rolePreset: '观察员' },
        ],
      },
    ],
    reviewConfig: {
      allowSelfReview: false,
      allowPeerReview: false,
      rubricItems: [],
      selfReviewTask: { id: 'team_self_review_02', title: '团队协作自评', role: '自评', summary: '本次团队暂未开启自评。', status: '待完成', enabled: false },
      peerReviewTask: { id: 'team_peer_review_02', title: '组内互评', role: '互评', summary: '本次团队暂未开启互评。', status: '待完成', enabled: false },
    },
    personalRankings: [],
    groupRankings: [],
  },
  team_demo_03: {
    id: 'team_demo_03',
    teamSummary: '植物园观察营已结束，可回看历史资料与研学记录。',
    handbookTitle: '植物园观察营资料',
    groupName: '1组：叶脉记录队',
    groupRole: '观察员',
    badge: '树叶徽章',
    joinMode: '授权码加入',
    joinCode: '230328',
    myMember: {
      id: 'member_demo_me_03',
      name: '小明',
      roleName: '观察员',
      note: '本次团队已结束，仅支持查看历史信息。',
      isCurrentStudent: true,
    },
    myGroupId: 'group_demo_06',
    myRole: '观察员',
    myRank: { score: 88, rank: 5, total: 20 },
    myGroupRank: { score: 90, rank: 2, total: 4 },
    handbookMaterials: [
      {
        id: 'handbook_material_04',
        title: '植物园路线记录',
        type: 'pdf',
        summary: '可回看当日路线、打卡点和观察重点。',
        previewMode: 'pdf',
        pdfPages: [
          {
            pageTitle: '第 1 页 路线记录',
            blocks: [
              { title: '路线', content: '从南门进入，依次经过蕨类区、温室区和湖畔观察点。', tone: 'table' },
            ],
          },
        ],
      },
    ],
    groups: [
      {
        id: 'group_demo_06',
        serialNo: 1,
        customName: '叶脉记录队',
        displayName: '1组：叶脉记录队',
        name: '叶脉记录队',
        topic: '负责植物纹理与叶片变化观察。',
        badgeTitle: '树叶徽章',
        badgeEmoji: '🍃',
        score: 90,
        rank: 2,
        joined: true,
        members: [
          { id: 'member_demo_16', name: '郭同学', roleName: '组长', rolePreset: '组长', canManageRoles: true, canManageGroupProfile: true },
          { id: 'member_demo_me_03', name: '小明', roleName: '观察员', rolePreset: '观察员', isCurrentStudent: true },
          { id: 'member_demo_17', name: '蒋同学', roleName: '记录员', rolePreset: '记录员' },
        ],
      },
    ],
    reviewConfig: {
      allowSelfReview: true,
      allowPeerReview: false,
      rubricItems: [
        { id: 'team_review_04', dimension: '观察投入度', standard: '是否认真完成植物观察和记录。' },
      ],
      selfReviewTask: { id: 'team_self_review_03', title: '团队协作自评', role: '自评', summary: '历史团队的自评记录已完成。', status: '已完成', enabled: true },
      peerReviewTask: { id: 'team_peer_review_03', title: '组内互评', role: '互评', summary: '本次团队未开放互评。', status: '待完成', enabled: false },
    },
    personalRankings: [
      { id: 'student_rank_05', name: '郭同学', pending: 0, completed: 4, score: 95, progress: 100 },
      { id: 'student_rank_06', name: '小明', pending: 0, completed: 4, score: 88, progress: 100 },
    ],
    groupRankings: [
      { id: 'ranking_04', name: '花语探索队', score: 93, trend: 'up' },
      { id: 'ranking_05', name: '叶脉记录队', score: 90, trend: 'flat' },
    ],
  },
  team_demo_04: {
    id: 'team_demo_04',
    teamSummary: '湿地探究营正在招募中，已提交申请，等待导师审批后确认入营。',
    handbookTitle: '湿地探究营出行说明',
    groupName: '待审批',
    groupRole: '待审批',
    badge: '待分配',
    joinMode: '授权码加入',
    joinCode: '240423',
    myMember: {
      id: 'member_demo_me_04',
      name: '小明',
      roleName: '待审批',
      note: '扫码申请已提交，导师审批通过后会进入待出行。',
      isCurrentStudent: true,
    },
    myRole: '待审批',
    myRank: { score: 0, rank: 0, total: 30 },
    myGroupRank: { score: 0, rank: 0, total: 0 },
    handbookMaterials: [
      {
        id: 'handbook_material_07',
        title: '湿地观察预习卡',
        type: 'ai_reference',
        previewMode: 'ai_reference',
        summary: '审批通过前可先看推荐问题，提前预习湿地生态相关知识。',
        aiSummary: '建议先理解候鸟、潮汐和红树林之间的关系，再准备观察问题。',
        questions: ['红树林为什么重要？', '候鸟停留会看哪些环境条件？'],
      },
    ],
    groups: [],
    reviewConfig: {
      allowSelfReview: false,
      allowPeerReview: false,
      rubricItems: [],
      selfReviewTask: { id: 'team_self_review_04', title: '团队协作自评', role: '自评', summary: '审批通过后开放。', status: '待完成', enabled: false },
      peerReviewTask: { id: 'team_peer_review_04', title: '组内互评', role: '互评', summary: '审批通过后开放。', status: '待完成', enabled: false },
    },
    personalRankings: [],
    groupRankings: [],
  },
  team_demo_05: {
    id: 'team_demo_05',
    teamSummary: '研学旅行推荐团面向家长分享，设备端仅做展示和分享入口。',
    handbookTitle: '冷湖少年科创营推荐说明',
    groupName: '暂不分组',
    groupRole: '暂不分配',
    badge: '推荐团',
    joinMode: '授权码加入',
    joinCode: 'N/A',
    myMember: {
      id: 'member_demo_me_05',
      name: '小明',
      roleName: '未报名',
      note: '可把推荐链接分享给家长，在小程序中查看和报名。',
      isCurrentStudent: true,
    },
    myRole: '未报名',
    myRank: { score: 0, rank: 0, total: 0 },
    myGroupRank: { score: 0, rank: 0, total: 0 },
    handbookMaterials: [
      {
        id: 'handbook_material_08',
        title: '冷湖科创营行程亮点',
        type: 'video',
        previewMode: 'video',
        summary: '3 天 2 夜科创营精彩内容预览。',
        coverImage: '冷湖营地预告片',
        duration: '01:48',
      },
      {
        id: 'handbook_material_09',
        title: '家长选团 AI 参考',
        type: 'ai_reference',
        previewMode: 'ai_reference',
        summary: '帮助家长判断课程亮点、适龄范围和准备事项。',
        aiSummary: '推荐重点关注行程强度、住宿安排、科创主题与孩子兴趣匹配度。',
        questions: ['适合几年级学生？', '家长需要准备什么？', '报名在哪个小程序完成？'],
      },
    ],
    groups: [],
    reviewConfig: {
      allowSelfReview: false,
      allowPeerReview: false,
      rubricItems: [],
      selfReviewTask: { id: 'team_self_review_05', title: '团队协作自评', role: '自评', summary: '推荐团不开放。', status: '待完成', enabled: false },
      peerReviewTask: { id: 'team_peer_review_05', title: '组内互评', role: '互评', summary: '推荐团不开放。', status: '待完成', enabled: false },
    },
    personalRankings: [],
    groupRankings: [],
  },
  team_demo_06: {
    id: 'team_demo_06',
    teamSummary: '研学旅行推荐团面向家长分享，设备端展示雨林观察课程亮点和出行信息。',
    handbookTitle: '西双版纳雨林观察营推荐说明',
    groupName: '暂不分组',
    groupRole: '暂不分配',
    badge: '推荐团',
    joinMode: '授权码加入',
    joinCode: 'N/A',
    myMember: {
      id: 'member_demo_me_06',
      name: '小明',
      roleName: '未报名',
      note: '可发送给家长，在小程序中查看行程和报名。',
      isCurrentStudent: true,
    },
    myRole: '未报名',
    myRank: { score: 0, rank: 0, total: 0 },
    myGroupRank: { score: 0, rank: 0, total: 0 },
    handbookMaterials: [
      {
        id: 'handbook_material_10',
        title: '雨林观察行程亮点',
        type: 'video',
        previewMode: 'video',
        summary: '展示热带植物识别、昆虫观察和夜观安全须知。',
        coverImage: '雨林观察预告片',
        duration: '01:36',
      },
      {
        id: 'handbook_material_11',
        title: '家长选团 AI 参考',
        type: 'ai_reference',
        previewMode: 'ai_reference',
        summary: '帮助家长了解雨林研学的适龄范围、课程强度和装备准备。',
        aiSummary: '推荐重点关注防蚊、防晒、夜观安全和孩子对自然观察的兴趣。',
        questions: ['需要准备哪些装备？', '夜观活动安全吗？', '适合第一次参加研学的孩子吗？'],
      },
    ],
    groups: [],
    reviewConfig: {
      allowSelfReview: false,
      allowPeerReview: false,
      rubricItems: [],
      selfReviewTask: { id: 'team_self_review_06', title: '团队协作自评', role: '自评', summary: '推荐团不开放。', status: '待完成', enabled: false },
      peerReviewTask: { id: 'team_peer_review_06', title: '组内互评', role: '互评', summary: '推荐团不开放。', status: '待完成', enabled: false },
    },
    personalRankings: [],
    groupRankings: [],
  },
  team_demo_07: {
    id: 'team_demo_07',
    teamSummary: '研学旅行推荐团面向家长分享，设备端展示敦煌艺术和丝路文化课程亮点。',
    handbookTitle: '敦煌丝路艺术营推荐说明',
    groupName: '暂不分组',
    groupRole: '暂不分配',
    badge: '推荐团',
    joinMode: '授权码加入',
    joinCode: 'N/A',
    myMember: {
      id: 'member_demo_me_07',
      name: '小明',
      roleName: '未报名',
      note: '可发送给家长，在小程序中查看行程和报名。',
      isCurrentStudent: true,
    },
    myRole: '未报名',
    myRank: { score: 0, rank: 0, total: 0 },
    myGroupRank: { score: 0, rank: 0, total: 0 },
    handbookMaterials: [
      {
        id: 'handbook_material_12',
        title: '敦煌艺术课程亮点',
        type: 'video',
        previewMode: 'video',
        summary: '展示壁画临摹、色彩观察和丝路故事课程。',
        coverImage: '敦煌艺术预告片',
        duration: '01:42',
      },
      {
        id: 'handbook_material_13',
        title: '家长选团 AI 参考',
        type: 'ai_reference',
        previewMode: 'ai_reference',
        summary: '帮助家长判断孩子是否适合历史艺术主题研学。',
        aiSummary: '推荐重点关注行程天数、文化课程比例和孩子对绘画表达的兴趣。',
        questions: ['没有绘画基础可以参加吗？', '每天课程强度如何？', '家长端能看到哪些行程信息？'],
      },
    ],
    groups: [],
    reviewConfig: {
      allowSelfReview: false,
      allowPeerReview: false,
      rubricItems: [],
      selfReviewTask: { id: 'team_self_review_07', title: '团队协作自评', role: '自评', summary: '推荐团不开放。', status: '待完成', enabled: false },
      peerReviewTask: { id: 'team_peer_review_07', title: '组内互评', role: '互评', summary: '推荐团不开放。', status: '待完成', enabled: false },
    },
    personalRankings: [],
    groupRankings: [],
  },
  team_demo_08: {
    id: 'team_demo_08',
    teamSummary: '研学旅行推荐团面向家长分享，设备端展示航天科技课程和场馆体验信息。',
    handbookTitle: '珠海航天探索营推荐说明',
    groupName: '暂不分组',
    groupRole: '暂不分配',
    badge: '推荐团',
    joinMode: '授权码加入',
    joinCode: 'N/A',
    myMember: {
      id: 'member_demo_me_08',
      name: '小明',
      roleName: '未报名',
      note: '可发送给家长，在小程序中查看行程和报名。',
      isCurrentStudent: true,
    },
    myRole: '未报名',
    myRank: { score: 0, rank: 0, total: 0 },
    myGroupRank: { score: 0, rank: 0, total: 0 },
    handbookMaterials: [
      {
        id: 'handbook_material_14',
        title: '航天探索行程亮点',
        type: 'video',
        previewMode: 'video',
        summary: '展示火箭结构认知、卫星任务体验和太空中心参访。',
        coverImage: '航天探索预告片',
        duration: '01:30',
      },
      {
        id: 'handbook_material_15',
        title: '家长选团 AI 参考',
        type: 'ai_reference',
        previewMode: 'ai_reference',
        summary: '帮助家长了解航天主题研学的学习重点和准备事项。',
        aiSummary: '推荐重点关注课程是否偏实践、孩子对工程结构的兴趣和出行安排。',
        questions: ['课程是否包含动手制作？', '适合低年级学生吗？', '报名后在哪里查看集合信息？'],
      },
    ],
    groups: [],
    reviewConfig: {
      allowSelfReview: false,
      allowPeerReview: false,
      rubricItems: [],
      selfReviewTask: { id: 'team_self_review_08', title: '团队协作自评', role: '自评', summary: '推荐团不开放。', status: '待完成', enabled: false },
      peerReviewTask: { id: 'team_peer_review_08', title: '组内互评', role: '互评', summary: '推荐团不开放。', status: '待完成', enabled: false },
    },
    personalRankings: [],
    groupRankings: [],
  },
};

export const demoTeamGroupOptions: DemoTeamGroupOption[] = [
  ...demoTeamDetails.team_demo_01.groups,
];

export const demoTeamRoleOptions: DemoTeamRoleOption[] = [
  { id: 'role_01', title: '组长', summary: '负责协调整组进度和发言。' },
  { id: 'role_02', title: '记录员', summary: '负责记笔记、整理作品和上传。', active: true },
  { id: 'role_03', title: '观察员', summary: '负责拍照、识物和现场观察。' },
  { id: 'role_04', title: '讲解员', summary: '负责总结观点和展示汇报。' },
];

export const demoTeamBadges: DemoTeamBadge[] = [
  { id: 'badge_01', title: '蓝鲸徽章', emoji: '🐋', active: true },
  { id: 'badge_02', title: '海豚徽章', emoji: '🐬' },
  { id: 'badge_03', title: '海狮徽章', emoji: '🦭' },
  { id: 'badge_04', title: '企鹅徽章', emoji: '🐧' },
];

export const demoReports: DemoReport[] = [
  {
    id: 'report_demo_01',
    teamId: 'team_demo_01',
    title: '海洋馆研学报告',
    status: 'generated',
    publishedAt: now,
    summary: '已汇总海洋观察、团队协作和表达表现，可同步给家长查看。',
    certificateId: 'certificate_demo_01',
    certificateTitle: '海洋馆研学证书',
  },
  {
    id: 'report_demo_02',
    teamId: 'team_demo_03',
    title: '植物园观察营报告',
    status: 'generated',
    publishedAt: '2026-03-29T10:00:00.000Z',
    summary: '历史研学报告已归档，可回看路线观察和小组表现。',
    certificateId: 'certificate_demo_02',
    certificateTitle: '植物园观察营证书',
  },
];

export const demoPlazaContent: DemoPlazaContent[] = [
  {
    id: 'plaza_content_01',
    title: '智能体资讯订阅',
    summary: '统一查看智能体的资讯播报、订阅提醒和推荐专题。',
    tag: '资讯',
    path: '/plaza/content/plaza_content_01',
  },
  {
    id: 'plaza_content_02',
    title: '专家课程精选',
    summary: '把适合当前研学主题的专家课程、试听课和断点续播集中起来。',
    tag: '课程',
    path: '/plaza/content/plaza_content_02',
  },
];

type DemoPlazaAgentSeed = {
  id: string;
  title: string;
  shortTitle: string;
  logo: string;
  accent: DemoPlazaAgent['accent'];
  category: DemoPlazaCategory;
  expertName: string;
  operatorName: string;
  oneLineIntro: string;
  tag: string;
  desc: string;
  scenes: [string, string, string];
  newsTitle: string;
  newsSummary: string;
  courseTitle: string;
  courseSummary: string;
  challengeTitle: string;
  challengeSummary: string;
  targetPath?: string;
};

function buildDemoPlazaAgent(seed: DemoPlazaAgentSeed): DemoPlazaAgent {
  return {
    id: seed.id,
    title: seed.title,
    shortTitle: seed.shortTitle,
    logo: seed.logo,
    accent: seed.accent,
    desc: seed.desc,
    expertName: seed.expertName,
    expertAvatarOrLogo: seed.logo,
    operatorName: seed.operatorName,
    oneLineIntro: seed.oneLineIntro,
    companionModes: ['text', 'voice', 'image'],
    tag: seed.tag,
    category: seed.category,
    scenes: seed.scenes,
    openPath: '/ask',
    subscriptionSummary: `可订阅 ${seed.title} 的资讯、课程和专题挑战提醒。`,
    news: [
      {
        id: `${seed.id}_news_01`,
        title: seed.newsTitle,
        summary: seed.newsSummary,
        publishedAt: '今天 09:00',
        autoNext: true,
        audioDuration: '01:08',
        paragraphs: [
          seed.newsSummary,
          `本期内容适合结合“${seed.scenes[0]}”“${seed.scenes[1]}”等场景继续追问。`,
          '听完后可以直接进入专家伴学、课程或专题挑战继续学习。',
        ],
      },
    ],
    courses: [
      {
        id: `${seed.id}_course_01`,
        title: seed.courseTitle,
        summary: seed.courseSummary,
        tutor: seed.expertName,
        isPreviewFree: true,
        progress: 0,
        resumeHint: '还没有开始学习',
        chapters: [
          {
            id: `${seed.id}_lesson_01`,
            title: `第 1 课 ${seed.title}怎么入门`,
            duration: '08:20',
            status: '待学习',
          },
          {
            id: `${seed.id}_lesson_02`,
            title: `第 2 课 ${seed.title}怎么用在真实任务里`,
            duration: '09:10',
            status: '待学习',
          },
        ],
        notes: [],
      },
    ],
    challenges: [
      {
        id: `${seed.id}_challenge_01`,
        title: seed.challengeTitle,
        mode: '个人挑战',
        summary: seed.challengeSummary,
        status: '待开始',
        targetPath: seed.targetPath ?? '/tasks',
      },
    ],
  };
}

const demoExpandedPlazaAgents: DemoPlazaAgent[] = [
  buildDemoPlazaAgent({
    id: 'plaza_agent_09',
    title: 'AI动漫',
    shortTitle: 'AI动漫',
    logo: '漫',
    accent: 'pink',
    category: '科技',
    expertName: '动漫创作教练',
    operatorName: 'AI 动漫工坊',
    oneLineIntro: '把角色、分镜和故事灵感变成能展示的动漫创意。',
    tag: '动漫创作',
    desc: '围绕角色设定、故事板、镜头设计和 AI 动漫创作提供伴学、课程与挑战。',
    scenes: ['设计动漫角色', '整理故事分镜', '把观察改编成动漫情节'],
    newsTitle: 'AI 动漫课堂开始流行“观察改编”练习',
    newsSummary: '把真实观察到的人物、场景和动作改编成动漫情节，更适合研学创作展示。',
    courseTitle: 'AI 动漫创作入门课',
    courseSummary: '从角色设定、分镜草图到画面表达，完成一次动漫创作体验。',
    challengeTitle: '观察故事改编挑战',
    challengeSummary: '把一次研学观察改编成 3 格动漫分镜并讲清楚角色动作。',
    targetPath: '/tasks/task_demo_01',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_10',
    title: 'AI编程',
    shortTitle: 'AI编程',
    logo: '码',
    accent: 'blue',
    category: '科技',
    expertName: '少儿编程教练',
    operatorName: '腾讯青训营',
    oneLineIntro: '把问题拆开、把步骤排好，再让 AI 帮你写出可运行思路。',
    tag: '编程启蒙',
    desc: '提供算法启蒙、项目拆解、代码示例和编程任务伴学，适合科技研学与创客活动。',
    scenes: ['设计小程序逻辑', '理解机器人指令', '把观察流程写成步骤'],
    newsTitle: 'AI 编程启蒙更强调“先想清楚再动手”',
    newsSummary: '越来越多编程课程把问题拆解和流程表达放在写代码之前，帮助孩子形成结构化思维。',
    courseTitle: 'AI 编程启蒙课',
    courseSummary: '从步骤思维、条件判断到简单项目设计，建立编程基本感觉。',
    challengeTitle: '观察流程编程挑战',
    challengeSummary: '把一次研学观察过程写成清晰步骤，并说明哪里适合用程序自动完成。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_11',
    title: '3D打印',
    shortTitle: '3D打印',
    logo: '打',
    accent: 'orange',
    category: '科技',
    expertName: '创客制造导师',
    operatorName: '创客实验室',
    oneLineIntro: '从一个想法到一个实体模型，帮你看懂 3D 打印的设计逻辑。',
    tag: '创客制造',
    desc: '围绕三维建模、实体制作、结构验证和创客作品展示提供完整学习支持。',
    scenes: ['设计小模型', '理解结构与支撑', '把创意做成实体作品'],
    newsTitle: '校园创客课开始用 3D 打印做研学模型',
    newsSummary: '学生会先根据观察对象画出结构草图，再把模型打印出来用于展示和讲解。',
    courseTitle: '3D 打印创客课',
    courseSummary: '认识建模、切片、打印和展示四个关键环节，完成一件创客作品。',
    challengeTitle: '模型结构观察挑战',
    challengeSummary: '选择一个研学对象，提出适合做成 3D 模型的结构方案。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_12',
    title: '机器人',
    shortTitle: '机器人',
    logo: '机',
    accent: 'teal',
    category: '科技',
    expertName: '机器人导师',
    operatorName: '机器人创新实验室',
    oneLineIntro: '帮你理解机器人怎么感知、怎么行动、怎么完成任务。',
    tag: '机器人探索',
    desc: '聚焦机器人结构、感知、执行与任务设计，适合机器人研学和科技馆任务。',
    scenes: ['观察机器人动作', '理解传感器作用', '设计机器人任务路线'],
    newsTitle: '服务机器人正在进入更多公共学习场景',
    newsSummary: '从讲解、运输到巡视，机器人开始在真实场景中承担更多具体任务。',
    courseTitle: '机器人观察课',
    courseSummary: '认识机器人结构、传感器和任务逻辑，学会用问题去观察机器人。',
    challengeTitle: '机器人任务设计挑战',
    challengeSummary: '为一个机器人设计一条服务路线，并说明它需要哪些感知能力。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_13',
    title: '卫星航天',
    shortTitle: '卫星航天',
    logo: '航',
    accent: 'purple',
    category: '科技',
    expertName: '航天科普导师',
    operatorName: '卫星航天研究社',
    oneLineIntro: '让遥远的卫星、火箭和航天任务变成孩子能理解的知识。',
    tag: '航天启蒙',
    desc: '围绕火箭发射、卫星功能、太空任务和航天探索精神提供伴学支持。',
    scenes: ['理解卫星用途', '认识火箭发射过程', '把航天知识讲给同学听'],
    newsTitle: '小型卫星任务越来越适合青少年科普学习',
    newsSummary: '通过观测、通信和环境监测案例，孩子更容易理解卫星为什么重要。',
    courseTitle: '卫星航天启蒙课',
    courseSummary: '从火箭、卫星到太空任务，建立航天探索的基础知识地图。',
    challengeTitle: '我的太空任务设想',
    challengeSummary: '为一颗想象中的小卫星设计功能，并说明它能帮助人们解决什么问题。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_14',
    title: '华大基因',
    shortTitle: '华大基因',
    logo: '基',
    accent: 'green',
    category: '科技',
    expertName: '生命科学导师',
    operatorName: '华大基因',
    oneLineIntro: '把抽象的基因、生命与健康知识讲成孩子能听懂的故事。',
    tag: '生命科学',
    desc: '提供基因、生命科学、健康科普和实验观察相关的资讯、课程与问答能力。',
    scenes: ['认识基因基础概念', '理解生命多样性', '连接健康与科学观察'],
    newsTitle: '生命科学课程开始强调“从观察到证据”',
    newsSummary: '学生通过样本、现象和数据建立生命科学理解，不再只是记结论。',
    courseTitle: '生命科学观察课',
    courseSummary: '从细胞、基因到生命现象，建立基础生命科学认知。',
    challengeTitle: '生命现象观察挑战',
    challengeSummary: '记录一个你观察到的生命现象，并用证据解释你的判断。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_15',
    title: '腾讯青训营',
    shortTitle: '青训营',
    logo: '腾',
    accent: 'blue',
    category: '科技',
    expertName: '科技项目教练',
    operatorName: '腾讯青训营',
    oneLineIntro: '用项目化方式带你理解技术、合作和表达。',
    tag: '项目研学',
    desc: '围绕技术项目、团队协作、问题拆解与成果展示提供项目化伴学能力。',
    scenes: ['做科技小项目', '练习任务拆解', '准备项目展示讲解'],
    newsTitle: '越来越多科技营开始用真实项目训练表达力',
    newsSummary: '学生不仅要做出结果，也要学会说明自己如何发现问题、验证方案和完成展示。',
    courseTitle: '科技项目启航课',
    courseSummary: '从选题、分工到展示，体验一次完整的科技项目研学。',
    challengeTitle: '项目路演挑战',
    challengeSummary: '围绕一个科技主题做出项目提案，并讲清问题、方案和分工。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_16',
    title: '奇趣科学',
    shortTitle: '奇趣科学',
    logo: '趣',
    accent: 'orange',
    category: '科技',
    expertName: '科学实验老师',
    operatorName: '奇趣科学社',
    oneLineIntro: '把好奇心留住，再把它变成真正的问题和实验。',
    tag: '科学实验',
    desc: '以趣味实验、现象观察和问题追问为主线，帮助孩子建立科学探究兴趣。',
    scenes: ['观察有趣现象', '做简单科学实验', '把好奇变成问题'],
    newsTitle: '趣味科学课正在把“先猜想”放到实验前面',
    newsSummary: '先说出自己的猜想，再观察结果，孩子更容易建立真正的探究意识。',
    courseTitle: '奇趣科学实验课',
    courseSummary: '用好玩的科学现象带出观察、猜想、验证和表达。',
    challengeTitle: '现象猜想挑战',
    challengeSummary: '选择一个有趣现象，说出你的猜想并记录验证过程。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_17',
    title: '5D理工(冷湖实验室)',
    shortTitle: '5D理工',
    logo: '理',
    accent: 'teal',
    category: '科技',
    expertName: '理工探究导师',
    operatorName: '冷湖实验室',
    oneLineIntro: '把理工思维放进真实观察和未来场景里。',
    tag: '理工探索',
    desc: '围绕未来科技、理工方法、跨学科观察和实验室案例提供系统化伴学。',
    scenes: ['理解前沿理工案例', '把观察转成实验想法', '连接真实场景与未来科技'],
    newsTitle: '前沿实验室越来越重视跨学科问题解决',
    newsSummary: '从材料到能源，从观测到设计，理工学习正在更强调真实问题和跨学科整合。',
    courseTitle: '5D 理工探索课',
    courseSummary: '从真实案例出发理解理工方法，建立前沿科技观察视角。',
    challengeTitle: '未来科技设想挑战',
    challengeSummary: '结合一次观察经历，提出一个未来科技应用设想并说明价值。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_18',
    title: '一人公司',
    shortTitle: '一人公司',
    logo: '一',
    accent: 'orange',
    category: '商业',
    expertName: '商业实践导师',
    operatorName: '一人公司实验室',
    oneLineIntro: '从一个人怎么发现需求、设计产品到完成表达，理解小商业闭环。',
    tag: '商业实践',
    desc: '围绕需求发现、产品思维、个人表达与价值交换，帮助孩子理解微型商业模型。',
    scenes: ['观察用户需求', '设计自己的小产品', '练习讲清价值主张'],
    newsTitle: '儿童商业启蒙开始强调“一个人也能做成小项目”',
    newsSummary: '从发现需求到做出样品，再到说明价值，孩子可以体验完整的小商业流程。',
    courseTitle: '一人公司启蒙课',
    courseSummary: '认识需求、产品、宣传和交付，理解一个小商业项目如何运转。',
    challengeTitle: '我的小产品挑战',
    challengeSummary: '围绕一个真实需求设计小产品，并说明它帮谁解决了什么问题。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_19',
    title: '少年马斯克',
    shortTitle: '少年马斯克',
    logo: '马',
    accent: 'blue',
    category: '商业',
    expertName: '创新创业教练',
    operatorName: '少年马斯克',
    oneLineIntro: '把想象力、行动力和商业思维放到一个真实项目里。',
    tag: '创新商业',
    desc: '聚焦创新创业、产品构想、表达展示和少年商业体验项目。',
    scenes: ['构思创新项目', '做产品表达展示', '练习商业路演'],
    newsTitle: '青少年创业项目更看重问题意识和行动方案',
    newsSummary: '好的项目不只是点子新，还要说清它解决了谁的什么问题。',
    courseTitle: '少年创新项目课',
    courseSummary: '从问题发现、方案设计到路演表达，体验一次少年创业项目。',
    challengeTitle: '创新项目路演挑战',
    challengeSummary: '为一个校园或生活问题做出创新方案，并用 1 分钟讲清价值。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_20',
    title: '财商思维',
    shortTitle: '财商思维',
    logo: '财',
    accent: 'green',
    category: '商业',
    expertName: '财商启蒙老师',
    operatorName: '财商成长营',
    oneLineIntro: '用孩子听得懂的话理解金钱、选择、计划和价值。',
    tag: '财商启蒙',
    desc: '从储蓄、预算、价值交换到消费决策，帮助孩子形成基础财商思维。',
    scenes: ['理解预算安排', '比较商品价值', '做消费选择判断'],
    newsTitle: '财商教育越来越重视“会选择”而不是只会计算',
    newsSummary: '孩子需要理解价值、延迟满足和预算安排，才能真正形成财商意识。',
    courseTitle: '财商思维启蒙课',
    courseSummary: '从储蓄、预算到价值判断，建立基础财商认知。',
    challengeTitle: '预算安排挑战',
    challengeSummary: '给一次活动做简单预算，并解释你为什么这样安排。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_21',
    title: '商业模式',
    shortTitle: '商业模式',
    logo: '模',
    accent: 'purple',
    category: '商业',
    expertName: '商业模型导师',
    operatorName: '商业创想社',
    oneLineIntro: '帮助孩子理解一件事为什么能长期做下去。',
    tag: '模式思维',
    desc: '围绕用户、价值、资源、合作和收入方式，带孩子理解基础商业模式。',
    scenes: ['拆解一个店铺怎么运转', '理解服务和顾客关系', '比较不同商业方案'],
    newsTitle: '商业模式课开始用身边案例解释“为什么能持续”',
    newsSummary: '从便利店、文创店到线上服务，孩子更容易从身边案例理解商业模式。',
    courseTitle: '商业模式观察课',
    courseSummary: '从顾客、价值到交付，认识商业模式的基本组成。',
    challengeTitle: '店铺模式拆解挑战',
    challengeSummary: '观察一个真实店铺，说明它服务谁、提供什么、为什么有人愿意付费。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_22',
    title: '商业工程学',
    shortTitle: '商业工程',
    logo: '工',
    accent: 'teal',
    category: '商业',
    expertName: '商业系统导师',
    operatorName: '商业工程实验室',
    oneLineIntro: '把商业看成一个可以拆解、可以优化的系统工程。',
    tag: '系统思维',
    desc: '用系统化方法理解商业流程、协作链路、资源配置和执行效率。',
    scenes: ['拆解服务流程', '思考资源配置', '设计更高效的执行方案'],
    newsTitle: '商业学习开始引入流程拆解和系统优化方法',
    newsSummary: '孩子通过流程图和角色分工，能更直观地理解商业如何运转与优化。',
    courseTitle: '商业工程学入门课',
    courseSummary: '从流程、角色、资源和效率四个维度理解商业系统。',
    challengeTitle: '流程优化挑战',
    challengeSummary: '挑选一个熟悉的服务流程，提出一个让它更顺畅的改进方案。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_23',
    title: '第一性原理',
    shortTitle: '第一性原理',
    logo: '原',
    accent: 'blue',
    category: '商业',
    expertName: '思维训练导师',
    operatorName: '第一性思考营',
    oneLineIntro: '帮助孩子把复杂问题拆回最基本的事实和条件。',
    tag: '思维训练',
    desc: '围绕拆解问题、回到本质、重建方案的过程，培养基础第一性思维。',
    scenes: ['分析一个复杂问题', '拆掉习惯性答案', '重新提出更合理方案'],
    newsTitle: '第一性原理开始进入青少年创新课程',
    newsSummary: '先问“最基本的事实是什么”，再想办法，孩子更容易形成独立思考。',
    courseTitle: '第一性思维训练课',
    courseSummary: '从问题拆解、本质判断到重建方案，练习更底层的思考方式。',
    challengeTitle: '问题拆解挑战',
    challengeSummary: '选择一个常见问题，把它拆成最基础的三个事实再重新提出方案。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_24',
    title: '樊登读书',
    shortTitle: '樊登读书',
    logo: '读',
    accent: 'green',
    category: '成长',
    expertName: '阅读成长导师',
    operatorName: '樊登读书',
    oneLineIntro: '把阅读输入变成真正会说、会写、会表达的能力。',
    tag: '阅读成长',
    desc: '围绕阅读理解、观点表达、亲子共读和成长课程提供长期伴学支持。',
    scenes: ['读完后整理观点', '做亲子共读分享', '把一本书讲给别人听'],
    newsTitle: '阅读陪伴正在从“读完一本书”转向“表达一本书”',
    newsSummary: '越来越多阅读课程开始重视孩子读完后的表达、连接和行动。',
    courseTitle: '阅读表达成长课',
    courseSummary: '从阅读理解到表达输出，形成完整的阅读成长闭环。',
    challengeTitle: '一本书讲给你听挑战',
    challengeSummary: '挑选一本最近读过的书，用 1 分钟讲清它最值得分享的一个观点。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_25',
    title: '千问智学',
    shortTitle: '千问智学',
    logo: '问',
    accent: 'blue',
    category: '成长',
    expertName: '智能学习教练',
    operatorName: '千问智学',
    oneLineIntro: '把提问、理解和整理知识变成一套更聪明的学习方法。',
    tag: '智能学习',
    desc: '通过提问引导、知识整理、错题反思和学习策略，提升孩子的自主学习能力。',
    scenes: ['不会时先追问', '整理学习方法', '复盘一次学习过程'],
    newsTitle: 'AI 学习助手开始更重视“会不会提问”',
    newsSummary: '好的问题能帮助孩子更快定位盲点，也更容易建立自主学习节奏。',
    courseTitle: '提问式学习方法课',
    courseSummary: '从会提问、会整理到会复盘，建立更主动的学习方式。',
    challengeTitle: '我的提问清单挑战',
    challengeSummary: '围绕一个学习主题提出 5 个好问题，并标出最值得追问的一个。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_26',
    title: 'AI学习',
    shortTitle: 'AI学习',
    logo: '学',
    accent: 'teal',
    category: '成长',
    expertName: 'AI 学习伙伴',
    operatorName: 'AI 学习实验室',
    oneLineIntro: '把 AI 变成学习助手，而不是只用来找答案。',
    tag: '学习陪伴',
    desc: '帮助孩子用 AI 做预习、整理、表达和复盘，建立更高质量的学习闭环。',
    scenes: ['预习新主题', '整理课堂重点', '把知识做成自己的表达'],
    newsTitle: 'AI 陪学开始从答题走向方法训练',
    newsSummary: '真正有效的 AI 学习，不是代替思考，而是帮助孩子学会怎么思考。',
    courseTitle: 'AI 学习方法课',
    courseSummary: '从预习、整理到复盘，学习如何把 AI 用在真正有价值的地方。',
    challengeTitle: 'AI 学习复盘挑战',
    challengeSummary: '用 AI 帮你整理一次学习过程，并说出它最有帮助的一个地方。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_27',
    title: '未来学校',
    shortTitle: '未来学校',
    logo: '未',
    accent: 'purple',
    category: '成长',
    expertName: '未来教育导师',
    operatorName: '未来学校研究社',
    oneLineIntro: '带你理解未来学习可能长什么样，也帮你找到自己的学习节奏。',
    tag: '未来教育',
    desc: '围绕未来教育、项目学习、跨学科成长和学习方式升级提供内容与伴学能力。',
    scenes: ['理解未来课堂', '体验项目式学习', '思考自己适合的学习方式'],
    newsTitle: '未来学校更重视真实项目和跨学科学习',
    newsSummary: '从做中学、在真实问题中学，正在成为越来越多未来教育场景的共同特征。',
    courseTitle: '未来学校体验课',
    courseSummary: '从课程样态到学习方式，认识未来教育的发展方向。',
    challengeTitle: '我的理想课堂挑战',
    challengeSummary: '设计一节你最想上的未来课堂，并说明它为什么更适合你学习。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_28',
    title: '天赋测试',
    shortTitle: '天赋测试',
    logo: '赋',
    accent: 'orange',
    category: '成长',
    expertName: '潜能发展导师',
    operatorName: '潜能发展中心',
    oneLineIntro: '帮助孩子看见自己的兴趣倾向、优势行为和发展方向。',
    tag: '潜能发现',
    desc: '通过兴趣线索、行为表现与能力特征，帮助孩子做更早期的天赋与优势识别。',
    scenes: ['识别兴趣偏好', '理解自己的优势', '记录成长线索'],
    newsTitle: '天赋探索越来越重视真实行为证据',
    newsSummary: '孩子的优势不是凭感觉判断，而要结合长期行为、兴趣和任务表现来观察。',
    courseTitle: '优势发现小课',
    courseSummary: '从兴趣、行为和表现三条线索，看见自己的潜能方向。',
    challengeTitle: '我的优势线索挑战',
    challengeSummary: '记录最近一次任务中的亮点表现，并说出它可能反映了哪种优势。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_29',
    title: '能力日图谱',
    shortTitle: '能力图谱',
    logo: '图',
    accent: 'teal',
    category: '成长',
    expertName: '能力发展导师',
    operatorName: '能力图谱研究室',
    oneLineIntro: '把每天的任务表现慢慢沉淀成能看见的能力地图。',
    tag: '能力发展',
    desc: '围绕能力记录、成长趋势、阶段反馈和每日表现沉淀，帮助孩子看见成长轨迹。',
    scenes: ['回看每日成长', '识别能力强项', '制定下一步提升计划'],
    newsTitle: '能力图谱开始用于追踪孩子的长期成长变化',
    newsSummary: '通过持续记录任务表现和学习行为，能力发展开始变得更可视、更容易讨论。',
    courseTitle: '能力成长地图课',
    courseSummary: '认识能力标签、成长趋势和阶段复盘的方法，学会看懂自己的成长图谱。',
    challengeTitle: '一周成长复盘挑战',
    challengeSummary: '回看一周任务表现，找出你最明显提升的一项能力并说明原因。',
  }),
  buildDemoPlazaAgent({
    id: 'plaza_agent_30',
    title: '生涯规划',
    shortTitle: '生涯规划',
    logo: '涯',
    accent: 'blue',
    category: '成长',
    expertName: '生涯规划导师',
    operatorName: '生涯规划中心',
    oneLineIntro: '从兴趣、能力和未来想象出发，帮助孩子更早建立方向感。',
    tag: '方向探索',
    desc: '围绕职业想象、成长路径、兴趣能力连接和未来方向探索提供系统陪伴。',
    scenes: ['想象未来职业', '连接兴趣和能力', '做成长方向规划'],
    newsTitle: '儿童生涯规划正在从“职业介绍”走向“方向探索”',
    newsSummary: '真正有用的生涯启蒙，不是过早确定职业，而是先看见兴趣、能力和可能性。',
    courseTitle: '未来方向探索课',
    courseSummary: '从兴趣、能力到职业想象，建立初步的生涯规划意识。',
    challengeTitle: '我的未来方向卡',
    challengeSummary: '写下一个你最感兴趣的未来方向，并说明你现在已经具备了哪些相关能力。',
  }),
];

export const demoPlazaAgents: DemoPlazaAgent[] = [
  {
    id: 'plaza_agent_01',
    title: '科技探索助手',
    shortTitle: '科技探索',
    logo: '科',
    accent: 'blue',
    desc: '适合观察装置、实验现象和科学原理的 AI 智能体，支持资讯、课程和挑战入口。',
    expertName: '刘博士',
    expertAvatarOrLogo: '刘',
    operatorName: '腾讯青训营',
    oneLineIntro: '把现场观察变成能继续追问的科学问题。',
    companionModes: ['text', 'voice', 'image'],
    tag: '观察智能体',
    category: '科技',
    recent: true,
    subscribed: true,
    scenes: ['拍照观察实验装置', '现场提问科学现象', '收听科技资讯播报'],
    openPath: '/ask',
    subscriptionSummary: '已订阅科技馆和科学观察相关资讯，每次播报后会自动切换下一条。',
    news: [
      {
        id: 'agent_01_news_01',
        title: '深海探测机器人完成新一轮海底采样',
        summary: '适合结合海洋馆任务，理解机器人如何在复杂环境中完成探测。',
        publishedAt: '今天 09:20',
        autoNext: true,
        audioDuration: '01:20',
        paragraphs: [
          '本期资讯围绕深海探测机器人展开，重点关注它如何通过机械臂、摄像头和传感器完成取样。',
          '如果你正在做海洋观察任务，可以思考机器人和潜水员在探测方式上的不同。',
          '播报结束后会自动进入下一条，适合在步行或集合途中持续听。'],
      },
      {
        id: 'agent_01_news_02',
        title: '小学生科技节新增“环保发明”展示专区',
        summary: '从校园科技节案例中学习如何把观察结果变成创新方案。',
        publishedAt: '昨天 16:40',
        autoNext: true,
        audioDuration: '00:58',
        paragraphs: [
          '这条资讯介绍了环保发明专区的展示方式，包括问题发现、方案草图和作品演示。',
          '它非常适合和你们的环保倡议、海报创作任务联动。',
          '听完可以直接去课程区看“从观察到发明”的方法课。'],
      },
    ],
    courses: [
      {
        id: 'agent_01_course_01',
        title: '海洋科技观察课',
        summary: '跟着专家从海豚行为、机器人观察器和海洋保护设备认识科技应用。',
        tutor: '刘老师',
        isPreviewFree: true,
        progress: 48,
        resumeHint: '上次看到 第 2 课《水下观察器怎么工作》',
        favorite: true,
        chapters: [
          { id: 'lesson_01_01', title: '第 1 课 海洋馆里的科技设备', duration: '08:20', status: '已学完' },
          { id: 'lesson_01_02', title: '第 2 课 水下观察器怎么工作', duration: '10:10', status: '学习中' },
          { id: 'lesson_01_03', title: '第 3 课 用观察记录提出问题', duration: '09:30', status: '待学习' },
        ],
        notes: [
          { id: 'note_01_01', title: '观察器闪记', content: '水下观察器主要依靠镜头、补光和稳定结构完成记录。', createdAt: '今天 10:32' },
        ],
      },
    ],
    challenges: [
      {
        id: 'agent_01_challenge_01',
        title: '海洋装置观察挑战',
        mode: '个人挑战',
        summary: '独立记录一个馆内科技装置，并说明它解决了什么问题。',
        status: '进行中',
        targetPath: '/tasks/task_demo_01',
      },
    ],
  },
  {
    id: 'plaza_agent_02',
    title: '国学阅读伙伴',
    shortTitle: '阅读伙伴',
    logo: '读',
    accent: 'green',
    desc: '提供古诗文导读、阅读表达训练和伴学课程，适合读书与表达类场景。',
    expertName: '樊登老师',
    expertAvatarOrLogo: '樊',
    operatorName: '樊登读书',
    oneLineIntro: '把阅读输入慢慢变成清楚表达。',
    companionModes: ['text', 'voice', 'image'],
    tag: '伴学智能体',
    category: '成长',
    recent: true,
    scenes: ['读书打卡前预习', '古诗文朗读陪练', '阅读后表达训练'],
    openPath: '/ask',
    subscriptionSummary: '可免费订阅每日阅读播报，自动连播本周推荐内容。',
    news: [
      {
        id: 'agent_02_news_01',
        title: '本周阅读主题：春日里的植物观察',
        summary: '把阅读与自然观察结合，帮助孩子把“看到”变成“能表达”。',
        publishedAt: '今天 07:50',
        autoNext: true,
        audioDuration: '01:05',
        paragraphs: [
          '本周推荐围绕“植物观察”展开，阅读内容包括观察顺序、细节记录和描述技巧。',
          '适合配合观察型作品或成长里的能力自测一起使用。'],
      },
    ],
    courses: [
      {
        id: 'agent_02_course_01',
        title: '表达力训练小课',
        summary: '从看图描述、阅读理解到口头表达，逐步提升语言沟通能力。',
        tutor: '张老师',
        isPreviewFree: true,
        progress: 20,
        resumeHint: '上次试听 第 1 课《把看到的说清楚》',
        chapters: [
          { id: 'lesson_02_01', title: '第 1 课 把看到的说清楚', duration: '07:40', status: '学习中' },
          { id: 'lesson_02_02', title: '第 2 课 读完以后怎么总结', duration: '08:15', status: '待学习' },
        ],
        notes: [],
      },
    ],
    challenges: [
      {
        id: 'agent_02_challenge_01',
        title: '一句话讲清楚挑战',
        mode: '个人挑战',
        summary: '围绕当天观察内容，用 1 句话说明对象、动作和你的判断。',
        status: '待开始',
        targetPath: '/tasks',
      },
    ],
  },
  {
    id: 'plaza_agent_03',
    title: '海洋知识助手',
    shortTitle: '海洋助手',
    logo: '海',
    accent: 'teal',
    desc: '问答、识物、知识卡和专家陪伴式学习联动，适合海洋馆研学与现场观察。',
    expertName: '王专家',
    expertAvatarOrLogo: '王',
    operatorName: '海洋科普中心',
    oneLineIntro: '看图、听描述、接着问，帮你把观察讲清楚。',
    companionModes: ['text', 'voice', 'image'],
    tag: '专家智能体',
    category: '成长',
    recent: true,
    subscribed: true,
    scenes: ['拍拍后发给专家', '随时追问海洋知识', '接收海洋主题课程和资讯推送'],
    openPath: '/ask',
    subscriptionSummary: '已订阅海洋主题资讯和课程提醒，会在消息中收到订阅通知。',
    news: [
      {
        id: 'agent_03_news_01',
        title: '海豚为什么喜欢成群活动？',
        summary: '通过一条轻量音频资讯，认识海豚的社群协作和沟通方式。',
        publishedAt: '今天 11:10',
        autoNext: true,
        audioDuration: '01:12',
        paragraphs: [
          '海豚通常成群活动，因为群体可以帮助它们更快发现食物，也更容易彼此提醒危险。',
          '如果你今天拍到了海豚，可以试着观察它们是否有同步转向或跳跃的行为。'],
      },
      {
        id: 'agent_03_news_02',
        title: '海洋保护从减少一次性塑料开始',
        summary: '结合环保任务，理解个人行为与海洋环境保护之间的联系。',
        publishedAt: '昨天 18:10',
        autoNext: true,
        audioDuration: '00:52',
        paragraphs: [
          '这条播报围绕一次性塑料对海洋动物的影响展开。',
          '听完可以直接去挑战区查看团队环保倡议任务。'],
      },
    ],
    courses: [
      {
        id: 'agent_03_course_01',
        title: '海豚观察与表达课',
        summary: '从外形、动作、群体协作到表达方法，适合海洋馆实地研学同步学习。',
        tutor: '王专家',
        isPreviewFree: true,
        progress: 65,
        resumeHint: '上次看到 第 3 课《海豚为什么会跃出水面》',
        favorite: true,
        shared: true,
        chapters: [
          { id: 'lesson_03_01', title: '第 1 课 认识海豚身体结构', duration: '06:50', status: '已学完' },
          { id: 'lesson_03_02', title: '第 2 课 观察海豚群体活动', duration: '09:20', status: '已学完' },
          { id: 'lesson_03_03', title: '第 3 课 海豚为什么会跃出水面', duration: '08:30', status: '学习中' },
          { id: 'lesson_03_04', title: '第 4 课 把观察结果讲给别人听', duration: '07:45', status: '待学习' },
        ],
        notes: [
          { id: 'note_03_01', title: '海豚闪记', content: '海豚跃出水面可能和换气、交流或玩耍有关。', createdAt: '今天 13:40' },
          { id: 'note_03_02', title: '表达提示', content: '描述时先说对象，再说动作，最后说自己的判断。', createdAt: '今天 13:46' },
        ],
      },
      {
        id: 'agent_03_course_02',
        title: '海洋馆里的环保行动',
        summary: '结合海洋保护议题，学会把观察转化成倡议和展示内容。',
        tutor: '何老师',
        isPreviewFree: false,
        progress: 0,
        resumeHint: '可先试听第 1 节',
        chapters: [
          { id: 'lesson_03_05', title: '第 1 课 垃圾如何影响海洋生物', duration: '08:00', status: '待学习' },
          { id: 'lesson_03_06', title: '第 2 课 怎样写一张倡议卡', duration: '08:35', status: '待学习' },
        ],
        notes: [],
      },
    ],
    challenges: [
      {
        id: 'agent_03_challenge_01',
        title: '海豚观察挑战',
        mode: '个人挑战',
        summary: '拍下海豚动作并解释你观察到的一个现象。',
        status: '进行中',
        targetPath: '/tasks/task_demo_01',
      },
      {
        id: 'agent_03_challenge_02',
        title: '环保倡议团队挑战',
        mode: '团队挑战',
        summary: '与小组一起完成环保倡议卡和主题海报作品。',
        status: '进行中',
        targetPath: '/tasks/task_demo_02',
      },
    ],
  },
  {
    id: 'plaza_agent_04',
    title: '创意绘画教练',
    shortTitle: '绘画教练',
    logo: '绘',
    accent: 'pink',
    desc: '帮助孩子把观察内容转成画面表达，支持创作课程、点评建议和作品挑战。',
    expertName: '周老师',
    expertAvatarOrLogo: '周',
    operatorName: 'AI 创作实验室',
    oneLineIntro: '把脑子里的想法变成能展示的画面。',
    companionModes: ['text', 'voice', 'image'],
    tag: '创作智能体',
    category: '创作',
    scenes: ['海报创作前找灵感', '完成草图后优化构图', '接收创作任务提醒'],
    openPath: '/ai-draw',
    subscriptionSummary: '可接收创作灵感、优秀案例和作品挑战提醒。',
    news: [
      {
        id: 'agent_04_news_01',
        title: '环保主题海报怎样更有重点？',
        summary: '本期资讯分享海报画面里主题、口号和配色的组织方法。',
        publishedAt: '今天 08:15',
        autoNext: true,
        audioDuration: '00:48',
        paragraphs: [
          '一张环保主题海报通常先确定中心主题，再把行动口号放在最容易看见的位置。',
          '颜色上建议 2 到 3 个主色，不要信息太多。'],
      },
    ],
    courses: [
      {
        id: 'agent_04_course_01',
        title: '主题海报创作课',
        summary: '从主题、草图、配色到口号排版，完整演示一张研学海报如何完成。',
        tutor: '周老师',
        isPreviewFree: true,
        progress: 32,
        resumeHint: '上次看到 第 2 课《先画草图再上色》',
        chapters: [
          { id: 'lesson_04_01', title: '第 1 课 主题海报先确定什么', duration: '07:10', status: '已学完' },
          { id: 'lesson_04_02', title: '第 2 课 先画草图再上色', duration: '08:05', status: '学习中' },
          { id: 'lesson_04_03', title: '第 3 课 口号和行动建议怎么摆', duration: '06:40', status: '待学习' },
        ],
        notes: [
          { id: 'note_04_01', title: '海报闪记', content: '画面中心只保留一个主视觉，文字不要挤在一起。', createdAt: '今天 12:05' },
        ],
      },
    ],
    challenges: [
      {
        id: 'agent_04_challenge_01',
        title: '主题海报画作挑战',
        mode: '团队挑战',
        summary: '结合环保倡议任务完成一张主题海报，并说明想传递的观点。',
        status: '进行中',
        targetPath: '/tasks/task_demo_02',
      },
    ],
  },
  {
    id: 'plaza_agent_05',
    title: '运动健康伙伴',
    shortTitle: '运动伙伴',
    logo: '动',
    accent: 'orange',
    desc: '记录运动表现、提醒热身和恢复，适合活动前后的身体管理。',
    expertName: '陈教练',
    expertAvatarOrLogo: '陈',
    operatorName: '少年健康计划',
    oneLineIntro: '让活动前后都更会照顾自己的身体。',
    companionModes: ['text', 'voice', 'image'],
    tag: '陪练智能体',
    category: '健康',
    scenes: ['活动前热身提醒', '运动后恢复建议', '记录运动挑战'],
    openPath: '/ask',
    subscriptionSummary: '可订阅运动打卡和健康提醒。',
    news: [],
    courses: [],
    challenges: [
      {
        id: 'agent_05_challenge_01',
        title: '每日运动打卡挑战',
        mode: '个人挑战',
        summary: '连续打卡热身和整理活动记录，形成健康习惯。',
        status: '待开始',
        targetPath: '/growth/value',
      },
    ],
  },
  {
    id: 'plaza_agent_06',
    title: '社会责任顾问',
    shortTitle: '责任顾问',
    logo: '责',
    accent: 'purple',
    desc: '围绕社会责任、公民道德和环保议题，提供观点整理与案例启发。',
    expertName: '何老师',
    expertAvatarOrLogo: '何',
    operatorName: '未来学校研究社',
    oneLineIntro: '把观点、案例和行动建议连成一条线。',
    companionModes: ['text', 'voice', 'image'],
    tag: '思辨智能体',
    category: '成长',
    scenes: ['环保议题讨论', '社会责任案例阅读', '完成倡议类作品'],
    openPath: '/ask',
    subscriptionSummary: '支持订阅社会责任主题资讯和小组讨论提醒。',
    news: [
      {
        id: 'agent_06_news_01',
        title: '校园环保行动案例播报',
        summary: '通过真实案例帮助孩子理解“倡议”如何落地成行动。',
        publishedAt: '昨天 17:30',
        autoNext: true,
        audioDuration: '00:44',
        paragraphs: [
          '本条资讯介绍了一所学校如何通过垃圾分类、节水提示和班级行动来改善校园环境。',
          '你可以从中借鉴“问题 - 建议 - 行动”的表达结构。'],
      },
    ],
    courses: [],
    challenges: [
      {
        id: 'agent_06_challenge_01',
        title: '环保倡议表达挑战',
        mode: '团队挑战',
        summary: '围绕海洋保护写出 2 条行动建议并说明原因。',
        status: '进行中',
        targetPath: '/tasks/task_demo_02',
      },
    ],
  },
  {
    id: 'plaza_agent_07',
    title: '商业思维启蒙官',
    shortTitle: '商业启蒙',
    logo: '商',
    accent: 'blue',
    desc: '用儿童能理解的方式认识交换、成本和价值，适合商业体验类主题。',
    expertName: '马老师',
    expertAvatarOrLogo: '马',
    operatorName: '少年马斯克',
    oneLineIntro: '用孩子能懂的话讲清价值、成本和交换。',
    companionModes: ['text', 'voice', 'image'],
    tag: '启蒙智能体',
    category: '商业',
    scenes: ['职业体验前预习', '小摊位项目思考', '理解成本和价值'],
    openPath: '/ask',
    subscriptionSummary: '可订阅商业体验主题案例和启蒙课程。',
    news: [],
    courses: [
      {
        id: 'agent_07_course_01',
        title: '小小商业体验课',
        summary: '认识商品、顾客、成本和价值交换的基础概念。',
        tutor: '陈老师',
        isPreviewFree: true,
        progress: 0,
        resumeHint: '还没有开始学习',
        chapters: [
          { id: 'lesson_07_01', title: '第 1 课 什么是交换', duration: '06:20', status: '待学习' },
          { id: 'lesson_07_02', title: '第 2 课 商品和顾客', duration: '07:05', status: '待学习' },
        ],
        notes: [],
      },
    ],
    challenges: [],
  },
  {
    id: 'plaza_agent_08',
    title: '艺术表达工坊',
    shortTitle: '艺术工坊',
    logo: '艺',
    accent: 'pink',
    desc: '聚合文艺赏析、创作表达和案例灵感，适合文艺与综合创作场景。',
    expertName: '林老师',
    expertAvatarOrLogo: '林',
    operatorName: '文艺创作社',
    oneLineIntro: '给表达一点灵感，也给创作一点方法。',
    companionModes: ['text', 'voice', 'image'],
    tag: '创意智能体',
    category: '文艺',
    scenes: ['听艺术故事', '找创作灵感', '整理展示表达'],
    openPath: '/ai',
    subscriptionSummary: '可接收文艺作品推荐和创作灵感播报。',
    news: [],
    courses: [],
    challenges: [],
  },
  ...demoExpandedPlazaAgents,
];

export const demoFriends: DemoFriend[] = [
  { id: 'friend_01', name: '妈妈', note: '家庭联系人', status: 'online', relation: '家人', unread: 1 },
  { id: 'friend_02', name: '陈同学', note: '海豚探索队组长', status: 'online', relation: '同学', unread: 2 },
  { id: 'friend_03', name: '王导师', note: '班级导师', status: 'offline', relation: '导师' },
];

export const demoMicrochatThreads: DemoMicrochatThread[] = [
  {
    id: 'microchat_01',
    friendId: 'friend_01',
    title: '妈妈',
    unread: 1,
    lastMessage: '晚上记得讲给家里人听。',
    messages: [
      { id: 'micro_1', author: '妈妈', type: 'text', content: '今天拍到海豚了吗？', time: '13:20' },
      { id: 'micro_2', author: '我', type: 'image', content: '已发 1 张海豚照片', time: '13:24', self: true },
      { id: 'micro_3', author: '妈妈', type: 'voice', content: '晚上记得讲给家里人听。', time: '13:28' },
    ],
  },
  {
    id: 'microchat_02',
    friendId: 'friend_02',
    title: '陈同学',
    unread: 2,
    lastMessage: '环保倡议卡我已经写好开头。',
    messages: [
      { id: 'micro_4', author: '陈同学', type: 'text', content: '环保倡议卡我已经写好开头。', time: '14:02' },
      { id: 'micro_5', author: '我', type: 'text', content: '我来补第二条建议。', time: '14:04', self: true },
    ],
  },
];

export const demoGroupChats: DemoGroupChat[] = [
  {
    id: 'groupchat_01',
    title: '海豚探索队',
    badge: '小组群',
    unread: 3,
    members: ['陈同学', '李同学', '王同学'],
    messages: [
      { id: 'group_1', author: '王同学', type: 'image', content: '已上传海豚照片 2 张', time: '13:40' },
      { id: 'group_2', author: '陈同学', type: 'voice', content: '大家先集合，等会儿交任务。', time: '13:43' },
      { id: 'group_3', author: '我', type: 'task', content: '已同步任务卡：环保倡议卡', time: '13:45', self: true },
    ],
  },
  {
    id: 'groupchat_02',
    title: '5 班研学群',
    badge: '班级群',
    unread: 1,
    members: ['王导师', '海洋馆研学 5 班'],
    messages: [
      { id: 'group_4', author: '王导师', type: 'text', content: '15:00 请各组到海狮馆门口集合。', time: '14:10' },
    ],
  },
];

export const demoMeetings: DemoMeeting[] = [
  {
    id: 'meeting_01',
    title: '海豚观察碰头会',
    status: '进行中',
    startedAt: '14:30',
    participants: ['王导师', '陈同学', '李同学'],
    summary: '已确定观察顺序和展示分工。',
  },
  {
    id: 'meeting_02',
    title: '环保倡议汇总会',
    status: '待开始',
    startedAt: '16:10',
    participants: ['海豚探索队'],
    summary: '待开始后可切换到对讲并生成 AI 纪要。',
  },
];

export const demoMoments: DemoMoment[] = [
  {
    id: 'moment_01',
    author: '陈同学',
    content: '今天终于拍到了海豚跃出水面的瞬间！',
    createdAt: '今天 13:18',
    likes: 8,
    comments: 3,
    liked: true,
  },
  {
    id: 'moment_02',
    author: '妈妈',
    content: '看到你今天的研学日记啦，晚上回家讲给我们听。',
    createdAt: '今天 12:56',
    likes: 6,
    comments: 1,
  },
];

export const demoWalletRecords: DemoWalletRecord[] = [
  { id: 'wallet_01', title: '海洋馆午餐', amount: '-18.00', status: '成功', createdAt: '今天 12:10' },
  { id: 'wallet_02', title: '研学纪念贴纸', amount: '-9.90', status: '成功', createdAt: '昨天 17:24' },
  { id: 'wallet_03', title: '家长充值', amount: '+50.00', status: '成功', createdAt: '昨天 08:20' },
];

export const demoCloudCategories: DemoCloudCategory[] = [
  { id: 'cloud_image', title: '相册', count: 18, icon: 'image' },
  { id: 'cloud_video', title: '视频', count: 6, icon: 'video' },
  { id: 'cloud_audio', title: '音频', count: 9, icon: 'audio' },
  { id: 'cloud_doc', title: '文档', count: 7, icon: 'document' },
];

export const demoCloudFiles: DemoCloudFile[] = [
  {
    id: 'cloud_file_01',
    categoryId: 'cloud_image',
    title: '海豚跃出水面',
    size: '2.4 MB',
    updatedAt: '今天 13:26',
    type: '图片',
    source: '夸克网盘',
    preview: '拍摄于海豚馆主池边，适合加入观察任务。',
  },
  {
    id: 'cloud_file_02',
    categoryId: 'cloud_video',
    title: '海狮表演短片',
    size: '18.2 MB',
    updatedAt: '今天 14:02',
    type: '视频',
    source: '夸克网盘',
    preview: '15 秒片段，可用于课程复盘。',
  },
  {
    id: 'cloud_file_03',
    categoryId: 'cloud_doc',
    title: '海洋馆导览手册',
    size: '1.1 MB',
    updatedAt: '昨天 17:12',
    type: '文档',
    source: '百度网盘',
    preview: '包含路线图、集合点和任务说明。',
  },
  {
    id: 'cloud_file_04',
    categoryId: 'cloud_audio',
    title: '海豚观察口述',
    size: '680 KB',
    updatedAt: '今天 13:40',
    type: '音频',
    source: '夸克网盘',
    preview: '18 秒语音记录，可加入任务作品。',
  },
];

export const demoSettings: DemoSettingItem[] = [
  { id: 'setting_device', title: '设备绑定', summary: '查看绑定家长与设备码', path: '/settings/device' },
  { id: 'setting_switch_account', title: '切换账号', summary: '切换当前设备已登录过的学员账号', path: '/settings/switch-account' },
  { id: 'setting_password', title: '锁屏密码', summary: '设置 4 位锁屏密码', path: '/settings/password' },
  { id: 'setting_face', title: '人脸识别', summary: '管理刷脸识别与快捷登录', path: '/settings/face' },
];

export const demoAlbumItems: DemoAlbumItem[] = [
  {
    id: 'album_01',
    title: '海豚正面照',
    type: '照片',
    capturedAt: '今天 13:22',
    previewLabel: '海豚馆主池',
    accent: 'blue',
    primaryLabel: '海豚',
    recognizedNames: ['海豚', '海洋哺乳动物', '群居动物'],
    identifySummary: '识别到海豚，适合继续观察它的队形、跃出水面的动作和同伴互动。',
    identifySource: '拍照识别',
    confidence: 0.96,
  },
  {
    id: 'album_02',
    title: '海狮鼓掌短片',
    type: '视频',
    capturedAt: '今天 13:58',
    previewLabel: '海狮互动区',
    accent: 'orange',
    primaryLabel: '海狮',
    recognizedNames: ['海狮', '表演动作', '关键帧识别'],
    identifySummary: '根据关键帧识别到海狮，建议记录鼓掌、顶球等动作与训练提示。',
    identifySource: '关键帧识别',
    confidence: 0.9,
  },
  {
    id: 'album_03',
    title: '小组观察合影',
    type: '照片',
    capturedAt: '昨天 16:12',
    previewLabel: '小组合影',
    accent: 'green',
    primaryLabel: '观察记录',
    recognizedNames: ['观察记录', '团队合影', '研学现场'],
    identifySummary: '识别到团队合影场景，适合补充活动地点、分工和现场观察内容。',
    identifySource: '拍照识别',
    confidence: 0.82,
  },
];

export const demoFlashWorks: DemoFlashWork[] = [
  { id: 'flash_work_01', title: '海豚馆观察口述', type: '语音闪记', duration: '01:26', status: '已同步' },
  { id: 'flash_work_02', title: '海狮馆视频闪记', type: '视频闪记', duration: '00:28', status: '草稿' },
];

export const demoRankings: DemoRanking[] = [...demoTeamDetails.team_demo_01.groupRankings];

export const demoPersonalRankings: DemoPersonalRanking[] = [...demoTeamDetails.team_demo_01.personalRankings];

export const demoReviews: DemoReview[] = [
  {
    id: demoTeamDetails.team_demo_01.reviewConfig.selfReviewTask.id,
    title: demoTeamDetails.team_demo_01.reviewConfig.selfReviewTask.title,
    role: '自评',
    summary: demoTeamDetails.team_demo_01.reviewConfig.selfReviewTask.summary,
    status: demoTeamDetails.team_demo_01.reviewConfig.selfReviewTask.status,
  },
  {
    id: demoTeamDetails.team_demo_01.reviewConfig.peerReviewTask.id,
    title: demoTeamDetails.team_demo_01.reviewConfig.peerReviewTask.title,
    role: '互评',
    summary: demoTeamDetails.team_demo_01.reviewConfig.peerReviewTask.summary,
    status: demoTeamDetails.team_demo_01.reviewConfig.peerReviewTask.status,
  },
];

export const demoSelfTestPlanes: DemoSelfTestPlane[] = [
  { id: 'plane_self', title: '自主发展', summary: '关注身心健康、自我管理、问题解决和批判思维。', elements: ['身心健康', '自我管理', '问题解决', '批判思维'] },
  { id: 'plane_learning', title: '科技素养', summary: '关注人文审美、语言沟通、科技应用和数字素养。', elements: ['人文审美', '语言沟通', '科技应用', '数字素养'] },
  { id: 'plane_future', title: '创新发展', summary: '关注创新思维、跨学科融合、领导能力和商业思维。', elements: ['创新思维', '跨学科融合', '领导能力', '商业思维'] },
  { id: 'plane_social', title: '社会参与', summary: '关注公民道德、社会责任、国家认同和国际理解。', elements: ['公民道德', '社会责任', '国家认同', '国际理解'] },
];

const selfTestQuestionTemplates = [
  '面对需要%s的任务时，我会主动投入并坚持完成。',
  '遇到和%s相关的问题时，我愿意先观察再判断。',
  '完成需要%s的活动后，我会回头想还有哪里可以做得更好。',
  '和同伴一起完成任务时，我能把%s表现出来。',
];

const selfTestQuestionOptions = ['非常符合', '比较符合', '一般', '不太符合'];

export const demoSelfTestQuestions: DemoSelfTestQuestion[] = demoSelfTestPlanes.flatMap((plane) =>
  plane.elements.flatMap((elementKey, elementIndex) =>
    selfTestQuestionTemplates.map((template, templateIndex) => ({
      id: `self_test_q_${plane.id}_${elementIndex + 1}_${templateIndex + 1}`,
      planeKey:
        plane.id === 'plane_self'
          ? 'self'
          : plane.id === 'plane_learning'
            ? 'learning'
            : plane.id === 'plane_social'
              ? 'social'
              : 'future',
      elementKey,
      title: template.replace('%s', elementKey),
      options: selfTestQuestionOptions,
    })),
  ),
);

export const demoGrowthRules: DemoGrowthRule[] = [
  { id: 'growth_rule_01', group: '研学任务成长值', title: '团体研学任务', summary: '每个团体研学任务统一发放 100 成长值。' },
  { id: 'growth_rule_02', group: '研学任务成长值', title: '家庭研学任务', summary: '每个家庭研学任务统一发放 50 成长值。' },
  { id: 'growth_rule_03', group: '研学任务成长值', title: '日常研学任务', summary: '每个日常研学任务统一发放 10 成长值。' },
  { id: 'growth_rule_04', group: '专家课程成长值', title: '专家课程', summary: '每节专家课程奖励 50 成长值。' },
  { id: 'growth_rule_05', group: '专家课程成长值', title: 'PBL 项目', summary: '每个 PBL 项目奖励 500-5000 成长值。' },
  { id: 'growth_rule_06', group: '日常使用成长值', title: 'AI 创作', summary: '每次 AI 创作奖励 10 成长值。' },
  { id: 'growth_rule_07', group: '日常使用成长值', title: '每日打卡', summary: '每日完成打卡奖励 10 成长值。' },
  { id: 'growth_rule_08', group: '日常使用成长值', title: '使用时长', summary: '每使用 30 分钟研学宝奖励 10 成长值。' },
];

export const demoGrowthMallItems: DemoGrowthMallItem[] = [
  { id: 'mall_01', title: '海豚主题皮肤', type: '皮肤', cost: 200, status: '可兑换', exchangeNote: '兑换后会加入手表主题列表，可立即切换使用。' },
  { id: 'mall_02', title: '语音记录道具', type: '道具', cost: 120, status: '可兑换', exchangeNote: '兑换后会加入拍拍和闪记中的专属记录道具。' },
  { id: 'mall_03', title: '观察力提升课程', type: '课程', cost: 480, status: '可兑换', exchangeNote: '兑换后会同步到“我的课程”，可直接开始学习。' },
  { id: 'mall_04', title: '文创优惠券', type: '优惠券', cost: 150, status: '已兑换', exchangeNote: '兑换后会进入优惠券列表，可在线下核销使用。' },
  { id: 'mall_05', title: '海洋馆体验票', type: '体验商品', cost: 680, status: '可兑换', exchangeNote: '兑换后可在指定活动现场核销体验。' },
];

export const demoGrowthValueSummary: DemoGrowthValueSummary = {
  total: 860,
  available: 540,
  used: 320,
};

export const demoSosFlow: DemoSosFlow = {
  recordingSeconds: 10,
  sendMode: '自动发送',
  recipients: ['家长', '导师'],
};

export const demoSelfTestHistory: DemoSelfTestHistory[] = [
  {
    id: 'self_test_history_01',
    reportType: '学员自测报告',
    planeTitle: '科技素养',
    planeKey: 'learning',
    element: '科技应用',
    score: 8.4,
    latestIndex: 8.8,
    average: 7.7,
    totalScore: 8.4,
    elementCount: 1,
    testedAt: '今天 15:10',
  },
  {
    id: 'self_test_history_02',
    reportType: '学员自测报告',
    planeTitle: '社会参与',
    planeKey: 'social',
    element: '社会责任',
    score: 7.8,
    latestIndex: 8.5,
    average: 8.0,
    totalScore: 7.8,
    elementCount: 1,
    testedAt: '昨天 19:24',
  },
];

export const demoDiaries: DemoDiary[] = [
  { id: 'diary_01', title: '海豚观察日记', summary: '记录了海豚跃出水面的三次观察。', createdAt: '今天 14:20' },
  { id: 'diary_02', title: '环保倡议草稿', summary: '已经整理好倡议主题和口号。', createdAt: '昨天 18:12' },
];

export const demoFavorites: DemoFavorite[] = [
  { id: 'favorite_01', title: '海洋馆观察小课', type: '课程', summary: '已学到第 2 章。' },
  { id: 'favorite_02', title: '海豚协作知识卡', type: '知识卡', summary: '可结合任务与课程查看。' },
  { id: 'favorite_03', title: '海豚观察作品', type: '作品', summary: '已提交给导师。' },
];
