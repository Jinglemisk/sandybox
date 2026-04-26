/* ═══════════════════════════════════════════════════
   Furniture Definitions — Visual Data
   Owner: Design agent (Kat)

   Edit colors, dimensions, and positions here.
   The furniture builder (furniture.ts) reads this data.
   ═══════════════════════════════════════════════════ */

// ── Color Palette ──

export const COLORS = {
  // Couch / seating — deep navy blue, inviting
  couchSeat: 0x3d5a80,
  couchBack: 0x2c4a6e,
  couchCushion: 0x4d6a90,
  armchairSeat: 0x8b6642,     // warm cognac leather
  armchairBack: 0x7a5835,
  armchairCushion: 0x9c7752,

  // Wood tones — richer, warmer
  woodLight: 0xa08060,
  woodMedium: 0x8a6c4e,
  woodDark: 0x6e5438,
  woodDarkest: 0x5a4430,
  woodTableTop: 0xb08858,

  // Legs / metal — warmer greys
  legDark: 0x3a3530,
  metalLight: 0x9a9490,
  metalMed: 0xb0aaa5,
  metalDark: 0x605854,
  metalChrome: 0xc8c2bc,

  // Kitchen — clean, modern
  counterBody: 0xddd2c4,
  counterTop: 0x8a8580,
  stoveBody: 0xd0ccc8,
  stoveTop: 0x2a2825,
  stoveBurner: 0x4a4540,
  fridgeBody: 0xd8d4d0,
  fridgeHandle: 0xa09a95,

  // Bed — cozy
  bedFrame: 0x8a6c4e,
  bedHeadboard: 0x6e5438,
  blanketFold: 0xd4ccc0,
  pillow: 0xf8f4ee,

  // Bookshelf — rich dark wood
  bookshelfFrame: 0x5e4832,
  bookshelfShelf: 0x6e5840,
  bookColors: [0xc04040, 0x3860a8, 0x408a48, 0xc89830, 0x7848a0, 0xb06838, 0x388888],

  // Plants — lusher greens
  potTerracotta: 0xc07850,
  potLarge: 0xb06840,
  soil: 0x4a3828,
  leafGreen: 0x48964a,
  leafDark: 0x387838,
  trunkBrown: 0x6e5838,

  // Flowers — vibrant garden mix
  flowerColors: [0xe85888, 0xf0a040, 0xe84060, 0xf0c050, 0xd070e8, 0xf08040, 0x60b0d8, 0xf06888],
  flowerStem: 0x48a048,
  flowerLeaf: 0x50a850,
  flowerSoil: 0x4a3828,

  // Bathroom — clean spa feel
  porcelain: 0xf4f2f0,
  porcelainLight: 0xeceae8,
  basinWhite: 0xe8e6e4,
  showerGlass: 0xc8e0ec,
  towelCream: 0xf0e8dc,
  mirrorFrame: 0x686260,
  mirrorGlass: 0xc8d8e4,

  // TV
  tvBlack: 0x141210,
  tvScreen: 0x1a2840,
  tvCabinetDoor: 0x5a4430,

  // Lamp shades — warm glow
  lampShadeWarm: 0xfce8a0,
  lampShadeSoft: 0xf4e4c0,
  lampLightColor: 0xfce0a0,

  // Wall art — warmer, curated gallery
  artColors: [0x88b0cc, 0xd4a078, 0xa0c888, 0xd4c078, 0xc488b0],

  // Rugs — richer, more personality
  rugLiving: 0x9a6e52,        // warm terracotta
  rugBedroom1: 0x7088a8,      // soft denim blue
  rugBedroom2: 0xb08878,      // dusty rose
  rugBedroom3: 0x88a880,      // sage green
  rugBathMat: 0x90b8b0,       // spa teal

  // Laptop
  laptopBase: 0x383430,
  laptopScreen: 0x282420,
  laptopDisplay: 0x2a3a58,

  // Outdoor — cheerful
  mailboxBody: 0x3872b0,
  mailboxLid: 0x2860a0,
  mailboxFlag: 0xd03828,
  trashBody: 0x585450,
  trashLid: 0x686460,

  // Chair — warm wood
  chairSeat: 0x9a7450,
  chairBack: 0x886440,

  // Desk
  deskSurface: 0x9a7e60,
  monitorBlack: 0x242220,
  monitorStand: 0x383430,
  keyboard: 0x484440,

  // Dresser — rich wood
  dresserBody: 0x7a6248,
  dresserTop: 0x6a5238,
  dresserDrawer: 0x8a7258,
  drawerHandle: 0xb8a878,

  // Nightstand
  nightstandBody: 0x7a6248,

  // Bench — weathered wood
  benchSeat: 0x8a7458,
  benchBack: 0x7a6448,

  // Skin
  skinTone: 0xf0c8a0,
};

