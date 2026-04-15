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
import { demoGrowthRecords, demoGroupChats, demoMessages, demoMicrochatThreads } from '../../../lib/device-demo-data';
import { getDesktopPlazaAgents, usePlazaState } from '../../../lib/device-plaza-data';
import { getDeviceTaskList } from '../../../lib/device-task-data';

type Task = { id: string; title: string; status: string; summary?: string };
type MessageItem = { id: string; title: string; content: string; read?: boolean };
type HomeTabKey = 'tasks' | 'messages' | 'chat';
type AppEntry = {
  key: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  badge?: number;
};

const { Text } = Typography;
const desktopPageMeta = ['学习应用', '社交与服务', '工具与设置'];

const baseAppEntries: AppEntry[] = [
  { key: 'tasks', title: '任务', path: '/tasks', icon: <ProfileOutlined />, color: '#22b573' },
  { key: 'messages', title: '消息', path: '/messages', icon: <BellOutlined />, color: '#ff8a34' },
  { key: 'team', title: '团队', path: '/team', icon: <TeamOutlined />, color: '#2f6bff' },
  { key: 'capture', title: '拍拍', path: '/capture', icon: <CameraOutlined />, color: '#ff7b6b' },
  { key: 'ask', title: '问问', path: '/ask', icon: <SoundOutlined />, color: '#ffb400' },
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

export default function DeviceHomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [desktopPage, setDesktopPage] = useState(0);
  const [activeTab, setActiveTab] = useState<HomeTabKey>('tasks');
  const [messageApi, contextHolder] = message.useMessage();
  const session = getStoredSession();
  const plazaState = usePlazaState();
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
      setMessages(
        demoMessages.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          read: item.read,
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
          const unread = demoMessages.filter((message) => !message.read).length;
          return { ...item, badge: unread || undefined };
        }
        return item;
      }),
    [visibleTasks.length],
  );

  const desktopPages = useMemo(
    () => [
      appEntriesWithBadges.filter((item) =>
        ['tasks', 'team', 'capture', 'ask', 'flash-note', 'identify', 'growth', 'courses'].includes(item.key),
      ),
      [
        ...appEntriesWithBadges.filter((item) =>
          ['messages', 'chat', 'plaza', 'wallet', 'cloud', 'moments', 'meeting', 'friends', 'me'].includes(item.key),
        ),
        ...desktopAgentEntries,
      ],
      appEntriesWithBadges.filter((item) =>
        ['ai-draw', 'ai-video', 'settings', 'sos'].includes(item.key),
      ),
    ],
    [appEntriesWithBadges, desktopAgentEntries],
  );

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
      setDesktopPage((value) => Math.min(3, value + 1));
    }
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

            {desktopPages.map((entries, index) => (
              <div key={`desktop-page-${index + 2}`} className={`watch-desktop-page page-${index + 2}`}>
                <div className="watch-desktop-page-shell">
                  <div className="watch-home-page-chip">
                    <span>{desktopPageMeta[index]}</span>
                    <em>第 {index + 2} 屏</em>
                  </div>
                  <div className="watch-home-page-intro">
                    <strong>{index === 0 ? '学习与成长' : index === 1 ? '交流与服务' : '工具与设置'}</strong>
                    <span>{index === 0 ? '常用学习功能都在这里' : index === 1 ? '聊天、广场和支付等功能入口' : '系统工具和安全功能入口'}</span>
                  </div>
                  <div className={`watch-home-grid xtc tall page-${index + 2}`}>
                  {entries.map((item) => (
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
                  ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="watch-desktop-dots">
          {[0, 1, 2, 3].map((index) => (
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
          <span>{desktopPage === 0 ? '应用桌面' : desktopPage === 3 ? '首页' : '左右切换桌面'}</span>
        </div>
      </div>
    </div>
  );
}
