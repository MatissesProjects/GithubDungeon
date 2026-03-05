# GitHub Dungeon Crawler: PLAN_DUNGEON.md

## Background & Vision
A standalone project that transforms daily GitHub contributions into a playable and recordable dungeon crawler. Unlike the passive "GitHub Pet" extension, this is an automated daily event where your pet (the Hero) navigates a dungeon level generated directly from your daily commit activity.

## Core Mechanics
1. **Daily Level Generation:**
   - At 12:00 AM PST (08:00 UTC) each night, the system fetches the user's contributions for the day.
   - The hex signature of these contributions is used as a seed and map blueprint.
   - Each char in the signature (`0-F`) represents a room, an enemy, a trap, or loot.

2. **Signature-Based Movement:**
   - The Hero follows a path determined by the signature's values (e.g., higher values = more aggressive exploration).
   - Combat and interaction outcomes are deterministic, seeded by the contribution data.

3. **Nightly Simulation & GIF Rendering:**
   - The entire "run" is simulated headlessly in the background.
   - Each "step" of the Hero is rendered to an offscreen canvas.
   - These frames are compiled into an animated GIF representing the day's adventure.

## System Architecture
- **Generator Module:** (`dungeon-generator.ts`) Translates commit data to a tile-based grid and entity list.
- **Simulation Engine:** (`simulation.ts`) Handles the Hero's logic, movement, and interaction with the level.
- **Rendering Pipeline:** (`gif-renderer.ts`) Uses a canvas API to draw the simulation and encodes it into a GIF (using a library like `gif.js`).
- **Automation:** Uses `chrome.alarms` or a GitHub Action to trigger the nightly 12:00 AM PST run.

## Phase 1: Foundation
- [ ] Implement `DungeonMap` generation logic based on hex signatures.
- [ ] Define `Hero` class with stats derived from long-term user history (e.g., total commits = base HP).
- [ ] Create basic deterministic simulation loop.

## Phase 2: Visuals & GIF
- [ ] Develop 2D pixel-art tileset renderer.
- [ ] Integrate GIF encoder to capture simulation frames.
- [ ] Implement local storage for "Dungeon Logs" (GIFs + Stats).

## Phase 3: Automation & Integration
- [ ] Set up the nightly trigger (12:00 AM PST / 08:00 UTC).
- [ ] Add a "Daily Report" notification in the extension or a dedicated dashboard.
- [ ] Allow users to "equip" their historical GitHub Pet as the Hero.

## Verification & Testing
- **Consistency:** Ensure the same commit data always results in the same GIF for a given day.
- **Reliability:** Verify the nightly trigger fires correctly across all timezones to hit the PST target.
- **Shareability:** Test GIF compatibility across major platforms (Twitter, Discord, etc.).
