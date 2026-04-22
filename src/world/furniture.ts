import * as THREE from 'three';
import type { RoomDef } from './house';

export interface FurnitureItem {
  name: string;
  mesh: THREE.Group;
  room: string;
  interactable: boolean;
  interactionPoint: THREE.Vector3;
  interactionType: 'sit' | 'use' | 'look';
}

function createBox(w: number, h: number, d: number, color: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCylinder(rT: number, rB: number, h: number, color: number, segs = 16): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(rT, rB, h, segs);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function addPart(group: THREE.Group, mesh: THREE.Mesh, x: number, y: number, z: number) {
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function createCouch(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(2.4, 0.4, 0.9, 0x5a7a9a), 0, 0.3, 0);
  addPart(group, createBox(2.4, 0.6, 0.2, 0x4a6a8a), 0, 0.7, -0.4);
  addPart(group, createBox(0.2, 0.5, 0.9, 0x4a6a8a), -1.2, 0.45, 0);
  addPart(group, createBox(0.2, 0.5, 0.9, 0x4a6a8a), 1.2, 0.45, 0);
  for (const [x, z] of [[-1, 0.3], [1, 0.3], [-1, -0.3], [1, -0.3]]) {
    addPart(group, createBox(0.1, 0.15, 0.1, 0x333333), x, 0.075, z);
  }
  return group;
}

function createTable(w: number, d: number, h: number, color: number): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(w, 0.08, d, color), 0, h, 0);
  const lx = w / 2 - 0.06;
  const lz = d / 2 - 0.06;
  for (const [x, z] of [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]]) {
    addPart(group, createBox(0.06, h, 0.06, 0x5a4a3a), x, h / 2, z);
  }
  return group;
}

function createChair(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.45, 0.06, 0.45, 0x8a6a4a), 0, 0.45, 0);
  addPart(group, createBox(0.45, 0.5, 0.06, 0x7a5a3a), 0, 0.73, -0.2);
  for (const [x, z] of [[-0.18, 0.18], [0.18, 0.18], [-0.18, -0.18], [0.18, -0.18]]) {
    addPart(group, createBox(0.05, 0.45, 0.05, 0x5a4a3a), x, 0.225, z);
  }
  return group;
}

function createBed(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(1.6, 0.35, 2.2, 0x8a7a6a), 0, 0.175, 0);
  addPart(group, createBox(1.5, 0.15, 2.1, 0xe8e0d8), 0, 0.425, 0);
  addPart(group, createBox(0.5, 0.1, 0.35, 0xf0ece4), 0, 0.55, -0.85);
  addPart(group, createBox(1.6, 0.7, 0.1, 0x6a5a4a), 0, 0.5, -1.1);
  return group;
}

function createKitchenCounter(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(3, 0.9, 0.7, 0xd4c8b8), 0, 0.45, 0);
  addPart(group, createBox(3.1, 0.05, 0.75, 0x888888), 0, 0.925, 0);
  return group;
}

function createFridge(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.8, 1.8, 0.7, 0xc0c0c0), 0, 0.9, 0);
  addPart(group, createBox(0.04, 0.4, 0.04, 0x888888), 0.35, 1.2, 0.37);
  return group;
}

function createTV(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(1.6, 0.9, 0.06, 0x111111), 0, 1.2, 0);
  const stand = createCylinder(0.05, 0.15, 0.5, 0x333333);
  stand.position.set(0, 0.25, 0);
  group.add(stand);
  addPart(group, createBox(1.8, 0.4, 0.5, 0x5a4a3a), 0, 0.2, 0);
  return group;
}

function createLamp(): THREE.Group {
  const group = new THREE.Group();
  const base = createCylinder(0.15, 0.2, 0.05, 0x888888);
  base.position.set(0, 0.025, 0);
  group.add(base);
  const pole = createCylinder(0.03, 0.03, 1.2, 0x888888);
  pole.position.set(0, 0.65, 0);
  group.add(pole);
  const shade = createCylinder(0.25, 0.15, 0.3, 0xffe8a0);
  shade.position.set(0, 1.35, 0);
  group.add(shade);
  const light = new THREE.PointLight(0xffe0a0, 0.5, 5);
  light.position.set(0, 1.5, 0);
  light.castShadow = true;
  group.add(light);
  return group;
}

