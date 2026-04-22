import * as THREE from 'three';
import type { RoomDef } from '../world/house';
import { ROOMS } from '../world/house';

// Simple grid-based navigation
// The house spans x: 0-13, z: 0 to -10
// Grid cells are 0.5 units

const GRID_SIZE = 0.5;
const GRID_MIN_X = -1;
const GRID_MAX_X = 14;
const GRID_MIN_Z = -11;
const GRID_MAX_Z = 1;

const COLS = Math.ceil((GRID_MAX_X - GRID_MIN_X) / GRID_SIZE);
const ROWS = Math.ceil((GRID_MAX_Z - GRID_MIN_Z) / GRID_SIZE);

// Walkability grid
const grid: boolean[][] = [];

function initGrid() {
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      const x = GRID_MIN_X + c * GRID_SIZE + GRID_SIZE / 2;
      const z = GRID_MIN_Z + r * GRID_SIZE + GRID_SIZE / 2;
      grid[r][c] = isInsideHouse(x, z);
    }
  }
}

function isInsideHouse(x: number, z: number): boolean {
  // Check if the point is inside any room with some wall margin
  const margin = 0.3;
  for (const room of ROOMS) {
    if (
      x >= room.x + margin &&
      x <= room.x + room.width - margin &&
      z <= room.z - margin &&
      z >= room.z - room.depth + margin
    ) {
      return true;
    }
  }
  return false;
}

// Convert world coords to grid coords
function worldToGrid(x: number, z: number): [number, number] {
  const c = Math.floor((x - GRID_MIN_X) / GRID_SIZE);
  const r = Math.floor((z - GRID_MIN_Z) / GRID_SIZE);
  return [Math.max(0, Math.min(COLS - 1, c)), Math.max(0, Math.min(ROWS - 1, r))];
}

function gridToWorld(c: number, r: number): [number, number] {
  return [
    GRID_MIN_X + c * GRID_SIZE + GRID_SIZE / 2,
    GRID_MIN_Z + r * GRID_SIZE + GRID_SIZE / 2,
  ];
}

interface AStarNode {
  c: number;
  r: number;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

// A* pathfinding
export function findPath(
  startX: number, startZ: number,
  endX: number, endZ: number
): THREE.Vector3[] {
  if (grid.length === 0) initGrid();

  const [sc, sr] = worldToGrid(startX, startZ);
  const [ec, er] = worldToGrid(endX, endZ);

  if (!grid[er]?.[ec]) {
    // Target not walkable, find nearest walkable
    return [];
  }

  const open: AStarNode[] = [];
  const closed = new Set<string>();
  const key = (c: number, r: number) => `${c},${r}`;

  open.push({ c: sc, r: sr, g: 0, h: heuristic(sc, sr, ec, er), f: heuristic(sc, sr, ec, er), parent: null });

  while (open.length > 0) {
    // Find lowest f
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;

    if (current.c === ec && current.r === er) {
      // Reconstruct path
      const path: THREE.Vector3[] = [];
      let node: AStarNode | null = current;
      while (node) {
        const [wx, wz] = gridToWorld(node.c, node.r);
        path.unshift(new THREE.Vector3(wx, 0, wz));
        node = node.parent;
      }
      return simplifyPath(path);
    }

    closed.add(key(current.c, current.r));

    // Check 8 neighbors
    for (const [dc, dr] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      const nc = current.c + dc;
      const nr = current.r + dr;

      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      if (!grid[nr]?.[nc]) continue;
      if (closed.has(key(nc, nr))) continue;

      // Diagonal cost
      const moveCost = (dc !== 0 && dr !== 0) ? 1.414 : 1;
      const g = current.g + moveCost;
      const h = heuristic(nc, nr, ec, er);

      const existing = open.find(n => n.c === nc && n.r === nr);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = g + h;
          existing.parent = current;
        }
      } else {
        open.push({ c: nc, r: nr, g, h, f: g + h, parent: current });
      }
    }
  }

  return []; // No path found
}

function heuristic(c1: number, r1: number, c2: number, r2: number): number {
  return Math.sqrt((c1 - c2) ** 2 + (r1 - r2) ** 2);
}

// Simplify path by removing collinear points
function simplifyPath(path: THREE.Vector3[]): THREE.Vector3[] {
  if (path.length <= 2) return path;

  const simplified: THREE.Vector3[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dx1 = curr.x - prev.x;
    const dz1 = curr.z - prev.z;
    const dx2 = next.x - curr.x;
    const dz2 = next.z - curr.z;

    // If direction changes, keep the point
    if (Math.abs(dx1 - dx2) > 0.01 || Math.abs(dz1 - dz2) > 0.01) {
      simplified.push(curr);
    }
  }
  simplified.push(path[path.length - 1]);
  return simplified;
}

// Get a random walkable position within a specific room
export function getRandomPositionInRoom(roomName: string): THREE.Vector3 | null {
  const room = ROOMS.find(r => r.name === roomName);
  if (!room) return null;

  const margin = 0.5;
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = room.x + margin + Math.random() * (room.width - margin * 2);
    const z = room.z - margin - Math.random() * (room.depth - margin * 2);
    if (isInsideHouse(x, z)) {
      return new THREE.Vector3(x, 0, z);
    }
  }
  // Fallback: center of room
  return new THREE.Vector3(room.x + room.width / 2, 0, room.z - room.depth / 2);
}

// Get which room a position is in
export function getRoomAt(x: number, z: number): RoomDef | null {
  for (const room of ROOMS) {
    if (
      x >= room.x &&
      x <= room.x + room.width &&
      z <= room.z &&
      z >= room.z - room.depth
    ) {
      return room;
    }
  }
  return null;
}
