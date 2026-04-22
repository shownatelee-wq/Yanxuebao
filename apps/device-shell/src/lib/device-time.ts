'use client';

export function getDeviceNow() {
  return new Date();
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function parseRelativeLabel(value: string, baseDate = getDeviceNow()) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed === '刚刚') {
    return new Date(baseDate);
  }

  const relativeMatch = trimmed.match(/^(今天|昨天)\s+(\d{1,2}):(\d{2})$/);
  if (relativeMatch) {
    const next = new Date(baseDate);
    if (relativeMatch[1] === '昨天') {
      next.setDate(next.getDate() - 1);
    }
    next.setHours(Number(relativeMatch[2]), Number(relativeMatch[3]), 0, 0);
    return next;
  }

  const directDateMatch = trimmed.match(
    /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})(?:日)?(?:[ T]?(\d{1,2}):(\d{2}))?$/,
  );
  if (directDateMatch) {
    const [, year, month, day, hour = '0', minute = '0'] = directDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0, 0);
  }

  const native = new Date(trimmed);
  if (!Number.isNaN(native.getTime())) {
    return native;
  }

  return null;
}

export function normalizeDeviceTimeValue(value?: string, fallback = getDeviceNow().toISOString()) {
  if (!value) {
    return fallback;
  }
  const parsed = parseRelativeLabel(value);
  return parsed ? parsed.toISOString() : fallback;
}

export function formatDeviceDisplayTime(value: string, now = getDeviceNow()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '刚刚';
  }

  const current = new Date(now);
  const sameYear = date.getFullYear() === current.getFullYear();
  const sameMonth = date.getMonth() === current.getMonth();
  const sameDay = sameYear && sameMonth && date.getDate() === current.getDate();

  const yesterday = new Date(current);
  yesterday.setDate(current.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear()
    && date.getMonth() === yesterday.getMonth()
    && date.getDate() === yesterday.getDate();

  if (sameDay) {
    return `今天 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  if (isYesterday) {
    return `昨天 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDeviceDateTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '今天';
  }

  const sameDate =
    start.getFullYear() === end.getFullYear()
    && start.getMonth() === end.getMonth()
    && start.getDate() === end.getDate();

  const startDateLabel = `${pad(start.getMonth() + 1)}月${pad(start.getDate())}日`;
  const endDateLabel = `${pad(end.getMonth() + 1)}月${pad(end.getDate())}日`;
  const startTimeLabel = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTimeLabel = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

  if (sameDate) {
    return `${startDateLabel} ${startTimeLabel} - ${endTimeLabel}`;
  }

  return `${startDateLabel} ${startTimeLabel} - ${endDateLabel} ${endTimeLabel}`;
}

export function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return getDeviceNow().toISOString();
  }
  return parsed.toISOString();
}

export function isTimeValueInRange(value: string, startAt: string, endAt: string) {
  const current = new Date(value).getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if ([current, start, end].some((item) => Number.isNaN(item))) {
    return false;
  }
  return current >= start && current <= end;
}
