'use client';

import {
  AppstoreOutlined,
  AudioOutlined,
  CameraOutlined,
  DownOutlined,
  PictureOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Segmented, Typography, message } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { clearCaptureShare, useCaptureShare } from '../../../lib/device-capture-share';
import {
  getMediaAssetById,
  saveScreenshotAsset,
  useDeviceMediaLibrary,
  type DeviceMediaAsset,
} from '../../../lib/device-media-library';
import {
  getPlazaAgentById,
  getPlazaAgents,
  getRecentPlazaAgents,
  usePlazaState,
} from '../../../lib/device-plaza-data';

const { Paragraph, Text } = Typography;

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  asset?: DeviceMediaAsset | null;
};

function buildAssistantReply(agentName: string, prompt: string, asset?: DeviceMediaAsset | null) {
  if (asset) {
    return `我已经带着“${asset.title}”继续分析。${asset.summary} 结合你的问题“${prompt}”，建议你把现场证据、自己的判断和下一步追问分开整理。`;
  }

  return `${agentName} 已收到你的问题：“${prompt}”。我会先帮你提炼关键词，再给出适合手表端提交作品的简短答案。`;
}

export default function DeviceAskPage() {
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const plazaState = usePlazaState();
  useDeviceMediaLibrary();
  const captureShare = useCaptureShare();
  const queryAgentId = searchParams.get('agentId') ?? captureShare?.agentId ?? 'plaza_agent_03';
  const queryAssetId = searchParams.get('assetId') ?? captureShare?.id ?? '';
  const attachedAsset = queryAssetId ? getMediaAssetById(queryAssetId) : captureShare ?? null;
  const [activeAgentId, setActiveAgentId] = useState(queryAgentId);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [agentScope, setAgentScope] = useState<'常用' | '全部'>('常用');
  const [inputValue, setInputValue] = useState(
    searchParams.get('question') ??
      (attachedAsset ? `帮我分析这${attachedAsset.type === '视频' ? '段视频' : '张图片'}最值得追问什么？` : '海豚为什么喜欢结队活动？'),
  );
  const activeAgent = getPlazaAgentById(activeAgentId, plazaState) ?? plazaState.agents[0];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant_welcome',
      role: 'assistant',
      content: activeAgent
        ? `你好，我是${activeAgent.expertName}。你可以用文字、语音、图片、AI识物结果或 AI 创作结果继续问我。`
        : '你好，我是问问，可以帮你分析研学任务、照片、视频和 AI 记录。',
      asset: attachedAsset,
    },
  ]);

  const commonAgents = useMemo(() => getRecentPlazaAgents(plazaState).slice(0, 4), [plazaState]);
  const allAgents = useMemo(() => getPlazaAgents(plazaState), [plazaState]);
  const agentOptions = agentScope === '常用' ? commonAgents : allAgents;

  function sendQuestion(nextPrompt = inputValue) {
    const trimmed = nextPrompt.trim();
    if (!trimmed) {
      messageApi.warning('先说一句想问什么');
      return;
    }

    const reply = buildAssistantReply(activeAgent?.expertName ?? '问问', trimmed, attachedAsset);
    setMessages((current) => [
      ...current,
      { id: `user_${Date.now()}`, role: 'user', content: trimmed },
      { id: `assistant_${Date.now()}`, role: 'assistant', content: reply },
    ]);
    setInputValue('');
    saveScreenshotAsset({
      title: '问问对话截图',
      previewLabel: activeAgent?.shortTitle ?? '问问',
      summary: `问问已围绕“${trimmed}”生成一段可加入任务作品的回答。`,
      sourceApp: 'ask',
      linkedEntity: { type: 'ask', id: `ask_${Date.now()}`, title: trimmed },
    });
    clearCaptureShare();
  }

  function useMockVoice() {
    const mock = attachedAsset ? `请用一句话说明${attachedAsset.primaryLabel ?? attachedAsset.title}和任务的关系` : '帮我把海豚结队活动整理成任务答案';
    setInputValue(mock);
    messageApi.success('已模拟语音转文字');
  }

  function selectAgent(agentId: string) {
    setActiveAgentId(agentId);
    const agent = getPlazaAgentById(agentId, plazaState);
    setMessages((current) => [
      ...current,
      {
        id: `assistant_switch_${Date.now()}`,
        role: 'assistant',
        content: `已切换到${agent?.title ?? '新专家'}，当前素材和对话上下文会继续保留。`,
      },
    ]);
    setAgentPanelOpen(false);
  }

  return (
    <div className="device-assistant-chat-page ask-chat-mode">
      {contextHolder}
      <div className="device-assistant-chat-header">
        <div className="device-assistant-header-spacer" />
        <div className="device-ask-mobile-title">
          <strong>问问</strong>
          <button type="button" className="device-ask-agent-switch" onClick={() => setAgentPanelOpen(true)}>
            <span>{activeAgent?.shortTitle ?? '智能体'}</span>
            <DownOutlined />
          </button>
        </div>
        <Link href="/plaza" className="device-assistant-header-icon" aria-label="专家广场">
          <AppstoreOutlined />
        </Link>
      </div>

      <div className="device-assistant-chat-scroll">
        <div className="device-assistant-chat-thread">
          {attachedAsset ? (
            <div className="device-ask-attachment-card">
              <div className={`device-album-thumb accent-${attachedAsset.accent ?? 'blue'}`}>
                <span>{attachedAsset.previewLabel ?? attachedAsset.title}</span>
              </div>
              <div>
                <Text strong style={{ fontSize: 12 }}>已挂载素材：{attachedAsset.title}</Text>
                <Paragraph style={{ margin: '4px 0 0', fontSize: 11 }}>{attachedAsset.summary}</Paragraph>
              </div>
            </div>
          ) : null}

          {messages.map((item) => (
            <div key={item.id} className={`device-assistant-message${item.role === 'user' ? ' self without-avatar' : ''}`}>
              {item.role === 'assistant' ? <div className="device-assistant-avatar">问</div> : null}
              <div className={`device-assistant-message-main${item.role === 'user' ? ' self' : ''}`}>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="device-assistant-chat-footer ask-chat-footer">
        <div className="device-ask-tool-strip">
          <Button size="small" icon={<AudioOutlined />} onClick={useMockVoice}>
            语音
          </Button>
          <Link href="/album">
            <Button size="small" icon={<PictureOutlined />}>相册</Button>
          </Link>
          <Link href="/identify">
            <Button size="small" icon={<CameraOutlined />}>AI识物</Button>
          </Link>
          <Link href="/ai-create">
            <Button size="small">AI创作</Button>
          </Link>
        </div>
        <div className="device-assistant-compose-bar ask-compose-bar">
          <AudioOutlined />
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="说出或输入你的问题"
            variant="borderless"
            onPressEnter={() => sendQuestion()}
          />
          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={() => sendQuestion()} />
        </div>
      </div>

      <Modal
        open={agentPanelOpen}
        title="切换专家智能体"
        footer={null}
        onCancel={() => setAgentPanelOpen(false)}
        width={320}
        centered
      >
        <Segmented
          block
          value={agentScope}
          onChange={(value) => setAgentScope(value as '常用' | '全部')}
          options={['常用', '全部']}
          style={{ marginBottom: 12 }}
        />
        <div className="device-mini-list">
          {agentOptions.map((agent) => (
            <button key={agent.id} type="button" className="device-ask-agent-option" onClick={() => selectAgent(agent.id)}>
              <span>{agent.logo}</span>
              <strong>{agent.title}</strong>
              <em>{agent.oneLineIntro}</em>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
