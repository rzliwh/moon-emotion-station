import { SIGNALS_DATA } from '../data/signals.js';
import { validateTrace, toTraceView } from './schema.js';

const STORAGE_KEY = 'moon_radar_data';

export const Storage = {
  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.error('load error', e); }
    return null;
  },

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.error('save error', e); }
  },

  getData() {
    const data = this.loadData();
    return data ? this.normalizeData(data) : null;
  },

  normalizeData(data) {
    if (!data || typeof data !== 'object') return data;
    return {
      ...data,
      traces: Array.isArray(data.traces) ? data.traces.map(trace => toTraceView(trace)) : [],
      pendingReplies: Array.isArray(data.pendingReplies) ? data.pendingReplies : []
    };
  },

  initData() {
    const data = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      moonlight: 0,
      traces: [],
      pendingReplies: [],
      currentWaveIndex: 0
    };
    this.saveData(data);
    return data;
  },

  addTrace(trace) {
    if (!validateTrace(trace)) {
      console.warn('[storage] skip invalid trace', trace);
      return null;
    }
    const data = this.loadData() || this.initData();
    data.traces.push(trace);
    data.moonlight = data.traces.length;
    data.lastActive = new Date().toISOString();
    this.saveData(data);
    return data;
  },

  addPendingReply(pending) {
    const data = this.loadData() || this.initData();
    if (!Array.isArray(data.pendingReplies)) data.pendingReplies = [];
    data.pendingReplies.push(pending);
    data.lastActive = new Date().toISOString();
    this.saveData(data);
  },

  resolvePendingReply(waveId, replyText, action, traceType, traceColor) {
    const data = this.loadData();
    if (!data) return null;
    const pendingReplies = Array.isArray(data.pendingReplies) ? data.pendingReplies : [];
    const idx = pendingReplies.findIndex(p => p.waveId === waveId);
    if (idx === -1) return null;
    const pending = pendingReplies[idx];
    const trace = {
      id: 'trace_' + Date.now(),
      waveId: waveId,
      action: action,
      type: traceType,
      color: traceColor,
      position: pending.position,
      createdAt: pending.respondedAt,
      waveText: pending.waveText,
      replyText: replyText
    };
    if (!validateTrace(trace)) {
      console.warn('[storage] resolvePendingReply produced invalid trace', trace);
      return null;
    }
    if (!Array.isArray(data.traces)) data.traces = [];
    data.traces.push(trace);
    data.moonlight = data.traces.length;
    pendingReplies.splice(idx, 1);
    data.pendingReplies = pendingReplies;
    data.lastActive = new Date().toISOString();
    this.saveData(data);
    return trace;
  },

  getReadyReplies() {
    const data = this.loadData();
    if (!data) return [];
    const now = Date.now();
    return Array.isArray(data.pendingReplies) ? data.pendingReplies.filter(p => now >= p.replyAt) : [];
  },

  advanceWaveIndex() {
    const data = this.loadData();
    if (data) {
      data.currentWaveIndex = ((Number(data.currentWaveIndex) || 0) + 1) % SIGNALS_DATA.length;
      this.saveData(data);
    }
  },

  exportCode() {
    const data = this.loadData();
    if (!data) return '';
    const json = JSON.stringify(data);
    const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode('0x' + p1)));
    return 'MEv1.0' + b64;
  },

  importCode(code) {
    try {
      const trimmed = code.trim();
      if (!trimmed.startsWith('MEv1.0')) return { success: false, error: '迁移码格式不正确' };
      const b64 = trimmed.substring(6);
      const json = decodeURIComponent(Array.prototype.map.call(atob(b64), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const data = JSON.parse(json);
      if (!data.version || !Array.isArray(data.traces)) return { success: false, error: '迁移码数据不完整' };
      return { success: true, data: data };
    } catch (e) {
      return { success: false, error: '迁移码解析失败：' + e.message };
    }
  },

  mergeData(importedData) {
    const current = this.loadData();
    const importedTraces = Array.isArray(importedData.traces) ? importedData.traces : [];
    const importedPendingReplies = Array.isArray(importedData.pendingReplies) ? importedData.pendingReplies : [];
    if (!current) {
      const merged = {
        ...importedData,
        traces: importedTraces,
        pendingReplies: importedPendingReplies
      };
      this.saveData(merged);
      return { merged: importedTraces.length, total: importedTraces.length };
    }
    if (!Array.isArray(current.traces)) current.traces = [];
    if (!Array.isArray(current.pendingReplies)) current.pendingReplies = [];
    const existingIds = new Set(current.traces.map(t => t.id));
    let merged = 0;
    importedTraces.forEach(t => {
      if (!existingIds.has(t.id)) {
        current.traces.push(t);
        merged++;
      }
    });
    importedPendingReplies.forEach(p => {
      if (!current.pendingReplies.find(r => r.waveId === p.waveId)) {
        current.pendingReplies.push(p);
      }
    });
    current.moonlight = current.traces.length;
    current.lastActive = new Date().toISOString();
    this.saveData(current);
    return { merged: merged, total: current.traces.length };
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
