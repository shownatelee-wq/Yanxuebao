'use client';

import { useEffect, useState } from 'react';
import {
  demoTeamBadges,
  demoTeamDetails,
  demoTeams,
  type DemoReviewRubric,
  type DemoReviewRubricItem,
  type DemoTeam,
  type DemoTeamBadge,
  type DemoTeamDetail,
  type DemoTeamEvaluationItem,
  type DemoTeamReviewTask,
} from './device-demo-data';

const DEVICE_TEAM_STATE_KEY = 'yanxuebao_device_team_state_v3';
const DEVICE_TEAM_EVENT = 'yanxuebao:device-team-change';

type DeviceTeamState = {
  teams: DemoTeam[];
  details: Record<string, DemoTeamDetail>;
};

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createInitialTeamState(): DeviceTeamState {
  return {
    teams: cloneState(demoTeams),
    details: cloneState(demoTeamDetails),
  };
}

function getStoredTeamState(): DeviceTeamState {
  if (typeof window === 'undefined') {
    return createInitialTeamState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_TEAM_STATE_KEY);
  if (!raw) {
    const initial = createInitialTeamState();
    window.sessionStorage.setItem(DEVICE_TEAM_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(raw) as DeviceTeamState;
}

function setStoredTeamState(nextState: DeviceTeamState) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(DEVICE_TEAM_STATE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new Event(DEVICE_TEAM_EVENT));
  }
}

function updateTeamState(mutator: (draft: DeviceTeamState) => void) {
  const draft = getStoredTeamState();
  mutator(draft);
  setStoredTeamState(draft);
  return draft;
}

function getTeamStateSnapshot() {
  const state = getStoredTeamState();
  return {
    teams: cloneState(state.teams),
    details: cloneState(state.details),
  };
}

export function useDeviceTeamSnapshot() {
  const [snapshot, setSnapshot] = useState(() => getTeamStateSnapshot());

  useEffect(() => {
    function sync() {
      setSnapshot(getTeamStateSnapshot());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_TEAM_EVENT, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_TEAM_EVENT, sync);
    };
  }, []);

  return snapshot;
}

function getTeamDetailFromState(state: DeviceTeamState, teamId: string) {
  return state.details[teamId];
}

function getTeamFromState(state: DeviceTeamState, teamId: string) {
  return state.teams.find((item) => item.id === teamId);
}

function buildReviewTask(
  current: DemoTeamReviewTask,
  status: '待完成' | '已完成',
  summary?: string,
  targetName?: string,
) {
  return {
    ...current,
    status,
    summary: summary ?? current.summary,
    targetName: targetName ?? current.targetName,
  };
}

function getCurrentStudentMember(detail: DemoTeamDetail) {
  return detail.groups.flatMap((group) => group.members).find((member) => member.isCurrentStudent) ?? detail.myMember;
}

export function getVisibleTeamsForList() {
  const state = getStoredTeamState();
  return [...state.teams].sort((left, right) => {
    const priority = (team: DemoTeam) => {
      if (team.sourceType === '研学旅行推荐') {
        return 90;
      }
      if (team.membershipStatus === '已加入' && team.lifecycleStatus === '进行中') {
        return 0;
      }
      if (team.membershipStatus === '已加入' && team.lifecycleStatus === '待出行') {
        return 1;
      }
      if (team.membershipStatus === '待审批') {
        return 2;
      }
      if (team.membershipStatus === '未加入' && team.lifecycleStatus === '招募中') {
        return 3;
      }
      if (team.membershipStatus === '历史可查看') {
        return 4;
      }
      return 10;
    };

    const leftOrder = priority(left);
    const rightOrder = priority(right);
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.studyDate < right.studyDate ? 1 : -1;
  });
}

export function getCurrentJoinedTeam() {
  const teams = getVisibleTeamsForList();
  return (
    teams.find((item) => item.membershipStatus === '已加入' && item.lifecycleStatus === '进行中') ??
    teams.find((item) => item.membershipStatus === '已加入') ??
    null
  );
}

export function getTeamById(teamId: string) {
  const state = getStoredTeamState();
  const team = getTeamFromState(state, teamId);
  const detail = team ? getTeamDetailFromState(state, teamId) : undefined;
  return team && detail ? { team, detail } : null;
}

export function getTeamByJoinCode(code: string) {
  const state = getStoredTeamState();
  const normalized = code.trim();
  const teamEntry = state.teams.find((item) => {
    const detail = state.details[item.id];
    return detail?.joinCode === normalized;
  });

  if (!teamEntry) {
    return null;
  }

  const detail = state.details[teamEntry.id];
  return detail ? { team: teamEntry, detail } : null;
}

