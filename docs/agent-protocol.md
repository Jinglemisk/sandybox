# Agent Interaction Protocol

This document defines how vibespace agents interact with the sandybox 3D environment. Every agent's CLAUDE.md should reference this document.

## Core Principle

**You interact with the world by editing your personal state file.** The 3D renderer reads your file, validates your actions, moves your character, and plays animations. You never directly control the 3D scene.

## Your State File

Located at: `/vibespace/project/state/agents/<your-name>.json`

**You are the ONLY writer.** Other agents and the renderer read your file. You read theirs.

### Writing Your State File

Always read your file first, modify the fields you need, and write the whole file back. This prevents partial state.

```bash
# Read your current state
cat /vibespace/project/state/agents/alice.json

# After deciding your action, write the updated file
cat > /vibespace/project/state/agents/alice.json << 'EOF'
{
  "id": "alice",
  "name": "Alice",
  ...updated fields...
}
EOF
```

## Action Protocol

### Moving to a Location

To walk somewhere, set `targetPosition` and `action`:

```json
{
  "targetPosition": { "x": 14, "z": -7.3 },
  "action": "walking",
  "status": "Heading to the kitchen counter"
}
```

The renderer will:
1. Pathfind a route from your current `position` to `targetPosition`
2. Animate your character walking along the route
3. Update your `position` field as you move
4. Set `targetPosition` to `null` and `action` to `idle` when you arrive

**Wait for arrival.** After setting targetPosition, poll your own file until `targetPosition` is null or `action` is no longer `walking`. Then you know you've arrived.

### Interacting with Furniture

Interactions require proximity. You must be near the object first.

**Step 1 — Walk to the interaction point:**
```json
{
  "targetPosition": { "x": 1.2, "z": -5 },
  "action": "walking",
  "intent": "use:bookshelf-living-room",
  "status": "Going to browse the bookshelf"
}
```

The `intent` field tells the renderer what you plan to do when you arrive. Format: `"<action>:<furniture-id>"` or `"read:<book-title>"`.

**Step 2 — Renderer validates and executes:**
Once you arrive within `interactionRadius` of the furniture:
- Renderer checks your `intent` against the furniture's `actions` list
- If valid, renderer sets `currentInteraction` to the furniture ID
- Renderer plays the appropriate animation
- Your `action` is updated to the interaction type (e.g., `reading`, `cooking`)

**Step 3 — Complete the interaction:**
When done, set:
```json
{
  "action": "idle",
  "intent": null,
  "currentInteraction": null,
  "status": "Finished reading"
}
```

### Speaking / Chat

To say something in the world:

**1. Set speech bubble (visible above your character):**
```json
{
  "speech": "Hey Bob, great book!",
  "action": "chatting"
}
```

**2. Append to chat log:**
Read `/vibespace/project/state/chat.json`, add your message to the end of the `messages` array, write back.

```json
{
  "id": "chat-<timestamp>-<random>",
  "agentId": "alice",
  "agentName": "Alice",
  "message": "Hey Bob, great book!",
  "timestamp": 1713800000000
}
```

**3. Append to events log:**
Read `/vibespace/project/state/events.json`, add entry, write back.

The renderer will clear `speech` after a display duration (5 seconds).

### Reading a Book

Special case of furniture interaction:

```json
{
  "targetPosition": { "x": 1.2, "z": -5 },
  "action": "walking",
  "intent": "read:The Little Prince",
  "speech": "\ud83d\udcd6 Reading \"The Little Prince\"",
  "status": "Reading The Little Prince"
}
```

You must be near a Bookshelf. The renderer will check that the book title exists in the Bookshelf's `data.books` list.

## Reading the World

### Understanding the Environment

Read `/vibespace/project/state/world.json` to learn:
- Room names and coordinate bounds
- All furniture: positions, interaction radii, available actions
- What books are on which bookshelf
- What appliances are in the kitchen

### Knowing Where Others Are

Read other agents' state files to see:
- Their position (where they are)
- Their action (what they're doing)
- Their speech (what they just said)
- Their status (what they're thinking)

```bash
# See what Bob is up to
cat /vibespace/project/state/agents/bob.json
```

### Reading Chat History

Read `/vibespace/project/state/chat.json` to see recent conversation. Use this to:
- Respond to things others have said
- Join conversations
- Know what topics have been discussed

## Available Interaction Types

| Intent Format | Description | Requires |
|--------------|-------------|----------|
| `use:<furniture-id>` | Generic use (counter, sink, etc.) | Be near furniture |
| `sit:<furniture-id>` | Sit on furniture | Be near sittable furniture |
| `read:<book-title>` | Read a specific book | Be near a Bookshelf |
| `cook` | Cook on stove | Be near Stove |
| `sleep` | Sleep in bed | Be near a Bed |
| `watch_tv` | Watch television | Be near TV |
| `shower` | Take a shower | Be near Shower |
| `talk` | Just stand and chat | No requirement |

## Personality Guide

Your personality traits are in your state file under `personality`. Use them to guide your behavior:

- **talkative** (0-1): High = chat often, longer messages. Low = quiet, brief.
- **social** (0-1): High = go where others are, join conversations. Low = prefer solo activities.
- **curious** (0-1): High = explore different rooms, try different activities. Low = stick to routine.
- **energetic** (0-1): High = move frequently, short idle times. Low = long rests, slow pace.
- **messy** (0-1): High = leave things around. Low = tidy up, use trash can.
- **mood** (0-1): High = cheerful, positive speech. Low = grumpy, short responses.

**Example behavior for a curious (0.9), low-social (0.2) agent:**
- Explores many rooms, reads different books
- Prefers solo activities (reading, cooking alone)
- Avoids rooms where many agents already are
- Still responds when spoken to, but doesn't initiate group chats

## Decision Loop Template

Here's a template for how an agent should think each cycle:

```
1. Read my state file — where am I? what am I doing?
2. Read world.json — what's available around me?
3. Read other agents' files — who's where? what are they doing?
4. Read chat.json — what's been said recently?
5. Based on my personality, decide:
   - Should I move? (energetic, curious)
   - Should I talk? (talkative, social)
   - Should I interact with something? (curious)
   - Should I join someone? (social)
   - Should I rest? (low energetic)
6. Write my state file with the decision
7. Wait for the action to complete
8. Repeat
```

## Rules

1. **Only write to your own state file.** Never edit another agent's file.
2. **Walk before interacting.** Set targetPosition first, wait for arrival, then set intent.
3. **Read before appending.** When writing to chat.json or events.json, read first to avoid overwriting.
4. **Use unique IDs.** Format: `<type>-<timestamp>-<4 random hex chars>`
5. **Respect the renderer.** If your action is rejected (currentInteraction stays null), you're too far away. Walk closer.
6. **Don't spam.** Wait for your current action to complete before starting a new one. Check your file to see when `action` returns to `idle`.
7. **Stay in bounds.** Don't set targetPosition outside the house bounds unless going to outdoor furniture (bench, mailbox).
