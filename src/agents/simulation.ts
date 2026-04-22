import { Agent } from './agent';
import { getRandomPositionInRoom } from './navigation';
import type { FurnitureItem } from '../world/furniture';
import type { StateManager } from '../state/stateManager';
import { ROOMS } from '../world/house';

// Pre-defined chat messages for autonomous behavior
const IDLE_CHATS = [
  "Nice weather today!",
  "I wonder what's on TV...",
  "Anyone want to grab a snack?",
  "This place is cozy.",
  "I should redecorate.",
  "What time is it?",
  "I'm feeling energetic!",
  "Let's do something fun.",
  "I love this room.",
  "Hey, how's it going?",
  "Did you hear that?",
  "I'm a bit hungry.",
  "This couch is comfy!",
  "The kitchen smells great.",
  "Time for a nap...",
  "What a lovely house!",
];

const ROOM_NAMES = ROOMS.map(r => r.name);

export class Simulation {
  agents: Agent[] = [];
  private furniture: FurnitureItem[] = [];
  private stateManager: StateManager;
  private decisionTimers: Map<string, number> = new Map();

  constructor(stateManager: StateManager, furniture: FurnitureItem[]) {
    this.stateManager = stateManager;
    this.furniture = furniture;

    // Create agents from state
    for (const agentState of stateManager.getAgents()) {
      const agent = new Agent(agentState);
      this.agents.push(agent);
      this.decisionTimers.set(agentState.id, 2 + Math.random() * 5);
    }
  }

  update(dt: number, simSpeed: number) {
    if (simSpeed === 0) return;

    for (const agent of this.agents) {
      agent.update(dt, simSpeed);

      // Autonomous decision making
      const timerId = agent.state.id;
      let timer = this.decisionTimers.get(timerId) ?? 0;
      timer -= dt * simSpeed;

      if (timer <= 0 && agent.action === 'idle') {
        this.makeDecision(agent);
        // Next decision in 5-15 seconds
        timer = 5 + Math.random() * 10;
      }

      this.decisionTimers.set(timerId, timer);
    }
  }

  private makeDecision(agent: Agent) {
    const roll = Math.random();

    if (roll < 0.35) {
      // Walk to a random room
      const targetRoom = ROOM_NAMES[Math.floor(Math.random() * ROOM_NAMES.length)];
      agent.walkToRoom(targetRoom);
      this.stateManager.addActionEntry(
        agent.state.id,
        agent.state.name,
        'move',
        `walks to ${targetRoom}`
      );
    } else if (roll < 0.55) {
      // Interact with nearby furniture
      const nearbyFurniture = this.findNearbyFurniture(agent, 6);
      if (nearbyFurniture.length > 0) {
        const item = nearbyFurniture[Math.floor(Math.random() * nearbyFurniture.length)];
        agent.interactWith(item);
        this.stateManager.addActionEntry(
          agent.state.id,
          agent.state.name,
          'interact',
          `uses the ${item.name}`
        );
      } else {
        // Wander to random spot
        const pos = getRandomPositionInRoom(agent.state.room);
        if (pos) agent.walkTo(pos.x, pos.z);
      }
    } else if (roll < 0.75) {
      // Chat
      const message = IDLE_CHATS[Math.floor(Math.random() * IDLE_CHATS.length)];
      agent.say(message);
      this.stateManager.addChatMessage(agent.state.id, agent.state.name, message);
    } else {
      // Just idle for a bit
      agent.doAction('idle', 3 + Math.random() * 5);
      const pos = getRandomPositionInRoom(agent.state.room);
      if (pos) agent.walkTo(pos.x, pos.z);
    }
  }

  private findNearbyFurniture(agent: Agent, maxDist: number): FurnitureItem[] {
    const pos = agent.character.group.position;
    return this.furniture.filter(item => {
      if (!item.interactable) return false;
      const dx = item.interactionPoint.x - pos.x;
      const dz = item.interactionPoint.z - pos.z;
      return Math.sqrt(dx * dx + dz * dz) < maxDist;
    });
  }
}
