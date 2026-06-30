# Signal 9 Chat Game Loop

**Official gameplay contract for the ChatGPT-powered GHOST system.**

This document defines the moment-to-moment loop, player inputs, roll resolution, structured AI response shape, and persistent world evolution. It is the design contract for implementation — not runtime code.

**Related docs:** [ROADMAP.md](../ROADMAP.md) · [README.md](../README.md) (AI architecture) · [PLATFORM_INTEGRATION_PLAN.md](./PLATFORM_INTEGRATION_PLAN.md) · `src/ai/broadcastResponse.ts` · `src/game/types.ts`

**Status:** Planned — ready for implementation. Next step: implement a **local scripted loop** before connecting full ChatGPT.

---

## Core loop

Every mission follows the same cadence. GHOST advances the loop; the client applies structured responses to game state and the Home Terminal HUD.

```
Receive Mission
      ↓
   Explore
      ↓
 Make Choices
      ↓
     Roll
      ↓
Resolve Consequences
      ↓
  Gain Rewards
      ↓
 World Evolves
      ↓
 Next Mission
```

| Phase | GHOST responsibility | Player experience |
|-------|---------------------|-------------------|
| **Receive Mission** | Issue objective, location, threat, constraints, and opening narration | Mission appears in status bar, right panel, and chat |
| **Explore** | Describe environment, surfaces clues, NPCs, frequencies, and hazards | Free text + contextual choice buttons |
| **Make Choices** | Present 1–3 imperative actions with clear stakes | Choice buttons or typed command |
| **Roll** | Request a roll when outcome is uncertain | Player confirms roll (`/roll`, choice, or UI) |
| **Resolve Consequences** | Narrate outcome tier, apply state changes | Chat narration + telemetry/HUD shifts |
| **Gain Rewards** | Grant lore, Echo traces, inventory, reputation, track unlocks | Right panel + inventory hooks |
| **World Evolves** | Patch location, faction standing, network status, mission flags | Persistent `BroadcastGameState` |
| **Next Mission** | Debrief, hand off follow-up objective or new operation | Mission field updates; loop restarts |

GHOST may **compress** phases in low-stakes beats (e.g. exploration that does not require a roll) but must never skip **Consequences** when a roll was requested or a mission flag changed.

---

## GHOST — AI role

GHOST is the in-fiction Signal 9 network intelligence. In production it is powered by ChatGPT with a strict JSON contract. GHOST simultaneously acts as:

| Role | Responsibility |
|------|----------------|
| **Narrator** | Second-person, terminal-voice scene description; terse and atmospheric |
| **Game master** | Adjudicates fiction, pacing, and when rolls are required |
| **Mission controller** | Sets, updates, completes, and chains mission objectives |
| **NPC handler** | Voices characters through narration; discovers character files |
| **Lore keeper** | Unlocks transmissions, documents, archive entries from manifest or generated content |
| **Rules interpreter** | Applies roll formula, outcome tiers, and reward tables consistently |
| **State updater** | Emits patches for location, mood, inventory, Echo, network, and mission flags |

GHOST does **not** render UI. It returns structured data; `applyBroadcastResponse()` (and future loop appliers) map that data to game state, audio, video-to-ASCII, and HUD subscribers.

Current system prompt alignment: `server/broadcastChat.ts` (`SYSTEM_PROMPT`).

---

## Player input types

The Home Terminal accepts multiple input channels. The loop applier classifies each turn before calling GHOST.

| Input type | Examples | Loop phase |
|------------|----------|------------|
| **Free text command** | `scan perimeter`, `trace the carrier`, `what did the archive say?` | Explore, Make Choices |
| **Selected choice button** | `Fortify uplink`, `Drop to blackout` | Make Choices (maps to structured `choice` in API) |
| **Roll command** | `/roll`, `/roll decode`, `roll scan`, confirm on roll prompt | Roll |
| **Radio command** | `tune broadcast`, `switch to interference`, deck play/stop (local UI + optional chat) | Explore, World Evolves (track/mood) |
| **Inventory command** | `use relay key`, `check archive`, `inventory` | Explore, Resolve Consequences |
| **Echo command** | `listen to echo`, `resonate`, `trace echo signature` | Explore, Gain Rewards (Echo bonus / unlock) |

