# GitHub Dungeon Crawler

GitHub Dungeon Crawler is a Chrome Extension that generates a daily dungeon adventure based on your unique GitHub signature (or any random seed). It simulates a hero's journey through a procedurally generated dungeon and renders the entire adventure as a pixel-art animated GIF.

## Features

- **Daily Adventure Generation:** Uses a 32-character seed (signature) to generate unique dungeon layouts.
- **Procedural Generation:** Dungeons are generated with walls, rooms, enemies, traps, and loot.
- **Simulation Engine:** A hero explores the dungeon, fighting enemies and finding loot until they reach the end or run out of health.
- **Animated GIF Rendering:** The entire simulation is rendered into a pixel-art GIF using the popular [0x72 Dungeon Tileset](https://0x72.itch.io/dungeon-11).
- **Downloadable Adventures:** Save your daily dungeon crawls as GIFs to share or archive.

## Tech Stack

- **TypeScript:** Type-safe development for the simulation and rendering engine.
- **esbuild:** Fast bundling for the Chrome Extension environment.
- **GIF-Encoder-2:** (Patched for browser compatibility) Handles GIF generation.
- **OffscreenCanvas:** Used for background rendering of GIF frames.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MatissesProjects/GithubDungeon.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project.

## Usage

- Click the extension icon in your toolbar.
- Click **"Generate Daily Adventure"**.
- Wait for the simulation and rendering to complete.
- View the animated GIF and use the **"Download Dungeon GIF"** link to save it.

## License

This project is licensed under the ISC License. 
Dungeon sprites are from the [0x72 Dungeon Tileset](https://0x72.itch.io/dungeon-11).
