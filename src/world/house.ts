import * as THREE from 'three';

// Room definitions with positions and sizes (in world units)
export interface RoomDef {
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: number;
  floorColor: number;
}

// House layout:
// Front row (z=0): Living Room (10x8), Kitchen (8x8)
// Back row (z=-8): Bedroom 1 (5.5x6), Bedroom 2 (5.5x6), Bedroom 3 (4x6), Bathroom (3x6)
export const ROOMS: RoomDef[] = [
  { name: 'Living Room', x: 0, z: 0, width: 10, depth: 8, color: 0xf0e6d2, floorColor: 0xd4b896 },
  { name: 'Kitchen',     x: 10, z: 0, width: 8, depth: 8, color: 0xe0eed0, floorColor: 0xb8c8a0 },
  { name: 'Bedroom 1',   x: 0, z: -8, width: 5.5, depth: 6, color: 0xd8ddf0, floorColor: 0xb0b8d8 },
  { name: 'Bedroom 2',   x: 5.5, z: -8, width: 5.5, depth: 6, color: 0xf0d8e0, floorColor: 0xd8b0b8 },
  { name: 'Bedroom 3',   x: 11, z: -8, width: 4, depth: 6, color: 0xf0ecd8, floorColor: 0xd8d4b0 },
  { name: 'Bathroom',    x: 15, z: -8, width: 3, depth: 6, color: 0xe8f0f0, floorColor: 0xc8dada },
];

const WALL_HEIGHT = 3.2;
const WALL_THICKNESS = 0.15;

export interface WallSegment {
  mesh: THREE.Mesh;
  facing: 'N' | 'S' | 'E' | 'W';
  exterior: boolean;
}

export class House {
  group: THREE.Group;
  walls: WallSegment[] = [];
  floors: THREE.Mesh[] = [];
  private roomLabels: { room: RoomDef; worldPos: THREE.Vector3 }[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildFloors();
    this.buildWalls();
    this.buildRoof();
    this.buildDoorFrames();
  }

