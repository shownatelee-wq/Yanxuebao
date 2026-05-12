'use client';

import '@ant-design/v5-patch-for-react-19';
import {
  CheckCircleOutlined,
  CloudOutlined,
  CompassOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  MobileOutlined,
  PlusOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Drawer, Empty, Form, Input, Progress, Radio, Segmented, Select, Spin, Switch, Tag, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import {
  useParentStore,
  type DemoScanDevice,
  type DeviceContact,
  type DeviceContactCategory,
  type DeviceQuietTime,
  type ParentDevice,
  type ParentStudent,
} from '../lib/parent-store';

export type DeviceFeatureKey = 'payment-card' | 'netdisk' | 'contacts' | 'quiet-times' | 'location';

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const WEEKDAY_OPTIONS = WEEKDAY_NAMES.map((label, value) => ({ label, value }));
const CONTACT_CATEGORIES: DeviceContactCategory[] = ['家长', '导师', '紧急联系人', '其他'];

const DEVICE_FEATURES: Array<{
  key: DeviceFeatureKey;
  title: string;
  description: string;
  icon: ComponentType;
}> = [
  { key: 'payment-card', title: '支付卡', description: '亲子卡与消费明细', icon: CreditCardOutlined },
  { key: 'netdisk', title: '网盘', description: '资料同步与账号', icon: CloudOutlined },
  { key: 'contacts', title: '通讯录', description: '联系人与通话权限', icon: TeamOutlined },
  { key: 'quiet-times', title: '停用时间', description: '按星期同步规则', icon: FieldTimeOutlined },
  { key: 'location', title: '位置与轨迹', description: '当前位置与24小时轨迹', icon: EnvironmentOutlined },
];

function formatDateTime(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
}

function formatWeekdays(weekdays: number[]) {
  if (weekdays.length === 7) {
    return '每天';
  }
  if (weekdays.join(',') === '1,2,3,4,5') {
    return '工作日';
  }
  if (weekdays.join(',') === '6,0') {
    return '周末';
  }
  return weekdays.map((day) => WEEKDAY_NAMES[day]).join(' ');
}

function getFeatureSummary(feature: DeviceFeatureKey, device?: ParentDevice) {
  if (!device) {
    return '待绑定设备';
  }
  switch (feature) {
    case 'payment-card':
      return device.paymentCard
        ? device.paymentCard.status === '已绑定'
          ? `余额 ${device.paymentCard.balance.toFixed(2)} 元`
          : device.paymentCard.status
        : '未添加支付卡';
    case 'netdisk':
      return device.netDisk
        ? device.netDisk.status === '已绑定'
          ? `${device.netDisk.status} · ${device.netDisk.capacityUsed}/${device.netDisk.capacityTotal}GB`
          : device.netDisk.status
        : '未绑定网盘';
    case 'contacts':
      return `${device.contacts.length} 人 · ${device.contacts.filter((contact) => contact.allowed).length} 人可通话`;
    case 'quiet-times':
      return `${device.quietTimes.filter((item) => item.enabled).length} 条启用`;
    case 'location':
      return device.latestLocation ? formatDateTime(device.latestLocation.receivedAt) : '暂无定位';
  }
}

function getFeatureConfig(feature: DeviceFeatureKey) {
  return DEVICE_FEATURES.find((item) => item.key === feature) ?? DEVICE_FEATURES[0];
}

function getFeatureHref(feature: DeviceFeatureKey, studentId: string) {
  return `/me/device/${feature}?studentId=${studentId}`;
}

function getTrackTypeLabel(type: string) {
  const labels: Record<string, string> = {
    home: '家',
    school: '学校',
    training: '培训班',
    current: '当前位置',
    study: '研学点',
  };
  return labels[type] ?? '位置';
}

function DeviceStudentTabs({
  students,
  activeStudentId,
  onChange,
}: {
  students: ParentStudent[];
  activeStudentId: string;
  onChange: (studentId: string) => void;
}) {
  return (
    <div className="parent-filter-row">
      {students.map((student) => (
        <button
          key={student.id}
          type="button"
          className={student.id === activeStudentId ? 'active' : ''}
          onClick={() => onChange(student.id)}
        >
          {student.name}
        </button>
      ))}
    </div>
  );
}

function DeviceFeatureGrid({
  device,
  onOpen,
  onLocked,
}: {
  device?: ParentDevice;
  onOpen: (feature: DeviceFeatureKey) => void;
  onLocked: () => void;
}) {
  return (
    <div className="parent-device-feature-grid">
      {DEVICE_FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <button
            key={feature.key}
            type="button"
            className={`parent-device-feature-entry ${device ? '' : 'disabled'}`}
            onClick={() => (device ? onOpen(feature.key) : onLocked())}
          >
            <span className={`parent-device-feature-icon ${feature.key}`}>
              <Icon />
            </span>
            <strong>{feature.title}</strong>
            <em>{getFeatureSummary(feature.key, device)}</em>
          </button>
        );
      })}
    </div>
  );
}

function DeviceLockedGuide({ student, onBind }: { student: ParentStudent; onBind: () => void }) {
  return (
    <section className="parent-empty-guide compact">
      <MobileOutlined />
      <strong>请先绑定研学宝设备</strong>
      <p>{student.name} 绑定设备后，才能管理支付卡、网盘、通讯录、停用时间和位置轨迹。</p>
      <Button type="primary" onClick={onBind}>
        立即扫码绑定
      </Button>
    </section>
  );
}

