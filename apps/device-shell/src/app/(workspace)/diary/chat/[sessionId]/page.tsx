'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  appendDiaryAgentInstruction,
  completeDiaryAgentSession,
  getDeviceDiaryById,
  useDeviceDiaryStore,
} from '../../../../../lib/device-diary-data';

export default function DeviceDiaryChatPage() {
  const params = useParams<{ sessionId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const diaryStore = useDeviceDiaryStore();
  const [inputValue, setInputValue] = useState('');

  const session = useMemo(
    () => diaryStore.sessions.find((item) => item.id === params.sessionId) ?? null,
    [diaryStore.sessions, params.sessionId],
  );
  const linkedDiary = session?.diaryId ? getDeviceDiaryById(session.diaryId) : null;

  useEffect(() => {
    if (!session || session.status !== 'generating') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      completeDiaryAgentSession(session.id);
      messageApi.success('研学日记草稿已生成并保存到归档');
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [messageApi, session]);

  if (!session) {
    return (
      <Result
        status="404"
        title="未找到研学日记会话"
        extra={
          <Link href="/diary">
            <Button>返回研学日记</Button>
          </Link>
        }
      />
    );
  }

  const safeSession = session;

  function sendInstruction() {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      messageApi.warning('先输入你想修改的日记要求');
      return;
    }
    appendDiaryAgentInstruction(safeSession.id, trimmed);
    setInputValue('');
  }

  return (
    <div className="device-assistant-chat-page device-ai-generate-page device-ai-generate-shell device-diary-chat-shell">
      {contextHolder}

      <div className="device-assistant-chat-scroll">
        <div className="device-assistant-chat-thread">
          <div className="device-ai-chat-panel-link diary-mode">
            <Link href="/diary">返回创作台</Link>
            {linkedDiary ? <Link href={`/diary/${linkedDiary.id}`}>查看日记详情</Link> : null}
          </div>

          <div className="device-diary-chat-summary">
            <Tag color="blue">{safeSession.sourceRange.label}</Tag>
            <span>
              已选素材 {safeSession.selectedAssetIds.length} 份
              {safeSession.selectedFlashNoteIds.length ? ` · 闪记 ${safeSession.selectedFlashNoteIds.length} 条` : ''}
              {safeSession.selectedTaskWorkIds.length ? ` · 作品 ${safeSession.selectedTaskWorkIds.length} 份` : ''}
            </span>
          </div>

          {safeSession.messages.map((item) => {
            const diary = item.diaryId ? getDeviceDiaryById(item.diaryId) : null;
            return (
              <div key={item.id} className={`device-assistant-message${item.role === 'user' ? ' self without-avatar' : ''}`}>
                {item.role === 'assistant' ? <div className="device-assistant-avatar">记</div> : null}
                <div className={`device-assistant-message-main${item.role === 'user' ? ' self' : ''}`}>
                  <p>{item.content}</p>
                  {diary ? (
                    <Link href={`/diary/${diary.id}`} className="device-diary-result-card">
                      <div>
                        <strong>{diary.title}</strong>
                        <span>{diary.summary}</span>
                      </div>
                      <em>查看归档</em>
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}

          {safeSession.status === 'generating' ? (
            <div className="device-assistant-message">
              <div className="device-assistant-avatar">记</div>
              <div className="device-assistant-message-main">
                <p>正在继续整理和改写这篇研学日记，请稍等一下。</p>
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
              setInputValue('把我今天最大的发现写得更生动一点。');
              messageApi.success('已模拟语音输入修改要求');
            }}
          >
            <AudioOutlined />
          </button>
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="继续说出或输入你想修改的日记内容"
            variant="borderless"
            onPressEnter={sendInstruction}
          />
          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={sendInstruction} disabled={safeSession.status === 'generating'} />
        </div>
      </div>
    </div>
  );
}
