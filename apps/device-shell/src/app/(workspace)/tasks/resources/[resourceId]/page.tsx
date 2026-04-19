'use client';

import { Button, Input, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getDeviceTaskList } from '../../../../../lib/device-task-data';

const { Paragraph } = Typography;

type DeviceTaskForResource = ReturnType<typeof getDeviceTaskList>[number];
type DeviceResourcePack = DeviceTaskForResource['resourcePacks'][number];

function getResourceLabel(resource: DeviceResourcePack) {
  if (resource.previewMode === 'ai') {
    return { color: 'cyan', label: 'AI资料' };
  }

  if (resource.previewMode === 'pdf') {
    return { color: 'purple', label: 'PDF资料' };
  }

  return { color: 'green', label: '图文资料' };
}

function buildFallbackPrompt(task: DeviceTaskForResource, resource: DeviceResourcePack) {
  return `请为“${task.title}”研学活动生成“${resource.title}”资源包。活动地点：${task.infoSummary}。任务要求：${task.requirement}。请输出结构清晰、可直接使用的活动资源信息。`;
}

function buildAiResourceResult(task: DeviceTaskForResource, resource: DeviceResourcePack, prompt: string) {
  const isRoute = resource.title.includes('路线');
  const variant = Math.floor(Date.now() / 1000) % 3;
  const closing =
    variant === 0
      ? '请带队老师在集合前 10 分钟完成点名，并提醒学生把观察记录同步到学习作品。'
      : variant === 1
        ? '建议活动结束后用 3 分钟做口头复盘，让学生说出一个发现和一个还想追问的问题。'
        : '如遇场馆临时调整，以现场导师指令为准，学生需保持小组同行。';

  if (isRoute) {
    return [
      `AI 已根据默认提示词生成《${resource.title}》`,
      '',
      '1. 路线总览',
      `${task.title}围绕“${task.infoSummary}”展开，建议按“集合确认 -> 任务说明 -> 站点观察 -> 打卡记录 -> 集中复盘”的顺序完成。`,
      '',
      '2. 时间安排',
      `- 集合与安全说明：10 分钟`,
      `- 站点观察与任务执行：${task.timeLimit.includes('前') ? '按现场开放时间推进' : task.timeLimit}`,
      '- 作品整理与复盘：15 分钟',
      '',
      '3. 站点顺序',
      '- 站点一：集合点，确认人数、设备和小组分工。',
      '- 站点二：核心观察区，完成拍照、记录或问答任务。',
      '- 站点三：出口或复盘区，整理学习作品并提交关键证据。',
      '',
      '4. 转场提醒',
      '- 每次转场前由组长确认成员到齐。',
      '- 转场时靠右行走，不在通道中停留拍摄。',
      '- 信息不足的位置用“待补充”标注，避免编造真实坐标。',
      '',
      '5. 安全注意事项',
      '- 保持小组同行，听从带队老师指令。',
      '- 拍照时注意身后人流和场馆边界。',
      `- ${closing}`,
      '',
      '6. 带队老师执行清单',
      '- 点名、分组、确认任务设备。',
      '- 检查每组是否完成至少一条观察证据。',
      '- 活动结束前确认学习作品提交状态。',
      '',
      `提示词摘要：${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`,
    ].join('\n');
  }

  return [
    `AI 已根据默认提示词生成《${resource.title}》`,
    '',
    '1. 活动概述',
    `${task.title}是一项${task.taskType}，活动地点/主题为“${task.infoSummary}”。学生需要围绕任务要求完成观察、记录和作品提交。`,
    '',
    '2. 行前准备',
    '- 检查设备电量、网络和拍照/录音功能。',
    '- 提前阅读活动说明，了解本次需要提交的学习作品。',
    '- 准备便于记录的关键词：地点、时间、观察对象、证据。',
    '',
    '3. 学生注意事项',
    `- 本次任务要求：${task.requirement}`,
    '- 观察时先看清楚，再拍照或记录，不要只收集素材。',
    '- 遇到不确定的问题，可以记录下来，活动后继续追问。',
    '',
    '4. 家长配合事项',
    '- 出发前提醒孩子确认设备和个人物品。',
    '- 活动后可询问孩子“看到什么、想到什么、下一步想研究什么”。',
    '',
    '5. 带队老师检查清单',
    `- 确认学习作品进度：${task.worksSubmitted}/${task.worksRequired}`,
    '- 确认小组分工、集合时间和安全边界。',
    '- 活动结束前提醒学生保存草稿或提交作品。',
    '',
    '6. 安全提醒',
    '- 不单独离队，不在拥挤区域奔跑。',
    '- 拍摄时不越过围栏，不影响其他游客或同学。',
    `- ${closing}`,
    '',
    '7. 活动收获引导',
    '- 请学生用一句话说出今天最重要的发现。',
    '- 请学生选一张最有证据价值的照片，并说明原因。',
    '',
    `提示词摘要：${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`,
  ].join('\n');
}

