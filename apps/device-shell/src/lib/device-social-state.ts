'use client';

import { useEffect, useState } from 'react';

const DEVICE_SOCIAL_STATE_KEY = 'yanxuebao_device_social_state_v3';
const DEVICE_SOCIAL_STATE_EVENT = 'yanxuebao:device-social-state-change';

export type DeviceFriendRelation = '好友' | '同学' | '家人' | '老师';
export type DeviceFriendVerificationStatus = 'verified' | 'pending' | 'blocked';
export type DeviceChatMessageType =
  | 'text'
  | 'voice'
  | 'image'
  | 'task'
  | 'location'
  | 'video'
  | 'ai_record'
  | 'meeting_summary'
  | 'moment_invite'
  | 'task_invite';

export type DeviceFriend = {
  id: string;
  name: string;
  note: string;
  status: 'online' | 'offline';
  relation: DeviceFriendRelation;
  unread?: number;
  yxbId: string;
  mobile: string;
  remark?: string;
  isAuthorizedForCall: boolean;
  isBlocked: boolean;
  verificationStatus: DeviceFriendVerificationStatus;
};

export type DeviceChatMessage = {
  id: string;
  author: string;
  type: DeviceChatMessageType;
  content: string;
  self?: boolean;
  time: string;
  cardTitle?: string;
  cardSummary?: string;
  path?: string;
};

export type DeviceMicrochatThread = {
  id: string;
  friendId: string;
  title: string;
  unread: number;
  lastMessage: string;
  messages: DeviceChatMessage[];
};

export type DeviceGroupChat = {
  id: string;
  title: string;
  badge: string;
  unread: number;
  members: string[];
  messages: DeviceChatMessage[];
};

export type DeviceMomentAttachment = {
  id: string;
  type: 'image' | 'video' | 'link' | 'media' | 'task' | 'course' | 'diary';
  label: string;
  summary: string;
  linkType?: '课程' | '难题挑战' | '研学日记' | '团队邀请' | '任务挑战';
  path?: string;
  ctaLabel?: string;
  previewLabel?: string;
};

export type DeviceMomentComment = {
  id: string;
  author: string;
  content: string;
};

export type DeviceMoment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  liked?: boolean;
  attachments: DeviceMomentAttachment[];
  commentList: DeviceMomentComment[];
};

