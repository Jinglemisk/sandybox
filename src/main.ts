import * as THREE from 'three';
import './styles.css';
import { House, SKY_COLOR } from './world/house';
import { createFurniture } from './world/furniture';
import { ROOMS } from './world/house';
import { SimsCamera } from './camera/camera';
import { StateManager } from './state/stateManager';
import { Simulation } from './agents/simulation';
import { ActivityLog } from './ui/activityLog';
import { SpeechBubbleManager } from './ui/speechBubbles';
import { DebugPanel } from './ui/debugPanel';

// ── Setup ──────────────────────────────────────────────

const app = document.getElementById('app')!;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(SKY_COLOR);
app.insertBefore(renderer.domElement, app.firstChild);

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(SKY_COLOR, 25, 50);

// Camera
const simsCamera = new SimsCamera(window.innerWidth / window.innerHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.2);
sunLight.position.set(15, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 60;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0xa0c0ff, 0.3);
fillLight.position.set(-5, 8, -5);
scene.add(fillLight);

// ── World ──────────────────────────────────────────────

const house = new House();
scene.add(house.group);

const furnitureItems = createFurniture(ROOMS);
const furnitureGroup = new THREE.Group();
for (const item of furnitureItems) {
  furnitureGroup.add(item.mesh);
}
scene.add(furnitureGroup);

// ── State & Agents ─────────────────────────────────────

const stateManager = new StateManager();
const simulation = new Simulation(stateManager, furnitureItems, scene);

// ── UI ─────────────────────────────────────────────────

const activityLog = new ActivityLog();
const speechBubbles = new SpeechBubbleManager(renderer.domElement, simsCamera);
const _debugPanel = new DebugPanel(simulation, simsCamera, stateManager, furnitureItems);

// Simulation speed
let simSpeed = 1;

// Camera controls
document.getElementById('rotate-left')!.addEventListener('click', () => simsCamera.rotateLeft());
document.getElementById('rotate-right')!.addEventListener('click', () => simsCamera.rotateRight());
document.getElementById('zoom-in')!.addEventListener('click', () => simsCamera.zoomIn());
document.getElementById('zoom-out')!.addEventListener('click', () => simsCamera.zoomOut());

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'q': case 'Q': simsCamera.rotateLeft(); break;
    case 'e': case 'E': simsCamera.rotateRight(); break;
    case '+': case '=': simsCamera.zoomIn(); break;
    case '-': case '_': simsCamera.zoomOut(); break;
  }
});

// Mouse wheel zoom
renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  simsCamera.handleWheel(e.deltaY);
}, { passive: false });

// Speed controls
document.querySelectorAll('#speed-controls button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const speed = parseInt((btn as HTMLButtonElement).dataset.speed ?? '1');
    simSpeed = speed;
    document.querySelectorAll('#speed-controls button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Game Loop ──────────────────────────────────────────

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  // Update simulation
  simulation.update(dt, simSpeed);

  // Update camera
  simsCamera.update();

  // Wall culling based on camera angle
  house.updateWallCulling(simsCamera.horizontalAngle);

  // Update UI
  activityLog.update(stateManager.getActionLog());
  speechBubbles.update(simulation.agents);

  // Render
  renderer.render(scene, simsCamera.camera);
}

// ── Resize ─────────────────────────────────────────────

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  simsCamera.resize(window.innerWidth / window.innerHeight);
});

// ── Start ──────────────────────────────────────────────

stateManager.addActionEntry('system', 'System', 'action', 'Sandbox world initialized');
animate();
console.log('sandybox initialized — polling agent state files');