export function submitTeamJoinCode(code: string) {
  const normalized = code.trim();
  if (!/^\d{6}$/.test(normalized)) {
    return { ok: false as const, reason: '授权码格式不正确，请输入 6 位数字。' };
  }

  const matched = getTeamByJoinCode(normalized);
  if (!matched) {
    return { ok: false as const, reason: '授权码无效，请检查后重新输入。' };
  }

  if (matched.team.lifecycleStatus === '已结束') {
    return { ok: false as const, reason: '该授权码已过期，不属于当前可加入的研学团队。' };
  }

  updateTeamState((draft) => {
    const team = getTeamFromState(draft, matched.team.id);
    if (team) {
      if (team.lifecycleStatus === '招募中') {
        team.membershipStatus = '待审批';
        team.joinStatus = 'joinable';
      } else {
        team.membershipStatus = '已加入';
        team.joinStatus = 'joined';
      }
    }
  });

  return {
    ok: true as const,
    teamId: matched.team.id,
    membershipStatus: matched.team.lifecycleStatus === '招募中' ? '待审批' : '已加入',
  };
}

export function submitTeamScanJoin(teamId: string) {
  const matched = getTeamById(teamId);
  if (!matched) {
    return { ok: false as const, reason: '未找到对应团队。' };
  }

  if (matched.team.lifecycleStatus === '已结束') {
    return { ok: false as const, reason: '该团队已结束，当前不可加入。' };
  }

  updateTeamState((draft) => {
    const team = getTeamFromState(draft, teamId);
    if (!team) {
      return;
    }

    if (team.lifecycleStatus === '招募中') {
      team.membershipStatus = '待审批';
      team.joinStatus = 'joinable';
      return;
    }

    team.membershipStatus = '已加入';
    team.joinStatus = 'joined';
  });

  return {
    ok: true as const,
    teamId,
    membershipStatus: matched.team.lifecycleStatus === '招募中' ? '待审批' : '已加入',
  };
}

export function getTeamBadges(teamId: string): DemoTeamBadge[] {
  const detail = getTeamById(teamId)?.detail;
  if (!detail) {
    return [];
  }

  return demoTeamBadges.map((badge) => ({
    ...badge,
    active: badge.title === detail.badge,
  }));
}

export function getTeamReviewTasks(teamId: string) {
  const detail = getTeamById(teamId)?.detail;
  if (!detail) {
    return [];
  }

  const tasks: DemoTeamReviewTask[] = [];
  if (detail.reviewConfig.allowSelfReview) {
    tasks.push(detail.reviewConfig.selfReviewTask);
  }
  if (detail.reviewConfig.allowPeerReview) {
    tasks.push(detail.reviewConfig.peerReviewTask);
  }
  return tasks;
}

export function joinTeamGroup(teamId: string, groupId: string) {
  updateTeamState((draft) => {
    const detail = getTeamDetailFromState(draft, teamId);
    if (!detail) {
      return;
    }

    const currentStudent = getCurrentStudentMember(detail);
    const previousGroupId = detail.myGroupId;
    const previousRole = detail.myRole;
    detail.groups.forEach((group) => {
      group.joined = group.id === groupId;
      group.members = group.members.filter((member) => !member.isCurrentStudent);
      if (group.id === groupId) {
        group.members.push({
          ...currentStudent,
          roleName: group.id === previousGroupId ? previousRole : '待分配',
          isCurrentStudent: true,
        });
        detail.groupName = group.displayName;
        detail.badge = group.badgeTitle;
      }
    });

    detail.myGroupId = groupId;
    detail.groupRole = groupId === previousGroupId ? previousRole : '待分配';
    detail.myRole = detail.groupRole;
    detail.myMember.roleName = detail.myRole;
  });
}

export function exitTeamGroup(teamId: string, groupId: string) {
  updateTeamState((draft) => {
    const detail = getTeamDetailFromState(draft, teamId);
    if (!detail || detail.myGroupId !== groupId) {
      return;
    }

    detail.groups.forEach((group) => {
      if (group.id === groupId) {
        group.joined = false;
        group.members = group.members.filter((member) => !member.isCurrentStudent);
      }
    });

    detail.myGroupId = undefined;
    detail.groupName = '待分组';
    detail.groupRole = '待分配';
    detail.myRole = '待分配';
    detail.myMember.roleName = '待分配';
    detail.badge = '未设置';
  });
}

