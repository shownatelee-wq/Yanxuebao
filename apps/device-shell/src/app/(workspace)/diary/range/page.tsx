'use client';

import { Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  createCustomDiaryRange,
  getDiaryRangePresetOptions,
  getDiarySelectionState,
  updateDiarySelectionRange,
  type DeviceDiaryRangePreset,
} from '../../../../lib/device-diary-data';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../../../../lib/device-time';

export default function DeviceDiaryRangePage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const selection = getDiarySelectionState();
  const presetOptions = useMemo(() => getDiaryRangePresetOptions(), []);
  const [preset, setPreset] = useState<DeviceDiaryRangePreset>(selection.sourceRange.preset);
  const [startAt, setStartAt] = useState(selection.sourceRange.startAt);
  const [endAt, setEndAt] = useState(selection.sourceRange.endAt);

  function confirmRange() {
    const nextRange = preset === 'custom'
      ? createCustomDiaryRange(startAt, endAt)
      : presetOptions.find((item) => item.preset === preset) ?? presetOptions[0];

    if (new Date(nextRange.startAt).getTime() > new Date(nextRange.endAt).getTime()) {
      messageApi.warning('结束时间要晚于开始时间');
      return;
    }

    updateDiarySelectionRange(nextRange);
    router.push('/diary');
  }

  return (
    <div className="device-page-stack device-diary-range-page">
      {contextHolder}

      <div className="device-compact-card">
        <p className="device-section-label">快捷日期</p>
        <div className="device-diary-range-grid">
          {presetOptions.map((item) => (
            <button
              key={item.preset}
              type="button"
              className={`device-diary-range-option${preset === item.preset ? ' active' : ''}`}
              onClick={() => {
                setPreset(item.preset);
                setStartAt(item.startAt);
                setEndAt(item.endAt);
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.preset === 'custom' ? '自己设置日记记录时间' : '设为这篇日记的记录日期'}</span>
            </button>
          ))}
        </div>
      </div>

      {preset === 'custom' ? (
        <div className="device-compact-card">
          <p className="device-section-label">自定义记录时间</p>
          <div className="device-diary-datetime-list">
            <label className="device-diary-datetime-item">
              <strong>开始记录时间</strong>
              <input type="datetime-local" value={toDateTimeLocalValue(startAt)} onChange={(event) => setStartAt(fromDateTimeLocalValue(event.target.value))} />
            </label>
            <label className="device-diary-datetime-item">
              <strong>结束记录时间</strong>
              <input type="datetime-local" value={toDateTimeLocalValue(endAt)} onChange={(event) => setEndAt(fromDateTimeLocalValue(event.target.value))} />
            </label>
          </div>
        </div>
      ) : null}

      <div className="device-action-row">
        <Button type="primary" block onClick={confirmRange}>
          确定
        </Button>
        <Button block onClick={() => router.push('/diary')}>
          返回
        </Button>
      </div>
    </div>
  );
}
