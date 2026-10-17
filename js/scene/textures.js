import * as THREE from 'three';

// NASA LRO 数据渲染的月球纹理（等距矩形投影，适合贴在球体上）
// 来源：three.js 官方示例（基于 NASA LRO 数据）
// 本地化部署在 assets/ 目录，避免远程 CORS 和网络问题
const MOON_TEXTURE_URL = './assets/moon.jpg';

// NASA Blue Marble 地球纹理（等距矩形投影）
const EARTH_TEXTURE_URL = './assets/earth.jpg';

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');

export function createMoonTexture() {
  return textureLoader.load(MOON_TEXTURE_URL);
}

export function createMoonBumpMap() {
  // 保持程序化生成 bump map（凹凸贴图用程序化足够）
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 256);

  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 12 + 2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(30,30,30,0.7)');
    g.addColorStop(0.7, 'rgba(180,180,180,0.3)');
    g.addColorStop(1, 'rgba(128,128,128,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

export function createEarthTexture() {
  return textureLoader.load(EARTH_TEXTURE_URL);
}

// 行星纹理：程序化色块，不用外部图片。
// 底色 + 横向条纹 + 极地略暗；火星额外加两极白斑。
export function createPlanetTexture(colorHex, opts = {}) {
  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#' + (colorHex >>> 0).toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, w, h);

  // 柔和的云团：径向渐变，边缘自然衰减
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 8 + Math.random() * 30;
    const light = Math.random() > 0.5;
    const alpha = 0.03 + Math.random() * 0.06;
    const rgb = light ? '255,255,255' : '0,0,0';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 不规则条带：用正弦曲线画，不是直尺线
  for (let i = 0; i < 18; i++) {
    const baseY = Math.random() * h;
    const amp = 1 + Math.random() * 4;
    const freq = 0.02 + Math.random() * 0.05;
    const phase = Math.random() * Math.PI * 2;
    const thick = 1 + Math.random() * 4;
    const light = Math.random() > 0.5;
    const alpha = 0.02 + Math.random() * 0.05;
    ctx.fillStyle = light
      ? 'rgba(255,255,255,' + alpha + ')'
      : 'rgba(0,0,0,' + alpha + ')';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = baseY + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let x = w; x >= 0; x -= 4) {
      const y = baseY + Math.sin(x * freq + phase) * amp + thick;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // 极地略暗
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0.3)');
  g.addColorStop(0.2, 'rgba(0,0,0,0)');
  g.addColorStop(0.8, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 火星两极白斑
  if (opts.polarCaps) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(w / 2, 3, w * 0.42, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 3, w * 0.42, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 太阳光晕：径向渐变贴图，配合 Sprite 的叠加混合。
// 用贴图做柔和衰减，避免几个半透明球壳叠出来的硬边和塑料感。
export function createSunGlowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 246, 224, 1)');
  g.addColorStop(0.12, 'rgba(255, 232, 196, 0.9)');
  g.addColorStop(0.3, 'rgba(255, 208, 150, 0.42)');
  g.addColorStop(0.62, 'rgba(255, 178, 110, 0.12)');
  g.addColorStop(1, 'rgba(255, 150, 80, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
