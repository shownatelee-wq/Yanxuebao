'use client';

import { Button, Card, Collapse, Form, Input, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Team = {
  id: string;
  name: string;
  organizationName: string;
  studentCount: number;
  groupCount: number;
  status: string;
};

type TeamDetail = {
  id: string;
  name: string;
  groups: Array<{ id: string; name: string }>;
  members: Array<{ id: string; roleName?: string; student?: { name: string } }>;
};

const { Title } = Typography;

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [details, setDetails] = useState<Record<string, TeamDetail>>({});
  const [messageApi, contextHolder] = message.useMessage();

  async function loadTeams() {
    try {
      const data = await apiFetch<Team[]>('/teams');
      setTeams(data);
      await Promise.all(
        data.map(async (team) => {
          const detail = await apiFetch<TeamDetail>(`/teams/${team.id}`);
          setDetails((current) => ({ ...current, [team.id]: detail }));
        }),
      );
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载团队失败');
    }
  }

  async function createTeam(values: { name: string; organizationId?: string }) {
    try {
      await apiFetch('/teams', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('团队已创建');
      loadTeams();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建团队失败');
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        团队与小组
      </Title>
      <Card title="创建团队">
        <Form layout="inline" onFinish={createTeam}>
          <Form.Item name="name" rules={[{ required: true, message: '请输入团队名称' }]}>
            <Input placeholder="团队名称" />
          </Form.Item>
          <Form.Item name="organizationId">
            <Input placeholder="机构 ID（可选）" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            创建团队
          </Button>
        </Form>
      </Card>
      <Card title="团队列表">
        <Table
          rowKey="id"
          dataSource={teams}
          columns={[
            { title: '团队名称', dataIndex: 'name' },
            { title: '机构', dataIndex: 'organizationName' },
            { title: '学员数', dataIndex: 'studentCount' },
            { title: '小组数', dataIndex: 'groupCount' },
            { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="blue">{value}</Tag> },
          ]}
          expandable={{
            expandedRowRender: (team) => {
              const detail = details[team.id];
              if (!detail) {
                return '加载中...';
              }
              return (
                <Collapse
                  items={[
                    {
                      key: 'groups',
                      label: '小组信息',
                      children: (
                        <Space wrap>
                          {detail.groups.map((group) => (
                            <Tag key={group.id}>{group.name}</Tag>
                          ))}
                        </Space>
                      ),
                    },
                    {
                      key: 'members',
                      label: '成员信息',
                      children: detail.members.map((member) => (
                        <div key={member.id}>
                          {member.student?.name} {member.roleName ? `· ${member.roleName}` : ''}
                        </div>
                      )),
                    },
                  ]}
                />
              );
            },
          }}
        />
      </Card>
    </Space>
  );
}

