'use client';

import {
  AudioOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  SendOutlined,
  SoundOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Modal, Radio, Result, Space, Tag, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FlashNoteRecorder } from '../../../../components/flash-note-recorder';
import { apiFetch, getStoredSession, uploadFile } from '../../../../lib/api';
import { type DemoTask, type DemoWorkAnswer, type DemoWorkFormField, type DemoWorkMedia } from '../../../../lib/device-demo-data';
import { clearDemoDraft, getDemoDraft } from '../../../../lib/demo-draft';
import { getFlashNoteMeta, getFlashNoteSummary, getFlashNotes, type FlashNoteItem } from '../../../../lib/flash-notes';
import {
  type DeviceLearningWorkItem,
  type DeviceTaskSheet,
  getDeviceLearningWorkItems,
  getDeviceTaskWorkBySheetId,
  getSuggestedTaskSheet,
  upsertDeviceTaskWorkSubmission,
} from '../../../../lib/device-task-data';

type UploadResult = { file: { publicUrl: string; originalName: string; mimeType: string } };
type FormValues = Record<string, string | string[] | undefined>;
type SheetFormValues = Record<string, FormValues>;
type UploadMapBySheet = Record<string, Record<string, UploadFile[]>>;
type AcceptedFieldState = Record<string, Record<string, DemoWorkMedia[]>>;
type LinkedFlashNoteRef = {
  id: string;
  title: string;
  type?: 'voice_note' | 'video_note';
  transcript?: string;
  photoCount?: number;
  duration?: string;
};
type LinkedFlashNotesBySheet = Record<string, LinkedFlashNoteRef[]>;
type AudioPreviewState = Record<string, { title: string; duration?: string } | undefined>;
type QuickMediaBySheet = Record<string, DemoWorkMedia[]>;
type SheetErrors = Record<string, Record<string, string>>;
type ToolKind = 'ask' | 'identify' | 'ai_draw' | 'ai_video' | 'flash_create' | 'flash_select' | 'camera' | 'checkin';
type ActiveTool = { kind: ToolKind; field: DemoWorkFormField; sheetId: string };

const GAMEPLAY_LABELS = {
  speed_checkin: '竞速打卡',
  treasure_collect: '寻宝收集',
  creative_research: '创作研究',
  qa_research: '问答挑战',
  survey: '现场调查',
} as const;

const { Dragger } = Upload;

function buildInitialValues(fields: DemoWorkFormField[], answers: DemoWorkAnswer[] | undefined, draftContent?: string | null) {
  const initialValues: FormValues = {};
  let draftFilled = false;

  fields.forEach((field) => {
    const answer = answers?.find((item) => item.fieldId === field.id);

    if (!answer && field.kind === 'fill_blank' && draftContent && !draftFilled) {
      initialValues[field.id] = draftContent;
      draftFilled = true;
      return;
    }

    if (answer && 'files' in answer && field.kind === 'link_upload') {
      initialValues[field.id] = answer.files.map((item) => item.summary ?? `${item.type}：${item.title}`).join('\n');
      return;
    }

    if (answer && 'value' in answer) {
      initialValues[field.id] = answer.kind === 'single_choice' ? answer.value[0] : answer.value;
    }
  });

  return initialValues;
}

function buildUploadMap(fields: DemoWorkFormField[], answers: DemoWorkAnswer[] | undefined) {
  const nextMap: Record<string, UploadFile[]> = {};

  fields.forEach((field) => {
    if (!field.kind.includes('upload')) {
      return;
    }

    const answer = answers?.find((item) => item.fieldId === field.id && 'files' in item);
    nextMap[field.id] =
      answer && 'files' in answer
        ? answer.files.map((file) => ({
            uid: file.id,
            name: file.title,
            status: 'done',
            url: file.url,
          }))
        : [];
  });

  return nextMap;
}

function buildTaskInitialValues(
  task: DemoTask,
  workBySheetId: Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>,
  draftSheetId?: string,
  draftContent?: string | null,
) {
  const nextValues: SheetFormValues = {};

  task.taskSheets.forEach((sheet) => {
    nextValues[sheet.id] = buildInitialValues(
      sheet.workForm,
      workBySheetId[sheet.id]?.formAnswers,
      draftSheetId === sheet.id ? draftContent : null,
    );
  });

  return nextValues;
}

function buildTaskUploadMaps(task: DemoTask, workBySheetId: Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>) {
  const nextMap: UploadMapBySheet = {};

  task.taskSheets.forEach((sheet) => {
    nextMap[sheet.id] = buildUploadMap(sheet.workForm, workBySheetId[sheet.id]?.formAnswers);
  });

  return nextMap;
}

function buildQuickMediaBySheet(task: DemoTask, workBySheetId: Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>) {
  const nextMap: QuickMediaBySheet = {};

  task.taskSheets.forEach((sheet) => {
    nextMap[sheet.id] = workBySheetId[sheet.id]?.attachments ?? workBySheetId[sheet.id]?.media ?? [];
  });

  return nextMap;
}

function buildLinkedFlashNotesBySheet(task: DemoTask, workBySheetId: Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>) {
  const nextMap: LinkedFlashNotesBySheet = {};

  task.taskSheets.forEach((sheet) => {
    nextMap[sheet.id] = workBySheetId[sheet.id]?.linkedFlashNotes ?? [];
  });

  return nextMap;
}

function buildAudioPreviewBySheet(task: DemoTask, workBySheetId: Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>) {
  const nextMap: AudioPreviewState = {};

  task.taskSheets.forEach((sheet) => {
    nextMap[sheet.id] = workBySheetId[sheet.id]?.audioPreview;
  });

  return nextMap;
}

function buildAcceptedByFieldBySheet(task: DemoTask, workBySheetId: Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>) {
  const nextMap: AcceptedFieldState = {};

  task.taskSheets.forEach((sheet) => {
    const fieldMediaEntries =
      workBySheetId[sheet.id]?.formAnswers
        ?.filter((answer): answer is Extract<DemoWorkAnswer, { files: DemoWorkMedia[] }> => 'files' in answer && answer.files.length > 0)
        .map((answer) => [answer.fieldId, answer.files] as const) ?? [];

    nextMap[sheet.id] = Object.fromEntries(fieldMediaEntries);
  });

  return nextMap;
}

function hasFilledValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return String(value ?? '').trim().length > 0;
}

function validateSheetInputs(
  sheet: DeviceTaskSheet,
  values: FormValues,
  uploads: Record<string, UploadFile[]>,
  acceptedByField: Record<string, DemoWorkMedia[]>,
  strict = false,
) {
  let hasContent = false;
  const fieldErrors: Record<string, string> = {};

  sheet.workForm.forEach((field) => {
    const required = field.required ?? true;
    const uploadFiles = uploads[field.id] ?? [];
    const value = values[field.id];
    const acceptedMedia = acceptedByField[field.id] ?? [];

    if (field.kind === 'link_upload') {
      const hasAcceptedResult = acceptedMedia.length > 0 || hasFilledValue(value);
      if (hasAcceptedResult) {
        hasContent = true;
      }
      if (strict && required && !hasAcceptedResult) {
        fieldErrors[field.id] = `请先完成“${field.label}”`;
      }
      return;
    }

    if (field.kind.includes('upload')) {
      if (uploadFiles.length) {
        hasContent = true;
      }
      if (strict && required && !uploadFiles.length) {
        fieldErrors[field.id] = `请先完成“${field.label}”`;
      }
      return;
    }

    if (hasFilledValue(value)) {
      hasContent = true;
    }

    if (!strict || !required) {
      return;
    }

    if (field.kind === 'multiple_choice') {
      if (!Array.isArray(value) || !value.length) {
        fieldErrors[field.id] = `请选择“${field.label}”`;
      }
      return;
    }

    if (!hasFilledValue(value)) {
      fieldErrors[field.id] = field.kind === 'single_choice' ? `请选择“${field.label}”` : `请填写“${field.label}”`;
    }
  });

  return { hasContent, fieldErrors };
}

function getSheetValues(allValues: SheetFormValues, sheetId: string) {
  return allValues[sheetId] ?? {};
}

