import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { toTraceView } from '../core/schema.js';
import { createMoonTexture, createMoonBumpMap, createEarthTexture, createSunGlowTexture, createPlanetTexture } from './textures.js';
import { createTraceDetail } from './trace-detail.js';

// 行星解锁表。角度都落在 +z 半球（地球同侧），避开太阳。
const PLANET_DEFS = [
  { key: 'venus',   name: '金星',   radius: 0.09, distance: 6.5,  angle: -1.0,  unlockAt: 1,  baseOpacity: 1.0, color: 0xe8c872, unlockText: '第一封回信抵达时，金星在夜空中亮起' },
  { key: 'mars',    name: '火星',   radius: 0.08, distance: 7.5,  angle: -0.35, unlockAt: 3,  baseOpacity: 1.0, color: 0xd4785c, unlockText: '三封信件后，火星进入了视野' },
  { key: 'jupiter', name: '木星',   radius: 0.25, distance: 12,   angle: 0.3,   unlockAt: 5,  baseOpacity: 1.0, color: 0xd8b88a, unlockText: '五封回信后，木星成为了夜空中最亮的星' },
  { key: 'saturn',  name: '土星',   radius: 0.22, distance: 14,   angle: 0.8,   unlockAt: 7,  baseOpacity: 1.0, color: 0xc8b89a, ringColor: 0x74644b, hasRing: true, unlockText: '七封信件后，你看到了土星的光环' },
  { key: 'neptune', name: '海王星', radius: 0.12, distance: 18,   angle: 1.15,  unlockAt: 10, baseOpacity: 1.0, color: 0x6b8ac8, unlockText: '十封信件后，海王星在深处闪烁' },
  { key: 'pluto',   name: '冥王星', radius: 0.04, distance: 22,   angle: 1.4,   unlockAt: 15, baseOpacity: 1.0, color: 0xa8a8b8, unlockText: '十五封信件后，你发现了冥王星，最遥远的守望者' }
];

export class MoonScene {
  constructor(container) {
    this.container = container;
    this.traces = [];
    this.traceMeshes = [];
    this.onTraceClick = null;
    this.onZoomChange = null;
    this.moonlight = 0;
    this.targetEarthEmissive = 1.0125;
    this.planets = [];
    this.unlockedPlanets = new Set();
    this.pendingUnlocks = [];
    this.init();
  }

  setMoonlight(value) {
    this.moonlight = value;
    // 0-2条: 基础亮度 1.0125
    // 3-4条: 变亮 1.6875
    // 5条+: 最亮 2.7
    if (value >= 5) {
      this.targetEarthEmissive = 2.7;
    } else if (value >= 3) {
      this.targetEarthEmissive = 1.6875;
    } else {
      this.targetEarthEmissive = 1.0125;
    }
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000511, 1);
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.createStars();
    this.createBigDipper();
    this.createMoon();
    this.createEarth();
    this.createPlanets();
    this.createSun();
    this.setupControls();
    this.setupRaycaster();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  setupLights() {
    // 环境光调高一点，补偿背光面（任务书：0.4 → 0.5）
    const ambient = new THREE.AmbientLight(0x333355, 0.5);
    this.scene.add(ambient);

    // 太阳与地球对冲：地球在 +z，太阳在 -z。DirectionalLight 只看方向。
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(-18, 6, -30);
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x4466aa, 0.3);
    fill.position.set(-5, -2, -3);
    this.scene.add(fill);

