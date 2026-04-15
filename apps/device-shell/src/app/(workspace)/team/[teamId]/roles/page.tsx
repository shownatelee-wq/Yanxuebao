'use client';

import { Button, Result, Select, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { assignTeamRole, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

const roleOptions = ['组长', '副组长', '观察员', '记录员', '操作员', '统计员', '汇报员', '摄影师', '安全员'];

export default function DeviceTeamRolesScopedPage() {
  const params = useParams<{ teamId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const currentGroup = detail?.groups.find((group) => group.id === detail.myGroupId);
  const currentMember = currentGroup?.members.find((member) => member.isCurrentStudent);
  const canManage = Boolean(currentMember?.canManageRoles);

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>团队列表</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="岗位"
        subtitle={canManage ? '当前你是组长/副组长，可为组员设置岗位。' : '普通成员只能查看当前岗位和组内分工。'}
        tags={[{ label: detail.myRole }, { label: currentGroup?.name ?? '待分组', color: 'cyan' }]}
      />

      <WatchSection title="我的岗位">
        <div className="device-mini-item">
          <div className="device-mini-item-title">
            <span>{detail.myMember.name}</span>
            <Tag color="green">{detail.myRole}</Tag>
          </div>
          {detail.myMember.note ? <p className="device-mini-item-desc">{detail.myMember.note}</p> : null}
        </div>
      </WatchSection>

      <WatchSection title="组员岗位">
        <div className="device-mini-list">
          {(currentGroup?.members ?? []).map((member) => (
            <div key={member.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{member.name}</span>
                <Tag color={member.isCurrentStudent ? 'green' : 'blue'}>{member.roleName}</Tag>
              </div>
              {canManage && !member.isCurrentStudent ? (
                <Select
                  size="small"
                  value={member.roleName}
                  style={{ width: '100%', marginTop: 8 }}
                  options={roleOptions.map((role) => ({ label: role, value: role }))}
                  onChange={(value) => {
                    if (!currentGroup) {
                      return;
                    }
                    assignTeamRole(team.id, currentGroup.id, member.id, value);
                    messageApi.success(`已把${member.name}设为${value}`);
                  }}
                />
              ) : member.note ? (
                <p className="device-mini-item-desc" style={{ marginTop: 6 }}>{member.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </WatchSection>

      <div className="device-action-row">
        <Link href={`/team/${team.id}/badge`}>
          <Button type="primary" block>队名队徽</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
