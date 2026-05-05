import * as THREE from 'three';
import { Agent } from './agent';
import { getRandomPositionInRoom } from './navigation';
import type { FurnitureItem } from '../world/furniture';
import type { StateManager } from '../state/stateManager';
import type { AgentFileState } from '../state/types';
import { ROOMS } from '../world/house';

// Pre-defined chat messages for autopilot behavior
const IDLE_CHATS = [
  "Nice weather today!", "I wonder what's on TV...", "Anyone want to grab a snack?",
  "This place is cozy.", "I should redecorate.", "What time is it?",
  "I'm feeling energetic!", "Let's do something fun.", "I love this room.",
  "Hey, how's it going?", "Did you hear that?", "I'm a bit hungry.",
  "This couch is comfy!", "The kitchen smells great.", "Time for a nap...",
  "What a lovely house!", "The flowers outside look beautiful!",
  "Should I check the mail?", "I need a shower...", "Who left the laptop open?",
];

export const BOOK_TITLES = [
  "The Art of War", "Pride and Prejudice", "1984", "The Great Gatsby",
  "To Kill a Mockingbird", "Dune", "Brave New World",
  "The Hitchhiker's Guide to the Galaxy", "Sapiens: A Brief History",
  "Thinking, Fast and Slow", "The Design of Everyday Things",
  "Zen and the Art of Motorcycle Maintenance", "Meditations by Marcus Aurelius",
  "The Little Prince", "Cat's Cradle", "Neuromancer", "Foundation",
  "The Catcher in the Rye",
];

const ROOM_NAMES = ROOMS.map(r => r.name);

export class Simulation {
  agents: Agent[] = [];
  private agentMap: Map<string, Agent> = new Map();
  private furniture: FurnitureItem[] = [];
  private stateManager: StateManager;
  private decisionTimers: Map<string, number> = new Map();
  private scene: THREE.Scene;
  private writebackTimer = 0;

  /** Called when a new agent is dynamically spawned */
  onAgentSpawned: ((agent: Agent) => void) | null = null;

  constructor(stateManager: StateManager, furniture: FurnitureItem[], scene: THREE.Scene) {
    this.stateManager = stateManager;
    this.furniture = furniture;
    this.scene = scene;

    // Start polling and handle new agents
    stateManager.startPolling(300, (agents) => this.syncAgents(agents));
  }

  /** Sync agents from file state — spawn new ones, handle removal */
  private syncAgents(fileStates: AgentFileState[]) {
    for (const fileState of fileStates) {
      if (!this.agentMap.has(fileState.id)) {
        this.spawnAgent(fileState);
      }
    }
  }

  /** Spawn a new agent from its file state */
  private spawnAgent(fileState: AgentFileState) {
    const agent = new Agent(fileState);
    this.agents.push(agent);
    this.agentMap.set(fileState.id, agent);
    this.decisionTimers.set(fileState.id, 2 + Math.random() * 5);

    // Add to scene
    this.scene.add(agent.character.group);

    // Log it
    this.stateManager.addActionEntry(
      fileState.id, fileState.name, 'action',
      `appears in ${fileState.status.room}`
    );

    this.onAgentSpawned?.(agent);
  }

  update(dt: number, simSpeed: number) {
    if (simSpeed === 0) return;

    // Process each agent
    for (const agent of this.agents) {
      // Check for new intents from file state (for externally-driven agents)
      const fileState = this.stateManager.getAgentFileState(agent.state.id);
      if (fileState && !fileState.autopilot) {
        this.processFileIntent(agent, fileState);
      }

      // Autopilot agents make their own decisions
      if (fileState?.autopilot || agent.state.autopilot) {
        const timerId = agent.state.id;
        let timer = this.decisionTimers.get(timerId) ?? 0;
        timer -= dt * simSpeed;

        if (timer <= 0 && agent.action === 'idle') {
          this.makeDecision(agent);
          timer = 2 + Math.random() * 4;
        }

        this.decisionTimers.set(timerId, timer);
      }

      agent.update(dt, simSpeed);
    }

    // Write renderer state back to files periodically
    this.writebackTimer += dt;
    if (this.writebackTimer >= 0.5) {
      this.writebackTimer = 0;
      this.writebackAgentStates();
    }
  }