export function ParentDeviceManagementScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const studentId = searchParams.get('studentId');
  const [messageApi, contextHolder] = message.useMessage();

  const activeStudent = useMemo(() => {
    if (studentId) {
      return store.state.students.find((student) => student.id === studentId) ?? null;
    }
    return store.selectedStudent ?? store.state.students[0] ?? null;
  }, [store.selectedStudent, store.state.students, studentId]);

  function openScanner(student: ParentStudent) {
    router.push(`/me/device/scan?studentId=${student.id}`);
  }

  function goToSelf(nextStudentId: string) {
    router.push(`/device?studentId=${nextStudentId}`);
  }

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入设备管理" />;
  }

  if (!store.state.students.length) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="设备管理" subtitle="我的" onBack={() => router.push('/me')}>
          <section className="parent-empty-guide onboarding">
            <MobileOutlined />
            <strong>先添加学员再绑定设备</strong>
            <p>每台研学宝设备都会绑定到具体学员，先创建学员账号，后续扫码就能完成绑定。</p>
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              去添加学员
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  if (!activeStudent) {
    return <ParentRouteFallback label="正在加载设备信息" />;
  }

  const device = activeStudent.device;

  return (
    <ParentPhoneFrame>
      {contextHolder}
      <ParentSubpageShell
        title="设备管理"
        subtitle="我的"
        onBack={() => router.push('/me')}
        rightSlot={<Button aria-label="扫码绑定" shape="circle" icon={<PlusOutlined />} onClick={() => openScanner(activeStudent)} />}
      >
        <div className="parent-card-list">
          <section className="parent-device-hero">
            <div>
              <span>{activeStudent.name} 的研学宝</span>
              <strong>{device ? device.name : '未绑定设备'}</strong>
              <em>{device ? `${device.deviceCode} · ${device.model}` : '绑定后开启设备管控功能'}</em>
            </div>
            <Button size="small" type="primary" icon={<MobileOutlined />} onClick={() => openScanner(activeStudent)}>
              {device ? '更换设备' : '扫码绑定'}
            </Button>
          </section>

          <DeviceStudentTabs students={store.state.students} activeStudentId={activeStudent.id} onChange={goToSelf} />

          {device ? (
            <section className="parent-device-status-card">
              <div>
                <strong>设备状态</strong>
                <span>最后在线 {formatDateTime(device.lastOnlineAt)}</span>
              </div>
              <div className="parent-device-chip-list">
                <Tag color="green">电量 {device.batteryPercent}%</Tag>
                <Tag>{device.mode === 'sale' ? '销售模式' : '租赁模式'}</Tag>
              </div>
            </section>
          ) : (
            <DeviceLockedGuide student={activeStudent} onBind={() => openScanner(activeStudent)} />
          )}

          <section className="parent-section">
            <div className="parent-section-head">
              <strong>设备功能</strong>
              <span>点击进入二级功能</span>
            </div>
            <DeviceFeatureGrid
              device={device}
              onOpen={(feature) => router.push(getFeatureHref(feature, activeStudent.id))}
              onLocked={() => messageApi.warning('请先绑定研学宝设备')}
            />
          </section>

          <section className="parent-section">
            <div className="parent-section-head">
              <strong>研学宝订购</strong>
              <ShoppingOutlined />
            </div>
            <div className="parent-shop-card">
              <div>
                <span>家庭套装演示购买</span>
                <strong>研学宝智能硬件 1299 元</strong>
                <em>订单、支付状态采用本地 mock 数据演示。</em>
              </div>
              <Button type="primary" icon={<ShoppingOutlined />} onClick={() => store.createOrder()}>
                立即订购
              </Button>
            </div>
          </section>
        </div>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}