type DeviceSocialState = {
  friends: DeviceFriend[];
  microchatThreads: DeviceMicrochatThread[];
  groupChats: DeviceGroupChat[];
  moments: DeviceMoment[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitialState(): DeviceSocialState {
  return {
    friends: [
      {
        id: 'friend_01',
        name: '妈妈',
        note: '家庭联系人',
        status: 'online',
        relation: '家人',
        unread: 1,
        yxbId: '80001',
        mobile: '13800000001',
        remark: '家长主联系人',
        isAuthorizedForCall: true,
        isBlocked: false,
        verificationStatus: 'verified',
      },
      {
        id: 'friend_02',
        name: '陈同学',
        note: '海豚探索队组长',
        status: 'online',
        relation: '同学',
        unread: 2,
        yxbId: '80002',
        mobile: '13800000002',
        remark: '环保倡议搭档',
        isAuthorizedForCall: true,
        isBlocked: false,
        verificationStatus: 'verified',
      },
      {
        id: 'friend_03',
        name: '王导师',
        note: '班级导师',
        status: 'offline',
        relation: '老师',
        yxbId: '80003',
        mobile: '13800000003',
        remark: '可以接收任务作品',
        isAuthorizedForCall: false,
        isBlocked: false,
        verificationStatus: 'pending',
      },
    ],
    microchatThreads: [
      {
        id: 'microchat_01',
        friendId: 'friend_01',
        title: '妈妈',
        unread: 1,
        lastMessage: '晚上记得讲给家里人听。',
        messages: [
          { id: 'micro_1', author: '妈妈', type: 'text', content: '今天拍到海豚了吗？', time: '13:20' },
          { id: 'micro_2', author: '我', type: 'image', content: '已发 1 张海豚照片', time: '13:24', self: true },
          { id: 'micro_3', author: '妈妈', type: 'voice', content: '晚上记得讲给家里人听。', time: '13:28' },
        ],
      },
      {
        id: 'microchat_02',
        friendId: 'friend_02',
        title: '陈同学',
        unread: 2,
        lastMessage: '环保倡议卡我已经写好开头。',
        messages: [
          { id: 'micro_4', author: '陈同学', type: 'text', content: '环保倡议卡我已经写好开头。', time: '14:02' },
          { id: 'micro_5', author: '我', type: 'task_invite', content: '我来补第二条建议。', cardTitle: '任务挑战邀请', cardSummary: '一起完成环保倡议卡', path: '/tasks/task_demo_01', time: '14:04', self: true },
        ],
      },
    ],
    groupChats: [
      {
        id: 'groupchat_01',
        title: '海豚探索队',
        badge: '小组群',
        unread: 3,
        members: ['陈同学', '李同学', '王同学'],
        messages: [
          { id: 'group_1', author: '王同学', type: 'image', content: '已上传海豚照片 2 张', time: '13:40' },
          { id: 'group_2', author: '陈同学', type: 'voice', content: '大家先集合，等会儿交任务。', time: '13:43' },
          { id: 'group_3', author: '我', type: 'task', content: '已同步任务卡：环保倡议卡', time: '13:45', self: true },
        ],
      },
      {
        id: 'groupchat_02',
        title: '5 班研学群',
        badge: '班级群',
        unread: 1,
        members: ['王导师', '海洋馆研学 5 班'],
        messages: [
          { id: 'group_4', author: '王导师', type: 'text', content: '15:00 请各组到海狮馆门口集合。', time: '14:10' },
        ],
      },
    ],
    moments: [
      {
        id: 'moment_01',
        author: '陈同学',
        content:
          '今天终于拍到了海豚跃出水面的瞬间！还顺手把这段观察放进了研学日记里，准备晚上继续补一段 AI 探究。',
        createdAt: '今天 13:18',
        likes: 8,
        comments: 3,
        liked: true,
        attachments: [
          { id: 'moment_attachment_01', type: 'media', label: '海豚跃出水面', summary: '现场照片 1 张', path: '/album/album_01', ctaLabel: '查看相册', previewLabel: '现场媒体' },
          {
            id: 'moment_attachment_02',
            type: 'diary',
            label: '海豚观察日记',
            summary: '点击查看今天的研学日记',
            linkType: '研学日记',
            path: '/diary/diary_01',
            ctaLabel: '查看日记',
            previewLabel: '研学日记',
          },
        ],
        commentList: [
          { id: 'moment_comment_01', author: '妈妈', content: '拍得太好了，晚上回家讲讲。' },
          { id: 'moment_comment_02', author: '王导师', content: '可以继续补一条 AI 发现的新问题。' },
        ],
      },
      {
        id: 'moment_02',
        author: '妈妈',
        content: '看到你今天的研学日记啦，晚上回家讲给我们听。',
        createdAt: '今天 12:56',
        likes: 6,
        comments: 1,
        attachments: [
          {
            id: 'moment_attachment_03',
            type: 'task',
            label: '生态设施大搜索任务',
            summary: '点击加入并查看任务要求',
            linkType: '任务挑战',
            path: '/tasks/task_demo_01',
            ctaLabel: '加入任务',
            previewLabel: '任务卡',
          },
          {
            id: 'moment_attachment_04',
            type: 'course',
            label: '海洋动物观察课',
            summary: '继续学习海豚行为观察',
            linkType: '课程',
            path: '/courses/course_demo_01',
            ctaLabel: '加入课程',
            previewLabel: '课程卡',
          },
        ],
        commentList: [{ id: 'moment_comment_03', author: '我', content: '好，晚上讲给你们听。' }],
      },
    ],
  };
}

function readState(): DeviceSocialState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_SOCIAL_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_SOCIAL_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(raw) as DeviceSocialState;
}

function writeState(nextState: DeviceSocialState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DEVICE_SOCIAL_STATE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(DEVICE_SOCIAL_STATE_EVENT));
}

function updateState(updater: (state: DeviceSocialState) => DeviceSocialState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

export function getDeviceSocialSnapshot() {
  return clone(readState());
}

export function useDeviceSocialSnapshot() {
  const [snapshot, setSnapshot] = useState<DeviceSocialState>(() => getDeviceSocialSnapshot());

  useEffect(() => {
    function sync() {
      setSnapshot(getDeviceSocialSnapshot());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_SOCIAL_STATE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_SOCIAL_STATE_EVENT, sync);
    };
  }, []);

  return snapshot;
}

export function getFriendById(friendId: string) {
  return getDeviceSocialSnapshot().friends.find((item) => item.id === friendId) ?? null;
}

export function updateFriendRemark(friendId: string, remark: string) {
  updateState((state) => ({
    ...state,
    friends: state.friends.map((item) => (item.id === friendId ? { ...item, remark } : item)),
  }));
}

export function deleteFriend(friendId: string) {
  updateState((state) => ({
    ...state,
    friends: state.friends.filter((item) => item.id !== friendId),
    microchatThreads: state.microchatThreads.filter((thread) => thread.friendId !== friendId),
  }));
}

export function approveFriendRequest(friendId: string) {
  updateState((state) => ({
    ...state,
    friends: state.friends.map((item) =>
      item.id === friendId
        ? {
            ...item,
            verificationStatus: 'verified',
            isBlocked: false,
          }
        : item,
    ),
    microchatThreads: state.microchatThreads.map((thread) =>
      thread.friendId === friendId
        ? {
            ...thread,
            lastMessage: '已经通过好友申请，可以开始微聊。',
            messages: [
              ...thread.messages,
              {
                id: `${thread.id}_approved_${Date.now()}`,
                author: '系统',
                type: 'text',
                content: '已经通过好友申请，可以开始微聊。',
                time: '刚刚',
              },
            ],
          }
        : thread,
    ),
  }));
}

