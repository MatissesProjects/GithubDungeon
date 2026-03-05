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
    const width = 20;
    const height = 10;
    const tileSize = 16;

    // 1. Generate Map
    const map = DungeonGenerator.generateFromSignature(signature, width, height);
    
    // 2. Run Simulation
    const hero = new Hero(500);
    const engine = new SimulationEngine(map, hero);
    const steps = engine.run(signature);

    if (status) status.innerText = 'Rendering GIF...';

    // 3. Generate GIF
    const gifBuffer: Uint8Array = await GifGenerator.generate(
      map, 
      steps, 
      width * tileSize, 
      height * tileSize
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
