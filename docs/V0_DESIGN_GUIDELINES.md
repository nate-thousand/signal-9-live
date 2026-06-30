# Signal 9 v0 Design Guidelines

Use this document when asking v0, Figma Make, or any generative UI tool to create Signal 9 interface concepts.

Signal 9 is not a dashboard. Signal 9 is the operating system of The Resistance.

## Required Context For Every Prompt

Every prompt must include this context:

```text
Signal 9 is an illegal analog communications operating system used by The Resistance inside a world controlled by Project Digital Harmony. The player is operating broadcast equipment, radio systems, memory recovery tools, and signal intelligence hardware. The UI must feel like engineered analog resistance equipment, not consumer software.
```

## Core Philosophy

Include this philosophy in prompts when the screen involves content, memory, music, missions, or Echoes:

```text
Music is civilization. Memory is resistance. Analog systems preserve individuality. Digital systems optimize conformity. Every transmission, Memory Node, vinyl record, broadcast, and Echo strengthens humanity's cultural memory.
```

## Global Visual Requirements

Prompts should ask for:

- Engineered, functional, modular panels.
- Broadcast equipment and radio engineering references.
- Military avionics and industrial instrumentation.
- CRT terminal surfaces.
- Dense telemetry and signal diagnostics.
- Oscilloscope, spectrum analyzer, and packet analyzer logic.
- ASCII reconstruction as a signal material.
- Dark operational environment with restrained signal color.
- Controls that feel like equipment, not app widgets.
- Motion notes that describe signal behavior, not decorative animation.

## Global Negative Prompt

Use or adapt this negative prompt:

```text
Do not make this look like a SaaS dashboard, mobile app, consumer music player, glassmorphism interface, modern web application, social feed, analytics dashboard, crypto dashboard, generic cyberpunk UI, or glossy productivity tool. Avoid soft rounded consumer cards, floating glass panels, cheerful gradients, marketing hero layouts, oversized whitespace, app-store polish, and decorative neon that has no signal function.
```

## Prompt Structure

Use this structure:

```text
Create a [screen/component/system] for Signal 9.

Fiction:
[Explain the resistance operation and Project Digital Harmony threat.]

Purpose:
[Explain what the operator is trying to do.]

Visual language:
Illegal analog communications OS, radio engineering, broadcast deck, military avionics, CRT terminal, industrial instrumentation, telemetry, signal intelligence, oscilloscope, packet analyzer.

Required UI modules:
[List panels and operational states.]

Motion:
[Describe signal behavior: lock-on, drift, scan, interference, decode, pulse.]

Content:
[Use Signal 9 terminology.]

Avoid:
[Use global negative prompt.]
```

## Screen Prompt Templates

### Broadcast Terminal

```text
Create a Signal 9 Broadcast Terminal screen. The player is operating an illegal analog broadcast network under Project Digital Harmony surveillance. The screen should feel like a rack-mounted field console with a live transmission deck, carrier lock telemetry, central ASCII/video signal stage, mission status, lore recovery, command terminal, and footer diagnostics. Use military avionics grids, CRT terminal typography, radio engineering labels, oscilloscope-style meters, and dense signal intelligence readouts. Motion should represent carrier lock, audio-reactive signal pulse, packet arrival, and interference bursts. Avoid all SaaS dashboard, mobile app, glassmorphism, and consumer music player patterns.
```

### Transmission Interface

```text
Create a Signal 9 Transmission Interface for acquiring and decoding a forbidden broadcast. Include frequency band, carrier strength, source selector, decode threshold, interference map, transmission log, archive capture status, and relay path. The UI should feel like analog radio equipment combined with packet analysis and military diagnostics. States include searching, acquiring, locked, decoding, degraded, jammed, rebroadcasting, archived, and lost. Motion should be signal scan, lock-on, jitter, dropout, and threshold recovery. Avoid decorative cyberpunk and generic analytics widgets.
```

### Memory Node Interface

```text
Create a Signal 9 Memory Node interface. A Memory Node is a recovered cultural memory fragment, not a collectible. Show source, medium, provenance, integrity, recovery status, related Echoes, related transmissions, and cultural significance. The visual treatment should feel like an archive machine reconstructing damaged analog media through signal diagnostics. Use metadata stamps, waveform fragments, ASCII previews, dithered images, and field archive labels. Avoid game loot cards, social media cards, and clean media-library layouts.
```

### Echo Interface

```text
Create a Signal 9 Echo interface. Echoes are traces of people, songs, places, and moments preserved through damaged transmissions. The UI should feel spectral but technical: voiceprint fragments, waveform analysis, corrupted captions, ASCII silhouette reconstruction, memory resonance, source confidence, and signal fingerprint. It should be emotional because machines are recovering human memory, not because of supernatural ghost styling. Avoid fantasy ghost UI and glossy character cards.
```

### Radio Interface

```text
Create a Signal 9 Radio Interface for tuning across a forbidden spectrum. Include frequency bands, callsigns, squelch, scan, fine tune, carrier strength, interference, relay path, station notes, and broadcast status. The interface should feel tactile, dangerous, and technical, like a shortwave radio console fused with a military signal intelligence display. Motion should be scan sweep, signal drift, carrier lock, and interference. Avoid streaming app, podcast app, and mobile player conventions.
```

