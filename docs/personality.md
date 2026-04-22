# Personality System

## Traits

Each agent has 6 personality traits, scored 0.0 to 1.0. These are fixed at agent creation and editable from the UI (requires save, then takes effect immediately).

| Trait | 0.0 (low) | 0.5 (medium) | 1.0 (high) |
|-------|-----------|--------------|------------|
| **talkative** | Silent observer, rarely speaks | Speaks when spoken to, occasional comments | Constant chatter, long messages, starts conversations |
| **social** | Avoids others, solo activities | Balanced mix of solo and group time | Seeks out other agents, joins every conversation |
| **curious** | Repeats same routine, stays in one room | Moderate variety in activities | Explores every room, tries every interaction, reads widely |
| **energetic** | Long idle periods, slow to act | Normal activity pace | Constantly moving, short interactions, rapid decisions |
| **messy** | Uses trash can, tidies up, orderly | Average tidiness | Leaves things around, chaotic behavior |
| **mood** | Grumpy, sarcastic, short responses | Neutral, polite | Cheerful, enthusiastic, uses exclamation marks |

## Behavior Mapping

### Decision Frequency
Base decision interval: 5-15 seconds (simulation time).
- Modified by `energetic`: high = shorter intervals (3-8s), low = longer intervals (10-25s)

### Activity Selection Weights

Each decision, the agent rolls against personality-weighted probabilities:

| Activity | Base Weight | Modified By |
|----------|-------------|-------------|
| Walk to new room | 0.25 | +curious, +energetic |
| Chat with someone | 0.20 | +talkative, +social |
| Read a book | 0.15 | +curious, -energetic |
| Use furniture | 0.15 | neutral |
| Join another agent | 0.10 | +social |
| Idle / rest | 0.10 | -energetic, +mood (content to rest) |
| Explore outdoors | 0.05 | +curious, +energetic |

### Room Selection

When choosing where to walk:
- **High social**: prefer rooms where other agents are
- **Low social**: prefer empty rooms
- **High curious**: prefer rooms not visited recently
- **Low curious**: return to favorite room

### Chat Style

| Trait Combo | Chat Behavior |
|-------------|---------------|
| High talkative + high mood | Long, enthusiastic messages. "Oh my gosh, this book is AMAZING! You have to read it!" |
| High talkative + low mood | Complaints, sarcasm. "Ugh, there's nothing to eat. Again." |
| Low talkative + high mood | Brief, positive. "Nice." "Love it." |
| Low talkative + low mood | Minimal. "..." "Whatever." |
| High social + any | Addresses others by name, asks questions |
| Low social + any | Statements about self, doesn't ask questions |

### Interaction Style

| Trait | Effect on Interactions |
|-------|----------------------|
| High curious | Reads different books each time, tries all kitchen appliances |
| Low curious | Re-reads the same book, uses the same chair |
| High energetic | Short interaction durations (3-8s), moves on quickly |
| Low energetic | Long interactions (15-30s), savors activities |
| High messy | Doesn't clean up after cooking, leaves things around |
| Low messy | Uses trash can after eating, straightens things |

## Example Agent Archetypes

These are starting templates. Traits can be adjusted per agent.

### The Bookworm
```json
{
  "talkative": 0.3,
  "social": 0.2,
  "curious": 0.9,
  "energetic": 0.3,
  "messy": 0.4,
  "mood": 0.7
}
```
Quiet, spends most time reading different books. Occasionally shares what they're reading. Prefers to be alone.

### The Social Butterfly
```json
{
  "talkative": 0.9,
  "social": 0.9,
  "curious": 0.5,
  "energetic": 0.8,
  "messy": 0.5,
  "mood": 0.8
}
```
Always talking, always near others. Moves around frequently to find people. Cheerful and enthusiastic.

### The Grumpy Chef
```json
{
  "talkative": 0.5,
  "social": 0.4,
  "curious": 0.3,
  "energetic": 0.6,
  "messy": 0.7,
  "mood": 0.2
}
```
Spends time in the kitchen. Makes sarcastic comments. Doesn't clean up. Occasionally brilliant observations.

### The Explorer
```json
{
  "talkative": 0.6,
  "social": 0.5,
  "curious": 1.0,
  "energetic": 0.9,
  "messy": 0.3,
  "mood": 0.6
}
```
Never sits still. Visits every room, tries every piece of furniture. Reads widely. Comments on everything they discover.

## Storage

Personality is stored in each agent's state file under the `personality` key. The UI can modify these values (save required, then immediate effect).

## Future Considerations

- **Dynamic mood**: mood could shift based on social interactions (+0.1 after good conversation, -0.1 after being ignored). Not implemented yet — traits are fixed for now.
- **Relationships**: agents could track how they feel about each other. A social+talkative agent might talk more to agents they've had good interactions with.
- **Skill levels**: agents could get better at activities they do often (better cooking descriptions, faster reading).
