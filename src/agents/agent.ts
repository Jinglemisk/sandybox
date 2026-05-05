import * as THREE from 'three';
import { Character } from './character';
import { findPath, getRoomAt, getRandomPositionInRoom } from './navigation';
import type { AgentFileState } from '../state/types';
import type { FurnitureItem } from '../world/furniture';

export type AgentAction = 'idle' | 'walking' | 'sitting' | 'using' | 'chatting';

export class Agent {
  character: Character;
  state: AgentFileState;

  // Movement
  private path: THREE.Vector3[] = [];
  private pathIndex = 0;
  private moveSpeed = 2.5;

  // Current action
  action: AgentAction = 'idle';
  private actionTimer = 0;
  private actionDuration = 0;

  // Speech bubble
  currentMessage: string | null = null;
  messageTimer = 0;

  // Pending interaction
  private pendingInteraction: FurnitureItem | null = null;

  constructor(fileState: AgentFileState) {
    this.state = fileState;
    this.character = new Character(fileState.name, parseInt(fileState.color.replace('#', '0x')));
    this.character.setPosition(fileState.position.x, fileState.position.z);
  }

  /** Walk to a specific world position */
  walkTo(x: number, z: number) {
    const pos = this.character.group.position;
    this.path = findPath(pos.x, pos.z, x, z);
    this.pathIndex = 0;
    if (this.path.length > 0) {
      this.action = 'walking';
    }
  }

  /** Walk to a random position in a room */
  walkToRoom(roomName: string) {
    const target = getRandomPositionInRoom(roomName);
    if (target) {
      this.walkTo(target.x, target.z);
    }
  }

  /** Start interacting with furniture */
  interactWith(item: FurnitureItem) {
    const pos = item.interactionPoint;
    this.walkTo(pos.x, pos.z);
    this.pendingInteraction = item;
  }

  /** Say something (speech bubble) */
  say(message: string) {
    this.currentMessage = message;
    this.messageTimer = 5;
    this.action = 'chatting';
    this.actionTimer = 0;
    this.actionDuration = 3;
  }

  /** Perform a timed action */
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
          this.action = 'idle';
          this.path = [];

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
        const speed = this.moveSpeed * adt;
        const moveX = (dx / dist) * Math.min(speed, dist);
        const moveZ = (dz / dist) * Math.min(speed, dist);
        pos.x += moveX;
        pos.z += moveZ;

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
      this.character.animateIdle(adt);
    }

    this.character.update(adt);

    // Sync position back to file state
    this.state.position.x = this.character.group.position.x;
    this.state.position.z = this.character.group.position.z;
    this.state.status.current_action = this.action;
    const room = getRoomAt(this.state.position.x, this.state.position.z);
    this.state.status.room = room?.name ?? 'Outside';
  }
}