export default function DeviceTaskNewPage() {
  const [form] = Form.useForm<SheetFormValues>();
  const [uploadMapBySheet, setUploadMapBySheet] = useState<UploadMapBySheet>({});
  const [linkedFlashNotesBySheet, setLinkedFlashNotesBySheet] = useState<LinkedFlashNotesBySheet>({});
  const [audioPreviewBySheet, setAudioPreviewBySheet] = useState<AudioPreviewState>({});
  const [quickMediaBySheet, setQuickMediaBySheet] = useState<QuickMediaBySheet>({});
  const [acceptedByFieldBySheet, setAcceptedByFieldBySheet] = useState<AcceptedFieldState>({});
  const [dirtySheetIds, setDirtySheetIds] = useState<string[]>([]);
  const [sheetErrors, setSheetErrors] = useState<SheetErrors>({});
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [toolPrompt, setToolPrompt] = useState('');
  const [flashNotes, setFlashNotes] = useState<FlashNoteItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskIdFromQuery = searchParams.get('taskId') ?? undefined;
  const sheetIdFromQuery = searchParams.get('sheetId') ?? undefined;
  const draft = getDemoDraft();
  const session = getStoredSession();

  const suggested = useMemo(() => getSuggestedTaskSheet(taskIdFromQuery, sheetIdFromQuery), [taskIdFromQuery, sheetIdFromQuery]);
  const task = suggested?.task;
  const draftSheetId = suggested?.sheet.id;
  const learningWorks = useMemo(() => (task ? getDeviceLearningWorkItems(task.id) : []), [task?.id]);
  const currentWorkBySheetId = useMemo(() => {
    if (!task) {
      return {} as Record<string, ReturnType<typeof getDeviceTaskWorkBySheetId>>;
    }

    return Object.fromEntries(task.taskSheets.map((sheet) => [sheet.id, getDeviceTaskWorkBySheetId(sheet.id)]));
  }, [task?.id]);
  const autoImportDraft = !taskIdFromQuery && !sheetIdFromQuery ? draft : null;

  useEffect(() => {
    if (!task || !draftSheetId) {
      return;
    }

    form.setFieldsValue(
      buildTaskInitialValues(task, currentWorkBySheetId, autoImportDraft ? draftSheetId : undefined, autoImportDraft?.content ?? null),
    );
    setUploadMapBySheet(buildTaskUploadMaps(task, currentWorkBySheetId));
    setQuickMediaBySheet(buildQuickMediaBySheet(task, currentWorkBySheetId));
    setLinkedFlashNotesBySheet(buildLinkedFlashNotesBySheet(task, currentWorkBySheetId));
    setAudioPreviewBySheet(buildAudioPreviewBySheet(task, currentWorkBySheetId));
    setAcceptedByFieldBySheet(buildAcceptedByFieldBySheet(task, currentWorkBySheetId));
    setDirtySheetIds([]);
    setSheetErrors({});
    setSubmitNotice(null);
    setFlashNotes(getFlashNotes());
  }, [autoImportDraft?.content, draftSheetId, form, currentWorkBySheetId, sheetIdFromQuery, task]);

  if (!task) {
    return <Result status="404" title="未找到学习作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const activeTask = task;
  const isReadonlyContext = searchParams.get('readonly') === '1';

  if (isReadonlyContext) {
    const teamId = searchParams.get('teamId') ?? '';
    return (
      <Result
        status="info"
        title="历史团队任务仅支持查看"
        subTitle="该团队已结束，不能继续填写或提交学习作品。"
        extra={
          <Link href={`/tasks/${activeTask.id}${teamId ? `?teamId=${teamId}&readonly=1` : ''}`}>
            <Button type="primary">返回任务详情</Button>
          </Link>
        }
      />
    );
  }

  function markSheetDirty(sheetId: string) {
    setDirtySheetIds((current) => (current.includes(sheetId) ? current : [...current, sheetId]));
    setSheetErrors((current) => {
      if (!current[sheetId]) {
        return current;
      }

      const next = { ...current };
      delete next[sheetId];
      return next;
    });
    setSubmitNotice(null);
  }

  function setSheetUploadFiles(sheetId: string, fieldId: string, fileList: UploadFile[], limit: number) {
    markSheetDirty(sheetId);
    setUploadMapBySheet((current) => ({
      ...current,
      [sheetId]: {
        ...(current[sheetId] ?? {}),
        [fieldId]: fileList.slice(0, limit),
      },
    }));
  }

  function addQuickMedia(sheetId: string, media: DemoWorkMedia) {
    setQuickMediaBySheet((current) => ({
      ...current,
      [sheetId]: [media, ...((current[sheetId] ?? []).filter((item) => item.id !== media.id))].slice(0, 8),
    }));
  }

  function addMockFile(sheetId: string, field: DemoWorkFormField, file: UploadFile) {
    markSheetDirty(sheetId);
    setUploadMapBySheet((current) => ({
      ...current,
      [sheetId]: {
        ...(current[sheetId] ?? {}),
        [field.id]: [file, ...((current[sheetId]?.[field.id] ?? []).filter((item) => item.uid !== file.uid))].slice(
          0,
          field.kind === 'image_upload' ? 3 : 1,
        ),
      },
    }));
  }

  function rememberFieldMedia(sheetId: string, field: DemoWorkFormField, mediaItems: DemoWorkMedia[]) {
    mediaItems.forEach((item) => addQuickMedia(sheetId, item));
    setAcceptedByFieldBySheet((current) => ({
      ...current,
      [sheetId]: {
        ...(current[sheetId] ?? {}),
        [field.id]: [...mediaItems, ...((current[sheetId]?.[field.id] ?? []).filter((item) => !mediaItems.some((next) => next.id === item.id)))]
          .slice(0, 6),
      },
    }));
  }

  function appendTextToField(sheetId: string, field: DemoWorkFormField, text: string) {
    if (field.kind === 'fill_blank' || field.kind === 'link_upload') {
      const currentValue = String(form.getFieldValue([sheetId, field.id]) ?? '').trim();
      form.setFieldValue([sheetId, field.id], currentValue ? `${currentValue}\n${text}` : text);
      return;
    }

    if (field.kind === 'single_choice') {
      form.setFieldValue([sheetId, field.id], field.options[0] ?? '');
      return;
    }

    if (field.kind === 'multiple_choice') {
      form.setFieldValue([sheetId, field.id], field.options.slice(0, 2));
    }
  }

  function addMediaToUploadField(sheetId: string, field: DemoWorkFormField, media: DemoWorkMedia) {
    if (field.kind === 'image_upload' && ['照片', 'AI识图', 'AI绘图', '打卡证明'].includes(media.type)) {
      addMockFile(sheetId, field, {
        uid: `${media.id}-file`,
        name: `${media.title}.jpg`,
        status: 'done',
        url: media.url,
      });
    }

    if (field.kind === 'video_upload' && ['视频', 'AI视频'].includes(media.type)) {
      addMockFile(sheetId, field, {
        uid: `${media.id}-file`,
        name: `${media.title}.mp4`,
        status: 'done',
        url: media.url,
      });
    }

    if (field.kind === 'audio_upload' && media.type === '音频') {
      addMockFile(sheetId, field, {
        uid: `${media.id}-file`,
        name: `${media.title}.mp3`,
        status: 'done',
        url: media.url,
      });
    }
  }

  function acceptToolResult(sheetId: string, field: DemoWorkFormField, text: string, mediaItems: DemoWorkMedia[] = []) {
    markSheetDirty(sheetId);
    if (text) {
      appendTextToField(sheetId, field, text);
    }
    mediaItems.forEach((item) => addMediaToUploadField(sheetId, field, item));
    rememberFieldMedia(sheetId, field, mediaItems);
    messageApi.success('已采纳到本题');
    setActiveTool(null);
  }

  function openTool(kind: ToolKind, sheetId: string, field: DemoWorkFormField) {
    setActiveTool({ kind, field, sheetId });
    setToolPrompt(
      kind === 'ask'
        ? `请帮我完成“${field.label}”，给出可以写进作品的一句话。`
        : kind === 'ai_draw'
          ? `画一张和“${field.label}”有关的研学作品图。`
          : kind === 'ai_video'
            ? `生成一段展示“${field.label}”的 15 秒研学视频。`
            : '',
    );
  }

  function applyVoiceToField(sheetId: string, field: DemoWorkFormField) {
    markSheetDirty(sheetId);
    const currentValue = String(form.getFieldValue([sheetId, field.id]) ?? '').trim();
    const voiceText =
      field.kind === 'link_upload'
        ? '语音记录：已把这次 AI 探究过程转成文字并回填到当前作品。'
        : `${field.label}：补充了一条现场口述内容。`;
    const voiceMedia: DemoWorkMedia = {
      id: `${sheetId}-${field.id}-voice-${Date.now()}`,
      type: '音频',
      title: field.kind === 'link_upload' ? 'AI探究语音记录' : `${field.label} 语音输入`,
      url: '/mock/voice-to-text.mp3',
      duration: '00:08',
      summary: field.kind === 'link_upload' ? '已用语音补充一次 AI 探究过程记录。' : undefined,
    };
    form.setFieldValue([sheetId, field.id], currentValue ? `${currentValue}\n${voiceText}` : voiceText);
    setAudioPreviewBySheet((current) => ({
      ...current,
      [sheetId]: { title: voiceMedia.title, duration: voiceMedia.duration },
    }));
    addQuickMedia(sheetId, voiceMedia);
    rememberFieldMedia(sheetId, field, [voiceMedia]);
    messageApi.success(field.kind === 'link_upload' ? '已完成语音记录并回填 AI 探究结果' : '已完成语音转文字演示');
  }

  function renderFieldTools(sheet: DeviceTaskSheet, field: DemoWorkFormField) {
    const defaultTools: DemoWorkFormField['tools'] =
      field.kind === 'fill_blank'
        ? ['ask', 'flash_note', 'voice_text']
        : field.kind === 'link_upload'
          ? sheet.workKind === 'ai_link'
            ? ['voice_text', 'ask', 'identify', 'ai_draw', 'ai_video', 'flash_note']
            : ['ask']
        : field.kind === 'single_choice' || field.kind === 'multiple_choice'
          ? ['ask']
          : field.kind === 'image_upload'
            ? sheet.workKind === 'ai_link'
              ? ['identify', 'ai_draw', 'camera']
              : ['identify', 'camera', 'checkin']
            : field.kind === 'video_upload'
              ? ['ai_video', 'flash_note']
              : field.kind === 'audio_upload'
                ? ['flash_note']
                : ['ask'];
    const toolKeys = field.tools ?? defaultTools ?? [];
    const tools: Array<{ key: string; label: string; icon: ReactNode; onClick: () => void; primary?: boolean }> = [];

    if (toolKeys.includes('ask')) {
      tools.push({
        key: 'ask',
        label: '问问',
        icon: <SendOutlined />,
        onClick: () => openTool('ask', sheet.id, field),
        primary: field.kind !== 'link_upload',
      });
    }
    if (toolKeys.includes('voice_text') && field.kind === 'link_upload') {
      tools.push({
        key: 'voice-text',
        label: field.kind === 'link_upload' ? '语音记录' : '语音输入',
        icon: <AudioOutlined />,
        onClick: () => applyVoiceToField(sheet.id, field),
        primary: field.kind === 'link_upload',
      });
    }
    if (toolKeys.includes('identify')) {
      tools.push({ key: 'identify', label: 'AI识图', icon: <CameraOutlined />, onClick: () => openTool('identify', sheet.id, field) });
    }
    if (toolKeys.includes('ai_draw')) {
      tools.push({ key: 'ai-draw', label: 'AI绘图', icon: <LinkOutlined />, onClick: () => openTool('ai_draw', sheet.id, field) });
    }
    if (toolKeys.includes('ai_video')) {
      tools.push({ key: 'ai-video', label: 'AI视频', icon: <VideoCameraOutlined />, onClick: () => openTool('ai_video', sheet.id, field) });
    }
    if (toolKeys.includes('flash_note')) {
      tools.push(
        {
          key: 'flash-new',
          label: field.kind === 'video_upload' ? '新建视频闪记' : '新建语音闪记',
          icon: field.kind === 'video_upload' ? <VideoCameraOutlined /> : <SoundOutlined />,
          onClick: () => openTool('flash_create', sheet.id, field),
        },
        { key: 'flash-select', label: '选择闪记', icon: <InboxOutlined />, onClick: () => openTool('flash_select', sheet.id, field) },
      );
    }
    if (toolKeys.includes('camera')) {
      tools.push({ key: 'camera', label: '拍照', icon: <CameraOutlined />, onClick: () => openTool('camera', sheet.id, field) });
    }
    if (toolKeys.includes('checkin')) {
      tools.push({
        key: 'checkin',
        label: '拍照打卡',
        icon: <EnvironmentOutlined />,
        onClick: () => openTool('checkin', sheet.id, field),
        primary: sheet.workKind === 'checkin_treasure',
      });
    }

    if (!tools.length) {
      return null;
    }

    return (
      <div className="device-field-tools">
        <span>辅助完成</span>
        <div className="device-field-tool-grid">
          {tools.map((tool) => (
            <Button key={tool.key} size="small" type={tool.primary ? 'primary' : 'default'} icon={tool.icon} onClick={tool.onClick}>
              {tool.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  function buildFlashNoteMedia(note: FlashNoteItem): DemoWorkMedia[] {
    const media: DemoWorkMedia[] = [
      {
        id: `${note.id}-ref`,
        type: '闪记引用',
        title: note.title,
        url: '',
        flashNoteId: note.id,
        summary: getFlashNoteSummary(note),
      },
    ];

    if (note.audio) {
      media.push({
        id: `${note.id}-audio`,
        type: '音频',
        title: note.audio.title ?? `${note.title}录音`,
        url: note.audio.url ?? '/mock/flash-note-audio.mp3',
        duration: note.audio.duration,
        flashNoteId: note.id,
        summary: getFlashNoteSummary(note),
      });
    }

    (note.photos ?? []).forEach((photo, index) => {
      media.push({
        id: `${note.id}-photo-${index}`,
        type: '照片',
        title: photo.title,
        url: photo.url ?? '/mock/task-photo.jpg',
        flashNoteId: note.id,
        summary: getFlashNoteSummary(note),
      });
    });

    if (note.video) {
      media.push({
        id: `${note.id}-video`,
        type: '视频',
        title: note.video.title ?? `${note.title}视频`,
        url: note.video.url ?? '/mock/explain-video.mp4',
        duration: note.video.duration,
        flashNoteId: note.id,
        summary: getFlashNoteSummary(note),
      });
    }

    return media;
  }

  function acceptFlashNote(sheetId: string, note: FlashNoteItem, field: DemoWorkFormField) {
    markSheetDirty(sheetId);
    const media = buildFlashNoteMedia(note);
    setLinkedFlashNotesBySheet((current) => ({
      ...current,
      [sheetId]: [
        {
          id: note.id,
          title: note.title,
          type: note.type,
          transcript: note.transcript,
          photoCount: note.photos?.length ?? 0,
          duration: note.duration,
        },
        ...((current[sheetId] ?? []).filter((item) => item.id !== note.id)),
      ].slice(0, 4),
    }));
    if (note.audio) {
      setAudioPreviewBySheet((current) => ({
        ...current,
        [sheetId]: { title: note.audio?.title ?? `${note.title}录音`, duration: note.audio?.duration },
      }));
    }
    acceptToolResult(sheetId, field, `闪记：${getFlashNoteSummary(note)}`, media);
    setFlashNotes(getFlashNotes());
  }

  function renderAcceptedForField(sheetId: string, fieldId: string) {
    const accepted = acceptedByFieldBySheet[sheetId]?.[fieldId] ?? [];
    if (!accepted.length) {
      return null;
    }

    return (
      <div className="device-field-accepted">
        <span>已采纳</span>
        <div>
          {accepted.map((item) => (
            <Tag
              key={item.id}
              color={
                item.type.startsWith('AI') ? 'blue' : item.type === '闪记引用' ? 'cyan' : item.type === '打卡证明' ? 'green' : 'purple'
              }
            >
              {item.type} · {item.title}
            </Tag>
          ))}
        </div>
      </div>
    );
  }

  function renderToolModal() {
    if (!activeTool) {
      return null;
    }

    const { field, kind, sheetId } = activeTool;
    const flashCreateType = field.kind === 'video_upload' ? 'video_note' : 'voice_note';
    const modalTitle =
      kind === 'ask'
        ? '问问'
        : kind === 'identify'
          ? 'AI识图'
          : kind === 'ai_draw'
            ? 'AI绘图'
            : kind === 'ai_video'
              ? 'AI视频'
              : kind === 'flash_create'
                ? flashCreateType === 'voice_note'
                  ? '语音闪记'
                  : '视频闪记'
                : kind === 'flash_select'
                  ? '选择闪记'
                  : kind === 'checkin'
                    ? '拍照打卡'
                    : '拍照';

    const askAnswer =
      field.kind === 'link_upload'
        ? `问问过程：AI 已围绕“${field.label}”帮我整理出观察证据、我的判断和下一步还可以追问的问题。`
        : `问问回答：可以从现场证据、自己的判断和还想继续研究的问题三个角度回答“${field.label}”。`;
    const identifyAnswer =
      field.kind === 'link_upload'
        ? `AI识图过程：我让 AI 帮忙识别现场画面，它提醒我关注海洋动物、标志牌和观察位置这些关键线索。`
        : `AI识图结果：画面中发现了海洋动物、标志牌和观察位置，可作为“${field.label}”的证据。`;
    const drawAnswer =
      field.kind === 'link_upload'
        ? `AI绘图过程：已根据“${toolPrompt || field.label}”生成研学创作图，可以作为本次 AI 创作的过程证明。`
        : `AI绘图作品：根据“${toolPrompt || field.label}”生成一张研学创作图。`;
    const videoAnswer =
      field.kind === 'link_upload'
        ? `AI视频过程：已根据“${toolPrompt || field.label}”生成 15 秒 AI 展示视频，可作为本次探究过程记录。`
        : `AI视频作品：根据“${toolPrompt || field.label}”生成 15 秒研学展示视频。`;

    return (
      <Modal title={modalTitle} open centered width={kind === 'flash_create' ? 420 : 360} footer={null} onCancel={() => setActiveTool(null)}>
        <div className="device-tool-modal">
          <p className="device-mini-item-desc">当前题目：{field.label}</p>

          {kind === 'flash_select' ? (
            flashNotes.length ? (
              <div className="device-tool-choice-list">
                {flashNotes.map((note) => (
                  <button key={note.id} type="button" className="device-tool-choice-card" onClick={() => acceptFlashNote(sheetId, note, field)}>
                    <strong>{note.title}</strong>
                    <span>{getFlashNoteSummary(note)}</span>
                    <em>{getFlashNoteMeta(note).join(' · ')}</em>
                  </button>
                ))}
              </div>
            ) : (
              <p className="device-mini-item-desc" style={{ margin: 0 }}>当前没有可引用的闪记。</p>
            )
          ) : kind === 'flash_create' ? (
            <FlashNoteRecorder
              type={flashCreateType}
              contextTitle={field.label}
              sourceContext={{ source: 'task', taskId: activeTask.id, taskSheetId: sheetId, fieldId: field.id }}
              saveButtonLabel="保存并采纳到本题"
              onSaved={(note) => acceptFlashNote(sheetId, note, field)}
            />
          ) : (
            <>
              {kind === 'camera' || kind === 'checkin' || kind === 'identify' ? (
                <div className="device-tool-camera-stage">
                  <span>{kind === 'checkin' ? '水印打卡照片' : kind === 'identify' ? 'AI识图照片' : '现场照片'}</span>
                  <em>{kind === 'checkin' ? '深圳海洋馆 · 刚刚' : '模拟拍照完成'}</em>
                </div>
              ) : (
                <Input.TextArea rows={3} value={toolPrompt} onChange={(event) => setToolPrompt(event.target.value)} placeholder="输入提示词或问题" />
              )}
              <div className="device-tool-preview">
                <strong>生成结果</strong>
                <span>
                  {kind === 'ask'
                    ? askAnswer
                    : kind === 'identify'
                      ? identifyAnswer
                      : kind === 'ai_draw'
                        ? drawAnswer
                        : kind === 'ai_video'
                          ? videoAnswer
                          : kind === 'checkin'
                            ? '已生成带地点和时间的水印打卡照片。'
                            : '已拍摄现场补充照片。'}
                </span>
              </div>
              <Button
                type="primary"
                block
                onClick={() => {
                  if (kind === 'ask') {
                    acceptToolResult(sheetId, field, askAnswer, [
                      {
                        id: `ask-${Date.now()}`,
                        type: 'AI回答',
                        title: '问问回答',
                        url: '',
                        summary: askAnswer,
                      },
                    ]);
                    return;
                  }
                  if (kind === 'identify') {
                    acceptToolResult(sheetId, field, identifyAnswer, [
                      {
                        id: `identify-${Date.now()}`,
                        type: 'AI识图',
                        title: 'AI识图结果',
                        url: '/mock/task-photo.jpg',
                        summary: identifyAnswer,
                      },
                    ]);
                    return;
                  }
                  if (kind === 'ai_draw') {
                    acceptToolResult(sheetId, field, drawAnswer, [
                      {
                        id: `ai-draw-${Date.now()}`,
                        type: 'AI绘图',
                        title: 'AI研学创作图',
                        url: '/mock/ai-proof-screenshot.png',
                        summary: drawAnswer,
                      },
                    ]);
                    return;
                  }
                  if (kind === 'ai_video') {
                    acceptToolResult(sheetId, field, videoAnswer, [
                      {
                        id: `ai-video-${Date.now()}`,
                        type: 'AI视频',
                        title: 'AI研学视频',
                        url: '/mock/explain-video.mp4',
                        duration: '00:15',
                        summary: videoAnswer,
                      },
                    ]);
                    return;
                  }
                  if (kind === 'checkin') {
                    acceptToolResult(sheetId, field, '', [
                      {
                        id: `checkin-${Date.now()}`,
                        type: '打卡证明',
                        title: '水印打卡照片',
                        url: '/mock/checkin-watermark.jpg',
                        locationLabel: '深圳海洋馆 · 海豚馆入口',
                        capturedAt: '刚刚',
                        summary: '在指定地点完成拍照打卡。',
                      },
                    ]);
                    return;
                  }

                  acceptToolResult(sheetId, field, '', [
                    {
                      id: `camera-${Date.now()}`,
                      type: '照片',
                      title: '现场补充照片',
                      url: '/mock/task-photo.jpg',
                      summary: '拍摄了一张现场补充照片。',
                    },
                  ]);
                }}
              >
                采纳到本题
              </Button>
            </>
          )}
        </div>
      </Modal>
    );
  }

  function getSheetStatus(item: DeviceLearningWorkItem) {
    if (sheetErrors[item.sheetId]) {
      return { label: '待完善', color: 'red' as const };
    }
    if (dirtySheetIds.includes(item.sheetId)) {
      return { label: '有修改未提交', color: 'blue' as const };
    }
    return { label: item.displayStatus, color: item.displayStatus === '已提交' ? 'green' as const : 'orange' as const };
  }

  function handleFormValuesChange(changedValues: SheetFormValues) {
    Object.keys(changedValues).forEach((sheetId) => {
      markSheetDirty(sheetId);
    });
  }

  function renderSheetFields(sheet: DeviceTaskSheet) {
    return (
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(47, 107, 255, 0.1)' }}>
        {sheet.workForm.map((field) => {
          const fieldError = sheetErrors[sheet.id]?.[field.id];
          const commonProps = {
            key: field.id,
            label: field.label,
            extra: field.helper,
            required: field.required ?? true,
            validateStatus: fieldError ? ('error' as const) : undefined,
            help: fieldError,
          };

          if (field.kind === 'fill_blank') {
            return (
              <Form.Item {...commonProps}>
                <div className="device-voice-input-row">
                  <Form.Item name={[sheet.id, field.id]} noStyle>
                    <Input.TextArea rows={3} placeholder={field.placeholder} />
                  </Form.Item>
                  <button
                    type="button"
                    className="device-voice-input-button"
                    aria-label={`${field.label}语音输入`}
                    onClick={() => applyVoiceToField(sheet.id, field)}
                  >
                    <AudioOutlined />
                  </button>
                </div>
                {renderFieldTools(sheet, field)}
                {renderAcceptedForField(sheet.id, field.id)}
              </Form.Item>
            );
          }

          if (field.kind === 'single_choice') {
            return (
              <Form.Item {...commonProps}>
                <Form.Item name={[sheet.id, field.id]} noStyle>
                  <Radio.Group options={field.options.map((option) => ({ label: option, value: option }))} />
                </Form.Item>
                {renderFieldTools(sheet, field)}
                {renderAcceptedForField(sheet.id, field.id)}
              </Form.Item>
            );
          }

          if (field.kind === 'multiple_choice') {
            return (
              <Form.Item {...commonProps}>
                <Form.Item name={[sheet.id, field.id]} noStyle>
                  <Checkbox.Group options={field.options} />
                </Form.Item>
                {renderFieldTools(sheet, field)}
                {renderAcceptedForField(sheet.id, field.id)}
              </Form.Item>
            );
          }

          if (field.kind === 'link_upload') {
            const currentValue = String(form.getFieldValue([sheet.id, field.id]) ?? '').trim();
            const acceptedRecords = acceptedByFieldBySheet[sheet.id]?.[field.id] ?? [];

            return (
              <Form.Item {...commonProps}>
                <Form.Item name={[sheet.id, field.id]} hidden>
                  <Input />
                </Form.Item>
                <div className="device-smart-field-card">
                  <div className="device-smart-field-head">
                    <div>
                      <strong>{acceptedRecords.length ? `已回填 ${acceptedRecords.length} 条 AI 过程结果` : '还没有 AI 探究过程记录'}</strong>
                      <span>不用粘贴链接，直接点下方按钮，系统会把结果自动带回当前作品。</span>
                    </div>
                    <Tag color={acceptedRecords.length ? 'blue' : 'default'}>{acceptedRecords.length ? `${acceptedRecords.length} 条` : '待采集'}</Tag>
                  </div>
                  <div className={`device-smart-field-body${currentValue ? '' : ' empty'}`}>
                    {currentValue || '支持语音记录、问问、AI识图、AI绘图、AI视频和闪记回填，更符合手表端交互。'}
                  </div>
                </div>
                {renderFieldTools(sheet, field)}
                {renderAcceptedForField(sheet.id, field.id)}
              </Form.Item>
            );
          }

          if (field.kind === 'image_upload' || field.kind === 'video_upload' || field.kind === 'audio_upload') {
            return (
              <Form.Item
                key={field.id}
                label={field.label}
                extra={`${field.helper ?? ''}${field.limitText ? `${field.helper ? ' · ' : ''}${field.limitText}` : ''}${field.required ?? true ? '' : ' · 选填'}`}
                validateStatus={fieldError ? 'error' : undefined}
                help={fieldError}
              >
                <Dragger
                  beforeUpload={() => false}
                  multiple={field.kind === 'image_upload'}
                  fileList={uploadMapBySheet[sheet.id]?.[field.id] ?? []}
                  onChange={({ fileList }) => {
                    setSheetUploadFiles(sheet.id, field.id, fileList, field.kind === 'image_upload' ? 3 : 1);
                  }}
                  accept={field.kind === 'image_upload' ? 'image/*' : field.kind === 'video_upload' ? 'video/*' : 'audio/*'}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {field.kind === 'image_upload' ? '上传图片附件' : field.kind === 'video_upload' ? '上传视频附件' : '上传音频附件'}
                  </p>
                </Dragger>
                {renderFieldTools(sheet, field)}
                {renderAcceptedForField(sheet.id, field.id)}
              </Form.Item>
            );
          }

          return null;
        })}

        {(audioPreviewBySheet[sheet.id] || linkedFlashNotesBySheet[sheet.id]?.length || quickMediaBySheet[sheet.id]?.length) ? (
          <div className="device-collected-panel">
            <p className="device-section-label">已采集内容</p>
            {audioPreviewBySheet[sheet.id] ? (
              <div className="device-audio-preview">
                <div>
                  <strong>已录制声音</strong>
                  <p>
                    {audioPreviewBySheet[sheet.id]?.title} · {audioPreviewBySheet[sheet.id]?.duration ?? '时长待定'}
                  </p>
                </div>
                <Button size="small" icon={<PlayCircleOutlined />} onClick={() => messageApi.success('正在播放已录制声音')}>
                  播放
                </Button>
              </div>
            ) : null}
            {linkedFlashNotesBySheet[sheet.id]?.length ? (
              <div className="device-mini-list" style={{ marginTop: 8 }}>
                {linkedFlashNotesBySheet[sheet.id].map((item) => (
                  <div key={item.id} className="device-mini-item">
                    <div className="device-mini-item-title">
                      <span>{item.title}</span>
                      <Tag color={item.type === 'video_note' ? 'purple' : 'green'}>{item.type === 'video_note' ? '视频闪记' : '语音闪记'}</Tag>
                    </div>
                    <p className="device-mini-item-desc" style={{ margin: '4px 0 0' }}>
                      {[item.duration, item.photoCount ? `${item.photoCount}张照片` : '', item.transcript].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {quickMediaBySheet[sheet.id]?.length ? (
              <div className="device-attachment-list compact" style={{ marginTop: 8 }}>
                {quickMediaBySheet[sheet.id].map((item) => (
                  <div key={item.id} className="device-attachment-card">
                    <span>{item.title}</span>
                    <Tag color={item.type === '打卡证明' ? 'green' : item.type === '音频' ? 'orange' : item.type === '链接' ? 'blue' : 'purple'}>
                      {item.type}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  async function submitWork(allValues: SheetFormValues) {
    if (!session?.user.studentId) {
      messageApi.error('当前缺少学员信息，请重新登录');
      return;
    }

    try {
      setSubmitting(true);
      const nextSheetErrors: SheetErrors = {};
      const sheetsToSubmit: Array<{ sheet: DeviceTaskSheet; values: FormValues }> = [];

      for (const sheet of activeTask.taskSheets) {
        const values = getSheetValues(allValues, sheet.id);
        const validation = validateSheetInputs(
          sheet,
          values,
          uploadMapBySheet[sheet.id] ?? {},
          acceptedByFieldBySheet[sheet.id] ?? {},
          false,
        );
        const isDirty = dirtySheetIds.includes(sheet.id);
        const hasExistingWork = Boolean(currentWorkBySheetId[sheet.id]);
        const shouldSubmit = isDirty || (!hasExistingWork && validation.hasContent);

        if (!shouldSubmit) {
          continue;
        }

        const strictValidation = validateSheetInputs(
          sheet,
          values,
          uploadMapBySheet[sheet.id] ?? {},
          acceptedByFieldBySheet[sheet.id] ?? {},
          true,
        );
        if (Object.keys(strictValidation.fieldErrors).length) {
          nextSheetErrors[sheet.id] = strictValidation.fieldErrors;
          continue;
        }

        sheetsToSubmit.push({ sheet, values });
      }

      if (Object.keys(nextSheetErrors).length) {
        setSheetErrors(nextSheetErrors);
        const invalidCount = Object.keys(nextSheetErrors).length;
        setSubmitNotice(`还有 ${invalidCount} 项学习作品未完善，请先补齐必填内容。`);
        messageApi.error('请先完善未完成的学习作品');
        return;
      }

      if (!sheetsToSubmit.length) {
        setSubmitNotice('当前还没有可提交的学习作品，请先完成至少 1 题。');
        messageApi.error('请先完成至少 1 题');
        return;
      }

      for (const { sheet, values } of sheetsToSubmit) {
        const serializedParts: string[] = [];
        const formAnswers: DemoWorkAnswer[] = [];
        const collectedMediaMap = new Map<string, DemoWorkMedia>();
        (quickMediaBySheet[sheet.id] ?? []).forEach((item) => {
          collectedMediaMap.set(item.id, item);
        });

        for (const field of sheet.workForm) {
          if (field.kind === 'fill_blank') {
            const value = String(values[field.id] ?? '').trim();
            serializedParts.push(`${field.label}：${value}`);
            formAnswers.push({ fieldId: field.id, kind: 'fill_blank', label: field.label, value });
            continue;
          }

          if (field.kind === 'single_choice') {
            const value = String(values[field.id] ?? '').trim();
            serializedParts.push(`${field.label}：${value}`);
            formAnswers.push({ fieldId: field.id, kind: 'single_choice', label: field.label, value: value ? [value] : [] });
            continue;
          }

          if (field.kind === 'multiple_choice') {
            const rawValue = values[field.id];
            const value = Array.isArray(rawValue) ? rawValue : [];
            serializedParts.push(`${field.label}：${value.join('、')}`);
            formAnswers.push({ fieldId: field.id, kind: 'multiple_choice', label: field.label, value });
            continue;
          }

          if (field.kind === 'link_upload') {
            const value = String(values[field.id] ?? '').trim();
            const acceptedFiles = acceptedByFieldBySheet[sheet.id]?.[field.id] ?? [];

            if (value || acceptedFiles.length) {
              const linkFiles =
                acceptedFiles.length > 0
                  ? acceptedFiles
                  : [
                      {
                        id: `${sheet.id}-${field.id}-record`,
                        type: '链接' as const,
                        title: field.label,
                        url: '',
                        summary: value,
                      },
                    ];

              serializedParts.push(`${field.label}：${value || linkFiles.map((item) => `${item.type}·${item.title}`).join('、')}`);
              formAnswers.push({ fieldId: field.id, kind: field.kind, label: field.label, files: linkFiles });
              linkFiles.forEach((item) => {
                collectedMediaMap.set(item.id, item);
              });
            }
            continue;
          }

          const uploadedFiles: DemoWorkMedia[] = [];
          for (const file of uploadMapBySheet[sheet.id]?.[field.id] ?? []) {
            if (field.kind === 'audio_upload') {
              uploadedFiles.push({
                id: `${sheet.id}-${field.id}-${file.uid}`,
                type: '音频',
                title: file.name,
                url: file.url ?? '/mock/audio-note.mp3',
                duration: '00:15',
              });
              continue;
            }

            if (file.originFileObj) {
              const uploaded = await uploadFile<UploadResult>(file.originFileObj as File, { studentId: session.user.studentId! });
              uploadedFiles.push({
                id: `${sheet.id}-${field.id}-${file.uid}`,
                type: field.kind === 'image_upload' ? '照片' : '视频',
                title: uploaded.file.originalName,
                url: uploaded.file.publicUrl,
              });
            } else {
              uploadedFiles.push({
                id: `${sheet.id}-${field.id}-${file.uid}`,
                type: field.kind === 'image_upload' ? '照片' : '视频',
                title: file.name,
                url: file.url ?? '',
              });
            }
          }

          if (uploadedFiles.length) {
            serializedParts.push(`${field.label}：${uploadedFiles.map((item) => `${item.title} (${item.url})`).join('、')}`);
            formAnswers.push({ fieldId: field.id, kind: field.kind, label: field.label, files: uploadedFiles });
            uploadedFiles.forEach((item) => {
              collectedMediaMap.set(item.id, item);
            });
          }
        }

        const textAnswers = formAnswers
          .filter((item): item is Extract<DemoWorkAnswer, { value: string[] }> => 'value' in item)
          .map((item) => `${item.label}：${Array.isArray(item.value) ? item.value.join('、') : item.value}`);
        const summary = textAnswers[0] ?? sheet.requirement;
        const textContent = textAnswers.join('\n');

        await apiFetch('/works', {
          method: 'POST',
          body: JSON.stringify({
            taskId: activeTask.id,
            studentId: session.user.studentId,
            type: sheet.mediaTypes.includes('视频') ? 'video' : sheet.mediaTypes.includes('照片') ? 'image' : 'text',
            content: serializedParts.join('\n'),
          }),
        });

        upsertDeviceTaskWorkSubmission({
          task: activeTask,
          sheet,
          formAnswers,
          media: [...collectedMediaMap.values()],
          summary,
          textContent,
          linkedFlashNotes: linkedFlashNotesBySheet[sheet.id],
          audioPreview: audioPreviewBySheet[sheet.id],
        });
      }

      clearDemoDraft();
      setDirtySheetIds([]);
      setSheetErrors({});
      setSubmitNotice(null);
      messageApi.success('本任务作品已提交');
      router.push(`/tasks/${activeTask.id}`);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '提交作品失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      {renderToolModal()}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">填写作品</p>
          <p className="device-page-subtle">{activeTask.title}</p>
          <Space wrap>
            <Tag color="blue">{activeTask.taskType}</Tag>
            <Tag color="cyan">{activeTask.target}</Tag>
            <Tag color="green">{activeTask.taskSheets.length} 题</Tag>
          </Space>
          <Space wrap>
            {activeTask.capabilityTags.map((tag) => (
              <Tag key={tag} color="purple">
                {tag}
              </Tag>
            ))}
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">填写要求</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          本页统一完成当前任务的全部学习作品。每道题都保留题内工具，可直接采集证据并带入答案。
        </p>
        {submitNotice ? (
          <p className="device-mini-item-desc" style={{ marginTop: 8, color: '#d46b08' }}>
            {submitNotice}
          </p>
        ) : null}
        {autoImportDraft ? (
          <p className="device-mini-item-desc" style={{ marginTop: 8 }}>已自动导入最近草稿内容，可直接修改后提交。</p>
        ) : draft && (taskIdFromQuery || sheetIdFromQuery) ? (
          <p className="device-mini-item-desc" style={{ marginTop: 8 }}>
            最近草稿未自动带入，避免把其他任务的内容串到当前学习作品里。
          </p>
        ) : null}
      </div>

      <div className="device-compact-card">
        <Form form={form} layout="vertical" onValuesChange={handleFormValuesChange} onFinish={submitWork}>
          <p className="device-section-label">完成题目</p>
          <p className="device-mini-item-desc" style={{ marginTop: 0 }}>
            所有题目都在下面，并且全部直接展开。你可以顺着页面连续填写，不再切换题目。
          </p>

          <div className="device-mini-list" style={{ marginTop: 12 }}>
            {learningWorks.map((item) => {
              const status = getSheetStatus(item);
              const sheet = activeTask.taskSheets.find((entry) => entry.id === item.sheetId);

              if (!sheet) {
                return null;
              }

              return (
                <div
                  key={item.sheetId}
                  className="device-mini-item"
                  style={{ borderColor: 'rgba(47, 107, 255, 0.18)', background: 'rgba(47, 107, 255, 0.04)' }}
                >
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Tag color={status.color}>{status.label}</Tag>
                  </div>
                  <div className="device-action-chip-row" style={{ marginTop: 6 }}>
                    {item.gameplayKind ? <Tag color="gold">{GAMEPLAY_LABELS[item.gameplayKind]}</Tag> : null}
                    <Tag color="default">{item.workCategory}</Tag>
                    <Tag color="default">{item.topicType}</Tag>
                  </div>
                  <p className="device-mini-item-desc" style={{ marginTop: 6 }}>
                    {item.requirement}
                  </p>
                  {sheetErrors[item.sheetId] ? (
                    <p className="device-mini-item-desc" style={{ marginTop: 6, color: '#cf1322' }}>
                      这题还有必填内容未完成，请先补齐后再统一提交。
                    </p>
                  ) : null}

                  {renderSheetFields(sheet)}
                </div>
              );
            })}
          </div>

          <div className="device-action-row">
            <Button htmlType="submit" type="primary" loading={submitting} block>
              提交本任务作品
            </Button>
            <Link href={`/tasks/${activeTask.id}`}>
              <Button block>返回研学活动</Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
