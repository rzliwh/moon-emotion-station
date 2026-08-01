import { LEGACY_TRACE_MESSAGE, LEGACY_TRACE_REPLY, TRACE_TYPES, toTraceView } from '../core/schema.js';
import { Storage } from '../core/storage.js';

export const UI = {
  el: {
    signalCardArea: null,
    moonlightValue: null,
    traceDetail: null,
    settingsPanel: null,
    toast: null,
    loadingScreen: null,
    introOverlay: null,
    traceCount: null,
    moonlightDisplay: null,
    createdAt: null,
    exportArea: null,
    exportCode: null,
    importArea: null,
    importCode: null
  },

  init() {
    this.el.signalCardArea = document.getElementById('signal-card-area');
    this.el.moonlightValue = document.getElementById('moonlight-value');
    this.el.traceDetail = document.getElementById('trace-detail');
    this.el.settingsPanel = document.getElementById('settings-panel');
    this.el.toast = document.getElementById('toast');
    this.el.loadingScreen = document.getElementById('loading-screen');
    this.el.introOverlay = document.getElementById('intro-overlay');
    this.el.traceCount = document.getElementById('trace-count');
    this.el.moonlightDisplay = document.getElementById('moonlight-display');
    this.el.createdAt = document.getElementById('created-at');
    this.el.exportArea = document.getElementById('export-area');
    this.el.exportCode = document.getElementById('export-code');
    this.el.importArea = document.getElementById('import-area');
    this.el.importCode = document.getElementById('import-code');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (tab === 'moon') {
          this.el.signalCardArea.innerHTML = '';
          this.showToast('拖拽旋转月球，双指缩放查看痕迹');
        } else if (tab === 'signals') {
          this.el.signalCardArea.innerHTML = '';
          window.App.showNextSignal();
        } else if (tab === 'memory') {
          this.showMemoryList();
        }
      });
    });
  },

  showMemoryList() {
    const data = Storage.getData();
    this.el.signalCardArea.innerHTML = '';
    if (!data || data.traces.length === 0) {
      const card = document.createElement('div');
      card.className = 'waiting-card';
      card.innerHTML = '<div class="waiting-text">还没有记忆<br>回应一条电波，月球上就会留下痕迹</div>';
      this.el.signalCardArea.appendChild(card);
      return;
    }
    const header = document.createElement('div');
    header.className = 'signal-card';
    header.style.border = '0.5px solid rgba(244,162,97,0.2)';
    header.innerHTML = `<div class="signal-meta"><span>记忆列表</span><span>共 ${data.traces.length} 条</span></div>`;
    this.el.signalCardArea.appendChild(header);

    data.traces.slice().reverse().forEach(trace => {
      const isLegacy = !TRACE_TYPES.includes(trace.type);
      const typeLabel = isLegacy
        ? '早期痕迹'
        : ({ footprint: '脚印', light: '一盏灯', seedling: '新芽', melody: '旋律' }[trace.type] || '痕迹');
      const typeColor = isLegacy
        ? '#8899aa'
        : ({ footprint: '#f4a261', light: '#4a90d9', seedling: '#5cb85c', melody: '#c77dff' }[trace.type] || '#f4a261');
      let dateStr = '日期未知';
      try {
        const date = new Date(trace.createdAt);
        if (!isNaN(date.getTime())) {
          dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        }
      } catch (e) { dateStr = '日期未知'; }
      const waveText = isLegacy ? LEGACY_TRACE_MESSAGE : (trace.waveText || '（暂无电波原文记录）');
      const replyText = isLegacy ? LEGACY_TRACE_REPLY : (trace.replyText || '（暂无回信记录）');
      const card = document.createElement('div');
      card.className = 'signal-card';
      card.innerHTML = `
        <div class="signal-meta">
          <span style="color:${typeColor};">${typeLabel}</span>
          <span>${dateStr}</span>
        </div>
        <div class="signal-text" style="font-size:13px;">${waveText.substring(0, 40)}...</div>
        <div class="signal-text" style="font-size:12px; color: var(--text-muted); margin-top:8px; font-style:italic;">${replyText.substring(0, 50)}...</div>
      `;
      card.addEventListener('click', () => {
        this.showTraceDetail(trace);
      });
      this.el.signalCardArea.appendChild(card);
    });
  },

  showSignalCard(signal) {
    const card = document.createElement('div');
    card.className = 'signal-card';
    card.innerHTML = `
      <div class="signal-meta">
        <span>来自地球 · ${signal.time}</span>
        <span>新电波</span>
      </div>
      <div class="signal-text">${signal.text}</div>
      <div class="signal-hint">点击查看，选择你的回应</div>
    `;
    card.addEventListener('click', () => {
      this.showSignalDetail(signal);
    });
    this.el.signalCardArea.appendChild(card);

    AudioManager.playSignalIncoming();
  },

  showSignalDetail(signal) {
    this.el.signalCardArea.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'signal-card';
    const actionsHtml = signal.actions.map((a, i) => `
      <button class="action-btn" data-action-idx="${i}">
        <div class="action-label">${a.label}</div>
        <div class="action-desc">${a.desc}</div>
      </button>
    `).join('');
    card.innerHTML = `
      <div class="signal-meta">
        <span>来自地球 · ${signal.time}</span>
      </div>
      <div class="signal-text">${signal.text}</div>
      <div class="action-options">${actionsHtml}</div>
    `;
    card.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.actionIdx);
        window.App.selectAction(signal, idx);
      });
    });
    this.el.signalCardArea.appendChild(card);
  },

  showWaiting(signal, action) {
    this.el.signalCardArea.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'waiting-card';
    card.innerHTML = `
      <div class="waiting-text">信号正在穿越太空<br>回信大约在 ${signal.delayLabel} 到达</div>
      <div class="waiting-dots"><span>.</span><span>.</span><span>.</span></div>
    `;
    this.el.signalCardArea.appendChild(card);
  },

  showReply(replyText, traceType, onConfirm) {
    this.el.signalCardArea.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'reply-card';
    const typeLabel = {
      footprint: '月球上多了一串脚印',
      light: '月球上多了一盏灯',
      seedling: '月球上多了一株新芽',
      melody: '月球上多了一段旋律'
    }[traceType] || '月球上多了一个痕迹';

    card.innerHTML = `
      <div class="reply-label">来自地球的回信</div>
      <div class="reply-text">${replyText}</div>
      <div class="reply-label" style="margin-top:12px;">${typeLabel}</div>
      <button class="reply-confirm">收下回信</button>
    `;
    card.querySelector('.reply-confirm').addEventListener('click', () => {
      if (onConfirm) onConfirm();
    });
    this.el.signalCardArea.appendChild(card);
  },

  showTraceDetail(trace) {
    if (!trace || typeof trace !== 'object') return;
    // 防御：空对象不弹窗（避免显示错误的 legacy 文字）
    if (Object.keys(trace).length === 0) return;
    trace = toTraceView(trace);
    if (window.MOON_DEBUG) console.log('[trace]', trace);

    const typeMap = {
      footprint: { label: '脚印', color: '#f4a261' },
      light: { label: '一盏灯', color: '#4a90d9' },
      seedling: { label: '种子发芽', color: '#5cb85c' },
      melody: { label: '一段旋律', color: '#c77dff' }
    };

    const type = trace.type;
    const isLegacy = !TRACE_TYPES.includes(type);
    const typeInfo = isLegacy
      ? { label: '早期测试痕迹', color: '#8899aa' }
      : typeMap[type];

    let dateStr = '日期未知';
    try {
      if (trace.createdAt) {
        const date = new Date(trace.createdAt);
        if (!isNaN(date.getTime())) {
          dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
      }
    } catch (e) { dateStr = '日期解析失败'; }

    if (isLegacy) {
      document.getElementById('trace-type-text').textContent = typeInfo.label;
      document.getElementById('trace-type-text').style.color = typeInfo.color;
      document.getElementById('trace-date-text').textContent = dateStr;
      document.getElementById('trace-wave-text').textContent = LEGACY_TRACE_MESSAGE;
      document.getElementById('trace-reply-text').textContent = LEGACY_TRACE_REPLY;
      this.el.traceDetail.style.display = 'block';
      return;
    }

    const finalWaveText = trace.waveText || '（暂无电波原文记录）';
    const finalReplyText = trace.replyText || '（暂无回信记录）';

    document.getElementById('trace-type-text').textContent = typeInfo.label;
    document.getElementById('trace-type-text').style.color = typeInfo.color;
    document.getElementById('trace-date-text').textContent = dateStr;
    document.getElementById('trace-wave-text').textContent = finalWaveText;
    document.getElementById('trace-reply-text').textContent = finalReplyText;
    this.el.traceDetail.style.display = 'block';

    if (window.MOON_DEBUG) {
      console.log('[trace]', trace);
    }
  },

  hideTraceDetail() {
    this.el.traceDetail.style.display = 'none';
  },

  showSettings() {
    const data = Storage.getData();
    if (data) {
      this.el.traceCount.textContent = data.traces.length;
      this.el.moonlightDisplay.textContent = data.moonlight;
      const date = data.createdAt ? new Date(data.createdAt) : new Date(NaN);
      this.el.createdAt.textContent = !isNaN(date.getTime())
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : '-';
    }
    this.el.settingsPanel.classList.add('active');
    this.el.exportArea.classList.remove('active');
    this.el.importArea.classList.remove('active');
  },

  showToast(msg, duration = 2500) {
    this.el.toast.textContent = msg;
    this.el.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.el.toast.classList.remove('show');
    }, duration);
  },

  hideLoading() {
    this.el.loadingScreen.classList.add('hidden');
    setTimeout(() => {
      this.el.loadingScreen.style.display = 'none';
    }, 600);
  },

  updateMoonlight(value) {
    this.el.moonlightValue.textContent = value;
  }
};