function DeviceAiResourcePanel({ task, resource }: { task: DeviceTaskForResource; resource: DeviceResourcePack }) {
  const [messageApi, contextHolder] = message.useMessage();
  const storageKey = `yanxuebao_ai_resource_${task.id}_${resource.id}`;
  const defaultPrompt = useMemo(() => resource.defaultPrompt ?? buildFallbackPrompt(task, resource), [resource, task]);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const saved = JSON.parse(raw) as { prompt?: string; result?: string; savedAt?: string };
      setPrompt(saved.prompt || defaultPrompt);
      setResult(saved.result || '');
      setSavedAt(saved.savedAt || '');
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [defaultPrompt, storageKey]);

  function generateResult() {
    if (!prompt.trim()) {
      messageApi.warning('请先输入提示词');
      return;
    }

    setGenerating(true);
    window.setTimeout(() => {
      const nextResult = buildAiResourceResult(task, resource, prompt.trim());
      const nextSavedAt = '刚刚';
      setResult(nextResult);
      setSavedAt(nextSavedAt);
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          prompt: prompt.trim(),
          result: nextResult,
          savedAt: nextSavedAt,
        }),
      );
      setGenerating(false);
      messageApi.success('AI 资源包已生成');
    }, 900);
  }

  async function copyResult() {
    if (!result) {
      messageApi.warning('请先生成内容');
      return;
    }

    await window.navigator.clipboard.writeText(result);
    messageApi.success('已复制生成结果');
  }

  return (
    <>
      {contextHolder}
      <div className="device-compact-card">
        <div className="device-mini-item-title">
          <span>AI 对话框</span>
          <Tag color={savedAt ? 'green' : 'default'}>{savedAt ? `已生成 ${savedAt}` : '待生成'}</Tag>
        </div>
        <div className="device-ai-resource-chat">
          <div className="device-ai-resource-bubble assistant">
            我会按资源包默认提示词，为当前活动生成一份可直接使用的活动资料。
          </div>
          <Input.TextArea
            rows={7}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            readOnly={resource.allowEditPrompt === false}
            className="device-ai-resource-prompt"
          />
          <div className="device-action-row">
            <Button type="primary" loading={generating} onClick={generateResult} block>
              {result ? '重新生成' : '生成'}
            </Button>
            <Button onClick={copyResult} disabled={!result} block>
              复制结果
            </Button>
          </div>
        </div>
      </div>

      <div className="device-compact-card">
        <div className="device-mini-item-title">
          <span>生成结果</span>
          <Tag color="cyan">AI 大模型</Tag>
        </div>
        {result ? (
          <pre className="device-ai-resource-result">{result}</pre>
        ) : (
          <p className="device-mini-item-desc" style={{ marginTop: 8 }}>
            点击生成后，这里会返回一份新的活动资源信息。同一个基础提示词可多次生成，内容会有轻微差异。
          </p>
        )}
      </div>
    </>
  );
}

export default function DeviceTaskResourceDetailPage() {
  const params = useParams<{ resourceId: string }>();
  const task = getDeviceTaskList().find((item) => item.resourcePacks.some((resource) => resource.id === params.resourceId));
  const resource = task?.resourcePacks.find((item) => item.id === params.resourceId);

  if (!task || !resource) {
    return <Result status="404" title="未找到资源包" extra={<Link href="/tasks"><span>返回任务</span></Link>} />;
  }

  const resourceLabel = getResourceLabel(resource);

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">活动资源包</Tag>
            <Tag color={resourceLabel.color}>{resourceLabel.label}</Tag>
          </Space>
          <p className="device-page-title">{resource.title}</p>
          <p className="device-page-subtle">{task.title}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">资源说明</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{resource.summary}</Paragraph>
      </div>

      {resource.previewMode === 'ai' ? (
        <DeviceAiResourcePanel task={task} resource={resource} />
      ) : resource.previewMode === 'doc' ? (
        <div className="device-compact-card">
          <p className="device-section-label">图文内容</p>
          <div className="device-resource-doc-list">
            {(resource.docSections ?? []).map((section) => (
              <div key={section.title} className={`device-resource-doc-card accent-${section.accent}`}>
                <div className="device-resource-doc-thumb">{section.imageLabel}</div>
                <div>
                  <div className="device-mini-item-title" style={{ marginBottom: 6 }}>
                    <span>{section.title}</span>
                  </div>
                  <p className="device-mini-item-desc">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="device-compact-card">
          <p className="device-section-label">PDF资料</p>
          <div className="device-resource-pdf-list">
            {(resource.pdfPages ?? []).map((page) => (
              <div key={page.pageTitle} className="device-resource-pdf-page">
                <div className="device-mini-item-title">
                  <span>{page.pageTitle}</span>
                  <Tag color="purple">预览页</Tag>
                </div>
                <p className="device-mini-item-desc" style={{ marginBottom: 8 }}>{page.pageHint}</p>
                <div className="device-resource-pdf-blocks">
                  {page.blocks.map((block) => (
                    <div key={`${page.pageTitle}-${block.title ?? block.content}`} className={`device-resource-pdf-block tone-${block.tone ?? 'paragraph'}`}>
                      {block.title ? <p className="device-resource-pdf-block-title">{block.title}</p> : null}
                      <p className="device-mini-item-desc">{block.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