export function ParentDeviceFeatureScreen({ feature }: { feature: DeviceFeatureKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const studentId = searchParams.get('studentId');
  const [messageApi, contextHolder] = message.useMessage();
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [paymentBindStep, setPaymentBindStep] = useState<'form' | 'authorizing' | 'success'>('form');
  const [paymentDraft, setPaymentDraft] = useState<{ alias: string; account: string; limitAmount: number } | null>(null);
  const [netDiskDrawerOpen, setNetDiskDrawerOpen] = useState(false);
  const [netDiskBindStep, setNetDiskBindStep] = useState<'qr' | 'scanning' | 'success'>('qr');
  const [editingContact, setEditingContact] = useState<DeviceContact | null>(null);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [editingQuietTime, setEditingQuietTime] = useState<DeviceQuietTime | null>(null);
  const [quietDrawerOpen, setQuietDrawerOpen] = useState(false);
  const [trackRange, setTrackRange] = useState<'today' | 'recent'>('today');
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    content: string;
    okText?: string;
    successText?: string;
    onOk: () => void;
  } | null>(null);

  const activeStudent = useMemo(() => {
    if (studentId) {
      return store.state.students.find((student) => student.id === studentId) ?? null;
    }
    return store.selectedStudent ?? store.state.students[0] ?? null;
  }, [store.selectedStudent, store.state.students, studentId]);

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入设备功能" />;
  }

  if (!activeStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="设备功能" subtitle="设备管理" onBack={() => router.push('/device')} rightSlot={<Button aria-label="我的" shape="circle" icon={<UserOutlined />} onClick={() => router.push('/me')} />}>
          <section className="parent-empty-guide">
            <Empty description="请先选择学员" />
            <Button type="primary" onClick={() => router.push('/me/students')}>
              去学员管理
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  const device = activeStudent.device;
  const config = getFeatureConfig(feature);
  const backUrl = `/device?studentId=${activeStudent.id}`;

  if (!device) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title={config.title} subtitle="设备管理" onBack={() => router.push(backUrl)} rightSlot={<Button aria-label="我的" shape="circle" icon={<UserOutlined />} onClick={() => router.push('/me')} />}>
          <DeviceLockedGuide student={activeStudent} onBind={() => router.push(`/me/device/scan?studentId=${activeStudent.id}`)} />
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  function confirmAction(
    title: string,
    content: string,
    onOk: () => void,
    options?: { okText?: string; successText?: string },
  ) {
    setPendingConfirm({
      title,
      content,
      onOk,
      okText: options?.okText,
      successText: options?.successText,
    });
  }

  function runPendingConfirm() {
    if (!pendingConfirm) {
      return;
    }
    pendingConfirm.onOk();
    messageApi.success(pendingConfirm.successText ?? '操作已完成');
    setPendingConfirm(null);
  }

  function renderConfirmPanel() {
    if (!pendingConfirm) {
      return null;
    }
    return (
      <section className="parent-inline-confirm-panel">
        <strong>{pendingConfirm.title}</strong>
        <p>{pendingConfirm.content}</p>
        <div className="parent-split-footer">
          <Button block onClick={() => setPendingConfirm(null)}>
            取消
          </Button>
          <Button block danger type="primary" onClick={runPendingConfirm}>
            {pendingConfirm.okText ?? '确认'}
          </Button>
        </div>
      </section>
    );
  }

  function openPaymentUnbindConfirm() {
    confirmAction(
      '解绑支付宝亲密付',
      '解绑后将清空亲密付额度、余额和消费明细，页面会回到未添加状态，可立即重新添加。',
      () => store.removePaymentCard(activeStudent!.id),
      { okText: '确认解绑', successText: '已解绑亲密付，可重新添加' },
    );
  }

  function openNetDiskUnbindConfirm() {
    confirmAction(
      '解绑百度网盘',
      '解绑后将清空网盘账号、容量和同步记录，页面会回到未绑定状态，可重新扫码绑定。',
      () => store.removeNetDisk(activeStudent!.id),
      { okText: '确认解绑', successText: '已解绑网盘，可重新扫码绑定' },
    );
  }

  function renderPaymentCard() {
    const card = device!.paymentCard;
    return (
      <>
        <section className="parent-section parent-device-feature-summary">
          <div className="parent-section-head">
            <strong>亲子支付卡</strong>
            <Tag color={card ? 'green' : 'default'}>{card?.status ?? '未添加'}</Tag>
          </div>
          {card ? (
            <div className="parent-payment-card-panel">
              <span>{card.provider}</span>
              <strong>{card.alias}</strong>
              <em>尾号 {card.accountTail} · 每月额度 {card.limitAmount} 元 · {card.authStatus}</em>
              <div className="parent-device-big-number">
                <small>当前余额</small>
                <b>{card.balance.toFixed(2)} 元</b>
              </div>
            </div>
          ) : (
            <section className="parent-empty-guide compact">
              <CreditCardOutlined />
              <strong>还没有添加支付卡</strong>
              <p>添加后可查看余额和消费记录，本轮为本地 mock 演示。</p>
            </section>
          )}
          <div className="parent-device-action-row">
            <Button
              type="primary"
              icon={card?.status === '已绑定' ? <EditOutlined /> : <PlusOutlined />}
              onClick={() => {
                setPaymentBindStep('form');
                setPaymentDraft(null);
                setPaymentDrawerOpen(true);
              }}
            >
              {card?.status === '已绑定' ? '编辑亲密付' : '添加亲密付'}
            </Button>
            {card?.status === '已绑定' ? (
              <>
                <Button onClick={() => store.addPaymentRecord(activeStudent!.id, { title: '家长模拟充值', amount: 100, type: '充值' })}>模拟充值</Button>
                <button
                  type="button"
                  className="parent-danger-action-button"
                  onPointerUp={openPaymentUnbindConfirm}
                  onClick={openPaymentUnbindConfirm}
                >
                  解绑亲密付
                </button>
              </>
            ) : null}
          </div>
          {pendingConfirm?.title === '解绑支付宝亲密付' ? renderConfirmPanel() : null}
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>支付明细</strong>
            <span>{card?.records.length ?? 0} 条</span>
          </div>
          <div className="parent-device-record-list">
            {(card?.records ?? []).map((record) => (
              <div key={record.id}>
                <span>
                  <strong>{record.title}</strong>
                  <em>{formatDateTime(record.createdAt)} · {record.type} · {record.status}</em>
                </span>
                <b className={record.amount >= 0 ? 'income' : ''}>
                  {record.amount >= 0 ? '+' : ''}
                  {record.amount} 元
                </b>
              </div>
            ))}
          </div>
        </section>

        <Drawer
          title={card?.status === '已绑定' ? '编辑支付宝亲密付' : '添加支付宝亲密付'}
          open={paymentDrawerOpen}
          onClose={() => setPaymentDrawerOpen(false)}
          placement="bottom"
          height={paymentBindStep === 'form' ? 520 : 420}
          getContainer={false}
          rootClassName="parent-detail-drawer"
        >
          {paymentBindStep === 'form' ? (
            <Form
              key={card?.id ?? 'new-payment-card'}
              layout="vertical"
              initialValues={{ alias: card?.alias ?? '支付宝亲密付', account: card?.account ?? '', limitAmount: card?.limitAmount ?? 300 }}
              onFinish={(values: { alias: string; account: string; limitAmount: number }) => {
                const normalizedValues = { ...values, limitAmount: Number(values.limitAmount) || 0 };
                if (card?.status === '已绑定') {
                  store.savePaymentCard(activeStudent!.id, normalizedValues);
                  setPaymentDrawerOpen(false);
                  messageApi.success('亲密付信息已保存');
                  return;
                }
                setPaymentDraft(normalizedValues);
                store.startAlipayFamilyPayBind(activeStudent!.id, normalizedValues);
                setPaymentBindStep('authorizing');
                messageApi.success('已模拟向支付宝发送亲密付授权');
              }}
            >
              <section className="parent-bind-flow-intro">
                <strong>绑定支付宝亲密付</strong>
                <span>模拟支付宝亲密付/亲密卡流程：填写授权账号，发送授权，确认后完成绑定。</span>
              </section>
              <Form.Item name="alias" label="亲密付名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="如：小宇日常亲密付" />
              </Form.Item>
              <Form.Item name="account" label="支付宝账号" rules={[{ required: true, message: '请输入支付宝账号' }]}>
                <Input placeholder="手机号 / 邮箱 / 支付宝账号" />
              </Form.Item>
              <Form.Item name="limitAmount" label="单月可用额度">
                <Input inputMode="numeric" suffix="元" placeholder="300" />
              </Form.Item>
              <Button block type="primary" htmlType="submit">
                {card?.status === '已绑定' ? '保存' : '发送亲密付授权'}
              </Button>
            </Form>
          ) : null}
          {paymentBindStep === 'authorizing' && paymentDraft ? (
            <div className="parent-bind-flow-panel">
              <span className="parent-bind-flow-icon alipay">付</span>
              <strong>等待支付宝确认</strong>
              <p>已向 {paymentDraft.account} 发送亲密付授权。演示环境中点击下方按钮，即代表已在支付宝完成确认。</p>
              <div className="parent-mini-table">
                <div>
                  <span>亲密付名称</span>
                  <strong>{paymentDraft.alias}</strong>
                </div>
                <div>
                  <span>单月额度</span>
                  <strong>{paymentDraft.limitAmount} 元</strong>
                </div>
              </div>
              <Button
                block
                type="primary"
                onClick={() => {
                  store.confirmAlipayFamilyPayBind(activeStudent!.id, paymentDraft);
                  setPaymentBindStep('success');
                  messageApi.success('支付宝亲密付绑定成功');
                }}
              >
                模拟已在支付宝确认
              </Button>
            </div>
          ) : null}
          {paymentBindStep === 'success' ? (
            <div className="parent-bind-flow-panel success">
              <CheckCircleOutlined />
              <strong>亲密付绑定成功</strong>
              <p>支付卡已恢复为已绑定状态，可查看余额和支付明细，也可以再次解绑后重新添加。</p>
              <Button block type="primary" onClick={() => setPaymentDrawerOpen(false)}>
                完成
              </Button>
            </div>
          ) : null}
        </Drawer>
      </>
    );
  }

  function renderNetDisk() {
    const disk = device!.netDisk;
    const percent = disk ? Math.round((disk.capacityUsed / disk.capacityTotal) * 100) : 0;
    return (
      <>
        <section className="parent-section parent-device-feature-summary">
          <div className="parent-section-head">
            <strong>网盘账号</strong>
            <Tag color={disk ? 'green' : 'default'}>{disk?.status ?? '未绑定'}</Tag>
          </div>
          {disk ? (
            <div className="parent-netdisk-panel">
              <CloudOutlined />
              <div>
                <strong>{disk.alias}</strong>
                <span>{disk.provider} · {disk.account}</span>
                <em>最近同步 {formatDateTime(disk.lastSyncAt)}</em>
              </div>
              <Progress percent={percent} showInfo={false} />
              <small>
                已用 {disk.capacityUsed}GB / {disk.capacityTotal}GB
              </small>
            </div>
          ) : (
            <section className="parent-empty-guide compact">
              <CloudOutlined />
              <strong>还没有绑定网盘</strong>
              <p>绑定后可同步研学照片、作品和报告，本轮为本地 mock 演示。</p>
            </section>
          )}
          <div className="parent-device-action-row">
            <Button
              type="primary"
              icon={disk?.status === '已绑定' ? <EditOutlined /> : <PlusOutlined />}
              onClick={() => {
                setNetDiskBindStep('qr');
                setNetDiskDrawerOpen(true);
              }}
            >
              {disk?.status === '已绑定' ? '重新扫码' : '扫码绑定百度网盘'}
            </Button>
            {disk?.status === '已绑定' ? (
              <>
                <Button onClick={() => { store.syncNetDisk(activeStudent!.id); messageApi.success('已模拟同步到网盘'); }}>模拟同步</Button>
                <button
                  type="button"
                  className="parent-danger-action-button"
                  onPointerUp={openNetDiskUnbindConfirm}
                  onClick={openNetDiskUnbindConfirm}
                >
                  解绑
                </button>
              </>
            ) : null}
          </div>
          {pendingConfirm?.title === '解绑百度网盘' ? renderConfirmPanel() : null}
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>最近同步</strong>
            <span>{disk?.syncRecords.length ?? 0} 条</span>
          </div>
          <div className="parent-device-record-list">
            {(disk?.syncRecords ?? []).map((record) => (
              <div key={record.id}>
                <span>
                  <strong>{record.title}</strong>
                  <em>{formatDateTime(record.syncedAt)} · {record.fileType}</em>
                </span>
                <Tag color="blue">{record.status}</Tag>
              </div>
            ))}
          </div>
        </section>

        <Drawer
          title="扫码绑定百度网盘"
          open={netDiskDrawerOpen}
          onClose={() => setNetDiskDrawerOpen(false)}
          placement="bottom"
          height={470}
          getContainer={false}
          rootClassName="parent-detail-drawer"
        >
          {netDiskBindStep === 'qr' ? (
            <div className="parent-bind-flow-panel">
              <div className="parent-mock-qr" aria-hidden>
                <span />
              </div>
              <strong>使用百度网盘扫码授权</strong>
              <p>打开百度网盘 App 扫描二维码，确认授权后即可同步研学照片、作品和报告。本页为本地 mock 流程。</p>
              <Button
                block
                type="primary"
                onClick={() => {
                  store.startNetDiskQrBind(activeStudent!.id);
                  setNetDiskBindStep('scanning');
                  messageApi.success('已模拟扫码，等待授权确认');
                }}
              >
                模拟扫码
              </Button>
            </div>
          ) : null}
          {netDiskBindStep === 'scanning' ? (
            <div className="parent-bind-flow-panel">
              <Spin />
              <strong>等待百度网盘授权</strong>
              <p>已识别二维码会话，演示环境中点击下方按钮，即代表家长已同意授权。</p>
              <Button
                block
                type="primary"
                onClick={() => {
                  store.confirmNetDiskQrBind(activeStudent!.id);
                  setNetDiskBindStep('success');
                  messageApi.success('百度网盘绑定成功');
                }}
              >
                模拟授权完成
              </Button>
            </div>
          ) : null}
          {netDiskBindStep === 'success' ? (
            <div className="parent-bind-flow-panel success">
              <CheckCircleOutlined />
              <strong>百度网盘绑定成功</strong>
              <p>已生成 mock 网盘账号和同步记录，可继续模拟同步或解绑后重新扫码绑定。</p>
              <Button block type="primary" onClick={() => setNetDiskDrawerOpen(false)}>
                完成
              </Button>
            </div>
          ) : null}
        </Drawer>
      </>
    );
  }

  function openContactDrawer(contact?: DeviceContact) {
    setEditingContact(contact ?? null);
    setContactDrawerOpen(true);
  }

  function renderContacts() {
    const keyword = contactSearch.trim();
    const contacts = device!.contacts.filter((contact) => `${contact.name}${contact.relation}${contact.phone}`.includes(keyword));
    return (
      <>
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>通讯录</strong>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openContactDrawer()}>
              添加
            </Button>
          </div>
          <Input.Search placeholder="搜索姓名、关系或手机号" value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} />
        </section>

        <div className="parent-device-contact-groups">
          {CONTACT_CATEGORIES.map((category) => {
            const group = contacts.filter((contact) => contact.category === category);
            if (!group.length) {
              return null;
            }
            return (
              <section key={category} className="parent-section">
                <div className="parent-section-head">
                  <strong>{category}</strong>
                  <span>{group.length} 人</span>
                </div>
                <div className="parent-device-contact-list">
                  {group.map((contact) => (
                    <div key={contact.id} className="parent-device-contact-card">
                      <div>
                        <strong>{contact.name}</strong>
                        <span>{contact.relation} · {contact.phone}</span>
                        <em>{contact.allowed ? '允许通话' : '已停用'}{contact.isEmergency ? ' · 紧急联系人' : ''}</em>
                      </div>
                      <div className="parent-device-contact-actions">
                        <Switch size="small" checked={contact.allowed} onChange={() => store.toggleContact(activeStudent!.id, contact.id)} />
                        <Button size="small" icon={<EditOutlined />} onClick={() => openContactDrawer(contact)} />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => confirmAction('删除联系人', `确认删除 ${contact.name}？`, () => store.deleteContact(activeStudent!.id, contact.id))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <Drawer
          title={editingContact ? '编辑联系人' : '添加联系人'}
          open={contactDrawerOpen}
          onClose={() => setContactDrawerOpen(false)}
          placement="bottom"
          height={520}
          getContainer={false}
          rootClassName="parent-detail-drawer"
        >
          <Form
            key={editingContact?.id ?? 'new-contact'}
            layout="vertical"
            initialValues={{
              name: editingContact?.name ?? '',
              relation: editingContact?.relation ?? '',
              phone: editingContact?.phone ?? '',
              category: editingContact?.category ?? '家长',
              isEmergency: editingContact?.isEmergency ?? false,
              allowed: editingContact?.allowed ?? true,
            }}
            onFinish={(values: { name: string; relation: string; phone: string; category: DeviceContactCategory; isEmergency: boolean; allowed: boolean }) => {
              if (editingContact) {
                store.updateContact(activeStudent!.id, editingContact.id, values);
              } else {
                store.addContact(activeStudent!.id, values);
              }
              setContactDrawerOpen(false);
              messageApi.success('通讯录已保存');
            }}
          >
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="relation" label="关系" rules={[{ required: true, message: '请输入关系' }]}>
              <Input placeholder="如：妈妈、导师、紧急联系人" />
            </Form.Item>
            <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
              <Input inputMode="tel" placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item name="category" label="分组">
              <Select options={CONTACT_CATEGORIES.map((item) => ({ label: item, value: item }))} />
            </Form.Item>
            <Form.Item name="isEmergency" valuePropName="checked">
              <Checkbox>设为紧急联系人</Checkbox>
            </Form.Item>
            <Form.Item name="allowed" valuePropName="checked">
              <Switch checkedChildren="允许通话" unCheckedChildren="停用通话" />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              保存
            </Button>
          </Form>
        </Drawer>
      </>
    );
  }

  function openQuietDrawer(item?: DeviceQuietTime) {
    setEditingQuietTime(item ?? null);
    setQuietDrawerOpen(true);
  }

  function renderQuietTimes() {
    return (
      <>
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>停用时间</strong>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openQuietDrawer()}>
              新增
            </Button>
          </div>
          <p className="parent-device-page-note">规则保存后会模拟同步到研学宝设备，启用期间设备仅保留安全与定位能力。</p>
        </section>

        <div className="parent-device-rule-list">
          {device!.quietTimes.map((item) => (
            <section key={item.id} className="parent-section parent-device-rule-card">
              <div>
                <strong>{item.label}</strong>
                <span>{item.start} - {item.end} · {formatWeekdays(item.weekdays)}</span>
                <em>{item.syncStatus} · 更新 {formatDateTime(item.updatedAt)}</em>
              </div>
              <div className="parent-device-rule-actions">
                <Switch checked={item.enabled} onChange={() => store.toggleQuietTime(activeStudent!.id, item.id)} />
                <Button size="small" icon={<EditOutlined />} onClick={() => openQuietDrawer(item)}>
                  编辑
                </Button>
                <Button size="small" danger onClick={() => confirmAction('删除停用规则', `确认删除「${item.label}」？`, () => store.deleteQuietTime(activeStudent!.id, item.id))}>
                  删除
                </Button>
              </div>
            </section>
          ))}
        </div>

        <Drawer
          title={editingQuietTime ? '编辑停用时间' : '新增停用时间'}
          open={quietDrawerOpen}
          onClose={() => setQuietDrawerOpen(false)}
          placement="bottom"
          height={560}
          getContainer={false}
          rootClassName="parent-detail-drawer"
        >
          <Form
            key={editingQuietTime?.id ?? 'new-quiet'}
            layout="vertical"
            initialValues={{
              label: editingQuietTime?.label ?? '',
              start: editingQuietTime?.start ?? '21:30',
              end: editingQuietTime?.end ?? '07:00',
              weekdays: editingQuietTime?.weekdays ?? [1, 2, 3, 4, 5],
              enabled: editingQuietTime?.enabled ?? true,
            }}
            onFinish={(values: { label: string; start: string; end: string; weekdays: number[]; enabled: boolean }) => {
              if (editingQuietTime) {
                store.updateQuietTime(activeStudent!.id, editingQuietTime.id, values);
              } else {
                store.addQuietTime(activeStudent!.id, values);
              }
              setQuietDrawerOpen(false);
              messageApi.success('停用时间已同步到设备');
            }}
          >
            <Form.Item name="label" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
              <Input placeholder="如：上课时间、晚间休息" />
            </Form.Item>
            <div className="parent-device-time-fields">
              <Form.Item name="start" label="开始时间" rules={[{ required: true, message: '请选择开始时间' }]}>
                <Input type="time" />
              </Form.Item>
              <Form.Item name="end" label="结束时间" rules={[{ required: true, message: '请选择结束时间' }]}>
                <Input type="time" />
              </Form.Item>
            </div>
            <Form.Item name="weekdays" label="重复星期" rules={[{ required: true, message: '请选择星期' }]}>
              <Checkbox.Group options={WEEKDAY_OPTIONS} />
            </Form.Item>
            <Form.Item name="enabled" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              保存并同步
            </Button>
          </Form>
        </Drawer>
      </>
    );
  }

  function renderLocation() {
    const latestLocation = device!.latestLocation;
    const tracks = trackRange === 'today' ? device!.tracks : device!.tracks;
    const currentTrack = tracks.at(-1);
    return (
      <div className="parent-location-workbench">
        <section className="parent-location-student">
          <div className="parent-location-avatar">
            {activeStudent!.avatarImage ? <span className="avatar-image" style={{ backgroundImage: `url(${activeStudent!.avatarImage})` }} /> : activeStudent!.avatar}
          </div>
          <div>
            <strong>{activeStudent!.name}</strong>
            <span><i /> 在线</span>
          </div>
        </section>

        <section className="parent-location-current-card">
          <div className="parent-section-head">
            <strong><EnvironmentOutlined /> 当前位置</strong>
            <Tag color="green">定位正常</Tag>
          </div>
          <div className="parent-location-current-body">
            <div className="parent-location-current-copy">
              <span>最后收到位置：</span>
              <strong>{latestLocation?.address ?? '暂无位置'}</strong>
              <em>接收时间：{formatDateTime(latestLocation?.receivedAt ?? device!.lastOnlineAt)}</em>
              <Button type="primary" icon={<CompassOutlined />} onClick={() => messageApi.success('已模拟打开地图查看')}>
                地图查看
              </Button>
              <Button icon={<CompassOutlined />} onClick={() => messageApi.success(latestLocation?.navigationText ?? '已模拟拉起导航')}>
                导航前往
              </Button>
            </div>
            <div className="parent-location-mini-map">
              <span className="road horizontal" />
              <span className="road vertical" />
              <span className="map-label label-one">高新南一道</span>
              <span className="map-label label-two">科技园社区公园</span>
              <span className="map-blue-dot" />
              <span className="map-radius" />
              <span className="map-avatar-pin">
                {activeStudent!.avatarImage ? <span className="avatar-image" style={{ backgroundImage: `url(${activeStudent!.avatarImage})` }} /> : activeStudent!.avatar.slice(0, 1)}
              </span>
            </div>
          </div>
        </section>

        <section className="parent-location-track-card">
          <div className="parent-section-head">
            <strong><FieldTimeOutlined /> 24小时轨迹</strong>
            <Segmented
              size="small"
              value={trackRange}
              onChange={(value) => setTrackRange(value as 'today' | 'recent')}
              options={[
                { label: '今日', value: 'today' },
                { label: '近24小时', value: 'recent' },
              ]}
            />
          </div>
          <p>图形方式展示学员24小时内的行动轨迹</p>
          <div className="parent-location-route-map">
            <svg viewBox="0 0 100 64" aria-hidden>
              <path className="route-shadow" d="M8 36 C22 46 34 25 48 36 S74 43 92 30" />
              <path className="route-main" d="M8 36 C22 46 34 25 48 36 S74 43 92 30" />
              {tracks.map((track) => (
                <g key={track.id}>
                  <circle className={`route-node ${track.type}`} cx={track.x} cy={track.y - 20} r="3.2" />
                  <text x={track.x} y={track.y - 27}>{track.time}</text>
                </g>
              ))}
            </svg>
            <div className="parent-location-map-legend">
              {tracks.map((track) => (
                <span key={track.id}><i className={track.type} /> {getTrackTypeLabel(track.type)}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="parent-location-timeline-card">
          <div className="parent-section-head">
            <strong><CompassOutlined /> 轨迹时间线</strong>
            <span>{tracks.length} 条</span>
          </div>
          <div className="parent-location-timeline">
            {tracks.map((track) => (
              <div key={track.id} className={track.id === currentTrack?.id ? 'current' : ''}>
                <span className="dot" />
                <time>{track.time}</time>
                <div>
                  <strong>{track.title}</strong>
                  <em>{track.address}</em>
                </div>
                <b>{track.stayDuration}</b>
              </div>
            ))}
          </div>
        </section>

        <p className="parent-location-security">数据加密传输｜定位数据仅用于孩子安全守护</p>
      </div>
    );
  }

  return (
    <ParentPhoneFrame>
      {contextHolder}
      <ParentSubpageShell title={config.title} subtitle="设备管理" onBack={() => router.push(backUrl)} rightSlot={<Button aria-label="我的" shape="circle" icon={<UserOutlined />} onClick={() => router.push('/me')} />}>
        <div className="parent-card-list parent-device-feature-page">
          {pendingConfirm && pendingConfirm.title !== '解绑支付宝亲密付' && pendingConfirm.title !== '解绑百度网盘' ? renderConfirmPanel() : null}
          {feature === 'payment-card' ? renderPaymentCard() : null}
          {feature === 'netdisk' ? renderNetDisk() : null}
          {feature === 'contacts' ? renderContacts() : null}
          {feature === 'quiet-times' ? renderQuietTimes() : null}
          {feature === 'location' ? renderLocation() : null}
        </div>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}

export function ParentDeviceScanScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const studentId = searchParams.get('studentId');
  const [bindingDevice, setBindingDevice] = useState<DemoScanDevice | null>(null);
  const [successDevice, setSuccessDevice] = useState<DemoScanDevice | null>(null);
  const [confirmDevice, setConfirmDevice] = useState<DemoScanDevice | null>(null);
  const [selectedMode, setSelectedMode] = useState<'sale' | 'rental'>('sale');

  const student = useMemo(
    () => (studentId ? store.state.students.find((item) => item.id === studentId) ?? null : store.selectedStudent),
    [store.selectedStudent, store.state.students, studentId],
  );

  useEffect(() => {
    if (!bindingDevice || !student) {
      return;
    }

    const timer = window.setTimeout(() => {
      store.bindDevice(student.id, { deviceCode: bindingDevice.deviceCode, mode: selectedMode });
      setSuccessDevice(bindingDevice);
      setBindingDevice(null);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [bindingDevice, selectedMode, store, student]);

  function startScan(device: DemoScanDevice) {
    if (student?.device) {
      setConfirmDevice(device);
      return;
    }
    setSelectedMode(device.mode);
    setBindingDevice(device);
  }

  function confirmReplace() {
    if (!confirmDevice) {
      return;
    }
    setSelectedMode(confirmDevice.mode);
    setBindingDevice(confirmDevice);
    setConfirmDevice(null);
  }

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在打开扫码绑定" />;
  }

  if (!student) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell
          title="扫码绑定"
          subtitle="设备管理"
          onBack={() => router.push('/device')}
          rightSlot={<Button aria-label="我的" shape="circle" icon={<UserOutlined />} onClick={() => router.push('/me')} />}
        >
          <section className="parent-empty-guide">
            <Empty description="请先选择学员" />
            <Button type="primary" onClick={() => router.push('/me/students')}>
              去学员管理
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  if (successDevice) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell
          title="绑定成功"
          subtitle="设备管理"
          onBack={() => router.push(`/device?studentId=${student.id}`)}
          rightSlot={<Button aria-label="我的" shape="circle" icon={<UserOutlined />} onClick={() => router.push('/me')} />}
          footer={
            <div className="parent-split-footer">
              <Button block onClick={() => router.push(`/me/students/account?studentId=${student.id}`)}>
                查看账号
              </Button>
              <Button block type="primary" onClick={() => router.push(`/device?studentId=${student.id}`)}>
                完成
              </Button>
            </div>
          }
        >
          <section className="parent-success-panel">
            <CheckCircleOutlined />
            <strong>设备绑定成功</strong>
            <span>{student.name} 的学员账号已经激活，可以开始接收家庭研学任务。</span>
          </section>

          <section className="parent-account-card">
            <div className="parent-account-grid">
              <span>
                设备名称
                <strong>{successDevice.name}</strong>
              </span>
              <span>
                设备码
                <strong>{successDevice.deviceCode}</strong>
              </span>
              <span>
                设备型号
                <strong>{successDevice.model}</strong>
              </span>
              <span>
                序列号
                <strong>{successDevice.serialNumber}</strong>
              </span>
              <span>
                绑定学员
                <strong>{student.name}</strong>
              </span>
              <span>
                工作模式
                <strong>{selectedMode === 'sale' ? '销售模式' : '租赁模式'}</strong>
              </span>
              <span>
                最近在线
                <strong>{formatDateTime(successDevice.lastOnlineAt)}</strong>
              </span>
              <span>
                剩余电量
                <strong>{successDevice.batteryPercent}%</strong>
              </span>
            </div>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="扫码绑定"
        subtitle="设备管理"
        onBack={() => router.push(`/device?studentId=${student.id}`)}
        rightSlot={<Button aria-label="我的" shape="circle" icon={<UserOutlined />} onClick={() => router.push('/me')} />}
      >
        {bindingDevice ? (
          <section className="parent-scan-working">
            <Spin />
            <strong>正在绑定设备</strong>
            <p>
              正在把 {bindingDevice.deviceCode} 绑定到 {student.name}，请稍候。
            </p>
          </section>
        ) : (
          <div className="parent-card-list">
            <section className="parent-editor-intro">
              <strong>扫描学员设备二维码</strong>
              <span>这一步是演示扫码流程。点击下方演示二维码卡片，就会模拟扫码并完成绑定。</span>
            </section>

            <section className="parent-scan-panel">
              <div className="parent-scan-frame">
                <div className="parent-scan-corners" />
                <div className="parent-scan-line" />
              </div>
              <div className="parent-mode-pills">
                <Radio.Group value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
                  <Radio.Button value="sale">销售模式</Radio.Button>
                  <Radio.Button value="rental">租赁模式</Radio.Button>
                </Radio.Group>
              </div>
              {student.device ? (
                <div className="parent-inline-warning">
                  当前已绑定 {student.device.deviceCode}，继续扫码会替换旧设备。
                </div>
              ) : null}
            </section>

            <section className="parent-section">
              <div className="parent-section-head">
                <strong>演示二维码设备池</strong>
                <span>{store.state.scanDevices.length} 台</span>
              </div>
              <div className="parent-demo-device-list">
                {store.state.scanDevices.map((device) => (
                  <button key={device.id} type="button" className="parent-demo-device-card" onClick={() => startScan(device)}>
                    <div className="parent-demo-qr" aria-hidden>
                      <span />
                    </div>
                    <div>
                      <strong>{device.deviceCode}</strong>
                      <span>
                        {device.model} · 电量 {device.batteryPercent}%
                      </span>
                      <em>最近在线 {formatDateTime(device.lastOnlineAt)}</em>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        <Drawer
          title="替换当前设备"
          open={Boolean(confirmDevice)}
          onClose={() => setConfirmDevice(null)}
          placement="bottom"
          height={252}
          getContainer={false}
          rootClassName="parent-detail-drawer"
        >
          {confirmDevice ? (
            <div className="parent-detail-stack">
              <p>
                {student.name} 当前已经绑定 {student.device?.deviceCode}。继续后会替换为 {confirmDevice.deviceCode}。
              </p>
              <div className="parent-split-footer">
                <Button block onClick={() => setConfirmDevice(null)}>
                  取消
                </Button>
                <Button block type="primary" onClick={confirmReplace}>
                  确认替换
                </Button>
              </div>
            </div>
          ) : null}
        </Drawer>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
