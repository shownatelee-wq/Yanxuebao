'use client';

import {
  AlertOutlined,
  HomeOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getDeviceDataMode, getDeviceInitialized } from '../../lib/api';
import { useDeviceSession } from '../../lib/use-device-session';

const { Text, Title } = Typography;

const pageTitles: Record<string, string> = {
  '/home': '主屏',
  '/tasks': '任务',
  '/tasks/new': '填写作品',
  '/capture': '拍拍',
  '/ask': '专家伴学',
  '/flash-note': '闪记',
  '/flash-note/new': '语音闪记',
  '/identify': '识物',
  '/team': '更多团队',
  '/team/travel': '研学旅行团队',
  '/growth': '成长',
  '/messages': '消息',
  '/chat': '聊天',
  '/courses': '课程',
  '/course-qa': '专家问答',
  '/me': '我的',
  '/sos': 'SoS',
  '/plaza': '广场',
  '/friends': '好友',
  '/friends/new': '添加好友',
  '/microchat': '微聊',
  '/group-chat': '群聊',
  '/group-chat/new': '新建群聊',
  '/meeting': '会议',
  '/moments': '朋友圈',
  '/moments/new': '发朋友圈',
  '/wallet': '支付',
  '/wallet/code': '付款码',
  '/wallet/balance': '余额',
  '/wallet/records': '交易记录',
  '/cloud': '网盘',
  '/settings': '设置',
  '/settings/device': '设备绑定',
  '/settings/switch-account': '切换账号',
  '/settings/password': '锁屏密码',
  '/settings/face': '人脸识别',
  '/settings/payment': '支付卡管理',
  '/album': '相册',
  '/ai-draw': 'AI 绘画',
  '/ai-video': 'AI 视频',
  '/wallet/card': '支付卡绑定',
  '/face-login': '人脸识别',
  '/social': '社交中心',
  '/ai-create': 'AI 创作',
  '/ai': 'AI',
  '/flash-note/video': '视频闪记',
  '/flash-note/works': '闪记作品',
  '/team/handbook': '研学手册',
  '/team/rankings': '团队排行',
  '/team/reviews': '研学评价',
  '/team/join': '扫码入团',
  '/team/groups': '小组',
  '/team/roles': '岗位',
  '/team/badge': '名称与徽章',
  '/team/badge/upload': '上传徽章',
  '/growth/index': '能力指数',
  '/growth/self-test': '能力自测',
  '/growth/value': '成长值',
  '/growth/mall': '成长商城',
};

function resolvePageTitle(pathname: string) {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  if (pathname.startsWith('/tasks/')) {
    if (pathname.startsWith('/tasks/resources/')) {
      return '活动资源包';
    }
    if (pathname.startsWith('/tasks/sheets/')) {
      return '作品项';
    }
    if (pathname.startsWith('/tasks/works/')) {
      if (pathname.endsWith('/edit')) {
        return '修改作品';
      }
      return '作品详情';
    }
    return '任务详情';
  }
  if (pathname.startsWith('/friends/')) {
    return '好友详情';
  }
  if (pathname.startsWith('/microchat/')) {
    return '微聊';
  }
  if (pathname.startsWith('/group-chat/')) {
    return '群聊';
  }
  if (pathname.startsWith('/meeting/')) {
    if (pathname.endsWith('/talk')) {
      return '对讲';
    }
    if (pathname.endsWith('/summary')) {
      return '会议纪要';
    }
    return '会议详情';
  }
  if (pathname.startsWith('/moments/')) {
    return '动态详情';
  }
  if (pathname.startsWith('/wallet/')) {
    if (pathname.endsWith('/code')) {
      return '付款码';
    }
    if (pathname.endsWith('/balance')) {
      return '余额';
    }
    if (pathname.endsWith('/card')) {
      return '支付卡绑定';
    }
    return '交易记录';
  }
  if (pathname.startsWith('/cloud/category/')) {
    return '文件列表';
  }
  if (pathname.startsWith('/cloud/files/')) {
    return '文件预览';
  }
  if (pathname.startsWith('/messages/')) {
    return '消息详情';
  }
  if (pathname.startsWith('/courses/')) {
    return '课程详情';
  }
  if (pathname.startsWith('/team/')) {
    const dynamicTeamPath = pathname.match(/^\/team\/[^/]+(\/.*)?$/)?.[1] ?? '';

    if (pathname.startsWith('/team/handbook') || dynamicTeamPath.startsWith('/handbook')) {
      if (pathname.startsWith('/team/handbook/materials/')) {
        return '资料预览';
      }
      if (dynamicTeamPath.startsWith('/handbook/materials/')) {
        return '资料预览';
      }
      return '研学手册';
    }
    if (pathname.startsWith('/team/rankings') || dynamicTeamPath.startsWith('/rankings')) {
      if (pathname.endsWith('/personal')) {
        return '个人排行';
      }
      if (pathname.endsWith('/groups')) {
        return '小组排行';
      }
      return '团队排行';
    }
    if (pathname.startsWith('/team/reviews') || dynamicTeamPath.startsWith('/reviews')) {
      if (pathname.endsWith('/self')) {
        return '团队自评';
      }
      if (pathname.endsWith('/peer')) {
        return '团队互评';
      }
      return '研学评价';
    }
    if (pathname.startsWith('/team/join')) {
      return '扫码入团';
    }
    if (pathname.startsWith('/team/groups') || dynamicTeamPath.startsWith('/groups')) {
      if (pathname !== '/team/groups') {
        return '小组详情';
      }
      if (dynamicTeamPath && dynamicTeamPath !== '/groups') {
        return '小组详情';
      }
      return '小组';
    }
    if (pathname.startsWith('/team/roles') || dynamicTeamPath.startsWith('/roles')) {
      return '岗位';
    }
    if (pathname.startsWith('/team/badge') || dynamicTeamPath.startsWith('/badge')) {
      if (dynamicTeamPath.startsWith('/badge/upload')) {
        return '上传徽章';
      }
      return '名称与徽章';
    }
    if (dynamicTeamPath.startsWith('/tasks')) {
      return '团队任务';
    }
    if (dynamicTeamPath.startsWith('/reports')) {
      return '研学报告';
    }
    if (dynamicTeamPath.startsWith('/certificate')) {
      return '研学证书';
    }
    return '团队详情';
  }
  if (pathname.startsWith('/flash-note/')) {
    if (pathname.endsWith('/edit')) {
      return '编辑闪记';
    }
    return '闪记详情';
  }
  if (pathname.startsWith('/growth/')) {
    if (pathname.startsWith('/growth/index')) {
      return '能力指数';
    }
    if (pathname.startsWith('/growth/self-test/start')) {
      return '开始自测';
    }
    if (pathname.startsWith('/growth/self-test/result')) {
      return '自测结果';
    }
    if (pathname.startsWith('/growth/self-test/report')) {
      return '自测报告';
    }
    if (pathname.startsWith('/growth/self-test/history/')) {
      return '自测记录';
    }
    if (pathname.startsWith('/growth/self-test/history')) {
      return '自测历史';
    }
    if (pathname.startsWith('/growth/self-test')) {
      return '能力自测';
    }
    if (pathname.startsWith('/growth/value/rules')) {
      return '成长值规则';
    }
    if (pathname.startsWith('/growth/value/details')) {
      return '成长值明细';
    }
    if (pathname.startsWith('/growth/value')) {
      return '成长值';
    }
    if (pathname.startsWith('/growth/mall')) {
      if (pathname !== '/growth/mall') {
        return '商品详情';
      }
      return '成长商城';
    }
    if (pathname.startsWith('/growth/capabilities/')) {
      return '能力详情';
    }
    return '成长详情';
  }
  if (pathname.startsWith('/me/reports/')) {
    return '报告详情';
  }
  if (pathname.startsWith('/me/diaries/')) {
    return '日记详情';
  }
  if (pathname.startsWith('/me/favorites/')) {
    return '收藏详情';
  }
  if (pathname.startsWith('/plaza/content/')) {
    return '内容详情';
  }
  if (pathname.startsWith('/plaza/agents/')) {
    if (pathname.includes('/courses/')) {
      return '课程详情';
    }
    if (pathname.endsWith('/courses')) {
      return '专家课程';
    }
    if (pathname.includes('/news/')) {
      return '资讯详情';
    }
    if (pathname.endsWith('/news')) {
      return '资讯订阅';
    }
    if (pathname.endsWith('/challenges')) {
      return '难题挑战';
    }
    return '智能体详情';
  }
  if (pathname.startsWith('/chat')) {
    return '聊天';
  }
  if (pathname.startsWith('/ai/knowledge/')) {
    return '知识卡';
  }
  if (pathname.startsWith('/ai/records/')) {
    return 'AI 记录';
  }
  return '设备端';
}

