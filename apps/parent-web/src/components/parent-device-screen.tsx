'use client';

import '@ant-design/v5-patch-for-react-19';
import {
  CheckCircleOutlined,
  CompassOutlined,
  CreditCardOutlined,
  MobileOutlined,
  PlusOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Empty, Form, Input, Radio, Spin, Switch, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { useParentStore, type DemoScanDevice, type ParentStudent } from '../lib/parent-store';

function formatDateTime(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
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

export function ParentDeviceManagementScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const studentId = searchParams.get('studentId');
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const activeStudent = useMemo(() => {
    if (studentId) {
      return store.state.students.find((student) => student.id === studentId) ?? null;
    }
    return store.selectedStudent ?? store.state.students[0] ?? null;
  }, [searchParams, store.selectedStudent, store.state.students, studentId]);

  function openScanner(student: ParentStudent) {
    router.push(`/me/device/scan?studentId=${student.id}`);
  }

  function goToSelf(nextStudentId: string) {
    router.push(`/me/device?studentId=${nextStudentId}`);
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
      <ParentSubpageShell
        title="设备管理"
        subtitle="我的"
        onBack={() => router.push('/me')}
        rightSlot={<Button aria-label="扫码绑定" shape="circle" icon={<PlusOutlined />} onClick={() => openScanner(activeStudent)} />}
      >
        <div className="parent-card-list">
          <section className="parent-editor-intro">
            <strong>管理学员与设备绑定</strong>
            <span>每位学员只能绑定 1 台研学宝。更换设备时，会自动替换旧设备信息。</span>
          </section>

          <DeviceStudentTabs students={store.state.students} activeStudentId={activeStudent.id} onChange={goToSelf} />

          <section className="parent-section">
            <div className="parent-section-head">
              <strong>{activeStudent.name} 的设备</strong>
              <Button size="small" type="primary" icon={<MobileOutlined />} onClick={() => openScanner(activeStudent)}>
                {device ? '更换设备' : '扫码绑定'}
              </Button>
            </div>
            {device ? (
              <div className="parent-device-card rich">
                <MobileOutlined />
                <div>
                  <strong>{device.name}</strong>
                  <span>
                    {device.deviceCode} · {device.model}
                  </span>
                  <em>序列号 {device.serialNumber}</em>
                </div>
                <div className="parent-device-chip-list">
                  <Tag color="green">电量 {device.batteryPercent}%</Tag>
                  <Tag>{device.mode === 'sale' ? '销售模式' : '租赁模式'}</Tag>
                </div>
              </div>
            ) : (
              <section className="parent-empty-guide compact">
                <MobileOutlined />
                <strong>这位学员还没有绑定设备</strong>
                <p>扫码后会自动激活学员账号并同步设备信息。</p>
                <Button type="primary" onClick={() => openScanner(activeStudent)}>
                  立即扫码绑定
                </Button>
              </section>
            )}
          </section>

          {device ? (
            <>
              <section className="parent-section">
                <div className="parent-section-head">
                  <strong>支付卡与网盘</strong>
                  <CreditCardOutlined />
                </div>
                <Form
                  key={`payment-${activeStudent.id}-${device.paymentCard?.account ?? 'empty'}`}
                  initialValues={{ account: device.paymentCard?.account ?? '' }}
                  onFinish={(values: { account: string }) => store.savePaymentCard(activeStudent.id, values.account)}
                  className="parent-inline-form"
                >
                  <Form.Item name="account">
                    <Input placeholder="支付宝亲子卡账号" />
                  </Form.Item>
                  <Button htmlType="submit">保存</Button>
                </Form>
                <Form
                  key={`netdisk-${activeStudent.id}-${device.netDisk?.account ?? 'empty'}`}
                  initialValues={{ account: device.netDisk?.account ?? '' }}
                  onFinish={(values: { account: string }) => store.saveNetDisk(activeStudent.id, values.account)}
                  className="parent-inline-form"
                >
                  <Form.Item name="account">
                    <Input placeholder="百度网盘账号" />
                  </Form.Item>
                  <Button htmlType="submit">绑定</Button>
                </Form>
                {device.paymentCard ? (
                  <p className="parent-device-note">
                    余额 {device.paymentCard.balance.toFixed(2)} 元 · 消费记录 {device.paymentCard.records.length} 条
                  </p>
                ) : null}
                <div className="parent-compact-list">
                  {(device.paymentCard?.records ?? []).slice(0, 3).map((record) => (
                    <div key={record.id}>
                      <span>{record.title}</span>
                      <em>
                        {record.amount > 0 ? '+' : ''}
                        {record.amount} 元
                      </em>
                    </div>
                  ))}
                </div>
              </section>

              <section className="parent-section">
                <div className="parent-section-head">
                  <strong>通讯录管理</strong>
                  <TeamOutlined />
                </div>
                <Form onFinish={(values: { name: string; relation: string; phone: string }) => store.addContact(activeStudent.id, values)} className="parent-contact-form">
                  <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="姓名" />
                  </Form.Item>
                  <Form.Item name="relation" rules={[{ required: true, message: '请输入关系' }]}>
                    <Input placeholder="关系" />
                  </Form.Item>
                  <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
                    <Input placeholder="手机号" />
                  </Form.Item>
                  <Button htmlType="submit" icon={<PlusOutlined />}>
                    添加联系人
                  </Button>
                </Form>
                <div className="parent-compact-list">
                  {device.contacts.map((contact) => (
                    <div key={contact.id}>
                      <span>
                        {contact.name} · {contact.relation}
                      </span>
                      <em>{contact.phone}</em>
                    </div>
                  ))}
                </div>
              </section>

              <section className="parent-section">
                <div className="parent-section-head">
                  <strong>停用时间</strong>
                  <CompassOutlined />
                </div>
                <div className="parent-compact-list">
                  {device.quietTimes.map((item) => (
                    <div key={item.id}>
                      <span>
                        {item.label} · {item.start}-次日{item.end} · {item.weekdays.map((day) => weekdayNames[day]).join(' ')}
                      </span>
                      <Switch size="small" checked={item.enabled} onChange={() => store.toggleQuietTime(activeStudent.id, item.id)} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="parent-section">
                <div className="parent-section-head">
                  <strong>24 小时轨迹</strong>
                  <span>{device.tracks.length} 个位置</span>
                </div>
                <div className="parent-location-card">
                  <strong>{device.latestLocation?.address ?? '暂无位置'}</strong>
                  <span>最后接收 {formatDateTime(device.latestLocation?.receivedAt ?? device.lastOnlineAt)}</span>
                </div>
                <div className="parent-track-list">
                  {device.tracks.map((track) => (
                    <div key={track.id}>
                      <span>{track.time}</span>
                      <strong>{track.address}</strong>
                      <em>距离导师 {track.distanceMeters} 米</em>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}

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
            <div className="parent-compact-list order-list">
              {store.state.orders.length ? (
                store.state.orders.map((order) => (
                  <div key={order.id}>
                    <span>{order.title}</span>
                    <em>
                      {order.status} · {order.amount} 元
                    </em>
                  </div>
                ))
              ) : (
                <div>
                  <span>暂无演示订单</span>
                  <em>点击上方按钮创建</em>
                </div>
              )}
            </div>
          </section>
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
        <ParentSubpageShell title="扫码绑定" subtitle="设备管理" onBack={() => router.push('/me/device')}>
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
          onBack={() => router.push(`/me/device?studentId=${student.id}`)}
          footer={
            <div className="parent-split-footer">
              <Button block onClick={() => router.push(`/me/students/account?studentId=${student.id}`)}>
                查看账号
              </Button>
              <Button block type="primary" onClick={() => router.push(`/me/device?studentId=${student.id}`)}>
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
      <ParentSubpageShell title="扫码绑定" subtitle="设备管理" onBack={() => router.push(`/me/device?studentId=${student.id}`)}>
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
