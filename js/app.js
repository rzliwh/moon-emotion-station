import { SIGNALS_DATA } from './data/signals.js';
import { Storage } from './core/storage.js';
import { MoonScene } from './scene/moon-scene.js';
import { UI } from './ui/ui.js';

const App = {
  scene: null,
  data: null,
  currentSignal: null,
  selectedAction: null,

  init() {
    UI.init();

    this.data = Storage.getData() || Storage.initData();

    this.scene = new MoonScene(document.getElementById('canvas-container'));
    this.scene.onTraceClick = (traceData) => {
      // 防御：userData 为空时不弹窗
      if (traceData && Object.keys(traceData).length > 0) {
        UI.showTraceDetail(traceData);
      }
    };
    this.scene.onZoomChange = (level) => {
      if (level === 'close') {
        const dist = this.scene.camera.position.distanceTo(this.scene.moon.position);
        if (dist < 2.2) {
          this.scene.raycaster.setFromCamera({ x: 0, y: 0 }, this.scene.camera);
          const hits = this.scene.raycaster.intersectObjects(this.scene.traceMeshes);
          if (hits.length > 0) {
            const ud = hits[0].object.userData;
            // 防御：userData 为空时不弹窗
            if (ud && Object.keys(ud).length > 0) {
              UI.showTraceDetail(ud);
            }
          }
        }
      }
    };

    if (this.data.traces.length > 0) {
      this.scene.loadTraces(this.data.traces);
    }

    // 启动时按回信数恢复行星，不播动画、不弹提示
    const savedUnlocked = Array.isArray(this.data.unlockedPlanets) ? this.data.unlockedPlanets : [];
    const derivedUnlocked = this.scene.applyUnlockedByCount(this.data.traces.length);
    const allUnlocked = Array.from(new Set([...savedUnlocked, ...derivedUnlocked]));
    this.scene.applyUnlockedPlanets(allUnlocked);
    const seen = new Set([...(this.data.planetUnlockSeen || []), ...allUnlocked]);
    Storage.setPlanetState(allUnlocked, Array.from(seen));

    UI.updateMoonlight(this.data.moonlight);
    this.scene.setMoonlight(this.data.moonlight);

    UI.hideLoading();

    this.checkPendingReplies();
  },

  startGame() {
    AudioManager.resume();
    AudioManager.startBackground();

    UI.el.introOverlay.classList.add('hidden');
    setTimeout(() => {
      UI.el.introOverlay.style.display = 'none';
    }, 500);

    const readyReplies = Storage.getReadyReplies();
    if (readyReplies.length > 0) {
      this.showReadyReply(readyReplies[0]);
    } else {
      this.showNextSignal();
    }
  },

  showNextSignal() {
    const data = Storage.loadData();
    const readyReplies = Storage.getReadyReplies();
    if (readyReplies.length > 0) {
      this.showReadyReply(readyReplies[0]);
      return;
    }
    if (data.pendingReplies && data.pendingReplies.length > 0) {
      const pending = data.pendingReplies[0];
      const signal = SIGNALS_DATA.find(s => s.id === pending.waveId);
      if (signal) {
        UI.el.signalCardArea.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'waiting-card';
        const waitMs = pending.replyAt - Date.now();
        const waitMin = Math.max(1, Math.round(waitMs / 60000));
        card.innerHTML = `
          <div class="waiting-text">信号正在穿越太空<br>回信大约还有 ${waitMin} 分钟到达</div>
          <div class="waiting-dots"><span>.</span><span>.</span><span>.</span></div>
        `;
        UI.el.signalCardArea.appendChild(card);
        return;
      }
    }
    const idx = (Number(data.currentWaveIndex) || 0) % SIGNALS_DATA.length;
    this.currentSignal = SIGNALS_DATA[idx];
    UI.showSignalCard(this.currentSignal);
  },

  selectAction(signal, actionIdx) {
    this.selectedAction = signal.actions[actionIdx];
    const position = this.scene.getRandomSurfacePosition();

    Storage.addPendingReply({
      waveId: signal.id,
      action: this.selectedAction.label,
      traceType: this.selectedAction.traceType,
      traceColor: this.selectedAction.traceColor,
      position: position,
      respondedAt: new Date().toISOString(),
      replyAt: Date.now() + signal.delayMs,
      waveText: signal.text
    });
    Storage.advanceWaveIndex();

    UI.showWaiting(signal, this.selectedAction);

    AudioManager.playSignalSent();

    setTimeout(() => {
      UI.showToast('信号已发出，回信在路上', 2000);
      setTimeout(() => {
        UI.el.signalCardArea.innerHTML = '';
        UI.showToast('下次打开游戏时查看回信', 3000);
      }, 2000);
    }, 2500);
  },

  checkPendingReplies() {
    const ready = Storage.getReadyReplies();
    if (ready.length > 0) {
      this.showReadyReply(ready[0]);
    }
  },

  showReadyReply(pending) {
    const signal = SIGNALS_DATA.find(s => s.id === pending.waveId);
    if (!signal) return;
    const action = signal.actions.find(a => a.label === pending.action);
    if (!action) return;

    AudioManager.playReplyReceived();

    this.currentReply = { pending, signal, action };
    UI.showReply(action.reply, action.traceType, () => {
      const trace = Storage.resolvePendingReply(
        pending.waveId,
        action.reply,
        action.label,
        action.traceType,
        action.traceColor
      );
      if (trace) {
        this.scene.addTrace({
          ...trace,
          position: pending.position
        });
        UI.updateMoonlight(this.data.traces.length + 1);
        const data = Storage.loadData();
        UI.updateMoonlight(data.moonlight);
        this.scene.setMoonlight(data.moonlight);

        const newly = this.scene.checkPlanetUnlocks(data.traces.length);
        if (newly.length) {
          const unlocked = this.scene.getUnlockedPlanets();
          const seen = new Set([...(data.planetUnlockSeen || []), ...newly.map(d => d.key)]);
          Storage.setPlanetState(unlocked, Array.from(seen));
          setTimeout(() => this.showPlanetUnlocks(newly), 1500);
        }
      }
      UI.el.signalCardArea.innerHTML = '';
      UI.showToast('月球上多了一个痕迹', 2000);
      setTimeout(() => {
        this.showNextSignal();
      }, 2500);
    });
  },

  showPlanetUnlocks(defs) {
    const next = (i) => {
      if (i >= defs.length) return;
      AudioManager.playPlanetUnlock();
      UI.showPlanetUnlockToast(defs[i], () => next(i + 1));
    };
    next(0);
  },

  exportData() {
    const code = Storage.exportCode();
    UI.el.exportCode.value = code;
    UI.el.exportArea.classList.add('active');
    UI.showToast('迁移码已生成，点击下方复制', 2000);
  },

  copyExportCode() {
    const code = UI.el.exportCode.value;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        UI.showToast('已复制到剪贴板', 2000);
      }).catch(() => {
        UI.el.exportCode.select();
        document.execCommand('copy');
        UI.showToast('已复制', 2000);
      });
    } else {
      UI.el.exportCode.select();
      document.execCommand('copy');
      UI.showToast('已复制', 2000);
    }
  },

  importData() {
    const code = UI.el.importCode.value.trim();
    if (!code) {
      UI.showToast('请粘贴迁移码', 2000);
      return;
    }
    const result = Storage.importCode(code);
    if (!result.success) {
      UI.showToast(result.error, 3000);
      return;
    }

    const mergeResult = Storage.mergeData(result.data);
    this.data = Storage.getData();
    this.scene.traceMeshes.forEach(m => this.scene.traceGroup.remove(m));
    this.scene.traceMeshes = [];
    this.scene.traces = [];
    this.scene.loadTraces(this.data.traces);

    this.scene.resetPlanets();
    const saved = Array.isArray(this.data.unlockedPlanets) ? this.data.unlockedPlanets : [];
    const derived = this.scene.applyUnlockedByCount(this.data.traces.length);
    const all = Array.from(new Set([...saved, ...derived]));
    this.scene.applyUnlockedPlanets(all);
    const seen = new Set([...(this.data.planetUnlockSeen || []), ...all]);
    Storage.setPlanetState(all, Array.from(seen));

    UI.updateMoonlight(this.data.moonlight);
    this.scene.setMoonlight(this.data.moonlight);
    UI.el.traceCount.textContent = this.data.traces.length;
    UI.showToast(`导入成功！新增 ${mergeResult.merged} 个痕迹，共 ${mergeResult.total} 个`, 3000);
    UI.el.importCode.value = '';
  },

  clearAll() {
    if (confirm('确定要清除所有数据吗？\n这将永久删除你的所有痕迹和回信，无法恢复。')) {
      if (confirm('再次确认：清除后无法恢复，确定吗？')) {
        Storage.clearAll();
        this.data = Storage.initData();
        this.scene.traceMeshes.forEach(m => this.scene.traceGroup.remove(m));
        this.scene.traceMeshes = [];
        this.scene.traces = [];
        this.scene.resetPlanets();
        UI.updateMoonlight(0);
        this.scene.setMoonlight(0);
        UI.el.traceCount.textContent = '0';
        UI.el.moonlightDisplay.textContent = '0';
        UI.showToast('所有数据已清除', 2000);
      }
    }
  },

  testReply() {
    const data = Storage.loadData();
    if (!data || !Array.isArray(data.pendingReplies) || data.pendingReplies.length === 0) {
      UI.showToast('没有等待中的回信，请先回应一条电波', 3000);
      return;
    }
    data.pendingReplies.forEach(p => { p.replyAt = Date.now(); });
    Storage.saveData(data);
    UI.el.settingsPanel.classList.remove('active');
    UI.showToast('回信已到达', 1500);
    setTimeout(() => { this.checkPendingReplies(); }, 800);
  }
};

window.App = App;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
