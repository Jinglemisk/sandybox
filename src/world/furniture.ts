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

// ── Furniture Factories ──

function createCouch(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(2.8, 0.4, 1.0, 0x5a7a9a), 0, 0.3, 0);
  addPart(group, createBox(2.8, 0.6, 0.2, 0x4a6a8a), 0, 0.7, -0.45);
  addPart(group, createBox(0.2, 0.5, 1.0, 0x4a6a8a), -1.4, 0.45, 0);
  addPart(group, createBox(0.2, 0.5, 1.0, 0x4a6a8a), 1.4, 0.45, 0);
  // Cushion details
  addPart(group, createBox(0.8, 0.08, 0.7, 0x6a8aaa), -0.5, 0.54, 0.05);
  addPart(group, createBox(0.8, 0.08, 0.7, 0x6a8aaa), 0.5, 0.54, 0.05);
  // Legs
  for (const [x, z] of [[-1.2, 0.4], [1.2, 0.4], [-1.2, -0.4], [1.2, -0.4]]) {
    addPart(group, createBox(0.08, 0.12, 0.08, 0x333333), x, 0.06, z);
  }
  return group;
}

function createArmchair(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.9, 0.35, 0.85, 0x7a6a5a), 0, 0.28, 0);
  addPart(group, createBox(0.9, 0.5, 0.15, 0x6a5a4a), 0, 0.6, -0.38);
  addPart(group, createBox(0.15, 0.4, 0.85, 0x6a5a4a), -0.45, 0.4, 0);
  addPart(group, createBox(0.15, 0.4, 0.85, 0x6a5a4a), 0.45, 0.4, 0);
  // Cushion
  addPart(group, createBox(0.6, 0.06, 0.55, 0x8a7a6a), 0, 0.5, 0.05);
  return group;
}

function createTable(w: number, d: number, h: number, color: number): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(w, 0.08, d, color), 0, h, 0);
  const lx = w / 2 - 0.08;
  const lz = d / 2 - 0.08;
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

function createBed(color: number = 0xe8e0d8): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(1.8, 0.35, 2.4, 0x8a7a6a), 0, 0.175, 0);
  addPart(group, createBox(1.7, 0.18, 2.3, color), 0, 0.44, 0);
  // Blanket fold
  addPart(group, createBox(1.7, 0.04, 0.8, 0xc8c0b0), 0, 0.56, 0.7);
  // Pillows
  addPart(group, createBox(0.55, 0.12, 0.35, 0xf5f0e8), -0.35, 0.58, -0.95);
  addPart(group, createBox(0.55, 0.12, 0.35, 0xf5f0e8), 0.35, 0.58, -0.95);
  // Headboard
  addPart(group, createBox(1.8, 0.8, 0.1, 0x6a5a4a), 0, 0.55, -1.2);
  return group;
}

function createKitchenCounter(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(4, 0.9, 0.7, 0xd4c8b8), 0, 0.45, 0);
  addPart(group, createBox(4.1, 0.06, 0.75, 0x909090), 0, 0.935, 0);
  // Drawer handles
  for (let i = -1.5; i <= 1.5; i += 1) {
    addPart(group, createBox(0.2, 0.03, 0.03, 0xaaa080), i, 0.55, 0.37);
    addPart(group, createBox(0.2, 0.03, 0.03, 0xaaa080), i, 0.3, 0.37);
  }
  return group;
}

function createStove(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.8, 0.9, 0.7, 0xc8c8c8), 0, 0.45, 0);
  addPart(group, createBox(0.85, 0.04, 0.75, 0x222222), 0, 0.92, 0);
  // Burners
  for (const [x, z] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) {
    const burner = createCylinder(0.1, 0.1, 0.02, 0x444444);
    burner.position.set(x, 0.95, z);
    group.add(burner);
  }
  // Oven door handle
  addPart(group, createBox(0.4, 0.03, 0.03, 0x888888), 0, 0.65, 0.37);
  return group;
}

function createSink(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.8, 0.9, 0.7, 0xd4c8b8), 0, 0.45, 0);
  addPart(group, createBox(0.85, 0.06, 0.75, 0x909090), 0, 0.935, 0);
  // Basin
  addPart(group, createBox(0.5, 0.04, 0.4, 0xe0e0e0), 0, 0.92, 0);
  // Faucet
  const faucetBase = createCylinder(0.025, 0.025, 0.3, 0xaaaaaa, 8);
  faucetBase.position.set(0, 1.1, -0.2);
  group.add(faucetBase);
  addPart(group, createBox(0.04, 0.04, 0.15, 0xaaaaaa), 0, 1.25, -0.12);
  return group;
}

