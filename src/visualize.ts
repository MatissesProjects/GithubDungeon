import { DungeonGenerator, TileType } from './dungeon-generator';
import { Hero } from './hero';
import { SimulationEngine } from './simulation';

function visualize() {
  const signature = 'a1b2c3d4e5f60789f2e3d4c5b6a70812'; // Sample daily signature
  const width = 42;
  const height = 22;

  const map = DungeonGenerator.generateFromSignature(signature, width, height);
  const hero = new Hero(500); // 500 commits hero
  const engine = new SimulationEngine(map, hero);

  console.log('--- STARTING SIMULATION ---');
  const steps = engine.run();
  
  // Create a copy of the grid for visualization
  const displayGrid: string[][] = map.grid.map(row => 
    row.map(tile => {
      switch (tile) {
        case TileType.Wall: return '█';
        case TileType.Enemy: return 'E';
        case TileType.Trap: return 'T';
        case TileType.Loot: return 'L';
        case TileType.Room: return '.';
        case TileType.Exit: return 'X';
        default: return ' ';
      }
    })
  );

  // Mark the path
  steps.forEach((step, index) => {
    if (index === 0) displayGrid[step.heroY][step.heroX] = 'S'; // Start
    else if (index === steps.length - 1) displayGrid[step.heroY][step.heroX] = 'H'; // Current Hero Position
    else displayGrid[step.heroY][step.heroX] = '·';
  });

  console.log('Dungeon Map (S=Start, H=Hero, X=Exit, ·=Path, E=Enemy, T=Trap, L=Loot):');
  displayGrid.forEach(row => console.log(row.join('')));
  
  console.log('\nFinal Hero Stats:', hero.stats);
  console.log('Total Steps:', steps.length);
  if (steps.length > 0) console.log('Final Action:', steps[steps.length - 1].action);
}

visualize();