  /** Process an intent written to an agent's file by an external agent */
  private processFileIntent(agent: Agent, fileState: AgentFileState) {
    if (!fileState.intent) return;

    const intent = fileState.intent;

    switch (intent) {
      case 'walk': {
        if (fileState.targetPosition) {
          agent.walkTo(fileState.targetPosition.x, fileState.targetPosition.z);
          this.stateManager.addActionEntry(
            agent.state.id, agent.state.name, 'move',
            `walks to (${fileState.targetPosition.x.toFixed(1)}, ${fileState.targetPosition.z.toFixed(1)})`
          );
        } else if (fileState.message) {
          // message can contain a room name for convenience
          const roomName = fileState.message;
          if (ROOM_NAMES.includes(roomName)) {
            agent.walkToRoom(roomName);
            this.stateManager.addActionEntry(
              agent.state.id, agent.state.name, 'move',
              `walks to ${roomName}`
            );
          } else {
            agent.state.status.last_error = `Unknown room: "${roomName}". Available: ${ROOM_NAMES.join(', ')}`;
          }
        }
        break;
      }
      case 'say': {
        if (fileState.message) {
          agent.say(fileState.message);
          this.stateManager.addChatMessage(agent.state.id, agent.state.name, fileState.message);
        }
        break;
      }
      case 'sit': {
        const seat = this.findFurnitureByType(agent, ['Couch', 'Armchair', 'Chair', 'Porch Bench', 'Bed'], 15);
        if (seat) {
          agent.interactWith(seat);
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `sits on ${seat.name}`);
        } else {
          agent.state.status.last_error = 'No seating found nearby';
        }
        break;
      }
      case 'read': {
        const book = fileState.message || BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)];
        const bookshelf = this.findFurnitureByType(agent, ['Bookshelf'], 15);
        if (bookshelf) agent.interactWith(bookshelf);
        agent.say(`📖 Reading "${book}"`);
        agent.doAction('using', 8 + Math.random() * 12);
        this.stateManager.addChatMessage(agent.state.id, agent.state.name, `📖 Reading "${book}"`);
        break;
      }
      case 'cook': {
        const stove = this.findFurnitureByType(agent, ['Stove', 'Kitchen Counter'], 15);
        if (stove) {
          agent.interactWith(stove);
          agent.say('🍳 Time to cook!');
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', 'starts cooking');
        } else {
          agent.state.status.last_error = 'No stove or counter nearby. Try walking to Kitchen first.';
        }
        break;
      }
      case 'use-laptop': {
        const laptop = this.findFurnitureByType(agent, ['Laptop', 'Desk'], 15);
        if (laptop) {
          agent.interactWith(laptop);
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', 'uses the laptop');
        } else {
          agent.state.status.last_error = 'No laptop or desk nearby';
        }
        break;
      }
      case 'sleep': {
        const bed = this.findFurnitureByType(agent, ['Bed'], 15);
        if (bed) {
          agent.interactWith(bed);
          agent.say('💤 Goodnight...');
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'action', 'goes to sleep');
        } else {
          agent.state.status.last_error = 'No bed nearby. Try walking to a bedroom first.';
        }
        break;
      }
      case 'shower': {
        const shower = this.findFurnitureByType(agent, ['Shower'], 15);
        if (shower) {
          agent.interactWith(shower);
          this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', 'takes a shower');
        } else {
          agent.state.status.last_error = 'No shower nearby. Try walking to Bathroom first.';
        }
        break;
      }
      case 'idle': {
        agent.doAction('idle', 0);
        break;
      }
      default: {
        agent.state.status.last_error = `Unknown intent: "${intent}". Valid: walk, say, sit, read, cook, use-laptop, sleep, shower, idle`;
      }
    }

    // Clear the intent after processing
    this.stateManager.clearIntent(agent.state.id);
  }

  /** Write renderer-owned state back to agent files */
  private writebackAgentStates() {
    for (const agent of this.agents) {
      const nearby = this.findNearbyFurniture(agent, 6).map(f => f.name);
      agent.state.status.nearby_objects = nearby;
      agent.state.status.timestamp = Date.now();

      this.stateManager.writeRendererState(agent.state.id, {
        position: agent.state.position,
        status: agent.state.status,
      } as any);
    }
  }

  /** Autopilot decision making (same as before) */
  private makeDecision(agent: Agent) {
    const roll = Math.random();

    if (roll < 0.4) {
      const targetRoom = ROOM_NAMES[Math.floor(Math.random() * ROOM_NAMES.length)];
      agent.walkToRoom(targetRoom);
      this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'move', `walks to ${targetRoom}`);
    } else if (roll < 0.52) {
      const book = BOOK_TITLES[Math.floor(Math.random() * BOOK_TITLES.length)];
      const bookshelf = this.findFurnitureByType(agent, ['Bookshelf'], 15);
      if (bookshelf) agent.interactWith(bookshelf);
      agent.say(`📖 Reading "${book}"`);
      agent.doAction('using', 8 + Math.random() * 12);
      this.stateManager.addChatMessage(agent.state.id, agent.state.name, `📖 Reading "${book}"`);
      this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'action', `picks up "${book}" and starts reading`);
    } else if (roll < 0.7) {
      const nearbyFurniture = this.findNearbyFurniture(agent, 6);
      if (nearbyFurniture.length > 0) {
        const item = nearbyFurniture[Math.floor(Math.random() * nearbyFurniture.length)];
        agent.interactWith(item);
        this.stateManager.addActionEntry(agent.state.id, agent.state.name, 'interact', `uses the ${item.name}`);
      } else {
        const pos = getRandomPositionInRoom(agent.state.status.room);
        if (pos) agent.walkTo(pos.x, pos.z);
      }
    } else if (roll < 0.88) {
      const message = IDLE_CHATS[Math.floor(Math.random() * IDLE_CHATS.length)];
      agent.say(message);
      this.stateManager.addChatMessage(agent.state.id, agent.state.name, message);
    } else {
      const pos = getRandomPositionInRoom(agent.state.status.room);
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

  private findFurnitureByType(agent: Agent, names: string[], maxDist: number): FurnitureItem | null {
    const pos = agent.character.group.position;
    const matches = this.furniture.filter(item => {
      if (!names.includes(item.name)) return false;
      const dx = item.interactionPoint.x - pos.x;
      const dz = item.interactionPoint.z - pos.z;
      return Math.sqrt(dx * dx + dz * dz) < maxDist;
    });
    return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : null;
  }
}