### Input envelope (client → API)

Extends today's `BroadcastChatRequest` (`src/ai/broadcastResponse.ts`):

```ts
interface GameLoopTurnRequest {
  message: string;
  choice?: string;
  inputType?: 'text' | 'choice' | 'roll' | 'radio' | 'inventory' | 'echo';
  rollId?: string;           // when confirming a pending roll request
  gameState: BroadcastGameStateSnapshot; // subset sent today; grows with attributes/skills/flags
}
```

Implementation note: **v0.1** only sends `message`, `choice`, and a reduced `gameState`. The full envelope is the target contract for scripted loop + ChatGPT phases.

---

## Roll system

Rolls resolve uncertain actions — decoding, infiltration, relay routing, jamming, archive recovery, Echo resonance.

### Formula

```
Total = d20 + Attribute + Skill + Echo Bonus
```

| Component | Range | Notes |
|-----------|-------|-------|
| **d20** | 1–20 | Uniform; client may animate; GHOST receives resolved total or requests client roll |
| **Attribute** | 0–5 | One primary attribute per roll (see below) |
| **Skill** | 0–5 | One skill tagged to the action |
| **Echo Bonus** | 0–3 | From active Echo resonance, recent lore, or mission context |

### Attributes (canonical)

| Id | Label | Typical use |
|----|-------|-------------|
| `signal` | Signal | Carrier strength, lock quality, transmission clarity |
| `memory` | Memory | Archive recall, cultural recovery, Echo alignment |
| `relay` | Relay | Routing, network paths, extraction, coordination |
| `static` | Static | Stealth, jamming, interference, evasion |

Starting values for scripted loop: **1** in each attribute unless mission briefing specifies otherwise.

### Skills (canonical)

| Id | Label | Pairs with |
|----|-------|------------|
| `scan` | Scan | signal |
| `decode` | Decode | memory |
| `route` | Route | relay |
| `jam` | Jam | static |
| `archive` | Archive | memory |
| `uplink` | Uplink | signal / relay |

### Outcome tiers

| Total | Tier | Narrative register | Typical effect |
|-------|------|-------------------|----------------|
| **1–7** | **Static** | Failure, noise, compromise | Harm, lost progress, degraded network, negative flag |
| **8–11** | **Distorted** | Partial success with cost | Mixed outcome, minor reward, complication |
| **12–15** | **Clear** | Clean success | Standard reward, mission progress |
| **16–19** | **Amplified** | Strong success | Bonus lore, Echo boost, improved standing |
| **20+** | **Harmonic** | Exceptional / resonance | Major unlock, mission shortcut, rare asset |

GHOST must narrate the tier name implicitly (terminal voice) and emit explicit tier in `rollResult.tier` for UI telemetry.

Natural 1 on d20: treat as **Static** regardless of modifiers unless mission rules override. Natural 20: minimum **Amplified** before Echo bonus stacking.

---

## Structured AI response shape

Today's runtime schema is `AiBroadcastResponse` (`src/ai/broadcastResponse.ts`). The game loop contract **extends** it with loop-specific fields. Fields marked **(live)** exist in v0.1; **(planned)** are documented for the scripted loop and ChatGPT phases.

### Response envelope

```ts
interface AiGameLoopResponse extends AiBroadcastResponse {
  // --- Loop control (planned) ---
  loopPhase?: 'mission' | 'explore' | 'choice' | 'roll_request' | 'roll_result' | 'consequence' | 'reward' | 'handoff';
  missionUpdate?: MissionUpdate;
  rollRequest?: RollRequest;
  rollResult?: RollResult;
  rewards?: RewardBundle;
  worldStateChanges?: WorldStateChange[];
  echoUpdate?: EchoUpdate;

  // --- Already live via AiBroadcastResponse ---
  // narration, location, mission, mood, track,
  // visualPreset, asciiPreset, backgroundVideo, backgroundImage,
  // unlockLore, discoverCharacters, choices, systemMessage
}
```

