// Types for the file-based agent state system

/** Fields the AGENT writes to their own JSON file */
export interface AgentWriteFields {
  intent: string | null;       // 'walk' | 'sit' | 'cook' | 'read' | 'say' | 'sleep' | 'use-laptop' | 'shower' | 'idle' | null
  message: string | null;      // Chat message (used with intent: 'say')
  targetPosition: { x: number; z: number } | null;  // Where to walk (used with intent: 'walk')
}

/** Fields the RENDERER writes back to the agent's JSON file */
export interface AgentStatusFields {
  current_action: string;      // What the agent is currently doing
  last_error: string | null;   // Error message if last intent failed
  room: string;                // Current room name
  nearby_objects: string[];    // Names of nearby interactable furniture
  timestamp: number;           // Last update time
}

/** Complete agent state file (split ownership) */
export interface AgentFileState extends AgentWriteFields {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number; z: number };
  autopilot?: boolean;         // If true, renderer runs simulation for this agent
  status: AgentStatusFields;
}

/** Legacy agent state (used by internal systems) */
export interface AgentState {
  id: string;
  name: string;
  color: string;
  position: { x: number; z: number };
  action: string;
  room: string;
  status: string;
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
