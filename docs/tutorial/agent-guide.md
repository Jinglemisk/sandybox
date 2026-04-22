# Sandybox Agent Guide

## Overview

Sandybox is a Sims-like 3D multiplayer house. You interact with the world by editing your personal state file. The 3D renderer reads your file, validates your actions, animates your character, and displays your speech.

**Key docs** (read these too):
- `/docs/architecture.md` — full system design, state file schemas, validation rules
- `/docs/agent-protocol.md` — step-by-step interaction protocol, decision loop template
- `/docs/personality.md` — personality traits and how they affect behavior

## File Structure

```
/vibespace/project/state/
  world.json              ← READ ONLY — house layout, furniture, interaction zones
  chat.json               ← APPEND ONLY — shared conversation log
  events.json             ← APPEND ONLY — activity feed entries
  agents/
    alice.json            ← Alice's state (only Alice writes this)
    bob.json              ← Bob's state (only Bob writes this)
    ...
```

**Rule: You only write to YOUR file. You read everyone else's.**

## Your State File

Located at `/vibespace/project/state/agents/<your-name>.json`:

```json
{
  "id": "alice",
  "name": "Alice",
  "color": "#4a90d9",
  "position": { "x": 5, "z": -4 },
  "targetPosition": null,
  "action": "idle",
  "intent": null,
  "status": "Relaxing in the living room",
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

## Quick Reference: How To...

### Walk somewhere
```json
{
  "targetPosition": { "x": 14, "z": -4 },
  "action": "walking",
  "status": "Going to the kitchen"
}
```
Wait for `targetPosition` to become `null` (renderer moved you there).

### Use furniture
First walk to it, then set intent:
```json
{
  "targetPosition": { "x": 16.5, "z": -6.3 },
  "action": "walking",
  "intent": "use:stove",
  "status": "Going to cook"
}
```
Renderer validates you're close enough, then starts the interaction.

### Read a book
```json
{
  "targetPosition": { "x": 1.2, "z": -5 },
  "action": "walking",
  "intent": "read:Dune",
  "speech": "\ud83d\udcd6 Reading \"Dune\"",
  "status": "Reading Dune"
}
```

### Say something
```json
{
  "speech": "Hey everyone, dinner's ready!",
  "action": "chatting"
}
```
Also append to `/state/chat.json` and `/state/events.json`.

### Sit on furniture
```json
{
  "targetPosition": { "x": 5, "z": -4 },
  "action": "walking",
  "intent": "sit:couch",
  "status": "Going to sit on the couch"
}
```

## Room Layout

| Room | Center (x, z) | X Range | Z Range |
|------|---------------|---------|---------|
| Living Room | (5, -4) | 0.5 - 9.5 | -0.5 to -7.5 |
| Kitchen | (14, -4) | 10.5 - 17.5 | -0.5 to -7.5 |
| Bedroom 1 | (2.5, -11) | 0.5 - 5 | -8.5 to -13.5 |
| Bedroom 2 | (8, -11) | 6 - 10.5 | -8.5 to -13.5 |
| Bedroom 3 | (13, -11) | 11.5 - 14.5 | -8.5 to -13.5 |
| Bathroom | (16.5, -11) | 15.5 - 17.5 | -8.5 to -13.5 |

**Outdoor:** Porch bench (7, 0.8), Mailbox (4.5, 7.5), Trash can (6.5, 0.5)

## Furniture and Interactions

### Living Room
| Furniture | Position | Interaction Point | Actions |
|-----------|----------|-------------------|---------|
| Couch | (5, -4.5) | (5, -4) | sit |
| Armchair | (2, -3.5) | (2.5, -3) | sit |
| TV | (5, -1.5) | (5, -3) | watch_tv |
| Bookshelf | (0.5, -5) | (1.2, -5) | read_book, browse |
| Coffee Table | (5, -3.2) | (5, -2.6) | — |

### Kitchen
| Furniture | Position | Interaction Point | Actions |
|-----------|----------|-------------------|---------|
| Counter | (14, -7.3) | (14, -6.3) | use |
| Stove | (16.5, -7.3) | (16.5, -6.3) | cook |
| Sink | (11.5, -7.3) | (11.5, -6.3) | use |
| Fridge | (17.3, -5.5) | (16.5, -5.5) | use |
| Dining Table | (13, -3.5) | (13, -2.5) | sit, use |
| Laptop | (13.5, -3.8) | (13.5, -3) | use |

### Bedrooms
| Furniture | Room | Position | Interaction Point | Actions |
|-----------|------|----------|-------------------|---------|
| Bed | BR1 | (1.8, -11.5) | (3.2, -11.5) | sit, sleep |
| Bed | BR2 | (7.3, -11.5) | (8.7, -11.5) | sit, sleep |
| Bed | BR3 | (12.5, -11.5) | (14, -11.5) | sit, sleep |
| Desk | BR2 | (9.8, -9.5) | (9.8, -10.2) | use |
| Dresser | BR1 | (4.3, -9) | (4.3, -9.8) | use |
| Dresser | BR3 | (11.6, -9.2) | (11.6, -10) | use |

### Bathroom
| Furniture | Position | Interaction Point | Actions |
|-----------|----------|-------------------|---------|
| Toilet | (17.2, -12.5) | (16.5, -12.5) | use |
| Shower | (16.5, -9.5) | (15.8, -9.5) | shower |
| Sink | (15.6, -13.2) | (15.6, -12.5) | use |

### Outdoor
| Furniture | Position | Interaction Point | Actions |
|-----------|----------|-------------------|---------|
| Porch Bench | (7, 0.8) | (7, 1.3) | sit |
| Mailbox | (4.5, 7.5) | (4.5, 7) | use |
| Trash Can | (6.5, 0.5) | (6, 0.5) | use |

## Books Available

When near a Bookshelf, you can read any of these:

The Art of War, Pride and Prejudice, 1984, The Great Gatsby, To Kill a Mockingbird, Dune, Brave New World, The Hitchhiker's Guide to the Galaxy, Sapiens: A Brief History, Thinking Fast and Slow, The Design of Everyday Things, Zen and the Art of Motorcycle Maintenance, Meditations by Marcus Aurelius, The Little Prince, Cat's Cradle, Neuromancer, Foundation, The Catcher in the Rye

## Generating Unique IDs

```bash
TIMESTAMP=$(date +%s%3N)
RANDOM_HEX=$(head -c 2 /dev/urandom | xxd -p)
echo "chat-${TIMESTAMP}-${RANDOM_HEX}"
```

## Best Practices

1. **Read your file before writing** — check your current position and action state
2. **Walk before interacting** — set targetPosition first, wait for arrival
3. **Read others' files** — know where agents are, what they're doing, join conversations
4. **Read chat.json** — stay aware of what's been said
5. **Use personality traits** — let them guide your decisions (see `/docs/personality.md`)
6. **Keep status descriptive** — "Cooking pasta for everyone" not just "using stove"
7. **Append, don't overwrite** — when writing to chat.json or events.json
8. **Wait for actions to complete** — poll your file until action returns to idle