function createFridge(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.9, 1.9, 0.8, 0xd0d0d0), 0, 0.95, 0);
  addPart(group, createBox(0.04, 0.5, 0.04, 0x999999), 0.4, 1.4, 0.42);
  addPart(group, createBox(0.04, 0.35, 0.04, 0x999999), 0.4, 0.55, 0.42);
  // Line between freezer and fridge
  addPart(group, createBox(0.88, 0.02, 0.02, 0xbbbbbb), 0, 1.15, 0.41);
  return group;
}

function createTV(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(2.0, 1.1, 0.06, 0x111111), 0, 1.3, 0);
  // Screen glow
  addPart(group, createBox(1.85, 0.95, 0.02, 0x1a2a4a), 0, 1.3, 0.04);
  const stand = createCylinder(0.06, 0.18, 0.5, 0x333333);
  stand.position.set(0, 0.25, 0);
  group.add(stand);
  // TV stand/cabinet
  addPart(group, createBox(2.4, 0.45, 0.6, 0x5a4a3a), 0, 0.225, 0);
  // Cabinet doors
  addPart(group, createBox(0.02, 0.35, 0.55, 0x4a3a2a), 0, 0.225, 0.03);
  return group;
}

function createLamp(): THREE.Group {
  const group = new THREE.Group();
  const base = createCylinder(0.15, 0.2, 0.05, 0x888888);
  base.position.set(0, 0.025, 0);
  group.add(base);
  const pole = createCylinder(0.03, 0.03, 1.3, 0x888888);
  pole.position.set(0, 0.7, 0);
  group.add(pole);
  const shade = createCylinder(0.28, 0.18, 0.35, 0xffe8a0);
  shade.position.set(0, 1.45, 0);
  group.add(shade);
  const light = new THREE.PointLight(0xffe0a0, 0.6, 6);
  light.position.set(0, 1.6, 0);
  light.castShadow = true;
  group.add(light);
  return group;
}

function createTableLamp(): THREE.Group {
  const group = new THREE.Group();
  const base = createCylinder(0.08, 0.1, 0.03, 0x888888);
  base.position.set(0, 0.015, 0);
  group.add(base);
  const pole = createCylinder(0.02, 0.02, 0.3, 0x888888);
  pole.position.set(0, 0.18, 0);
  group.add(pole);
  const shade = createCylinder(0.15, 0.1, 0.18, 0xf0e0c0);
  shade.position.set(0, 0.42, 0);
  group.add(shade);
  const light = new THREE.PointLight(0xffe0a0, 0.3, 3);
  light.position.set(0, 0.5, 0);
  group.add(light);
  return group;
}

function createNightstand(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.5, 0.55, 0.45, 0x7a6a5a), 0, 0.275, 0);
  addPart(group, createBox(0.15, 0.03, 0.03, 0xaaa080), 0, 0.35, 0.25);
  addPart(group, createBox(0.15, 0.03, 0.03, 0xaaa080), 0, 0.15, 0.25);
  return group;
}

function createBookshelf(): THREE.Group {
  const group = new THREE.Group();
  // Frame
  addPart(group, createBox(1.6, 2.2, 0.35, 0x6a5a4a), 0, 1.1, 0);
  // Shelves
  for (let y = 0.4; y <= 2.0; y += 0.5) {
    addPart(group, createBox(1.5, 0.04, 0.32, 0x7a6a5a), 0, y, 0.02);
  }
  // Books (colorful blocks on shelves)
  const bookColors = [0xc44444, 0x4444c4, 0x44aa44, 0xaaaa44, 0x8844aa, 0xaa6644, 0x44aaaa];
  for (let shelf = 0; shelf < 4; shelf++) {
    const y = 0.42 + shelf * 0.5;
    let x = -0.6;
    while (x < 0.6) {
      const w = 0.06 + Math.random() * 0.08;
      const h = 0.25 + Math.random() * 0.18;
      const color = bookColors[Math.floor(Math.random() * bookColors.length)];
      addPart(group, createBox(w, h, 0.22, color), x, y + h / 2, 0.03);
      x += w + 0.02;
    }
  }
  return group;
}