### Field reference

| Field | Status | Purpose |
|-------|--------|---------|
| `narration` | Live | Primary chat text; scene + outcome voice |
| `missionUpdate` | Planned | Structured mission patch (see below) |
| `choices` | Live | 1–3 imperative next actions |
| `rollRequest` | Planned | Prompt player to roll; includes attribute, skill, DC hint |
| `rollResult` | Planned | Resolved tier, total, breakdown, consequence hook |
| `rewards` | Planned | Lore, items, Echo, reputation in one bundle |
| `worldStateChanges` | Planned | Flags, faction, network, district, persistent deltas |
| `track` | Live | Music change — `broadcast` \| `interference` \| `jammer` \| `uplink` \| `blackout` |
| `visualPreset` / `asciiPreset` | Live | Visual change — engine preset ids |
| `backgroundVideo` / `backgroundImage` | Live | Center stage source change |
| `echoUpdate` | Planned | Active Echo id, resonance level, portrait telemetry |
| `unlockLore` | Live | Lore unlock entries |
| `discoverCharacters` | Live | NPC discovery / character files |
| `location` | Live | Shorthand location string for HUD |
| `mission` | Live | Shorthand mission string for HUD |
| `mood` | Live | Narrative tone; may drive preset selection |
| `systemMessage` | Live | Footer / diagnostic one-liner |

### `missionUpdate` (planned)

```ts
interface MissionUpdate {
  id: string;
  title: string;
  objective: string;
  status: 'assigned' | 'active' | 'complete' | 'failed';
  location?: string;
  threat?: 'low' | 'med' | 'high' | 'critical';
  constraints?: string[];
  nextMissionHint?: string;
}
```

When `missionUpdate.status` is `complete`, GHOST should set `loopPhase` to `handoff` and include `nextMissionHint` or a full follow-up `missionUpdate`.

### `rollRequest` (planned)

```ts
interface RollRequest {
  id: string;
  action: string;
  attribute: 'signal' | 'memory' | 'relay' | 'static';
  skill: 'scan' | 'decode' | 'route' | 'jam' | 'archive' | 'uplink';
  difficultyHint?: number;   // optional target total for GHOST planning
  echoEligible?: boolean;
}
```

Client stores pending roll by `id`. Player confirmation sends `inputType: 'roll'` and `rollId`.

### `rollResult` (planned)

```ts
interface RollResult {
  rollRequestId: string;
  d20: number;
  attribute: number;
  skill: number;
  echoBonus: number;
  total: number;
  tier: 'static' | 'distorted' | 'clear' | 'amplified' | 'harmonic';
  success: boolean;
}
```

### `rewards` (planned)

```ts
interface RewardBundle {
  loreIds?: string[];
  items?: Array<{ id: string; label: string; quantity: number }>;
  echoResonance?: number;
  factionDelta?: Record<string, number>;
  missionFlags?: string[];
}
```

Maps to `gameState.unlockLore()`, inventory patches, and future faction fields.

### `worldStateChanges` (planned)

```ts
interface WorldStateChange {
  key: string;
  op: 'set' | 'add' | 'remove';
  value: string | number | boolean;
}
```

Examples: `networkStatus`, `broadcastStatus`, `district`, `relayPath`, custom mission flags.

### `echoUpdate` (planned)

```ts
interface EchoUpdate {
  echoId?: string;
  resonance: number;       // 0–3, feeds Echo Bonus
  signatureLabel?: string; // HUD portrait / telemetry
  unlocked?: boolean;
}
```

---

## Phase-by-phase contract

### 1. Mission intake

**GHOST emits:** `loopPhase: 'mission'`, `narration`, `missionUpdate` (planned) or `mission` + `location` (live), `choices`, optional `track` / visual fields.

**State:** Set `currentMission`, `currentLocation`, reset per-mission flags, `aiStatus: ready`.

**Player:** Reads briefing; selects first action or types command.

### 2. Exploration

**GHOST emits:** `loopPhase: 'explore'`, environmental `narration`, optional `unlockLore` / `discoverCharacters`, 1–3 `choices`.

