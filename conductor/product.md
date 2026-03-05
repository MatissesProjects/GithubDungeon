# GitHub Dungeon Crawler: Product Definition

## Vision
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
