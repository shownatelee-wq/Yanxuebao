'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Result, message } from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  appendAiCreatePrompt,
  completeAiCreateSession,
  useDeviceAiCreateSnapshot,
  type DeviceAiCreateMode,
} from '../lib/device-ai-create-state';
import { getMediaAssetById, useDeviceMediaLibrary } from '../lib/device-media-library';

export function DeviceAiGenerateChatScreen({
  sessionId,
  mode,
}: {
  sessionId: string;
  mode: DeviceAiCreateMode;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const aiCreateSnapshot = useDeviceAiCreateSnapshot();
  useDeviceMediaLibrary();
  const [inputValue, setInputValue] = useState('');

  const session = useMemo(
    () => aiCreateSnapshot.sessions.find((item) => item.id === sessionId && item.mode === mode) ?? null,
    [aiCreateSnapshot.sessions, mode, sessionId],
  );

  useEffect(() => {
    if (!session || session.status !== 'generating') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      completeAiCreateSession(session.id);
      messageApi.success(session.mode === 'image' ? 'AI图片已生成并保存到相册' : 'AI视频已生成并保存到相册');
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [messageApi, session]);

  if (!session) {
    return (
      <Result
        status="404"
        title={mode === 'image' ? '未找到 AI生图会话' : '未找到 AI视频会话'}
        extra={<Link href={`/ai-create?mode=${mode}`}><Button>返回AI创作</Button></Link>}
      />
    );
  }

  const activeSession = session;

  function sendFollowUp() {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      messageApi.warning(mode === 'image' ? '先输入新的图片修改要求' : '先输入新的视频修改要求');
      return;
    }
    appendAiCreatePrompt(activeSession.id, trimmed);
    setInputValue('');
  }

  return (
    <div className="device-assistant-chat-page device-ai-generate-page device-ai-generate-shell">
      {contextHolder}
      <div className="device-assistant-chat-scroll">
        <div className="device-assistant-chat-thread">
          <div className="device-ai-chat-panel-link">
            <Link href="/album">打开相册查看全部结果</Link>
          </div>

          {activeSession.messages.map((item) => {
            const attachedAsset = item.assetId ? getMediaAssetById(item.assetId) : null;
            const resultAsset = item.resultAssetId ? getMediaAssetById(item.resultAssetId) : null;

            return (
              <div key={item.id} className={`device-assistant-message${item.role === 'user' ? ' self without-avatar' : ''}`}>
                {item.role === 'assistant' ? <div className="device-assistant-avatar">创</div> : null}
                <div className={`device-assistant-message-main${item.role === 'user' ? ' self' : ''}`}>
                  {attachedAsset ? (
                    <div className="device-ai-chat-asset-card">
                      <div className={`device-ai-import-preview accent-${attachedAsset.accent ?? 'blue'}`}>
                        <span>{attachedAsset.previewLabel ?? attachedAsset.title}</span>
                      </div>
                      <div>
                        <strong>{attachedAsset.title}</strong>
                        <span>{attachedAsset.summary}</span>
                      </div>
                    </div>
                  ) : null}
                  <p>{item.content}</p>
                  {resultAsset ? (
                    <Link href={`/album/${resultAsset.id}`} className="device-ai-chat-result-card">
                      <div className={`device-ai-import-preview accent-${resultAsset.accent ?? 'orange'}`}>
                        <span>{resultAsset.previewLabel ?? resultAsset.title}</span>
                      </div>
                      <div>
                        <strong>{resultAsset.title}</strong>
                        <span>{resultAsset.summary}</span>
                      </div>
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}

          {activeSession.status === 'generating' ? (
            <div className="device-assistant-message">
              <div className="device-assistant-avatar">创</div>
              <div className="device-assistant-message-main">
                <p>{mode === 'image' ? '图片生成中...' : '视频生成中...'}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="device-assistant-chat-footer device-ai-generate-footer">
        <div className="device-assistant-compose-bar ask-compose-bar">
          <button
            type="button"
            className="device-ai-compose-trigger"
            aria-label="模拟语音输入"
            onClick={() => {
              setInputValue(mode === 'image' ? '把画面改成夕阳金色风格' : '让视频镜头慢一点并增加波光效果');
              messageApi.success('已模拟语音输入修改要求');
            }}
          >
            <AudioOutlined />
          </button>
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={mode === 'image' ? '继续说出或输入图片修改要求' : '继续说出或输入视频修改要求'}
            variant="borderless"
            onPressEnter={sendFollowUp}
          />
          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={sendFollowUp} disabled={activeSession.status === 'generating'} />
        </div>
      </div>
    </div>
  );
}
