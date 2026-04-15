'use client';

import { AppstoreOutlined, BellOutlined, BookOutlined, PushpinOutlined } from '@ant-design/icons';
import { Button, Empty, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getDesktopPlazaAgents, getPlazaCategories, getRecentPlazaAgents, useFilteredPlazaAgents, usePlazaState } from '../../../lib/device-plaza-data';

const { Paragraph, Text } = Typography;

export default function DevicePlazaPage() {
  const state = usePlazaState();
  const categories = getPlazaCategories(state);
  const recentAgents = getRecentPlazaAgents(state);
  const desktopAgents = getDesktopPlazaAgents(state);
  const subscribedAgents = useMemo(() => state.agents.filter((item) => item.subscribed).length, [state.agents]);
  const [activeCategory, setActiveCategory] = useState<'全部' | (typeof categories)[number]['category']>('全部');
  const visibleAgents = useFilteredPlazaAgents(activeCategory);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">广场</p>
          <p className="device-page-subtle">在这里找到常用 AI 智能体、继续最近使用，并把高频入口放到主屏桌面。</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{state.agents.length} 个智能体</span>
            <span className="watch-status-pill">{recentAgents.length} 个近期使用</span>
            <span className="watch-status-pill">{desktopAgents.length} 个已加桌面</span>
            <span className="watch-status-pill">{subscribedAgents} 个已订阅</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>我的智能体</span>
            <span>近 30 天使用</span>
          </div>
          <div className="device-mini-list">
            {recentAgents.length ? recentAgents.map((item) => (
              <Link key={item.id} href={`/plaza/agents/${item.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card active">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <div className="watch-home-tab-tags">
                      <Tag color="blue">{item.category}</Tag>
                      {item.desk ? <Tag color="gold">桌面</Tag> : null}
                    </div>
                  </div>
                  <p className="device-mini-item-desc">{item.desc}</p>
                </div>
              </Link>
            )) : (
              <div className="device-mini-item watch-list-card">
                <p className="device-mini-item-desc" style={{ margin: 0 }}>最近 30 天还没有使用记录，先挑一个智能体试试看。</p>
              </div>
            )}
          </div>
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>智能体分类</span>
            <span>{categories.length} 个方向</span>
          </div>
          <div className="device-chip-row">
            <button
              type="button"
              className={`device-filter-chip${activeCategory === '全部' ? ' active' : ''}`}
              onClick={() => setActiveCategory('全部')}
            >
              全部
            </button>
            {categories.map((item) => (
              <button
                key={item.category}
                type="button"
                className={`device-filter-chip${activeCategory === item.category ? ' active' : ''}`}
                onClick={() => setActiveCategory(item.category)}
              >
                {item.category}
              </button>
            ))}
          </div>
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>全部智能体</span>
            <span>{visibleAgents.length} 个入口</span>
          </div>
          <div className="device-plaza-grid">
            {visibleAgents.map((item) => (
              <Link key={item.id} href={`/plaza/agents/${item.id}`} className="device-plaza-tile device-plaza-agent-tile">
                <div className={`device-agent-logo accent-${item.accent}`}>{item.logo}</div>
                <div>
                  <Text strong style={{ fontSize: 12 }}>{item.title}</Text>
                  <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>
                    {item.category} · {item.tag}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
          {!visibleAgents.length ? <Empty description="这个分类下暂时没有智能体" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>广场能力</span>
            <span>资讯 / 课程 / 挑战</span>
          </div>
          <div className="device-plaza-grid">
            <Link href="/plaza/agents/plaza_agent_03/news" className="device-plaza-tile">
              <BellOutlined style={{ fontSize: 18, color: '#2f6bff' }} />
              <Text strong style={{ fontSize: 12 }}>资讯订阅</Text>
            </Link>
            <Link href="/plaza/agents/plaza_agent_03/courses" className="device-plaza-tile">
              <BookOutlined style={{ fontSize: 18, color: '#18b7a0' }} />
              <Text strong style={{ fontSize: 12 }}>专家课程</Text>
            </Link>
            <Link href="/plaza/agents/plaza_agent_03/challenges" className="device-plaza-tile">
              <AppstoreOutlined style={{ fontSize: 18, color: '#ff8a34' }} />
              <Text strong style={{ fontSize: 12 }}>难题挑战</Text>
            </Link>
            <Link href="/home" className="device-plaza-tile">
              <PushpinOutlined style={{ fontSize: 18, color: '#7a5cff' }} />
              <Text strong style={{ fontSize: 12 }}>主屏桌面</Text>
            </Link>
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/messages">
              <Button type="primary" block>订阅消息</Button>
            </Link>
            <Link href="/home">
              <Button block>主屏</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
