'use client';

import {
  AuditOutlined,
  DatabaseOutlined,
  EyeOutlined,
  LineChartOutlined,
  OrderedListOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Descriptions, Divider, Drawer, Empty, Form, Input, InputNumber, List, Modal, QRCode, Row, Segmented, Select, Space, Statistic, Steps, Table, Tabs, Tag, Timeline, Typography, Upload } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredSession } from '../lib/admin-auth';
import type {
  AdminRole,
} from '../lib/admin-auth';
import type {
  AuditRecord,
  CapabilityMapping,
  DemoRole,
  Mentor,
  Organization,
  OperationDailyRecord,
  OperationLog,
  PaymentRecord,
  PhotoRecognitionStatus,
  RentalOrderStatus,
  StudentProfile,
  StudyBase,
  TaskAttachment,
  TaskBuilderTemplate,
  TaskLibraryItem,
  Team,
  TeamTask,
  TeamTaskWork,
  WorkRequirement,
} from '../lib/admin-store';
import { useAdminStore } from '../lib/admin-store';
import { exportAuditPerformance, exportInventory, exportMentors, exportOrganizations, exportStudentCapabilitySummary, exportStudentReport, exportStudents } from '../lib/exporters';
import type { CityPageKey, OperatorPageKey } from '../lib/navigation';

const { Title, Paragraph, Text } = Typography;

function statusColor(status: string) {
  if (status.includes('退回') || status.includes('停用') || status.includes('下架') || status.includes('未处理')) return 'error';
  if (status.includes('已') || status === '启用' || status === '上架') return 'success';
  if (status.includes('待') || status.includes('录入') || status.includes('审核')) return 'warning';
  return 'processing';
}

function SectionHeader(props: { title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ margin: 0 }}>
            {props.title}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            {props.subtitle}
          </Paragraph>
        </Space>
        {props.actions}
      </Space>
    </Space>
  );
}

const demoRoleLabels: Record<DemoRole, string> = {
  operator: '运营总控',
  sales: '销售人员',
  finance: '财务人员',
  warehouse: '库管人员',
};

function canUse(demoRole: DemoRole, roles: DemoRole[]) {
  return demoRole === 'operator' || roles.includes(demoRole);
}

function RolePermissionBanner({ demoRole, roles, scene }: { demoRole: DemoRole; roles: DemoRole[]; scene: string }) {
  const allowed = canUse(demoRole, roles);
  return (
    <Alert
      showIcon
      type={allowed ? 'info' : 'warning'}
      message={`${scene}：当前为 ${demoRoleLabels[demoRole]} 视图`}
      description={allowed ? '该岗位可执行当前页面的核心操作，操作会写入对应角色日志。' : `当前岗位仅可查看，需切换到 ${roles.map((role) => demoRoleLabels[role]).join('、')} 才能操作。`}
    />
  );
}

function UploadMockModal(props: {
  open: boolean;
  title: string;
  accept?: string;
  description: string;
  resultName: string;
  onCancel: () => void;
  onConfirm: (fileName: string) => void;
}) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [result, setResult] = useState<{ batchNo: string; successCount: number; failedCount: number; failedFields: string[] } | null>(null);

  useEffect(() => {
    if (!props.open) {
      setFileList([]);
      setResult(null);
    }
  }, [props.open]);

  const fileName = fileList[0]?.name as string | undefined;

  return (
    <Modal
      open={props.open}
      title={props.title}
      onCancel={props.onCancel}
      footer={result ? [
        <Button key="done" type="primary" onClick={props.onCancel}>完成</Button>,
      ] : [
        <Button key="cancel" onClick={props.onCancel}>取消</Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={!fileName}
          onClick={() => {
            const batchNo = `${props.resultName}-${Date.now().toString().slice(-6)}`;
            props.onConfirm(fileName ?? '演示文件.xlsx');
            setResult({ batchNo, successCount: 12, failedCount: 1, failedFields: ['设备ID', '金额', '手机号'].slice(0, props.accept?.includes('image') ? 0 : 2) });
          }}
        >
          确认上传
        </Button>,
      ]}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Text type="secondary">{props.description}</Text>
        <Upload
          accept={props.accept}
          maxCount={1}
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        {result ? (
          <Alert
            showIcon
            type="success"
            message="模拟解析完成"
            description={`批次号：${result.batchNo}；成功 ${result.successCount} 条；失败 ${result.failedCount} 条${result.failedFields.length ? `；失败字段：${result.failedFields.join('、')}` : ''}`}
          />
        ) : null}
      </Space>
    </Modal>
  );
}

type FilterValue = string | number | boolean | string[] | undefined | null;

type FilterField<T> = {
  name: string;
  label: string;
  type?: 'input' | 'select';
  placeholder?: string;
  span?: number;
  options?: { label: string; value: string | number | boolean }[];
  match: (record: T, value: FilterValue) => boolean;
};

function hasFilterValue(value: FilterValue) {
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
}

function toText(value: unknown) {
  return String(value ?? '').toLowerCase();
}

function textMatcher<T>(...getters: Array<(record: T) => unknown>) {
  return (record: T, value: FilterValue) => {
    if (!hasFilterValue(value)) return true;
    const keyword = toText(value);
    return getters.some((getter) => toText(getter(record)).includes(keyword));
  };
}

function equalsMatcher<T>(getter: (record: T) => unknown) {
  return (record: T, value: FilterValue) => {
    if (!hasFilterValue(value)) return true;
    return getter(record) === value;
  };
}

function arrayIncludesMatcher<T>(getter: (record: T) => unknown[]) {
  return (record: T, value: FilterValue) => {
    if (!hasFilterValue(value)) return true;
    return getter(record).map(String).includes(String(value));
  };
}

function numberBucketMatcher<T>(getter: (record: T) => number, ranges: Record<string, (value: number) => boolean>) {
  return (record: T, value: FilterValue) => {
    if (!hasFilterValue(value)) return true;
    const matcher = ranges[String(value)];
    return matcher ? matcher(getter(record)) : true;
  };
}

function makeOptions(values: Array<string | number | boolean | undefined | null>) {
  return Array.from(new Set(values.filter((value): value is string | number | boolean => value !== undefined && value !== null && value !== ''))).map((value) => ({
    label: String(value),
    value,
  }));
}

function cleanFilters(values: Record<string, FilterValue>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => hasFilterValue(value)));
}

function useListFilters<T>(records: T[], fields: FilterField<T>[], actions?: React.ReactNode) {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const fieldsRef = useRef(fields);
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    const nextFilters: Record<string, FilterValue> = {};
    fieldsRef.current.forEach((field) => {
      const value = searchParams.get(field.name);
      if (value !== null) {
        nextFilters[field.name] = value;
      }
    });
    if (Object.keys(nextFilters).length > 0) {
      form.setFieldsValue(nextFilters);
      setFilters(nextFilters);
    }
  }, [form, queryKey, searchParams]);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) =>
        fields.every((field) => field.match(record, filters[field.name])),
      ),
    [fields, filters, records],
  );

  const toolbar = (
    <Card className="list-toolbar" variant="borderless">
      <Form form={form} layout="vertical" onFinish={(values) => setFilters(cleanFilters(values))}>
        <Row gutter={[16, 12]}>
          {fields.map((field) => (
            <Col key={field.name} span={field.span ?? 6}>
              <Form.Item label={field.label} name={field.name}>
                {field.type === 'select' ? (
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={field.options ?? []}
                    placeholder={field.placeholder ?? '请选择'}
                  />
                ) : (
                  <Input allowClear placeholder={field.placeholder ?? '请输入'} />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>
        <div className="list-toolbar-footer">
          <Space wrap>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                form.resetFields();
                setFilters({});
              }}
            >
              重置
            </Button>
          </Space>
          {actions ? <Space wrap>{actions}</Space> : null}
        </div>
      </Form>
    </Card>
  );

  return { filteredRecords, toolbar };
}

function abilitySummary(student: StudentProfile) {
  return Object.entries(student.capabilityPlaneScores)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, value }));
}

function studentElementScores(student: StudentProfile, elements: Array<{ id: string; plane: string; indicator?: string; name: string }>) {
  return elements.map((item, index) => {
    const base = student.capabilityPlaneScores[item.plane] ?? student.capabilityScore;
    const drift = (((index + student.name.length) % 9) - 4) / 10;
    return {
      ...item,
      score: Number(Math.max(5.8, Math.min(9.8, base + drift)).toFixed(1)),
      average: Number(Math.max(5.6, Math.min(9.4, base - 0.3 + ((index % 5) / 10))).toFixed(1)),
    };
  });
}

function polarPoint(index: number, total: number, radius: number, ratio: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(total, 1);
  return {
    x: 80 + Math.cos(angle) * radius * ratio,
    y: 80 + Math.sin(angle) * radius * ratio,
  };
}