// ── Room-specific bed sheet colors ──
export const BED_SHEET_COLORS: Record<string, number> = {
  'Bedroom 1': 0xb0c0dc,     // soft sky blue
  'Bedroom 2': 0xe0bcc0,     // blush pink
  'Bedroom 3': 0xd0dcc0,     // sage cream
};

// ── Furniture Placement Data ──

export interface FurniturePlacement {
  type: string;        // factory function name
  name: string;        // display name
  room: string;
  x: number;
  z: number;
  rotationY?: number;
  interactable: boolean;
  interactionX: number;
  interactionZ: number;
  interactionType: 'sit' | 'use' | 'look';
  /** Extra data (e.g., bed sheet color, table dimensions) */
  params?: Record<string, number | string>;
}

export const FURNITURE_PLACEMENTS: FurniturePlacement[] = [
  // ═══ LIVING ROOM ═══
  { type: 'couch', name: 'Couch', room: 'Living Room', x: 5, z: -4.5, interactable: true, interactionX: 5, interactionZ: -4, interactionType: 'sit' },
  { type: 'armchair', name: 'Armchair', room: 'Living Room', x: 2, z: -3.5, rotationY: -Math.PI / 6, interactable: true, interactionX: 2.5, interactionZ: -3, interactionType: 'sit' },
  { type: 'table', name: 'Coffee Table', room: 'Living Room', x: 5, z: -3.2, interactable: false, interactionX: 5, interactionZ: -2.6, interactionType: 'use', params: { w: 1.4, d: 0.7, h: 0.4 } },
  { type: 'tv', name: 'TV', room: 'Living Room', x: 5, z: -1.5, rotationY: Math.PI, interactable: true, interactionX: 5, interactionZ: -3, interactionType: 'look' },
  { type: 'bookshelf', name: 'Bookshelf', room: 'Living Room', x: 0.5, z: -5, interactable: true, interactionX: 1.2, interactionZ: -5, interactionType: 'use' },
  { type: 'lamp', name: 'Floor Lamp', room: 'Living Room', x: 1.2, z: -2, interactable: false, interactionX: 1.8, interactionZ: -2, interactionType: 'use' },
  { type: 'rug', name: 'Rug', room: 'Living Room', x: 5, z: -3.8, interactable: false, interactionX: 5, interactionZ: -3.8, interactionType: 'use', params: { w: 4.5, d: 3 } },
  { type: 'tallPlant', name: 'Plant', room: 'Living Room', x: 8.5, z: -7, interactable: false, interactionX: 8, interactionZ: -6.5, interactionType: 'look' },
  { type: 'wallArt', name: 'Wall Art', room: 'Living Room', x: 0.12, z: -3, rotationY: Math.PI / 2, interactable: false, interactionX: 1, interactionZ: -3, interactionType: 'look', params: { y: 1.8, w: 1.2, h: 0.8 } },
  { type: 'table', name: 'Side Table', room: 'Living Room', x: 7.5, z: -4.5, interactable: false, interactionX: 7.5, interactionZ: -4, interactionType: 'use', params: { w: 0.5, d: 0.5, h: 0.5 } },
  { type: 'tableLamp', name: 'Table Lamp', room: 'Living Room', x: 7.5, z: -4.5, interactable: false, interactionX: 7.5, interactionZ: -4, interactionType: 'use', params: { y: 0.55 } },

  // ═══ KITCHEN ═══
  { type: 'kitchenCounter', name: 'Kitchen Counter', room: 'Kitchen', x: 14, z: -7.3, interactable: true, interactionX: 14, interactionZ: -6.3, interactionType: 'use' },
  { type: 'stove', name: 'Stove', room: 'Kitchen', x: 16.5, z: -7.3, interactable: true, interactionX: 16.5, interactionZ: -6.3, interactionType: 'use' },
  { type: 'sink', name: 'Sink', room: 'Kitchen', x: 11.5, z: -7.3, interactable: true, interactionX: 11.5, interactionZ: -6.3, interactionType: 'use' },
  { type: 'fridge', name: 'Fridge', room: 'Kitchen', x: 17.3, z: -5.5, interactable: true, interactionX: 16.5, interactionZ: -5.5, interactionType: 'use' },
  { type: 'table', name: 'Dining Table', room: 'Kitchen', x: 13, z: -3.5, interactable: true, interactionX: 13, interactionZ: -2.5, interactionType: 'sit', params: { w: 1.6, d: 1.2, h: 0.75 } },
  { type: 'chair', name: 'Chair', room: 'Kitchen', x: 13.8, z: -3.5, rotationY: Math.PI / 2, interactable: true, interactionX: 13.8, interactionZ: -3.5, interactionType: 'sit' },
  { type: 'chair', name: 'Chair', room: 'Kitchen', x: 12.2, z: -3.5, rotationY: -Math.PI / 2, interactable: true, interactionX: 12.2, interactionZ: -3.5, interactionType: 'sit' },
  { type: 'chair', name: 'Chair', room: 'Kitchen', x: 13, z: -2.7, rotationY: 0, interactable: true, interactionX: 13, interactionZ: -2.7, interactionType: 'sit' },
  { type: 'chair', name: 'Chair', room: 'Kitchen', x: 13, z: -4.3, rotationY: Math.PI, interactable: true, interactionX: 13, interactionZ: -4.3, interactionType: 'sit' },
  { type: 'plant', name: 'Kitchen Plant', room: 'Kitchen', x: 10.5, z: -7.3, interactable: false, interactionX: 10.5, interactionZ: -6.5, interactionType: 'look', params: { y: 0.95 } },
  { type: 'shelf', name: 'Kitchen Shelf', room: 'Kitchen', x: 14, z: -7.7, interactable: false, interactionX: 14, interactionZ: -7, interactionType: 'look', params: { y: 1.5 } },
  { type: 'laptop', name: 'Laptop', room: 'Kitchen', x: 13.5, z: -3.8, interactable: true, interactionX: 13.5, interactionZ: -3, interactionType: 'use', params: { y: 0.8 } },

  // ═══ BEDROOM 1 ═══
  { type: 'bed', name: 'Bed', room: 'Bedroom 1', x: 1.8, z: -11.5, interactable: true, interactionX: 3.2, interactionZ: -11.5, interactionType: 'sit' },
  { type: 'nightstand', name: 'Nightstand', room: 'Bedroom 1', x: 3.2, z: -12.5, interactable: false, interactionX: 3.2, interactionZ: -12, interactionType: 'use' },
  { type: 'tableLamp', name: 'Bedside Lamp', room: 'Bedroom 1', x: 3.2, z: -12.5, interactable: false, interactionX: 3.2, interactionZ: -12, interactionType: 'use', params: { y: 0.58 } },
  { type: 'dresser', name: 'Dresser', room: 'Bedroom 1', x: 4.3, z: -9, interactable: true, interactionX: 4.3, interactionZ: -9.8, interactionType: 'use' },
  { type: 'rug', name: 'Bedroom Rug', room: 'Bedroom 1', x: 2, z: -10, interactable: false, interactionX: 2, interactionZ: -10, interactionType: 'use', params: { w: 2.2, d: 1.8 } },
  { type: 'wallArt', name: 'Wall Art', room: 'Bedroom 1', x: 1.8, z: -13.88, interactable: false, interactionX: 1.8, interactionZ: -13, interactionType: 'look', params: { y: 2, w: 0.8, h: 0.6 } },

  // ═══ BEDROOM 2 ═══
  { type: 'bed', name: 'Bed', room: 'Bedroom 2', x: 7.3, z: -11.5, interactable: true, interactionX: 8.7, interactionZ: -11.5, interactionType: 'sit' },
  { type: 'nightstand', name: 'Nightstand', room: 'Bedroom 2', x: 8.7, z: -12.5, interactable: false, interactionX: 8.7, interactionZ: -12, interactionType: 'use' },
  { type: 'desk', name: 'Desk', room: 'Bedroom 2', x: 9.8, z: -9.5, rotationY: Math.PI, interactable: true, interactionX: 9.8, interactionZ: -10.2, interactionType: 'use' },
  { type: 'chair', name: 'Desk Chair', room: 'Bedroom 2', x: 9.8, z: -10.2, interactable: true, interactionX: 9.8, interactionZ: -10.2, interactionType: 'sit' },
  { type: 'plant', name: 'Plant', room: 'Bedroom 2', x: 6, z: -13, interactable: false, interactionX: 6.5, interactionZ: -13, interactionType: 'look' },
  { type: 'rug', name: 'Bedroom Rug', room: 'Bedroom 2', x: 7.5, z: -10, interactable: false, interactionX: 7.5, interactionZ: -10, interactionType: 'use', params: { w: 2.2, d: 1.8 } },

  // ═══ BEDROOM 3 ═══
  { type: 'bed', name: 'Bed', room: 'Bedroom 3', x: 12.5, z: -11.5, interactable: true, interactionX: 14, interactionZ: -11.5, interactionType: 'sit' },
  { type: 'nightstand', name: 'Nightstand', room: 'Bedroom 3', x: 14, z: -12.5, interactable: false, interactionX: 14, interactionZ: -12, interactionType: 'use' },
  { type: 'tableLamp', name: 'Bedside Lamp', room: 'Bedroom 3', x: 14, z: -12.5, interactable: false, interactionX: 14, interactionZ: -12, interactionType: 'use', params: { y: 0.58 } },
  { type: 'dresser', name: 'Dresser', room: 'Bedroom 3', x: 11.6, z: -9.2, interactable: true, interactionX: 11.6, interactionZ: -10, interactionType: 'use' },
  { type: 'rug', name: 'Bedroom Rug', room: 'Bedroom 3', x: 13, z: -10, interactable: false, interactionX: 13, interactionZ: -10, interactionType: 'use', params: { w: 2, d: 1.8 } },

  // ═══ BATHROOM ═══
  { type: 'toilet', name: 'Toilet', room: 'Bathroom', x: 17.2, z: -12.5, interactable: true, interactionX: 16.5, interactionZ: -12.5, interactionType: 'use' },
  { type: 'shower', name: 'Shower', room: 'Bathroom', x: 16.5, z: -9.5, interactable: true, interactionX: 15.8, interactionZ: -9.5, interactionType: 'use' },
  { type: 'bathroomSink', name: 'Bathroom Sink', room: 'Bathroom', x: 15.6, z: -13.2, interactable: true, interactionX: 15.6, interactionZ: -12.5, interactionType: 'use' },
  { type: 'rug', name: 'Bath Mat', room: 'Bathroom', x: 15.6, z: -12.5, interactable: false, interactionX: 15.6, interactionZ: -12.5, interactionType: 'use', params: { w: 0.8, d: 0.5 } },
  { type: 'towelRack', name: 'Towel Rack', room: 'Bathroom', x: 17.4, z: -10.5, interactable: false, interactionX: 17, interactionZ: -10.5, interactionType: 'use', params: { y: 1.3 } },
  { type: 'plant', name: 'Plant', room: 'Bathroom', x: 15.3, z: -9, interactable: false, interactionX: 15.5, interactionZ: -9.5, interactionType: 'look' },

  // ═══ OUTDOOR ═══
  { type: 'bench', name: 'Porch Bench', room: 'Living Room', x: 7, z: 0.8, interactable: true, interactionX: 7, interactionZ: 1.3, interactionType: 'sit' },
  { type: 'mailbox', name: 'Mailbox', room: 'Living Room', x: 4.5, z: 7.5, interactable: true, interactionX: 4.5, interactionZ: 7, interactionType: 'use' },
  { type: 'trashcan', name: 'Trash Can', room: 'Living Room', x: 6.5, z: 0.5, interactable: true, interactionX: 6, interactionZ: 0.5, interactionType: 'use' },
];

// ── Flower bed placements ──
export interface FlowerBedPlacement {
  x: number;
  z: number;
  orientation: 'horizontal' | 'vertical';
}

export const FLOWER_BEDS: FlowerBedPlacement[] = [
  // Front wall (horizontal)
  { x: 1.5, z: 0.6, orientation: 'horizontal' },
  { x: 8, z: 0.6, orientation: 'horizontal' },
  { x: 14, z: 0.6, orientation: 'horizontal' },
  { x: 16, z: 0.6, orientation: 'horizontal' },
  // West wall (vertical)
  { x: -0.6, z: -2, orientation: 'vertical' },
  { x: -0.6, z: -5, orientation: 'vertical' },
  { x: -0.6, z: -10, orientation: 'vertical' },
];