function createRug(w: number, d: number, color: number): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0,
  });
  const rug = new THREE.Mesh(geo, mat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.02;
  rug.receiveShadow = true;
  group.add(rug);
  // Border
  const borderGeo = new THREE.PlaneGeometry(w + 0.1, d + 0.1);
  const borderMat = new THREE.MeshStandardMaterial({
    color: (color & 0xfefefe) >> 1, // darker border
    roughness: 0.95,
  });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = -Math.PI / 2;
  border.position.y = 0.015;
  border.receiveShadow = true;
  group.add(border);
  return group;
}

function createPlant(): THREE.Group {
  const group = new THREE.Group();
  // Pot
  const pot = createCylinder(0.15, 0.12, 0.25, 0xb07050);
  pot.position.set(0, 0.125, 0);
  group.add(pot);
  // Soil
  const soil = createCylinder(0.14, 0.14, 0.03, 0x4a3a2a);
  soil.position.set(0, 0.26, 0);
  group.add(soil);
  // Leaves (spheres)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.8 });
  for (const [x, y, z, s] of [[0, 0.45, 0, 0.12], [-0.08, 0.5, 0.06, 0.09], [0.07, 0.48, -0.05, 0.1], [0, 0.55, 0, 0.08]] as [number, number, number, number][]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), leafMat);
    leaf.position.set(x, y, z);
    leaf.castShadow = true;
    group.add(leaf);
  }
  return group;
}

function createTallPlant(): THREE.Group {
  const group = new THREE.Group();
  const pot = createCylinder(0.2, 0.15, 0.35, 0xa06040);
  pot.position.set(0, 0.175, 0);
  group.add(pot);
  // Trunk
  const trunk = createCylinder(0.04, 0.05, 0.8, 0x6a5a3a);
  trunk.position.set(0, 0.75, 0);
  group.add(trunk);
  // Foliage
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2a7a2a, roughness: 0.8 });
  for (const [x, y, z, s] of [[0, 1.3, 0, 0.22], [-0.1, 1.2, 0.1, 0.15], [0.12, 1.15, -0.08, 0.14], [0, 1.45, 0, 0.15]] as [number, number, number, number][]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), leafMat);
    leaf.position.set(x, y, z);
    leaf.castShadow = true;
    group.add(leaf);
  }
  return group;
}

function createWallArt(w: number, h: number): THREE.Group {
  const group = new THREE.Group();
  // Frame
  addPart(group, createBox(w + 0.1, h + 0.1, 0.04, 0x5a4a3a), 0, 0, 0);
  // Canvas with random color
  const colors = [0x8ab4d8, 0xd8a88a, 0xa8d88a, 0xd8c88a, 0xc88ad8];
  const color = colors[Math.floor(Math.random() * colors.length)];
  addPart(group, createBox(w, h, 0.05, color), 0, 0, 0.01);
  return group;
}

function createDesk(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(1.4, 0.06, 0.7, 0x8a7a6a), 0, 0.75, 0);
  // Legs
  for (const [x, z] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
    addPart(group, createBox(0.06, 0.75, 0.06, 0x6a5a4a), x, 0.375, z);
  }
  // Monitor
  addPart(group, createBox(0.6, 0.4, 0.04, 0x222222), 0, 1.15, -0.15);
  const monitorStand = createCylinder(0.04, 0.08, 0.2, 0x333333);
  monitorStand.position.set(0, 0.88, -0.15);
  group.add(monitorStand);
  // Keyboard
  addPart(group, createBox(0.4, 0.02, 0.12, 0x444444), 0, 0.79, 0.1);
  return group;
}

function createDresser(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(1.2, 0.9, 0.5, 0x7a6a5a), 0, 0.45, 0);
  addPart(group, createBox(1.25, 0.04, 0.55, 0x6a5a4a), 0, 0.92, 0);
  // Drawers
  for (let y = 0.2; y <= 0.8; y += 0.3) {
    addPart(group, createBox(0.5, 0.22, 0.02, 0x8a7a6a), -0.28, y, 0.26);
    addPart(group, createBox(0.5, 0.22, 0.02, 0x8a7a6a), 0.28, y, 0.26);
    addPart(group, createBox(0.12, 0.03, 0.03, 0xaaa080), -0.28, y, 0.28);
    addPart(group, createBox(0.12, 0.03, 0.03, 0xaaa080), 0.28, y, 0.28);
  }
  return group;
}

function createMirror(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(0.8, 1.2, 0.04, 0x6a5a4a), 0, 0, 0);
  addPart(group, createBox(0.7, 1.1, 0.03, 0xc0d0e0), 0, 0, 0.02);
  return group;
}