export default function DeviceWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, session } = useDeviceSession();
  const [now, setNow] = useState(() => new Date());
  const [isCourseQaMode, setIsCourseQaMode] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(getDeviceInitialized() ? '/student-login' : '/login');
    }
  }, [router, status]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsCourseQaMode(pathname === '/ask' && new URLSearchParams(window.location.search).get('mode') === 'course_qa');
  }, [pathname]);

  const timeLabel = useMemo(
    () =>
      now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    [now],
  );

  const isHome = pathname === '/home';
  const pageTitle = isCourseQaMode
    ? '专家问答'
    : resolvePageTitle(pathname);

  if (status === 'hydrating') {
    return (
      <div className="device-workspace">
        <div className="device-workspace-header">
          <div className="device-topbar">
            <Text strong style={{ fontSize: 12 }}>
              {timeLabel}
            </Text>
          </div>
          <div className="device-topbar-main">
            <div className="device-topbar-title">
              <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                加载中
              </Title>
              <span className="device-topbar-subtitle">设备主屏</span>
            </div>
          </div>
        </div>
        <div className="device-screen-content">
          <div className="device-compact-card">
            <p className="device-page-subtle" style={{ margin: 0 }}>
              正在读取登录信息
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="device-workspace">
      <div className="device-workspace-header">
        <div className="device-topbar">
          <Text strong style={{ fontSize: 12 }}>
            {timeLabel}
          </Text>
          <Space size={10}>
            <Text type="secondary" style={{ fontSize: 10 }}>
              4G
            </Text>
            <div className="device-battery-pill">
              <span style={{ width: '72%' }} />
            </div>
            <Text type="secondary" style={{ fontSize: 10 }}>
              72%
            </Text>
          </Space>
        </div>
        {!isHome ? (
          <div className="device-topbar-main">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => router.back()}
              className="device-icon-button soft"
            />
            <div className="device-topbar-title">
              <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                {pageTitle}
              </Title>
              <span className="device-topbar-subtitle">
                {`${session?.user.displayName ?? '未授权'} · ${getDeviceDataMode() === 'api' ? '在线' : '本地'}`}
              </span>
            </div>
            <Space size={6}>
              <Button
                type="text"
                icon={<HomeOutlined />}
                onClick={() => router.push('/home')}
                className="device-icon-button soft"
              />
              <Button
                type="text"
                icon={<AlertOutlined />}
                danger
                onClick={() => router.push('/sos')}
                className="device-icon-button"
              />
            </Space>
          </div>
        ) : null}
      </div>
      <div className="device-screen-content">
        <div key={pathname} className={`device-page-enter${isHome ? ' home-enter' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
