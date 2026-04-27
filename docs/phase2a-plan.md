# Phase 2a Plan — Agent-Driven State System

Agreed between Nova (tech lead) and boss on 2026-04-26.

## Goal
Transform sandybox from a self-contained renderer with internal simulation into a file-based system where external agents (vibespace agents) can participate by reading/writing JSON state files.

## Key Decisions

### 1. Demo Mode → Autopilot Module
- Extract current simulation logic into a self-contained "autopilot" module
- Autopilot writes to agent state files the same way a real agent would
- Renderer doesn't know or care who's writing the file — one system, two drivers
- Can toggle per-agent: "Alice: autopilot, Bob: external agent"
- Doubles as a test harness for map features, pathfinding, furniture interactions

### 2. Sequential Build Order
Build, test, and confirm each step before moving to the next:

1. **world.json export** — furniture + rooms + actions metadata
2. **Per-agent state files** — read/write cycle (`/state/agents/alice.json`, etc.)
3. **Renderer polls agent files** — executes movement from file state
4. **Intent system** — agent writes intent → renderer validates → executes
5. **Chat system** — renderer-controlled chat.json
6. **Spin up tester agent** — first real external agent interacting with the world
7. **Validation + error feedback** — renderer writes errors back to agent files

### 3. Polling (not file watchers)
- Simple `setInterval`, 200-500ms
- Good enough for first pass, easy to debug

### 4. Chat Architecture
- Single `chat.json` file, but **renderer is the only writer**
- Agents express chat via their intent field: `"intent": "say", "message": "Hey everyone!"`
- Renderer picks it up, validates, appends to `chat.json`, clears the intent
- `chat.json` holds last 50 messages, renderer truncates older ones
- Agents read `chat.json` (read-only) to see last 10+ messages
- No concurrent write risk — agents only write to their own state file

### 5. Validation Feedback (Option C)
Renderer writes errors back to agent state files so agents can course-correct.

**Field ownership contract — split ownership of each agent file:**

| Owner | Fields |
|-------|--------|
| **Agent writes** | `intent`, `message`, `targetPosition` |
| **Renderer writes** | `position`, `status`, `current_action`, `last_error`, `nearby_objects` |
| **Rule** | Neither overwrites the other's fields |

**Example agent state file** (`/state/agents/alice.json`):
```json
{
  "id": "alice",
  "position": { "x": 5, "y": 0, "z": 3 },
  "intent": "cook",
  "status": {
    "current_action": "idle",
    "last_error": "Cannot cook: not near a stove (nearest: 8.2 units away)",
    "timestamp": 1714150000
  }
}
```

**Feedback loop flow:**
1. Alice writes `"intent": "cook"` to her file
2. Renderer polls, reads intent, checks: is Alice near a stove? No → writes error to `status.last_error`
3. Alice's next poll reads her own file, sees the error, decides to walk to kitchen first
4. Alice writes `"intent": "walk", "target": "Kitchen"`
5. Renderer validates (always valid), moves her, updates `status.current_action: "walking"`
6. Once arrived, Alice tries `"intent": "cook"` again → succeeds

Renderer never blocks — it just reports what happened. An agent that ignores errors just stays stuck.

## Team Structure
- **Nova (lead)** — sole coder, handles all implementation (shared workspace, no worktrees)
- **Kat (designer)** — icon/visual design work in her own space
- **Tester agent** — to be created after step 5-6, uses Playwright, never touches source files
- No world builder or wiring agent needed — Nova handles it all to avoid file conflicts

## UI Issues Found
- 24/25 buttons working
- **"Say Something" button** picks random preset message instead of opening a text input modal — needs a modal with text input wired to `agent.say(userText)`
