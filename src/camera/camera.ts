import * as THREE from 'three';

export class SimsCamera {
  camera: THREE.PerspectiveCamera;
  // Orbital parameters
  private angle = Math.PI / 4; // Current horizontal angle
  private targetAngle = Math.PI / 4;
  private elevation = Math.PI / 6; // Vertical tilt
  private distance = 24;
  private targetDistance = 24;
  private center = new THREE.Vector3(9, 0, -7);
  private minDist = 10;
  private maxDist = 40;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.updatePosition();
  }

  get horizontalAngle(): number {
    return this.angle;
  }

  rotateLeft() {
    this.targetAngle += Math.PI / 2;
  }

  rotateRight() {
    this.targetAngle -= Math.PI / 2;
  }

  zoomIn() {
    this.targetDistance = Math.max(this.minDist, this.targetDistance - 3);
  }

  zoomOut() {
    this.targetDistance = Math.min(this.maxDist, this.targetDistance + 3);
  }

  handleWheel(delta: number) {
    this.targetDistance = Math.max(
      this.minDist,
      Math.min(this.maxDist, this.targetDistance + delta * 0.01)
    );
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update() {
    // Smooth interpolation
    this.angle += (this.targetAngle - this.angle) * 0.08;
    this.distance += (this.targetDistance - this.distance) * 0.08;
    this.updatePosition();
  }

  private updatePosition() {
    const x = this.center.x + Math.sin(this.angle) * Math.cos(this.elevation) * this.distance;
    const y = Math.sin(this.elevation) * this.distance;
    const z = this.center.z + Math.cos(this.angle) * Math.cos(this.elevation) * this.distance;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.center);
  }

  // Project world position to screen coordinates
  worldToScreen(worldPos: THREE.Vector3, canvas: HTMLCanvasElement): { x: number; y: number } | null {
    const vec = worldPos.clone().project(this.camera);
    if (vec.z > 1) return null; // Behind camera

    return {
      x: (vec.x * 0.5 + 0.5) * canvas.clientWidth,
      y: (-vec.y * 0.5 + 0.5) * canvas.clientHeight,
    };
  }
}
