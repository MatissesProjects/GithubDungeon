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
  if (status) status.innerText = 'Scrying GitHub Pulse...';
  if (actionsDiv) actionsDiv.style.display = 'none';

  // Revoke previous URL to prevent memory leaks
  if (currentGifUrl) {
    URL.revokeObjectURL(currentGifUrl);
    currentGifUrl = null;
  }

  try {
    // Attempt to get signature from current tab
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
          console.log('Found raw signature from page:', rawSig);
          // Clean up "SIG: 0x" if present
          signature = rawSig.replace(/^SIG:\s*0x/i, '').trim();
          console.log('Cleaned signature:', signature);
        }
      }
    } catch (tabErr) {
      console.warn('Could not scry page signature, using random seed.', tabErr);
    }

    if (status) status.innerText = `Signature Found: ${signature.substring(0, 8)}...`;

    const tileSize = 16;
    const viewSize = 9; // 9x9 tiles viewport

    // Load sprites if not already loaded
    if (status) status.innerText = 'Loading assets...';
    const sheet = await loadSprites();

    // 1. Generate Map
    if (status) status.innerText = 'Generating Dungeon...';
    const map = DungeonGenerator.generateFromSignature(signature, 42, 22);
    console.log('Dungeon generated:', map.metadata);
    
    // 2. Run Simulation
    if (status) status.innerText = 'Simulating adventure...';
    const hero = new Hero(map.metadata.magnitude);
    const engine = new SimulationEngine(map, hero);
    const steps = engine.run();
    console.log(`Simulation finished with ${steps.length} steps.`);

    if (status) status.innerText = `Rendering ${steps.length} frames...`;

    // 3. Generate GIF
    const gifBuffer: Uint8Array = await GifGenerator.generate(
      map, 
      steps, 
      viewSize * tileSize, 
      viewSize * tileSize,
      sheet || undefined
    );

    // 4. Display GIF
    const blob = new Blob([gifBuffer as any], { type: 'image/gif' });
    currentGifUrl = URL.createObjectURL(blob);
    
    if (gifContainer) {
      gifContainer.innerHTML = `<img src="${currentGifUrl}" alt="Dungeon Adventure" style="max-width: 100%; height: auto;" />`;
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