function createShelf(): THREE.Group {
  const group = new THREE.Group();
  addPart(group, createBox(1.2, 0.04, 0.25, 0x7a6a5a), 0, 0, 0);
  // Items on shelf
  const plant = createPlant();
  plant.scale.set(0.5, 0.5, 0.5);
  plant.position.set(-0.4, 0.02, 0);
  group.add(plant);
  addPart(group, createBox(0.15, 0.2, 0.12, 0xc44444), 0.3, 0.12, 0);
  return group;
}

// ── Main furniture placement ──

export function createFurniture(_rooms: RoomDef[]): FurnitureItem[] {
  const items: FurnitureItem[] = [];

  // ═══════════════════════════════════
  // LIVING ROOM (x:0-10, z:0 to -8)
  // ═══════════════════════════════════

  // Couch - center of room facing TV (toward front wall / +Z)
  const couch = createCouch();
  couch.position.set(5, 0, -4.5);
  // rotation.y = 0 means couch back faces -Z, seat faces +Z (toward TV at z=-1.5)
  items.push({ name: 'Couch', mesh: couch, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(5, 0, -4), interactionType: 'sit' });

  // Armchair - beside couch, angled toward TV
  const armchair1 = createArmchair();
  armchair1.position.set(2, 0, -3.5);
  armchair1.rotation.y = -Math.PI / 6;
  items.push({ name: 'Armchair', mesh: armchair1, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(2.5, 0, -3), interactionType: 'sit' });

  // Coffee table
  const coffeeTable = createTable(1.4, 0.7, 0.4, 0x8a7a6a);
  coffeeTable.position.set(5, 0, -3.2);
  items.push({ name: 'Coffee Table', mesh: coffeeTable, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(5, 0, -2.6), interactionType: 'use' });

  // TV on south wall
  const tv = createTV();
  tv.position.set(5, 0, -1.5);
  tv.rotation.y = Math.PI;
  items.push({ name: 'TV', mesh: tv, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(5, 0, -3), interactionType: 'look' });

  // Bookshelf on west wall
  const bookshelf = createBookshelf();
  bookshelf.position.set(0.5, 0, -5);
  items.push({ name: 'Bookshelf', mesh: bookshelf, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(1.2, 0, -5), interactionType: 'use' });

  // Floor lamp
  const livingLamp = createLamp();
  livingLamp.position.set(1.2, 0, -2);
  items.push({ name: 'Floor Lamp', mesh: livingLamp, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(1.8, 0, -2), interactionType: 'use' });

  // Rug under seating area
  const livingRug = createRug(4.5, 3, 0x8a6a5a);
  livingRug.position.set(5, 0, -3.8);
  items.push({ name: 'Rug', mesh: livingRug, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(5, 0, -3.8), interactionType: 'use' });

  // Tall plant in corner
  const livingPlant = createTallPlant();
  livingPlant.position.set(8.5, 0, -7);
  items.push({ name: 'Plant', mesh: livingPlant, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(8, 0, -6.5), interactionType: 'look' });

  // Wall art
  const art1 = createWallArt(1.2, 0.8);
  art1.position.set(0.12, 1.8, -3);
  art1.rotation.y = Math.PI / 2;
  items.push({ name: 'Wall Art', mesh: art1, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(1, 0, -3), interactionType: 'look' });

  // Side table with lamp
  const sideTable = createTable(0.5, 0.5, 0.5, 0x7a6a5a);
  sideTable.position.set(7.5, 0, -4.5);
  items.push({ name: 'Side Table', mesh: sideTable, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(7.5, 0, -4), interactionType: 'use' });

  const sideLamp = createTableLamp();
  sideLamp.position.set(7.5, 0.55, -4.5);
  items.push({ name: 'Table Lamp', mesh: sideLamp, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(7.5, 0, -4), interactionType: 'use' });

  // ═══════════════════════════════════
  // KITCHEN (x:10-18, z:0 to -8)
  // ═══════════════════════════════════

  // Counter along north wall
  const counter = createKitchenCounter();
  counter.position.set(14, 0, -7.3);
  items.push({ name: 'Kitchen Counter', mesh: counter, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(14, 0, -6.3), interactionType: 'use' });

  // Stove
  const stove = createStove();
  stove.position.set(16.5, 0, -7.3);
  items.push({ name: 'Stove', mesh: stove, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(16.5, 0, -6.3), interactionType: 'use' });

  // Sink
  const sink = createSink();
  sink.position.set(11.5, 0, -7.3);
  items.push({ name: 'Sink', mesh: sink, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(11.5, 0, -6.3), interactionType: 'use' });

  // Fridge
  const fridge = createFridge();
  fridge.position.set(17.3, 0, -5.5);
  items.push({ name: 'Fridge', mesh: fridge, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(16.5, 0, -5.5), interactionType: 'use' });

  // Dining table with chairs
  const kitchenTable = createTable(1.6, 1.2, 0.75, 0xa08060);
  kitchenTable.position.set(13, 0, -3.5);
  items.push({ name: 'Dining Table', mesh: kitchenTable, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(13, 0, -2.5), interactionType: 'sit' });

  for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2], [0, 0.8, 0], [0, -0.8, Math.PI]] as [number, number, number][]) {
    const chair = createChair();
    chair.position.set(13 + dx, 0, -3.5 + dz);
    chair.rotation.y = ry;
    items.push({ name: 'Chair', mesh: chair, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(13 + dx, 0, -3.5 + dz), interactionType: 'sit' });
  }

  // Kitchen plant
  const kitchenPlant = createPlant();
  kitchenPlant.position.set(10.5, 0.95, -7.3);
  items.push({ name: 'Kitchen Plant', mesh: kitchenPlant, room: 'Kitchen', interactable: false, interactionPoint: new THREE.Vector3(10.5, 0, -6.5), interactionType: 'look' });

  // Wall shelf
  const kitchenShelf = createShelf();
  kitchenShelf.position.set(14, 1.5, -7.7);
  items.push({ name: 'Kitchen Shelf', mesh: kitchenShelf, room: 'Kitchen', interactable: false, interactionPoint: new THREE.Vector3(14, 0, -7), interactionType: 'look' });

  // ═══════════════════════════════════
  // BEDROOM 1 (x:0-5.5, z:-8 to -14)
  // ═══════════════════════════════════

  const bed1 = createBed(0xb8c8e8);
  bed1.position.set(1.8, 0, -11.5);
  items.push({ name: 'Bed', mesh: bed1, room: 'Bedroom 1', interactable: true, interactionPoint: new THREE.Vector3(3.2, 0, -11.5), interactionType: 'sit' });

  const ns1 = createNightstand();
  ns1.position.set(3.2, 0, -12.5);
  items.push({ name: 'Nightstand', mesh: ns1, room: 'Bedroom 1', interactable: false, interactionPoint: new THREE.Vector3(3.2, 0, -12), interactionType: 'use' });

  const nsLamp1 = createTableLamp();
  nsLamp1.position.set(3.2, 0.58, -12.5);
  items.push({ name: 'Bedside Lamp', mesh: nsLamp1, room: 'Bedroom 1', interactable: false, interactionPoint: new THREE.Vector3(3.2, 0, -12), interactionType: 'use' });

  const dresser1 = createDresser();
  dresser1.position.set(4.3, 0, -9);
  items.push({ name: 'Dresser', mesh: dresser1, room: 'Bedroom 1', interactable: true, interactionPoint: new THREE.Vector3(4.3, 0, -9.8), interactionType: 'use' });

  const rug1 = createRug(2.2, 1.8, 0x7a8aaa);
  rug1.position.set(2, 0, -10);
  items.push({ name: 'Bedroom Rug', mesh: rug1, room: 'Bedroom 1', interactable: false, interactionPoint: new THREE.Vector3(2, 0, -10), interactionType: 'use' });

  const bedArt1 = createWallArt(0.8, 0.6);
  bedArt1.position.set(1.8, 2, -13.88);
  items.push({ name: 'Wall Art', mesh: bedArt1, room: 'Bedroom 1', interactable: false, interactionPoint: new THREE.Vector3(1.8, 0, -13), interactionType: 'look' });

  // ═══════════════════════════════════
  // BEDROOM 2 (x:5.5-11, z:-8 to -14)
  // ═══════════════════════════════════

  const bed2 = createBed(0xe8c8c8);
  bed2.position.set(7.3, 0, -11.5);
  items.push({ name: 'Bed', mesh: bed2, room: 'Bedroom 2', interactable: true, interactionPoint: new THREE.Vector3(8.7, 0, -11.5), interactionType: 'sit' });

  const ns2 = createNightstand();
  ns2.position.set(8.7, 0, -12.5);
  items.push({ name: 'Nightstand', mesh: ns2, room: 'Bedroom 2', interactable: false, interactionPoint: new THREE.Vector3(8.7, 0, -12), interactionType: 'use' });

  const desk1 = createDesk();
  desk1.position.set(9.8, 0, -9.5);
  desk1.rotation.y = Math.PI;
  items.push({ name: 'Desk', mesh: desk1, room: 'Bedroom 2', interactable: true, interactionPoint: new THREE.Vector3(9.8, 0, -10.2), interactionType: 'use' });

  const deskChair1 = createChair();
  deskChair1.position.set(9.8, 0, -10.2);
  items.push({ name: 'Desk Chair', mesh: deskChair1, room: 'Bedroom 2', interactable: true, interactionPoint: new THREE.Vector3(9.8, 0, -10.2), interactionType: 'sit' });

  const bedPlant2 = createPlant();
  bedPlant2.position.set(6, 0, -13);
  items.push({ name: 'Plant', mesh: bedPlant2, room: 'Bedroom 2', interactable: false, interactionPoint: new THREE.Vector3(6.5, 0, -13), interactionType: 'look' });

  const rug2 = createRug(2.2, 1.8, 0xaa8a7a);
  rug2.position.set(7.5, 0, -10);
  items.push({ name: 'Bedroom Rug', mesh: rug2, room: 'Bedroom 2', interactable: false, interactionPoint: new THREE.Vector3(7.5, 0, -10), interactionType: 'use' });

  // ═══════════════════════════════════
  // BEDROOM 3 (x:11-15, z:-8 to -14)
  // ═══════════════════════════════════

  const bed3 = createBed(0xd8e8c8);
  bed3.position.set(12.5, 0, -11.5);
  items.push({ name: 'Bed', mesh: bed3, room: 'Bedroom 3', interactable: true, interactionPoint: new THREE.Vector3(14, 0, -11.5), interactionType: 'sit' });

  const ns3 = createNightstand();
  ns3.position.set(14, 0, -12.5);
  items.push({ name: 'Nightstand', mesh: ns3, room: 'Bedroom 3', interactable: false, interactionPoint: new THREE.Vector3(14, 0, -12), interactionType: 'use' });

  const nsLamp3 = createTableLamp();
  nsLamp3.position.set(14, 0.58, -12.5);
  items.push({ name: 'Bedside Lamp', mesh: nsLamp3, room: 'Bedroom 3', interactable: false, interactionPoint: new THREE.Vector3(14, 0, -12), interactionType: 'use' });

  const dresser3 = createDresser();
  dresser3.position.set(11.6, 0, -9.2);
  items.push({ name: 'Dresser', mesh: dresser3, room: 'Bedroom 3', interactable: true, interactionPoint: new THREE.Vector3(11.6, 0, -10), interactionType: 'use' });

  const rug3 = createRug(2, 1.8, 0x8aaa8a);
  rug3.position.set(13, 0, -10);
  items.push({ name: 'Bedroom Rug', mesh: rug3, room: 'Bedroom 3', interactable: false, interactionPoint: new THREE.Vector3(13, 0, -10), interactionType: 'use' });

  // ═══════════════════════════════════
  // BATHROOM (x:15-18, z:-8 to -14)
  // ═══════════════════════════════════

  // Toilet
  const toilet = new THREE.Group();
  addPart(toilet, createBox(0.45, 0.4, 0.55, 0xf0f0f0), 0, 0.2, 0);        // bowl
  addPart(toilet, createBox(0.45, 0.5, 0.08, 0xf0f0f0), 0, 0.45, -0.28);    // tank
  addPart(toilet, createBox(0.48, 0.04, 0.5, 0xf0f0f0), 0, 0.42, 0.03);     // seat
  toilet.position.set(17.2, 0, -12.5);
  items.push({ name: 'Toilet', mesh: toilet, room: 'Bathroom', interactable: true, interactionPoint: new THREE.Vector3(16.5, 0, -12.5), interactionType: 'use' });

  // Shower
  const shower = new THREE.Group();
  addPart(shower, createBox(1.2, 0.08, 1.2, 0xe8e8e8), 0, 0.04, 0);         // base tray
  // Glass walls (two sides)
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xc0e0f0, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.3 });
  const glassWall1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), glassMat);
  glassWall1.position.set(0.6, 1.14, 0);
  glassWall1.rotation.y = Math.PI / 2;
  shower.add(glassWall1);
  const glassWall2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), glassMat);
  glassWall2.position.set(0, 1.14, 0.6);
  shower.add(glassWall2);
  // Shower head
  const showerPole = createCylinder(0.02, 0.02, 2, 0xaaaaaa, 8);
  showerPole.position.set(-0.45, 1, -0.45);
  shower.add(showerPole);
  const showerHead = createCylinder(0.08, 0.06, 0.04, 0xcccccc, 8);
  showerHead.position.set(-0.45, 2.02, -0.35);
  showerHead.rotation.z = 0.3;
  shower.add(showerHead);
  shower.position.set(16.5, 0, -9.5);
  items.push({ name: 'Shower', mesh: shower, room: 'Bathroom', interactable: true, interactionPoint: new THREE.Vector3(15.8, 0, -9.5), interactionType: 'use' });

  // Bathroom sink with mirror
  const bathSink = new THREE.Group();
  addPart(bathSink, createBox(0.7, 0.06, 0.5, 0xf0f0f0), 0, 0.85, 0);      // counter
  addPart(bathSink, createBox(0.6, 0.7, 0.45, 0xe8e8e8), 0, 0.45, 0);       // cabinet
  addPart(bathSink, createBox(0.35, 0.04, 0.25, 0xe0e0e0), 0, 0.84, 0.05);  // basin
  // Faucet
  const bathFaucet = createCylinder(0.02, 0.02, 0.15, 0xbbbbbb, 8);
  bathFaucet.position.set(0, 0.95, -0.1);
  bathSink.add(bathFaucet);
  addPart(bathSink, createBox(0.03, 0.03, 0.1, 0xbbbbbb), 0, 1.02, -0.05);
  // Mirror above
  addPart(bathSink, createBox(0.6, 0.8, 0.03, 0x5a5a5a), 0, 1.5, -0.28);    // frame
  addPart(bathSink, createBox(0.55, 0.75, 0.02, 0xc0d0e0), 0, 1.5, -0.26);  // glass
  bathSink.position.set(15.6, 0, -13.2);
  items.push({ name: 'Bathroom Sink', mesh: bathSink, room: 'Bathroom', interactable: true, interactionPoint: new THREE.Vector3(15.6, 0, -12.5), interactionType: 'use' });

  // Bath mat
  const bathMat = createRug(0.8, 0.5, 0x90b8b8);
  bathMat.position.set(15.6, 0, -12.5);
  items.push({ name: 'Bath Mat', mesh: bathMat, room: 'Bathroom', interactable: false, interactionPoint: new THREE.Vector3(15.6, 0, -12.5), interactionType: 'use' });

  // Towel rack
  const towelRack = new THREE.Group();
  addPart(towelRack, createBox(0.04, 0.04, 0.5, 0xcccccc), 0, 0, 0);
  addPart(towelRack, createBox(0.6, 0.3, 0.02, 0xf0e8e0), 0, -0.18, 0.05);  // towel
  towelRack.position.set(17.4, 1.3, -10.5);
  items.push({ name: 'Towel Rack', mesh: towelRack, room: 'Bathroom', interactable: false, interactionPoint: new THREE.Vector3(17, 0, -10.5), interactionType: 'use' });

  // Small plant
  const bathPlant = createPlant();
  bathPlant.position.set(15.3, 0, -9);
  items.push({ name: 'Plant', mesh: bathPlant, room: 'Bathroom', interactable: false, interactionPoint: new THREE.Vector3(15.5, 0, -9.5), interactionType: 'look' });

  // ═══════════════════════════════════
  // OUTDOOR ITEMS
  // ═══════════════════════════════════

  // Porch bench (by front door)
  const bench = new THREE.Group();
  addPart(bench, createBox(1.8, 0.06, 0.5, 0x7a6a5a), 0, 0.42, 0);          // seat
  addPart(bench, createBox(1.8, 0.5, 0.06, 0x6a5a4a), 0, 0.7, -0.25);       // back
  for (const x of [-0.8, 0, 0.8]) {
    addPart(bench, createBox(0.06, 0.42, 0.5, 0x6a5a4a), x, 0.21, 0);       // legs/support
  }
  bench.position.set(7, 0, 0.8);
  items.push({ name: 'Porch Bench', mesh: bench, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(7, 0, 1.3), interactionType: 'sit' });

  // Mailbox
  const mailbox = new THREE.Group();
  const mailPole = createCylinder(0.04, 0.04, 1.0, 0x555555, 8);
  mailPole.position.set(0, 0.5, 0);
  mailbox.add(mailPole);
  addPart(mailbox, createBox(0.35, 0.25, 0.2, 0x3366aa), 0, 1.12, 0);       // box
  addPart(mailbox, createBox(0.37, 0.03, 0.22, 0x2255aa), 0, 1.26, 0);      // lid
  // Flag
  addPart(mailbox, createBox(0.02, 0.15, 0.02, 0xcc3333), 0.2, 1.2, 0);
  addPart(mailbox, createBox(0.1, 0.02, 0.02, 0xcc3333), 0.25, 1.27, 0);
  mailbox.position.set(4.5, 0, 7.5);
  items.push({ name: 'Mailbox', mesh: mailbox, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(4.5, 0, 7), interactionType: 'use' });

  // Trash can (by front door)
  const trashcan = new THREE.Group();
  const trashBody = createCylinder(0.25, 0.22, 0.7, 0x555555);
  trashBody.position.set(0, 0.35, 0);
  trashcan.add(trashBody);
  const trashLid = createCylinder(0.27, 0.27, 0.04, 0x666666);
  trashLid.position.set(0, 0.72, 0);
  trashcan.add(trashLid);
  const trashHandle = createCylinder(0.02, 0.02, 0.15, 0x666666, 8);
  trashHandle.position.set(0, 0.8, 0);
  trashcan.add(trashHandle);
  trashcan.position.set(6.5, 0, 0.5);
  items.push({ name: 'Trash Can', mesh: trashcan, room: 'Living Room', interactable: true, interactionPoint: new THREE.Vector3(6, 0, 0.5), interactionType: 'use' });

  // Garden flower beds (along south wall)
  for (const [fx, fz] of [[1.5, 0.6], [8, 0.6], [14, 0.6], [16, 0.6]]) {
    const flowerBed = new THREE.Group();
    // Soil bed
    addPart(flowerBed, createBox(1.4, 0.15, 0.5, 0x4a3a2a), 0, 0.075, 0);
    // Flowers
    const flowerColors = [0xff6688, 0xffaa44, 0xff4466, 0xffcc66, 0xee88ff, 0xff8844];
    for (let i = -0.5; i <= 0.5; i += 0.25) {
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      // Stem
      const stem = createCylinder(0.01, 0.01, 0.2 + Math.random() * 0.15, 0x44aa44, 4);
      stem.position.set(i, 0.25, (Math.random() - 0.5) * 0.3);
      flowerBed.add(stem);
      // Flower head
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.03, 6, 4),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
      flower.position.set(i, 0.38 + Math.random() * 0.1, (Math.random() - 0.5) * 0.3);
      flowerBed.add(flower);
    }
    // Leaves
    for (let i = -0.4; i <= 0.4; i += 0.3) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 3),
        new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.8 }));
      leaf.position.set(i, 0.15, (Math.random() - 0.5) * 0.2);
      leaf.scale.set(1, 0.5, 1);
      flowerBed.add(leaf);
    }
    flowerBed.position.set(fx, 0, fz);
    items.push({ name: 'Flower Bed', mesh: flowerBed, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(fx, 0, fz - 0.5), interactionType: 'look' });
  }

  // Garden flowers along west wall
  for (const fz of [-2, -5, -10]) {
    const flowerBed = new THREE.Group();
    addPart(flowerBed, createBox(0.5, 0.15, 1.2, 0x4a3a2a), 0, 0.075, 0);
    const flowerColors = [0xff6688, 0xffaa44, 0xee88ff, 0xffcc66];
    for (let i = -0.4; i <= 0.4; i += 0.2) {
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const stem = createCylinder(0.01, 0.01, 0.2 + Math.random() * 0.12, 0x44aa44, 4);
      stem.position.set((Math.random() - 0.5) * 0.2, 0.25, i);
      flowerBed.add(stem);
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
      flower.position.set((Math.random() - 0.5) * 0.2, 0.36 + Math.random() * 0.08, i);
      flowerBed.add(flower);
    }
    flowerBed.position.set(-0.6, 0, fz);
    items.push({ name: 'Flower Bed', mesh: flowerBed, room: 'Living Room', interactable: false, interactionPoint: new THREE.Vector3(0.5, 0, fz), interactionType: 'look' });
  }

  // Computer on dining table (laptop)
  const laptop = new THREE.Group();
  addPart(laptop, createBox(0.35, 0.02, 0.25, 0x333333), 0, 0, 0);          // base
  addPart(laptop, createBox(0.35, 0.25, 0.02, 0x222222), 0, 0.13, -0.12);   // screen
  addPart(laptop, createBox(0.32, 0.22, 0.01, 0x2a3a5a), 0, 0.13, -0.11);   // display
  laptop.position.set(13.5, 0.8, -3.8);
  items.push({ name: 'Laptop', mesh: laptop, room: 'Kitchen', interactable: true, interactionPoint: new THREE.Vector3(13.5, 0, -3), interactionType: 'use' });

  return items;
}
