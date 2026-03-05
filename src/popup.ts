import { DungeonGenerator } from './dungeon-generator';
import { Hero } from './hero';
import { SimulationEngine } from './simulation';
import { GifGenerator } from './gif-generator';

const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const status = document.getElementById('status');
const gifContainer = document.getElementById('gifContainer');

runBtn?.addEventListener('click', async () => {
  runBtn.disabled = true;
  if (status) status.innerText = 'Simulating adventure...';
  
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
    const gifBuffer = await GifGenerator.generate(
      map, 
      steps, 
      width * tileSize, 
      height * tileSize
    );

    // 4. Display GIF
    const blob = new Blob([gifBuffer as any], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);
    
    if (gifContainer) {
      gifContainer.innerHTML = `<img src="${url}" alt="Dungeon Adventure" />`;
    }
    
    if (status) status.innerText = `Adventure Complete! (${steps.length} steps)`;
  } catch (err) {
    console.error(err);
    if (status) status.innerText = 'Error generating adventure.';
  } finally {
    runBtn.disabled = false;
  }
});
