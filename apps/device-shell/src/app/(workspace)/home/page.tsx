'use client';

import {
  AlertOutlined,
  AppstoreOutlined,
  BellOutlined,
  BookOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  ProfileOutlined,
  QrcodeOutlined,
  ReadOutlined,
  SoundOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getStoredSession } from '../../../lib/api';
import { demoGrowthRecords, demoGroupChats, demoMicrochatThreads } from '../../../lib/device-demo-data';
import { useDeviceMessages } from '../../../lib/device-message-data';
import { getDesktopPlazaAgents, usePlazaState } from '../../../lib/device-plaza-data';
import { getDeviceTaskList } from '../../../lib/device-task-data';
import { getCurrentJoinedTeam, getVisibleTeamsForList, useDeviceTeamSnapshot } from '../../../lib/device-team-data';

type Task = { id: string; title: string; status: string; summary?: string };
type MessageItem = { id: string; title: string; content: string; read?: boolean; type?: string };
type HomeTabKey = 'tasks' | 'messages' | 'chat';
type NoticeTabKey = 'tasks' | 'messages' | 'chat' | 'family_team';
type AppEntry = {
  key: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  badge?: number;
};
type HomeNoticeItem = {
  id: string;
  title: string;
  summary: string;
  path: string;
  tag?: string;
  badge?: string | number;
  tone?: 'default' | 'active' | 'unread';
};

const { Text } = Typography;
const mainScreenAppKeys = [
  'tasks',
  'messages',
  'chat',
  'team',
  'capture',
  'ask',
  'identify',
  'flash-note',
  'growth',
  'courses',
  'plaza',
  'friends',
  'wallet',
  'moments',
  'ai-draw',
  'ai-video',
] as const;
const toolScreenAppKeys = ['cloud', 'meeting', 'me', 'settings', 'sos'] as const;
const noticeTabLabels: Record<NoticeTabKey, string> = {
  tasks: '任务',
  messages: '消息',
  chat: '聊天',
  family_team: '家庭团队',
};
const noticePanelTitles: Record<NoticeTabKey, string> = {
  tasks: '待处理任务',
  messages: '最新消息',
  chat: '聊天提醒',
  family_team: '家庭团队动态',
};
const noticeEmptyTextMap: Record<NoticeTabKey, string> = {
  tasks: '暂时没有任务通知',
  messages: '暂时没有消息通知',
  chat: '暂时没有聊天通知',
  family_team: '暂时没有家庭团队通知',
};

const baseAppEntries: AppEntry[] = [
  { key: 'tasks', title: '任务', path: '/tasks', icon: <ProfileOutlined />, color: '#22b573' },
  { key: 'messages', title: '消息', path: '/messages', icon: <BellOutlined />, color: '#ff8a34' },
  { key: 'team', title: '更多团队', path: '/team', icon: <TeamOutlined />, color: '#2f6bff' },
  { key: 'capture', title: '拍拍', path: '/capture', icon: <CameraOutlined />, color: '#ff7b6b' },
  { key: 'ask', title: '专家伴学', path: '/ask', icon: <SoundOutlined />, color: '#ffb400' },
  { key: 'flash-note', title: '闪记', path: '/flash-note', icon: <ClockCircleOutlined />, color: '#18b7a0' },
  { key: 'identify', title: '识物', path: '/identify', icon: <CameraOutlined />, color: '#ff4f83' },
  { key: 'growth', title: '成长', path: '/growth', icon: <ReadOutlined />, color: '#8a57ff' },
  { key: 'courses', title: '课程', path: '/courses', icon: <BookOutlined />, color: '#ff8f32' },
  { key: 'chat', title: '聊天', path: '/chat', icon: <CommentOutlined />, color: '#4d6cff' },
  { key: 'plaza', title: '广场', path: '/plaza', icon: <AppstoreOutlined />, color: '#6f63ff' },
  { key: 'wallet', title: '支付', path: '/wallet', icon: <QrcodeOutlined />, color: '#1bb785' },
  { key: 'cloud', title: '网盘', path: '/cloud', icon: <ReadOutlined />, color: '#4aa3ff' },
  { key: 'moments', title: '朋友圈', path: '/moments', icon: <ReadOutlined />, color: '#ff6f61' },
  { key: 'meeting', title: '会议', path: '/meeting', icon: <TeamOutlined />, color: '#7a5cff' },
  { key: 'friends', title: '好友', path: '/friends', icon: <TeamOutlined />, color: '#00a8a8' },
  { key: 'me', title: '我的', path: '/me', icon: <ReadOutlined />, color: '#4c7dff' },
  { key: 'ai-draw', title: 'AI 绘画', path: '/ai-draw', icon: <AppstoreOutlined />, color: '#ff7f50' },
  { key: 'ai-video', title: 'AI 视频', path: '/ai-video', icon: <VideoCameraOutlined />, color: '#ff4f8b' },
  { key: 'settings', title: '设置', path: '/settings', icon: <AppstoreOutlined />, color: '#8c8c8c' },
  { key: 'sos', title: 'SoS', path: '/sos', icon: <AlertOutlined />, color: '#ff5a5f' },
];