    // 地球反照：从地球方向补一点冷光，暗面不至于全黑。
    // three r160 的点光源默认按距离衰减，0.1 在距离 7 处几乎不可见，
    // 所以这里用 decay: 0，保持一个稳定的弱补光。
    const earthshine = new THREE.PointLight(0x4466aa, 0.25, 0, 0);
    earthshine.position.set(0, 0.5, 8);
    this.scene.add(earthshine);
  }

  createStars() {
    const geo = new THREE.BufferGeometry();
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 100 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 1.5 + 0.3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  createBigDipper() {
    // 勺形（归一化 2D）：
    // 斗勺是闭合四边形：天枢、天璇、天玑、天权；
    // 斗柄从「天权」延伸出去：玉衡、开阳、摇光。
    const dipper2D = [
      [0.24, 1.83], // 天枢（偏离中线，离天权更远；到天璇的距离对齐天玑）
      [0.0, 0.0],   // 天璇（中线上）
      [1.2, -1.4],  // 天玑（中线另一侧，靠近天璇）
      [2.2, 0.0],   // 天权（中线上，斗柄连接点）
      [3.8, 0.0],   // 玉衡（中线上）
      [5.4, 0.0],   // 开阳（中线上）
      [7.0, -0.72]  // 摇光（偏离中线，斗柄收尾带一点弯）
    ];

    const R = 100;
    const scale = 3.5;
    const base = new THREE.Vector3(0, 0.7, -0.7).normalize();

    // 用 Points，跟背景星空同一种渲染方式。
    // 不用球体加光晕球，那样会有球壳的硬边和塑料感。
    const positions = new Float32Array(dipper2D.length * 3);
    dipper2D.forEach(([dx, dy], i) => {
      const pos = base.clone().multiplyScalar(R);
      pos.x += dx * scale;
      pos.y += dy * scale * 0.8;
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xcfe0ff,
      size: 1.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.76,
      depthWrite: false
    });

    const dipper = new THREE.Points(geo, mat);
    this.stars.add(dipper);
  }

  createMoon() {
    const geo = new THREE.SphereGeometry(1, 128, 128);
    const colorTex = createMoonTexture();
    const bumpTex = createMoonBumpMap();

    const mat = new THREE.MeshStandardMaterial({
      map: colorTex,
      bumpMap: bumpTex,
      bumpScale: 0.06,
      roughness: 0.95,
      metalness: 0.0
    });

    this.moon = new THREE.Mesh(geo, mat);
    this.moon.rotation.y = Math.PI;
    this.scene.add(this.moon);

    this.traceGroup = new THREE.Group();
    this.moon.add(this.traceGroup);
  }

  createEarth() {
    const geo = new THREE.SphereGeometry(0.15, 32, 32);
    const earthTex = createEarthTexture();

    const mat = new THREE.MeshStandardMaterial({
      map: earthTex,
      emissive: 0x112244,
      emissiveIntensity: 1.0125,
      roughness: 0.8
    });

    this.earth = new THREE.Mesh(geo, mat);
    this.earth.position.set(0, 0.5, 8);
    this.scene.add(this.earth);
  }

  createSun() {
    const sunPos = new THREE.Vector3(-18, 6, -30);
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunPos);

    // 核心：小一点、暖白，不要纯白
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe6c2 })
    );
    sunGroup.add(core);

    // 光晕：径向渐变贴图 + 叠加混合，避免球形壳的硬边和塑料感
    const glowTex = createSunGlowTexture();

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffd9a0,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85
    }));
    glow.scale.set(5.5, 5.5, 1);
    sunGroup.add(glow);

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffc98a,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.3
    }));
    halo.scale.set(11, 11, 1);
    sunGroup.add(halo);

    this.sun = sunGroup;
    this.sun.userData = { core, glow, halo };
    this.scene.add(sunGroup);
  }

  createPlanets() {
    this.planets = [];
    PLANET_DEFS.forEach(def => {
      const geo = new THREE.SphereGeometry(def.radius, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        map: createPlanetTexture(def.color, { polarCaps: def.key === 'mars' }),
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        Math.sin(def.angle) * def.distance,
        0.3,
        Math.cos(def.angle) * def.distance
      );
      mesh.userData = { ...def };

      if (def.hasRing) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(def.radius * 1.3, def.radius * 2, 64),
          new THREE.MeshBasicMaterial({
            color: def.ringColor || def.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0,
            depthWrite: false
          })
        );
        ring.rotation.x = Math.PI * 0.35;
        mesh.add(ring);
        mesh.userData.ring = ring;
      }

      this.scene.add(mesh);
      this.planets.push(mesh);
    });
  }

  /* 按回信数直接点亮已解锁的行星，不播动画、不弹提示。
   * 用于启动时恢复存档，以及导入数据后重算。 */
  applyUnlockedByCount(replyCount) {
    const keys = PLANET_DEFS
      .filter(def => replyCount >= def.unlockAt)
      .map(def => def.key);
    this.applyUnlockedPlanets(keys);
    return keys;
  }

  applyUnlockedPlanets(keys) {
    (keys || []).forEach(key => {
      const planet = this.planets.find(p => p.userData.key === key);
      if (!planet || this.unlockedPlanets.has(key)) return;
      this.unlockedPlanets.add(key);
      planet.material.transparent = false;
      planet.material.opacity = 1;
      planet.material.depthWrite = true;
      planet.material.needsUpdate = true;
      if (planet.userData.ring) {
        planet.userData.ring.material.transparent = false;
        planet.userData.ring.material.opacity = 1;
        planet.userData.ring.material.depthWrite = true;
        planet.userData.ring.material.needsUpdate = true;
      }
    });
  }

  resetPlanets() {
    this.unlockedPlanets.clear();
    this.pendingUnlocks = [];
    this.planets.forEach(p => {
      p.material.transparent = true;
      p.material.opacity = 0;
      p.material.depthWrite = false;
      p.material.needsUpdate = true;
      if (p.userData.ring) {
        p.userData.ring.material.transparent = true;
        p.userData.ring.material.opacity = 0;
        p.userData.ring.material.depthWrite = false;
        p.userData.ring.material.needsUpdate = true;
      }
    });
  }

  /* 回信数变化时调用。返回这次新解锁的行星。 */
  checkPlanetUnlocks(replyCount) {
    const newly = [];
    PLANET_DEFS.forEach(def => {
      if (replyCount >= def.unlockAt && !this.unlockedPlanets.has(def.key)) {
        this.unlockPlanet(def);
        newly.push(def);
      }
    });
    return newly;
  }

  unlockPlanet(def) {
    const planet = this.planets.find(p => p.userData.key === def.key);
    if (!planet) return;

    this.unlockedPlanets.add(def.key);
    this.pendingUnlocks.push(def);

    // 2 秒渐显，前半程带一点呼吸闪烁
    const target = def.baseOpacity;
    const duration = 2000;
    const start = Date.now();
    const animate = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      let opacity = ease * target;
      if (t < 0.5) opacity += 0.3 * Math.sin(t * Math.PI * 4) * target;
      planet.material.opacity = Math.max(0, opacity);
      if (planet.userData.ring) {
        planet.userData.ring.material.opacity = planet.material.opacity;
      }
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // 渐显结束后切成不透明，避免背景星星透过来
        planet.material.transparent = false;
        planet.material.opacity = 1;
        planet.material.depthWrite = true;
        planet.material.needsUpdate = true;
        if (planet.userData.ring) {
          planet.userData.ring.material.transparent = false;
          planet.userData.ring.material.opacity = 1;
          planet.userData.ring.material.depthWrite = true;
          planet.userData.ring.material.needsUpdate = true;
        }
      }
    };
    animate();

    this.spawnParticles({
      x: planet.position.x,
      y: planet.position.y,
      z: planet.position.z,
      count: 20,
      color: def.color,
      lifetime: 1.5,
      speed: 6,
      size: 0.6
    });
  }

  getPendingUnlocks() {
    const list = this.pendingUnlocks.slice();
    this.pendingUnlocks = [];
    return list;
  }

  getUnlockedPlanets() {
    return Array.from(this.unlockedPlanets);
  }

  /* 轻量粒子爆发：给解锁加一点仪式感。
   * 任务书里提到的 spawnParticles 在当前代码里不存在，这里补一个最小实现。 */
  spawnParticles({ x, y, z, count = 20, color = 0xffffff, lifetime = 1.5, speed = 6, size = 0.6 }) {
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const v = speed * (0.5 + Math.random() * 0.5);
      velocities.push(new THREE.Vector3(
        v * Math.sin(phi) * Math.cos(theta),
        v * Math.sin(phi) * Math.sin(theta),
        v * Math.cos(phi)
      ));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    const start = Date.now();
    let last = start;
    const step = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / (lifetime * 1000);
      if (t >= 1) {
        this.scene.remove(points);
        geo.dispose();
        mat.dispose();
        return;
      }
      const arr = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        arr[i * 3] += velocities[i].x * dt;
        arr[i * 3 + 1] += velocities[i].y * dt;
        arr[i * 3 + 2] += velocities[i].z * dt;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 1 - t;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 8;
    this.controls.rotateSpeed = 0.5;
    this.controls.autoRotate = false;

    this.controls.addEventListener('change', () => {
      const dist = this.camera.position.distanceTo(this.moon.position);
      if (this.onZoomChange) {
        if (dist < 2.2) {
          this.onZoomChange('close');
        } else if (dist < 3.5) {
          this.onZoomChange('medium');
        } else {
          this.onZoomChange('far');
        }
      }
    });
  }

  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };

    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      touchStartTime = Date.now();
      touchStartPos = { x: e.clientX, y: e.clientY };
    });

    this.renderer.domElement.addEventListener('pointerup', (e) => {
      const dt = Date.now() - touchStartTime;
      const dx = Math.abs(e.clientX - touchStartPos.x);
      const dy = Math.abs(e.clientY - touchStartPos.y);
      if (dt < 300 && dx < 5 && dy < 5) {
        this.handleClick(e);
      }
    });
  }

  handleClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.traceMeshes);

    if (intersects.length > 0) {
      const traceData = intersects[0].object.userData;
      if (this.onTraceClick) {
        this.onTraceClick(traceData);
      }
    }
  }

  addTrace(traceData) {
    const position = traceData.position || {};
    const lat = Number.isFinite(Number(position.lat)) ? Number(position.lat) : 0;
    const lng = Number.isFinite(Number(position.lng)) ? Number(position.lng) : 0;
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    const r = 1.02;

    const x = -r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const pos = new THREE.Vector3(x, y, z);

    const geo = new THREE.SphereGeometry(0.025, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: traceData.color || 0xf4a261,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.userData = traceData;

    const glowGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: traceData.color || 0xf4a261,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    mesh.add(glow);

    const detail = createTraceDetail(traceData.type, traceData.color);
    if (detail) {
      detail.group.position.copy(pos);
      const normal = pos.clone().normalize();
      detail.group.up.copy(normal);
      detail.group.lookAt(new THREE.Vector3(0, 0, 0));
      detail.group.scale.setScalar(0);
    }

    this.traceGroup.add(mesh);
    if (detail) this.traceGroup.add(detail.group);
    this.traceMeshes.push(mesh);

    const traceObj = { mesh, glow, detail, phase: Math.random() * Math.PI * 2, data: traceData };
    this.traces.push(traceObj);
    return traceObj;
  }

  loadTraces(traces) {
    (traces || []).forEach(t => {
      const traceView = toTraceView(t);
      const color = typeof traceView.color === 'number' && Number.isFinite(traceView.color)
        ? traceView.color
        : 0xf4a261;
      this.addTrace({
        ...traceView,
        color: color
      });
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    if (this.stars) {
      this.stars.rotation.y += 0.00005;
    }

    if (this.earth) {
      this.earth.rotation.y += 0.001;
      // 地球亮度随月光值 lerp 平滑过渡
      if (this.earth.material) {
        const cur = this.earth.material.emissiveIntensity;
        this.earth.material.emissiveIntensity = cur + (this.targetEarthEmissive - cur) * 0.05;
      }
    }

    const now = Date.now() * 0.001;

    if (this.sun) {
      const { glow, halo } = this.sun.userData;
      glow.material.opacity = 0.85 + 0.07 * Math.sin(now * 0.3);
      halo.material.opacity = 0.3 + 0.05 * Math.sin(now * 0.3);
    }

    this.planets.forEach(p => {
      if (p.material.opacity > 0) p.rotation.y += 0.0005;
    });

    const dist = this.camera.position.distanceTo(this.moon.position);
    const detailScale = dist < 2.0 ? Math.min(1, (2.0 - dist) * 3) : 0;
    this.traces.forEach(t => {
      const opacity = 0.5 + 0.4 * Math.sin(now + t.phase);
      t.mesh.material.opacity = opacity;
      t.glow.material.opacity = 0.08 + 0.12 * Math.sin(now + t.phase);
      if (t.detail) {
        const target = detailScale;
        const cur = t.detail.group.scale.x;
        const next = cur + (target - cur) * 0.15;
        t.detail.group.scale.setScalar(next);
        if (t.detail.halo && t.detail.halo.material) {
          t.detail.halo.material.opacity = 0.12 + 0.08 * Math.sin(now * 2 + t.phase);
        }
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getRandomSurfacePosition() {
    const lat = Math.random() * 160 - 80;
    const lng = Math.random() * 360 - 180;
    return { lat, lng };
  }
}
