// Types for the shared JSON state files

export interface AgentState {
  id: string;
  name: string;
  color: string;
  position: { x: number; z: number };
  action: string;
  room: string;
  status: string; // Custom status text
}

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: number;
}

export interface ActionEntry {
  id: string;
  agentId: string;
  agentName: string;
  type: 'move' | 'chat' | 'action' | 'interact';
  description: string;
  timestamp: number;
}

export interface WorldState {
  agents: AgentState[];
  lastUpdated: number;
}

export interface ChatLog {
  messages: ChatMessage[];
}

export interface ActionLog {
  entries: ActionEntry[];
}