  private buildFloors() {
    for (const room of ROOMS) {
      const geo = new THREE.PlaneGeometry(room.width, room.depth);
      const isBathroom = room.name === 'Bathroom';
      const mat = new THREE.MeshStandardMaterial({
        color: room.floorColor,
        roughness: isBathroom ? 0.3 : 0.7,
        metalness: isBathroom ? 0.15 : 0.05,
      });
      const floor = new THREE.Mesh(geo, mat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(room.x + room.width / 2, 0.01, room.z - room.depth / 2);
      floor.receiveShadow = true;
      this.group.add(floor);
      this.floors.push(floor);

      // Bathroom tile grid lines
      if (isBathroom) {
        const tileMat = new THREE.MeshStandardMaterial({ color: 0xa0baba, roughness: 0.3 });
        for (let tx = 0; tx < room.width; tx += 0.5) {
          const line = new THREE.Mesh(new THREE.PlaneGeometry(0.02, room.depth), tileMat);
          line.rotation.x = -Math.PI / 2;
          line.position.set(room.x + tx, 0.015, room.z - room.depth / 2);
          this.group.add(line);
        }
        for (let tz = 0; tz < room.depth; tz += 0.5) {
          const line = new THREE.Mesh(new THREE.PlaneGeometry(room.width, 0.02), tileMat);
          line.rotation.x = -Math.PI / 2;
          line.position.set(room.x + room.width / 2, 0.015, room.z - tz);
          this.group.add(line);
        }
      }

      this.roomLabels.push({
        room,
        worldPos: new THREE.Vector3(room.x + room.width / 2, 0, room.z - room.depth / 2),
      });
    }

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a8c4a, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(9, -0.02, -5);
    ground.receiveShadow = true;
    this.group.add(ground);

    // Path/patio outside front door
    const patioGeo = new THREE.PlaneGeometry(4, 3);
    const patioMat = new THREE.MeshStandardMaterial({ color: 0xb0a898, roughness: 0.9 });
    const patio = new THREE.Mesh(patioGeo, patioMat);
    patio.rotation.x = -Math.PI / 2;
    patio.position.set(5, 0.005, 1.5);
    patio.receiveShadow = true;
    this.group.add(patio);
  }

  private createWall(
    x: number, z: number,
    width: number, height: number,
    rotY: number,
    color: number,
    facing: 'N' | 'S' | 'E' | 'W',
    exterior: boolean
  ): WallSegment {
    const geo = new THREE.BoxGeometry(width, height, WALL_THICKNESS);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.05,
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.group.add(mesh);

    const wall: WallSegment = { mesh, facing, exterior };
    this.walls.push(wall);
    return wall;
  }

  private buildWalls() {
    // ── Exterior walls ──

    // South wall (front) z=0 - full width with door gap in living room
    // Left section: x=0 to x=3.5
    this.createWall(1.75, 0, 3.5, WALL_HEIGHT, 0, 0xf0e6d2, 'S', true);
    // Right of door: x=5.5 to x=18
    this.createWall(11.75, 0, 12.5, WALL_HEIGHT, 0, 0xf0e6d2, 'S', true);

    // North wall (back) z=-14 - full width
    this.createWall(9, -14, 18, WALL_HEIGHT, 0, 0xe0d8c8, 'N', true);

    // West wall (left) x=0 - full height z=0 to z=-14
    this.createWall(0, -7, 14, WALL_HEIGHT, Math.PI / 2, 0xf0e6d2, 'W', true);

    // East wall (right) x=18 - full height z=0 to z=-14
    this.createWall(18, -7, 14, WALL_HEIGHT, Math.PI / 2, 0xf0e6d2, 'E', true);

    // ── Interior walls ──

    // Wall between living room and kitchen (x=10, z=0 to z=-8)
    // Top section with doorway gap at z=-3 to z=-5
    this.createWall(10, -1.5, 3, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);
    this.createWall(10, -6.5, 3, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);

    // Horizontal wall between front rooms and back rooms (z=-8, full width)
    // With doorway gaps for each back room
    this.createWall(1, -8, 2, WALL_HEIGHT, 0, 0xe8e0d0, 'N', false);       // 0 to 2
    this.createWall(5, -8, 4, WALL_HEIGHT, 0, 0xe8e0d0, 'N', false);       // 3 to 7
    this.createWall(10, -8, 3, WALL_HEIGHT, 0, 0xe8e0d0, 'N', false);      // 8.5 to 11.5
    this.createWall(14.25, -8, 3.5, WALL_HEIGHT, 0, 0xe8e0d0, 'N', false); // 12.5 to 16
    this.createWall(17.25, -8, 1.5, WALL_HEIGHT, 0, 0xe8e0d0, 'N', false); // 16.5 to 18

    // Walls between bedrooms
    // Between bedroom 1 and 2 (x=5.5)
    this.createWall(5.5, -9.5, 3, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);
    this.createWall(5.5, -13, 2, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);

    // Between bedroom 2 and 3 (x=11)
    this.createWall(11, -9.5, 3, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);
    this.createWall(11, -13, 2, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);

    // Between bedroom 3 and bathroom (x=15)
    this.createWall(15, -9.5, 3, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);
    this.createWall(15, -13, 2, WALL_HEIGHT, Math.PI / 2, 0xe8e0d0, 'E', false);
  }

  private buildRoof() {
    // Subtle thin roof line - barely visible, just for shadow
    const roofGeo = new THREE.PlaneGeometry(18.4, 14.4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = Math.PI / 2;
    roof.position.set(9, WALL_HEIGHT + 0.05, -7);
    this.group.add(roof);
  }

  private buildDoorFrames() {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.6 });

    // Front door frame (x=3.5 to x=5.5, z=0)
    const doorTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 0.2), frameMat);
    doorTop.position.set(4.5, 2.5, 0);
    doorTop.castShadow = true;
    this.group.add(doorTop);

    // Windows and footpath
    this.buildWindows();
    this.buildFootpath();
  }

  private createWindow(
    x: number, y: number, z: number,
    width: number, height: number,
    rotY: number
  ) {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4, metalness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xa8d4f0,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.35,
    });

    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    // Glass pane
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.1, height - 0.1), glassMat);
    glass.position.z = 0.01;
    group.add(glass);

    // Frame pieces
    const bar = 0.06;
    // Top
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, bar, 0.08), frameMat);
    top.position.y = height / 2;
    group.add(top);
    // Bottom
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, bar, 0.1), frameMat);
    bottom.position.y = -height / 2;
    group.add(bottom);
    // Left
    const left = new THREE.Mesh(new THREE.BoxGeometry(bar, height, 0.08), frameMat);
    left.position.x = -width / 2;
    group.add(left);
    // Right
    const right = new THREE.Mesh(new THREE.BoxGeometry(bar, height, 0.08), frameMat);
    right.position.x = width / 2;
    group.add(right);
    // Center cross bars
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.04, 0.06), frameMat);
    group.add(hBar);
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height - 0.1, 0.06), frameMat);
    group.add(vBar);

    // Sill
    const sill = new THREE.Mesh(new THREE.BoxGeometry(width + 0.15, 0.04, 0.18), frameMat);
    sill.position.y = -height / 2 - 0.02;
    sill.position.z = 0.06;
    group.add(sill);

    this.group.add(group);
  }

  private buildWindows() {
    const winY = 1.8;
    const winW = 1.2;
    const winH = 1.1;

    // ── South wall windows (front, z=0) ──
    // Living room left window
    this.createWindow(2, winY, 0.08, winW, winH, 0);
    // Kitchen windows
    this.createWindow(8, winY, 0.08, winW, winH, 0);
    this.createWindow(13, winY, 0.08, winW, winH, 0);
    this.createWindow(16, winY, 0.08, winW, winH, 0);

    // ── North wall windows (back, z=-14) ──
    this.createWindow(2.5, winY, -14.08, winW, winH, Math.PI);  // Bedroom 1
    this.createWindow(8, winY, -14.08, winW, winH, Math.PI);    // Bedroom 2
    this.createWindow(13, winY, -14.08, winW, winH, Math.PI);   // Bedroom 3
    this.createWindow(16.5, winY, -14.08, 0.8, 0.8, Math.PI);   // Bathroom (smaller, frosted)

    // ── West wall windows (left, x=0) ──
    this.createWindow(-0.08, winY, -3, winW, winH, Math.PI / 2);
    this.createWindow(-0.08, winY, -11, winW, winH, Math.PI / 2);

    // ── East wall windows (right, x=18) ──
    this.createWindow(18.08, winY, -3, winW, winH, -Math.PI / 2);
    this.createWindow(18.08, winY, -11, winW, winH, -Math.PI / 2);
  }

  private buildFootpath() {
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xc0b0a0, roughness: 0.85 });
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x9a8a7a, roughness: 0.9 });

    // Main path from front door (x=4.5, z=0) curving out to the "street" (z=8)
    const segments = [
      { x: 4.5, z: 1.0, w: 1.8, d: 2.0 },   // right outside door
      { x: 4.5, z: 3.0, w: 1.6, d: 2.0 },   // middle
      { x: 4.5, z: 5.0, w: 1.4, d: 2.0 },   // further out
      { x: 4.5, z: 7.0, w: 1.3, d: 2.0 },   // approaching street
    ];

    for (const seg of segments) {
      // Path surface
      const pathGeo = new THREE.PlaneGeometry(seg.w, seg.d);
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(seg.x, 0.005, seg.z);
      path.receiveShadow = true;
      this.group.add(path);

      // Path edges (slightly raised stone borders)
      for (const side of [-1, 1]) {
        const edgeGeo = new THREE.BoxGeometry(0.12, 0.06, seg.d);
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.position.set(seg.x + side * (seg.w / 2 + 0.06), 0.03, seg.z);
        edge.receiveShadow = true;
        edge.castShadow = true;
        this.group.add(edge);
      }
    }

    // "Street" at the end — a wider strip
    const streetGeo = new THREE.PlaneGeometry(20, 2.5);
    const streetMat = new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0.9 });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(9, 0.003, 9);
    street.receiveShadow = true;
    this.group.add(street);

    // Sidewalk along street
    const sidewalkGeo = new THREE.PlaneGeometry(22, 1.2);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.85 });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(9, 0.004, 7.9);
    sidewalk.receiveShadow = true;
    this.group.add(sidewalk);

    // Curb
    const curbGeo = new THREE.BoxGeometry(22, 0.1, 0.15);
    const curb = new THREE.Mesh(curbGeo, edgeMat);
    curb.position.set(9, 0.05, 8.5);
    curb.castShadow = true;
    this.group.add(curb);
  }

  getRoomLabels() {
    return this.roomLabels;
  }

  // Sims-style wall culling:
  // - Front-facing walls (between camera and house interior): FULLY invisible
  // - Back-facing walls (behind the view): FULLY opaque, no culling
  // - Side walls: partial transparency
  // - Interior walls: cull only when camera-facing
  updateWallCulling(cameraAngle: number) {
    const angle = ((cameraAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const degrees = (angle * 180) / Math.PI;

    for (const wall of this.walls) {
      const mat = wall.mesh.material as THREE.MeshStandardMaterial;
      let targetOpacity = 1;

      // Determine if this wall faces toward or away from camera
      if (degrees >= 315 || degrees < 45) {
        // Camera looking from south
        if (wall.facing === 'S') targetOpacity = 0; // FULL cull - front facing
        else if (wall.facing === 'N') targetOpacity = 1; // No cull - back wall
        else if (wall.facing === 'W') targetOpacity = wall.exterior ? 0.15 : 0.4;
        else if (wall.facing === 'E') targetOpacity = wall.exterior ? 0.15 : 0.4;
      } else if (degrees >= 45 && degrees < 135) {
        // Camera looking from west
        if (wall.facing === 'W') targetOpacity = 0;
        else if (wall.facing === 'E') targetOpacity = 1;
        else if (wall.facing === 'S') targetOpacity = wall.exterior ? 0.15 : 0.4;
        else if (wall.facing === 'N') targetOpacity = wall.exterior ? 0.15 : 0.4;
      } else if (degrees >= 135 && degrees < 225) {
        // Camera looking from north
        if (wall.facing === 'N') targetOpacity = 0;
        else if (wall.facing === 'S') targetOpacity = 1;
        else if (wall.facing === 'W') targetOpacity = wall.exterior ? 0.15 : 0.4;
        else if (wall.facing === 'E') targetOpacity = wall.exterior ? 0.15 : 0.4;
      } else {
        // Camera looking from east
        if (wall.facing === 'E') targetOpacity = 0;
        else if (wall.facing === 'W') targetOpacity = 1;
        else if (wall.facing === 'S') targetOpacity = wall.exterior ? 0.15 : 0.4;
        else if (wall.facing === 'N') targetOpacity = wall.exterior ? 0.15 : 0.4;
      }

      // Smooth transition with aggressive snap for full cull
      mat.opacity += (targetOpacity - mat.opacity) * 0.15;
      // Snap to 0 when target is 0 (full cull)
      if (targetOpacity === 0 && mat.opacity < 0.1) mat.opacity = 0;
      // Snap to 1 when target is 1 (no cull)
      if (targetOpacity === 1 && mat.opacity > 0.9) mat.opacity = 1;
      wall.mesh.visible = mat.opacity > 0.01;
      mat.transparent = mat.opacity < 1;
      mat.depthWrite = mat.opacity > 0.9;
      mat.needsUpdate = true;
    }
  }
}
