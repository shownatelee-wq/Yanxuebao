'use client';

import {
  AudioOutlined,
  CameraOutlined,
  LoadingOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, Segmented, Tag, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGrowthState } from '../../../../lib/device-growth-data';
import { type DemoTeam } from '../../../../lib/device-demo-data';
import { saveCaptureAsset } from '../../../../lib/device-capture-share';
import {
  buildQuickTaskSubmissionPreview,
  submitQuickTaskAnswer,
  useDeviceTaskSnapshot,
  upsertAssistantTask,
} from '../../../../lib/device-task-data';
import { useDeviceTeamSnapshot } from '../../../../lib/device-team-data';
import {
  VOICE_ASSISTANT_SCENE_OPTIONS,
  buildVoiceAssistantImageVariants,
  buildVoiceAssistantPlan,
  createEmptyVoiceAssistantSession,
  detectVoiceAssistantScene,
  getVoiceAssistantPrompt,
  useVoiceAssistantStore,
  type VoiceAssistantExecutionResult,
  type VoiceAssistantImageVariant,
  type VoiceAssistantResolvedScene,
  type VoiceAssistantScene,
} from '../../../../lib/device-voice-assistant';

function isSceneValue(value: string | null): value is VoiceAssistantScene {
  return value === 'free' || value === 'help' || value === 'team' || value === 'task' || value === 'self-test' || value === 'sos' || value === 'image' || value === 'quick-submit';
}

function formatCompletedAt() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '.');
}

function getSceneMeta(scene?: VoiceAssistantScene | VoiceAssistantResolvedScene) {
  return VOICE_ASSISTANT_SCENE_OPTIONS.find((item) => item.scene === scene) ?? null;
}

const SCENE_PAGE_SIZE = 2;
const IMAGE_SCENE_SUGGESTIONS = [
  '画一张海洋馆蓝色科普海报',
  '生成一组青蛙生态设施观察插画',
  '做 4 张雨林探险任务卡封面',
];
const QUICK_SUBMIT_EXAMPLES = [
  '生态设施大搜索任务 第一题“青蛙”',
  '观察海洋生物 第六题答案是海豚会用声音和手势训练',
];

function KeyboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="3" />
      <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 13h.01M10 13h.01M13 13h4" />
    </svg>
  );
}