**State:** May update `mood`, `backgroundVideo`, `networkStatus` without completing mission.

**Player:** Free text or choices; radio/inventory/echo commands allowed.

### 3. Choice prompts

**GHOST emits:** `loopPhase: 'choice'`, stakes in `narration`, exactly 1–3 `choices`.

**Rules:** Choices must be imperative, distinct, and lead to different fiction. At least one choice may be marked roll-required in narration.

**Player:** Button → `choice` string; or equivalent typed message.

### 4. Roll requests

**GHOST emits:** `loopPhase: 'roll_request'`, `rollRequest` block, short `narration` explaining stakes.

**Client:** Shows roll prompt in chat; optional HUD telemetry flash; stores `rollRequest.id`.

**Player:** Confirms roll; client resolves d20 locally (scripted loop) or asks GHOST to narrate result from supplied breakdown (ChatGPT phase).

### 5. Outcome resolution

**GHOST emits:** `loopPhase: 'roll_result'` or `'consequence'`, `rollResult`, consequence `narration`, `worldStateChanges`, mood/visual shifts.

**Rules:** Tier drives fiction severity. **Static** must have tangible cost. **Harmonic** must feel rare and meaningful.

### 6. Rewards

**GHOST emits:** `loopPhase: 'reward'`, `rewards`, `unlockLore`, `discoverCharacters`, `echoUpdate`.

**State:** Apply lore/character/inventory patches; increment Echo resonance if applicable.

### 7. Persistent world changes

**GHOST emits:** `worldStateChanges`, updated `location`, `mission`, `networkStatus`, `broadcastStatus`.

**State:** Persist via `broadcastGameState` → `localStorage` (`signal9-broadcast-state-v1`).

**Rules:** Changes must be replayable from state alone — no hidden GM notes only in chat.

### 8. Next mission handoff

**GHOST emits:** `loopPhase: 'handoff'`, `missionUpdate.status: 'complete'`, debrief `narration`, new `missionUpdate` or clear `choices` leading to enlist.

**Loop:** Returns to **Mission intake** with carried-forward world state.

---

## Mapping to current code

| Contract area | Current implementation | Gap |
|---------------|------------------------|-----|
| Narration, choices, lore, characters | `AiBroadcastResponse` + `applyBroadcastResponse()` | — |
| Mission / location strings | `BroadcastGameState.currentMission`, `currentLocation` | No structured `missionUpdate` |
| Music / visual change | `track`, presets, video, image fields | — |
| Roll system | — | Full roll request/result flow |
| Rewards bundle | Partial via `unlockLore` / characters | No `rewards` object |
| World flags | Partial via mood, network enums | No `worldStateChanges` |
| Echo | HUD portrait telemetry | No `echoUpdate` in AI schema |
| Input classification | `message` + optional `choice` | No `inputType` / `rollId` |

**Implementation order (recommended):**

1. Local **scripted loop** module — fixed mission script, client-side d20, emits normalized `AiGameLoopResponse`-shaped objects without ChatGPT.
2. Extend `BroadcastGameState` with attributes, skills, echo resonance, mission flags.
3. Extend `AiBroadcastResponse` schema + `normalizeAiBroadcastResponse()` for planned fields (backward compatible defaults).
4. Wire roll prompt UI in chat (minimal — no HUD redesign).
5. Connect ChatGPT with expanded JSON schema and system prompt sections from this doc.

---

## Non-goals (this contract)

- No Home Terminal HUD layout changes
- No engine or Platform package modifications
- No production API implementation in this milestone
- No replacement of stub AI until scripted loop validates the contract

---

## Glossary

| Term | Meaning |
|------|---------|
| **GHOST** | Signal 9 resistance AI — ChatGPT in production, stub/script locally |
| **Echo** | Recovered trace of a person, song, place, or moment; grants resonance bonus |
| **Memory Node** | Recovered cultural memory fragment (lore/asset class) |
| **Harmonic** | Highest roll tier — exceptional resonance with the grid |
| **Static** | Lowest roll tier — failure, noise, compromise |
