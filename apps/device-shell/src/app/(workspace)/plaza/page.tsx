'use client';

import { Button, Empty, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getDesktopPlazaAgents, getPlazaCategories, getRecentPlazaAgents, useFilteredPlazaAgents, usePlazaState } from '../../../lib/device-plaza-data';

const { Paragraph, Text } = Typography;
type PlazaAbilityFilter = '全部' | '伴学' | '课程' | '难题挑战';

export default function DevicePlazaPage() {
  const state = usePlazaState();
  const categories = getPlazaCategories(state);
  const recentAgents = getRecentPlazaAgents(state);
  const desktopAgents = getDesktopPlazaAgents(state);
  const subscribedAgents = useMemo(() => state.agents.filter((item) => item.subscribed).length, [state.agents]);
  const [activeCategory, setActiveCategory] = useState<'全部' | (typeof categories)[number]['category']>('全部');
  const [activeAbility, setActiveAbility] = useState<PlazaAbilityFilter>('全部');
  const categoryAgents = useFilteredPlazaAgents(activeCategory);
  const abilityCounts = useMemo(
    () => ({
      伴学: 1,
      课程: state.agents.filter((item) => item.courses.length > 0).length,
      难题挑战: state.agents.filter((item) => item.challenges.length > 0).length,
    }),
    [state.agents],
  );
  const visibleAgents = categoryAgents;
  const plazaCourses = useMemo(
    () =>
      state.agents.flatMap((agent) =>
        agent.courses.map((course) => ({
          agentId: agent.id,
          agentTitle: agent.title,
          category: agent.category,
          expertName: agent.expertName,
          course,
        })),
      ),
    [state.agents],
  );
  const plazaChallenges = useMemo(
    () =>
      state.agents.flatMap((agent) =>
        agent.challenges.map((challenge) => ({
          agentId: agent.id,
          agentTitle: agent.title,
          category: agent.category,
          challenge,
        })),
      ),
    [state.agents],
  );

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">专家智能体广场</p>
          <p className="device-page-subtle">先按方向浏览智能体，或直接切到伴学、课程、难题挑战查看对应内容列表。</p>
          <div className="watch-status-pills" style={{ marginTop: 8 }}>
            <span className="watch-status-pill">{state.agents.length} 个智能体</span>
            <span className="watch-status-pill">{recentAgents.length} 个近期使用</span>
            <span className="watch-status-pill">{desktopAgents.length} 个已加桌面</span>
            <span className="watch-status-pill">{subscribedAgents} 个已订阅</span>
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="watch-inline-head">
            <span>最近使用的专家</span>
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
                  <p className="device-mini-item-meta">{item.expertName} · {item.oneLineIntro}</p>
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
            <span>{categories.length} 个方向 / 3 个能力</span>
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
            {(['伴学', '课程', '难题挑战'] as Exclude<PlazaAbilityFilter, '全部'>[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`device-filter-chip${activeAbility === item ? ' active' : ''}`}
                onClick={() => setActiveAbility((current) => (current === item ? '全部' : item))}
              >
                {item}
                {item === '伴学' ? ` ${abilityCounts.伴学}` : item === '课程' ? ` ${abilityCounts.课程}` : item === '难题挑战' ? ` ${abilityCounts.难题挑战}` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>
              {activeAbility === '全部'
                ? '全部专家智能体'
                : activeAbility === '伴学'
                  ? '伴学入口'
                  : activeAbility === '课程'
                    ? '课程列表'
                    : '难题挑战列表'}
            </span>
            <span>
              {activeAbility === '全部'
                ? `${visibleAgents.length} 个入口`
                : activeAbility === '伴学'
                  ? '1 个入口'
                  : activeAbility === '课程'
                    ? `${plazaCourses.length} 门课程`
                    : `${plazaChallenges.length} 个挑战`}
            </span>
          </div>
          {activeAbility === '全部' ? (
            <>
              <div className="device-plaza-grid">
                {visibleAgents.map((item) => (
                  <Link key={item.id} href={`/plaza/agents/${item.id}`} className="device-plaza-tile device-plaza-agent-tile">
                    <div className={`device-agent-logo accent-${item.accent}`}>{item.logo}</div>
                    <div>
                      <Text strong style={{ fontSize: 12 }}>{item.title}</Text>
                      <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>
                        {item.category} · {item.expertName}
                      </Paragraph>
                      <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>{item.oneLineIntro}</Paragraph>
                    </div>
                  </Link>
                ))}
              </div>
              {!visibleAgents.length ? <Empty description="这个分类下暂时没有智能体" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
            </>
          ) : null}

          {activeAbility === '伴学' ? (
            <div className="device-plaza-grid">
              <Link href="/ask?agentId=plaza_agent_03" className="device-plaza-tile device-plaza-agent-tile">
                <div className="device-agent-logo accent-blue">伴</div>
                <div>
                  <Text strong style={{ fontSize: 12 }}>专家伴学</Text>
                  <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>
                    文字 / 语音 / 图片
                  </Paragraph>
                  <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>
                    从拍拍、识物、课程、闪记直接进入对应专家会话。
                  </Paragraph>
                </div>
              </Link>
            </div>
          ) : null}

          {activeAbility === '课程' ? (
            <div className="device-mini-list">
              {plazaCourses.map((item) => (
                <Link key={`${item.agentId}_${item.course.id}`} href={`/plaza/agents/${item.agentId}/courses/${item.course.id}`} className="device-card-link">
                  <div className="device-mini-item watch-list-card">
                    <div className="device-mini-item-title">
                      <span>{item.course.title}</span>
                      <div className="watch-home-tab-tags">
                        <Tag color="blue">{item.agentTitle}</Tag>
                        {item.course.isPreviewFree ? <Tag color="green">免费试听</Tag> : <Tag color="gold">需解锁</Tag>}
                      </div>
                    </div>
                    <p className="device-mini-item-desc">{item.course.summary}</p>
                    <p className="device-mini-item-meta">{item.category} · {item.expertName} · 当前进度 {item.course.progress}%</p>
                  </div>
                </Link>
              ))}
              {!plazaCourses.length ? <Empty description="暂时没有课程" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
            </div>
          ) : null}

          {activeAbility === '难题挑战' ? (
            <div className="device-mini-list">
              {plazaChallenges.map((item) => (
                <Link key={`${item.agentId}_${item.challenge.id}`} href={item.challenge.targetPath} className="device-card-link">
                  <div className="device-mini-item watch-list-card">
                    <div className="device-mini-item-title">
                      <span>{item.challenge.title}</span>
                      <div className="watch-home-tab-tags">
                        <Tag color="purple">{item.agentTitle}</Tag>
                        <Tag color={item.challenge.mode === '团队挑战' ? 'orange' : 'blue'}>{item.challenge.mode}</Tag>
                        <Tag color={item.challenge.status === '进行中' ? 'green' : item.challenge.status === '已完成' ? 'default' : 'gold'}>
                          {item.challenge.status}
                        </Tag>
                      </div>
                    </div>
                    <p className="device-mini-item-desc">{item.challenge.summary}</p>
                    <p className="device-mini-item-meta">{item.category} · 点击进入对应任务或专题</p>
                  </div>
                </Link>
              ))}
              {!plazaChallenges.length ? <Empty description="暂时没有难题挑战" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
            </div>
          ) : null}
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/messages">
              <Button type="primary" block>消息</Button>
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
