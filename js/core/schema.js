// 严格 trace schema + 旧数据迁移。
// 迁移策略：
// 1. migrateTrace 补全能安全推导的字段（id/color/type/createdAt）
// 2. enrichFromSignals 对有 waveId 但缺正文的旧数据，从 SIGNALS_DATA 反查补全
// 3. 仍然无法通过 validateTrace 的标为 legacy（诚实显示）

import { SIGNALS_DATA } from '../data/signals.js';

export const TRACE_TYPES = Object.freeze([
  'footprint',
  'light',
  'seedling',
  'melody'
]);

export const TRACE_TYPE_COLORS = Object.freeze({
  footprint: 0xf4a261,
  light: 0x4a90d9,
  seedling: 0x5cb85c,
  melody: 0xc77dff
});

export const LEGACY_TRACE_MESSAGE = '早期测试痕迹，详细信息已丢失';
export const LEGACY_TRACE_REPLY = '这条痕迹来自早期测试版本，原始电波和回信内容已丢失。';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function parseTraceColor(value) {
  if (isFiniteNumber(value)) {
    return value >= 0 && value <= 0xffffff ? value : undefined;
  }
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (/^0x[0-9a-fA-F]{6}$/.test(trimmed)) {
    return parseInt(trimmed, 16);
  }
  const hex = trimmed.replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return parseInt(hex, 16);
  }
  return undefined;
}

function colorToKey(color) {
  return '0x' + color.toString(16).padStart(6, '0');
}

function traceTimestampFromId(id) {
  if (typeof id !== 'string') return null;
  const match = id.match(/^trace_(\d+)$/);
  if (!match) return null;
  const ts = Number(match[1]);
  return Number.isFinite(ts) && ts > 1e12 ? ts : null;
}

export function migrateTrace(trace) {
  if (!trace || typeof trace !== 'object' || Array.isArray(trace)) return null;

  const migrated = { ...trace };
  if (typeof migrated.id === 'number') migrated.id = String(migrated.id);
  if (typeof migrated.waveId === 'number') migrated.waveId = String(migrated.waveId);

  const color = parseTraceColor(migrated.color);
  if (color !== undefined) migrated.color = color;

  if (!migrated.type && color !== undefined) {
    const colorKey = colorToKey(color);
    const match = Object.entries(TRACE_TYPE_COLORS).find(([, value]) => colorToKey(value) === colorKey);
    if (match) migrated.type = match[0];
  }

  if (!migrated.createdAt) {
    const timestamp = traceTimestampFromId(migrated.id);
    if (timestamp) migrated.createdAt = new Date(timestamp).toISOString();
  } else if (isFiniteNumber(migrated.createdAt)) {
    const date = new Date(migrated.createdAt);
    if (!isNaN(date.getTime())) migrated.createdAt = date.toISOString();
  }

  return migrated;
}

// 从 SIGNALS_DATA 反查补全旧数据。
// 前提：旧数据至少有 waveId（最好还有 action label）。
// 与旧 enrichTrace 不同：这里补全后会立即走 validateTrace 校验，
// 补全后字段缺失或错配的，依然会落到 legacy 分支，诚实显示。
function enrichFromSignals(migrated) {
  if (!migrated || !migrated.waveId) return migrated;
  const signal = SIGNALS_DATA.find(s => s.id === migrated.waveId);
  if (!signal) return migrated;

  if (!migrated.waveText) migrated.waveText = signal.text;

  if (migrated.action) {
    const action = signal.actions.find(a => a.label === migrated.action);
    if (action) {
      if (!migrated.replyText) migrated.replyText = action.reply;
      if (!migrated.type) migrated.type = action.traceType;
      if (migrated.color === undefined) migrated.color = action.traceColor;
    }
  }

  return migrated;
}

export function getTraceErrors(trace) {
  if (!trace || typeof trace !== 'object' || Array.isArray(trace)) {
    return ['trace must be an object'];
  }

  const errors = [];
  if (!isNonEmptyString(trace.id)) errors.push('id');
  if (!isNonEmptyString(trace.waveId)) errors.push('waveId');
  if (!isNonEmptyString(trace.action)) errors.push('action');
  if (!TRACE_TYPES.includes(trace.type)) errors.push('type');
  if (!isFiniteNumber(trace.color)) errors.push('color');
  if (!trace.position || typeof trace.position !== 'object' || Array.isArray(trace.position)) {
    errors.push('position');
  } else {
    if (!isFiniteNumber(trace.position.lat) || trace.position.lat < -90 || trace.position.lat > 90) {
      errors.push('position.lat');
    }
    if (!isFiniteNumber(trace.position.lng) || trace.position.lng < -180 || trace.position.lng > 180) {
      errors.push('position.lng');
    }
  }
  if (!isNonEmptyString(trace.createdAt) || isNaN(new Date(trace.createdAt).getTime())) {
    errors.push('createdAt');
  }
  if (!isNonEmptyString(trace.waveText)) errors.push('waveText');
  if (!isNonEmptyString(trace.replyText)) errors.push('replyText');
  return errors;
}

export function validateTrace(trace) {
  return getTraceErrors(trace).length === 0;
}

export function toTraceView(trace) {
  if (!trace || typeof trace !== 'object' || Array.isArray(trace)) {
    return {
      type: 'legacy',
      color: TRACE_TYPE_COLORS.footprint,
      waveText: LEGACY_TRACE_MESSAGE,
      replyText: LEGACY_TRACE_REPLY
    };
  }

  const migrated = migrateTrace(trace);
  const enriched = enrichFromSignals(migrated);

  if (validateTrace(enriched)) return enriched;

  return {
    ...trace,
    type: 'legacy',
    legacyType: migrated && migrated.type ? migrated.type : undefined,
    color: migrated && migrated.color !== undefined ? migrated.color : TRACE_TYPE_COLORS.footprint,
    createdAt: migrated && migrated.createdAt ? migrated.createdAt : undefined,
    waveText: LEGACY_TRACE_MESSAGE,
    replyText: LEGACY_TRACE_REPLY
  };
}