export function rejectFriendRequest(friendId: string) {
  deleteFriend(friendId);
}

export function setFriendBlocked(friendId: string, isBlocked: boolean) {
  updateState((state) => ({
    ...state,
    friends: state.friends.map((item) =>
      item.id === friendId
        ? {
            ...item,
            isBlocked,
            verificationStatus: isBlocked ? 'blocked' : item.verificationStatus === 'blocked' ? 'verified' : item.verificationStatus,
          }
        : item,
    ),
  }));
}

export function authorizeFriendCall(friendId: string, enabled: boolean) {
  updateState((state) => ({
    ...state,
    friends: state.friends.map((item) => (item.id === friendId ? { ...item, isAuthorizedForCall: enabled } : item)),
  }));
}

export function addFriend(input: {
  name?: string;
  relation: DeviceFriendRelation;
  yxbId?: string;
  mobile?: string;
  note?: string;
  remark?: string;
}) {
  const friend: DeviceFriend = {
    id: `friend_${Date.now()}`,
    name: input.name || `${input.relation}${input.yxbId || input.mobile || readState().friends.length + 1}`,
    note: input.note ?? '新的朋友',
    status: 'offline',
    relation: input.relation,
    unread: 0,
    yxbId: input.yxbId || String(80000 + readState().friends.length + 1),
    mobile: input.mobile || `1380000${String(readState().friends.length + 1).padStart(4, '0')}`,
    remark: input.remark,
    isAuthorizedForCall: input.relation === '家人',
    isBlocked: false,
    verificationStatus: 'pending',
  };

  updateState((state) => ({
    ...state,
    friends: [friend, ...state.friends],
    microchatThreads: [
      {
        id: `microchat_${Date.now()}`,
        friendId: friend.id,
        title: friend.name,
        unread: 0,
        lastMessage: '等待验证通过后开始聊天',
        messages: [
          {
            id: `microchat_pending_${Date.now()}`,
            author: '系统',
            type: 'text',
            content: '新的朋友验证已发出，验证通过后可以开始微聊。',
            time: '刚刚',
          },
        ],
      },
      ...state.microchatThreads,
    ],
  }));

  return friend;
}

function buildLastMessage(message: DeviceChatMessage) {
  if (message.cardTitle) {
    return `${message.cardTitle}：${message.cardSummary ?? message.content}`;
  }
  return message.content;
}

export function appendMicrochatMessage(threadId: string, message: Omit<DeviceChatMessage, 'id' | 'time'>) {
  updateState((state) => ({
    ...state,
    microchatThreads: state.microchatThreads.map((thread) =>
      thread.id !== threadId
        ? thread
        : {
            ...thread,
            lastMessage: buildLastMessage({ ...message, id: '', time: '刚刚' }),
            messages: [
              ...thread.messages,
              {
                ...message,
                id: `${threadId}_${Date.now()}`,
                time: '刚刚',
              },
            ],
          },
    ),
  }));
}

export function appendGroupChatMessage(chatId: string, message: Omit<DeviceChatMessage, 'id' | 'time'>) {
  updateState((state) => ({
    ...state,
    groupChats: state.groupChats.map((chat) =>
      chat.id !== chatId
        ? chat
        : {
            ...chat,
            messages: [
              ...chat.messages,
              {
                ...message,
                id: `${chatId}_${Date.now()}`,
                time: '刚刚',
              },
            ],
          },
    ),
  }));
}

export function addMoment(input: {
  author?: string;
  content: string;
  attachments?: DeviceMomentAttachment[];
}) {
  const moment: DeviceMoment = {
    id: `moment_${Date.now()}`,
    author: input.author ?? '我',
    content: input.content,
    createdAt: '刚刚',
    likes: 0,
    comments: 0,
    liked: false,
    attachments: input.attachments ?? [],
    commentList: [],
  };

  updateState((state) => ({
    ...state,
    moments: [moment, ...state.moments],
  }));

  return moment;
}

export function toggleMomentLike(momentId: string) {
  updateState((state) => ({
    ...state,
    moments: state.moments.map((item) =>
      item.id !== momentId
        ? item
        : {
            ...item,
            liked: !item.liked,
            likes: Math.max(0, item.likes + (item.liked ? -1 : 1)),
          },
    ),
  }));
}

export function addMomentComment(momentId: string, content: string, author = '我') {
  updateState((state) => ({
    ...state,
    moments: state.moments.map((item) =>
      item.id !== momentId
        ? item
        : {
            ...item,
            comments: item.comments + 1,
            commentList: [...item.commentList, { id: `${momentId}_${Date.now()}`, author, content }],
          },
    ),
  }));
}
