'use client';

import { Button, Empty, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchWithMode, getStoredSession } from '../../../lib/api';
import { demoAiRecords, demoKnowledge } from '../../../lib/device-demo-data';

type Knowledge = { id: string; title: string; category: string; content: string };
type AiRecord = { id: string; scene: string; title: string; summary: string; createdAt: string };

const { Paragraph, Text } = Typography;

export default function DeviceAiPage() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [records, setRecords] = useState<AiRecord[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const session = getStoredSession();
  const [stageIndex, setStageIndex] = useState(0);

  async function loadAiData() {
    try {
      const [knowledgeItems, aiRecords] = await Promise.all([
        fetchWithMode<Knowledge[]>('/knowledge', demoKnowledge),
        fetchWithMode<AiRecord[]>(`/messages/ai-records?studentId=${session?.user.studentId ?? ''}`, demoAiRecords),
      ]);
      setKnowledge(knowledgeItems);
      setRecords(aiRecords);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载 AI 页面失败');
    }
  }

  useEffect(() => {
    void loadAiData();
  }, [session?.user.studentId]);

  const aiStages = useMemo(() => ['识别场景', '匹配知识', '生成回答', '回写记录'], []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((value) => (value + 1) % aiStages.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [aiStages.length]);

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="blue">AI</Tag>
            <Tag color="green">{aiStages[stageIndex]}</Tag>
          </Space>
          <p className="device-page-title">AI 学习</p>
          <Space align="center">
            <div className="device-ai-wave" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <Text strong style={{ fontSize: 12 }}>{aiStages[stageIndex]}</Text>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">学习入口</p>
        <div className="watch-home-grid">
          <Link href="/ask?agentId=plaza_agent_03" className="watch-app-tile">
            <div>
              <div className="watch-app-icon" style={{ background: '#ff9f43' }}>专</div>
              <Text strong style={{ fontSize: 11 }}>问问</Text>
            </div>
          </Link>
          <Link href="/flash-note" className="watch-app-tile">
            <div>
              <div className="watch-app-icon" style={{ background: '#20bf6b' }}>记</div>
              <Text strong style={{ fontSize: 11 }}>闪记</Text>
            </div>
          </Link>
          <Link href="/identify" className="watch-app-tile">
            <div>
              <div className="watch-app-icon" style={{ background: '#eb3b5a' }}>识</div>
              <Text strong style={{ fontSize: 11 }}>识物</Text>
            </div>
          </Link>
          <Link href="/ai-draw" className="watch-app-tile">
            <div>
              <div className="watch-app-icon" style={{ background: '#2f6bff' }}>绘</div>
              <Text strong style={{ fontSize: 11 }}>绘画</Text>
            </div>
          </Link>
          <Link href="/ai-video" className="watch-app-tile">
            <div>
              <div className="watch-app-icon" style={{ background: '#7b61ff' }}>影</div>
              <Text strong style={{ fontSize: 11 }}>视频</Text>
            </div>
          </Link>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">知识卡</p>
        {knowledge.length > 0 ? (
          <div className="device-mini-list">
            {knowledge.map((item) => (
              <Link key={item.id} href={`/ai/knowledge/${item.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Tag>{item.category}</Tag>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {item.content}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="暂时没有知识卡" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">最近记录</p>
        {records.length > 0 ? (
          <div className="device-mini-list">
            {records.map((item) => (
              <Link key={item.id} href={`/ai/records/${item.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Tag color="purple">{item.scene}</Tag>
                  </div>
                  <p className="device-mini-item-desc">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty description="暂时没有 AI 记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      <div className="device-action-row">
        <Link href="/ask?agentId=plaza_agent_03">
          <Button type="primary" block>
            问问
          </Button>
        </Link>
        <Link href="/home">
          <Button block>主屏</Button>
        </Link>
      </div>
    </div>
  );
}
