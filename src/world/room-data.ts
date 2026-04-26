/* ═══════════════════════════════════════════════════
   Room Definitions — Visual Data
   Owner: Design agent (Kat)

   Edit colors, dimensions, and floor materials here.
   The house builder (house.ts) reads this data.
   ═══════════════════════════════════════════════════ */

export interface RoomConfig {
  name: string;
  /** Top-left X coordinate */
  x: number;
  /** Top-left Z coordinate (front edge, usually 0 or -8) */
  z: number;
  /** Width along X axis */
  width: number;
  /** Depth along negative Z axis */
  depth: number;
  /** Wall color (hex) */
  wallColor: number;
  /** Floor color (hex) */
  floorColor: number;
  /** Floor roughness (0=shiny, 1=matte). Bathroom tiles are shinier */
  floorRoughness: number;
  /** Floor metalness */
  floorMetalness: number;
  /** Whether to render tile grid lines on the floor */
  tiledFloor: boolean;
  /** Tile grid line color (only if tiledFloor=true) */
  tileLineColor: number;
}

export const ROOM_CONFIGS: RoomConfig[] = [
  {
    name: 'Living Room',
    x: 0, z: 0, width: 10, depth: 8,
    wallColor: 0xf5ece0,      // warm cream
    floorColor: 0xc9a87c,     // rich honey oak
    floorRoughness: 0.65, floorMetalness: 0.03,
    tiledFloor: false, tileLineColor: 0,
  },
  {
    name: 'Kitchen',
    x: 10, z: 0, width: 8, depth: 8,
    wallColor: 0xeef3e5,      // soft sage white
    floorColor: 0xd6c8a8,     // warm sandstone tile
    floorRoughness: 0.4, floorMetalness: 0.08,
    tiledFloor: true, tileLineColor: 0xc4b698,
  },
  {
    name: 'Bedroom 1',
    x: 0, z: -8, width: 5.5, depth: 6,
    wallColor: 0xe4e8f4,      // soft periwinkle
    floorColor: 0xbfab8f,     // warm birch
    floorRoughness: 0.7, floorMetalness: 0.03,
    tiledFloor: false, tileLineColor: 0,
  },
  {
    name: 'Bedroom 2',
    x: 5.5, z: -8, width: 5.5, depth: 6,
    wallColor: 0xf2e4e8,      // dusty rose
    floorColor: 0xc4a882,     // warm maple
    floorRoughness: 0.7, floorMetalness: 0.03,
    tiledFloor: false, tileLineColor: 0,
  },
  {
    name: 'Bedroom 3',
    x: 11, z: -8, width: 4, depth: 6,
    wallColor: 0xf0edd8,      // warm buttercream
    floorColor: 0xc0a880,     // golden oak
    floorRoughness: 0.7, floorMetalness: 0.03,
    tiledFloor: false, tileLineColor: 0,
  },
  {
    name: 'Bathroom',
    x: 15, z: -8, width: 3, depth: 6,
    wallColor: 0xe8f0ef,      // spa mint white
    floorColor: 0xd4d8d6,     // cool marble grey
    floorRoughness: 0.25, floorMetalness: 0.12,
    tiledFloor: true, tileLineColor: 0xbec4c2,
  },
];

/** Wall height in world units */
export const WALL_HEIGHT = 3.2;

/** Wall thickness */
export const WALL_THICKNESS = 0.15;

/** Interior wall color */
export const INTERIOR_WALL_COLOR = 0xede5d8;

/** Ground color (grass) — lush, warm green */
export const GROUND_COLOR = 0x6b9e4a;

/** Patio stone color */
export const PATIO_COLOR = 0xc4b8a4;

/** Footpath color */
export const PATH_COLOR = 0xd4c4ae;

/** Path edge/curb color */
export const PATH_EDGE_COLOR = 0xa89880;

/** Street color */
export const STREET_COLOR = 0x686868;

/** Sidewalk color */
export const SIDEWALK_COLOR = 0xc8c0ae;

/** Roof color — warm terracotta brown */
export const ROOF_COLOR = 0x9a7a58;

/** Roof opacity (0=invisible, 1=opaque) */
export const ROOF_OPACITY = 0.18;

/** Door frame color */
export const DOOR_FRAME_COLOR = 0x8a7460;

/** Window frame color — warm white */
export const WINDOW_FRAME_COLOR = 0xf0ece4;

/** Window glass color — warm sky tint */
export const WINDOW_GLASS_COLOR = 0xb8d8e8;

/** Window glass opacity */
export const WINDOW_GLASS_OPACITY = 0.3;

/** Sky / clear color — golden hour sky */
export const SKY_COLOR = 0x8ecae6;