### Inventory Interface

```text
Create a Signal 9 Inventory Interface. Inventory is a field archive and equipment manifest, not a backpack. Items include physical media, signal tools, recovered devices, memory artifacts, vinyl records, keys, codes, and evidence. Each item should show source, condition, provenance, signal relevance, memory relevance, operational use, and related transmissions. The layout should feel like resistance archive equipment and industrial storage diagnostics. Avoid RPG loot grids and e-commerce cards.
```

### Mission Interface

```text
Create a Signal 9 Mission Interface. Missions are field operations around transmission recovery, relay routing, memory protection, and Project Digital Harmony interference. Show objective, location, threat state, relay availability, required memory or signal, constraints, live updates, and extraction/completion state. Use field orders, intercept logs, signal maps, and military avionics panels. Avoid quest cards, kanban boards, and productivity dashboards.
```

## Component Prompt Templates

### Carrier Lock Meter

```text
Design a Carrier Lock Meter for Signal 9. It should look like analog broadcast test equipment with numeric lock percentage, jitter, drift, carrier strength, warning states, and oscilloscope-style movement. It must feel functional and military-grade.
```

### Transmission Deck

```text
Design a Transmission Deck for Signal 9. It should feel like a field broadcast transport with play, stop, scan, source, track, carrier state, audio-reactive meter, and archive capture indicators. Avoid consumer music player styling.
```

### Memory Node Record

```text
Design a Memory Node Record component for Signal 9. It should combine archive metadata, recovered medium, integrity, cultural significance, related transmissions, and an ASCII or dithered preview. It should feel like a protected cultural artifact in a resistance archive system.
```

### Echo Signature

```text
Design an Echo Signature component for Signal 9. It should show waveform fragments, voiceprint-like traces, confidence, source, memory resonance, and corrupted text. It must be technical, not supernatural.
```

## Motion Prompt Language

Use these phrases:

- Signal lock acquisition
- Carrier drift
- Decode threshold sweep
- Interference burst
- Audio-reactive carrier pulse
- Packet arrival
- CRT refresh instability
- Tape saturation
- Relay path stabilization
- Memory reconstruction
- Jammer pressure
- Dropout recovery

Do not use:

- Delightful microinteraction
- Smooth app transition
- Playful hover
- Floating glass animation
- Bouncy mobile motion

## Color Prompt Language

Use color as state:

- Violet ultraviolet identity for Signal 9.
- Cyan/green phosphor for recovered signal.
- Amber for warning, archive lamp, or warm hardware.
- Red for hostile intrusion or carrier failure.
- Gray for offline or archived.
- Black and near-black for equipment field.

Avoid color as decoration. Color must communicate signal, memory, warning, source, or state.

## Typography Prompt Language

Ask for:

- Monospace terminal labels.
- Compact military equipment labels.
- CRT terminal readouts.
- Dense telemetry numbers.
- Stamped archive metadata.
- Callsigns and frequency markings.

Avoid:

- Rounded consumer app fonts.
- Friendly onboarding typography.
- Marketing headlines.
- Lifestyle editorial type.

## Figma Guidelines

Figma work should be organized as an equipment system.

Recommended pages:

- Doctrine
- Tokens
- Equipment Panels
- Broadcast Deck
- Terminal
- Mission Interface
- Transmission Interface
- Memory Nodes
- Echoes
- Radio
- Inventory
- Signal Effects
- Motion Notes
- v0 Prompt References

Component naming should use operational nouns:

- `CarrierLockMeter`
- `TransmissionDeck`
- `FrequencyTuner`
- `MemoryNodeRecord`
- `EchoSignature`
- `RelayStatusPanel`
- `SignalHealthStrip`
- `PacketLog`
- `ArchiveRecoveryMeter`

Do not name source-of-truth components after generic UI categories like card, modal, hero, tile, or dashboard widget unless they are implementation primitives hidden beneath the design language.

## Figma Component Requirements

Each Figma component should document:

- Fictional equipment role.
- Operational state model.
- Required telemetry.
- Signal effects allowed.
- Motion notes.
- Accessibility notes.
- Do / do not examples.

## Figma Visual Rules

- Use equipment frames, not marketing frames.
- Treat panels as physical modules.
- Use tokens for state and signal meaning.
- Keep Signal 9 theme app-owned.
- Document any proposed DS bridge variable separately.
- Do not invent engine behavior in Figma.
- Do not redesign the app shell without a separate approved milestone.

## Acceptance Checklist For Generated Work

Reject generated work if:

- It looks like a dashboard.
- It looks like a mobile app.
- It uses glassmorphism.
- It uses generic cards without equipment purpose.
- It treats music as entertainment instead of civilization.
- It treats memory as collectibles instead of resistance.
- It adds decorative motion without signal meaning.
- It hides telemetry to look clean.
- It weakens the analog resistance fiction.

Accept generated work if:

- Every panel feels like equipment.
- Every animation maps to signal behavior.
- The screen communicates resistance operations.
- The design supports dense telemetry without losing hierarchy.
- Memory, music, broadcasts, Echoes, and radio feel culturally vital.
- It can be implemented without modifying engines or moving Signal 9 into Platform.
