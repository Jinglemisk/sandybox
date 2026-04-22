import * as THREE from 'three';

// Simple stylized character (Sims-like low-poly person)
export class Character {
  group: THREE.Group;
  private body: THREE.Mesh;
  private head: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private nameSprite: THREE.Sprite;

  // Animation state
  private walkPhase = 0;
  private targetRotation = 0;
  color: number;
  name: string;

  constructor(name: string, color: number) {
    this.name = name;
    this.color = color;
    this.group = new THREE.Group();

    const skinColor = 0xf5c6a0;
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });

    // Body (torso)
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.5, 0.25);
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1.0;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 12, 8);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.45;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair (cap on top of head)
    const hairGeo = new THREE.SphereGeometry(0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: this.darkenColor(color, 0.4), roughness: 0.8 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.47;
    this.group.add(hair);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.03, 6, 4);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.06, 1.47, 0.15);
    this.group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.06, 1.47, 0.15);
    this.group.add(rightEye);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.14, 0.45, 0.14);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a5a7a, roughness: 0.7 });
    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.1, 0.5, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.1, 0.5, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
    this.leftArm = new THREE.Mesh(armGeo, skinMat);
    this.leftArm.position.set(-0.3, 1.0, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, skinMat);
    this.rightArm.position.set(0.3, 1.0, 0);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // Name label sprite
    this.nameSprite = this.createNameSprite(name);
    this.nameSprite.position.y = 1.85;
    this.group.add(this.nameSprite);
  }

  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((color & 0xff) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }

  private createNameSprite(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 28px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(28, 8, 200, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.5, 0.375, 1);
    return sprite;
  }

  setPosition(x: number, z: number) {
    this.group.position.set(x, 0, z);
  }

  setRotation(angle: number) {
    this.targetRotation = angle;
  }

  // Animate walk cycle
  animateWalk(dt: number, speed: number) {
    this.walkPhase += dt * speed * 8;
    const swing = Math.sin(this.walkPhase) * 0.4;

    this.leftLeg.rotation.x = swing;
    this.rightLeg.rotation.x = -swing;
    this.leftArm.rotation.x = -swing * 0.7;
    this.rightArm.rotation.x = swing * 0.7;

    // Slight body bob
    this.body.position.y = 1.0 + Math.abs(Math.sin(this.walkPhase * 2)) * 0.03;
    this.head.position.y = 1.45 + Math.abs(Math.sin(this.walkPhase * 2)) * 0.03;
  }

  // Idle animation
  animateIdle(dt: number) {
    this.walkPhase += dt * 1.5;
    // Subtle breathing motion
    const breathe = Math.sin(this.walkPhase) * 0.01;
    this.body.scale.y = 1 + breathe;
    this.body.position.y = 1.0 + breathe * 2;

    // Reset limbs
    this.leftLeg.rotation.x *= 0.9;
    this.rightLeg.rotation.x *= 0.9;
    this.leftArm.rotation.x *= 0.9;
    this.rightArm.rotation.x *= 0.9;
  }

  // Sitting animation
  animateSit() {
    this.leftLeg.rotation.x = -Math.PI / 2;
    this.rightLeg.rotation.x = -Math.PI / 2;
    this.leftLeg.position.y = 0.5;
    this.rightLeg.position.y = 0.5;
    this.body.position.y = 0.75;
    this.head.position.y = 1.2;
    this.leftArm.rotation.x = -0.3;
    this.rightArm.rotation.x = -0.3;
  }

  update(dt: number) {
    // Smooth rotation
    let diff = this.targetRotation - this.group.rotation.y;
    // Normalize to -PI to PI
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.group.rotation.y += diff * 0.1;
  }

  getHeadWorldPosition(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.head.getWorldPosition(pos);
    return pos;
  }
}
