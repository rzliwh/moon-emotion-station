// ==================== 音频管理器 ====================
// 纯 WebAudio API 程序化合成，零外部资源，零版权风险
// 背景音：深空氛围低频音 + 偶发星尘叮咚
// 提示音：收到电波 / 发出回应 / 收到回信

const AudioManager = {
  ctx: null,
  masterGain: null,
  bgGain: null,
  sfxGain: null,
  bgNodes: [],
  bgStarted: false,
  bgEnabled: true,
  sfxEnabled: true,
  fadeInterval: null,

  // 懒初始化：在用户首次交互时安全创建 AudioContext
  ensureInit() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);

        this.bgGain = this.ctx.createGain();
        this.bgGain.gain.value = 1; // 默认全开，由masterGain控制总音量淡入
        this.bgGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.7;
        this.sfxGain.connect(this.masterGain);
      } catch (e) {
        console.warn('WebAudio not supported:', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  // ==================== 背景音 ====================
  startBackground() {
    this.ensureInit();
    if (!this.ctx || this.bgStarted) return;
    this.bgStarted = true;

    const now = this.ctx.currentTime;

    // --- 深空低频持续音 ---
    // 主低频：55Hz (A1)，如深空嗡鸣
    const drone1 = this.ctx.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 55;
    const drone1Gain = this.ctx.createGain();
    drone1Gain.gain.value = 0.15;
    drone1.connect(drone1Gain);
    drone1Gain.connect(this.bgGain);
    drone1.start(now);
    this.bgNodes.push(drone1);

    // 第二低频：82.4Hz (E2)，五度叠加，空灵感
    const drone2 = this.ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 82.4;
    const drone2Gain = this.ctx.createGain();
    drone2Gain.gain.value = 0.08;
    drone2.connect(drone2Gain);
    drone2Gain.connect(this.bgGain);
    drone2.start(now);
    this.bgNodes.push(drone2);

    // 低频呼吸调制：LFO 控制主低频音量
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // 12秒一个周期，极慢呼吸
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(drone1Gain.gain);
    lfo.start(now);
    this.bgNodes.push(lfo);

    // --- 滤波器让低频更柔和 ---
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    drone1Gain.disconnect();
    drone1Gain.connect(filter);
    filter.connect(this.bgGain);

    // --- 偶发星尘叮咚（每8-15秒随机一个高频音符）---
    this.scheduleStardust();

    // --- 10秒淡入 ---
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(0.5, now + 10);
  },

  scheduleStardust() {
    if (!this.ctx || !this.bgStarted) return;

    const playStardust = () => {
      if (!this.bgStarted || !this.bgEnabled) return;

      // 从五声音阶随机取一个高频音符（C5-D5-E5-G5-A5）
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.bgGain);
      osc.start(now);
      osc.stop(now + 3);

      // 下一个随机间隔
      const nextDelay = 8000 + Math.random() * 7000;
      setTimeout(playStardust, nextDelay);
    };

    // 第一次延迟3秒
    setTimeout(playStardust, 3000);
  },

  // ==================== 提示音 ====================

  // 收到电波：上升二音（C5→E5），清脆轻盈
  playSignalIncoming() {
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // 第一个音 C5
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25;
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.7);

    // 第二个音 E5，延迟0.2秒
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 659.25;
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.2);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.23);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.2);
    osc2.stop(now + 1.0);
  },

  // 发出回应：两个连续柔和音（C5→G5），如信号轻盈传出
  playSignalSent() {
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // 第一个音 C5（柔和起音）
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25;
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.25);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 1.0);

    // 第二个音 G5（高五度，延迟0.15秒，信号"飞出去"的感觉）
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 783.99;
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.19);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.15);
    osc2.stop(now + 1.2);

    // 微弱的尾音 C6（高频点缀，让"飞走"的感觉更明显）
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 1046.50;
    const gain3 = this.ctx.createGain();
    gain3.gain.setValueAtTime(0, now + 0.35);
    gain3.gain.linearRampToValueAtTime(0.08, now + 0.38);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc3.connect(gain3);
    gain3.connect(this.sfxGain);
    osc3.start(now + 0.35);
    osc3.stop(now + 1.0);
  },

  // 收到回信：柔和三音琶音（C5→E5→G5），温暖治愈
  playReplyReceived() {
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    const intervals = [0, 0.18, 0.36];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const t = now + intervals[i];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.6);
    });
  },

  playPlanetUnlock() {
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    const intervals = [0, 0.16, 0.32, 0.52];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const t = now + intervals[i];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(i === 3 ? 0.16 : 0.2, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i === 3 ? 1.2 : 1.4));

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + (i === 3 ? 1.3 : 1.5));
    });
  },

  // ==================== 控制 ====================

  resume() {
    this.ensureInit();
  },

  setBgEnabled(enabled) {
    this.bgEnabled = enabled;
    if (this.bgGain) {
      const now = this.ctx.currentTime;
      this.bgGain.gain.linearRampToValueAtTime(enabled ? 1 : 0, now + 0.3);
    }
  },

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
  }
};

window.AudioManager = AudioManager;