export function updateTeamGroupProfile(
  teamId: string,
  groupId: string,
  payload: { customName: string; badgeTitle: string; badgeEmoji: string; badgeImage?: string },
) {
  updateTeamState((draft) => {
    const detail = getTeamDetailFromState(draft, teamId);
    if (!detail) {
      return;
    }

    const group = detail.groups.find((item) => item.id === groupId);
    if (!group) {
      return;
    }

    group.customName = payload.customName;
    group.name = payload.customName;
    group.displayName = `${group.serialNo}组：${payload.customName}`;
    group.badgeTitle = payload.badgeTitle;
    group.badgeEmoji = payload.badgeEmoji;
    group.badgeImage = payload.badgeImage ?? group.badgeImage;

    if (detail.myGroupId === groupId) {
      detail.groupName = group.displayName;
      detail.badge = payload.badgeTitle;
    }
  });
}

export function assignTeamRole(teamId: string, groupId: string, memberId: string, roleName: string, customRoleName?: string) {
  updateTeamState((draft) => {
    const detail = getTeamDetailFromState(draft, teamId);
    if (!detail) {
      return;
    }

    const group = detail.groups.find((item) => item.id === groupId);
    const member = group?.members.find((item) => item.id === memberId);
    if (!member) {
      return;
    }

    member.roleName = roleName;
    member.rolePreset = customRoleName ? undefined : roleName;
    member.customRoleName = customRoleName;
    if (member.isCurrentStudent) {
      detail.groupRole = roleName;
      detail.myRole = roleName;
      detail.myMember.roleName = roleName;
    }
  });
}

function toRubricLevel(score: number) {
  if (score >= 9) {
    return '优秀';
  }
  if (score >= 7) {
    return '良好';
  }
  if (score >= 5) {
    return '达标';
  }
  return '待提升';
}

function createRubricItems(
  detail: DemoTeamDetail,
  values: Array<{ dimension: string; score: number; comment: string }>,
): DemoReviewRubricItem[] {
  return values.map((item) => ({
    dimension: item.dimension,
    score: item.score,
    level: toRubricLevel(item.score),
    comment: item.comment,
  }));
}

function updateEvaluationRoleScores(
  detail: DemoTeamDetail,
  values: Array<{ dimension: string; score: number }>,
  roles: Array<DemoTeamEvaluationItem['scores'][number]['role']>,
) {
  detail.reviewConfig.evaluationItems?.forEach((item) => {
    const matched = values.find((value) => value.dimension === item.coreIndicator);
    if (!matched) {
      return;
    }
    item.scores = item.scores.map((score) => (roles.includes(score.role) ? { ...score, score: matched.score } : score));
  });
}

export function submitTeamSelfReview(
  teamId: string,
  payload: {
    summary: string;
    values: Array<{ dimension: string; score: number; comment: string }>;
  },
) {
  updateTeamState((draft) => {
    const detail = getTeamDetailFromState(draft, teamId);
    if (!detail) {
      return;
    }

    updateEvaluationRoleScores(detail, payload.values, ['学生自评', '小组自评']);
    const totalScore = payload.values.length ? payload.values.reduce((sum, item) => sum + item.score, 0) / payload.values.length : 0;
    const rubric: DemoReviewRubric = {
      role: '自评',
      targetName: detail.myMember.name,
      totalScore,
      summary: payload.summary,
      completedAt: '刚刚',
      items: createRubricItems(detail, payload.values),
    };

    detail.selfReviewResult = rubric;
    detail.reviewConfig.selfReviewTask = buildReviewTask(
      detail.reviewConfig.selfReviewTask,
      '已完成',
      payload.summary || '已完成今日团队自评。',
      detail.myMember.name,
    );
  });
}

export function submitTeamPeerReview(
  teamId: string,
  payload: {
    memberId: string;
    summary: string;
    values: Array<{ dimension: string; score: number; comment: string }>;
  },
) {
  updateTeamState((draft) => {
    const detail = getTeamDetailFromState(draft, teamId);
    if (!detail) {
      return;
    }

    const targetMember = detail.groups.flatMap((group) => group.members).find((member) => member.id === payload.memberId);
    if (!targetMember) {
      return;
    }

    updateEvaluationRoleScores(detail, payload.values, ['同学互评']);
    const totalScore = payload.values.length ? payload.values.reduce((sum, item) => sum + item.score, 0) / payload.values.length : 0;
    const rubric: DemoReviewRubric = {
      role: '互评',
      targetName: targetMember.name,
      totalScore,
      summary: payload.summary,
      completedAt: '刚刚',
      items: createRubricItems(detail, payload.values),
    };

    detail.peerReviewResult = rubric;
    detail.reviewConfig.peerReviewTask = buildReviewTask(
      detail.reviewConfig.peerReviewTask,
      '已完成',
      payload.summary || `已完成对${targetMember.name}的互评。`,
      targetMember.name,
    );
  });
}