function createNightstand(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.5, 0.55, 0.4, 0x7a6a5a), 0, 0.275, 0);
  addPart(group, createBox(0.15, 0.03, 0.03, 0xaaa080), 0, 0.3, 0.22);
  return group;
}

export function createFurniture(_rooms: RoomDef[]): FurnitureItem[] {
  const items: FurnitureItem[] = [];

  // === LIVING ROOM ===
  const couch = createCouch();
  couch.position.set(4, 0, -2);
  couch.rotation.y = Math.PI;
  items.push({ name: 'Couch', mesh: couch, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(4, 0, -1), interactionType: 'sit' });

  const coffeeTable = createTable(1.2, 0.6, 0.4, 0x8a7a6a);
  coffeeTable.position.set(4, 0, -0.8);
  items.push({ name: 'Coffee Table', mesh: coffeeTable, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(4, 0, -0.3), interactionType: 'use' });

  const tv = createTV();
  tv.position.set(4, 0, 0);
  tv.rotation.y = Math.PI;
  items.push({ name: 'TV', mesh: tv, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(4, 0, -1), interactionType: 'look' });

  const livingLamp = createLamp();
  livingLamp.position.set(1, 0, -1);
  items.push({ name: 'Floor Lamp', mesh: livingLamp, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(1.5, 0, -1), interactionType: 'use' });

  // === KITCHEN ===
  const counter = createKitchenCounter();
  counter.position.set(10.5, 0, -5.5);
  items.push({ name: 'Kitchen Counter', mesh: counter, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(10.5, 0, -4.5), interactionType: 'use' });

  const fridge = createFridge();
  fridge.position.set(12.5, 0, -5.5);
  items.push({ name: 'Fridge', mesh: fridge, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(12, 0, -4.5), interactionType: 'use' });

  const kitchenTable = createTable(1.2, 1.2, 0.75, 0xa08060);
  kitchenTable.position.set(10, 0, -2.5);
  items.push({ name: 'Dining Table', mesh: kitchenTable, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(10, 0, -1.8), interactionType: 'sit' });

  for (const [dx, dz, ry] of [[0.8, 0, Math.PI / 2], [-0.8, 0, -Math.PI / 2], [0, 0.8, 0], [0, -0.8, Math.PI]] as [number, number, number][]) {
    const chair = createChair();
    chair.position.set(10 + dx, 0, -2.5 + dz);
    chair.rotation.y = ry;
    items.push({ name: 'Chair', mesh: chair, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(10 + dx, 0, -2.5 + dz), interactionType: 'sit' });
  }

  // === BEDROOMS ===
  for (const cfg of [
    { name: 'Bedroom 1', bedX: 1.2, bedZ: -8, nsX: 2.3, nsZ: -8.8 },
    { name: 'Bedroom 2', bedX: 5.7, bedZ: -8, nsX: 6.8, nsZ: -8.8 },
    { name: 'Bedroom 3', bedX: 10.2, bedZ: -8, nsX: 11.3, nsZ: -8.8 },
  ]) {
    const bed = createBed();
    bed.position.set(cfg.bedX, 0, cfg.bedZ);
    items.push({ name: 'Bed', mesh: bed, room: cfg.name, interactable: true, interactionPoint: new THREE.Vector3(cfg.bedX + 1, 0, cfg.bedZ), interactionType: 'sit' });

    const ns = createNightstand();
    ns.position.set(cfg.nsX, 0, cfg.nsZ);
    items.push({ name: 'Nightstand', mesh: ns, room: cfg.name, interactable: false, interactionPoint: new THREE.Vector3(cfg.nsX, 0, cfg.nsZ + 0.5), interactionType: 'use' });
  }

  return items;
}
