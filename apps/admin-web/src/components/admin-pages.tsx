'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Descriptions, Divider, Drawer, Empty, Form, Input, InputNumber, List, QRCode, Row, Select, Space, Statistic, Steps, Table, Tabs, Tag, Timeline, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredSession } from '../lib/admin-auth';
import type {
  AdminRole,
} from '../lib/admin-auth';
import type {
  AuditRecord,
  CapabilityMapping,
  Mentor,
  Organization,
  PhotoRecognitionStatus,
  RentalOrderStatus,
  StudentProfile,
  StudyBase,
  TaskBuilderTemplate,
  TaskLibraryItem,
  Team,
  TeamTask,
} from '../lib/admin-store';
import { useAdminStore } from '../lib/admin-store';
import { exportAuditPerformance, exportInventory, exportMentors, exportOrganizations, exportStudentCapabilitySummary, exportStudentReport, exportStudents } from '../lib/exporters';
import type { CityPageKey, OperatorPageKey } from '../lib/navigation';

const { Title, Paragraph, Text } = Typography;

function statusColor(status: string) {
  if (status.includes('已') || status === '启用' || status === '上架') return 'success';
  if (status.includes('待') || status.includes('录入') || status.includes('审核')) return 'warning';
  if (status.includes('退回') || status.includes('停用') || status.includes('下架') || status.includes('未处理')) return 'error';
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
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

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

function useCityScope() {
  const session = getStoredSession();
  return {
    session,
    editorId: session?.user.id ?? 'maintainer-001',
    cityIds: session?.user.cityIds ?? [],
  };
}

function DashboardPage() {
  const { state, selectors } = useAdminStore();

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="经营看板" subtitle="汇总设备、机构、任务与审核动态，帮助运营人员快速进入处理状态。" />
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card><Statistic title="设备总量" value={selectors.dashboard.totalDevices} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="在线设备数" value={selectors.dashboard.onlineDevices} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="合作机构数" value={selectors.dashboard.organizationCount} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="研学导师数" value={selectors.dashboard.mentorCount} /></Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="团队执行总览">
            <Table
              rowKey="id"
              pagination={false}
              dataSource={state.teams}
              columns={[
                { title: '线路名称', dataIndex: 'lineName' },
                { title: '团队名称', dataIndex: 'name' },
                {
                  title: '合作机构',
                  render: (_, record: Team) => selectors.getOrganizationById(record.organizationId)?.name ?? '-',
                },
                {
                  title: '导师',
                  render: (_, record: Team) => selectors.getMentorById(record.mentorId)?.name ?? '待安排',
                },
                { title: '状态', dataIndex: 'assignmentStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
                { title: '任务数', dataIndex: 'taskCount' },
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="待处理事项">
            <List
              dataSource={[
                ...selectors.pendingAudits.slice(0, 3).map((item) => `${item.targetType}审核：${item.title}`),
                ...state.importJobs.filter((item) => item.status !== '已入库').slice(0, 2).map((item) => `${item.sourceType}：${item.title}`),
                ...state.erasureRecords.filter((item) => item.status === '待执行').slice(0, 2).map((item) => `设备擦除：${item.serialNumber}`),
              ]}
              locale={{ emptyText: '当前无待处理事项' }}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="审核时间线">
            <Timeline
              items={state.audits.slice(0, 5).map((item) => ({
                color: item.status === '已确认' ? 'green' : item.status === '退回修改' ? 'red' : 'blue',
                children: `${item.submittedAt} · ${item.title} · ${item.status}`,
              }))}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="智能录入进度">
            <List
              dataSource={state.importJobs}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={2}>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary">{item.result}</Text>
                    <Tag color={statusColor(item.status)}>{item.status}</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function OrganizationsPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
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
  const { filteredRecords: filteredOrganizations, toolbar } = useListFilters<Organization>(
    state.organizations,
    [
      { name: 'keyword', label: '机构关键词', placeholder: '机构名称 / 联系人 / 电话', match: textMatcher((item) => item.name, (item) => item.contactName, (item) => item.contactPhone) },
      { name: 'type', label: '机构类型', type: 'select', options: makeOptions(state.organizations.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'city', label: '所在城市', type: 'select', options: makeOptions(state.organizations.map((item) => item.city)), match: equalsMatcher((item) => item.city) },
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
              { key: '5', label: '注册日期', children: detail.registeredAt },
            ]} />
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
  const [detail, setDetail] = useState<Mentor | null>(null);
  const [editing, setEditing] = useState<Mentor | null>(null);
  const [form] = Form.useForm();

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
            <Select options={state.organizations.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item label="导师姓名" name="name" rules={[{ required: true, message: '请输入导师姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="账号状态" name="status">
            <Select options={['启用', '停用'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="带团队数" name="teamsLed"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="任务总数" name="taskCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="研学总人次" name="participantCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit">保存导师</Button>
        </Form>
      </Drawer>
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
            { title: '操作', render: (_, record: Team) => <Button type="link" onClick={() => openEditor(record)}>{record.mentorId ? '变更导师' : '安排导师'}</Button> },
          ]}
        />
      </Card>
      <Drawer open={Boolean(team)} title={team?.name} onClose={() => setTeam(null)} width={480}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="负责人导师" name="mentorId" rules={[{ required: true, message: '请选择导师' }]}>
            <Select options={state.mentors.filter((item) => item.status === '启用').map((item) => ({ label: item.name, value: item.id }))} />
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
  const [editing, setEditing] = useState<TeamTask | null>(null);
  const [form] = Form.useForm();

  function openEditor(record?: TeamTask) {
    setEditing(record ?? null);
    setOpen(true);
    form.setFieldsValue(record ?? { status: '创建中', scope: '个人任务', submittedCount: 0, totalCount: 20 });
  }

  function submit(values: Omit<TeamTask, 'id' | 'updatedAt'>) {
    actions.saveTeamTask(values, editing?.id);
    message.success('团队任务已更新');
    setOpen(false);
    setEditing(null);
  }
  const { filteredRecords: filteredTeamTasks, toolbar } = useListFilters<TeamTask>(
    state.teamTasks,
    [
      { name: 'keyword', label: '任务关键词', placeholder: '任务名称 / 团队名称', match: textMatcher((item) => item.name, (item) => selectors.getTeamById(item.teamId)?.name) },
      { name: 'teamId', label: '所属团队', type: 'select', options: state.teams.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.teamId) },
      { name: 'scope', label: '任务类型', type: 'select', options: makeOptions(state.teamTasks.map((item) => item.scope)), match: equalsMatcher((item) => item.scope) },
      { name: 'status', label: '任务状态', type: 'select', options: makeOptions(state.teamTasks.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'mentorId', label: '导师', type: 'select', options: state.mentors.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.mentorId) },
    ],
    <Button type="primary" onClick={() => openEditor()}>新增任务</Button>,
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
            { title: '任务状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            { title: '完成进度', render: (_, record: TeamTask) => `${record.submittedCount}/${record.totalCount}` },
            { title: '导师', render: (_, record: TeamTask) => selectors.getMentorById(record.mentorId)?.name ?? '未关联' },
            { title: '操作', render: (_, record: TeamTask) => <Button type="link" onClick={() => openEditor(record)}>编辑</Button> },
          ]}
        />
      </Card>
      <Drawer open={open} title={editing ? '编辑任务' : '新增任务'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="所属团队" name="teamId" rules={[{ required: true, message: '请选择团队' }]}>
            <Select options={state.teams.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item label="任务名称" name="name" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="任务范围" name="scope"><Select options={['个人任务', '小组任务'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="任务状态" name="status"><Select options={['创建中', '已下发', '进行中', '已结束'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="已提交" name="submittedCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="应提交" name="totalCount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="关联导师" name="mentorId">
            <Select allowClear options={state.mentors.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Button type="primary" htmlType="submit">保存任务</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function RentalOrdersPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [creating, setCreating] = useState(false);
  const [rentalDetail, setRentalDetail] = useState<any>(null);
  const [createForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  const freeDevices = state.devices.filter((item) => item.status === '库存');

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
      { name: 'organizationId', label: '合作机构', type: 'select', options: state.organizations.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.organizationId) },
      { name: 'status', label: '租赁状态', type: 'select', options: makeOptions(state.rentalOrders.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'saleOwner', label: '销售员工', type: 'select', options: makeOptions(state.rentalOrders.map((item) => item.saleOwner)), match: equalsMatcher((item) => item.saleOwner) },
    ],
    <Button type="primary" onClick={() => setCreating(true)}>创建租赁订单</Button>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="租赁订单" subtitle="管理租赁订单、状态流转、收款与设备交付回收。" />
      {toolbar}
      <Card>
        <Table
          rowKey="id"
          dataSource={filteredRentalOrders}
          columns={[
            { title: '订单号', dataIndex: 'id' },
            { title: '机构', render: (_, record: any) => state.organizations.find((item) => item.id === record.organizationId)?.name ?? '-' },
            { title: '联系人', dataIndex: 'contactName' },
            { title: '租赁数量', dataIndex: 'quantity' },
            { title: '租赁天数', dataIndex: 'days' },
            { title: '总金额', dataIndex: 'totalAmount' },
            { title: '已收金额', dataIndex: 'paidAmount' },
            { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
            { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => setRentalDetail(record)}>详情</Button> },
          ]}
        />
      </Card>
      <Drawer open={creating} title="创建租赁订单" onClose={() => setCreating(false)} width={560}>
        <Form form={createForm} layout="vertical" onFinish={submitCreate}>
          <Form.Item label="合作机构" name="organizationId" rules={[{ required: true, message: '请选择机构' }]}>
            <Select options={state.organizations.map((item) => ({ label: item.name, value: item.id }))} />
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
          <Form.Item label="租赁状态" name="status" initialValue="意向"><Select options={['意向', '已预订', '已交付', '已回收'].map((value) => ({ label: value, value }))} /></Form.Item>
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
              { key: '2', label: '租赁日期', children: rentalDetail.rentalDate },
              { key: '3', label: '订单状态', children: <Tag color={statusColor(rentalDetail.status)}>{rentalDetail.status}</Tag> },
              { key: '4', label: '已分配设备', children: rentalDetail.deviceSerials.join('、') || '尚未分配' },
            ]} />
            <Card title="状态流转">
              <Form form={statusForm} layout="vertical" onFinish={submitStatus} initialValues={{ status: rentalDetail.status, serials: rentalDetail.deviceSerials, note: rentalDetail.note }}>
                <Form.Item label="订单状态" name="status">
                  <Select options={['意向', '已预订', '已交付', '已回收'].map((value) => ({ label: value, value }))} />
                </Form.Item>
                <Form.Item label="设备序列号" name="serials">
                  <Select mode="multiple" options={freeDevices.concat(state.devices.filter((item) => rentalDetail.deviceSerials.includes(item.serialNumber))).map((item) => ({ label: item.serialNumber, value: item.serialNumber }))} />
                </Form.Item>
                <Form.Item label="备注" name="note">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Button type="primary" htmlType="submit">更新状态</Button>
              </Form>
            </Card>
            <Card title="收款记录">
              <List
                dataSource={rentalDetail.payments}
                locale={{ emptyText: '暂无收款记录' }}
                renderItem={(item: any) => <List.Item>{item.createdAt} · {item.method} · {item.amount} 元 · {item.note}</List.Item>}
              />
              <Divider />
              <Form form={paymentForm} layout="inline" onFinish={submitPayment}>
                <Form.Item name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber placeholder="金额" min={1} /></Form.Item>
                <Form.Item name="method" initialValue="转账"><Select style={{ width: 120 }} options={['转账', '扫码', '现金'].map((value) => ({ label: value, value }))} /></Form.Item>
                <Form.Item name="note" rules={[{ required: true, message: '请输入摘要' }]}><Input placeholder="收款摘要" /></Form.Item>
                <Button type="primary" htmlType="submit">录入收款</Button>
              </Form>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}

function InventoryPage() {
  const { state } = useAdminStore();
  const summary = useMemo(
    () => ({
      stock: state.devices.filter((item) => item.status === '库存').length,
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
    <Button onClick={() => exportInventory(state.inventoryDaily)}>导出库存日报</Button>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="进销存总览" subtitle="查看库存日报，并核对当前设备状态分布。" />
      {toolbar}
      <Row gutter={[16, 16]}>
        <Col span={8}><Card><Statistic title="当前库存" value={summary.stock} /></Card></Col>
        <Col span={8}><Card><Statistic title="租赁中设备" value={summary.rental} /></Card></Col>
        <Col span={8}><Card><Statistic title="已销售设备" value={summary.sold} /></Card></Col>
      </Row>
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
    </Space>
  );
}

function StudentDetailTabs({ student }: { student: StudentProfile }) {
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
          children: <List dataSource={student.capabilityRecords} renderItem={(item) => <List.Item>{item.changedAt} · {item.element} · {item.oldValue} → {item.newValue}</List.Item>} />,
        },
        {
          key: 'assessment',
          label: '能力评测',
          children: <List dataSource={student.assessments} renderItem={(item) => <List.Item>{item.createdAt} · {item.type} · {item.score} 分</List.Item>} />,
        },
      ]}
    />
  );
}

function StudentsPage() {
  const { state } = useAdminStore();
  const [detail, setDetail] = useState<StudentProfile | null>(null);
  const { filteredRecords: filteredStudents, toolbar } = useListFilters<StudentProfile>(
    state.students,
    [
      { name: 'keyword', label: '学员关键词', placeholder: '姓名 / 学校 / 家长 / 手机号', match: textMatcher((item) => item.name, (item) => item.school, (item) => item.parentName, (item) => item.parentPhone) },
      { name: 'school', label: '学校', type: 'select', options: makeOptions(state.students.map((item) => item.school)), match: equalsMatcher((item) => item.school) },
      { name: 'boundDevice', label: '设备绑定', type: 'select', options: [{ label: '已绑定', value: true }, { label: '未绑定', value: false }], match: equalsMatcher((item) => item.boundDevice) },
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
            <StudentDetailTabs student={detail} />
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
    form.setFieldsValue(record ?? { city: cityIds[0] ?? '深圳市-南山区', chargeType: '免费', reservationNeeded: true, audience: '小学高段-初中', openingHours: '09:00-18:00' });
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
          { title: '收费类型', dataIndex: 'chargeType' },
          { title: '开放时间', dataIndex: 'openingHours' },
          { title: '审核状态', dataIndex: 'approvalStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: StudyBase) => <Button type="link" onClick={() => openEditor(record)}>编辑</Button> },
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
          <Row gutter={12}>
            <Col span={12}><Form.Item label="收费类型" name="chargeType"><Select options={['免费', '收费'].map((value) => ({ label: value, value }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="开放时间" name="openingHours"><Input /></Form.Item></Col>
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
    ],
    <Button type="primary" onClick={() => openEditor()}>新增任务</Button>,
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title={mode === 'city_maintainer' ? '任务维护' : '任务库'} subtitle="维护任务模板、标签与适用范围。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredTaskLibrary} columns={[
          { title: '任务名称', dataIndex: 'name' },
          { title: '所在城市', dataIndex: 'city' },
          { title: '基地', render: (_, record: TaskLibraryItem) => selectors.getBaseById(record.baseId)?.name ?? '未关联' },
          { title: '任务类型', render: (_, record: TaskLibraryItem) => selectors.getTaskTypeById(record.typeId)?.name ?? '-' },
          { title: '能力标签', render: (_, record: TaskLibraryItem) => record.abilityTags.join('、') },
          { title: '审核状态', dataIndex: 'approvalStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: TaskLibraryItem) => <Button type="link" onClick={() => openEditor(record)}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editing ? '编辑任务' : '新增任务'} onClose={() => setOpen(false)} width={620}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="所在城市" name="city" rules={[{ required: true, message: '请输入城市' }]}><Input disabled={mode === 'city_maintainer'} /></Form.Item></Col>
            <Col span={12}><Form.Item label="任务名称" name="name" rules={[{ required: true, message: '请输入任务名称' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="关联基地" name="baseId"><Select allowClear options={state.bases.filter((item) => mode === 'operator' || cityIds.includes(item.city)).map((item) => ({ label: item.name, value: item.id }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="任务类型" name="typeId" rules={[{ required: true, message: '请选择任务类型' }]}><Select options={state.taskTypes.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item></Col>
          </Row>
          <Form.Item label="任务说明" name="description" rules={[{ required: true, message: '请输入任务说明' }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item label="能力标签" name="abilityTags"><Select mode="tags" /></Form.Item>
          <Form.Item label="关联学科" name="subjectTags"><Select mode="tags" /></Form.Item>
          <Form.Item label="适合学段" name="stageTags"><Select mode="tags" /></Form.Item>
          <Form.Item label="适用研学类型" name="applyTo"><Select mode="multiple" options={['团体研学', '家庭研学', '难题挑战', 'PBL研学'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">{mode === 'city_maintainer' ? '提交审核' : '保存任务'}</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function AuditsPage({ mode }: { mode: AdminRole }) {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const { editorId } = useCityScope();
  const [current, setCurrent] = useState<AuditRecord | null>(null);
  const [form] = Form.useForm();

  const records =
    mode === 'city_maintainer' ? state.audits.filter((item) => item.maintainerId === editorId) : state.audits;
  const { filteredRecords: filteredAudits, toolbar } = useListFilters<AuditRecord>(
    records,
    [
      { name: 'keyword', label: '审核关键词', placeholder: '标题 / 维护员 / 备注', match: textMatcher((item) => item.title, (item) => item.maintainerName, (item) => item.note) },
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
      <Card>
        <Table rowKey="id" dataSource={filteredAudits} columns={[
          { title: '类型', dataIndex: 'targetType' },
          { title: '标题', dataIndex: 'title' },
          { title: '城市', dataIndex: 'city' },
          { title: '维护员', dataIndex: 'maintainerName' },
          { title: '提交时间', dataIndex: 'submittedAt' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '备注', dataIndex: 'note' },
          ...(mode === 'operator'
            ? [{ title: '操作', render: (_: unknown, record: AuditRecord) => <Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue({ status: '已确认', note: record.note }); }}>审核</Button> }]
            : []),
        ]} />
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
    </Space>
  );
}

function TeamPhotosPage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [current, setCurrent] = useState<any>(null);
  const [form] = Form.useForm();

  function submit(values: { linkedStudentIds: string[]; status: PhotoRecognitionStatus; note: string }) {
    actions.savePhotoLinks(current.id, values.linkedStudentIds, values.status, values.note);
    message.success('照片关联结果已更新');
    setCurrent(null);
  }
  const { filteredRecords: filteredTeamPhotos, toolbar } = useListFilters<any>(
    state.teamPhotos,
    [
      { name: 'keyword', label: '照片关键词', placeholder: '照片标题 / 团队名称', match: textMatcher((item) => item.title, (item) => state.teams.find((team) => team.id === item.teamId)?.name) },
      { name: 'teamId', label: '所属团队', type: 'select', options: state.teams.map((item) => ({ label: item.name, value: item.id })), match: equalsMatcher((item) => item.teamId) },
      { name: 'status', label: '识别状态', type: 'select', options: makeOptions(state.teamPhotos.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="团队照片" subtitle="照片上传后进入识别流程，支持人工修正后写入成长记录。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredTeamPhotos} columns={[
          { title: '照片标题', dataIndex: 'title' },
          { title: '所属团队', render: (_, record: any) => state.teams.find((item) => item.id === record.teamId)?.name ?? '-' },
          { title: '上传时间', dataIndex: 'uploadedAt' },
          { title: '识别状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '已关联学员', render: (_, record: any) => record.linkedStudentIds.length },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue(record); }}>修正结果</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(current)} title={current?.title} onClose={() => setCurrent(null)} width={520}>
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
                <Space>
                  {job.status !== '待确认' && job.status !== '已入库' ? <Button onClick={() => actions.advanceImportJob(job.id)}>推进流程</Button> : null}
                  {job.status === '待确认' ? <Button type="primary" onClick={() => actions.applyImportJob(job.id)}>确认入库</Button> : null}
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
          { title: '审核通过数', dataIndex: 'passedCount' },
          { title: '通过率', render: (_, record: any) => `${Math.round((record.passedCount / Math.max(record.baseCount + record.taskCount, 1)) * 100)}%` },
        ]} />
      </Card>
    </Space>
  );
}

function DevicesPage() {
  const { state } = useAdminStore();
  const { filteredRecords: filteredDevices, toolbar } = useListFilters<any>(
    state.devices,
    [
      { name: 'keyword', label: '设备关键词', placeholder: '序列号 / 批次 / 最近动作', match: textMatcher((item) => item.serialNumber, (item) => item.batch, (item) => item.lastAction) },
      { name: 'batch', label: '批次', type: 'select', options: makeOptions(state.devices.map((item) => item.batch)), match: equalsMatcher((item) => item.batch) },
      { name: 'status', label: '设备状态', type: 'select', options: makeOptions(state.devices.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
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
          { title: '最近动作', dataIndex: 'lastAction' },
        ]} />
      </Card>
      <Card title="远程擦除记录">
        <List dataSource={state.erasureRecords} locale={{ emptyText: '当前无擦除记录' }} renderItem={(item) => <List.Item>{item.createdAt} · {item.serialNumber} · {item.status}</List.Item>} />
      </Card>
    </Space>
  );
}

function SalesOnlinePage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [current, setCurrent] = useState<any>(null);
  const [form] = Form.useForm();
  const freeDevices = state.devices.filter((item) => item.status === '库存');
  const { filteredRecords: filteredOnlineSales, toolbar } = useListFilters<any>(
    state.onlineSales,
    [
      { name: 'keyword', label: '订单关键词', placeholder: '订单号 / 购买人 / 手机号', match: textMatcher((item) => item.id, (item) => item.buyerName, (item) => item.phone) },
      { name: 'status', label: '发货状态', type: 'select', options: makeOptions(state.onlineSales.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );
  function submit(values: { serials: string[]; expressCompany: string; expressNo: string }) {
    actions.shipOnlineSale(current.id, values.serials, values.expressCompany, values.expressNo);
    message.success('发货信息已更新');
    setCurrent(null);
  }
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="在线销售" subtitle="管理商城订单、发货信息与设备出库。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredOnlineSales} columns={[
          { title: '订单号', dataIndex: 'id' },
          { title: '购买人', dataIndex: 'buyerName' },
          { title: '手机号', dataIndex: 'phone' },
          { title: '订购数量', dataIndex: 'quantity' },
          { title: '实付金额', dataIndex: 'paidAmount' },
          { title: '发货状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue({ serials: record.deviceSerials }); }}>发货</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(current)} title={current?.id} onClose={() => setCurrent(null)} width={520}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="设备序列号" name="serials" rules={[{ required: true, message: '请选择设备' }]}>
            <Select mode="multiple" options={freeDevices.concat(state.devices.filter((item) => current?.deviceSerials?.includes(item.serialNumber))).map((item) => ({ label: item.serialNumber, value: item.serialNumber }))} />
          </Form.Item>
          <Form.Item label="快递公司" name="expressCompany" rules={[{ required: true, message: '请输入快递公司' }]}><Input /></Form.Item>
          <Form.Item label="快递单号" name="expressNo" rules={[{ required: true, message: '请输入快递单号' }]}><Input /></Form.Item>
          <Button type="primary" htmlType="submit">确认发货</Button>
        </Form>
      </Drawer>
    </Space>
  );
}

function SalesEnterprisePage() {
  const { state, actions } = useAdminStore();
  const { message } = App.useApp();
  const [current, setCurrent] = useState<any>(null);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const freeDevices = state.devices.filter((item) => item.status === '库存');
  const { filteredRecords: filteredEnterpriseSales, toolbar } = useListFilters<any>(
    state.enterpriseSales,
    [
      { name: 'keyword', label: '订单关键词', placeholder: '订单号 / 客户名称 / 联系人', match: textMatcher((item) => item.id, (item) => item.customerName, (item) => item.contactName) },
      { name: 'status', label: '订单状态', type: 'select', options: makeOptions(state.enterpriseSales.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
      { name: 'saleOwner', label: '销售员工', type: 'select', options: makeOptions(state.enterpriseSales.map((item) => item.saleOwner)), match: equalsMatcher((item) => item.saleOwner) },
    ],
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="企业销售" subtitle="管理对公销售订单、收款与设备交付。" />
      {toolbar}
      <Card>
        <Table rowKey="id" dataSource={filteredEnterpriseSales} columns={[
          { title: '订单号', dataIndex: 'id' },
          { title: '客户名称', dataIndex: 'customerName' },
          { title: '销售数量', dataIndex: 'quantity' },
          { title: '总金额', dataIndex: 'totalAmount' },
          { title: '已收金额', dataIndex: 'paidAmount' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setCurrent(record); form.setFieldsValue({ serials: record.deviceSerials, status: record.status }); }}>详情</Button> },
        ]} />
      </Card>
      <Drawer open={Boolean(current)} title={current?.customerName} onClose={() => setCurrent(null)} width={620}>
        {current ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Form form={form} layout="vertical" onFinish={(values) => { actions.updateEnterpriseSale(current.id, values.serials, values.status); message.success('企业销售状态已更新'); }}>
              <Form.Item label="设备序列号" name="serials">
                <Select mode="multiple" options={freeDevices.concat(state.devices.filter((item) => current.deviceSerials.includes(item.serialNumber))).map((item) => ({ label: item.serialNumber, value: item.serialNumber }))} />
              </Form.Item>
              <Form.Item label="订单状态" name="status">
                <Select options={['意向', '已预订', '已交付'].map((value) => ({ label: value, value }))} />
              </Form.Item>
              <Button type="primary" htmlType="submit">更新交付状态</Button>
            </Form>
            <Card title="收款记录">
              <List dataSource={current.payments} locale={{ emptyText: '暂无收款记录' }} renderItem={(item: any) => <List.Item>{item.createdAt} · {item.method} · {item.amount} 元</List.Item>} />
              <Divider />
              <Form form={paymentForm} layout="inline" onFinish={(values) => { actions.addEnterprisePayment(current.id, values); message.success('收款记录已新增'); paymentForm.resetFields(); }}>
                <Form.Item name="amount" rules={[{ required: true, message: '请输入金额' }]}><InputNumber min={1} placeholder="金额" /></Form.Item>
                <Form.Item name="method" initialValue="转账"><Select style={{ width: 120 }} options={['转账', '扫码', '现金'].map((value) => ({ label: value, value }))} /></Form.Item>
                <Form.Item name="note" rules={[{ required: true, message: '请输入摘要' }]}><Input placeholder="摘要" /></Form.Item>
                <Button type="primary" htmlType="submit">录入收款</Button>
              </Form>
            </Card>
          </Space>
        ) : null}
      </Drawer>
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
  const { filteredRecords: filteredCourses, toolbar } = useListFilters<any>(
    state.courses,
    [
      { name: 'keyword', label: '课程关键词', placeholder: '课程名称 / 专家', match: textMatcher((item) => item.title, (item) => item.expertName) },
      { name: 'type', label: '课程类型', type: 'select', options: makeOptions(state.courses.map((item) => item.type)), match: equalsMatcher((item) => item.type) },
      { name: 'status', label: '课程状态', type: 'select', options: makeOptions(state.courses.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
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
          { title: '浏览量', dataIndex: 'views' },
          { title: '销售量', dataIndex: 'sales' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => actions.toggleCourseStatus(record.id)}>{record.status === '已上架' ? '下架' : '上架'}</Button> },
        ]} />
      </Card>
    </Space>
  );
}

function QaRecordsPage() {
  const { state, actions } = useAdminStore();
  const { filteredRecords: filteredQaRecords, toolbar } = useListFilters<any>(
    state.qaRecords,
    [
      { name: 'keyword', label: '问答关键词', placeholder: '学员 / 智能体 / 问题摘要', match: textMatcher((item) => item.studentName, (item) => item.agentName, (item) => item.summary) },
      { name: 'matchedKnowledge', label: '知识库命中', type: 'select', options: [{ label: '已命中', value: true }, { label: '未命中', value: false }], match: equalsMatcher((item) => item.matchedKnowledge) },
      { name: 'status', label: '处理状态', type: 'select', options: makeOptions(state.qaRecords.map((item) => item.status)), match: equalsMatcher((item) => item.status) },
    ],
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="问答记录" subtitle="聚焦未匹配问答，补充答案后同步进入知识库。" />
      {toolbar}
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
    </Space>
  );
}

function KnowledgePage() {
  const { state, actions } = useAdminStore();
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
      <Card>
        <Table rowKey="id" dataSource={filteredKnowledge} columns={[
          { title: '标题', dataIndex: 'title' },
          { title: '类别', dataIndex: 'category' },
          { title: '更新时间', dataIndex: 'updatedAt' },
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => actions.toggleKnowledgeStatus(record.id)}>{record.status === '已发布' ? '转草稿' : '发布'}</Button> },
        ]} />
      </Card>
    </Space>
  );
}

function AgentsPage() {
  const { state, actions } = useAdminStore();
  const { filteredRecords: filteredAgents, toolbar } = useListFilters<any>(
    state.agents,
    [
      { name: 'keyword', label: '智能体关键词', placeholder: '名称 / 回复风格', match: textMatcher((item) => item.name, (item) => item.style) },
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
          { title: '回复风格', dataIndex: 'style' },
          { title: '关联知识库', render: (_, record: any) => record.knowledgeIds.length },
          { title: '累计用户量', dataIndex: 'users' },
          { title: '问答次数', dataIndex: 'questions' },
          { title: '状态', dataIndex: 'onlineStatus', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => actions.toggleAgentStatus(record.id)}>{record.onlineStatus === '已上架' ? '下架' : '上架'}</Button> },
        ]} />
      </Card>
    </Space>
  );
}

function CapabilityElementsPage() {
  const { state, actions } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { filteredRecords: filteredCapabilityMappings, toolbar } = useListFilters<CapabilityMapping>(
    state.capabilityMappings,
    [
      { name: 'keyword', label: '映射关键词', placeholder: '机构类型 / 评价指标', match: textMatcher((item) => item.organizationType, (item) => item.indicator) },
      { name: 'organizationType', label: '机构类型', type: 'select', options: makeOptions(state.capabilityMappings.map((item) => item.organizationType)), match: equalsMatcher((item) => item.organizationType) },
      { name: 'elementId', label: '能力元素', type: 'select', options: state.capabilityElements.map((item) => ({ label: item.name, value: item.id })), match: arrayIncludesMatcher((item) => item.elementIds) },
    ],
    <Button type="primary" onClick={() => { setOpen(true); setEditingId(undefined); form.resetFields(); }}>新增映射</Button>,
  );
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SectionHeader title="能力元素" subtitle="维护 16 项能力元素与机构评价指标映射规则。" />
      {toolbar}
      <Row gutter={[16, 16]}>
        {['领导执行', '创新创造', '认知成长', '社会适应'].map((plane) => (
          <Col span={12} key={plane}>
            <Card title={plane}>
              <List dataSource={state.capabilityElements.filter((item) => item.plane === plane)} renderItem={(item) => <List.Item>{item.name}</List.Item>} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="映射关系">
        <Table rowKey="id" dataSource={filteredCapabilityMappings} columns={[
          { title: '机构类型', dataIndex: 'organizationType' },
          { title: '评价指标', dataIndex: 'indicator' },
          { title: '关联能力元素', render: (_, record: CapabilityMapping) => record.elementIds.map((id) => state.capabilityElements.find((item) => item.id === id)?.name ?? '').join('、') },
          { title: '权重', dataIndex: 'weight' },
          { title: '操作', render: (_, record: CapabilityMapping) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑映射' : '新增映射'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveCapabilityMapping(values, editingId); setOpen(false); }}>
          <Form.Item label="机构类型" name="organizationType" rules={[{ required: true, message: '请输入机构类型' }]}><Input /></Form.Item>
          <Form.Item label="评价指标" name="indicator" rules={[{ required: true, message: '请输入评价指标' }]}><Input /></Form.Item>
          <Form.Item label="关联能力元素" name="elementIds" rules={[{ required: true, message: '请选择能力元素' }]}><Select mode="multiple" options={state.capabilityElements.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item>
          <Form.Item label="映射权重" name="weight" rules={[{ required: true, message: '请输入权重' }]}><InputNumber min={0.1} max={1} step={0.05} style={{ width: '100%' }} /></Form.Item>
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
          { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag> },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑题目' : '新增题目'} onClose={() => setOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveQuestionBankItem(values, editingId); setOpen(false); }}>
          <Form.Item label="分类" name="category"><Select options={['学员自测', '家长评测'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="题型" name="type"><Select options={['单选', '判断', '问答'].map((value) => ({ label: value, value }))} /></Form.Item>
          <Form.Item label="题目" name="title"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item label="能力元素" name="element"><Input /></Form.Item>
          <Form.Item label="状态" name="status" initialValue="启用"><Select options={['启用', '草稿'].map((value) => ({ label: value, value }))} /></Form.Item>
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
          { title: '答题时长(分钟)', dataIndex: 'durationMinutes' },
          { title: '操作', render: (_, record: any) => <Button type="link" onClick={() => { setEditingId(record.id); setOpen(true); form.setFieldsValue(record); }}>编辑</Button> },
        ]} />
      </Card>
      <Drawer open={open} title={editingId ? '编辑配置' : '新增配置'} onClose={() => setOpen(false)} width={420}>
        <Form form={form} layout="vertical" onFinish={(values) => { actions.saveAssessmentSetting(values, editingId); setOpen(false); }}>
          <Form.Item label="配置项" name="label"><Input /></Form.Item>
          <Form.Item label="时长(分钟)" name="durationMinutes"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Button type="primary" htmlType="submit">保存配置</Button>
        </Form>
      </Drawer>
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
    case 'question-bank':
      return <QuestionBankPage />;
    case 'growth-rules':
      return <GrowthRulesPage />;
    case 'growth-goods':
      return <GrowthGoodsPage />;
    case 'assessment-settings':
      return <AssessmentSettingsPage />;
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
