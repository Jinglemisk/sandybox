# sandybox — Project Todo

## Phase 1: 3D Environment (COMPLETE)

- [x] Project setup: Vite + TypeScript + Three.js
- [x] House geometry: 6 rooms (Living Room 10x8, Kitchen 8x8, 3 Bedrooms, Bathroom)
- [x] Sims-style wall culling: full cull on camera-facing walls, no cull on back walls
- [x] Orbital camera with rotation (Q/E keys, buttons) and zoom (scroll, +/- buttons)
- [x] Furniture: couch, armchair, coffee table, TV, bookshelf (with books), lamps, rugs, plants, wall art, side tables
- [x] Kitchen: counter, stove, sink, fridge, dining table + chairs, laptop, wall shelf
- [x] Bedrooms: beds, nightstands with lamps, dressers, desk with monitor, rugs
- [x] Bathroom: toilet, shower (glass walls), sink with mirror, tiled floor, towel rack
- [x] Door frames and doorway gaps between rooms
- [x] Windows on all exterior walls with frames, glass, cross bars, sills
- [x] Footpath, sidewalk, street, curb
- [x] Garden flower beds (front + west walls)
- [x] Outdoor: porch bench, mailbox, trash can
- [x] Agent characters: low-poly bodies with walk/idle/sit animations, name labels
- [x] A* pathfinding with path simplification
- [x] Autonomous agent behavior with book reading and speech bubbles
- [x] Activity log UI, speed controls
- [x] Dev server on port 3000

## Phase 2a: Infrastructure (NEXT)

- [ ] Generate `/state/world.json` from furniture data (export all interaction zones, radii, available actions)
- [ ] Create per-agent file structure (`/state/agents/<name>.json`)
- [ ] Add renderer-side validation (geofence checks before executing interactions)
- [ ] Update renderer to poll per-agent files instead of internal simulation
- [ ] Renderer writes back `position` and `currentInteraction` to agent files after movement/validation
- [ ] Add new animation poses: reading (book in hands), cooking (arms at counter), sleeping (lying), using laptop
- [ ] Map action strings 1:1 to animation states

## Phase 2b: First Agent

- [ ] Create one vibespace agent with CLAUDE.md referencing `/docs/agent-protocol.md`
- [ ] Agent reads world.json, writes to own state file
- [ ] Test full loop: agent sets targetPosition → renderer moves → agent sets intent → renderer validates → interaction plays
- [ ] Test speech: agent sets speech → bubble appears → clears after timeout
- [ ] Test chat: agent appends to chat.json → appears in activity log

## Phase 2c: Multi-Agent

- [ ] Add second agent, test inter-agent awareness (reading each other's state files)
- [ ] Test chat between two agents (both reading/appending chat.json)
- [ ] Validate no file conflicts with per-agent files
- [ ] Add remaining agents (3-5 total)
- [ ] Test personality differences affecting behavior

## Phase 2d: UI Enhancements

- [ ] Agent panel sidebar (list with status, click to focus camera)
- [ ] Agent enable/disable toggles
- [ ] Camera follow mode (track selected agent)
- [ ] Room camera mode (overview of selected room)
- [ ] Personality editor panel (sliders + save button)
- [ ] Natural language command input (routes message to agent via vs-comms)
- [ ] Activity log filters (by type, by agent)

## Phase 2e: Polish

- [ ] Refine animation transitions between states
- [ ] Day/night cycle with lighting changes
- [ ] Sound effects for actions
- [ ] Agent conversation system (directed speech between agents)
- [ ] Minimap

## Documentation (COMPLETE)

- [x] `/docs/architecture.md` — system architecture, state files, validation, rollout plan
- [x] `/docs/agent-protocol.md` — step-by-step interaction protocol for agent CLAUDE.md files
- [x] `/docs/personality.md` — trait definitions, behavior mapping, archetypes
- [x] `/docs/ui-spec.md` — UI layout, agent panel, camera modes, command input
- [x] `/docs/tutorial/agent-guide.md` — quick reference for agents (rooms, furniture, coordinates)
