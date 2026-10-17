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
