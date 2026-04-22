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

export const ROOMS: RoomDef[] = [
  { name: 'Living Room', x: 0, z: 0, width: 8, depth: 6, color: 0xe8dcc8, floorColor: 0xc4a882 },
  { name: 'Kitchen', x: 8, z: 0, width: 5, depth: 6, color: 0xd4e8d4, floorColor: 0x8faa8f },
  { name: 'Bedroom 1', x: 0, z: -6, width: 4.5, depth: 4, color: 0xd4d8e8, floorColor: 0x9aa4c4 },
  { name: 'Bedroom 2', x: 4.5, z: -6, width: 4.5, depth: 4, color: 0xe8d4d8, floorColor: 0xc49aa4 },
  { name: 'Bedroom 3', x: 9, z: -6, width: 4, depth: 4, color: 0xe8e4d4, floorColor: 0xc4c0a4 },
];

const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.15;

export interface WallSegment {
  mesh: THREE.Mesh;
  // Which side this wall faces: N, S, E, W
  facing: 'N' | 'S' | 'E' | 'W';
  // Is this an exterior wall?
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
  }

  private buildFloors() {
    for (const room of ROOMS) {
      const geo = new THREE.PlaneGeometry(room.width, room.depth);
      const mat = new THREE.MeshStandardMaterial({
        color: room.floorColor,
        roughness: 0.8,
        metalness: 0.1,
      });
      const floor = new THREE.Mesh(geo, mat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(room.x + room.width / 2, 0.01, room.z - room.depth / 2);
      floor.receiveShadow = true;
      this.group.add(floor);
      this.floors.push(floor);

      // Store label positions
      this.roomLabels.push({
        room,
        worldPos: new THREE.Vector3(room.x + room.width / 2, 0, room.z - room.depth / 2),
      });
    }

    // Ground plane outside the house
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7c4a, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(6.5, -0.01, -2.5);
    ground.receiveShadow = true;
    this.group.add(ground);
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
      roughness: 0.7,
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
    // Build walls for each room - exterior and interior
    for (const room of ROOMS) {
      const left = room.x;
      const right = room.x + room.width;
      const front = room.z;
      const back = room.z - room.depth;

      // South wall (front, facing south / positive Z)
      if (room.z === 0) {
        this.createWall(
          left + room.width / 2, front, room.width, WALL_HEIGHT, 0,
          room.color, 'S', true
        );
      }

      // North wall (back, facing north / negative Z)
      if (room.z - room.depth === -10 || room.z - room.depth === -6) {
        // Only exterior north walls for back rooms
        if (room.z - room.depth === -10) {
          this.createWall(
            left + room.width / 2, back, room.width, WALL_HEIGHT, 0,
            room.color, 'N', true
          );
        }
      }

      // West wall (left side)
      if (room.x === 0) {
        this.createWall(
          left, front - room.depth / 2, room.depth, WALL_HEIGHT, Math.PI / 2,
          room.color, 'W', true
        );
      }

      // East wall (right side) - only for rightmost rooms
      if (right === 13) {
        this.createWall(
          right, front - room.depth / 2, room.depth, WALL_HEIGHT, Math.PI / 2,
          room.color, 'E', true
        );
      }
    }

    // Interior walls - between rooms
    // Wall between living room and kitchen (x=8, z=0 to z=-6)
    this.createWall(8, -3, 6, WALL_HEIGHT, Math.PI / 2, 0xddd8c8, 'E', false);

    // Wall between front rooms and back rooms (z=-6, full width) with doorways
    // Left section (x=0 to x=3)
    this.createWall(1.5, -6, 3, WALL_HEIGHT, 0, 0xddd8c8, 'N', false);
    // Middle section (x=4 to x=8.5)
    this.createWall(6.25, -6, 4.5, WALL_HEIGHT, 0, 0xddd8c8, 'N', false);
    // Right section (x=9.5 to x=13)
    this.createWall(11.25, -6, 3.5, WALL_HEIGHT, 0, 0xddd8c8, 'N', false);

    // Walls between bedrooms
    // Between bedroom 1 and 2 (x=4.5)
    this.createWall(4.5, -8, 4, WALL_HEIGHT, Math.PI / 2, 0xddd8c8, 'E', false);
    // Between bedroom 2 and 3 (x=9)
    this.createWall(9, -8, 4, WALL_HEIGHT, Math.PI / 2, 0xddd8c8, 'E', false);

    // Back wall of bedrooms (z=-10)
    this.createWall(6.5, -10, 13, WALL_HEIGHT, 0, 0xddd8c8, 'N', true);
  }

  private buildRoof() {
    // Simple flat roof slightly above walls
    const roofGeo = new THREE.PlaneGeometry(13.3, 10.3);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = Math.PI / 2;
    roof.position.set(6.5, WALL_HEIGHT + 0.05, -5);
    this.group.add(roof);
  }

  getRoomLabels() {
    return this.roomLabels;
  }

  // Update wall visibility based on camera quadrant for Sims-style culling
  updateWallCulling(cameraAngle: number) {
    // Normalize angle to 0-360
    const angle = ((cameraAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const degrees = (angle * 180) / Math.PI;

    for (const wall of this.walls) {
      const mat = wall.mesh.material as THREE.MeshStandardMaterial;
      let targetOpacity = 1;

      if (!wall.exterior) {
        // Interior walls are always semi-visible
        targetOpacity = 0.6;
      } else {
        // Cull walls that face the camera
        // Camera looking from south (0/360): hide south walls
        // Camera looking from west (90): hide west walls
        // Camera looking from north (180): hide north walls
        // Camera looking from east (270): hide east walls
        if (degrees >= 315 || degrees < 45) {
          // Looking from south
          if (wall.facing === 'S') targetOpacity = 0.08;
          if (wall.facing === 'E') targetOpacity = 0.3;
          if (wall.facing === 'W') targetOpacity = 0.3;
        } else if (degrees >= 45 && degrees < 135) {
          // Looking from west
          if (wall.facing === 'W') targetOpacity = 0.08;
          if (wall.facing === 'S') targetOpacity = 0.3;
          if (wall.facing === 'N') targetOpacity = 0.3;
        } else if (degrees >= 135 && degrees < 225) {
          // Looking from north
          if (wall.facing === 'N') targetOpacity = 0.08;
          if (wall.facing === 'E') targetOpacity = 0.3;
          if (wall.facing === 'W') targetOpacity = 0.3;
        } else {
          // Looking from east
          if (wall.facing === 'E') targetOpacity = 0.08;
          if (wall.facing === 'S') targetOpacity = 0.3;
          if (wall.facing === 'N') targetOpacity = 0.3;
        }
      }

      // Smooth transition
      mat.opacity += (targetOpacity - mat.opacity) * 0.1;
      mat.transparent = true;
      mat.needsUpdate = true;
    }
  }
}
