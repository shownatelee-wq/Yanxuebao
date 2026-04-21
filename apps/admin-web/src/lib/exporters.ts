'use client';

import type { Mentor, Organization, StudentProfile, InventoryDaily, AuditRecord, PartTimer } from './admin-store';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function exportSheet(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const blob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
}

export async function exportOrganizations(records: Organization[]) {
  await exportSheet(
    '合作机构台账.xlsx',
    '机构列表',
    records.map((item) => ({
      机构类型: item.type,
      机构名称: item.name,
      联系人: item.contactName,
      联系电话: item.contactPhone,
      所在城市: item.city,
      注册日期: item.registeredAt,
    })),
  );
}

export async function exportMentors(records: Mentor[], getOrganizationName: (organizationId: string) => string) {
  await exportSheet(
    '研学导师台账.xlsx',
    '导师列表',
    records.map((item) => ({
      所属机构: getOrganizationName(item.organizationId),
      导师姓名: item.name,
      手机号: item.phone,
      状态: item.status,
      注册日期: item.registeredAt,
      带团队数: item.teamsLed,
      任务总数: item.taskCount,
      研学总人次: item.participantCount,
    })),
  );
}

export async function exportAuditPerformance(records: AuditRecord[], maintainers: PartTimer[]) {
  await exportSheet(
    '审核与业绩统计.xlsx',
    '审核统计',
    records.map((item) => {
      const maintainer = maintainers.find((record) => record.id === item.maintainerId);
      return {
        类型: item.targetType,
        标题: item.title,
        城市: item.city,
        维护员: item.maintainerName,
        账号: maintainer?.account ?? '',
        提交时间: item.submittedAt,
        审核状态: item.status,
        备注: item.note,
      };
    }),
  );
}

export async function exportInventory(records: InventoryDaily[]) {
  await exportSheet(
    '库存日报.xlsx',
    '库存日报',
    records.map((item) => ({
      日期: item.date,
      上日库存: item.openingStock,
      今日入库: item.inbound,
      线上销售出库: item.onlineOutbound,
      企业销售出库: item.enterpriseOutbound,
      租赁出库: item.rentalOutbound,
      租赁回收入库: item.rentalInbound,
      当前库存: item.closingStock,
    })),
  );
}

export async function exportStudents(records: StudentProfile[]) {
  await exportSheet(
    '学员档案列表.xlsx',
    '学员档案',
    records.map((item) => ({
      学员姓名: item.name,
      年龄: item.age,
      学校: item.school,
      家长姓名: item.parentName,
      家长手机号: item.parentPhone,
      注册日期: item.registeredAt,
      设备绑定: item.boundDevice ? '已绑定' : '未绑定',
      能力指数: item.capabilityScore,
      成长值: item.growthValue,
      研学次数: item.studyCount,
    })),
  );
}

export async function exportStudentReport(student: StudentProfile) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('Helvetica');
  doc.setFontSize(20);
  doc.text('研学报告摘要', 40, 50);
  doc.setFontSize(12);
  doc.text(`学员：${student.name}`, 40, 82);
  doc.text(`学校：${student.school}`, 40, 102);
  doc.text(`能力指数：${student.capabilityScore}`, 40, 122);
  doc.text(`成长值：${student.growthValue}`, 40, 142);
  doc.text(`研学次数：${student.studyCount}`, 40, 162);

  doc.setFontSize(14);
  doc.text('近期研学记录', 40, 198);
  let y = 220;
  student.studyRecords.slice(0, 4).forEach((record) => {
    doc.setFontSize(11);
    doc.text(`${record.date}  ${record.teamName}  ${record.score} 分  ${record.rating}`, 50, y);
    y += 20;
  });

  y += 20;
  doc.setFontSize(14);
  doc.text('能力平面概览', 40, y);
  y += 22;

  Object.entries(student.capabilityPlaneScores).forEach(([key, value]) => {
    doc.setFontSize(11);
    doc.text(`${key}`, 50, y);
    doc.rect(130, y - 10, 220, 10);
    doc.setFillColor(21, 94, 239);
    doc.rect(130, y - 10, value * 22, 10, 'F');
    doc.text(String(value), 360, y);
    y += 24;
  });

  doc.save(`${student.name}-研学报告摘要.pdf`);
}

export async function exportStudentCapabilitySummary(student: StudentProfile) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('Helvetica');
  doc.setFontSize(20);
  doc.text('能力图表摘要', 40, 50);
  doc.setFontSize(12);
  doc.text(`学员：${student.name}`, 40, 80);
  doc.text(`当前能力指数：${student.capabilityScore}`, 40, 100);
  doc.text(`成长值：${student.growthValue}`, 40, 120);

  let y = 160;
  Object.entries(student.capabilityPlaneScores).forEach(([key, value]) => {
    doc.setFontSize(12);
    doc.text(key, 40, y);
    doc.rect(140, y - 10, 240, 12);
    doc.setFillColor(3, 152, 85);
    doc.rect(140, y - 10, value * 24, 12, 'F');
    doc.text(value.toFixed(1), 390, y);
    y += 28;
  });

  y += 12;
  doc.setFontSize(14);
  doc.text('最近能力变化记录', 40, y);
  y += 24;
  student.capabilityRecords.slice(0, 5).forEach((record) => {
    doc.setFontSize(11);
    doc.text(`${record.changedAt}  ${record.element}  ${record.oldValue} -> ${record.newValue}  ${record.source}`, 40, y);
    y += 18;
  });

  doc.save(`${student.name}-能力图表摘要.pdf`);
}