function getMessageTypeTag(type?: string) {
  if (type === 'broadcast') {
    return '广播';
  }
  if (type === 'group') {
    return '群聊';
  }
  if (type === 'family') {
    return '家庭';
  }
  if (type === 'system') {
    return '系统';
  }
  if (type === 'subscription') {
    return '订阅';
  }
  return '消息';
}

export default function DeviceHomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [desktopPage, setDesktopPage] = useState(1);
  const [activeTab, setActiveTab] = useState<HomeTabKey>('tasks');
  const [noticeTab, setNoticeTab] = useState<NoticeTabKey>('tasks');
  const [messageApi, contextHolder] = message.useMessage();
  const session = getStoredSession();
  const plazaState = usePlazaState();
  const deviceMessages = useDeviceMessages();
  const teamSnapshot = useDeviceTeamSnapshot();
  const touchStartX = useRef<number | null>(null);

  async function loadHome() {
    try {
      setTasks(
        getDeviceTaskList().map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          summary: task.taskDescription,
        })),
      );
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载首页失败');
    }
  }

  useEffect(() => {
    void loadHome();
  }, []);

  const latestGrowth = demoGrowthRecords[0];
  const studentName =
    !session?.user.displayName || session.user.displayName.includes('演示') || session.user.displayName === '学员'
      ? '小明同学'
      : session.user.displayName === '小明' || session.user.displayName === '张三'
        ? '小明同学'
        : session.user.displayName;
  const visibleTasks = useMemo(
    () => tasks.filter((task) => ['todo', 'in_progress'].includes(task.status)),
    [tasks],
  );
  const messages = useMemo<MessageItem[]>(
    () =>
      deviceMessages.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        read: item.read,
        type: item.type,
      })),
    [deviceMessages],
  );
  const featuredMessage = useMemo(() => messages.find((item) => !item.read) ?? messages[0] ?? null, [messages]);

  const homeChatItems = useMemo(
    () => [
      ...demoMicrochatThreads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        summary: thread.lastMessage,
        unread: thread.unread ?? 0,
        tag: '微聊',
        path: `/microchat/${thread.id}`,
      })),
      ...demoGroupChats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        summary: chat.messages[chat.messages.length - 1]?.content ?? '暂无消息',
        unread: chat.unread ?? 0,
        tag: '群聊',
        path: `/group-chat/${chat.id}`,
      })),
    ],
    [],
  );

  const desktopAgentEntries = useMemo<AppEntry[]>(
    () =>
      getDesktopPlazaAgents(plazaState).map((item) => ({
        key: `plaza-agent-${item.id}`,
        title: item.shortTitle,
        path: `/plaza/agents/${item.id}`,
        icon: <span className="watch-agent-desktop-icon">{item.logo}</span>,
        color:
          item.accent === 'green'
            ? '#20bf6b'
            : item.accent === 'orange'
              ? '#ff8a34'
              : item.accent === 'purple'
                ? '#8a57ff'
                : item.accent === 'teal'
                  ? '#18b7a0'
                  : item.accent === 'pink'
                    ? '#ff5f8f'
                    : '#2f6bff',
      })),
    [plazaState],
  );

  const appEntriesWithBadges = useMemo(
    () =>
      baseAppEntries.map((item) => {
        if (item.key === 'tasks') {
          return { ...item, badge: visibleTasks.length || undefined };
        }
        if (item.key === 'chat') {
          const unread =
            demoMicrochatThreads.reduce((sum, thread) => sum + (thread.unread ?? 0), 0) +
            demoGroupChats.reduce((sum, chat) => sum + (chat.unread ?? 0), 0);
          return { ...item, badge: unread || undefined };
        }
        if (item.key === 'messages') {
          const unread = deviceMessages.filter((entry) => !entry.read).length;
          return { ...item, badge: unread || undefined };
        }
        return item;
      }),
    [deviceMessages, visibleTasks.length],
  );

  const appEntryMap = useMemo(() => new Map(appEntriesWithBadges.map((item) => [item.key, item])), [appEntriesWithBadges]);

  const mainScreenEntries = useMemo(
    () => [
      ...mainScreenAppKeys.map((key) => appEntryMap.get(key)).filter((item): item is AppEntry => Boolean(item)),
      ...desktopAgentEntries,
    ],
    [appEntryMap, desktopAgentEntries],
  );

  const toolScreenEntries = useMemo(
    () => toolScreenAppKeys.map((key) => appEntryMap.get(key)).filter((item): item is AppEntry => Boolean(item)),
    [appEntryMap],
  );

  const taskNoticeItems = useMemo<HomeNoticeItem[]>(
    () =>
      visibleTasks
        .slice()
        .sort((left, right) => (left.status === 'in_progress' && right.status !== 'in_progress' ? -1 : 1))
        .slice(0, 3)
        .map((task) => ({
          id: task.id,
          title: task.title,
          summary: task.summary ?? (task.status === 'in_progress' ? '研学任务进行中' : '等待开始'),
          path: `/tasks/${task.id}`,
          tag: task.status === 'in_progress' ? '进行中' : '待开始',
          tone: task.status === 'in_progress' ? 'active' : 'default',
        })),
    [visibleTasks],
  );

  const messageNoticeItems = useMemo<HomeNoticeItem[]>(
    () =>
      messages
        .slice()
        .sort((left, right) => Number(left.read) - Number(right.read))
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.content,
          path: `/messages/${item.id}`,
          tag: getMessageTypeTag(item.type),
          badge: item.read ? undefined : '未读',
          tone: item.read ? 'default' : 'unread',
        })),
    [messages],
  );

  const chatNoticeItems = useMemo<HomeNoticeItem[]>(
    () =>
      homeChatItems
        .slice()
        .sort((left, right) => (right.unread ?? 0) - (left.unread ?? 0))
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          path: item.path,
          tag: item.tag,
          badge: item.unread || undefined,
          tone: item.unread ? 'unread' : 'default',
        })),
    [homeChatItems],
  );

  const familyTeamNoticeItems = useMemo<HomeNoticeItem[]>(() => {
    const currentTeam = getCurrentJoinedTeam();
    const teams = getVisibleTeamsForList();
    const prioritizedTeams = [
      ...(currentTeam ? [currentTeam] : []),
      ...teams.filter((item) => item.id !== currentTeam?.id && ['已加入', '待审批', '历史可查看'].includes(item.membershipStatus)),
    ].slice(0, 3);

    return prioritizedTeams.map((team) => ({
      id: team.id,
      title: team.name,
      summary:
        team.membershipStatus === '待审批'
          ? `${team.studyDate} · ${team.destination} · 等待导师审批`
          : team.membershipStatus === '历史可查看'
            ? `${team.studyDate} · ${team.destination} · 可查看历史团队信息`
            : `${team.studyDate} · ${team.destination} · 查看团队安排与分组信息`,
      path: `/team/${team.id}`,
      tag: team.lifecycleStatus,
      badge: team.membershipStatus === '待审批' ? '待审批' : undefined,
      tone: team.membershipStatus === '待审批' ? 'unread' : team.lifecycleStatus === '进行中' ? 'active' : 'default',
    }));
  }, [teamSnapshot]);

  const notificationMap = useMemo<Record<NoticeTabKey, HomeNoticeItem[]>>(
    () => ({
      tasks: taskNoticeItems,
      messages: messageNoticeItems,
      chat: chatNoticeItems,
      family_team: familyTeamNoticeItems,
    }),
    [chatNoticeItems, familyTeamNoticeItems, messageNoticeItems, taskNoticeItems],
  );

  const noticeCountMap = useMemo<Record<NoticeTabKey, number>>(
    () => ({
      tasks: taskNoticeItems.length,
      messages: messageNoticeItems.length,
      chat: chatNoticeItems.length,
      family_team: familyTeamNoticeItems.length,
    }),
    [chatNoticeItems.length, familyTeamNoticeItems.length, messageNoticeItems.length, taskNoticeItems.length],
  );

  const activeNoticeItems = notificationMap[noticeTab];
  const activeNoticeTitle = noticePanelTitles[noticeTab];

  const tabCountMap = useMemo(
    () => ({
      tasks: visibleTasks.length,
      messages: messages.length,
      chat: homeChatItems.length,
    }),
    [homeChatItems.length, messages.length, visibleTasks.length],
  );

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;

    if (start == null || end == null) {
      return;
    }

    const delta = end - start;
    if (Math.abs(delta) < 36) {
      return;
    }

    if (delta > 0) {
      setDesktopPage((value) => Math.max(0, value - 1));
    } else {
      setDesktopPage((value) => Math.min(2, value + 1));
    }
  }

  function renderAppEntry(item: AppEntry) {
    return (
      <Link href={item.path} key={item.key} className="watch-app-tile xtc">
        <div>
          <div className="watch-app-icon-wrap">
            <div className="watch-app-icon xtc" style={{ background: item.color }}>
              {item.icon}
            </div>
            {item.badge ? <span className="watch-app-badge">{item.badge}</span> : null}
          </div>
          <Text strong style={{ fontSize: 11 }}>
            {item.title}
          </Text>
        </div>
      </Link>
    );
  }

  return (
    <div className="device-page-stack home-mode">
      {contextHolder}

      <div className="watch-desktop-shell">
        <div className="watch-desktop-viewport home-viewport" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="watch-desktop-track" style={{ transform: `translateX(-${desktopPage * 100}%)` }}>
            <div className="watch-desktop-page page-1">
              <div className="watch-home-focus-page">
                <div className="watch-home-account-card">
                  <div className="watch-home-account-main">
                    <div className="watch-home-avatar">
                      <span className="watch-home-avatar-head" />
                      <span className="watch-home-avatar-body" />
                    </div>
                    <div>
                      <p className="watch-home-student-name">{studentName}</p>
                    </div>
                  </div>
                  <div className="watch-home-growth-box">
                    <span>成长值</span>
                    <strong>{latestGrowth?.value ?? 0}</strong>
                  </div>
                </div>

                {featuredMessage ? (
                  <Link href={`/messages/${featuredMessage.id}`} className="device-card-link">
                    <div className={`device-mini-item watch-list-card compact watch-home-entry${!featuredMessage.read ? ' unread' : ''}`}>
                      <div className="device-mini-item-title">
                        <span>{featuredMessage.title}</span>
                        {!featuredMessage.read ? <Tag color="red">未读</Tag> : <Tag color="default">已读</Tag>}
                      </div>
                      <p className="device-mini-item-desc">{featuredMessage.content}</p>
                    </div>
                  </Link>
                ) : null}

                <div className="watch-home-tab-row">
                  {[
                    { key: 'tasks', label: '任务' },
                    { key: 'messages', label: '消息' },
                    { key: 'chat', label: '聊天' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`watch-home-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                      onClick={() => setActiveTab(tab.key as HomeTabKey)}
                    >
                      <span>{tab.label}</span>
                      <em>{tabCountMap[tab.key as HomeTabKey]}</em>
                    </button>
                  ))}
                </div>

                <div className="watch-home-tab-panel">
                  <div className="watch-home-panel-head">
                    <strong>{activeTab === 'tasks' ? '任务' : activeTab === 'messages' ? '消息' : '聊天'}</strong>
                    <span className="watch-home-panel-count">
                      {activeTab === 'tasks'
                        ? `${visibleTasks.length} 条`
                        : activeTab === 'messages'
                          ? `${messages.length} 条`
                          : `${homeChatItems.length} 条`}
                    </span>
                  </div>
                  <div className="device-mini-list watch-home-tab-list">
                    {activeTab === 'tasks' && visibleTasks.length > 0
                      ? visibleTasks.map((task) => (
                        <Link key={task.id} href={`/tasks/${task.id}`} className="device-card-link">
                          <div className={`device-mini-item watch-list-card compact watch-home-entry${task.status === 'in_progress' ? ' active' : ''}`}>
                            <div className="device-mini-item-title">
                              <span>{task.title}</span>
                              <Tag color={task.status === 'in_progress' ? 'blue' : 'default'}>
                                {task.status === 'in_progress' ? '进行中' : '待开始'}
                              </Tag>
                            </div>
                            <p className="device-mini-item-desc">{task.summary ?? (task.status === 'in_progress' ? '研学任务进行中' : '等待开始')}</p>
                          </div>
                        </Link>
                      ))
                      : null}
                    {activeTab === 'messages' && messages.length > 0
                      ? messages.map((item) => (
                        <Link key={item.id} href={`/messages/${item.id}`} className="device-card-link">
                          <div className={`device-mini-item watch-list-card compact watch-home-entry${!item.read ? ' unread' : ''}`}>
                            <div className="device-mini-item-title">
                              <span>{item.title}</span>
                              {!item.read ? <Tag color="red">未读</Tag> : null}
                            </div>
                            <p className="device-mini-item-desc">{item.content}</p>
                          </div>
                        </Link>
                      ))
                      : null}
                    {activeTab === 'chat' && homeChatItems.length > 0
                      ? homeChatItems.map((item) => (
                        <Link key={item.id} href={item.path} className="device-card-link">
                          <div className={`device-mini-item watch-list-card compact watch-home-entry${item.unread ? ' unread' : ''}`}>
                            <div className="device-mini-item-title">
                              <span>{item.title}</span>
                              <div className="watch-home-tab-tags">
                                <Tag color="blue">{item.tag}</Tag>
                                {item.unread ? <Tag color="red">{item.unread}</Tag> : null}
                              </div>
                            </div>
                            <p className="device-mini-item-desc">{item.summary}</p>
                          </div>
                        </Link>
                      ))
                      : null}
                    {((activeTab === 'tasks' && visibleTasks.length === 0) ||
                      (activeTab === 'messages' && messages.length === 0) ||
                      (activeTab === 'chat' && homeChatItems.length === 0)) ? (
                        <div className="device-mini-item watch-list-card compact">
                          <p className="device-mini-item-desc" style={{ margin: 0 }}>
                            {activeTab === 'tasks' ? '暂时没有待办任务' : activeTab === 'messages' ? '暂时没有消息' : '暂时没有聊天'}
                          </p>
                        </div>
                      ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="watch-desktop-page page-2">
              <div className="watch-desktop-page-shell">
                <div className="watch-home-page-intro">
                  <strong>学习与服务</strong>
                  <span>任务、消息、AI 和生活服务都在这里</span>
                </div>
                <div className="watch-home-main-scroll">
                  <div className="watch-home-notice-strip">
                    <div className="watch-home-notice-head">
                      <div>
                        <strong>通知中心</strong>
                        <p>按任务、消息、聊天和家庭团队整理重点动态</p>
                      </div>
                      <span>{noticeCountMap[noticeTab]} 条待看</span>
                    </div>
                    <div className="watch-home-tab-row quad">
                      {(Object.keys(noticeTabLabels) as NoticeTabKey[]).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`watch-home-tab-btn${noticeTab === tab ? ' active' : ''}`}
                          onClick={() => setNoticeTab(tab)}
                        >
                          <span>{noticeTabLabels[tab]}</span>
                          <em>{noticeCountMap[tab]}</em>
                        </button>
                      ))}
                    </div>
                    <div className="watch-home-tab-panel compact">
                      <div className="watch-home-panel-head">
                        <strong>{activeNoticeTitle}</strong>
                        <span className="watch-home-panel-count">{noticeCountMap[noticeTab]} 条</span>
                      </div>
                      <div className="device-mini-list watch-home-tab-list compact">
                        {activeNoticeItems.length > 0
                          ? activeNoticeItems.map((item) => (
                              <Link key={`${noticeTab}-${item.id}`} href={item.path} className="device-card-link">
                                <div className={`device-mini-item watch-list-card compact watch-home-entry${item.tone === 'unread' ? ' unread' : item.tone === 'active' ? ' active' : ''}`}>
                                  <div className="device-mini-item-title">
                                    <span>{item.title}</span>
                                    <div className="watch-home-tab-tags">
                                      {item.tag ? <Tag color="blue">{item.tag}</Tag> : null}
                                      {item.badge ? <Tag color="red">{item.badge}</Tag> : null}
                                    </div>
                                  </div>
                                  <p className="device-mini-item-desc">{item.summary}</p>
                                </div>
                              </Link>
                            ))
                          : (
                            <div className="device-mini-item watch-list-card compact">
                              <p className="device-mini-item-desc" style={{ margin: 0 }}>
                                {noticeEmptyTextMap[noticeTab]}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="watch-home-apps-head">
                    <strong>主屏应用</strong>
                    <span>学习、沟通、AI 与服务入口</span>
                  </div>
                  <div className="watch-home-grid xtc main-screen-grid">
                    {mainScreenEntries.map(renderAppEntry)}
                  </div>
                </div>
              </div>
            </div>

            <div className="watch-desktop-page page-3">
              <div className="watch-desktop-page-shell">
                <div className="watch-home-page-intro">
                  <strong>工具与设置</strong>
                  <span>文件、会议、我的和设备设置</span>
                </div>
                <div className="watch-home-grid xtc tool-screen-grid">
                  {toolScreenEntries.map(renderAppEntry)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="watch-desktop-dots">
          {[0, 1, 2].map((index) => (
            <button
              key={`desktop-dot-${index}`}
              type="button"
              className={`watch-dot${desktopPage === index ? ' active' : ''}`}
              onClick={() => setDesktopPage(index)}
              aria-label={`切换到第 ${index + 1} 屏`}
            />
          ))}
        </div>
        <div className="watch-home-swipe-hint">
          <span>{desktopPage === 0 ? '当前是负一屏' : desktopPage === 2 ? '当前是第三屏' : '左右切换 3 屏桌面'}</span>
        </div>
      </div>
    </div>
  );
}
