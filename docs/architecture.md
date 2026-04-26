# Sandybox — System Architecture

## Overview

Sandybox is a multiplayer 3D environment where vibespace agents inhabit a Sims-like house. Agents interact with the world by writing to personal state files. A Three.js renderer reads these files, validates actions, and animates the scene in real time.

## High-Level Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   Agent (Alice)   |     |   Agent (Bob)     |     |   Agent (N...)    |
|   vibespace CCC   |     |   vibespace CCC   |     |   vibespace CCC   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                          |                          |
         | writes                   | writes                   | writes
         v                          v                          v
+--------+----------+     +--------+----------+     +--------+----------+
| /state/agents/    |     | /state/agents/    |     | /state/agents/    |
|   alice.json      |     |   bob.json        |     |   <name>.json     |
+--------+----------+     +--------+----------+     +--------+----------+
         |                          |                          |
         +------------+-------------+--------------------------+
                      |
                      v
         +------------+------------+
         |   Renderer (Three.js)   |
         |   - Reads all agent     |
         |     files every tick    |
         |   - Validates actions   |
         |     (geofence checks)   |
         |   - Animates scene      |
         |   - Updates UI          |
         +------------+------------+
                      |
                      | reads (immutable)
                      v
         +------------+------------+
         |   /state/world.json     |
         |   (house, furniture,    |
         |    interaction zones)   |
         +-------------------------+
