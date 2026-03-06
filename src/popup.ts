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
const atkBtn = document.getElementById('atkBtn') as HTMLButtonElement | null;
const jumpBtn = document.getElementById('jumpBtn') as HTMLButtonElement | null;

const hpStat = document.getElementById('hpStat') as HTMLSpanElement | null;
const atkStat = document.getElementById('atkStat') as HTMLSpanElement | null;
const defStat = document.getElementById('defStat') as HTMLSpanElement | null;

let spriteSheet: ImageBitmap | null = null;
let currentMap: DungeonMap | null = null;
let hero: Hero | null = null;
let renderer: Renderer | null = null;
let enemyHP: Map<string, number> = new Map();
let bossDefeated = false;
let isJumpMode = false;

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

  if (e.key === ' ') {
    e.preventDefault();
    performAttack();
    return;
  }

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
    case 'Shift':
      isJumpMode = true;
      if (status) status.innerText = "JUMP MODE: ACTIVE";
      return;
    default:
      return;
  }

  e.preventDefault();
  
  const jump = e.shiftKey || isJumpMode;
  const newX = hero.x + dx;
  const newY = hero.y + dy;

  if (newX < 0 || newX >= currentMap.width || newY < 0 || newY >= currentMap.height) return;

  const targetTile = currentMap.grid[newY][newX];

  if (targetTile === TileType.Wall) return;
  
  if (targetTile === TileType.Enemy || targetTile === TileType.Boss) {
    if (status) status.innerText = `An enemy blocks your path! Press Space to attack!`;
    return;
  }

  if (targetTile === TileType.Exit && !bossDefeated) {
    if (status) status.innerText = `The way is sealed! You must defeat the Boss first!`;
    return;
  }

  // JUMP MECHANIC
  if (jump) {
    if (targetTile === TileType.Trap) {
      if (Math.random() > 0.3) {
        if (status) status.innerText = "You gracefully jump over the trap!";
        hero.setPosition(newX, newY);
        // Move one more step if possible to actually pass it
        const nextX = newX + dx;
        const nextY = newY + dy;
        if (nextX >= 0 && nextX < currentMap.width && nextY >= 0 && nextY < currentMap.height) {
            const nextTile = currentMap.grid[nextY][nextX];
            if (nextTile !== TileType.Wall && nextTile !== TileType.Enemy && nextTile !== TileType.Boss) {
                hero.setPosition(nextX, nextY);
            }
        }
      } else {
        if (status) status.innerText = "You tripped mid-jump!";
        hero.takeDamage(10); 
        hero.setPosition(newX, newY);
        currentMap.grid[newY][newX] = TileType.Room;
      }
    } else {
      // Normal jump move
      const nextX = newX + dx;
      const nextY = newY + dy;
      if (nextX >= 0 && nextX < currentMap.width && nextY >= 0 && nextY < currentMap.height) {
          const nextTile = currentMap.grid[nextY][nextX];
          if (nextTile !== TileType.Wall && nextTile !== TileType.Enemy && nextTile !== TileType.Boss) {
              hero.setPosition(nextX, nextY);
              if (status) status.innerText = "Heads up!";
          } else {
              hero.setPosition(newX, newY);
          }
      } else {
          hero.setPosition(newX, newY);
      }
    }
    isJumpMode = false;
  } else {
    // Normal Move
    hero.setPosition(newX, newY);

    let message = '';
    switch (targetTile) {
      case TileType.Trap:
        const slotSize = 5;
        const cols = 8;
        const col = Math.floor((newX - 1) / slotSize);
        const row = Math.floor((newY - 1) / slotSize);
        const roomIdx = row * cols + (row % 2 === 0 ? col : (cols - 1 - col));
        const hexVal = currentMap.signature[roomIdx] ? parseInt(currentMap.signature[roomIdx], 16) : 0;
        
        hero.takeDamage(10 + Math.floor(hexVal / 2));
        currentMap.grid[newY][newX] = TileType.Room;
        message = 'Sprung a trap!';
        break;
      case TileType.Loot:
        hero.heal(20);
        currentMap.grid[newY][newX] = TileType.Room;
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
    if (message && status) status.innerText = message;
  }

  updateStats();
  drawGame();
}

