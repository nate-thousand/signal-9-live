# Signal 9 UI Principles

Signal 9 UI is operational equipment. It is not app chrome.

These principles guide future screens and components without changing the current implementation.

## Foundational Rule

Every UI element must have an operational reason to exist.

Acceptable reasons:

- Monitor signal
- Control transmission
- Decode memory
- Route audio
- Inspect telemetry
- Recover archive material
- Expose mission state
- Warn about interference
- Tune radio or video source
- Operate equipment

Unacceptable reasons:

- Fill space
- Look modern
- Add delight
- Copy dashboard conventions
- Create generic navigation
- Decorate cyberpunk surfaces

## Equipment, Not Software

Treat every screen as an instrument panel.

Use:

- Panel labels
- State indicators
- Telemetry strips
- Lock states
- Frequency displays
- Signal meters
- Transport controls
- Diagnostic logs
- Hardware-like grouping

Avoid:

- Generic cards
- Marketing sections
- SaaS sidebar patterns
- Mobile tab bars
- Floating glass panels
- Decorative stats

## Component Principles

Components should be named and designed by function.

Preferred component concepts:

- `TransmissionDeck`
- `CarrierLockMeter`
- `FrequencyTuner`
- `MemoryNodeRecord`
- `EchoSignature`
- `RelayStatusPanel`
- `SignalHealthStrip`
- `PacketLog`
- `BroadcastQueue`
- `ArchiveRecoveryMeter`
- `InterferenceAlert`

Avoid component thinking like:

- `Card`
- `Hero`
- `FeatureTile`
- `StatsWidget`
- `MobileSheet`
- `GlassPanel`

Generic primitives can exist in code, but visible design should read as equipment.

## Panel Principles

Every panel should define:

- Purpose
- Input
- Output
- State
- Failure mode
- Relationship to signal or memory

Panel states:

- Offline
- Standby
- Searching
- Locked
- Decoding
- Transmitting
- Degraded
- Jammed
- Archived
- Recovered

Panels should look modular and replaceable, like equipment bays in a larger system.

## Grid And Layout Principles

Use layout as an operating frame:

- Top status rail for global system state.
- Center work area for active signal, mission, or memory.
- Side equipment bays for controls and diagnostics.
- Footer telemetry for continuous machine state.
- Optional debug overlays for engineering readouts.

Spacing should feel measured and technical. Empty space is acceptable when it feels like an unused bay or protected signal field.

## Interaction Principles

Interactions are operations:

- Tune
- Lock
- Decode
- Route
- Play
- Pause
- Scan
- Transmit
- Archive
- Recover
- Inspect
- Override

Feedback should feel like equipment response:

- Meter movement
- Lock light
- Log entry
- Signal pulse
- Carrier warning
- Frequency shift
- Static burst
- Status code

Avoid interactions that feel like decorative web hover effects.

## Motion Principles

Motion should be signal-driven.

Use motion for:

- Acquisition
- Lock-on
- Drift
- Scan
- Signal pulse
- Audio response
- Interference
- Decode progress
- Alert state
- Carrier loss

Avoid motion that only says “this is interactive.” If motion cannot be explained as signal, hardware, or state, it should be removed.

## Information Density

Signal 9 can be dense because it is an instrument. Density should be deliberate.

High-density areas:

- Logs
- Telemetry
- Signal diagnostics
- Inventory metadata
- Memory provenance
- Mission constraints
- Radio bands

Low-density areas:

- Major mission reveal
- Memory Node recovery
- Echo encounter
- Startup identity
- Transmission lock event

Density should shift with player focus and signal importance.

## Terminal Language

Terminal language should be concise, operational, and diegetic.

Use:

- `CARRIER LOCKED`
- `TRANSMISSION DEGRADED`
- `MEMORY NODE RECOVERED`
- `ECHO TRACE FOUND`
- `RELAY PATH UNSTABLE`
- `PROJECT DIGITAL HARMONY INTERFERENCE`
- `ARCHIVE INTEGRITY`
- `DECODE THRESHOLD`

Avoid:

- “Welcome back”
- “Here are your insights”
- “Something went wrong”
- “Tap to continue”
- “Your dashboard”

If the message could appear in a SaaS app, rewrite it.

## Broadcast Interface Patterns

Broadcast patterns should expose:

- Source
- Carrier
- Frequency
- Route
- Output
- Archive state
- Interference
- Signal strength
- Transmission history

Common UI units:

- Deck transport
- Frequency tuner
- Carrier meter
- Signal health strip
- Transmission log
- Source selector
- Relay path
- Archive marker

## Mission Interface Patterns

Mission UI should behave like field operations.

Represent:

- Objective
- Location
- Threat state
- Relay availability
- Required memory or signal
- Constraints
- Extraction or completion state
- Consequences

Avoid quest-card styling. Use field orders, intercepts, and operations boards.

## Transmission Interface Patterns

Transmission states should be explicit:

- Searching
- Acquiring
- Locked
- Decoding
- Stabilizing
- Rebroadcasting
- Archived
- Degraded
- Jammed
- Lost

Each state should alter telemetry, copy, motion, and signal effects.

## Inventory Interface Patterns

Inventory is an archive and equipment manifest.

Each item should show:

- Type
- Source
- Condition
- Provenance
- Signal relevance
- Memory relevance
- Operational use
- Related transmissions

Inventory should feel curated by a resistance archivist, not sorted by a game loot system.

## Memory Node Patterns

Memory Nodes should feel precious and technical.

Represent:

- Cultural origin
- Medium
- Integrity
- Recovery method
- Associated song or broadcast
- Related Echoes
- Archive state
- Human significance

Recovery should feel like preservation.

## Echo Patterns

Echo UI should combine emotion with diagnostics.

Use:

- Voiceprint traces
- Waveform fragments
- ASCII reconstruction
- Corrupted subtitles
- Memory resonance
- Source confidence
- Signal fingerprint

Avoid supernatural ghost tropes. Echoes are people and moments recovered through machines.

## Radio Patterns

Radio UI should expose tuning and spectrum work:

- Frequency
- Band
- Callsign
- Squelch
- Fine tune
- Scan
- Carrier strength
- Interference map
- Relay path

Radio should feel tactile and dangerous.

## Accessibility Principles

Accessibility is part of operational reliability.

Ensure:

- High contrast text
- Reduced motion support
- Non-color state indicators
- Readable labels
- Keyboard-operable controls
- Stable focus states
- Visual effects that do not obscure critical information

The fiction can be intense, but the interface must remain operable.

## Implementation Principles

For future implementation:

- Keep Signal 9 semantic theme app-owned.
- Bridge into Design System variables instead of copying token files.
- Do not replace engines for visual style.
- Do not introduce decorative renderers outside the agreed stage renderer.
- Preserve startup identity unless a specific brand milestone changes it.
- Add UI only when its operational purpose is clear.