export default function DeviceVoiceAssistantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryScene = searchParams.get('scene');
  const initialScene = isSceneValue(queryScene) ? queryScene : 'free';
  const [messageApi, contextHolder] = message.useMessage();
  const [listening, setListening] = useState(false);
  const [mockSceneIndex, setMockSceneIndex] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [thinkingMode, setThinkingMode] = useState<'fast' | 'think'>('fast');
  const [scenePageIndex, setScenePageIndex] = useState(0);
  const { capabilities } = useGrowthState();
  const { teams } = useDeviceTeamSnapshot();
  const { tasks } = useDeviceTaskSnapshot();
  const { store, setSession, updateSession, rememberResult, resetSession } = useVoiceAssistantStore();
  const activeSession = store.activeSession;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);

  function clearPendingTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  const createSceneSession = useCallback((scene: VoiceAssistantScene) => {
    if (scene === 'free') {
      return createEmptyVoiceAssistantSession();
    }

    const requiresManualInput = scene === 'image' || scene === 'quick-submit';
    return {
      ...createEmptyVoiceAssistantSession(scene),
      scene,
      resolvedScene: scene,
      transcript: requiresManualInput ? '' : getVoiceAssistantPrompt(scene),
      plan: null,
      result: null,
      selectedTeamId: undefined,
      selectedSelfTestMode: 'recommended' as const,
      selectedImageId: undefined,
      imageEditPrompt: '',
      generatedImages: [],
      step: 'understand' as const,
      updatedAt: new Date().toISOString(),
    };
  }, []);

  function openScene(scene: VoiceAssistantScene) {
    clearPendingTimers();
    setSession(createSceneSession(scene));
    setComposerOpen(false);
  }

  useEffect(() => {
    return () => {
      clearPendingTimers();
    };
  }, []);

  useEffect(() => {
    if (initialScene === 'free') {
      return;
    }

    if (activeSession.step !== 'wake' || activeSession.transcript.trim()) {
      return;
    }

    setSession(createSceneSession(initialScene));
  }, [activeSession.step, activeSession.transcript, createSceneSession, initialScene, setSession]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeSession.step, activeSession.transcript, activeSession.plan, activeSession.result, composerOpen]);

  const weakestCapability = useMemo(
    () => [...capabilities].sort((left, right) => left.score - right.score)[0] ?? null,
    [capabilities],
  );

  const nextTaskSequence = useMemo(
    () => Math.max(...tasks.map((task) => task.sequence), 0) + 1,
    [tasks],
  );

  const travelTeams = useMemo(
    () => teams.filter((team) => team.sourceType === '研学旅行推荐'),
    [teams],
  );

  const recommendedTeams = useMemo(() => {
    if (!activeSession.plan?.recommendedTeamIds?.length) {
      return [] as DemoTeam[];
    }

    return activeSession.plan.recommendedTeamIds
      .map((teamId) => travelTeams.find((team) => team.id === teamId))
      .filter((team): team is DemoTeam => Boolean(team));
  }, [activeSession.plan?.recommendedTeamIds, travelTeams]);

  const selectedTeam = useMemo(
    () => recommendedTeams.find((team) => team.id === activeSession.selectedTeamId) ?? recommendedTeams[0] ?? null,
    [activeSession.selectedTeamId, recommendedTeams],
  );

  const selectedSelfTestPath = useMemo(() => {
    if (!activeSession.plan?.selfTestRecommendation) {
      return '';
    }

    return activeSession.selectedSelfTestMode === 'all'
      ? '/growth/self-test/start?plane=all'
      : `/growth/self-test/start?plane=${activeSession.plan.selfTestRecommendation.planeId}`;
  }, [activeSession.plan?.selfTestRecommendation, activeSession.selectedSelfTestMode]);

  const executionResult = activeSession.result;
  const currentSceneMeta = getSceneMeta(activeSession.resolvedScene ?? activeSession.scene);
  const activeSceneKey = activeSession.resolvedScene ?? (activeSession.scene !== 'free' ? activeSession.scene : undefined);
  const quickSubmitPreview = useMemo(
    () => (activeSceneKey === 'quick-submit' ? buildQuickTaskSubmissionPreview(activeSession.transcript, tasks) : null),
    [activeSceneKey, activeSession.transcript, tasks],
  );
  const selectedImage = useMemo(
    () =>
      activeSession.generatedImages?.find((item) => item.id === activeSession.selectedImageId) ??
      activeSession.generatedImages?.[0] ??
      null,
    [activeSession.generatedImages, activeSession.selectedImageId],
  );
  const isStructuredInputScene = activeSceneKey === 'image' || activeSceneKey === 'quick-submit';
  const scenePages = useMemo(() => {
    const pages: Array<(typeof VOICE_ASSISTANT_SCENE_OPTIONS)[number][]> = [];

    for (let index = 0; index < VOICE_ASSISTANT_SCENE_OPTIONS.length; index += SCENE_PAGE_SIZE) {
      pages.push(VOICE_ASSISTANT_SCENE_OPTIONS.slice(index, index + SCENE_PAGE_SIZE));
    }

    return pages;
  }, []);
  const visibleSceneOptions = scenePages[scenePageIndex] ?? scenePages[0] ?? [];

  useEffect(() => {
    if (!activeSceneKey) {
      return;
    }

    const matchedPageIndex = scenePages.findIndex((page) => page.some((item) => item.scene === activeSceneKey));
    if (matchedPageIndex === -1) {
      return;
    }

    setScenePageIndex((current) => (current === matchedPageIndex ? current : matchedPageIndex));
  }, [activeSceneKey, scenePages]);

  function setTranscript(value: string) {
    updateSession((current) => ({
      ...current,
      transcript: value,
      updatedAt: new Date().toISOString(),
    }));
  }

  function understandTranscript(transcript: string, preferredScene?: VoiceAssistantScene) {
    const resolvedScene =
      preferredScene && preferredScene !== 'free'
        ? preferredScene
        : detectVoiceAssistantScene(transcript);
    const nextScene =
      preferredScene && preferredScene !== 'free'
        ? preferredScene
        : resolvedScene ?? 'free';

    setSession({
      scene: nextScene,
      resolvedScene: resolvedScene ?? undefined,
      transcript,
      step: 'understand',
      plan: null,
      result: null,
      selectedTeamId: undefined,
      selectedSelfTestMode: 'recommended',
      selectedImageId: undefined,
      imageEditPrompt: '',
      generatedImages: [],
      updatedAt: new Date().toISOString(),
    });
    setComposerOpen(false);
  }

  function handleTextSubmit() {
    const transcript = activeSession.transcript.trim();
    if (!transcript) {
      messageApi.warning('先输入一句你想让我帮你做什么。');
      return;
    }

    understandTranscript(transcript, activeSession.scene);
  }

  function handleMockListening() {
    if (listening) {
      return;
    }

    const fallbackOption = VOICE_ASSISTANT_SCENE_OPTIONS[mockSceneIndex % VOICE_ASSISTANT_SCENE_OPTIONS.length];
    const currentScene =
      activeSession.scene !== 'free'
        ? VOICE_ASSISTANT_SCENE_OPTIONS.find((item) => item.scene === activeSession.scene) ?? fallbackOption
        : fallbackOption;

    setListening(true);
    const timer = window.setTimeout(() => {
      setListening(false);
      understandTranscript(currentScene.prompt, currentScene.scene);
      setMockSceneIndex((value) => value + 1);
    }, 900);
    timersRef.current.push(timer);
  }

  function handleGeneratePlan(sceneOverride?: VoiceAssistantResolvedScene) {
    const resolvedScene = sceneOverride ?? activeSession.resolvedScene;
    if (!resolvedScene) {
      messageApi.info('我还没识别到具体任务，你可以继续补一句，或者点一个快捷场景。');
      return;
    }

    if (!activeSession.transcript.trim()) {
      messageApi.warning(resolvedScene === 'image' ? '先输入一段想生成的画面描述。' : '先输入任务名称和答案。');
      return;
    }

    if (resolvedScene === 'quick-submit' && !quickSubmitPreview) {
      messageApi.warning('还没有识别到完整的任务名称和答案，你可以参考示例再说一次。');
      return;
    }

    const plan = buildVoiceAssistantPlan({
      scene: resolvedScene,
      transcript: activeSession.transcript,
      weakestCapability,
      teams,
      nextTaskSequence,
      quickSubmission: quickSubmitPreview,
    });

    updateSession((current) => ({
      ...current,
      scene: resolvedScene,
      resolvedScene,
      plan,
      step: 'plan',
      selectedTeamId: plan.recommendedTeamIds?.[0],
      selectedSelfTestMode: 'recommended',
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleExecute() {
    const plan = activeSession.plan;
    if (!plan) {
      return;
    }

    let result: VoiceAssistantExecutionResult | null = null;
    let sessionPatch: Partial<typeof activeSession> | undefined;

    if ((plan.scene === 'help' || plan.scene === 'task') && plan.generatedTask) {
      const savedTask = upsertAssistantTask(plan.generatedTask);
      if (!savedTask) {
        messageApi.error('任务创建失败，请稍后重试。');
        return;
      }

      result = {
        scene: plan.scene,
        title: '已使用任务应用创建任务',
        detail: `任务《${savedTask.title}》已经写入本地任务列表，你可以马上进入任务继续完成。`,
        appName: '任务应用',
        targetPath: `/tasks/${savedTask.id}`,
        targetLabel: '查看新任务',
        assistantTaskId: savedTask.id,
        tone: 'success',
        completedAt: formatCompletedAt(),
      };
    }

    if (plan.scene === 'image' && plan.imagePrompt) {
      const generatedImages = buildVoiceAssistantImageVariants(plan.imagePrompt);
      result = {
        scene: 'image',
        title: '已生成 4 张候选图片',
        detail: '你可以先挑一张继续修改，也可以直接下载到相册。',
        appName: 'AI创作',
        targetPath: '/album',
        targetLabel: '查看相册',
        tone: 'success',
        completedAt: formatCompletedAt(),
      };
      sessionPatch = {
        generatedImages,
        selectedImageId: generatedImages[0]?.id,
        imageEditPrompt: '',
      };
    }

    if (plan.scene === 'quick-submit' && plan.quickSubmission) {
      const submittedWork = submitQuickTaskAnswer(plan.quickSubmission);
      if (!submittedWork) {
        messageApi.error('自动提交失败，请换一种说法再试一次。');
        return;
      }

      result = {
        scene: 'quick-submit',
        title: '已自动提交任务作品',
        detail: `答案“${plan.quickSubmission.answer}”已经提交到《${plan.quickSubmission.taskTitle}》的 ${plan.quickSubmission.questionOrderLabel}。`,
        appName: '任务应用',
        targetPath: `/tasks/works/${submittedWork.id}`,
        targetLabel: '查看提交结果',
        tone: 'success',
        completedAt: formatCompletedAt(),
      };
    }

    if (plan.scene === 'team' && selectedTeam) {
      result = {
        scene: 'team',
        title: '已使用团队应用生成推荐并发给家长',
        detail: `已为你整理好“${selectedTeam.name}”的推荐信息，家长可在推荐页继续查看和报名。`,
        appName: '团队应用',
        targetPath: `/team/${selectedTeam.id}/certificate`,
        targetLabel: '查看发送结果',
        teamId: selectedTeam.id,
        tone: 'success',
        completedAt: formatCompletedAt(),
      };
    }

    if (plan.scene === 'self-test') {
      result = {
        scene: 'self-test',
        title: '已打开能力应用中的能力自测页面',
        detail:
          activeSession.selectedSelfTestMode === 'all'
            ? '正在为你进入全面测试。'
            : `正在为你打开“${plan.selfTestRecommendation?.planeTitle ?? '推荐平面'}”的能力自测。`,
        appName: '能力应用',
        targetPath: selectedSelfTestPath,
        targetLabel: '进入能力自测',
        tone: 'success',
        autoNavigate: true,
        completedAt: formatCompletedAt(),
      };
    }

    if (plan.scene === 'sos') {
      result = {
        scene: 'sos',
        title: '正在使用 SoS 应用发起求助',
        detail: '已为你打开紧急求助流程，接下来会自动进入定位、录音和发送确认。',
        appName: 'SoS 应用',
        targetPath: '/sos?source=assistant&autoStart=1',
        targetLabel: '进入 SoS',
        tone: 'danger',
        autoNavigate: true,
        completedAt: formatCompletedAt(),
      };
    }

    if (!result) {
      messageApi.error('当前场景还没有可执行结果。');
      return;
    }

    rememberResult(result, sessionPatch);

    if (result.autoNavigate && result.targetPath) {
      clearPendingTimers();
      const timer = window.setTimeout(() => {
        router.push(result.targetPath!);
      }, 1000);
      timersRef.current.push(timer);
    }
  }

  function handleReset(sceneOverride?: VoiceAssistantScene) {
    const targetScene = sceneOverride ?? (activeSession.scene !== 'free' ? activeSession.scene : initialScene);
    clearPendingTimers();
    if (targetScene === 'free') {
      resetSession('free');
    } else {
      setSession(createSceneSession(targetScene));
    }
    setComposerOpen(false);
  }

  function handleSelectImage(imageId: string) {
    updateSession((current) => ({
      ...current,
      selectedImageId: imageId,
      imageEditPrompt: current.selectedImageId === imageId ? current.imageEditPrompt ?? '' : '',
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleImageEditPromptChange(value: string) {
    updateSession((current) => ({
      ...current,
      imageEditPrompt: value,
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleApplyImageEdit() {
    if (!selectedImage) {
      messageApi.warning('先选中一张要修改的图片。');
      return;
    }

    const editPrompt = activeSession.imageEditPrompt?.trim();
    if (!editPrompt) {
      messageApi.warning('先输入修改意见。');
      return;
    }

    updateSession((current) => ({
      ...current,
      generatedImages: (current.generatedImages ?? []).map((item) =>
        item.id === selectedImage.id
          ? {
              ...item,
              styleLabel: `${item.styleLabel.replace(' · 已修改', '')} · 已修改`,
              description: `已融入修改意见：${editPrompt}`,
              revisedPrompt: editPrompt,
            }
          : item,
      ),
      imageEditPrompt: '',
      updatedAt: new Date().toISOString(),
    }));
    messageApi.success('已根据你的修改意见更新当前图片。');
  }

  function handleDownloadImage(image: VoiceAssistantImageVariant) {
    saveCaptureAsset({
      id: `assistant_album_${Date.now()}`,
      title: `${image.title} · ${image.styleLabel}`,
      type: '照片',
      capturedAt: '刚刚',
      previewLabel: image.previewLabel,
      accent: image.accent,
      primaryLabel: 'AI生图',
      recognizedNames: [image.styleLabel, 'AI创作', '语音助手'],
      identifySummary: `由 AI语音助手根据“${image.prompt}”生成，可继续在任务或相册中使用。`,
      identifySource: '拍照识别',
      confidence: 0.99,
      summary: '适合继续同步到任务作品或发送给家长查看。',
    });
    messageApi.success('下载成功，请前往相册查看');
  }

  function renderUnderstandToolCard() {
    if (activeSession.step !== 'understand') {
      return null;
    }

    if (activeSceneKey === 'image') {
      return (
        <div className="device-assistant-card scene-tool">
          <div className="device-assistant-card-head">
            <strong>输入画面描述</strong>
            <Tag color="blue">4 宫格生图</Tag>
          </div>
          <Input.TextArea
            rows={3}
            value={activeSession.transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="例如：画 4 张青蛙生态设施观察插画，适合小学生研学手册，颜色清新。"
          />
          <div className="device-assistant-chip-row wrap">
            {IMAGE_SCENE_SUGGESTIONS.map((item) => (
              <button key={item} type="button" className="device-assistant-inline-chip" onClick={() => setTranscript(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="device-assistant-action-row">
            <Button type="primary" block onClick={() => handleGeneratePlan('image')}>
              生成方案
            </Button>
            <Button block onClick={handleMockListening}>
              模拟语音输入
            </Button>
          </div>
        </div>
      );
    }

    if (activeSceneKey === 'quick-submit') {
      return (
        <div className="device-assistant-card scene-tool">
          <div className="device-assistant-card-head">
            <strong>任务名称 + 答案</strong>
            <Tag color="green">自动提交</Tag>
          </div>
          <Input.TextArea
            rows={3}
            value={activeSession.transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="例如：生态设施大搜索任务 第一题“青蛙”"
          />
          <div className="device-assistant-chip-row wrap">
            {QUICK_SUBMIT_EXAMPLES.map((item) => (
              <button key={item} type="button" className="device-assistant-inline-chip" onClick={() => setTranscript(item)}>
                {item}
              </button>
            ))}
          </div>
          {quickSubmitPreview ? (
            <div className="device-assistant-inline-block">
              <strong>已识别提交对象</strong>
              <span>任务：{quickSubmitPreview.taskTitle}</span>
              <span>题目：{quickSubmitPreview.sheetTitle}</span>
              <span>答案：{quickSubmitPreview.answer}</span>
            </div>
          ) : activeSession.transcript.trim() ? (
            <Alert type="warning" showIcon message="还没有识别到完整的任务名称和答案，建议参考示例格式。"/>
          ) : null}
          <div className="device-assistant-action-row">
            <Button type="primary" block onClick={() => handleGeneratePlan('quick-submit')}>
              识别并预提交
            </Button>
            <Button block onClick={handleMockListening}>
              模拟语音输入
            </Button>
          </div>
        </div>
      );
    }

    return null;
  }

  function renderImageStudioCard() {
    if (executionResult?.scene !== 'image' || !activeSession.generatedImages?.length) {
      return null;
    }

    return (
      <div className="device-assistant-card image-studio">
        <div className="device-assistant-card-head">
          <strong>4 宫格候选图片</strong>
          <Tag color="blue">可修改 / 下载</Tag>
        </div>
        <p>当前提示词：{activeSession.plan?.imagePrompt ?? activeSession.transcript}</p>
        <div className="device-assistant-image-grid">
          {activeSession.generatedImages.map((image) => (
            <div key={image.id} className={`device-assistant-image-card${selectedImage?.id === image.id ? ' active' : ''}`}>
              <button type="button" className="device-assistant-image-preview" onClick={() => handleSelectImage(image.id)}>
                <div className={`device-assistant-image-surface accent-${image.accent}`}>
                  <span>{image.previewLabel}</span>
                  <strong>{image.title}</strong>
                  <em>{image.styleLabel}</em>
                </div>
              </button>
              <div className="device-assistant-image-copy">
                <strong>{image.styleLabel}</strong>
                <span>{image.description}</span>
              </div>
              <div className="device-assistant-image-actions">
                <Button block onClick={() => handleSelectImage(image.id)}>
                  修改
                </Button>
                <Button type="primary" block onClick={() => handleDownloadImage(image)}>
                  下载
                </Button>
              </div>
            </div>
          ))}
        </div>

        {selectedImage ? (
          <div className="device-assistant-edit-panel">
            <strong>修改已选图片</strong>
            <div className="device-assistant-selected-image">
              <div className={`device-assistant-selected-thumb accent-${selectedImage.accent}`}>
                <span>{selectedImage.previewLabel}</span>
              </div>
              <div className="device-assistant-selected-copy">
                <strong>{selectedImage.title}</strong>
                <span>{selectedImage.styleLabel}</span>
              </div>
            </div>
            <Input.TextArea
              rows={2}
              value={activeSession.imageEditPrompt ?? ''}
              onChange={(event) => handleImageEditPromptChange(event.target.value)}
              placeholder="例如：把背景改成傍晚橙色，再加入青蛙观察牌。"
            />
            <div className="device-assistant-action-row">
              <Button type="primary" block onClick={handleApplyImageEdit}>
                应用修改
              </Button>
              <Button block onClick={() => router.push('/album')}>
                打开相册
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderPlanDetails() {
    if (!activeSession.plan) {
      return null;
    }

    return (
      <div className="device-assistant-card">
        <div className="device-assistant-card-head">
          <strong>{activeSession.plan.title}</strong>
          <Tag color="blue">{activeSession.plan.appName}</Tag>
        </div>
        <p>{activeSession.plan.planningSummary}</p>
        <div className="device-assistant-bullet-list">
          {activeSession.plan.rationale.map((item) => (
            <div key={item} className="device-assistant-bullet-item">
              {item}
            </div>
          ))}
        </div>

        {activeSession.plan.helpTips?.length ? (
          <div className="device-assistant-inline-block">
            <strong>设备能帮你做这些事</strong>
            {activeSession.plan.helpTips.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}

        {activeSession.plan.generatedTask ? (
          <div className="device-assistant-inline-block">
            <strong>{activeSession.plan.generatedTask.title}</strong>
            <span>{activeSession.plan.generatedTask.taskDescription}</span>
            <div className="device-assistant-chip-row">
              {activeSession.plan.generatedTask.capabilityTags.map((tag) => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </div>
          </div>
        ) : null}

        {activeSession.plan.imagePrompt ? (
          <div className="device-assistant-inline-block">
            <strong>本次绘图提示词</strong>
            <span>{activeSession.plan.imagePrompt}</span>
            <div className="device-assistant-chip-row">
              <Tag color="blue">清新插画</Tag>
              <Tag color="green">自然写实</Tag>
              <Tag color="orange">海报拼贴</Tag>
              <Tag color="purple">柔和彩绘</Tag>
            </div>
          </div>
        ) : null}

        {activeSession.plan.quickSubmission ? (
          <div className="device-assistant-inline-block">
            <strong>准备提交的任务</strong>
            <span>任务：{activeSession.plan.quickSubmission.taskTitle}</span>
            <span>题目：{activeSession.plan.quickSubmission.sheetTitle}</span>
            <span>答案：{activeSession.plan.quickSubmission.answer}</span>
          </div>
        ) : null}

        {recommendedTeams.length ? (
          <div className="device-assistant-inline-block">
            <strong>推荐研学团</strong>
            <div className="device-assistant-choice-list">
              {recommendedTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={`device-assistant-choice-card${team.id === selectedTeam?.id ? ' active' : ''}`}
                  onClick={() =>
                    updateSession((current) => ({
                      ...current,
                      selectedTeamId: team.id,
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                >
                  <strong>{team.name}</strong>
                  <span>{team.studyDate} · {team.destination}</span>
                  <em>{team.shareSummary ?? '可发送给家长查看和报名。'}</em>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeSession.plan.selfTestRecommendation ? (
          <div className="device-assistant-inline-block">
            <strong>能力自测推荐</strong>
            <span>{activeSession.plan.selfTestRecommendation.reason}</span>
            <Segmented
              block
              value={activeSession.selectedSelfTestMode}
              onChange={(value) =>
                updateSession((current) => ({
                  ...current,
                  selectedSelfTestMode: value as 'recommended' | 'all',
                  updatedAt: new Date().toISOString(),
                }))
              }
              options={[
                { label: '推荐平面', value: 'recommended' },
                { label: '全面测试', value: 'all' },
              ]}
            />
          </div>
        ) : null}

        {activeSession.plan.dangerNotice ? (
          <Alert type="error" showIcon message={activeSession.plan.dangerNotice} />
        ) : null}

        {activeSession.step === 'plan' ? (
          <div className="device-assistant-action-row">
            <Button
              type="primary"
              block
              onClick={() =>
                updateSession((current) => ({
                  ...current,
                  step: 'confirm',
                  updatedAt: new Date().toISOString(),
                }))
              }
            >
              进入执行确认
            </Button>
            <Button block onClick={() => handleReset()}>
              重新开始
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  function renderConfirmCard() {
    if (activeSession.step !== 'confirm' || !activeSession.plan) {
      return null;
    }

    return (
      <div className="device-assistant-card emphasis">
        <div className="device-assistant-card-head">
          <strong>{activeSession.plan.executionQuestion}</strong>
          <Tag color={activeSession.plan.scene === 'sos' ? 'red' : 'green'}>
            {activeSession.plan.appName}
          </Tag>
        </div>
        <p>
          {activeSession.plan.scene === 'team' && selectedTeam
            ? `当前将为你处理的推荐团是：${selectedTeam.name}。`
            : activeSession.plan.scene === 'image'
              ? '我会先生成 4 张不同风格的候选图，接下来你可以继续修改单张图片，或者直接下载到相册。'
              : activeSession.plan.scene === 'quick-submit' && activeSession.plan.quickSubmission
                ? `当前将提交到《${activeSession.plan.quickSubmission.taskTitle}》的 ${activeSession.plan.quickSubmission.questionOrderLabel}，答案是“${activeSession.plan.quickSubmission.answer}”。`
            : activeSession.plan.scene === 'self-test'
              ? `当前将打开：${activeSession.selectedSelfTestMode === 'all' ? '全面测试' : activeSession.plan.selfTestRecommendation?.planeTitle ?? '推荐平面'}。`
              : activeSession.plan.scene === 'sos'
                ? '这是紧急操作，请确认当前确实需要联系老师和家长。'
                : '确认后我会模拟调用目标应用，并返回执行结果。'}
        </p>
        <div className="device-assistant-action-row">
          <Button type="primary" danger={activeSession.plan.scene === 'sos'} block onClick={handleExecute}>
            {activeSession.plan.scene === 'sos' ? '确认发起求助' : '确认执行'}
          </Button>
          <Button
            block
            onClick={() =>
              updateSession((current) => ({
                ...current,
                step: 'plan',
                updatedAt: new Date().toISOString(),
              }))
            }
          >
            返回修改
          </Button>
        </div>
      </div>
    );
  }

  function renderResultCard() {
    if (!executionResult) {
      return null;
    }

    return (
      <div className={`device-assistant-card${executionResult.tone === 'danger' ? ' danger' : ''}`}>
        <div className="device-assistant-card-head">
          <strong>{executionResult.title}</strong>
          <Tag color={executionResult.tone === 'danger' ? 'red' : 'green'}>{executionResult.appName}</Tag>
        </div>
        <p>{executionResult.detail}</p>
        <div className="device-assistant-chip-row">
          <Tag color="blue">{executionResult.completedAt}</Tag>
          {executionResult.autoNavigate ? <Tag color="gold">即将自动进入</Tag> : null}
        </div>
        <div className="device-assistant-action-row">
          {executionResult.targetPath ? (
            <Button
              type="primary"
              block
              onClick={() => {
                if (executionResult.targetPath) {
                  router.push(executionResult.targetPath);
                }
              }}
            >
              {executionResult.targetLabel ?? '查看结果'}
            </Button>
          ) : (
            <Button type="primary" block disabled>
              当前无下一步页面
            </Button>
          )}
          <Button block onClick={() => handleReset()}>
            再来一次
          </Button>
        </div>
      </div>
    );
  }

  const shouldShowWelcomeCards = activeSession.step === 'wake' || (!activeSession.resolvedScene && activeSession.step === 'understand');

  return (
    <div className="device-assistant-chat-page">
      {contextHolder}

      <div className="device-assistant-chat-header">
        <button type="button" className="device-assistant-header-icon" onClick={() => router.back()}>
          <span className="device-assistant-header-icon-line left" />
          <span className="device-assistant-header-icon-line right" />
        </button>
        <div className="device-assistant-header-title">
          <strong>AI语音助手</strong>
          <span>内容由 AI 生成</span>
        </div>
        <div className="device-assistant-header-spacer" aria-hidden="true" />
      </div>

      <div ref={scrollRef} className="device-assistant-chat-scroll">
        <div className={`device-assistant-chat-thread${shouldShowWelcomeCards ? ' wake-mode' : ''}`}>
          <div className="device-assistant-message assistant intro">
            <div className="device-assistant-avatar">
              <RobotOutlined />
            </div>
            <div className="device-assistant-message-main">
              <div className="device-assistant-bubble assistant intro">
                你好，我是本地语音大模型。你可以直接说出需求，我会帮你理解、规划、确认并反馈执行结果。
              </div>
              {store.lastExecutionResult && activeSession.step === 'wake' ? (
                <div className="device-assistant-card subtle intro-history">
                  <div className="device-assistant-card-head">
                    <strong>上次执行结果</strong>
                    <Tag color={store.lastExecutionResult.tone === 'danger' ? 'red' : 'green'}>{store.lastExecutionResult.appName}</Tag>
                  </div>
                  <p>{store.lastExecutionResult.detail}</p>
                </div>
              ) : null}
            </div>
          </div>

          {shouldShowWelcomeCards ? (
            <div className="device-assistant-message assistant without-avatar intro-hint">
              <div className="device-assistant-message-main">
                <div className="device-assistant-bubble assistant compact hint">
                  你也可以直接用底部的场景快捷按钮切换任务，我会按会话方式继续往下走。
                </div>
              </div>
            </div>
          ) : null}

          {activeSession.transcript && (!isStructuredInputScene || activeSession.step !== 'understand') ? (
            <div className="device-assistant-message self">
              <div className="device-assistant-message-main self">
                <div className="device-assistant-bubble self">
                  {activeSession.transcript}
                </div>
              </div>
            </div>
          ) : null}

          {activeSession.step !== 'wake' ? (
            <div className="device-assistant-message assistant">
              <div className="device-assistant-avatar">
                <RobotOutlined />
              </div>
              <div className="device-assistant-message-main">
                <div className="device-assistant-bubble assistant">
                  {activeSceneKey === 'image' && !activeSession.transcript.trim()
                    ? '告诉我你想画什么，我会先生成 4 张候选图片给你选。'
                    : activeSceneKey === 'quick-submit' && !activeSession.transcript.trim()
                      ? '把任务名称和答案一起告诉我，例如：生态设施大搜索任务 第一题“青蛙”。'
                    : activeSession.resolvedScene
                    ? `我理解到你想处理的是“${currentSceneMeta?.title ?? '当前任务'}”。当前会按${thinkingMode === 'think' ? '思考' : '快速'}方式继续为你整理执行方案。`
                    : '我还没完全识别出具体场景。你可以再补充一句，或者直接点底部的场景按钮。'}
                </div>
                {renderUnderstandToolCard()}
                {activeSession.step === 'understand' && !isStructuredInputScene ? (
                  <div className="device-assistant-action-row inline">
                    <Button
                      type="primary"
                      block
                      disabled={!activeSession.resolvedScene}
                      onClick={() => handleGeneratePlan()}
                    >
                      继续规划
                    </Button>
                    <Button block onClick={() => handleReset()}>
                      重说一次
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSession.plan ? (
            <div className="device-assistant-message assistant">
              <div className="device-assistant-avatar">
                <RobotOutlined />
              </div>
              <div className="device-assistant-message-main">
                <div className="device-assistant-bubble assistant">
                  我已经为你整理好执行方案了，你先看一下，如果合适我们就继续执行。
                </div>
                {renderPlanDetails()}
              </div>
            </div>
          ) : null}

          {renderConfirmCard() ? (
            <div className="device-assistant-message assistant">
              <div className="device-assistant-avatar">
                <RobotOutlined />
              </div>
              <div className="device-assistant-message-main">
                <div className="device-assistant-bubble assistant">
                  在真正执行前，我再和你确认一次。
                </div>
                {renderConfirmCard()}
              </div>
            </div>
          ) : null}

          {renderResultCard() ? (
            <div className="device-assistant-message assistant">
              <div className="device-assistant-avatar">
                <RobotOutlined />
              </div>
              <div className="device-assistant-message-main">
                <div className="device-assistant-bubble assistant">
                  处理完成了，我已经把结果整理给你。
                </div>
                {renderResultCard()}
                {renderImageStudioCard()}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="device-assistant-chat-footer">
        <div className="device-assistant-quick-strip">
          <div className="device-assistant-quick-strip-main">
            <div className="device-assistant-mode-switch" role="tablist" aria-label="思维方式切换">
              <button
                type="button"
                className={`device-assistant-mode-option${thinkingMode === 'fast' ? ' active' : ''}`}
                onClick={() => setThinkingMode('fast')}
              >
                <ThunderboltOutlined />
                <span>快速</span>
              </button>
              <button
                type="button"
                className={`device-assistant-mode-option${thinkingMode === 'think' ? ' active' : ''}`}
                onClick={() => setThinkingMode('think')}
              >
                <span>思考</span>
              </button>
            </div>

            <div className="device-assistant-scene-page" aria-live="polite">
              {visibleSceneOptions.map((item) => (
                <button
                  key={item.scene}
                  type="button"
                  className={`device-assistant-quick-pill${activeSession.scene === item.scene || activeSession.resolvedScene === item.scene ? ' active' : ''}`}
                  onClick={() => openScene(item.scene)}
                >
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {scenePages.length > 1 ? (
            <div className="device-assistant-scene-pagination" aria-label="场景任务分页">
              {scenePages.map((page, index) => {
                const containsActiveScene = page.some((item) => item.scene === activeSceneKey);
                return (
                  <button
                    key={`scene-page-${index + 1}`}
                    type="button"
                    className={`device-assistant-scene-dot${scenePageIndex === index ? ' active' : ''}${containsActiveScene ? ' current-scene' : ''}`}
                    aria-label={`切换到第 ${index + 1} 组场景`}
                    aria-pressed={scenePageIndex === index}
                    onClick={() => setScenePageIndex(index)}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        {composerOpen ? (
          <div className="device-assistant-composer-panel">
            <div className="device-page-toolbar" style={{ marginBottom: 10 }}>
              <p className="device-section-label" style={{ marginBottom: 0 }}>告诉我你的诉求</p>
              <Button type="text" icon={<ReloadOutlined />} onClick={() => handleReset()} className="device-icon-button soft" />
            </div>
            <Input.TextArea
              rows={3}
              value={activeSession.transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="例如：帮我推荐一个自然观察类研学团 / 画 4 张青蛙生态插画 / 生态设施大搜索任务 第一题“青蛙”"
            />
            <div className="device-assistant-action-row" style={{ marginTop: 10 }}>
              <Button type="primary" icon={<SendOutlined />} block onClick={handleTextSubmit}>
                发给 AI
              </Button>
              <Button block onClick={() => setComposerOpen(false)}>
                收起输入框
              </Button>
            </div>
          </div>
        ) : null}

        <div className="device-assistant-compose-bar">
          <button type="button" className="device-assistant-compose-icon" onClick={() => router.push('/capture?source=assistant')}>
            <CameraOutlined />
          </button>
          <button type="button" className="device-assistant-compose-main" onClick={handleMockListening}>
            {listening ? <LoadingOutlined /> : <AudioOutlined />}
            <span>{listening ? '正在聆听...' : '按住说话'}</span>
          </button>
          <button type="button" className="device-assistant-compose-icon" onClick={() => setComposerOpen((value) => !value)}>
            <KeyboardIcon />
          </button>
        </div>

        <div className="device-assistant-capability-bar">
          <span>当前最需关注能力</span>
          <strong>{weakestCapability?.elementKey ?? '待分析'}</strong>
        </div>
      </div>
    </div>
  );
}
