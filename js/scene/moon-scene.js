import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { toTraceView } from '../core/schema.js';
import { createMoonTexture, createMoonBumpMap, createEarthTexture, createSunGlowTexture } from './textures.js';
import { createTraceDetail } from './trace-detail.js';

export class MoonScene {
  constructor(container) {
    this.container = container;
    this.traces = [];
    this.traceMeshes = [];
    this.onTraceClick = null;
    this.onZoomChange = null;
    this.moonlight = 0;
    this.targetEarthEmissive = 1.0125;
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
    this.createMoon();
    this.createEarth();
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