function buildRadarPolygon(values: number[]) {
  return values
    .map((value, index) => {
      const point = polarPoint(index, values.length, 56, Math.max(0, Math.min(1, value / 10)));
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

function RadarPanel({ title, rows }: { title: string; rows: Array<{ name: string; score: number; average: number }> }) {
  const values = rows.map((item) => item.score);
  const averages = rows.map((item) => item.average);
  return (
    <Card size="small" title={title}>
      <div className="admin-radar">
        <svg viewBox="0 0 160 160" aria-label={title}>
          {[0.25, 0.5, 0.75, 1].map((ring) => (
            <polygon
              key={ring}
              points={rows.map((_, index) => {
                const point = polarPoint(index, rows.length, 56, ring);
                return `${point.x},${point.y}`;
              }).join(' ')}
              className="admin-radar-ring"
            />
          ))}
          {rows.map((item, index) => {
            const point = polarPoint(index, rows.length, 68, 1);
            return (
              <text key={item.name} x={point.x} y={point.y} className="admin-radar-label">
                {item.name}
              </text>
            );
          })}
          <polygon points={buildRadarPolygon(averages)} className="admin-radar-compare" />
          <polygon points={buildRadarPolygon(values)} className="admin-radar-primary" />
        </svg>
        <Space size={12} className="admin-radar-legend">
          <span><i className="primary" />学员指数</span>
          <span><i className="compare" />同龄平均</span>
        </Space>
      </div>
    </Card>
  );
}

function useCityScope() {
  const session = getStoredSession();
  return {
    session,
    editorId: session?.user.id ?? 'maintainer-001',
    cityIds: session?.user.cityIds ?? [],
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-section-title">
      <Text strong>{children}</Text>
    </div>
  );
}

function MetricTile({ title, value, yesterday, prefix }: { title: string; value: number; yesterday: string; prefix?: string }) {
  return (
    <Card className="ops-metric-card" variant="borderless">
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text type="secondary">{title}</Text>
          <Tag color="blue">今日</Tag>
        </Space>
        <Statistic prefix={prefix} value={value} precision={prefix ? 2 : 0} />
        <Divider style={{ margin: '4px 0 0' }} />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text type="secondary">昨日数据</Text>
          <Text>{yesterday}</Text>
        </Space>
      </Space>
    </Card>
  );
}

function QuickEntry(props: { title: string; value?: number; icon: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button className="quick-entry" type="button" onClick={props.onClick}>
      <span className="quick-entry-icon" style={{ background: props.color }}>
        {props.icon}
      </span>
      <Text>{props.title}</Text>
      {typeof props.value === 'number' ? <Tag color={props.value > 0 ? 'warning' : 'default'}>{props.value}</Tag> : null}
    </button>
  );
}

function ComboChart({
  data,
  barKey,
  lineKey,
  lineAsPercent,
}: {
  data: OperationDailyRecord[];
  barKey: keyof OperationDailyRecord;
  lineKey?: keyof OperationDailyRecord;
  lineAsPercent?: boolean;
}) {
  const width = 720;
  const height = 260;
  const padding = 34;
  const values = data.map((item) => Number(item[barKey] ?? 0));
  const max = Math.max(...values, 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const lineValues = lineKey ? data.map((item) => Number(item[lineKey] ?? 0)) : [];
  const lineMax = Math.max(...lineValues, 1);
  const linePoints = lineValues
    .map((value, index) => {
      const x = padding + index * step;
      const y = height - padding - (value / lineMax) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="ops-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="运营趋势图">
        {[0, 1, 2, 3, 4].map((line) => {
          const y = padding + line * ((height - padding * 2) / 4);
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5eaf3" strokeWidth="1" />;
        })}
        {data.map((item, index) => {
          const barWidth = Math.max(18, (width - padding * 2) / Math.max(data.length * 1.8, 1));
          const x = padding + index * step - barWidth / 2;
          const barHeight = (Number(item[barKey] ?? 0) / max) * (height - padding * 2);
          const y = height - padding - barHeight;
          return (
            <g key={item.id}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#5470c6" rx="2" />
              <text x={padding + index * step} y={height - 10} textAnchor="middle" fill="#7b8494" fontSize="11">
                {item.date.slice(5)}
              </text>
            </g>
          );
        })}
        {lineKey ? <polyline fill="none" stroke="#91cc75" strokeWidth="3" points={linePoints} /> : null}
        {lineKey
          ? lineValues.map((value, index) => {
              const x = padding + index * step;
              const y = height - padding - (value / lineMax) * (height - padding * 2);
              return (
                <g key={`${data[index].id}-line`}>
                  <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#91cc75" strokeWidth="2" />
                  <text x={x} y={Math.max(16, y - 8)} textAnchor="middle" fill="#4b5563" fontSize="11">
                    {lineAsPercent ? `${value}%` : value}
                  </text>
                </g>
              );
            })
          : null}
      </svg>
    </div>
  );
}

function FunnelChart({ funnel }: { funnel: { visitors: number; orders: number; customers: number } }) {
  const rows = [
    { label: '访客', value: funnel.visitors, width: '78%', color: '#3b82f6' },
    { label: '下单', value: funnel.orders, width: '54%', color: '#13b8c8' },
    { label: '成交用户', value: funnel.customers, width: '34%', color: '#64748b' },
  ];
  return (
    <div className="funnel-chart">
      {rows.map((item) => (
        <div key={item.label} className="funnel-row" style={{ width: item.width, background: item.color }}>
          <Text>{item.value}</Text>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function TerminalChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {data.map((item) => (
        <div className="terminal-row" key={item.label}>
          <Space style={{ width: 96, justifyContent: 'space-between' }}>
            <Text>{item.label}</Text>
            <Text type="secondary">{item.value}%</Text>
          </Space>
          <div className="terminal-track">
            <div className="terminal-fill" style={{ width: `${item.value}%`, background: item.color }} />
          </div>
        </div>
      ))}
    </Space>
  );
}

function DashboardPage() {
  const { selectors } = useAdminStore();
  const router = useRouter();
  const dashboard = selectors.dashboard;
  const metrics = [
    { title: '学员总数', value: dashboard.studentCount, yesterday: String(Math.max(dashboard.studentCount - 1, 0)) },
    { title: '家长总数', value: dashboard.parentCount, yesterday: String(Math.max(dashboard.parentCount - 1, 0)) },
    { title: '导师数量', value: dashboard.mentorCount, yesterday: String(dashboard.mentorCount) },
    { title: '设备总数', value: dashboard.totalDevices, yesterday: String(dashboard.totalDevices) },
    { title: '在线设备数', value: dashboard.onlineDevices, yesterday: String(Math.max(dashboard.onlineDevices - 1, 0)) },
    { title: '任务完成数', value: dashboard.finishedTasks, yesterday: String(dashboard.finishedTasks) },
    { title: '研学团队量', value: dashboard.teamCount, yesterday: String(dashboard.teamCount) },
    { title: '研学基地数', value: dashboard.baseCount, yesterday: String(dashboard.baseCount) },
    { title: '任务库数量', value: dashboard.taskLibraryCount, yesterday: String(dashboard.taskLibraryCount) },
    { title: '合作机构数', value: dashboard.organizationCount, yesterday: String(dashboard.organizationCount) },
  ];
  const quickEntries = [
    { title: '线路管理', icon: <LineChartOutlined />, color: '#fa6b73', href: '/task-library' },
    { title: '团队销售', icon: <TeamOutlined />, color: '#ff9f2f', href: '/team-assignments' },
    { title: '订单管理', icon: <OrderedListOutlined />, color: '#f7bf1b', href: '/sales-online' },
    { title: '团体订单', icon: <DatabaseOutlined />, color: '#18a957', href: '/rental-orders' },
    { title: '线路审核', icon: <AuditOutlined />, color: '#12b6cb', href: '/audits?targetType=任务&status=待审核' },
    { title: '达人审核', icon: <TeamOutlined />, color: '#4b7ff3', href: '/agents?onlineStatus=审核中' },
    { title: '提现审核', icon: <WalletOutlined />, color: '#a855f7', href: '/sales-enterprise' },
    { title: '达人用户', icon: <UserOutlined />, color: '#f43f5e', href: '/part-timers' },
  ];
  const today = dashboard.dailyRecords[dashboard.dailyRecords.length - 1];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="经营看板" subtitle="汇总经营、订单、用户与内容运营数据，快速进入待处理事项。" />

      <Row gutter={[12, 12]}>
        {metrics.map((metric) => (
          <Col xs={24} md={12} xl={6} xxl={4} key={metric.title}>
            <MetricTile {...metric} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card variant="borderless" className="ops-panel" title={<SectionTitle>快捷入口</SectionTitle>}>
            <div className="quick-entry-grid">
              {quickEntries.map((item) => (
                <QuickEntry key={item.title} title={item.title} icon={item.icon} color={item.color} onClick={() => router.push(item.href)} />
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card variant="borderless" className="ops-panel" title={<SectionTitle>运营数据</SectionTitle>}>
            <div className="ops-data-grid">
              {dashboard.operationStats.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ops-data-item"
                  onClick={() => {
                    const todo = dashboard.pendingTodos.find((entry) => item.label.includes(entry.title.replace('待', '').replace('审核', '')));
                    router.push(todo?.href ?? '/dashboard');
                  }}
                >
                  <Text className="ops-data-value">{item.value}</Text>
                  <Text type="secondary">{item.label}</Text>
                </button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="ops-panel" title={<SectionTitle>待办事项</SectionTitle>}>
        <Row gutter={[12, 12]}>
          {dashboard.pendingTodos.map((item) => (
            <Col xs={24} sm={12} md={8} xl={6} key={item.key}>
              <button className="todo-entry" type="button" onClick={() => router.push(item.href)}>
                <Text>{item.title}</Text>
                <Text strong>{item.value}</Text>
              </button>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={18}>
          <Card
            variant="borderless"
            className="ops-panel"
            title={<SectionTitle>会员概览</SectionTitle>}
            extra={<Segmented size="small" defaultValue="最近7天" options={['昨天', '最近7天', '最近30天']} />}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={10}>
                <div className="member-overview">
                  <div><Text strong>总用户数量：</Text><Text>{dashboard.studentCount + dashboard.parentCount + 3700}</Text></div>
                  <div><Text strong>注册用户数量：</Text><Text>{today?.registrations ?? 0}</Text></div>
                  <div><Text strong>活跃用户数量：</Text><Text>{dashboard.todayActiveStudents}</Text></div>
                  <div><Text>活跃用户率：</Text><Text>{((dashboard.todayActiveStudents / Math.max(dashboard.studentCount + dashboard.parentCount, 1)) * 100).toFixed(2)}%</Text></div>
                  <div><Text strong>有效用户数量：</Text><Text>{dashboard.funnel.customers}</Text></div>
                  <div><Text>客单价：</Text><Text>{today ? (today.orderAmount / Math.max(today.orderCount, 1)).toFixed(2) : '0.00'}</Text></div>
                  <div><Text>留存率：</Text><Text>10000%</Text></div>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <FunnelChart funnel={dashboard.funnel} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card variant="borderless" className="ops-panel" title={<SectionTitle>会员终端</SectionTitle>}>
            <TerminalChart data={dashboard.terminalStats} />
          </Card>
        </Col>
      </Row>

      <Card
        variant="borderless"
        className="ops-panel"
        title={<SectionTitle>用户访问统计</SectionTitle>}
        extra={<Segmented size="small" defaultValue="最近7天" options={['昨天', '最近7天', '最近30天']} />}
      >
        <div className="chart-legend">
          <span className="legend-bar" />访客数
          <span className="legend-line" />访客占比
        </div>
        <ComboChart data={dashboard.dailyRecords} barKey="uniqueVisitors" lineKey="visitorRatio" lineAsPercent />
      </Card>

      <Card variant="borderless" className="ops-panel" title={<SectionTitle>访问量明细记录</SectionTitle>} extra={<Segmented size="small" defaultValue="按日" options={['按日', '按月']} />}>
        <Table<OperationDailyRecord>
          rowKey="id"
          dataSource={dashboard.dailyRecords}
          pagination={{ pageSize: 6 }}
          columns={[
            { title: '日期', dataIndex: 'date' },
            { title: '浏览量(pv)', dataIndex: 'pageViews', sorter: (a, b) => a.pageViews - b.pageViews },
            { title: '访客数(uv)', dataIndex: 'uniqueVisitors', sorter: (a, b) => a.uniqueVisitors - b.uniqueVisitors },
            { title: '新注册用户数', dataIndex: 'registrations', sorter: (a, b) => a.registrations - b.registrations },
          ]}
        />
      </Card>

      <Card variant="borderless" className="ops-panel" title={<SectionTitle>交易量趋势</SectionTitle>} extra={<Segmented size="small" defaultValue="30天" options={['30天', '周', '月', '年']} />}>
        <div className="chart-legend">
          <span className="legend-bar" />订单金额
          <span className="legend-line" />订单数量
        </div>
        <ComboChart data={dashboard.dailyRecords} barKey="orderAmount" lineKey="orderCount" />
      </Card>

      <Card variant="borderless" className="ops-panel" title={<SectionTitle>用户统计</SectionTitle>}>
        <div className="chart-legend">
          <span className="legend-line" />注册量
        </div>
        <ComboChart data={dashboard.dailyRecords} barKey="registrations" lineKey="registrations" />
      </Card>

      <Card variant="borderless" className="ops-panel" title={<SectionTitle>每日经营明细</SectionTitle>}>
        <Table<OperationDailyRecord>
          rowKey="id"
          dataSource={dashboard.dailyRecords}
          pagination={false}
          columns={[
            { title: '日期', dataIndex: 'date' },
            { title: '新增学员数', dataIndex: 'newStudents' },
            { title: '新增家长数', dataIndex: 'newParents' },
            { title: '租赁设备数', dataIndex: 'rentalDevices' },
            { title: '销售设备数', dataIndex: 'soldDevices' },
            { title: '销售金额', dataIndex: 'saleAmount', render: (value: number) => `￥${value.toFixed(2)}` },
            { title: '课程订单数', dataIndex: 'courseOrders' },
            { title: '课程金额', dataIndex: 'courseAmount', render: (value: number) => `￥${value.toFixed(2)}` },
          ]}
        />
      </Card>
    </Space>
  );
}

function OrganizationsPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Organization | null>(null);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [form] = Form.useForm();

  function openEditor(record?: Organization) {
    setEditing(record ?? null);
    setOpen(true);
    form.setFieldsValue(record ?? { type: '学校' });
  }

  function submit(values: Omit<Organization, 'id' | 'registeredAt'>) {
    actions.saveOrganization(values, editing?.id);
    setOpen(false);
    setEditing(null);
    form.resetFields();
    message.success('机构台账已更新');
  }

  const detailRentals = detail ? state.rentalOrders.filter((item) => item.organizationId === detail.id) : [];
  const detailMentors = detail ? state.mentors.filter((item) => item.organizationId === detail.id) : [];
  const detailContracts = detail ? state.contracts.filter((item) => item.organizationId === detail.id) : [];
  const { filteredRecords: filteredOrganizations, toolbar } = useListFilters<Organization>(
    state.organizations,
    [
      { name: 'keyword', label: '机构关键词', placeholder: '机构名称 / 联系人 / 电话', match: textMatcher((item) => item.name, (item) => item.contactName, (item) => item.contactPhone) },
      { name: 'type', label: '机构类型', type: 'select', options: makeOptions(state.organizations.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'city', label: '所在城市', type: 'select', options: makeOptions(state.organizations.map((item) => item.city)), match: equalsMatcher((item) => item.city) },
      { name: 'cooperationMode', label: '合作模式', type: 'select', options: makeOptions(state.organizations.map((item) => item.cooperationMode)), match: equalsMatcher((item) => item.cooperationMode) },
    ],
    <>
      <Button onClick={() => exportOrganizations(state.organizations)}>导出机构台账</Button>
      <Button type="primary" onClick={() => openEditor()}>
        新增机构
      </Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader
        title="合作机构"
        subtitle="维护合作机构信息，并查看采购、租赁与关联导师情况。"
      />
      {toolbar}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredOrganizations}
          columns={[
            { title: '机构类型', dataIndex: 'type' },
            { title: '机构名称', dataIndex: 'name' },
            { title: '联系人', dataIndex: 'contactName' },
            { title: '联系电话', dataIndex: 'contactPhone' },
            { title: '所在城市', dataIndex: 'city' },
            { title: '合作模式', dataIndex: 'cooperationMode' },
            {
              title: '导师数量',
              render: (_, record: Organization) => (
                <Button type="link" onClick={() => router.push(`/mentors?organizationId=${record.id}`)}>
                  {state.mentors.filter((item) => item.organizationId === record.id).length}
                </Button>
              ),
            },
            {
              title: '学生数量',
              render: (_, record: Organization) => state.teams.filter((item) => item.organizationId === record.id).reduce((sum, item) => sum + item.studentCount, 0),
            },
            { title: '注册日期', dataIndex: 'registeredAt' },
            {
              title: '操作',
              render: (_, record: Organization) => (
                <Space>
                  <Button type="link" onClick={() => setDetail(record)}>详情</Button>
                  <Button type="link" onClick={() => openEditor(record)}>编辑</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Drawer open={open} title={editing ? '编辑机构' : '新增机构'} onClose={() => setOpen(false)} width={480} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="机构类型" name="type" rules={[{ required: true, message: '请输入机构类型' }]}>
            <Select options={['学校', '旅行社', '景区', '营地', '教培机构'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item label="机构名称" name="name" rules={[{ required: true, message: '请输入机构名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="联系人" name="contactName" rules={[{ required: true, message: '请输入联系人' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="联系电话" name="contactPhone" rules={[{ required: true, message: '请输入联系电话' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="所在城市" name="city" rules={[{ required: true, message: '请输入城市' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="合作模式" name="cooperationMode" initialValue="销售+租赁">
            <Select options={['销售', '租赁', '销售+租赁'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Button type="primary" htmlType="submit">保存机构</Button>
        </Form>
      </Drawer>
      <Drawer open={Boolean(detail)} title={detail?.name} onClose={() => setDetail(null)} width={560}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '机构类型', children: detail.type },
              { key: '2', label: '联系人', children: detail.contactName },
              { key: '3', label: '联系电话', children: detail.contactPhone },
              { key: '4', label: '所在城市', children: detail.city },
              { key: '5', label: '合作模式', children: detail.cooperationMode ?? '-' },
              { key: '6', label: '注册日期', children: detail.registeredAt },
            ]} />
            <Card
              title="合同管理"
              extra={<Button size="small" icon={<UploadOutlined />} onClick={() => { actions.uploadOrganizationContract(detail.id, `${detail.name}补充合作协议.pdf`); message.success('合作协议已上传'); }}>上传协议</Button>}
            >
              <List dataSource={detailContracts} locale={{ emptyText: '暂无合同记录' }} renderItem={(item) => <List.Item>{item.uploadedAt} · {item.title} · {item.fileName} · {item.status}</List.Item>} />
            </Card>
            <Card title="租赁记录">
              <List dataSource={detailRentals} locale={{ emptyText: '暂无租赁记录' }} renderItem={(item) => <List.Item>{item.rentalDate} · {item.teamName} · {item.status} · {item.totalAmount} 元</List.Item>} />
            </Card>
            <Card title="关联导师">
              <List dataSource={detailMentors} locale={{ emptyText: '暂无导师' }} renderItem={(item) => <List.Item>{item.name} · {item.status} · 带队 {item.teamsLed} 次</List.Item>} />
            </Card>
            <Card title="采购情况">
              <Text type="secondary">线上与企业销售记录可在设备与订单板块统一查看，当前机构已关联设备订单 {state.enterpriseSales.filter((item) => item.customerName === detail.name).length} 笔。</Text>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function MentorsPage() {
  const { state, selectors, actions } = useAdminStore();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [detail, setDetail] = useState<Mentor | null>(null);
  const [editing, setEditing] = useState<Mentor | null>(null);
  const [form] = Form.useForm();
  const [importForm] = Form.useForm();

  function openEditor(record?: Mentor) {
    setEditing(record ?? null);
    setOpen(true);
    form.setFieldsValue(record ?? { status: '启用', teamsLed: 0, taskCount: 0, participantCount: 0 });
  }

  function submit(values: Omit<Mentor, 'id' | 'registeredAt'>) {
    actions.saveMentor(values, editing?.id);
    setOpen(false);
    setEditing(null);
    form.resetFields();
    message.success('导师台账已更新');
  }

  const detailTeams = detail ? state.teams.filter((item) => item.mentorId === detail.id) : [];
  const { filteredRecords: filteredMentors, toolbar } = useListFilters<Mentor>(
    state.mentors,
    [
      { name: 'keyword', label: '导师关键词', placeholder: '姓名 / 手机号', match: textMatcher((item) => item.name, (item) => item.phone) },
      { name: 'organizationId', label: '所属机构', type: 'select', options: state.organizations.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.organizationId) },
      { name: 'status', label: '账号状态', type: 'select', options: makeOptions(state.mentors.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    <>
      <Button onClick={() => exportMentors(state.mentors, (organizationId) => selectors.getOrganizationById(organizationId)?.name ?? '-')}>导出导师台账</Button>
      <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>批量导入</Button>
      <Button type="primary" onClick={() => openEditor()}>新增导师</Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader
        title="研学导师"
        subtitle="管理导师账号状态、带队规模与任务量。"
      />
      {toolbar}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredMentors}
          columns={[
            {
              title: '所属机构',
              render: (_, record: Mentor) => selectors.getOrganizationById(record.organizationId)?.name ?? '-',
            },
            { title: '导师姓名', dataIndex: 'name' },
            { title: '手机号', dataIndex: 'phone' },
            { title: '账号状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            { title: '带团队数', dataIndex: 'teamsLed' },
            { title: '任务总数', dataIndex: 'taskCount' },
            { title: '研学总人次', dataIndex: 'participantCount' },
            {
              title: '操作',
              render: (_, record: Mentor) => (
                <Space>
                  <Button type="link" onClick={() => setDetail(record)}>详情</Button>
                  <Button type="link" onClick={() => openEditor(record)}>编辑</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Drawer open={open} title={editing ? '编辑导师' : '新增导师'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="所属机构" name="organizationId" rules={[{ required: true, message: '请选择所属机构' }]}>
            <Select showSearch optionFilterProp="label" options={state.organizations.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item label="导师姓名" name="name" rules={[{ required: true, message: '请输入导师姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="账号状态" name="status">
            <Select options={['未激活', '启用', '停用'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="带团队数" name="teamsLed"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="任务总数" name="taskCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="研学总人次" name="participantCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit">保存导师</Button>
        </Form>
      </Drawer>
      <Modal
        open={importOpen}
        title="批量导入导师"
        okText="确定导入"
        cancelText="取消"
        onCancel={() => setImportOpen(false)}
        onOk={() => importForm.submit()}
      >
        <Form
          form={importForm}
          layout="vertical"
          initialValues={{ organizationId: state.organizations[0]?.id }}
          onFinish={(values: { organizationId: string; files?: Array<{ name?: string }> }) => {
            const fileName = values.files?.[0]?.name ?? '导师导入模板.xlsx';
            actions.batchImportMentors(values.organizationId, fileName);
            message.success('导入成功，已生成未激活导师账号');
            setImportOpen(false);
            importForm.resetFields();
          }}
        >
          <Form.Item label="合作机构" name="organizationId" rules={[{ required: true, message: '请选择合作机构' }]}>
            <Select showSearch optionFilterProp="label" options={state.organizations.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item
            label="上传 Excel 文件"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
            rules={[{ required: true, message: '请上传 Excel 文件' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept=".xls,.xlsx">
              <Button icon={<UploadOutlined />}>选择 Excel 文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer open={Boolean(detail)} title={detail?.name} onClose={() => setDetail(null)} width={560}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '所属机构', children: selectors.getOrganizationById(detail.organizationId)?.name ?? '-' },
              { key: '2', label: '手机号', children: detail.phone },
              { key: '3', label: '账号状态', children: detail.status },
              { key: '4', label: '注册日期', children: detail.registeredAt },
            ]} />
            <Card title="团队明细">
              <List
                dataSource={detailTeams}
                locale={{ emptyText: '暂无负责团队' }}
                renderItem={(item) => (
                  <List.Item>
                    {item.startDate} · {item.name} · 学员 {item.studentCount} 人 · 任务 {item.taskCount} 个
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function TeamAssignmentsPage() {
  const { state, selectors, actions } = useAdminStore();
  const { message } = App.useApp();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();

  function openEditor(record: Team) {
    setTeam(record);
    form.setFieldsValue({
      mentorId: record.mentorId,
      assistantPhones: record.assistantPhones.join(','),
    });
  }

  function submit(values: { mentorId: string; assistantPhones: string }) {
    if (!team) return;
    actions.assignMentor(
      team.id,
      values.mentorId,
      values.assistantPhones
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );
    message.success('导师安排已更新');
    setTeam(null);
  }
  const { filteredRecords: filteredTeams, toolbar } = useListFilters<Team>(
    state.teams,
    [
      { name: 'keyword', label: '团队关键词', placeholder: '线路名称 / 团队名称', match: textMatcher((item) => item.lineName, (item) => item.name) },
      { name: 'city', label: '所在城市', type: 'select', options: makeOptions(state.organizations.map((item) => item.city)), match: (item, value) => {
        if (!hasFilterValue(value)) return true;
        return selectors.getOrganizationById(item.organizationId)?.city === value;
      } },
      { name: 'organizationId', label: '合作机构', type: 'select', options: state.organizations.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.organizationId) },
      { name: 'mentorId', label: '负责导师', type: 'select', options: state.mentors.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.mentorId) },
      { name: 'assignmentStatus', label: '安排状态', type: 'select', options: makeOptions(state.teams.map((item) => item.assignmentStatus)), match: equalsMatcher((item) => item.assignmentStatus) },
    ],
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="团队安排" subtitle="为待执行团队安排导师与助理，安排结果会同步到团队任务与照片管理。" />
      {toolbar}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredTeams}
          columns={[
            { title: '线路名称', dataIndex: 'lineName' },
            { title: '团队名称', dataIndex: 'name' },
            { title: '出发日期', dataIndex: 'startDate' },
            { title: '学员数', dataIndex: 'studentCount' },
            { title: '安排状态', dataIndex: 'assignmentStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            { title: '导师姓名', render: (_, record: Team) => selectors.getMentorById(record.mentorId)?.name ?? '待安排' },
            { title: '助理数量', render: (_, record: Team) => record.assistantPhones.length },
            {
              title: '操作',
              render: (_, record: Team) => (
                <Space>
                  <Button type="link" onClick={() => openEditor(record)}>{record.mentorId ? '变更导师' : '安排导师'}</Button>
                  <Button type="link" onClick={() => router.push(`/team-tasks?teamId=${record.id}`)}>任务安排</Button>
                  <Button type="link" onClick={() => router.push(`/team-photos?teamId=${record.id}`)}>照片管理</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Drawer open={Boolean(team)} title={team?.name} onClose={() => setTeam(null)} width={480}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="负责人导师" name="mentorId" rules={[{ required: true, message: '请选择导师' }]}>
            <Select showSearch optionFilterProp="label" options={state.mentors.filter((item) => item.status === '启用').map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item label="助理手机号" name="assistantPhones" extra="多个手机号使用逗号分隔。">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit">保存安排</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function TeamTasksPage() {
  const { state, selectors, actions } = useAdminStore();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickMode, setQuickMode] = useState<'manual' | 'history' | 'ai' | 'document'>('manual');
  const [worksTask, setWorksTask] = useState<TeamTask | null>(null);
  const [editing, setEditing] = useState<TeamTask | null>(null);
  const [form] = Form.useForm();
  const [quickForm] = Form.useForm();

  function openEditor(record?: TeamTask) {
    setEditing(record ?? null);
    setOpen(true);
    form.setFieldsValue(
      record
        ? {
            ...record,
            attachmentText: record.attachments.map((item) => item.name).join('\n'),
          }
        : {
            status: '创建中',
            scope: '个人任务',
            source: 'manual',
            base: state.bases[0]?.name ?? '深圳湾红树林生态观测站',
            taskType: '观察记录',
            points: 20,
            submittedCount: 0,
            totalCount: 20,
            requirements: [{ id: 'req-new', type: 'text', requirement: '完成 100 字观察记录' }],
          },
    );
  }

  function submit(values: Omit<TeamTask, 'id' | 'updatedAt' | 'attachments'> & { attachmentText?: string; requirements: WorkRequirement[] }) {
    const attachments: TaskAttachment[] = String(values.attachmentText ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, index) => ({
        id: `task-attachment-${index}`,
        name,
        kind: name.endsWith('.pdf') ? 'pdf' : name.endsWith('.doc') || name.endsWith('.docx') ? 'doc' : name.endsWith('.mp4') ? 'video' : 'image',
        url: '#',
      }));
    actions.saveTeamTask(
      {
        teamId: values.teamId,
        name: values.name,
        status: values.status,
        scope: values.scope,
        source: values.source,
        base: values.base,
        taskType: values.taskType,
        points: values.points,
        description: values.description,
        attachments,
        requirements: values.requirements.map((item, index) => ({
          id: item.id ?? `req-${index}`,
          type: item.type,
          requirement: item.requirement,
        })),
        submittedCount: values.submittedCount,
        totalCount: values.totalCount,
        mentorId: values.mentorId,
      },
      editing?.id,
    );
    message.success('团队任务已更新');
    setOpen(false);
    setEditing(null);
  }

  function openQuick(mode: typeof quickMode) {
    setQuickMode(mode);
    setQuickOpen(true);
    quickForm.setFieldsValue({
      mode,
      targetTeamId: state.teams[0]?.id,
      sourceTeamId: state.teams[0]?.id,
      taskIds: [],
    });
  }

  function runQuick(values: { targetTeamId: string; sourceTeamId?: string; taskIds?: string[]; files?: Array<{ name?: string }> }) {
    if (quickMode === 'manual') {
      setQuickOpen(false);
      openEditor();
      form.setFieldsValue({ teamId: values.targetTeamId, totalCount: selectors.getTeamById(values.targetTeamId)?.studentCount ?? 20 });
      return;
    }
    if (quickMode === 'history') {
      actions.copyTeamTasksFromHistory(values.targetTeamId, values.sourceTeamId ?? values.targetTeamId, values.taskIds ?? []);
      message.success('已从历史团队复制任务');
    }
    if (quickMode === 'ai') {
      actions.createAiTeamTasks(values.targetTeamId);
      message.success('AI 已生成任务草稿');
    }
    if (quickMode === 'document') {
      actions.importTeamTasksFromDocument(values.targetTeamId, values.files?.[0]?.name ?? '研学任务文档.docx');
      message.success('文档已解析为任务草稿');
    }
    setQuickOpen(false);
  }

  const works = worksTask ? state.teamTaskWorks.filter((item) => item.taskId === worksTask.id) : [];
  const { filteredRecords: filteredTeamTasks, toolbar } = useListFilters<TeamTask>(
    state.teamTasks,
    [
      { name: 'keyword', label: '任务关键词', placeholder: '任务名称 / 团队名称', match: textMatcher((item) => item.name, (item) => selectors.getTeamById(item.teamId)?.name) },
      { name: 'teamId', label: '所属团队', type: 'select', options: state.teams.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.teamId) },
      { name: 'scope', label: '任务类型', type: 'select', options: makeOptions(state.teamTasks.map((item) => item.scope)), match: equalsMatcher((item) => item.scope) },
      { name: 'status', label: '任务状态', type: 'select', options: makeOptions(state.teamTasks.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'mentorId', label: '导师', type: 'select', options: state.mentors.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.mentorId) },
    ],
    <>
      <Button onClick={() => openQuick('history')}>从历史团队复制</Button>
      <Button onClick={() => openQuick('ai')}>AI 创建</Button>
      <Button onClick={() => openQuick('document')}>文档导入</Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openQuick('manual')}>新增任务</Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="团队任务" subtitle="支持运营代导师创建、修改与查询任务状态，保持执行闭环。" />
      {toolbar}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredTeamTasks}
          columns={[
            { title: '任务名称', dataIndex: 'name' },
            { title: '所属团队', render: (_, record: TeamTask) => selectors.getTeamById(record.teamId)?.name ?? '-' },
            { title: '任务类型', dataIndex: 'scope' },
            { title: '基地/类型', render: (_, record: TeamTask) => `${record.base} / ${record.taskType}` },
            { title: '分值', dataIndex: 'points' },
            { title: '任务状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            { title: '完成进度', render: (_, record: TeamTask) => `${record.submittedCount}/${record.totalCount}` },
            { title: '导师', render: (_, record: TeamTask) => selectors.getMentorById(record.mentorId)?.name ?? '未关联' },
            {
              title: '操作',
              render: (_, record: TeamTask) => (
                <Space>
                  <Button type="link" onClick={() => openEditor(record)}>编辑</Button>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => setWorksTask(record)}>查看作品</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        open={quickOpen}
        title="快速创建团队任务"
        okText={quickMode === 'manual' ? '继续填写' : '确定'}
        cancelText="取消"
        onCancel={() => setQuickOpen(false)}
        onOk={() => quickForm.submit()}
      >
        <Form form={quickForm} layout="vertical" onFinish={runQuick}>
          <Segmented
            block
            value={quickMode}
            options={[
              { label: '手动创建', value: 'manual' },
              { label: '历史复制', value: 'history' },
              { label: 'AI 创建', value: 'ai' },
              { label: '文档导入', value: 'document' },
            ]}
            onChange={(value) => setQuickMode(value as typeof quickMode)}
            style={{ marginBottom: 16 }}
          />
          <Form.Item label="目标团队" name="targetTeamId" rules={[{ required: true, message: '请选择团队' }]}>
            <Select showSearch optionFilterProp="label" options={state.teams.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          {quickMode === 'history' ? (
            <>
              <Form.Item label="历史团队" name="sourceTeamId" rules={[{ required: true, message: '请选择历史团队' }]}>
                <Select showSearch optionFilterProp="label" options={state.teams.map((item) => ({ label: item.name, value: item.id }))} />
              </Form.Item>
              <Form.Item label="复制任务" name="taskIds" rules={[{ required: true, message: '请选择任务' }]}>
                <Select mode="multiple" showSearch optionFilterProp="label" options={state.teamTasks.map((item) => ({ label: `${selectors.getTeamById(item.teamId)?.name ?? '-'} · ${item.name}`, value: item.id }))} />
              </Form.Item>
            </>
          ) : null}
          {quickMode === 'ai' ? (
            <Card size="small">
              <Text type="secondary">将根据团队线路、基地和学员规模生成任务草稿，生成后仍需运营确认字段后下发。</Text>
            </Card>
          ) : null}
          {quickMode === 'document' ? (
            <Form.Item
              label="上传 Word / PDF 文档"
              name="files"
              valuePropName="fileList"
              getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
              rules={[{ required: true, message: '请上传任务文档' }]}
            >
              <Upload beforeUpload={() => false} maxCount={1} accept=".doc,.docx,.pdf">
                <Button icon={<UploadOutlined />}>选择文档</Button>
              </Upload>
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
      <Drawer open={open} title={editing ? '编辑任务' : '新增任务'} onClose={() => setOpen(false)} width={680}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="所属团队" name="teamId" rules={[{ required: true, message: '请选择团队' }]}><Select showSearch optionFilterProp="label" options={state.teams.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="任务名称" name="name" rules={[{ required: true, message: '请输入任务名称' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="任务来源" name="source"><Select options={[{ label: '手动创建', value: 'manual' }, { label: '历史复制', value: 'history' }, { label: '任务库', value: 'library' }, { label: 'AI创建', value: 'ai' }, { label: '文档导入', value: 'document' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item label="任务范围" name="scope"><Select options={['个人任务', '小组任务'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
            <Col span={8}><Form.Item label="任务状态" name="status"><Select options={['创建中', '已下发', '进行中', '已结束'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="研学基地" name="base" rules={[{ required: true, message: '请输入研学基地' }]}><Select showSearch optionFilterProp="label" options={state.bases.map((item) => ({ label: item.name, value: item.name }))} /></Form.Item></Col>
            <Col span={8}><Form.Item label="任务类型" name="taskType" rules={[{ required: true, message: '请输入任务类型' }]}><Select showSearch optionFilterProp="label" options={state.taskTypes.map((item) => ({ label: item.name, value: item.name }))} /></Form.Item></Col>
            <Col span={8}><Form.Item label="任务分值" name="points" rules={[{ required: true }]}><InputNumber min={1} max={100} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="任务说明" name="description" rules={[{ required: true, message: '请输入任务说明' }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item label="任务说明附件" name="attachmentText"><Input.TextArea rows={3} placeholder="每行一个附件名，例如：任务说明.pdf" /></Form.Item>
          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong>作品要求</Text>
                {fields.map((field, index) => (
                  <Card key={field.key} size="small" title={`作品 ${index + 1}`}>
                    <Row gutter={12}>
                      <Col span={8}><Form.Item {...field} label="作品类型" name={[field.name, 'type']} rules={[{ required: true }]}><Select options={[{ label: '文本', value: 'text' }, { label: '选择', value: 'choice' }, { label: '判断', value: 'judge' }, { label: '图片', value: 'image' }, { label: '视频', value: 'video' }, { label: '音频', value: 'audio' }, { label: '链接', value: 'link' }]} /></Form.Item></Col>
                      <Col span={16}><Form.Item {...field} label="作品要求" name={[field.name, 'requirement']} rules={[{ required: true }]}><Input /></Form.Item></Col>
                    </Row>
                    {fields.length > 1 ? <Button danger onClick={() => remove(field.name)}>删除作品要求</Button> : null}
                  </Card>
                ))}
                <Button icon={<PlusOutlined />} onClick={() => add({ type: 'text', requirement: '' })}>添加作品要求</Button>
              </Space>
            )}
          </Form.List>
          <Divider />
          <Row gutter={12}>
            <Col span={8}><Form.Item label="已提交" name="submittedCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="应提交" name="totalCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="关联导师" name="mentorId"><Select allowClear showSearch optionFilterProp="label" options={state.mentors.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit">保存任务</Button>
        </Form>
      </Drawer>
      <Drawer open={Boolean(worksTask)} title={worksTask ? `${worksTask.name} · 作品列表` : '作品列表'} onClose={() => setWorksTask(null)} width={720}>
        <List<TeamTaskWork>
          dataSource={works}
          locale={{ emptyText: '该任务暂未提交作品' }}
          renderItem={(work) => (
            <List.Item>
              <List.Item.Meta
                title={<Space><Text strong>{work.title}</Text><Tag color={statusColor(work.status)}>{work.status}</Tag></Space>}
                description={
                  <Space direction="vertical" size={6}>
                    <Text type="secondary">{work.ownerType}：{work.ownerName} · 提交时间 {work.submittedAt}</Text>
                    <Text>{work.preview}</Text>
                    <Space wrap>
                      {work.aiScore !== undefined ? <Tag color="blue">AI 分 {work.aiScore}</Tag> : null}
                      {work.tutorScore !== undefined ? <Tag color="green">导师分 {work.tutorScore}</Tag> : null}
                      {work.attachments.map((attachment) => <Tag key={attachment.id}>{attachment.name}</Tag>)}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </Space>
  );
}

function RentalOrdersPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [creating, setCreating] = useState(false);
  const [rentalDetail, setRentalDetail] = useState<any>(null);
  const [orgPickerOpen, setOrgPickerOpen] = useState(false);
  const [orgKeyword, setOrgKeyword] = useState('');
  const [batchUploadOrder, setBatchUploadOrder] = useState<any>(null);
  const [rentalAttachmentOrder, setRentalAttachmentOrder] = useState<any>(null);
  const [createForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [adjustForm] = Form.useForm();
  const [damageForm] = Form.useForm();

  const freeDevices = state.devices.filter((item) => item.status === '库存' || item.status === '库存-租赁');
  const salesAllowed = canUse(state.demoRole, ['sales']);
  const warehouseAllowed = canUse(state.demoRole, ['warehouse']);
  const orgPickerResults = state.organizations.filter((item) => {
    if (!orgKeyword) return false;
    return [item.name, item.contactName, item.contactPhone].some((value) => toText(value).includes(toText(orgKeyword)));
  });

  function submitCreate(values: any) {
    actions.createRentalOrder({
      ...values,
      totalAmount: values.quantity * values.days * values.unitPrice,
      paidAmount: values.paidAmount ?? 0,
      deviceSerials: [],
      note: values.note ?? '',
    });
    message.success('租赁订单已创建');
    setCreating(false);
    createForm.resetFields();
  }

  function submitStatus(values: { status: RentalOrderStatus; serials: string[]; note: string }) {
    actions.updateRentalOrderStatus(rentalDetail.id, values.status, values.serials, values.note);
    message.success('订单状态已更新');
    setRentalDetail(null);
  }

  function submitPayment(values: { amount: number; method: '转账' | '扫码' | '现金'; note: string }) {
    actions.addRentalPayment(rentalDetail.id, values);
    message.success('收款已录入');
    paymentForm.resetFields();
  }
  const { filteredRecords: filteredRentalOrders, toolbar } = useListFilters<any>(
    state.rentalOrders,
    [
      { name: 'keyword', label: '订单关键词', placeholder: '订单号 / 团队 / 联系人 / 手机号', match: textMatcher((item) => item.id, (item) => item.teamName, (item) => item.contactName, (item) => item.contactPhone) },
      { name: 'organizationKeyword', label: '合作机构', placeholder: '输入机构关键词', match: textMatcher((item) => state.organizations.find((org) => org.id === item.organizationId)?.name) },
      { name: 'status', label: '租赁状态', type: 'select', options: makeOptions(state.rentalOrders.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'saleOwner', label: '销售员工', placeholder: '工号或姓名', match: textMatcher((item) => item.saleOwner) },
      { name: 'orderDate', label: '订单日期范围', placeholder: '例如 2026-04', match: textMatcher((item) => item.createdAt) },
      { name: 'travelDate', label: '出行日期范围', placeholder: '例如 2026-04', match: textMatcher((item) => item.rentalDate) },
    ],
    <>
      <Button disabled={!warehouseAllowed || state.rentalOrders.length === 0} onClick={() => setBatchUploadOrder(state.rentalOrders[0])}>设备 ID 导入</Button>
      <Button type="primary" disabled={!salesAllowed} onClick={() => setCreating(true)}>创建租赁订单</Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="租赁订单" subtitle="管理租赁订单、状态流转、收款与设备交付回收。" />
      <RolePermissionBanner demoRole={state.demoRole} roles={['sales', 'warehouse']} scene="租赁订单" />
      {toolbar}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredRentalOrders}
          columns={[
            { title: '订单号', dataIndex: 'id' },
            { title: '机构', render: (_, record: any) => state.organizations.find((item) => item.id === record.organizationId)?.name ?? '-' },
            { title: '联系人', dataIndex: 'contactName' },
            { title: '订单时间', dataIndex: 'createdAt' },
            { title: '研学日期', dataIndex: 'rentalDate' },
            { title: '租赁数量', dataIndex: 'quantity' },
            { title: '租赁天数', dataIndex: 'days' },
            { title: '总金额', dataIndex: 'totalAmount' },
            { title: '已收金额', dataIndex: 'paidAmount' },
            { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            {
              title: '操作',
              render: (_, record: any) => (
                <Space>
                  <Button type="link" onClick={() => setRentalDetail(record)}>详情</Button>
                  <Button type="link" disabled={!salesAllowed} onClick={() => { setRentalDetail(record); adjustForm.setFieldsValue({ quantity: record.quantity, unitPrice: record.unitPrice, discount: 0 }); }}>调价</Button>
                  <Button type="link" disabled={!warehouseAllowed} onClick={() => setBatchUploadOrder(record)}>设备批次</Button>
                  <Button type="link" disabled={!warehouseAllowed} onClick={() => setRentalDetail(record)}>交付/回收</Button>
                  <Button type="link" disabled={!salesAllowed} onClick={() => setRentalDetail(record)}>收款</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Drawer open={creating} title="创建租赁订单" onClose={() => setCreating(false)} width={560}>
        <Form form={createForm} layout="vertical" onFinish={submitCreate}>
          <Form.Item name="organizationId" hidden rules={[{ required: true, message: '请选择机构' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="合作机构" required>
            <Input.Search
              readOnly
              placeholder="输入关键字后弹窗选择机构"
              value={state.organizations.find((item) => item.id === createForm.getFieldValue('organizationId'))?.name}
              onSearch={() => setOrgPickerOpen(true)}
              onClick={() => setOrgPickerOpen(true)}
            />
          </Form.Item>
          <Form.Item label="班级/团队名称" name="teamName" rules={[{ required: true, message: '请输入团队名称' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="租赁日期" name="rentalDate" rules={[{ required: true, message: '请输入日期' }]}><Input placeholder="2026-04-25" /></Form.Item></Col>
            <Col span={12}><Form.Item label="销售员工" name="saleOwner" rules={[{ required: true, message: '请输入销售员工' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="租赁数量" name="quantity" rules={[{ required: true, message: '请输入数量' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="租赁天数" name="days" rules={[{ required: true, message: '请输入天数' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="单价" name="unitPrice" rules={[{ required: true, message: '请输入单价' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="联系人" name="contactName" rules={[{ required: true, message: '请输入联系人' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="手机号" name="contactPhone" rules={[{ required: true, message: '请输入手机号' }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item label="租赁状态" name="status" initialValue="意向"><Select options={['意向', '已预订', '已交付', '已回收', '已取消'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="已收金额" name="paidAmount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="备注" name="note"><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" htmlType="submit">保存订单</Button>
        </Form>
      </Drawer>
      <Drawer open={Boolean(rentalDetail)} title={`租赁订单 ${rentalDetail?.id ?? ''}`} onClose={() => setRentalDetail(null)} width={640}>
        {rentalDetail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '团队名称', children: rentalDetail.teamName },
              { key: '0', label: '订单时间', children: rentalDetail.createdAt },
              { key: '2', label: '租赁日期', children: rentalDetail.rentalDate },
              { key: '3', label: '订单状态', children: <Tag color={statusColor(rentalDetail.status)}>{rentalDetail.status}</Tag> },
              { key: '4', label: '已分配设备', children: rentalDetail.deviceSerials.join('、') || '尚未分配' },
              { key: '5', label: '账单金额', children: `￥${rentalDetail.totalAmount}，已收 ￥${rentalDetail.paidAmount}` },
            ]} />
            <Card title="设备出仓批次">
              <List
                dataSource={state.rentalDeviceBatches.filter((item) => item.orderId === rentalDetail.id)}
                locale={{ emptyText: '暂无设备批次' }}
                renderItem={(item) => (
                  <List.Item>
                    {item.importedAt} · {item.batchNo} · {item.fileName} · 成功 {item.quantity} 台 · 失败 {item.failedCount} 条 · {item.status}
                  </List.Item>
                )}
              />
              <Divider />
              <Button disabled={!warehouseAllowed} icon={<UploadOutlined />} onClick={() => setBatchUploadOrder(rentalDetail)}>上传设备 ID Excel</Button>
            </Card>
            <Card title="数量价格调整">
              <Form
                form={adjustForm}
                layout="inline"
                initialValues={{ quantity: rentalDetail.quantity, unitPrice: rentalDetail.unitPrice, discount: 0 }}
                onFinish={(values) => { actions.adjustRentalOrder(rentalDetail.id, values.quantity, values.unitPrice, values.discount ?? 0, values.note ?? ''); message.success('数量、价格与优惠已调整'); }}
              >
                <Form.Item name="quantity" rules={[{ required: true }]}><InputNumber min={1} placeholder="数量" /></Form.Item>
                <Form.Item name="unitPrice" rules={[{ required: true }]}><InputNumber min={1} placeholder="单价" /></Form.Item>
                <Form.Item name="discount"><InputNumber min={0} placeholder="优惠" /></Form.Item>
                <Form.Item name="note"><Input placeholder="调整说明" /></Form.Item>
                <Button disabled={!salesAllowed} type="primary" htmlType="submit">保存调整</Button>
              </Form>
            </Card>
            <Card title="状态流转">
              <Form form={statusForm} layout="vertical" onFinish={submitStatus} initialValues={{ status: rentalDetail.status, serials: rentalDetail.deviceSerials, note: rentalDetail.note }}>
                <Form.Item label="订单状态" name="status">
                  <Select options={['意向', '已预订', '已交付', '已回收', '已取消'].map((value) => ({ label: value, value }))} />
                </Form.Item>
                <Form.Item label="设备序列号" name="serials">
                  <Select mode="multiple" showSearch optionFilterProp="label" options={freeDevices.concat(state.devices.filter((item) => rentalDetail.deviceSerials.includes(item.serialNumber))).map((item) => ({ label: item.serialNumber, value: item.serialNumber }))} />
                </Form.Item>
                <Form.Item label="备注" name="note">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Button disabled={!warehouseAllowed} type="primary" htmlType="submit">更新状态</Button>
              </Form>
            </Card>
            <Card title="报失报修与最终账单">
              <Form form={damageForm} layout="inline" onFinish={(values) => { actions.createRentalDamageBill(rentalDetail.id, values.amount, values.note); message.success('报失报修费用已加入账单'); damageForm.resetFields(); }}>
                <Form.Item name="amount" rules={[{ required: true }]}><InputNumber min={1} placeholder="费用" /></Form.Item>
                <Form.Item name="note" rules={[{ required: true }]}><Input placeholder="遗失/损坏说明" /></Form.Item>
                <Button type="primary" htmlType="submit">生成费用账单</Button>
              </Form>
            </Card>
            <Card title="收款记录">
              <List
                dataSource={rentalDetail.payments}
                locale={{ emptyText: '暂无收款记录' }}
                renderItem={(item: any) => <List.Item>{item.createdAt} · {item.method} · {item.amount} 元 · {item.note} · <Tag color={statusColor(item.confirmationStatus)}>{item.confirmationStatus}</Tag>{item.voucherFile ? ` · ${item.voucherFile}` : ' · 待补传凭证'}</List.Item>}
              />
              <Divider />
              <Form form={paymentForm} layout="inline" onFinish={submitPayment}>
                <Form.Item name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber placeholder="金额" min={1} /></Form.Item>
                <Form.Item name="method" initialValue="转账"><Select style={{ width: 120 }} options={['转账', '扫码', '现金'].map((value) => ({ label: value, value }))} /></Form.Item>
                <Form.Item name="note" rules={[{ required: true, message: '请输入摘要' }]}><Input placeholder="收款摘要" /></Form.Item>
                <Button disabled={!salesAllowed} type="primary" htmlType="submit">录入收款</Button>
              </Form>
            </Card>
            <Card title="订单附件">
              <List
                dataSource={state.attachments.filter((item) => item.ownerType === '租赁订单' && item.ownerId === rentalDetail.id)}
                locale={{ emptyText: '暂无附件' }}
                renderItem={(item) => <List.Item>{item.uploadedAt} · {item.fileName} · {item.note}</List.Item>}
              />
              <Divider />
              <Button disabled={!salesAllowed && !warehouseAllowed} icon={<UploadOutlined />} onClick={() => setRentalAttachmentOrder(rentalDetail)}>上传租赁协议/清单</Button>
            </Card>
          </Space>
        ) : null}
      </Drawer>
      <Modal open={orgPickerOpen} title="选择合作机构" onCancel={() => setOrgPickerOpen(false)} footer={null}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Input.Search placeholder="输入机构名称、联系人或手机号" value={orgKeyword} onChange={(event) => setOrgKeyword(event.target.value)} allowClear />
          <List
            dataSource={orgPickerResults}
            locale={{ emptyText: orgKeyword ? '未找到匹配机构' : '请先输入关键字' }}
            renderItem={(item) => (
              <List.Item actions={[<Button key="select" type="link" onClick={() => { createForm.setFieldValue('organizationId', item.id); setOrgPickerOpen(false); setOrgKeyword(''); }}>选择</Button>]}>
                <List.Item.Meta title={item.name} description={`${item.contactName} · ${item.contactPhone} · ${item.cooperationMode ?? '-'}`} />
              </List.Item>
            )}
          />
        </Space>
      </Modal>
      <UploadMockModal
        open={Boolean(batchUploadOrder)}
        title="导入租赁设备 ID Excel"
        accept=".xls,.xlsx"
        description="上传库管准备的设备 ID 清单，系统模拟生成出仓批次号与明细记录。"
        resultName="CK"
        onCancel={() => setBatchUploadOrder(null)}
        onConfirm={(fileName) => {
          if (!batchUploadOrder) return;
          actions.importRentalDeviceBatch(batchUploadOrder.id, fileName);
          message.success('设备 ID Excel 已导入，出仓批次已生成');
        }}
      />
      <UploadMockModal
        open={Boolean(rentalAttachmentOrder)}
        title="上传租赁订单附件"
        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
        description="可上传租赁协议、订购单、交付设备清单或回收清单，附件会进入订单详情和操作日志。"
        resultName="RENTAL-FILE"
        onCancel={() => setRentalAttachmentOrder(null)}
        onConfirm={(fileName) => {
          if (!rentalAttachmentOrder) return;
          actions.attachRentalOrderFile(rentalAttachmentOrder.id, fileName, '租赁协议/订购单/设备清单');
          message.success('租赁订单附件已上传');
        }}
      />
    </Space>
  );
}

function InventoryPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [uploadKind, setUploadKind] = useState<'inbound' | 'transfer' | null>(null);
  const warehouseAllowed = canUse(state.demoRole, ['warehouse']);
  const summary = useMemo(
    () => ({
      stock: state.devices.filter((item) => item.status === '库存' || item.status === '库存-租赁').length,
      rental: state.devices.filter((item) => item.status === '租赁中').length,
      sold: state.devices.filter((item) => item.status === '已销售').length,
    }),
    [state.devices],
  );
  const { filteredRecords: filteredDevices, toolbar } = useListFilters<any>(
    state.devices,
    [
      { name: 'keyword', label: '设备关键词', placeholder: '序列号 / 批次 / 型号', match: textMatcher((item) => item.serialNumber, (item) => item.batch, (item) => item.model) },
      { name: 'batch', label: '设备批次', type: 'select', options: makeOptions(state.devices.map((item) => item.batch)), match: equalsMatcher((item) => item.batch) },
      { name: 'status', label: '设备状态', type: 'select', options: makeOptions(state.devices.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    <>
      <Button onClick={() => { exportInventory(state.inventoryDaily); actions.writeOperationLog({ role: '运营管理员', operatorName: '运营总控台', feature: '进销存总览', target: '库存日报', content: '导出库存日报 Excel', result: '成功' }); }}>导出库存日报</Button>
      <Button disabled={!warehouseAllowed} onClick={() => setUploadKind('inbound')}>设备入库导入</Button>
      <Button disabled={!warehouseAllowed} onClick={() => setUploadKind('transfer')}>分仓调拨</Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="进销存总览" subtitle="查看库存日报，并核对当前设备状态分布。" />
      <RolePermissionBanner demoRole={state.demoRole} roles={['warehouse']} scene="进销存导入与调拨" />
      {toolbar}
      <Row gutter={[16, 16]}>
        <Col span={8}><Card><Statistic title="当前库存" value={summary.stock} /></Card></Col>
        <Col span={8}><Card><Statistic title="租赁中设备" value={summary.rental} /></Card></Col>
        <Col span={8}><Card><Statistic title="已销售设备" value={summary.sold} /></Card></Col>
      </Row>
      <Card title="分仓管理">
        <Table rowKey="id" pagination={false} dataSource={state.warehouses} columns={[
          { title: '分仓名称', dataIndex: 'name' },
          { title: '省份', dataIndex: 'province' },
          { title: '城市', dataIndex: 'city' },
          { title: '负责人', dataIndex: 'manager' },
          { title: '可售库存', dataIndex: 'stock' },
          { title: '租赁库存', dataIndex: 'rentalStock' },
        ]} />
      </Card>
      <Card title="库存日报">
        <Table rowKey="id" pagination={false} dataSource={state.inventoryDaily} columns={[
          { title: '日期', dataIndex: 'date' },
          { title: '上日库存', dataIndex: 'openingStock' },
          { title: '今日入库', dataIndex: 'inbound' },
          { title: '线上销售出库', dataIndex: 'onlineOutbound' },
          { title: '企业销售出库', dataIndex: 'enterpriseOutbound' },
          { title: '租赁出库', dataIndex: 'rentalOutbound' },
          { title: '租赁回收入库', dataIndex: 'rentalInbound' },
          { title: '当前库存', dataIndex: 'closingStock' },
        ]} />
      </Card>
      <Card title="设备状态分布">
        <Table rowKey="id" dataSource={filteredDevices} pagination={{ pageSize: 8 }} columns={[
          { title: '序列号', dataIndex: 'serialNumber' },
          { title: '批次', dataIndex: 'batch' },
          { title: '型号', dataIndex: 'model' },
          { title: '当前状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '最近动作', dataIndex: 'lastAction' },
        ]} />
      </Card>
      <UploadMockModal
        open={Boolean(uploadKind)}
        title={uploadKind === 'transfer' ? '上传分仓调拨 Excel' : '上传设备入库 Excel'}
        accept=".xls,.xlsx"
        description={uploadKind === 'transfer' ? '上传分仓调拨表后，系统模拟移动设备并刷新分仓库存。' : '上传采购设备入库表后，系统模拟生成设备数据与进销存日报。'}
        resultName={uploadKind === 'transfer' ? 'DB' : 'RK'}
        onCancel={() => setUploadKind(null)}
        onConfirm={(fileName) => {
          if (uploadKind === 'transfer') {
            actions.transferWarehouseStock(fileName);
            message.success('分仓调拨 Excel 已导入');
          } else {
            actions.importInventoryDevices(fileName);
            message.success('设备入库 Excel 已导入');
          }
        }}
      />
    </Space>
  );
}

function StudentDetailTabs({ student, elements }: { student: StudentProfile; elements: Array<{ id: string; plane: string; indicator?: string; name: string }> }) {
  const elementScores = studentElementScores(student, elements);
  const strongest = [...elementScores].sort((a, b) => b.score - a.score).slice(0, 6);
  const weakest = [...elementScores].sort((a, b) => a.score - b.score).slice(0, 6);
  const reportItems = student.studyRecords.map((item) => ({
    id: `report-${item.id}`,
    title: `${item.teamName}研学报告`,
    date: item.date,
    summary: `${item.rating} · 完成 ${item.completedTasks} 个任务`,
  }));
  const orderItems = [
    { id: `order-${student.id}-1`, title: '设备租赁订单', amount: 199, status: student.studyCount > 0 ? '已支付' : '未产生' },
    { id: `course-${student.id}-1`, title: '专家课程订单', amount: 199, status: student.assessments.length > 0 ? '已支付' : '未产生' },
  ];
  const courseItems = student.assessments.map((item) => ({
    id: `course-progress-${item.id}`,
    title: item.type === '家长评测' ? '家庭成长观察课' : '能力自测引导课',
    progress: item.score,
  }));
  const diaryItems = student.studyRecords.map((item) => ({
    id: `diary-${item.id}`,
    date: item.date,
    title: `${item.teamName}研学日记`,
    content: `完成 ${item.completedTasks} 个现场任务，综合评分 ${item.score}。`,
  }));
  const growthDiaryItems = [
    ...student.growthRecords.map((item) => ({
      id: `growth-diary-${item.id}`,
      date: item.date,
      title: item.source,
      content: `${item.type === '收入' ? '获得' : '消耗'}成长值 ${Math.abs(item.delta)}，当前余额 ${item.balance}。`,
    })),
    ...diaryItems.map((item) => ({ ...item, id: `growth-${item.id}`, title: item.title.replace('研学日记', '成长日记') })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Tabs
      items={[
        {
          key: 'study',
          label: '研学团队',
          children: <List dataSource={student.studyRecords} renderItem={(item) => <List.Item>{item.date} · {item.type} · {item.teamName} · {item.score} 分</List.Item>} />,
        },
        {
          key: 'task',
          label: '研学任务',
          children: <List dataSource={student.taskRecords} renderItem={(item) => <List.Item>{item.date} · {item.taskName} · {item.rating}</List.Item>} />,
        },
        {
          key: 'growth',
          label: '成长值',
          children: <List dataSource={student.growthRecords} renderItem={(item) => <List.Item>{item.date} · {item.source} · {item.delta > 0 ? '+' : ''}{item.delta}</List.Item>} />,
        },
        {
          key: 'capability',
          label: '能力指数',
          children: (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Row gutter={[12, 12]}>
                <Col span={8}><Card size="small"><Statistic title="当前能力指数" value={student.capabilityScore} precision={1} /></Card></Col>
                <Col span={8}><Card size="small"><Statistic title="能力记录" value={student.capabilityRecords.length} /></Card></Col>
                <Col span={8}><Card size="small"><Statistic title="能力元素" value={elements.length} /></Card></Col>
              </Row>
              <Row gutter={[12, 12]}>
                <Col span={12}><RadarPanel title="优势能力雷达" rows={strongest.map((item) => ({ name: item.name, score: item.score, average: item.average }))} /></Col>
                <Col span={12}><RadarPanel title="待提升能力雷达" rows={weakest.map((item) => ({ name: item.name, score: item.score, average: item.average }))} /></Col>
              </Row>
              <List dataSource={student.capabilityRecords} renderItem={(item) => <List.Item>{item.changedAt} · {item.element} · {item.oldValue} → {item.newValue} · {item.source}</List.Item>} />
              <Card size="small" title="48 个能力元素指数">
                <Row gutter={[8, 8]}>
                  {elementScores.map((item) => (
                    <Col span={8} key={item.id}>
                      <Tag>{item.plane} / {item.indicator} / {item.name}：{item.score.toFixed(1)}</Tag>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Space>
          ),
        },
        {
          key: 'assessment',
          label: '能力评测',
          children: <List dataSource={student.assessments} renderItem={(item) => <List.Item>{item.createdAt} · {item.type} · {item.score} 分</List.Item>} />,
        },
        {
          key: 'reports',
          label: '研学报告',
          children: (
            <List
              dataSource={reportItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.title} description={`${item.date} · ${item.summary} · 已同步家长端与设备端`} />
                </List.Item>
              )}
            />
          ),
        },
        {
          key: 'orders',
          label: '订单',
          children: <List dataSource={orderItems} renderItem={(item) => <List.Item>{item.title} · ￥{item.amount.toFixed(2)} · {item.status}</List.Item>} />,
        },
        {
          key: 'courses',
          label: '课程',
          children: <List dataSource={courseItems} renderItem={(item) => <List.Item>{item.title} · 学习进度 {item.progress}%</List.Item>} />,
        },
        {
          key: 'diary',
          label: '研学日记',
          children: <Timeline items={diaryItems.map((item) => ({ children: <Space direction="vertical" size={2}><Text strong>{item.date} · {item.title}</Text><Text type="secondary">{item.content}</Text></Space> }))} />,
        },
        {
          key: 'growth-diary',
          label: '成长日记',
          children: <Timeline items={growthDiaryItems.map((item) => ({ children: <Space direction="vertical" size={2}><Text strong>{item.date} · {item.title}</Text><Text type="secondary">{item.content}</Text></Space> }))} />,
        },
      ]}
    />
  );
}

function StudentsPage() {
  const { state } = useAdminStore();
  const [detail, setDetail] = useState<StudentProfile | null>(null);
  const studyRanges = {
    '0': (value: number) => value === 0,
    '1': (value: number) => value === 1,
    '2-5次': (value: number) => value >= 2 && value <= 5,
    '6-10次': (value: number) => value >= 6 && value <= 10,
    '10+': (value: number) => value > 10,
  };
  const taskRanges = {
    '0': (value: number) => value === 0,
    '1-10': (value: number) => value >= 1 && value <= 10,
    '11-50': (value: number) => value >= 11 && value <= 50,
    '50-100': (value: number) => value > 50 && value <= 100,
    '100+': (value: number) => value > 100,
  };
  const growthRanges = {
    '1000以下': (value: number) => value < 1000,
    '1千-1万': (value: number) => value >= 1000 && value <= 10000,
    '10001-5万': (value: number) => value > 10000 && value <= 50000,
    '50001-10万': (value: number) => value > 50000 && value <= 100000,
    '100001-20万': (value: number) => value > 100000 && value <= 200000,
    '20万+': (value: number) => value > 200000,
  };
  const { filteredRecords: filteredStudents, toolbar } = useListFilters<StudentProfile>(
    state.students,
    [
      { name: 'keyword', label: '学员关键词', placeholder: '姓名 / 学校 / 家长 / 手机号', match: textMatcher((item) => item.name, (item) => item.school, (item) => item.parentName, (item) => item.parentPhone) },
      { name: 'school', label: '学校', type: 'select', options: makeOptions(state.students.map((item) => item.school)), match: equalsMatcher((item) => item.school) },
      { name: 'boundDevice', label: '设备绑定', type: 'select', options: [{ label: '已绑定', value: true }, { label: '未绑定', value: false }], match: equalsMatcher((item) => item.boundDevice) },
      { name: 'studyRange', label: '研学次数', type: 'select', options: Object.keys(studyRanges).map((value) => ({ label: value, value })), match: numberBucketMatcher((item) => item.studyCount, studyRanges) },
      { name: 'taskRange', label: '完成任务数', type: 'select', options: Object.keys(taskRanges).map((value) => ({ label: value, value })), match: numberBucketMatcher((item) => item.taskRecords.length, taskRanges) },
      { name: 'orderRange', label: '付费订单数', type: 'select', options: Object.keys(studyRanges).map((value) => ({ label: value, value })), match: numberBucketMatcher((item) => item.assessments.length, studyRanges) },
      { name: 'growthRange', label: '累计成长值', type: 'select', options: Object.keys(growthRanges).map((value) => ({ label: value, value })), match: numberBucketMatcher((item) => item.growthValue, growthRanges) },
    ],
    <Button onClick={() => exportStudents(state.students)}>导出学员档案</Button>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="学员档案" subtitle="检索学员研学记录、能力指数与成长值变化。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredStudents} columns={[
          { title: '学员姓名', dataIndex: 'name' },
          { title: '年龄', dataIndex: 'age' },
          { title: '学校', dataIndex: 'school' },
          { title: '设备绑定', render: (_, record: StudentProfile) => <Tag color={record.boundDevice ? 'success' : 'default'}>{record.boundDevice ? '已绑定' : '未绑定'}</Tag> },
          { title: '研学次数', dataIndex: 'studyCount' },
          { title: '完成任务数', render: (_, record: StudentProfile) => record.taskRecords.length },
          { title: '能力指数', dataIndex: 'capabilityScore' },
          { title: '成长值', dataIndex: 'growthValue' },
          { title: '操作', render: (_, record: StudentProfile) => <Button type="link" onClick={() => setDetail(record)}>详情</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(detail)} title={detail?.name} onClose={() => setDetail(null)} width={720}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space>
              <Button onClick={() => exportStudentReport(detail)}>导出研学报告</Button>
              <Button onClick={() => exportStudentCapabilitySummary(detail)}>导出能力图表摘要</Button>
            </Space>
            <Descriptions bordered column={2} size="small" items={[
              { key: '1', label: '年龄', children: detail.age },
              { key: '2', label: '学校', children: detail.school },
              { key: '3', label: '家长', children: detail.parentName },
              { key: '4', label: '家长电话', children: detail.parentPhone },
              { key: '5', label: '能力指数', children: detail.capabilityScore },
              { key: '6', label: '成长值', children: detail.growthValue },
            ]} />
            <Card title="能力图表">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {abilitySummary(detail).map((item) => (
                  <div key={item.key}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{item.key}</Text>
                      <Text>{item.value.toFixed(1)}</Text>
                    </Space>
                    <div className="ability-bar-track">
                      <div className="ability-bar-fill" style={{ width: `${item.value * 10}%` }} />
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
            <StudentDetailTabs student={detail} elements={state.capabilityElements} />
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function BasesPage({ mode }: { mode: AdminRole }) {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const { editorId, cityIds } = useCityScope();
  const [editing, setEditing] = useState<StudyBase | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const records = mode === 'city_maintainer' ? state.bases.filter((item) => cityIds.includes(item.city)) : state.bases;

  function openEditor(record?: StudyBase) {
    setEditing(record ?? null);
    setOpen(true);
    form.setFieldsValue(record ?? { city: cityIds[0] ?? '深圳市-南山区', chargeType: '免费', reservationNeeded: true, groupReservationNeeded: true, bestStages: ['小学高段'], audience: '小学高段-初中', openingHours: '09:00-18:00' });
  }

  function submit(values: any) {
    actions.saveBase(
      {
        ...values,
        createdBy: editorId,
        createdByRole: mode,
        pois: editing?.pois ?? [],
      },
      mode,
      editorId,
      editing?.id,
    );
    message.success(mode === 'city_maintainer' ? '基地记录已提交审核' : '基地台账已更新');
    setOpen(false);
    setEditing(null);
  }
  const { filteredRecords: filteredBases, toolbar } = useListFilters<StudyBase>(
    records,
    [
      { name: 'keyword', label: '基地关键词', placeholder: '基地名称 / 地址 / 人群', match: textMatcher((item) => item.name, (item) => item.address, (item) => item.audience) },
      { name: 'city', label: '所在城市', type: 'select', options: makeOptions(records.map((item) => item.city)), match: equalsMatcher((item) => item.city) },
      { name: 'type', label: '基地类型', type: 'select', options: makeOptions(records.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'approvalStatus', label: '审核状态', type: 'select', options: makeOptions(records.map((item) => item.approvalStatus)), match: equalsMatcher((item) => item.approvalStatus) },
    ],
    <Button type="primary" onClick={() => openEditor()}>新增基地</Button>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title={mode === 'city_maintainer' ? '基地维护' : '研学基地'} subtitle="维护基地资料、热度、开放信息与受众范围。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredBases} columns={[
          { title: '城市', dataIndex: 'city' },
          { title: '基地名称', dataIndex: 'name' },
          { title: '基地类型', dataIndex: 'type' },
          { title: '热度', dataIndex: 'heat' },
          { title: '库存任务数', render: (_, record: StudyBase) => state.taskLibrary.filter((item) => item.baseId === record.id).length },
          { title: '累计团队数', render: (_, record: StudyBase) => state.taskLibrary.filter((item) => item.baseId === record.id).reduce((sum, item) => sum + (item.teamUseCount ?? 0), 0) },
          { title: '累计任务数', render: (_, record: StudyBase) => state.taskLibrary.filter((item) => item.baseId === record.id).reduce((sum, item) => sum + (item.completionCount ?? 0), 0) },
          { title: '收费类型', dataIndex: 'chargeType' },
          { title: '开放时间', dataIndex: 'openingHours' },
          { title: '审核状态', dataIndex: 'approvalStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          {
            title: '操作',
            render: (_, record: StudyBase) => (
              <Space>
                <Button type="link" onClick={() => openEditor(record)}>编辑</Button>
                <Button type="link" onClick={() => window.location.assign(`/task-library?baseId=${record.id}`)}>任务管理</Button>
              </Space>
            ),
          },
        ]} />
      </Card>
      <Drawer open={open} title={editing ? '编辑基地' : '新增基地'} onClose={() => setOpen(false)} width={560}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="所在城市" name="city" rules={[{ required: true, message: '请输入城市' }]}>
            <Input disabled={mode === 'city_maintainer'} />
          </Form.Item>
          <Form.Item label="基地名称" name="name" rules={[{ required: true, message: '请输入基地名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="基地类型" name="type" rules={[{ required: true, message: '请输入基地类型' }]}>
            <Select options={['景区', '名校', '营地', '公园', '购物中心'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item label="基地地址" name="address" rules={[{ required: true, message: '请输入基地地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="客服电话" name="servicePhone">
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="收费类型" name="chargeType"><Select options={['免费', '收费'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="开放时间" name="openingHours"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="团体预约" name="groupReservationNeeded"><Select options={[{ label: '需要', value: true }, { label: '不需要', value: false }]} /></Form.Item></Col>
            <Col span={12}><Form.Item label="最佳学段" name="bestStages"><Select mode="multiple" options={['幼儿园', '小学低段', '小学高段', '初中', '高中'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
          </Row>
          <Form.Item label="主要人群" name="audience"><Input /></Form.Item>
          <Button type="primary" htmlType="submit">{mode === 'city_maintainer' ? '提交审核' : '保存基地'}</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function TaskLibraryPage({ mode }: { mode: AdminRole }) {
  const { state, actions, selectors } = useAdminStore();
  const { message } = App.useApp();
  const { editorId, cityIds } = useCityScope();
  const [editing, setEditing] = useState<TaskLibraryItem | null>(null);
  const [teamUsageTask, setTeamUsageTask] = useState<TaskLibraryItem | null>(null);
  const [studentUsageTask, setStudentUsageTask] = useState<TaskLibraryItem | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const records = mode === 'city_maintainer' ? state.taskLibrary.filter((item) => cityIds.includes(item.city)) : state.taskLibrary;

  function openEditor(record?: TaskLibraryItem) {
    setEditing(record ?? null);
    setOpen(true);
    form.setFieldsValue(record ?? { city: cityIds[0] ?? '深圳市-南山区', applyTo: ['团体研学'], abilityTags: [], subjectTags: [], stageTags: [] });
  }

  function submit(values: any) {
    actions.saveTaskLibrary(
      {
        ...values,
        createdBy: editorId,
        createdByRole: mode,
      },
      mode,
      editorId,
      editing?.id,
    );
    message.success(mode === 'city_maintainer' ? '任务记录已提交审核' : '任务库已更新');
    setOpen(false);
    setEditing(null);
  }
  const { filteredRecords: filteredTaskLibrary, toolbar } = useListFilters<TaskLibraryItem>(
    records,
    [
      { name: 'keyword', label: '任务关键词', placeholder: '任务名称 / 说明 / 能力标签', match: textMatcher((item) => item.name, (item) => item.description, (item) => item.abilityTags.join('、')) },
      { name: 'city', label: '所在城市', type: 'select', options: makeOptions(records.map((item) => item.city)), match: equalsMatcher((item) => item.city) },
      { name: 'baseId', label: '关联基地', type: 'select', options: state.bases.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.baseId) },
      { name: 'typeId', label: '任务类型', type: 'select', options: state.taskTypes.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.typeId) },
      { name: 'approvalStatus', label: '审核状态', type: 'select', options: makeOptions(records.map((item) => item.approvalStatus)), match: equalsMatcher((item) => item.approvalStatus) },
      { name: 'teamUseRange', label: '团队数量', type: 'select', options: ['50以下', '51-200', '201-500', '501-1000', '1000+'].map((value) => ({ label: value, value })), match: numberBucketMatcher((item) => item.teamUseCount ?? 0, {
        '50以下': (value) => value < 50,
        '51-200': (value) => value >= 51 && value <= 200,
        '201-500': (value) => value >= 201 && value <= 500,
        '501-1000': (value) => value >= 501 && value <= 1000,
        '1000+': (value) => value > 1000,
      }) },
      { name: 'completionRange', label: '任务数量', type: 'select', options: ['100以下', '101-1000', '1001-5000', '5000+'].map((value) => ({ label: value, value })), match: numberBucketMatcher((item) => item.completionCount ?? 0, {
        '100以下': (value) => value < 100,
        '101-1000': (value) => value >= 101 && value <= 1000,
        '1001-5000': (value) => value >= 1001 && value <= 5000,
        '5000+': (value) => value > 5000,
      }) },
      { name: 'theme', label: '特色主题', type: 'select', options: makeOptions(records.flatMap((item) => item.subjectTags)), match: arrayIncludesMatcher((item) => item.subjectTags) },
    ],
    <>
      <Button onClick={() => { actions.writeOperationLog({ role: '运营管理员', operatorName: '运营总控台', feature: '任务库', target: '机构文档导入', content: '导入 Word 文档并生成任务列表', result: '待确认' }); message.success('已解析文档：成功导入 8 条，待补充 2 条'); }}>机构文档导入</Button>
      <Button onClick={() => { actions.writeOperationLog({ role: '运营管理员', operatorName: '运营总控台', feature: '任务库', target: '异构文档导入', content: '调用智能解析生成任务字段', result: '待确认' }); message.success('已生成异构文档解析结果，等待人工确认'); }}>异构文档导入</Button>
      <Button onClick={() => { actions.writeOperationLog({ role: '运营管理员', operatorName: '运营总控台', feature: '任务库', target: '从研学团队复制', content: '检索团队任务并复制到任务库', result: '成功' }); message.success('已从团队复制 4 条任务到任务库'); }}>从团队复制</Button>
      <Button type="primary" onClick={() => openEditor()}>新增任务</Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title={mode === 'city_maintainer' ? '任务维护' : '任务库'} subtitle="维护任务模板、标签与适用范围。" />
      {toolbar}
      <Row gutter={[12, 12]}>
        <Col span={8}><Card size="small"><Statistic title="任务库任务数" value={records.length} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="累计使用团队" value={records.reduce((sum, item) => sum + (item.teamUseCount ?? 0), 0)} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="累计完成任务" value={records.reduce((sum, item) => sum + (item.completionCount ?? 0), 0)} /></Card></Col>
      </Row>
      <Card>
        <Table rowKey="id" dataSource={filteredTaskLibrary} columns={[
          { title: '任务名称', dataIndex: 'name' },
          { title: '所在城市', dataIndex: 'city' },
          { title: '基地', render: (_, record: TaskLibraryItem) => selectors.getBaseById(record.baseId)?.name ?? '未关联' },
          { title: '任务类型', render: (_, record: TaskLibraryItem) => selectors.getTaskTypeById(record.typeId)?.name ?? '-' },
          { title: '能力标签', render: (_, record: TaskLibraryItem) => record.abilityTags.join('、') },
          { title: '团队数量', dataIndex: 'teamUseCount' },
          { title: '任务数量', dataIndex: 'completionCount' },
          { title: '审核状态', dataIndex: 'approvalStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          {
            title: '操作',
            render: (_, record: TaskLibraryItem) => (
              <Space>
                <Button type="link" onClick={() => openEditor(record)}>编辑</Button>
                <Button type="link" onClick={() => setTeamUsageTask(record)}>查看团队</Button>
                <Button type="link" onClick={() => setStudentUsageTask(record)}>查看任务</Button>
              </Space>
            ),
          },
        ]} />
      </Card>
      <Drawer open={open} title={editing ? '编辑任务' : '新增任务'} onClose={() => setOpen(false)} width={620}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="所在城市" name="city" rules={[{ required: true, message: '请输入城市' }]}><Input disabled={mode === 'city_maintainer'} /></Form.Item></Col>
            <Col span={12}><Form.Item label="任务名称" name="name" rules={[{ required: true, message: '请输入任务名称' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="关联基地" name="baseId"><Select allowClear showSearch optionFilterProp="label" options={state.bases.filter((item) => mode === 'operator' || cityIds.includes(item.city)).map((item) => ({ label: item.name, value: item.id }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="任务类型" name="typeId" rules={[{ required: true, message: '请选择任务类型' }]}><Select showSearch optionFilterProp="label" options={state.taskTypes.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item></Col>
          </Row>
          <Form.Item label="任务说明" name="description" rules={[{ required: true, message: '请输入任务说明' }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item label="作品要求" name="workRequirements"><Select mode="tags" placeholder="例如：照片、文字记录、视频作品" /></Form.Item>
          <Form.Item label="能力标签" name="abilityTags"><Select mode="tags" /></Form.Item>
          <Form.Item label="关联学科" name="subjectTags"><Select mode="tags" /></Form.Item>
          <Form.Item label="适合学段" name="stageTags"><Select mode="tags" /></Form.Item>
          <Form.Item label="适用研学类型" name="applyTo"><Select mode="multiple" options={['团体研学', '家庭研学', '难题挑战', 'PBL研学'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">{mode === 'city_maintainer' ? '提交审核' : '保存任务'}</Button>
        </Form>
      </Drawer>
      <Drawer open={Boolean(teamUsageTask)} title={teamUsageTask ? `${teamUsageTask.name} · 近期使用团队` : '近期使用团队'} onClose={() => setTeamUsageTask(null)} width={680}>
        <List
          dataSource={state.teams.slice(0, 5)}
          renderItem={(team) => (
            <List.Item>
              <List.Item.Meta title={team.name} description={`${team.startDate} · ${team.lineName} · 学员 ${team.studentCount} · 任务 ${team.taskCount}`} />
            </List.Item>
          )}
        />
      </Drawer>
      <Drawer open={Boolean(studentUsageTask)} title={studentUsageTask ? `${studentUsageTask.name} · 完成学员明细` : '完成学员明细'} onClose={() => setStudentUsageTask(null)} width={680}>
        <Table
          rowKey="id"
          dataSource={state.students.slice(0, 50)}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: '学员', dataIndex: 'name' },
            { title: '学校', dataIndex: 'school' },
            { title: '完成任务数', render: (_, record: StudentProfile) => record.taskRecords.length },
            { title: '最近评分', render: (_, record: StudentProfile) => record.taskRecords[0]?.score ?? '-' },
          ]}
        />
      </Drawer>
    </Space>
  );
}

function AuditsPage({ mode }: { mode: AdminRole }) {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const { editorId } = useCityScope();
  const [current, setCurrent] = useState<AuditRecord | null>(null);
  const [detail, setDetail] = useState<AuditRecord | null>(null);
  const [form] = Form.useForm();

  const records =
    mode === 'city_maintainer' ? state.audits.filter((item) => item.maintainerId === editorId) : state.audits;
  const returnedRecords = records.filter((item) => item.status === '退回修改');
  const { filteredRecords: filteredAudits, toolbar } = useListFilters<AuditRecord>(
    records,
    [
      { name: 'keyword', label: '审核关键词', placeholder: '标题 / 维护员 / 备注', match: textMatcher((item) => item.title, (item) => item.maintainerName, (item) => item.note) },
      { name: 'province', label: '省份', type: 'select', options: [{ label: '广东省', value: '广东省' }], match: () => true },
      { name: 'targetType', label: '数据类型', type: 'select', options: makeOptions(records.map((item) => item.targetType)), match: equalsMatcher((item) => item.targetType) },
      { name: 'city', label: '城市', type: 'select', options: makeOptions(records.map((item) => item.city)), match: equalsMatcher((item) => item.city) },
      { name: 'status', label: '审核状态', type: 'select', options: makeOptions(records.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    mode === 'operator' ? <Button onClick={() => exportAuditPerformance(state.audits, state.partTimers)}>导出审核统计</Button> : undefined,
  );

  function submit(values: { status: '退回修改' | '已确认'; note: string }) {
    if (!current) return;
    actions.reviewAudit(current.id, values.status, values.note);
    message.success('审核结果已提交');
    setCurrent(null);
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader
        title={mode === 'city_maintainer' ? '审核记录' : '数据审核'}
        subtitle={mode === 'city_maintainer' ? '查看本人提交后的审核结果与反馈。' : '审核兼职维护员提交的基地和任务记录。'}
      />
      {toolbar}
      {mode === 'city_maintainer' && returnedRecords.length > 0 ? (
        <Card title="退回修改提醒">
          <List dataSource={returnedRecords} renderItem={(item) => <List.Item>{item.title} · {item.note}</List.Item>} />
        </Card>
      ) : null}
      <Card>
        <Tabs
          items={['全部', '基地', '任务'].map((tab) => {
            const dataSource = tab === '全部' ? filteredAudits : filteredAudits.filter((item) => item.targetType === tab);
            return {
              key: tab,
              label: tab === '全部' ? '全部审核' : `${tab}数据审核`,
              children: (
                <Table rowKey="id" dataSource={dataSource} columns={[
                  { title: '类型', dataIndex: 'targetType' },
                  { title: '标题', dataIndex: 'title' },
                  { title: '省份', render: () => '广东省' },
                  { title: '城市', dataIndex: 'city' },
                  { title: '维护员', dataIndex: 'maintainerName' },
                  { title: '提交时间', dataIndex: 'submittedAt' },
                  { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
                  { title: '备注', dataIndex: 'note' },
                  {
                    title: '操作',
                    render: (_: unknown, record: AuditRecord) => (
                      <Space>
                        <Button type="link" onClick={() => setDetail(record)}>详情</Button>
                        {mode === 'operator' ? <Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue({ status: '已确认', note: record.note }); }}>审核</Button> : null}
                      </Space>
                    ),
                  },
                ]} />
              ),
            };
          })}
        />
      </Card>
      {mode === 'operator' ? (
        <Drawer open={Boolean(current)} title={current?.title} onClose={() => setCurrent(null)} width={480}>
          <Form form={form} layout="vertical" onFinish={submit}>
            <Form.Item label="审核结果" name="status">
              <Select options={['已确认', '退回修改'].map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item label="处理说明" name="note">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Button type="primary" htmlType="submit">提交审核</Button>
          </Form>
        </Drawer>
      ) : null}
      <Drawer open={Boolean(detail)} title={detail?.title} onClose={() => setDetail(null)} width={560}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '数据类型', children: detail.targetType },
              { key: '2', label: '省份/城市', children: `广东省 / ${detail.city}` },
              { key: '3', label: '提交人员', children: detail.maintainerName },
              { key: '4', label: '提交时间', children: detail.submittedAt },
              { key: '5', label: '审核状态', children: <Tag color={statusColor(detail.status)}>{detail.status}</Tag> },
              { key: '6', label: '审核信息', children: detail.note },
            ]} />
            <Card title="关联数据">
              <Text type="secondary">
                {detail.targetType === '基地'
                  ? state.bases.find((item) => item.id === detail.targetId)?.address ?? '未找到基地详情'
                  : state.taskLibrary.find((item) => item.id === detail.targetId)?.description ?? '未找到任务详情'}
              </Text>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function TeamPhotosPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [currentPhoto, setCurrentPhoto] = useState<any>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();

  function submit(values: { linkedStudentIds: string[]; status: PhotoRecognitionStatus; note: string }) {
    actions.savePhotoLinks(currentPhoto.id, values.linkedStudentIds, values.status, values.note);
    message.success('照片关联结果已更新');
    setCurrentPhoto(null);
  }
  const photoGroups = state.teams.map((team) => {
    const photos = state.teamPhotos.filter((item) => item.teamId === team.id);
    return {
      id: team.id,
      teamName: team.name,
      lineName: team.lineName,
      mentorName: state.mentors.find((item) => item.id === team.mentorId)?.name ?? '待安排',
      total: photos.length,
      groupCount: photos.filter((item) => item.linkedStudentIds.length > 1).length,
      singleCount: photos.filter((item) => item.linkedStudentIds.length <= 1).length,
      pendingCount: photos.filter((item) => item.status !== '已关联').length,
      photos,
    };
  });
  const { filteredRecords: filteredTeamPhotos, toolbar } = useListFilters<any>(
    photoGroups,
    [
      { name: 'keyword', label: '团队关键词', placeholder: '团队名称 / 线路 / 导师', match: textMatcher((item) => item.teamName, (item) => item.lineName, (item) => item.mentorName) },
      { name: 'teamId', label: '所属团队', type: 'select', options: state.teams.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.id) },
    ],
    <Button icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>批量上传照片</Button>,
  );
  const activePhotoTeam = currentTeam ? photoGroups.find((item) => item.id === currentTeam.id) ?? currentTeam : null;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="团队照片" subtitle="照片上传后进入识别流程，支持人工修正后写入成长记录。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredTeamPhotos} columns={[
          { title: '团队名称', dataIndex: 'teamName' },
          { title: '线路名称', dataIndex: 'lineName' },
          { title: '导师', dataIndex: 'mentorName' },
          { title: '照片数量', dataIndex: 'total' },
          { title: '团体照片数量', dataIndex: 'groupCount' },
          { title: '单人照片数量', dataIndex: 'singleCount' },
          { title: '待修正', dataIndex: 'pendingCount', render: (value: number) => <Tag color={value > 0 ? 'warning' : 'success'}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => setCurrentTeam(record)}>照片管理</Button> },
        ]} />
      </Card>
      <Modal
        open={uploadOpen}
        title="批量上传团队照片"
        okText="上传照片"
        cancelText="取消"
        onCancel={() => setUploadOpen(false)}
        onOk={() => uploadForm.submit()}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          initialValues={{ teamId: state.teams[0]?.id }}
          onFinish={(values: { teamId: string; files?: Array<{ name?: string }> }) => {
            const fileNames = (values.files ?? []).map((item) => item.name ?? '团队照片.jpg');
            actions.batchUploadTeamPhotos(values.teamId, fileNames);
            message.success(`已上传 ${fileNames.length} 张团队照片`);
            setUploadOpen(false);
            uploadForm.resetFields();
          }}
        >
          <Form.Item label="选择团队" name="teamId" rules={[{ required: true, message: '请选择团队' }]}>
            <Select showSearch optionFilterProp="label" options={state.teams.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item
            label="上传照片"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
            rules={[{ required: true, message: '请选择照片' }]}
          >
            <Upload beforeUpload={() => false} multiple accept="image/*">
              <Button icon={<UploadOutlined />}>打开电脑文件夹选择图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer open={Boolean(activePhotoTeam)} title={activePhotoTeam?.teamName} onClose={() => setCurrentTeam(null)} width={720}>
        <List
          dataSource={activePhotoTeam?.photos ?? []}
          locale={{ emptyText: '暂无团队照片' }}
          renderItem={(photo: any, index) => (
            <List.Item
              actions={[
                <Button key="edit" type="link" onClick={() => { setCurrentPhoto(photo); form.setFieldsValue(photo); }}>修正</Button>,
                <Button key="hide" type="link" onClick={() => { actions.toggleTeamPhotoHidden(photo.id); message.success(photo.hidden ? '已取消屏蔽' : '照片已屏蔽'); }}>{photo.hidden ? '取消屏蔽' : '屏蔽'}</Button>,
                <Button key="delete" type="link" danger onClick={() => { actions.writeOperationLog({ role: '运营管理员', operatorName: '运营总控台', feature: '团队照片', target: photo.title, content: '删除团队照片', result: '成功' }); message.success('照片删除记录已保存'); }}>删除</Button>,
              ]}
            >
              <List.Item.Meta
                title={<Space>{`${activePhotoTeam?.id ?? 'team'}-${String(index + 1).padStart(3, '0')} · ${photo.title}`}{photo.hidden ? <Tag color="red">已屏蔽</Tag> : null}</Space>}
                description={`${photo.uploadedAt} · ${photo.status} · 已关联 ${photo.linkedStudentIds.length} 名学员 · ${photo.note}`}
              />
            </List.Item>
          )}
        />
      </Drawer>
      <Drawer open={Boolean(currentPhoto)} title={currentPhoto?.title} onClose={() => setCurrentPhoto(null)} width={520}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="关联学员" name="linkedStudentIds">
            <Select mode="multiple" options={state.students.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item label="识别状态" name="status">
            <Select options={['识别中', '已关联', '待修正'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item label="修正说明" name="note">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit">保存修正结果</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function TaskTypesPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredTaskTypes, toolbar } = useListFilters<any>(
    state.taskTypes,
    [
      { name: 'keyword', label: '类型关键词', placeholder: '类型名称 / 要求 / 评分规则', match: textMatcher((item) => item.name, (item) => item.defaultRequirement, (item) => item.defaultRule) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增类型</Button>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="任务类型" subtitle="维护任务类型及默认作品要求、评分规则。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredTaskTypes} columns={[
          { title: '类型名称', dataIndex: 'name' },
          { title: '默认作品要求', dataIndex: 'defaultRequirement' },
          { title: '默认评分规则', dataIndex: 'defaultRule' },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑任务类型' : '新增任务类型'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveTaskType(values, editingId); setOpen(false); }}>
          <Form.Item label="类型名称" name="name" rules={[{ required: true, message: '请输入类型名称' }]}><Input /></Form.Item>
          <Form.Item label="默认作品要求" name="defaultRequirement" rules={[{ required: true, message: '请输入作品要求' }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="默认评分规则" name="defaultRule" rules={[{ required: true, message: '请输入评分规则' }]}><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" htmlType="submit">保存类型</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function TaskBuilderPage() {
  const { state, actions, selectors } = useAdminStore();
  const [templateId, setTemplateId] = useState(state.builderTemplates[0]?.id ?? '');
  const router = useRouter();
  const template = selectors.getBuilderTemplateById(templateId);
  const previewUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/preview/task-template/${templateId}`
      : `/preview/task-template/${templateId}`;

  if (!template) {
    return <Empty description="暂无任务配置模板" />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="任务配置" subtitle="支持区块重排、实时预览与扫码查看任务详情。" />
      <Card>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Select value={templateId} onChange={setTemplateId} options={state.builderTemplates.map((item) => ({ label: item.title, value: item.id }))} style={{ width: 360 }} />
          <Row gutter={16}>
            <Col span={14}>
              <Card size="small" title="区块编排">
                <List
                  dataSource={template.blocks}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button key="up" type="link" disabled={index === 0} onClick={() => actions.moveBuilderBlock(template.id, index, index - 1)}>上移</Button>,
                        <Button key="down" type="link" disabled={index === template.blocks.length - 1} onClick={() => actions.moveBuilderBlock(template.id, index, index + 1)}>下移</Button>,
                      ]}
                    >
                      <List.Item.Meta title={item.type} description={item.content} />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={10}>
              <Card size="small" title="扫码预览">
                <Space direction="vertical" size={12}>
                  <QRCode value={previewUrl} />
                  <Text copyable>{previewUrl}</Text>
                  <Button type="primary" onClick={() => router.push(`/preview/task-template/${template.id}`)}>打开预览页</Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    </Space>
  );
}

function TaskImportPage() {
  const { state, actions } = useAdminStore();
  const { filteredRecords: filteredImportJobs, toolbar } = useListFilters<any>(
    state.importJobs,
    [
      { name: 'keyword', label: '导入关键词', placeholder: '任务标题 / 解析结果', match: textMatcher((item) => item.title, (item) => item.result) },
      { name: 'sourceType', label: '来源类型', type: 'select', options: makeOptions(state.importJobs.map((item) => item.sourceType)), match: equalsMatcher((item) => item.sourceType) },
      { name: 'status', label: '处理状态', type: 'select', options: makeOptions(state.importJobs.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="智能录入" subtitle="展示批量导入与文档解析流程，支持从上传推进到入库确认。" />
      {toolbar}
      <Row gutter={[16, 16]}>
        {filteredImportJobs.map((job) => (
          <Col span={12} key={job.id}>
            <Card title={job.title}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Tag color={statusColor(job.status)}>{job.status}</Tag>
                <Text type="secondary">{job.result}</Text>
                <Steps
                  size="small"
                  current={job.status === '上传完成' ? 0 : job.status === '解析中' ? 1 : job.status === '待确认' ? 2 : 3}
                  items={[{ title: '上传' }, { title: '解析' }, { title: '确认' }, { title: '入库' }]}
                />
                <Row gutter={12}>
                  <Col span={12}>
                    <Card size="small" title="成功导入任务">
                      <List
                        size="small"
                        dataSource={job.successTasks ?? []}
                        locale={{ emptyText: '暂无成功任务' }}
                        renderItem={(item: { name: string; baseName: string; status: string }) => <List.Item>{item.name} · {item.baseName} · {item.status}</List.Item>}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="待补充任务">
                      <List
                        size="small"
                        dataSource={job.failedTasks ?? []}
                        locale={{ emptyText: '暂无待补充任务' }}
                        renderItem={(item: { name: string; missingFields: string[]; status: string }) => (
                          <List.Item actions={[<Button key="edit" type="link" size="small">在线修改</Button>]}>
                            {item.name} · 缺失：{item.missingFields.join('、')} · {item.status}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
                <Space>
                  {job.status !== '待确认' && job.status !== '已入库' ? <Button onClick={() => actions.advanceImportJob(job.id)}>推进流程</Button> : null}
                  {job.status === '待确认' ? <Button type="primary" onClick={() => actions.applyImportJob(job.id)}>确认入库</Button> : null}
                  <Button onClick={() => actions.writeOperationLog({ role: '运营管理员', operatorName: '运营总控台', feature: '智能录入', target: job.title, content: '导出待补充任务列表', result: '成功' })}>导出失败列表</Button>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

function PartTimersPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredPartTimers, toolbar } = useListFilters<any>(
    state.partTimers,
    [
      { name: 'keyword', label: '人员关键词', placeholder: '姓名 / 账号 / 手机号', match: textMatcher((item) => item.name, (item) => item.account, (item) => item.phone) },
      { name: 'cityId', label: '负责城市', type: 'select', options: makeOptions(state.partTimers.flatMap((item) => item.cityIds)), match: arrayIncludesMatcher((item) => item.cityIds) },
      { name: 'status', label: '账号状态', type: 'select', options: makeOptions(state.partTimers.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增维护员</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="兼职人员" subtitle="维护城市授权范围、账号状态与联系信息。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredPartTimers} columns={[
          { title: '姓名', dataIndex: 'name' },
          { title: '账号', dataIndex: 'account' },
          { title: '手机号', dataIndex: 'phone' },
          { title: '负责城市', render: (_, record: any) => record.cityIds.join('、') },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑维护员' : '新增维护员'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.savePartTimer(values, editingId); setOpen(false); }}>
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}><Input /></Form.Item>
          <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}><Input /></Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}><Input /></Form.Item>
          <Form.Item label="负责城市" name="cityIds" rules={[{ required: true, message: '请选择城市' }]}><Select mode="tags" /></Form.Item>
          <Form.Item label="状态" name="status" initialValue="启用"><Select options={['启用', '停用'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">保存维护员</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function PerformancePage({ mode }: { mode: AdminRole }) {
  const { state } = useAdminStore();
  const { editorId } = useCityScope();
  const maintainers = mode === 'city_maintainer' ? state.partTimers.filter((item) => item.id === editorId) : state.partTimers;
  const { filteredRecords: filteredMaintainers, toolbar } = useListFilters<any>(
    maintainers,
    [
      { name: 'keyword', label: '维护员关键词', placeholder: '姓名 / 城市', match: textMatcher((item) => item.name, (item) => item.cityIds.join('、')) },
      { name: 'dateRange', label: '日期范围', placeholder: '例如 2026-05', match: () => true },
      { name: 'phone', label: '维护员手机号', placeholder: '请输入手机号', match: textMatcher((item) => item.phone) },
      { name: 'cityId', label: '负责城市', type: 'select', options: makeOptions(maintainers.flatMap((item) => item.cityIds)), match: arrayIncludesMatcher((item) => item.cityIds) },
    ],
    mode === 'operator' ? <Button onClick={() => exportAuditPerformance(state.audits, state.partTimers)}>导出业绩统计</Button> : undefined,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="业绩统计" subtitle="按维护员汇总基地、任务与审核通过情况。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredMaintainers} columns={[
          { title: '维护员', dataIndex: 'name' },
          { title: '负责城市', render: (_, record: any) => record.cityIds.join('、') },
          { title: '基地录入数', dataIndex: 'baseCount' },
          { title: '任务录入数', dataIndex: 'taskCount' },
          { title: '基地审核通过', render: (_, record: any) => state.audits.filter((item) => item.maintainerId === record.id && item.targetType === '基地' && item.status === '已确认').length },
          { title: '任务审核通过', render: (_, record: any) => state.audits.filter((item) => item.maintainerId === record.id && item.targetType === '任务' && item.status === '已确认').length },
          { title: '审核通过数', dataIndex: 'passedCount' },
          { title: '通过率', render: (_, record: any) => `${Math.round((record.passedCount / Math.max(record.baseCount + record.taskCount, 1)) * 100)}%` },
        ]} />
      </Card>
    </Space>
  );
}

function DevicesPage() {
  const { state } = useAdminStore();
  const [detail, setDetail] = useState<any>(null);
  const { filteredRecords: filteredDevices, toolbar } = useListFilters<any>(
    state.devices,
    [
      { name: 'keyword', label: '设备关键词', placeholder: '序列号 / 批次 / 最近动作', match: textMatcher((item) => item.serialNumber, (item) => item.batch, (item) => item.lastAction) },
      { name: 'batch', label: '批次', type: 'select', options: makeOptions(state.devices.map((item) => item.batch)), match: equalsMatcher((item) => item.batch) },
      { name: 'status', label: '设备状态', type: 'select', options: makeOptions(state.devices.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'movementDate', label: '出入库日期', placeholder: '例如 2026-05', match: textMatcher((item) => item.lastMovementDate) },
    ],
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="设备台账" subtitle="统一查看序列号池、设备状态与远程擦除记录。" />
      {toolbar}
      <Card title="设备序列号池">
        <Table rowKey="id" dataSource={filteredDevices} pagination={{ pageSize: 8 }} columns={[
          { title: '序列号', dataIndex: 'serialNumber' },
          { title: '批次', dataIndex: 'batch' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '最后出入库日期', dataIndex: 'lastMovementDate' },
          { title: '租赁次数', dataIndex: 'rentalTimes' },
          { title: '租赁天数', dataIndex: 'rentalDays' },
          { title: '最近动作', dataIndex: 'lastAction' },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => setDetail(record)}>详情</Button> },
        ]} />
      </Card>
      <Card title="远程擦除记录">
        <List dataSource={state.erasureRecords} locale={{ emptyText: '当前无擦除记录' }} renderItem={(item) => <List.Item>{item.createdAt} · {item.serialNumber} · {item.status}</List.Item>} />
      </Card>
      <Drawer open={Boolean(detail)} title={detail?.serialNumber} onClose={() => setDetail(null)} width={620}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '当前状态', children: <Tag color={statusColor(detail.status)}>{detail.status}</Tag> },
              { key: '2', label: '所在分仓', children: state.warehouses.find((item) => item.id === detail.warehouseId)?.name ?? '-' },
              { key: '3', label: '最后出入库日期', children: detail.lastMovementDate ?? '-' },
              { key: '4', label: '租赁统计', children: `${detail.rentalTimes ?? 0} 次 / ${detail.rentalDays ?? 0} 天` },
            ]} />
            <Card title="租赁明细">
              <List
                dataSource={state.rentalOrders.filter((order) => order.deviceSerials.includes(detail.serialNumber))}
                locale={{ emptyText: '暂无租赁明细' }}
                renderItem={(order) => <List.Item>{order.id} · {order.teamName} · {order.rentalDate} · {order.status}</List.Item>}
              />
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function SalesOnlinePage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [current, setCurrent] = useState<any>(null);
  const [logisticsUploadOpen, setLogisticsUploadOpen] = useState(false);
  const [form] = Form.useForm();
  const warehouseAllowed = canUse(state.demoRole, ['warehouse']);
  const { filteredRecords: filteredOnlineSales, toolbar } = useListFilters<any>(
    state.onlineSales,
    [
      { name: 'keyword', label: '订单关键词', placeholder: '订单号 / 购买人 / 手机号', match: textMatcher((item) => item.id, (item) => item.buyerName, (item) => item.phone) },
      { name: 'orderDate', label: '销售日期范围', placeholder: '例如 2026-04', match: textMatcher((item) => item.orderDate) },
      { name: 'shippedAt', label: '发货日期范围', placeholder: '例如 2026-04', match: textMatcher((item) => item.shippedAt) },
      { name: 'status', label: '发货状态', type: 'select', options: makeOptions(state.onlineSales.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'address', label: '收货地址关键字', placeholder: '请输入地址', match: textMatcher((item) => item.address) },
    ],
    <>
      <Button onClick={() => { actions.writeOperationLog({ role: '物流人员', operatorName: '商城发货岗', feature: '在线销售', target: '订单导出', content: '导出订单 Excel 给快递系统打印面单', result: '成功' }); message.success('订单 Excel 已生成'); }}>订单导出</Button>
      <Button disabled={!warehouseAllowed} onClick={() => setLogisticsUploadOpen(true)}>物流信息导入</Button>
    </>,
  );
  function submit(values: { serials: string; expressCompany: string; expressNo: string }) {
    const serials = values.serials.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean);
    actions.shipOnlineSale(current.id, serials, values.expressCompany, values.expressNo);
    message.success('发货信息已更新');
    setCurrent(null);
  }
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="在线销售" subtitle="管理商城订单、发货信息与设备出库。" />
      <RolePermissionBanner demoRole={state.demoRole} roles={['warehouse']} scene="在线销售发货与物流导入" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredOnlineSales} columns={[
          { title: '订单号', dataIndex: 'id' },
          { title: '购买人', dataIndex: 'buyerName' },
          { title: '手机号', dataIndex: 'phone' },
          { title: '订单时间', dataIndex: 'orderDate' },
          { title: '订单状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '订购数量', dataIndex: 'quantity' },
          { title: '实付金额', dataIndex: 'paidAmount' },
          { title: '发货时间', dataIndex: 'shippedAt' },
          { title: '操作', render: (_, record: any) => <Space><Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue({ serials: record.deviceSerials.join('\n'), expressCompany: record.expressCompany, expressNo: record.expressNo }); }}>详情/发货</Button></Space> },
        ]} />
      </Card>
      <Drawer open={Boolean(current)} title={current?.id} onClose={() => setCurrent(null)} width={620}>
        {current ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '购买人', children: `${current.buyerName} / ${current.phone}` },
              { key: '2', label: '收货信息', children: `${current.receiver} · ${current.address}` },
              { key: '3', label: '订单金额', children: `￥${current.paidAmount}` },
              { key: '4', label: '物流信息', children: current.expressCompany ? `${current.expressCompany} ${current.expressNo}` : '待发货' },
            ]} />
            <Card title="发货">
              <Form form={form} layout="vertical" onFinish={submit}>
                <Form.Item label="设备序列号" name="serials" rules={[{ required: true, message: '请选择设备' }]}>
                  <Input.TextArea rows={4} placeholder="手工输入设备序列号，多个序列号可换行或用逗号分隔" />
                </Form.Item>
                <Form.Item label="快递公司" name="expressCompany" rules={[{ required: true, message: '请输入快递公司' }]}><Input /></Form.Item>
                <Form.Item label="快递单号" name="expressNo" rules={[{ required: true, message: '请输入快递单号' }]}><Input /></Form.Item>
                <Button disabled={!warehouseAllowed} type="primary" htmlType="submit">确认发货</Button>
              </Form>
            </Card>
          </Space>
        ) : null}
      </Drawer>
      <UploadMockModal
        open={logisticsUploadOpen}
        title="导入物流信息 Excel"
        accept=".xls,.xlsx"
        description="上传快递系统回传的物流 Excel，系统模拟更新订单物流状态、发货时间和设备出库。"
        resultName="WL"
        onCancel={() => setLogisticsUploadOpen(false)}
        onConfirm={(fileName) => {
          actions.importOnlineLogistics(fileName);
          message.success('物流信息 Excel 已导入');
        }}
      />
    </Space>
  );
}

function SalesEnterprisePage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [current, setCurrent] = useState<any>(null);
  const [agreementUploadTarget, setAgreementUploadTarget] = useState<any>(null);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const freeDevices = state.devices.filter((item) => item.status === '库存');
  const salesAllowed = canUse(state.demoRole, ['sales']);
  const { filteredRecords: filteredEnterpriseSales, toolbar } = useListFilters<any>(
    state.enterpriseSales,
    [
      { name: 'keyword', label: '订单关键词', placeholder: '订单号 / 客户名称 / 联系人', match: textMatcher((item) => item.id, (item) => item.customerName, (item) => item.contactName) },
      { name: 'saleDate', label: '销售日期范围', placeholder: '例如 2026-04', match: textMatcher((item) => item.saleDate) },
      { name: 'status', label: '订单状态', type: 'select', options: makeOptions(state.enterpriseSales.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'saleOwner', label: '销售员工', placeholder: '姓名或工号', match: textMatcher((item) => item.saleOwner) },
    ],
    <>
      <Button disabled={!salesAllowed} onClick={() => { actions.createEnterpriseSaleDraft(); message.success('企业订单已创建，状态为洽谈'); }}>新增企业订单</Button>
      <Button disabled={!salesAllowed || state.enterpriseSales.length === 0} onClick={() => setAgreementUploadTarget(state.enterpriseSales[0])}>协议上传</Button>
    </>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="企业销售" subtitle="管理对公销售订单、收款与设备交付。" />
      <RolePermissionBanner demoRole={state.demoRole} roles={['sales']} scene="企业销售订单与收款录入" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredEnterpriseSales} columns={[
          { title: '订单号', dataIndex: 'id' },
          { title: '客户名称', dataIndex: 'customerName' },
          { title: '销售日期', dataIndex: 'saleDate' },
          { title: '销售数量', dataIndex: 'quantity' },
          { title: '总金额', dataIndex: 'totalAmount' },
          { title: '已收金额', dataIndex: 'paidAmount' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Space><Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue({ serials: record.deviceSerials, status: record.status }); }}>详情</Button><Button type="link" disabled={!salesAllowed} onClick={() => { setCurrent(record); paymentForm.setFieldsValue({ method: '转账' }); }}>收款</Button><Button type="link" disabled={!salesAllowed} onClick={() => setAgreementUploadTarget(record)}>协议</Button></Space> },
        ]} />
      </Card>
      <Drawer open={Boolean(current)} title={current?.customerName} onClose={() => setCurrent(null)} width={620}>
        {current ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '客户类型', children: current.customerType },
              { key: '2', label: '联系人', children: `${current.contactName} / ${current.contactPhone}` },
              { key: '3', label: '销售负责人', children: current.saleOwner },
              { key: '4', label: '收款状态', children: current.paidAmount >= current.totalAmount ? '已收齐' : `待收 ￥${current.totalAmount - current.paidAmount}` },
            ]} />
            <Form form={form} layout="vertical" onFinish={(values) => { actions.updateEnterpriseSale(current.id, values.serials, values.status); message.success('企业销售状态已更新'); }}>
              <Form.Item label="设备序列号" name="serials">
                <Select mode="multiple" showSearch optionFilterProp="label" options={freeDevices.concat(state.devices.filter((item) => current.deviceSerials.includes(item.serialNumber))).map((item) => ({ label: item.serialNumber, value: item.serialNumber }))} />
              </Form.Item>
              <Form.Item label="订单状态" name="status">
                <Select options={['洽谈', '已签约', '已交付', '已取消'].map((value) => ({ label: value, value }))} />
              </Form.Item>
              <Button disabled={!salesAllowed} type="primary" htmlType="submit">更新交付状态</Button>
            </Form>
            <Card title="收款记录">
              <List dataSource={current.payments} locale={{ emptyText: '暂无收款记录' }} renderItem={(item: any) => <List.Item>{item.createdAt} · {item.method} · {item.amount} 元 · <Tag color={statusColor(item.confirmationStatus)}>{item.confirmationStatus}</Tag>{item.voucherFile ? ` · ${item.voucherFile}` : ' · 待补传凭证'}</List.Item>} />
              <Divider />
              <Form form={paymentForm} layout="inline" onFinish={(values) => { actions.addEnterprisePayment(current.id, values); message.success('收款记录已新增'); paymentForm.resetFields(); }}>
                <Form.Item name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber min={1} placeholder="金额" /></Form.Item>
                <Form.Item name="method" initialValue="转账"><Select style={{ width: 120 }} options={['转账', '扫码', '现金'].map((value) => ({ label: value, value }))} /></Form.Item>
                <Form.Item name="note" rules={[{ required: true, message: '请输入摘要' }]}><Input placeholder="摘要" /></Form.Item>
                <Button disabled={!salesAllowed} type="primary" htmlType="submit">录入收款</Button>
              </Form>
            </Card>
            <Card title="协议与附件">
              <List
                dataSource={state.attachments.filter((item) => item.ownerType === '企业销售' && item.ownerId === current.id)}
                locale={{ emptyText: '暂无协议附件' }}
                renderItem={(item) => <List.Item>{item.uploadedAt} · {item.fileName} · {item.note}</List.Item>}
              />
              <Divider />
              <Button disabled={!salesAllowed} icon={<UploadOutlined />} onClick={() => setAgreementUploadTarget(current)}>上传协议/附件</Button>
            </Card>
          </Space>
        ) : null}
      </Drawer>
      <UploadMockModal
        open={Boolean(agreementUploadTarget)}
        title="上传企业销售协议"
        accept=".pdf,.doc,.docx,image/*"
        description="上传采购协议、盖章合同或补充附件，系统模拟写入订单附件和上传结果。"
        resultName="AG"
        onCancel={() => setAgreementUploadTarget(null)}
        onConfirm={(fileName) => {
          if (!agreementUploadTarget) return;
          actions.attachEnterpriseAgreement(agreementUploadTarget.id, fileName);
          message.success('企业销售协议已上传');
        }}
      />
    </Space>
  );
}

type FinancePaymentRow = {
  id: string;
  sourceType: '企业销售' | '租赁订单';
  orderId: string;
  orderTitle: string;
  customerName: string;
  saleOwner: string;
  totalAmount: number;
  paidAmount: number;
  payment: PaymentRecord;
};

function FinanceConfirmationsPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<FinancePaymentRow | null>(null);
  const [voucherTarget, setVoucherTarget] = useState<FinancePaymentRow | null>(null);
  const financeAllowed = canUse(state.demoRole, ['finance']);
  const salesAllowed = canUse(state.demoRole, ['sales']);
  const rows = useMemo<FinancePaymentRow[]>(() => [
    ...state.enterpriseSales.flatMap((order) => order.payments.map((payment) => ({
      id: `enterprise-${order.id}-${payment.id}`,
      sourceType: '企业销售' as const,
      orderId: order.id,
      orderTitle: order.id,
      customerName: order.customerName,
      saleOwner: order.saleOwner,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      payment,
    }))),
    ...state.rentalOrders.flatMap((order) => order.payments.map((payment) => ({
      id: `rental-${order.id}-${payment.id}`,
      sourceType: '租赁订单' as const,
      orderId: order.id,
      orderTitle: order.teamName,
      customerName: state.organizations.find((item) => item.id === order.organizationId)?.name ?? order.teamName,
      saleOwner: order.saleOwner,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      payment,
    }))),
  ], [state.enterpriseSales, state.organizations, state.rentalOrders]);

  function confirm(row: FinancePaymentRow) {
    actions.confirmPayment(row.sourceType, row.orderId, row.payment.id);
    message.success('财务已确认到账，订单已收金额已同步');
    setDetail(null);
  }

  function returnBack(row: FinancePaymentRow) {
    actions.returnPayment(row.sourceType, row.orderId, row.payment.id, '凭证金额或到账账户需销售补充确认');
    message.warning('已退回销售补充凭证');
    setDetail(null);
  }

  function table(dataSource: FinancePaymentRow[]) {
    return (
      <Table<FinancePaymentRow>
        rowKey="id"
        dataSource={dataSource}
        columns={[
          { title: '来源', dataIndex: 'sourceType' },
          { title: '订单', render: (_, record) => `${record.orderId} · ${record.orderTitle}` },
          { title: '客户/机构', dataIndex: 'customerName' },
          { title: '销售录入人', dataIndex: 'saleOwner' },
          { title: '收款金额', render: (_, record) => `￥${record.payment.amount}` },
          { title: '凭证', render: (_, record) => record.payment.voucherFile ?? <Tag color="warning">待补传</Tag> },
          { title: '确认状态', render: (_, record) => <Tag color={statusColor(record.payment.confirmationStatus)}>{record.payment.confirmationStatus}</Tag> },
          { title: '操作', render: (_, record) => (
            <Space>
              <Button type="link" onClick={() => setDetail(record)}>详情</Button>
              <Button type="link" disabled={!salesAllowed} onClick={() => setVoucherTarget(record)}>补传凭证</Button>
              <Button type="link" disabled={!financeAllowed || record.payment.confirmationStatus === '已确认'} onClick={() => confirm(record)}>确认到账</Button>
              <Button type="link" danger disabled={!financeAllowed || record.payment.confirmationStatus === '已确认'} onClick={() => returnBack(record)}>退回修改</Button>
            </Space>
          ) },
        ]}
      />
    );
  }

  const enterpriseRows = rows.filter((item) => item.sourceType === '企业销售' && item.payment.confirmationStatus === '待确认');
  const rentalRows = rows.filter((item) => item.sourceType === '租赁订单' && item.payment.confirmationStatus === '待确认');
  const confirmedRows = rows.filter((item) => item.payment.confirmationStatus === '已确认');
  const returnedRows = rows.filter((item) => item.payment.confirmationStatus === '已退回');

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="财务确认" subtitle="独立核对企业销售与租赁订单收款凭证，确认后同步订单已收金额并写入财务日志。" />
      <RolePermissionBanner demoRole={state.demoRole} roles={['finance']} scene="财务到账确认" />
      <Row gutter={[12, 12]}>
        <Col span={6}><Card size="small"><Statistic title="待确认企业收款" value={enterpriseRows.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待确认租赁收款" value={rentalRows.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已确认收款" value={confirmedRows.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已退回收款" value={returnedRows.length} /></Card></Col>
      </Row>
      <Card>
        <Tabs
          items={[
            { key: 'enterprise', label: `企业销售收款 ${enterpriseRows.length}`, children: table(enterpriseRows) },
            { key: 'rental', label: `租赁收款 ${rentalRows.length}`, children: table(rentalRows) },
            { key: 'confirmed', label: `已确认 ${confirmedRows.length}`, children: table(confirmedRows) },
            { key: 'returned', label: `已退回 ${returnedRows.length}`, children: table(returnedRows) },
          ]}
        />
      </Card>
      <Drawer open={Boolean(detail)} title="收款确认详情" onClose={() => setDetail(null)} width={620}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '来源订单', children: `${detail.sourceType} / ${detail.orderId}` },
              { key: '2', label: '客户/机构', children: detail.customerName },
              { key: '3', label: '订单金额', children: `￥${detail.totalAmount}，当前已确认 ￥${detail.paidAmount}` },
              { key: '4', label: '收款金额', children: `￥${detail.payment.amount}` },
              { key: '5', label: '销售录入', children: `${detail.payment.recordedBy} · ${detail.payment.createdAt}` },
              { key: '6', label: '凭证附件', children: detail.payment.voucherFile ?? '待销售补传' },
              { key: '7', label: '财务状态', children: <Tag color={statusColor(detail.payment.confirmationStatus)}>{detail.payment.confirmationStatus}</Tag> },
              { key: '8', label: '退回原因', children: detail.payment.returnedReason ?? '-' },
            ]} />
            <Space>
              <Button disabled={!financeAllowed || detail.payment.confirmationStatus === '已确认'} type="primary" onClick={() => confirm(detail)}>确认到账</Button>
              <Button disabled={!financeAllowed || detail.payment.confirmationStatus === '已确认'} danger onClick={() => returnBack(detail)}>退回修改</Button>
              <Button disabled={!salesAllowed} onClick={() => setVoucherTarget(detail)}>补传凭证</Button>
            </Space>
          </Space>
        ) : null}
      </Drawer>
      <UploadMockModal
        open={Boolean(voucherTarget)}
        title="补传收款凭证"
        accept="image/*,.pdf"
        description="销售人员补传转账截图、银行回单或收款凭证后，记录回到待财务确认状态。"
        resultName="VOUCHER"
        onCancel={() => setVoucherTarget(null)}
        onConfirm={(fileName) => {
          if (!voucherTarget) return;
          actions.supplementPaymentVoucher(voucherTarget.sourceType, voucherTarget.orderId, voucherTarget.payment.id, fileName);
          message.success('收款凭证已补传，等待财务确认');
        }}
      />
    </Space>
  );
}

function SosPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [current, setCurrent] = useState<any>(null);
  const [form] = Form.useForm();
  const { filteredRecords: filteredSosAlerts, toolbar } = useListFilters<any>(
    state.sosAlerts,
    [
      { name: 'keyword', label: '报警关键词', placeholder: '学员 / 位置 / 录音摘要', match: textMatcher((item) => item.studentName, (item) => item.location, (item) => item.audioSummary) },
      { name: 'status', label: '处理状态', type: 'select', options: makeOptions(state.sosAlerts.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="SOS 报警" subtitle="查看安全报警并完成处理记录。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredSosAlerts} columns={[
          { title: '学员姓名', dataIndex: 'studentName' },
          { title: '报警时间', dataIndex: 'raisedAt' },
          { title: '位置', dataIndex: 'location' },
          { title: '录音摘要', dataIndex: 'audioSummary' },
          { title: '处理状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue(record); }}>处理</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(current)} title={current?.studentName} onClose={() => setCurrent(null)} width={480}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.updateSosStatus(current.id, values.status, values.note); message.success('处理结果已保存'); setCurrent(null); }}>
          <Form.Item label="处理状态" name="status"><Select options={['未处理', '已联系'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="处理备注" name="note"><Input.TextArea rows={4} /></Form.Item>
          <Button type="primary" htmlType="submit">保存处理结果</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function CoursesPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<any>(null);
  const { filteredRecords: filteredCourses, toolbar } = useListFilters<any>(
    state.courses,
    [
      { name: 'keyword', label: '课程关键词', placeholder: '课程名称 / 专家', match: textMatcher((item) => item.title, (item) => item.expertName) },
      { name: 'type', label: '课程类型', type: 'select', options: makeOptions(state.courses.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'status', label: '课程状态', type: 'select', options: makeOptions(state.courses.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    <>
      <Button onClick={() => { actions.reviewExpertEntry(); message.success('专家入驻审核记录已生成'); }}>专家入驻审核</Button>
      <Button onClick={() => { actions.reviewCourseOrders(); message.success('课程订单处理记录已生成'); }}>订单明细</Button>
      <Button onClick={() => { actions.createCourseUploadDraft(); message.success('课程草稿已创建，状态为创建中'); }}>课程上传</Button>
    </>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="课程管理" subtitle="统一管理课程审核、上下架与基础经营数据。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredCourses} columns={[
          { title: '课程名称', dataIndex: 'title' },
          { title: '专家', dataIndex: 'expertName' },
          { title: '类型', dataIndex: 'type' },
          { title: '价格', dataIndex: 'price' },
          { title: '学员数', dataIndex: 'studentCount' },
          { title: '浏览量', dataIndex: 'views' },
          { title: '销售量', dataIndex: 'sales' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Space><Button type="link" onClick={() => setDetail(record)}>详情</Button><Button type="link" onClick={() => actions.toggleCourseStatus(record.id)}>{record.status === '已上架' ? '下架' : '上架'}</Button></Space> },
        ]} />
      </Card>
      <Drawer open={Boolean(detail)} title={detail?.title} onClose={() => setDetail(null)} width={620}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '专家', children: detail.expertName },
              { key: '2', label: '价格', children: `￥${detail.price}` },
              { key: '3', label: '经营数据', children: `学员 ${detail.studentCount ?? 0} · 销售 ${detail.sales} · 浏览 ${detail.views}` },
              { key: '4', label: '课程状态', children: <Tag color={statusColor(detail.status)}>{detail.status}</Tag> },
            ]} />
            <Card title="课程上传资料">
              <List dataSource={['课程封面.png', '课程视频.mp4', '课程大纲.docx']} renderItem={(item) => <List.Item>{item}</List.Item>} />
            </Card>
            <Card title="订单与退款处理">
              <List dataSource={state.onlineSales.slice(0, 2)} renderItem={(item) => <List.Item>{item.orderDate} · {item.buyerName} · ￥{item.paidAmount} · {item.status}</List.Item>} />
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function QaRecordsPage() {
  const { state, actions } = useAdminStore();
  const [agentDetail, setAgentDetail] = useState<any>(null);
  const { filteredRecords: filteredQaRecords, toolbar } = useListFilters<any>(
    state.qaRecords,
    [
      { name: 'keyword', label: '问答关键词', placeholder: '学员 / 智能体 / 问题摘要', match: textMatcher((item) => item.studentName, (item) => item.agentName, (item) => item.summary) },
      { name: 'askedAt', label: '日期范围', placeholder: '例如 2026-04', match: textMatcher((item) => item.askedAt) },
      { name: 'matchedKnowledge', label: '知识库命中', type: 'select', options: [{ label: '已命中', value: true }, { label: '未命中', value: false }], match: equalsMatcher((item) => item.matchedKnowledge) },
      { name: 'status', label: '处理状态', type: 'select', options: makeOptions(state.qaRecords.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="问答记录" subtitle="聚焦未匹配问答，补充答案后同步进入知识库。" />
      {toolbar}
      <Card title="智能体问答统计">
        <Table
          rowKey="id"
          pagination={false}
          dataSource={state.agents}
          columns={[
            { title: '智能体名称', dataIndex: 'name' },
            { title: '累计访问学员数', dataIndex: 'users' },
            { title: '问答总次数', dataIndex: 'questions' },
            { title: '未命中次数', render: (_, record: any) => state.qaRecords.filter((item) => item.agentName === record.name && !item.matchedKnowledge).length },
            { title: '命中率', render: (_, record: any) => `${Math.round(((state.qaRecords.filter((item) => item.agentName === record.name && item.matchedKnowledge).length || 1) / Math.max(state.qaRecords.filter((item) => item.agentName === record.name).length, 1)) * 100)}%` },
            { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => setAgentDetail(record)}>详情</Button> },
          ]}
        />
      </Card>
      <Card>
        <Table rowKey="id" dataSource={filteredQaRecords} columns={[
          { title: '提问时间', dataIndex: 'askedAt' },
          { title: '学员', dataIndex: 'studentName' },
          { title: '智能体', dataIndex: 'agentName' },
          { title: '问题摘要', dataIndex: 'summary' },
          { title: '是否命中知识库', render: (_, record: any) => <Tag color={record.matchedKnowledge ? 'success' : 'warning'}>{record.matchedKnowledge ? '已命中' : '未命中'}</Tag> },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => actions.submitQaAnswer(record.id)} disabled={record.status === '已补充'}>补充答案</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(agentDetail)} title={agentDetail ? `${agentDetail.name} · 问答明细` : '问答明细'} onClose={() => setAgentDetail(null)} width={680}>
        <Table
          rowKey="id"
          dataSource={filteredQaRecords.filter((item) => item.agentName === agentDetail?.name)}
          columns={[
            { title: '提问时间', dataIndex: 'askedAt' },
            { title: '学员', dataIndex: 'studentName' },
            { title: '问题摘要', dataIndex: 'summary' },
            { title: '命中', render: (_, record: any) => record.matchedKnowledge ? '已命中' : '未命中' },
          ]}
        />
      </Drawer>
    </Space>
  );
}

function KnowledgePage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [agentDetail, setAgentDetail] = useState<any>(null);
  const { filteredRecords: filteredKnowledge, toolbar } = useListFilters<any>(
    state.knowledge,
    [
      { name: 'keyword', label: '知识关键词', placeholder: '标题 / 类别', match: textMatcher((item) => item.title, (item) => item.category) },
      { name: 'category', label: '内容类别', type: 'select', options: makeOptions(state.knowledge.map((item) => item.category)), match: equalsMatcher((item) => item.category) },
      { name: 'status', label: '发布状态', type: 'select', options: makeOptions(state.knowledge.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="知识库" subtitle="统一管理知识条目、资讯内容与难题挑战发布状态。" />
      {toolbar}
      <Card title="智能体知识库统计">
        <Table
          rowKey="id"
          pagination={false}
          dataSource={state.agents}
          columns={[
            { title: '智能体名称', dataIndex: 'name' },
            { title: '关联知识库数量', render: (_, record: any) => record.knowledgeIds.length },
            { title: '已发布知识', render: (_, record: any) => record.knowledgeIds.filter((id: string) => state.knowledge.find((item) => item.id === id)?.status === '已发布').length },
            { title: '操作', render: (_, record: any) => <Space><Button type="link" onClick={() => setAgentDetail(record)}>详情</Button><Button type="link" onClick={() => { actions.uploadAgentKnowledge(record.id); message.success('知识库资料已上传，生成草稿并关联智能体'); }}>上传知识库</Button></Space> },
          ]}
        />
      </Card>
      <Card>
        <Table rowKey="id" dataSource={filteredKnowledge} columns={[
          { title: '标题', dataIndex: 'title' },
          { title: '类别', dataIndex: 'category' },
          { title: '更新时间', dataIndex: 'updatedAt' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => actions.toggleKnowledgeStatus(record.id)}>{record.status === '已发布' ? '转草稿' : '发布'}</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(agentDetail)} title={agentDetail ? `${agentDetail.name} · 知识库明细` : '知识库明细'} onClose={() => setAgentDetail(null)} width={640}>
        <List
          dataSource={state.knowledge.filter((item) => agentDetail?.knowledgeIds.includes(item.id))}
          locale={{ emptyText: '暂无知识库' }}
          renderItem={(item) => <List.Item>{item.title} · {item.category} · {item.status} · {item.updatedAt}</List.Item>}
        />
      </Drawer>
    </Space>
  );
}

function AgentsPage() {
  const { state, actions } = useAdminStore();
  const [detail, setDetail] = useState<any>(null);
  const { filteredRecords: filteredAgents, toolbar } = useListFilters<any>(
    state.agents,
    [
      { name: 'keyword', label: '智能体关键词', placeholder: '名称 / 专家 / 机构 / 手机号', match: textMatcher((item) => item.name, (item) => item.style, (item) => item.expertName, (item) => item.organizationName, (item) => item.phone) },
      { name: 'onlineStatus', label: '上下架状态', type: 'select', options: makeOptions(state.agents.map((item) => item.onlineStatus)), match: equalsMatcher((item) => item.onlineStatus) },
    ],
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="智能体管理" subtitle="管理智能体风格、上下架状态与知识库关联情况。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredAgents} columns={[
          { title: '智能体名称', dataIndex: 'name' },
          { title: '专家/机构名称', render: (_, record: any) => record.expertName || record.organizationName || '-' },
          { title: '手机号', dataIndex: 'phone' },
          { title: '类别', dataIndex: 'category' },
          { title: '百炼账号', dataIndex: 'bailianAccount' },
          { title: '首次上线日期', dataIndex: 'firstOnlineAt' },
          { title: '回复风格', dataIndex: 'style' },
          { title: '关联知识库', render: (_, record: any) => record.knowledgeIds.length },
          { title: '累计用户量', dataIndex: 'users' },
          { title: '问答次数', dataIndex: 'questions' },
          { title: '订单数', dataIndex: 'orders' },
          { title: '待审核作品', dataIndex: 'pendingWorks' },
          { title: '状态', dataIndex: 'onlineStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Space><Button type="link" onClick={() => setDetail(record)}>详情</Button><Button type="link" onClick={() => actions.toggleAgentStatus(record.id)}>{record.onlineStatus === '已上架' ? '下架' : '上架'}</Button></Space> },
        ]} />
      </Card>
      <Drawer open={Boolean(detail)} title={detail?.name} onClose={() => setDetail(null)} width={680}>
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small" items={[
              { key: '1', label: '专家/机构', children: detail.expertName || detail.organizationName || '-' },
              { key: '2', label: '百炼智慧体账号', children: detail.bailianAccount },
              { key: '3', label: '首次上线日期', children: detail.firstOnlineAt ?? '-' },
              { key: '4', label: '经营数据', children: `学员 ${detail.users} · 问答 ${detail.questions} · 订单 ${detail.orders ?? 0} · 待审核作品 ${detail.pendingWorks ?? 0}` },
            ]} />
            <Tabs items={[
              { key: 'courses', label: '课程', children: <List dataSource={state.courses.filter((item) => item.expertName === detail.expertName)} locale={{ emptyText: '暂无课程' }} renderItem={(item) => <List.Item>{item.title} · {item.status} · 学员 {item.studentCount ?? 0}</List.Item>} /> },
              { key: 'challenges', label: '难题挑战', children: <List dataSource={state.knowledge.filter((item) => item.category === '难题挑战')} renderItem={(item) => <List.Item>{item.title} · {item.status}</List.Item>} /> },
              { key: 'works', label: '待审核作品', children: <List dataSource={state.teamTaskWorks.slice(0, detail.pendingWorks ?? 0)} locale={{ emptyText: '暂无待审核作品' }} renderItem={(item) => <List.Item>{item.ownerName} · {item.title} · {item.status}</List.Item>} /> },
              { key: 'orders', label: '销售订单', children: <List dataSource={state.enterpriseSales.slice(0, 3)} renderItem={(item) => <List.Item>{item.customerName} · ￥{item.totalAmount} · {item.status}</List.Item>} /> },
            ]} />
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function CapabilityElementsPage() {
  const { state } = useAdminStore();

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="能力元素" subtitle="维护四个维度、16 个能力指标与 48 个能力元素，能力映射已独立为同级功能。" />
      <Row gutter={[16, 16]}>
        {['自主发展', '科技素养', '创新发展', '社会参与'].map((plane) => {
          const planeElements = state.capabilityElements.filter((item) => item.plane === plane);
          return (
            <Col span={12} key={plane}>
              <Card title={`${plane} · ${new Set(planeElements.map((item) => item.indicator)).size} 个指标 / ${planeElements.length} 个元素`}>
                <List dataSource={planeElements} renderItem={(item) => <List.Item>{item.indicator} · {item.name}</List.Item>} />
              </Card>
            </Col>
          );
        })}
      </Row>
    </Space>
  );
}

function CapabilityMappingsPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredCapabilityMappings, toolbar } = useListFilters<CapabilityMapping>(
    state.capabilityMappings,
    [
      { name: 'keyword', label: '映射关键词', placeholder: '合作机构 / 评价指标', match: textMatcher((item) => item.indicator, (item) => item.organizationIds.map((id) => state.organizations.find((org) => org.id === id)?.name).join('、')) },
      { name: 'organizationId', label: '合作机构', type: 'select', options: state.organizations.map((item) => ({ label: item.name, value: item.id })), match: arrayIncludesMatcher((item) => item.organizationIds) },
      { name: 'elementId', label: '能力元素', type: 'select', options: state.capabilityElements.map((item) => ({ label: item.name, value: item.id })), match: (item, value) => {
        if (!hasFilterValue(value)) return true;
        return item.formulaItems.some((formula) => formula.elementId === value);
      } },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增映射</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="能力映射" subtitle="按具体合作机构配置自定义能力指标与平台 48 个能力元素的权重公式。" />
      {toolbar}
      <Card title="映射关系">
        <Table rowKey="id" dataSource={filteredCapabilityMappings} columns={[
          { title: '合作机构', render: (_, record: CapabilityMapping) => record.organizationIds.map((id) => state.organizations.find((item) => item.id === id)?.name ?? id).join('、') },
          { title: '评价指标', dataIndex: 'indicator' },
          { title: '映射公式', render: (_, record: CapabilityMapping) => record.formulaItems.map((item) => `${state.capabilityElements.find((element) => element.id === item.elementId)?.name ?? item.elementId} ${item.weight}%`).join(' + ') },
          { title: '权重合计', render: (_, record: CapabilityMapping) => `${record.formulaItems.reduce((sum, item) => sum + item.weight, 0)}%` },
          { title: '操作', render: (_, record: CapabilityMapping) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑映射' : '新增映射'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={(values: Omit<CapabilityMapping, 'id'>) => {
          const total = values.formulaItems.reduce((sum, item) => sum + item.weight, 0);
          if (total !== 100) {
            message.warning('能力元素权重合计需要为 100%');
            return;
          }
          actions.saveCapabilityMapping(values, editingId);
          setOpen(false);
        }}>
          <Form.Item label="合作机构" name="organizationIds" rules={[{ required: true, message: '请选择合作机构' }]}><Select mode="multiple" showSearch optionFilterProp="label" options={state.organizations.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item>
          <Form.Item label="评价指标" name="indicator" rules={[{ required: true, message: '请输入评价指标' }]}><Input /></Form.Item>
          <Form.List name="formulaItems" initialValue={[{ elementId: state.capabilityElements[0]?.id, weight: 100 }]}>
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Row gutter={8} key={field.key}>
                    <Col span={15}><Form.Item {...field} name={[field.name, 'elementId']} rules={[{ required: true, message: '请选择能力元素' }]}><Select showSearch optionFilterProp="label" options={state.capabilityElements.map((item) => ({ label: `${item.indicator} / ${item.name}`, value: item.id }))} /></Form.Item></Col>
                    <Col span={6}><Form.Item {...field} name={[field.name, 'weight']} rules={[{ required: true, message: '请输入权重' }]}><InputNumber min={1} max={100} addonAfter="%" style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={3}>{fields.length > 1 ? <Button danger onClick={() => remove(field.name)}>删</Button> : null}</Col>
                  </Row>
                ))}
                <Button onClick={() => add({ elementId: state.capabilityElements[0]?.id, weight: 0 })}>添加能力元素</Button>
              </Space>
            )}
          </Form.List>
          <Button type="primary" htmlType="submit">保存映射</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function QuestionBankPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredQuestionBank, toolbar } = useListFilters<any>(
    state.questionBank,
    [
      { name: 'keyword', label: '题目关键词', placeholder: '题目 / 能力元素', match: textMatcher((item) => item.title, (item) => item.element) },
      { name: 'category', label: '分类', type: 'select', options: makeOptions(state.questionBank.map((item) => item.category)), match: equalsMatcher((item) => item.category) },
      { name: 'type', label: '题型', type: 'select', options: makeOptions(state.questionBank.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'status', label: '状态', type: 'select', options: makeOptions(state.questionBank.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增题目</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="能力题库" subtitle="维护学员自测与家长评测题库。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredQuestionBank} columns={[
          { title: '分类', dataIndex: 'category' },
          { title: '题型', dataIndex: 'type' },
          { title: '题目', dataIndex: 'title' },
          { title: '能力元素', dataIndex: 'element' },
          { title: '答案', dataIndex: 'answer' },
          { title: '评分标准', dataIndex: 'scoringStandard' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑题目' : '新增题目'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveQuestionBankItem(values, editingId); setOpen(false); }}>
          <Form.Item label="分类" name="category"><Select options={['学员自测', '家长评测', '天赋测试'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="题型" name="type"><Select options={['单选', '判断', '问答', 'AI问答'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="题目" name="title"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item label="能力元素" name="element"><Input /></Form.Item>
          <Form.Item label="答案" name="answer"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="评分标准" name="scoringStandard"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="状态" name="status" initialValue="创建中"><Select options={['创建中', '启用', '草稿', '停用'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">保存题目</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function GrowthRulesPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredGrowthRules, toolbar } = useListFilters<any>(
    state.growthRules,
    [
      { name: 'keyword', label: '规则关键词', placeholder: '场景名称', match: textMatcher((item) => item.scene) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增规则</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="成长值规则" subtitle="按场景配置成长值，保存后即时生效。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredGrowthRules} columns={[
          { title: '场景', dataIndex: 'scene' },
          { title: '数值', dataIndex: 'value' },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑规则' : '新增规则'} onClose={() => setOpen(false)} width={420}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveGrowthRule(values, editingId); setOpen(false); }}>
          <Form.Item label="场景" name="scene"><Input /></Form.Item>
          <Form.Item label="成长值" name="value"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Button type="primary" htmlType="submit">保存规则</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function GrowthGoodsPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredGrowthGoods, toolbar } = useListFilters<any>(
    state.growthGoods,
    [
      { name: 'keyword', label: '商品关键词', placeholder: '商品名称', match: textMatcher((item) => item.name) },
      { name: 'type', label: '商品类型', type: 'select', options: makeOptions(state.growthGoods.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'status', label: '商品状态', type: 'select', options: makeOptions(state.growthGoods.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增商品</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="成长值商品" subtitle="维护成长商城可兑换商品与库存。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredGrowthGoods} columns={[
          { title: '商品名称', dataIndex: 'name' },
          { title: '类型', dataIndex: 'type' },
          { title: '所需成长值', dataIndex: 'cost' },
          { title: '库存', dataIndex: 'stock' },
          { title: '已兑换', dataIndex: 'exchanged' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑商品' : '新增商品'} onClose={() => setOpen(false)} width={420}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveGrowthGood(values, editingId); setOpen(false); }}>
          <Form.Item label="商品名称" name="name"><Input /></Form.Item>
          <Form.Item label="商品类型" name="type"><Select options={['实物', '虚拟'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="所需成长值" name="cost"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="库存" name="stock"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="状态" name="status" initialValue="上架"><Select options={['上架', '下架'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">保存商品</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function AssessmentSettingsPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredAssessmentSettings, toolbar } = useListFilters<any>(
    state.assessmentSettings,
    [
      { name: 'keyword', label: '配置关键词', placeholder: '配置项名称', match: textMatcher((item) => item.label) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增配置</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="评测设置" subtitle="按年龄段与评测类型配置答题时长。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredAssessmentSettings} columns={[
          { title: '配置项', dataIndex: 'label' },
          { title: '限时方式', dataIndex: 'limitMode' },
          { title: '整场时长(分钟)', dataIndex: 'durationMinutes' },
          { title: '每题时长(秒)', dataIndex: 'perQuestionSeconds' },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑配置' : '新增配置'} onClose={() => setOpen(false)} width={420}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveAssessmentSetting(values, editingId); setOpen(false); }}>
          <Form.Item label="配置项" name="label"><Input /></Form.Item>
          <Form.Item label="限时方式" name="limitMode"><Select options={['每题限时', '整场限时', '双限时'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="整场时长(分钟)" name="durationMinutes"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="每题时长(秒)" name="perQuestionSeconds"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Button type="primary" htmlType="submit">保存配置</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function MasterAgentSettingsPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="主控智能体" subtitle="配置主控智能体知识库、主动推送小任务和新手引导任务规则。" />
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={state.masterAgentSettings}
          onFinish={(values) => {
            actions.saveMasterAgentSettings(values);
            message.success('主控智能体设置已保存');
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="主控智能体名称" name="agentName" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="关联知识库" name="knowledgeIds">
                <Select mode="multiple" options={state.knowledge.map((item) => ({ label: item.title, value: item.id }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="主动推送小任务规则" name="pushTaskRule" rules={[{ required: true, message: '请输入规则' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="新手引导任务规则" name="onboardingTaskRule" rules={[{ required: true, message: '请输入规则' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">保存设置</Button>
            <Text type="secondary">最近更新：{state.masterAgentSettings.updatedAt}</Text>
          </Space>
        </Form>
      </Card>
      <Card title="规则预览">
        <Descriptions bordered column={1} size="small" items={[
          { key: '1', label: '知识库数量', children: state.masterAgentSettings.knowledgeIds.length },
          { key: '2', label: '主动推送', children: state.masterAgentSettings.pushTaskRule },
          { key: '3', label: '新手引导', children: state.masterAgentSettings.onboardingTaskRule },
        ]} />
      </Card>
    </Space>
  );
}

function OperationLogsPage() {
  const { state } = useAdminStore();
  const { filteredRecords: filteredLogs, toolbar } = useListFilters<OperationLog>(
    state.operationLogs,
    [
      { name: 'keyword', label: '操作关键词', placeholder: '功能 / 对象 / 内容 / 人员', match: textMatcher((item) => item.feature, (item) => item.target, (item) => item.content, (item) => item.operatorName) },
      { name: 'role', label: '操作角色', type: 'select', options: makeOptions(state.operationLogs.map((item) => item.role)), match: equalsMatcher((item) => item.role) },
      { name: 'feature', label: '操作功能', type: 'select', options: makeOptions(state.operationLogs.map((item) => item.feature)), match: equalsMatcher((item) => item.feature) },
      { name: 'result', label: '操作结果', type: 'select', options: makeOptions(state.operationLogs.map((item) => item.result)), match: equalsMatcher((item) => item.result) },
    ],
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="操作记录" subtitle="展示关键流程的操作角色、操作功能、操作时间与结果留痕。" />
      {toolbar}
      <Card>
        <Table<OperationLog>
          rowKey="id"
          dataSource={filteredLogs}
          columns={[
            { title: '操作角色', dataIndex: 'role' },
            { title: '操作人员', dataIndex: 'operatorName' },
            { title: '操作功能', dataIndex: 'feature' },
            { title: '关联对象', dataIndex: 'target' },
            { title: '操作内容', dataIndex: 'content' },
            { title: '操作结果', dataIndex: 'result', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            { title: '操作时间', dataIndex: 'operatedAt' },
          ]}
        />
      </Card>
    </Space>
  );
}

function FallbackPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />
      <Empty description="该页面正在使用统一后台能力承载当前流程。" />
    </Card>
  );
}

export function OperatorPageRenderer({ page }: { page: OperatorPageKey }) {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />;
    case 'organizations':
      return <OrganizationsPage />;
    case 'mentors':
      return <MentorsPage />;
    case 'team-assignments':
      return <TeamAssignmentsPage />;
    case 'team-tasks':
      return <TeamTasksPage />;
    case 'rental-orders':
      return <RentalOrdersPage />;
    case 'finance-confirmations':
      return <FinanceConfirmationsPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'students':
      return <StudentsPage />;
    case 'bases':
      return <BasesPage mode="operator" />;
    case 'task-library':
      return <TaskLibraryPage mode="operator" />;
    case 'audits':
      return <AuditsPage mode="operator" />;
    case 'team-photos':
      return <TeamPhotosPage />;
    case 'task-types':
      return <TaskTypesPage />;
    case 'task-builder':
      return <TaskBuilderPage />;
    case 'task-import':
      return <TaskImportPage />;
    case 'part-timers':
      return <PartTimersPage />;
    case 'performance':
      return <PerformancePage mode="operator" />;
    case 'devices':
      return <DevicesPage />;
    case 'sales-online':
      return <SalesOnlinePage />;
    case 'sales-enterprise':
      return <SalesEnterprisePage />;
    case 'sos':
      return <SosPage />;
    case 'courses':
      return <CoursesPage />;
    case 'qa-records':
      return <QaRecordsPage />;
    case 'knowledge':
      return <KnowledgePage />;
    case 'agents':
      return <AgentsPage />;
    case 'capability-elements':
      return <CapabilityElementsPage />;
    case 'capability-mappings':
      return <CapabilityMappingsPage />;
    case 'question-bank':
      return <QuestionBankPage />;
    case 'growth-rules':
      return <GrowthRulesPage />;
    case 'growth-goods':
      return <GrowthGoodsPage />;
    case 'assessment-settings':
      return <AssessmentSettingsPage />;
    case 'master-agent-settings':
      return <MasterAgentSettingsPage />;
    case 'operation-logs':
      return <OperationLogsPage />;
    default:
      return <FallbackPage title="后台模块" subtitle="当前页面已纳入运营管理后台统一框架。" />;
  }
}

export function CityWorkbenchPageRenderer({ page }: { page: CityPageKey }) {
  switch (page) {
    case 'bases':
      return <BasesPage mode="city_maintainer" />;
    case 'tasks':
      return <TaskLibraryPage mode="city_maintainer" />;
    case 'audits':
      return <AuditsPage mode="city_maintainer" />;
    case 'performance':
      return <PerformancePage mode="city_maintainer" />;
    default:
      return <FallbackPage title="城市维护工作台" subtitle="当前页面已纳入城市维护工作台统一框架。" />;
  }
}

export function TaskTemplatePreview({ template }: { template: TaskBuilderTemplate | undefined }) {
  if (!template) {
    return <Empty description="未找到对应任务模板" />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title={template.title} subtitle="该页面用于查看学员端任务详情页的扫码预览效果。" />
      <Card>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {template.blocks.map((block) => (
            <Card key={block.id} size="small" title={block.type}>
              <Paragraph style={{ marginBottom: 0 }}>{block.content}</Paragraph>
            </Card>
          ))}
          <Card size="small" title="能力标签">
            <Space wrap>
              {template.abilityTags.map((item) => (
                <Tag key={item} color="blue">
                  {item}
                </Tag>
              ))}
            </Space>
          </Card>
        </Space>
      </Card>
    </Space>
  );
}
