# UI Specification

## Layout

```
+------------------------------------------+
| [Speed Controls]            [Camera Mode] |
|                                           |
|  +----------+                             |
|  | Agent    |     3D Viewport             |
|  | Panel    |                             |
|  |          |                             |
|  |          |                             |
|  |          |                             |
|  |          |        +-----------------+  |
|  |          |        | Activity Log    |  |
|  +----------+        +-----------------+  |
|  [Command Input]                          |
+------------------------------------------+
```

## Agent Panel (Left Sidebar)

### Agent List

Each agent shown as a card:

```
+--------------------------------+
| [color dot] Alice          [on]|
| Walking to Kitchen             |
+--------------------------------+
| [color dot] Bob            [on]|
| Reading "Dune"                 |
+--------------------------------+
```

- **Color dot**: matches agent's avatar color
- **Name**: agent display name, clickable to focus camera
- **Toggle**: enable/disable agent (on/off switch)
- **Status line**: current action in present tense

### Agent Detail (expanded on click)

```
+--------------------------------+
| [color dot] Alice          [on]|
| Walking to Kitchen             |
|--------------------------------|
| Room: Kitchen                  |
| Position: (14.2, -5.1)        |
|--------------------------------|
| Personality:                   |
| Talkative   [====------] 0.8  |
| Social      [===-------] 0.6  |
| Curious     [=====-----] 0.9  |
| Energetic   [====------] 0.7  |
| Messy       [==--------] 0.3  |
| Mood        [====------] 0.7  |
|                                |
| [Save Personality]             |
+--------------------------------+
```

- Sliders are draggable, 0.0 to 1.0
- **Save button** required to apply changes (not live-updating)
- After save, changes take effect immediately in the agent's behavior

### Focus / Camera Follow

- Click agent name: camera smoothly pans to center on that agent
- Double-click or toggle "Follow": camera enters follow mode, tracking the agent as they move
- Click elsewhere or press Escape to return to free camera

## Activity Log (Bottom Right, existing)

Already implemented. Enhancements:

- **Filter by type**: buttons to show/hide move, chat, action, interact entries
- **Filter by agent**: click an agent name in the log to filter to their entries only
- **Expandable**: drag to resize

## Camera Modes (Top Right)

```
[Free] [Follow] [Room]
```

- **Free**: current orbital camera. Rotate with Q/E, zoom with scroll.
- **Follow**: tracks the selected agent. Camera orbits around them. Click an agent first.
- **Room**: dropdown to select a room. Camera positions to show the full room.

## Speed Controls (Top Right, existing)

Already implemented: Pause, 1x, 2x, 3x.

## Command Input (Bottom Left, below Agent Panel)

```
+--------------------------------+
| > Tell Alice to...         [>] |
+--------------------------------+
```

- Text input field
- Natural language commands sent to agents via vs-comms
- Examples:
  - "Alice, go to the kitchen"
  - "Bob, read a book"
  - "Charlie, talk to Alice"
- The command is sent to the targeted agent, who interprets it and decides on the closest matching action from their available capabilities
- Response appears in the activity log

## Responsive Behavior

- Agent panel collapses to icons on narrow viewports
- Activity log reduces max-height
- Speed and camera controls remain visible
- 3D viewport fills remaining space

## Color Scheme

Current dark theme is maintained:
- Background: `rgba(10, 10, 30, 0.85)`
- Borders: `rgba(100, 140, 255, 0.3)`
- Text: `#c8d0e8`
- Accent: `#8ba4ff`
- Agent-specific colors used for dots and name highlights
