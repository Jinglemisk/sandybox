import * as THREE from 'three';
import { Character } from './character';
import { findPath, getRoomAt, getRandomPositionInRoom } from './navigation';
import type { AgentState } from '../state/types';
import type { FurnitureItem } from '../world/furniture';

export type AgentAction = 'idle' | 'walking' | 'sitting' | 'using' | 'chatting';

export class Agent {
  character: Character;
  state: AgentState;

  // Movement
  private path: THREE.Vector3[] = [];
  private pathIndex = 0;
  private moveSpeed = 2.5; // units per second

  // Current action
  action: AgentAction = 'idle';
  private actionTimer = 0;
  private actionDuration = 0;

  // Speech bubble
  currentMessage: string | null = null;
  messageTimer = 0;

  constructor(state: AgentState) {
    this.state = state;
    this.character = new Character(state.name, parseInt(state.color.replace('#', '0x')));
    this.character.setPosition(state.position.x, state.position.z);
  }

  // Set a new target to walk to
  walkTo(x: number, z: number) {
    const pos = this.character.group.position;
    this.path = findPath(pos.x, pos.z, x, z);
    this.pathIndex = 0;
    if (this.path.length > 0) {
      this.action = 'walking';
    }
  }

  // Walk to a random position in a specific room
  walkToRoom(roomName: string) {
    const target = getRandomPositionInRoom(roomName);
    if (target) {
      this.walkTo(target.x, target.z);
    }
  }

  // Start interacting with furniture
  interactWith(item: FurnitureItem) {
    const pos = item.interactionPoint;
    this.walkTo(pos.x, pos.z);
    // After arriving, the update loop will set the appropriate action
    this.pendingInteraction = item;
  }

  private pendingInteraction: FurnitureItem | null = null;

  // Say something (speech bubble)
  say(message: string) {
    this.currentMessage = message;
    this.messageTimer = 5; // Show for 5 seconds
    this.action = 'chatting';
    this.actionTimer = 0;
    this.actionDuration = 3;
  }

  // Perform a timed action
  doAction(actionType: AgentAction, duration: number) {
    this.action = actionType;
    this.actionTimer = 0;
    this.actionDuration = duration;
  }

  update(dt: number, simSpeed: number) {
    const adt = dt * simSpeed;

    // Update message timer
    if (this.messageTimer > 0) {
      this.messageTimer -= adt;
      if (this.messageTimer <= 0) {
        this.currentMessage = null;
      }
    }

    // Movement along path
    if (this.action === 'walking' && this.path.length > 0 && this.pathIndex < this.path.length) {
      const target = this.path[this.pathIndex];
      const pos = this.character.group.position;
      const dx = target.x - pos.x;
      const dz = target.z - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.15) {
        this.pathIndex++;
        if (this.pathIndex >= this.path.length) {
          // Arrived
          this.action = 'idle';
          this.path = [];

          // Handle pending interaction
          if (this.pendingInteraction) {
            if (this.pendingInteraction.interactionType === 'sit') {
              this.doAction('sitting', 10 + Math.random() * 20);
            } else {
              this.doAction('using', 5 + Math.random() * 10);
            }
            this.pendingInteraction = null;
          }
        }
      } else {
        // Move toward target
        const speed = this.moveSpeed * adt;
        const moveX = (dx / dist) * Math.min(speed, dist);
        const moveZ = (dz / dist) * Math.min(speed, dist);
        pos.x += moveX;
        pos.z += moveZ;

        // Face movement direction
        this.character.setRotation(Math.atan2(dx, dz));
        this.character.animateWalk(adt, 1);
      }
    } else if (this.action === 'sitting') {
      this.character.animateSit();
      this.actionTimer += adt;
      if (this.actionTimer >= this.actionDuration) {
        this.action = 'idle';
      }
    } else if (this.action === 'chatting') {
      this.character.animateIdle(adt);
      this.actionTimer += adt;
      if (this.actionTimer >= this.actionDuration) {
        this.action = 'idle';
      }
    } else {
      // Idle
      this.character.animateIdle(adt);
    }

    this.character.update(adt);

    // Update state for JSON sync
    this.state.position.x = this.character.group.position.x;
    this.state.position.z = this.character.group.position.z;
    this.state.action = this.action;
    const room = getRoomAt(this.state.position.x, this.state.position.z);
    this.state.room = room?.name ?? 'Outside';
  }
}
