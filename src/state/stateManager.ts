import type { WorldState, ChatLog, ActionLog, AgentState, ChatMessage, ActionEntry } from './types';

// Default initial state
const DEFAULT_AGENTS: AgentState[] = [
  {
    id: 'agent-1',
    name: 'Alice',
    color: '#4a90d9',
    position: { x: 3, z: -2 },
    action: 'idle',
    room: 'Living Room',
    status: 'Relaxing',
  },
  {
    id: 'agent-2',
    name: 'Bob',
    color: '#d94a4a',
    position: { x: 10, z: -3 },
    action: 'idle',
    room: 'Kitchen',
    status: 'Looking for snacks',
  },
  {
    id: 'agent-3',
    name: 'Charlie',
    color: '#4ad98a',
    position: { x: 2, z: -8 },
    action: 'idle',
    room: 'Bedroom 1',
    status: 'Just woke up',
  },
];

export class StateManager {
  private worldState: WorldState;
  private chatLog: ChatLog;
  private actionLog: ActionLog;
  private stateDir: string;
  private pollInterval: number | null = null;
  private onStateChange: (() => void) | null = null;

  constructor(stateDir: string = '/vibespace/project/state') {
    this.stateDir = stateDir;
    this.worldState = {
      agents: DEFAULT_AGENTS,
      lastUpdated: Date.now(),
    };
    this.chatLog = { messages: [] };
    this.actionLog = { entries: [] };
  }

  getAgents(): AgentState[] {
    return this.worldState.agents;
  }

  getChatMessages(): ChatMessage[] {
    return this.chatLog.messages;
  }

  getActionLog(): ActionEntry[] {
    return this.actionLog.entries;
  }

  addChatMessage(agentId: string, agentName: string, message: string) {
    const entry: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      agentName,
      message,
      timestamp: Date.now(),
    };
    this.chatLog.messages.push(entry);

    // Keep last 100 messages
    if (this.chatLog.messages.length > 100) {
      this.chatLog.messages = this.chatLog.messages.slice(-100);
    }

    // Also add to action log
    this.addActionEntry(agentId, agentName, 'chat', `says: "${message}"`);
  }

  addActionEntry(agentId: string, agentName: string, type: ActionEntry['type'], description: string) {
    const entry: ActionEntry = {
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      agentName,
      type,
      description,
      timestamp: Date.now(),
    };
    this.actionLog.entries.push(entry);

    // Keep last 200 entries
    if (this.actionLog.entries.length > 200) {
      this.actionLog.entries = this.actionLog.entries.slice(-200);
    }
  }

  updateAgentState(agentId: string, updates: Partial<AgentState>) {
    const agent = this.worldState.agents.find(a => a.id === agentId);
    if (agent) {
      Object.assign(agent, updates);
      this.worldState.lastUpdated = Date.now();
    }
  }

  // Save state to JSON files (for external agent coordination)
  async saveState() {
    try {
      const response = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: this.worldState,
          chat: this.chatLog,
          actions: this.actionLog,
        }),
      });
      if (!response.ok) {
        console.warn('Failed to save state to server, using local state only');
      }
    } catch {
      // Server not available, just use local state
    }
  }

  // Load state from JSON files
  async loadState() {
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        if (data.world) this.worldState = data.world;
        if (data.chat) this.chatLog = data.chat;
        if (data.actions) this.actionLog = data.actions;
      }
    } catch {
      // Server not available, use defaults
    }
  }

  // Start polling for state changes
  startPolling(intervalMs: number = 2000, onChange?: () => void) {
    this.onStateChange = onChange ?? null;
    this.pollInterval = window.setInterval(async () => {
      await this.loadState();
      this.onStateChange?.();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