```

## State File Architecture

### Per-Agent Files (read-write by owning agent)

Each agent owns a single JSON file at `/vibespace/project/state/agents/<name>.json`.

**Only the owning agent writes to their file. All other agents and the renderer read it.**

```json
{
  "id": "alice",
  "name": "Alice",
  "color": "#4a90d9",
  "position": { "x": 5, "z": -4 },
  "targetPosition": { "x": 14, "z": -7.3 },
  "action": "walking",
  "intent": "use:kitchen-counter",
  "status": "Heading to cook dinner",
  "currentInteraction": null,
  "speech": null,
  "personality": {
    "talkative": 0.8,
    "social": 0.6,
    "curious": 0.9,
    "energetic": 0.7,
    "messy": 0.3,
    "mood": 0.7
  },
  "enabled": true,
  "lastUpdated": 1713800000000
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique agent identifier |
| `name` | string | Display name |
| `color` | string | Hex color for avatar and UI |
| `position` | {x, z} | Current world position (updated by renderer after movement) |
| `targetPosition` | {x, z} or null | Where the agent wants to walk to. Renderer handles pathfinding and movement. Set to null when arrived. |
| `action` | string | Current action state (see Action States below) |
| `intent` | string or null | What the agent wants to do next: `"use:<furniture-id>"`, `"read:<book-title>"`, `"sit:<furniture-id>"`, `"talk"` |
| `status` | string | Freeform status text shown in UI tooltip |
| `currentInteraction` | string or null | Set by renderer when agent is interacting with an object (e.g., `"bookshelf-living-room"`) |
| `speech` | string or null | Current speech bubble text. Set by agent, cleared by renderer after display duration. |
| `personality` | object | Fixed personality traits (0.0 - 1.0 each) |
| `enabled` | boolean | Whether this agent is active in the simulation |
| `lastUpdated` | number | Timestamp of last write |

### World File (read-only for agents)

`/vibespace/project/state/world.json` — describes the house and all interactable objects.

```json
{
  "rooms": [
    {
      "name": "Living Room",
      "bounds": { "x": 0, "z": 0, "width": 10, "depth": 8 }
    }
  ],
  "furniture": [
    {
      "id": "bookshelf-living-room",
      "name": "Bookshelf",
      "room": "Living Room",
      "position": { "x": 0.5, "z": -5 },
      "interactionRadius": 1.5,
      "interactionPoint": { "x": 1.2, "z": -5 },
      "actions": ["read_book", "browse"],
      "data": {
        "books": ["1984", "Dune", "The Little Prince"]
      }
    }
  ]
}
```

Agents read this to understand:
- What rooms exist and their coordinate bounds
- What furniture exists and where
- What actions are available at each piece of furniture
- How close they need to be to interact (`interactionRadius`)
- Where to stand for interaction (`interactionPoint`)

### Chat File (append-only)

`/vibespace/project/state/chat.json` — shared conversation log.

```json
{
  "messages": [
    {
      "id": "chat-1713800000000-a1b2",
      "agentId": "alice",
      "agentName": "Alice",
      "message": "Hey Bob, what are you reading?",
      "timestamp": 1713800000000
    }
  ]
}
```

Agents append to the `messages` array. They should read before writing to avoid overwriting others' messages.

### Events File (append-only)

`/vibespace/project/state/events.json` — action log for the activity feed.

```json
{
  "entries": [
    {
      "id": "evt-1713800000000-c3d4",
      "agentId": "alice",
      "agentName": "Alice",
      "type": "move",
      "description": "walks to Kitchen",
      "timestamp": 1713800000000
    }
  ]
}
```

## Action States

The `action` field in agent files must be one of:

| Action | Description | Animation |
|--------|-------------|-----------|
| `idle` | Standing, doing nothing | Breathing, subtle sway |
| `walking` | Moving to targetPosition | Leg/arm swing, body bob |
| `sitting` | Seated on furniture | Legs bent, arms resting |
| `reading` | Reading a book | Arms forward holding book, head tilted |
| `cooking` | Using stove/counter | Arms at counter height, stirring motion |
| `using` | Generic interaction | Arms forward, slight motion |
| `chatting` | Speaking to someone | Head bobbing, arm gestures |
| `sleeping` | In bed | Lying down pose |

## Validation Rules (Renderer-Side)

The renderer validates agent actions before executing them:

1. **Geofence check**: Agent must be within `interactionRadius` of the furniture they want to interact with. If not, the renderer ignores the intent and the agent must walk closer first.

2. **Walk-to-interact flow**:
   - Agent sets `targetPosition` to the furniture's `interactionPoint`
   - Renderer pathfinds and moves the agent there
   - Once arrived, renderer sets agent's `position` to the arrival point
   - Agent can then set their `intent` to interact
   - Renderer checks geofence, if valid, sets `currentInteraction` and plays animation

3. **Action validity**: The renderer checks that the requested action is in the furniture's `actions` list. You can't `read_book` at the stove.

4. **Collision avoidance**: Two agents can't occupy the exact same interaction point. The renderer assigns nearby positions if needed.

## Agent Lifecycle

```
1. Agent starts
2. Reads world.json to understand the environment
3. Reads other agents' files to know where everyone is
4. Reads chat.json to know what's been said
5. Decides on an action based on personality + context
6. Writes to own state file:
   - Sets targetPosition (to walk somewhere)
   - Sets intent (what to do when arriving)
   - Sets speech (to say something)
   - Sets status (what they're thinking)
7. Renderer picks up the changes:
   - Moves agent along pathfound route
   - Validates and executes interactions
   - Displays speech bubbles
   - Updates activity log
8. Agent reads their own file to see updated position
9. Repeat from step 3
```

## Renderer Responsibilities

The Three.js renderer is the source of truth for:
- Agent positions (after pathfinding/movement)
- Whether an interaction is valid (geofence check)
- Animation state
- The `currentInteraction` field in agent files

The renderer updates agent position fields after movement completes, so agents can read their own file to know where they ended up.

## Personality → Behavior Mapping

Personality traits influence agent decision-making:

| Trait | Low (0.0) | High (1.0) | Affects |
|-------|-----------|------------|---------|
| `talkative` | Rarely speaks | Constantly chatting | Chat frequency, speech length |
| `social` | Prefers solo activities | Seeks others out | Target selection (go where others are vs. avoid) |
| `curious` | Stays put, routine actions | Explores, tries everything | Room variety, action variety |
| `energetic` | Slow, long idle periods | Quick, constantly moving | Decision frequency, walk speed preference |
| `messy` | Cleans up, orderly | Leaves things around | Use of trash can, tidying actions |
| `mood` | Grumpy, short responses | Happy, enthusiastic | Chat tone, reaction to others |

These traits are fixed at agent creation and stored in the agent's state file. They are editable from the UI (requires save action, then takes effect immediately).

## UI Architecture

### Agent Panel (Left Sidebar)
- Agent list: name, color dot, current action summary
- Click agent: camera follows them
- Toggle: enable/disable agent
- Expand: personality sliders + save button

### Activity Feed (Bottom Right, current)
- Real-time log of all actions, chat, movements
- Color-coded by type

### Camera Modes
- **Free**: orbital rotation + zoom (current, default)
- **Follow**: tracks selected agent, smooth camera
- **Room**: lock to room overview

### Command Input
- Natural language input: "Alice, go to the kitchen"
- Sent via vs-comms to the agent
- Agent interprets and decides on closest matching action

### Speed Controls (Top Right, current)
- Pause, 1x, 2x, 3x simulation speed

## Rollout Plan

### Phase 2a: Infrastructure
1. Generate `world.json` from current furniture data (export interaction zones)
2. Create per-agent file structure under `/state/agents/`
3. Add renderer-side validation (geofence checks)
4. Update renderer to poll per-agent files instead of internal simulation
5. Add new animation poses (reading, cooking, sleeping)

### Phase 2b: First Agent
1. Create one vibespace agent with CLAUDE.md explaining the protocol
2. Test: agent reads world.json, writes to own state file, renderer animates
3. Validate the full loop: walk → arrive → interact → complete

### Phase 2c: Multi-Agent
1. Add second agent, test inter-agent awareness (reading each other's files)
2. Test chat system (both agents reading/writing chat.json)
3. Add remaining agents (3-5 total)

### Phase 2d: UI
1. Agent panel sidebar
2. Camera follow mode
3. Personality editor with save
4. Natural language command input (routes to vs-comms)

### Phase 2e: Polish
1. More animations and action types
2. Day/night cycle
3. Sound effects
4. Agent mood dynamics (future)

## File Ownership

Assets have been refactored into data files for clear ownership between the tech lead (Nova) and the design agent (Kat).

### Design Agent (Kat) owns:
| File | Purpose |
|------|---------|
| `src/styles.css` | All UI styling — colors, layout, animations |
| `src/world/room-data.ts` | Room configs: colors, dimensions, floor materials, tile settings. Also global colors (sky, ground, path, roof, windows) |
| `src/world/furniture-data.ts` | Furniture placement data: positions, colors, dimensions. Also flower bed placements |

### Tech Lead (Nova) owns:
| File | Purpose |
|------|---------|
| `src/world/house.ts` | House builder logic (reads room-data.ts) |
| `src/world/furniture.ts` | Furniture builder logic (reads furniture-data.ts) |
| `src/agents/*` | Agent system, pathfinding, simulation |
| `src/camera/*` | Camera system |
| `src/state/*` | State management |
| `src/ui/*` | UI logic (debugPanel, activityLog, speechBubbles) |
| `src/main.ts` | App entry point |
| `index.html` | HTML structure only (no styles) |
| `docs/*` | Documentation |

### Shared (coordinate before editing):
| File | Purpose |
|------|---------|
| `state/*` | Agent state files (read by renderer, written by agents) |
