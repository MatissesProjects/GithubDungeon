import { DungeonGenerator } from './dungeon-generator';
import { Hero } from './hero';
import { SimulationEngine } from './simulation';
import { GifGenerator } from './gif-generator';

const runBtn = document.getElementById('runBtn') as HTMLButtonElement | null;
const status = document.getElementById('status') as HTMLDivElement | null;
const gifContainer = document.getElementById('gifContainer') as HTMLDivElement | null;
const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement | null;
const actionsDiv = document.getElementById('actions') as HTMLDivElement | null;

let currentGifUrl: string | null = null;
let spriteSheet: ImageBitmap | null = null;

// The popular 0x72 Dungeon Tileset v1.1
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

runBtn?.addEventListener('click', async () => {
  if (runBtn) runBtn.disabled = true;
  if (status) status.innerText = 'Simulating adventure...';
  if (actionsDiv) actionsDiv.style.display = 'none';
  
  // Revoke previous URL to prevent memory leaks
  if (currentGifUrl) {
    URL.revokeObjectURL(currentGifUrl);
    currentGifUrl = null;
  }
  
  try {
    const signature = 'a1b2c3d4e5f60789f2e3d4c5b6a70812' + Math.random().toString(16); // Randomize for testing
    const width = 42; // 8 * 5 + 2 margin
    const height = 22; // 4 * 5 + 2 margin
    const tileSize = 16;

    // Load sprites if not already loaded
    if (status) status.innerText = 'Loading assets...';
    const sheet = await loadSprites();

    // 1. Generate Map
    if (status) status.innerText = 'Simulating adventure...';
    const map = DungeonGenerator.generateFromSignature(signature, width, height);
    
    // 2. Run Simulation
    const hero = new Hero(500);
    const engine = new SimulationEngine(map, hero);
    const steps = engine.run();

    if (status) status.innerText = 'Rendering GIF...';

    // 3. Generate GIF
    const gifBuffer: Uint8Array = await GifGenerator.generate(
      map, 
      steps, 
      width * tileSize, 
      height * tileSize,
      sheet || undefined
    );

    // 4. Display GIF
    const blob = new Blob([gifBuffer as unknown as BlobPart], { type: 'image/gif' });
    currentGifUrl = URL.createObjectURL(blob);
    
    if (gifContainer) {
      gifContainer.innerHTML = `<img src="${currentGifUrl}" alt="Dungeon Adventure" />`;
    }

    if (downloadLink) {
      downloadLink.href = currentGifUrl;
    }

    if (actionsDiv) {
      actionsDiv.style.display = 'block';
    }
    
    if (status) status.innerText = `Adventure Complete! (${steps.length} steps)`;
  } catch (err) {
    console.error(err);
    if (status) status.innerText = 'Error generating adventure.';
  } finally {
    if (runBtn) runBtn.disabled = false;
  }
});