function performAttack() {
  if (!hero || !currentMap || !hero.isAlive()) return;

  const adj = [
    {x: hero.x, y: hero.y - 1},
    {x: hero.x, y: hero.y + 1},
    {x: hero.x - 1, y: hero.y},
    {x: hero.x + 1, y: hero.y}
  ];

  let hitTarget = false;
  for (const pos of adj) {
    if (pos.x < 0 || pos.x >= currentMap.width || pos.y < 0 || pos.y >= currentMap.height) continue;
    
    const tile = currentMap.grid[pos.y][pos.x];
    if (tile === TileType.Enemy || tile === TileType.Boss) {
      const key = `${pos.x},${pos.y}`;
      let hp = enemyHP.get(key) || 0;
      
      // HERO ATTACK
      if (Math.random() < 0.9) { // 90% hit chance
        const damage = Math.floor(hero.stats.attack * (0.7 + Math.random() * 0.6));
        hp -= damage;
        enemyHP.set(key, hp);
        
        if (hp <= 0) {
          if (tile === TileType.Boss) {
            bossDefeated = true;
            if (status) status.innerText = `YOU DEFEATED THE BOSS! The exit is open!`;
          } else {
            if (status) status.innerText = `You killed the enemy!`;
          }
          currentMap.grid[pos.y][pos.x] = TileType.Room;
          enemyHP.delete(key);
        } else {
          if (status) status.innerText = `Hit for ${damage}! Enemy HP: ${hp}`;
          
          // ENEMY COUNTER ATTACK (Only if survived)
          if (Math.random() < 0.6) { // 60% counter chance
            const slotSize = 5;
            const cols = 8;
            const col = Math.floor((pos.x - 1) / slotSize);
            const row = Math.floor((pos.y - 1) / slotSize);
            const roomIdx = row * cols + (row % 2 === 0 ? col : (cols - 1 - col));
            const hexVal = currentMap.signature[roomIdx] ? parseInt(currentMap.signature[roomIdx], 16) : 0;
            
            const enemyDmg = tile === TileType.Boss ? (20 + hexVal) : (10 + hexVal);
            hero.takeDamage(enemyDmg);
            if (status) status.innerText += ` | Enemy hit back!`;
          } else {
            if (status) status.innerText += ` | Enemy missed!`;
          }
        }
      } else {
        if (status) status.innerText = `You missed!`;
        // Enemy still counters if missed
        if (Math.random() < 0.4) {
            hero.takeDamage(10);
            if (status) status.innerText += ` | Enemy hit you!`;
        }
      }
      
      hitTarget = true;
      break;
    }
  }

  if (!hitTarget) {
    if (status) status.innerText = "You swing at the air...";
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
  
  enemyHP.clear();
  bossDefeated = false;
  isJumpMode = false;

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
    
    // Initialize Enemy HP based on signature DNA
    currentMap.rooms.forEach(room => {
        // Main room object
        const ox = room.x + Math.floor(room.width / 2);
        const oy = room.y + Math.floor(room.height / 2);
        if (room.type === TileType.Enemy) {
            enemyHP.set(`${ox},${oy}`, 20 + room.hexVal * 3);
        } else if (room.type === TileType.Boss) {
            enemyHP.set(`${ox},${oy}`, 100 + currentMap!.metadata.magnitude);
        }
        
        // Extra corner objects if any
        if (room.hexVal >= 12 && room.id < signature.length - 2) {
            const cornerTile = currentMap!.grid[room.y][room.x];
            if (cornerTile === TileType.Enemy) {
                enemyHP.set(`${room.x},${room.y}`, 15 + room.hexVal);
            }
        }
    });

    hero = new Hero(currentMap.metadata.magnitude);
    const firstRoom = currentMap.rooms[0];
    hero.setPosition(firstRoom.x + 1, firstRoom.y + 1);

    if (ctx && canvas) {
      renderer = new Renderer(ctx);
      if (sheet) {
        renderer.setSprite(TileType.Room, { image: sheet, sx: 16, sy: 64, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Wall, { image: sheet, sx: 16, sy: 16, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Enemy, { image: sheet, sx: 368, sy: 368, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Boss, { image: sheet, sx: 368, sy: 320, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Loot, { image: sheet, sx: 304, sy: 288, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Trap, { image: sheet, sx: 160, sy: 144, sw: 16, sh: 16 });
        renderer.setSprite(TileType.Exit, { image: sheet, sx: 48, sy: 336, sw: 16, sh: 16 });
        renderer.setSprite('Hero', { image: sheet, sx: 128, sy: 100, sw: 16, sh: 28 });
      }
    }

    updateStats();
    drawGame();

    if (status) status.innerText = 'Use WASD to move, Space to Attack, Shift+Move to Jump!';
  } catch (err) {
    console.error(err);
    if (status) status.innerText = 'Error starting game.';
  } finally {
    if (runBtn) runBtn.disabled = false;
  }
}

runBtn?.addEventListener('click', startGame);
retryBtn?.addEventListener('click', startGame);
atkBtn?.addEventListener('click', () => {
  performAttack();
  if (canvas) canvas.focus();
});
jumpBtn?.addEventListener('click', () => {
  isJumpMode = !isJumpMode;
  if (status) status.innerText = isJumpMode ? "JUMP MODE: ACTIVE" : "JUMP MODE: INACTIVE";
  if (canvas) canvas.focus();
});

if (canvas) {
  canvas.addEventListener('keydown', handleInput);
  canvas.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') isJumpMode = false;
  });
  canvas.addEventListener('click', () => canvas.focus());
}
