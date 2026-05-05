import type { AgentFileState, ChatLog, ActionLog, ChatMessage, ActionEntry } from './types';

/**
 * StateManager — polls agent state files via the Vite API plugin.
 *
 * Flow:
 * - Polls GET /api/state/agents every N ms to discover and read all agent files
 * - The renderer reads intent/targetPosition from each agent's file
 * - The renderer writes back position/status via PUT /api/state/agents/:id
 * - Chat messages are appended via POST /api/state/chat
 */
export class StateManager {
  private agentStates: Map<string, AgentFileState> = new Map();
  private chatLog: ChatLog = { messages: [] };
  private actionLog: ActionLog = { entries: [] };
  private pollInterval: number | null = null;
  private onAgentsChanged: ((agents: AgentFileState[]) => void) | null = null;
  private knownAgentIds: Set<string> = new Set();

  constructor() {}

  /** Get all current agent file states */
  getAgentFileStates(): AgentFileState[] {
    return Array.from(this.agentStates.values());
  }

  /** Get a specific agent's file state */
  getAgentFileState(id: string): AgentFileState | undefined {
    return this.agentStates.get(id);
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

    if (this.chatLog.messages.length > 100) {
      this.chatLog.messages = this.chatLog.messages.slice(-100);
    }

    // Persist to chat.json via API
    fetch('/api/state/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {});

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

    if (this.actionLog.entries.length > 200) {
      this.actionLog.entries = this.actionLog.entries.slice(-200);
    }
  }

  /**
   * Write renderer-owned fields back to an agent's state file.
   * Preserves agent-written fields (intent, message, targetPosition).
   */
  async writeRendererState(agentId: string, updates: Partial<AgentFileState>) {
    try {
      await fetch(`/api/state/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // API not available, skip
    }
  }

  /**
   * Clear an agent's intent after it has been processed.
   */
  async clearIntent(agentId: string) {
    await this.writeRendererState(agentId, {
      intent: null,
      message: null,
      targetPosition: null,
    } as any);
    // Also update local cache
    const agent = this.agentStates.get(agentId);
    if (agent) {
      agent.intent = null;
      agent.message = null;
      agent.targetPosition = null;
    }
  }

  /** Poll agent files from the API */
  private async pollAgents() {
    try {
      const res = await fetch('/api/state/agents');
      if (!res.ok) return;
      const agents: AgentFileState[] = await res.json();

      // Detect new agents
      const currentIds = new Set(agents.map(a => a.id));
      const newAgents: AgentFileState[] = [];

      for (const agent of agents) {
        this.agentStates.set(agent.id, agent);
        if (!this.knownAgentIds.has(agent.id)) {
          newAgents.push(agent);
          this.knownAgentIds.add(agent.id);
        }
      }

      // Remove agents whose files were deleted
      for (const knownId of this.knownAgentIds) {
        if (!currentIds.has(knownId)) {
          this.agentStates.delete(knownId);
          this.knownAgentIds.delete(knownId);
        }
      }

      if (newAgents.length > 0 || agents.length !== this.knownAgentIds.size) {
        this.onAgentsChanged?.(agents);
      }
    } catch {
      // API not available
    }
  }

  /** Also poll chat.json to pick up messages from external agents */
  private async pollChat() {
    try {
      const res = await fetch('/api/state/chat');
      if (!res.ok) return;
      const chat: ChatLog = await res.json();
      this.chatLog = chat;
    } catch {}
  }

  /** Start polling for agent state changes */
  startPolling(intervalMs: number = 300, onAgentsChanged?: (agents: AgentFileState[]) => void) {
    this.onAgentsChanged = onAgentsChanged ?? null;

    // Initial load
    this.pollAgents();

    this.pollInterval = window.setInterval(() => {
      this.pollAgents();
      this.pollChat();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Legacy compatibility — used by DebugPanel
  getAgents() {
    return this.getAgentFileStates().map(a => ({
      id: a.id,
      name: a.name,
      color: a.color,
      position: { x: a.position.x, z: a.position.z },
      action: a.status.current_action,
      room: a.status.room,
      status: a.status.current_action,
    }));
  }

  updateAgentState(_agentId: string, _updates: any) {
    // No-op for legacy — state is now file-driven
  }

  saveState() {
    // No-op — state is persisted per-agent via API
  }
}
