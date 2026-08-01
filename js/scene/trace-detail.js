import * as THREE from 'three';

export function createTraceDetail(type, color) {
  if (type === 'footprint') return createFootprintDetail(color);
  if (type === 'light') return createLightDetail(color);
  if (type === 'seedling') return createSeedlingDetail(color);
  if (type === 'melody') return createMelodyDetail(color);
  return null;
}

export function createFootprintDetail() {
  const group = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const fpGeo = new THREE.CircleGeometry(0.018, 16);
    const fpMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a30,
      roughness: 0.95,
      side: THREE.DoubleSide
    });
    const fp = new THREE.Mesh(fpGeo, fpMat);
    fp.scale.set(0.6, 1.1, 1);
    fp.position.set(0, 0.001, -0.04 + i * 0.04);
    fp.rotation.x = -Math.PI / 2;
    group.add(fp);

    const hiGeo = new THREE.CircleGeometry(0.019, 16);
    const hiMat = new THREE.MeshBasicMaterial({
      color: 0x666670,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const hi = new THREE.Mesh(hiGeo, hiMat);
    hi.scale.set(0.6, 1.1, 1);
    hi.position.set(0, 0.0005, -0.04 + i * 0.04);
    hi.rotation.x = -Math.PI / 2;
    group.add(hi);
  }
  return { group };
}

export function createLightDetail(color) {
  const group = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.003, 0.004, 0.05, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.7 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 0.025;
  group.add(pole);

  const lampGeo = new THREE.SphereGeometry(0.012, 16, 16);
  const lampMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.4
  });
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.y = 0.06;
  group.add(lamp);

  const haloGeo = new THREE.SphereGeometry(0.018, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide,
    depthWrite: false
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 0.06;
  group.add(halo);

  return { group, lamp, halo };
}

export function createSeedlingDetail() {
  const group = new THREE.Group();
  const stemGeo = new THREE.CylinderGeometry(0.003, 0.005, 0.05, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a9d3e, roughness: 0.7 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.025;
  group.add(stem);

  for (let i = 0; i < 2; i++) {
    const leafGeo = new THREE.SphereGeometry(0.014, 8, 6);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5cb85c, roughness: 0.6 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(1, 0.25, 1.6);
    leaf.position.set(i === 0 ? 0.012 : -0.012, 0.04 + i * 0.008, 0.005);
    leaf.rotation.z = i === 0 ? 0.6 : -0.6;
    group.add(leaf);
  }

  const budGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const budMat = new THREE.MeshStandardMaterial({ color: 0x6fd06f, emissive: 0x224422, roughness: 0.5 });
  const bud = new THREE.Mesh(budGeo, budMat);
  bud.position.y = 0.058;
  group.add(bud);

  return { group, stem };
}

export function createMelodyDetail(color) {
  const group = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const ringGeo = new THREE.RingGeometry(0.02 + i * 0.012, 0.024 + i * 0.012, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6 - i * 0.12,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.001;
    group.add(ring);
  }
  return { group };
}
