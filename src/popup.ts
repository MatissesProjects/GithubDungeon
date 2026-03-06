import { DungeonGenerator, DungeonMap, TileType } from './dungeon-generator';
import { Hero } from './hero';
import { Renderer } from './renderer';

const runBtn = document.getElementById('runBtn') as HTMLButtonElement | null;
const status = document.getElementById('status') as HTMLDivElement | null;
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');
const overlay = document.getElementById('overlay') as HTMLDivElement | null;
const overlayText = document.getElementById('overlayText') as HTMLDivElement | null;
const retryBtn = document.getElementById('retryBtn') as HTMLButtonElement | null;

const hpStat = document.getElementById('hpStat') as HTMLSpanElement | null;
const atkStat = document.getElementById('atkStat') as HTMLSpanElement | null;
const defStat = document.getElementById('defStat') as HTMLSpanElement | null;

let spriteSheet: ImageBitmap | null = null;
let currentMap: DungeonMap | null = null;
let hero: Hero | null = null;
let renderer: Renderer | null = null;

const TILESET_URL = 'https://raw.githubusercontent.com/ryan-haskell/elm-2d/master/examples/assets/dungeon-tileset.png';

async function loadSprites() {
  if (spriteSheet) return spriteSheet;
  try {
    const response = await fetch(TILESET_URL);
    const blob = await response.blob();
    spriteSheet = await createImageBitmap(blob);
    return spriteSheet;
  } catch (err) {
    console.error('Failed to load spritesheet:', err);
    return null;
  }
}

function updateStats() {
  if (!hero) return;
  if (hpStat) hpStat.innerText = `HP: ${hero.stats.currentHp}/${hero.stats.maxHp}`;
  if (atkStat) atkStat.innerText = `ATK: ${hero.stats.attack}`;
  if (defStat) defStat.innerText = `DEF: ${hero.stats.defense}`;
}

function drawGame() {
  if (!currentMap || !hero || !renderer || !canvas) return;
  const viewSize = 9; // 9x9 tiles
  renderer.clear();
  renderer.drawViewport(currentMap, hero.x, hero.y, viewSize, viewSize);
}

function handleInput(e: KeyboardEvent) {
  if (!hero || !currentMap || !hero.isAlive()) return;

  let dx = 0;
  let dy = 0;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      dy = -1;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      dy = 1;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      dx = -1;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      dx = 1;
      break;
    default:
      return; // Ignore other keys
  }

  e.preventDefault();

  const newX = hero.x + dx;
  const newY = hero.y + dy;

  // Check bounds
  if (newX < 0 || newX >= currentMap.width || newY < 0 || newY >= currentMap.height) return;

  const targetTile = currentMap.grid[newY][newX];

  // Collision with walls
  if (targetTile === TileType.Wall) return;

  // Move
  hero.setPosition(newX, newY);

  // Interaction
  let message = '';
  switch (targetTile) {
    case TileType.Enemy:
      hero.takeDamage(15);
      currentMap.grid[newY][newX] = TileType.Room; // Remove enemy
      message = 'Fought an enemy!';
      break;
    case TileType.Trap:
      hero.takeDamage(10);
      currentMap.grid[newY][newX] = TileType.Room; // Remove trap
      message = 'Sprung a trap!';
      break;
    case TileType.Loot:
      hero.heal(20);
      currentMap.grid[newY][newX] = TileType.Room; // Remove loot
      message = 'Found loot!';
      break;
    case TileType.Exit:
      if (overlay && overlayText) {
        overlayText.innerText = 'Dungeon Cleared!';
        overlay.style.display = 'flex';
      }
      message = 'Found the exit!';
      break;
  }

  if (message && status) {
    status.innerText = message;
  }

  updateStats();
  drawGame();

  if (!hero.isAlive()) {
    if (overlay && overlayText) {
      overlayText.innerText = 'You Died';
      overlay.style.display = 'flex';
    }
  }
}

async function startGame() {
  if (runBtn) runBtn.disabled = true;
  if (status) status.innerText = 'Scrying GitHub Pulse...';
  if (overlay) overlay.style.display = 'none';
  if (canvas) canvas.focus();

  try {
    let signature = 'a1b2c3d4e5f60789f2e3d4c5b6a70812' + Math.random().toString(16);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const el = document.getElementById('gh-pulse-signature');
            return el ? el.innerText || el.getAttribute('data-signature') : null;
          }
        });
        if (results?.[0]?.result) {
          let rawSig = results[0].result as string;
          signature = rawSig.replace(/^SIG:\s*0x/i, '').trim();
        }
      }
    } catch (tabErr) {
      console.warn('Could not scry page signature, using random seed.', tabErr);
    }

    const slotSize = 5;
    const numRooms = signature.length;
    const cols = 8;
    const rows = Math.ceil(numRooms / cols);
    const gridWidth = cols * slotSize + 2;
    const gridHeight = rows * slotSize + 2;

    if (status) status.innerText = 'Loading assets...';
    const sheet = await loadSprites();

    if (status) status.innerText = 'Generating Dungeon...';
    currentMap = DungeonGenerator.generateFromSignature(signature, gridWidth, gridHeight);
    
    hero = new Hero(currentMap.metadata.magnitude);
    // Start in the first room
    const firstRoom = currentMap.rooms[0];
    hero.setPosition(firstRoom.x + 1, firstRoom.y + 1);

    if (ctx && canvas) {
      renderer = new Renderer(ctx);
      if (sheet) {
        renderer.setSprite(TileType.Room, { image: sheet, sx: 16, sy: 64, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Wall, { image: sheet, sx: 16, sy: 16, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Enemy, { image: sheet, sx: 368, sy: 368, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Loot, { image: sheet, sx: 304, sy: 288, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Trap, { image: sheet, sx: 160, sy: 144, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Exit, { image: sheet, sx: 48, sy: 336, sw: 16, sh: 16 });
        renderer.setSprite('Hero', { image: sheet, sx: 128, sy: 100, sw: 16, sh: 28 });
      }
    }

    updateStats();
    drawGame();

    if (status) status.innerText = 'Use Arrow Keys or WASD to move!';
  } catch (err) {
    console.error(err);
    if (status) status.innerText = 'Error starting game.';
  } finally {
    if (runBtn) runBtn.disabled = false;
  }
}

runBtn?.addEventListener('click', startGame);
retryBtn?.addEventListener('click', startGame);

if (canvas) {
  canvas.addEventListener('keydown', handleInput);
  // Ensure canvas can receive keyboard events immediately
  canvas.addEventListener('click', () => canvas.focus());
}
