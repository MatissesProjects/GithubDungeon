import { DungeonGenerator } from './dungeon-generator';
import { Hero } from './hero';
import { SimulationEngine } from './simulation';

describe('SimulationEngine', () => {
  const signature = 'a1b2c3d4e5f60789';
  const width = 10;
  const height = 10;

  test('should run a simulation and return steps', () => {
    const map = DungeonGenerator.generateFromSignature(signature, width, height);
    const hero = new Hero(100);
    const engine = new SimulationEngine(map, hero);

    const steps = engine.run(signature);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('Start');
    
    // Check if the hero moves
    const movements = steps.filter(s => s.action.startsWith('Moved'));
    expect(movements.length).toBeGreaterThan(0);
  });

  test('should be deterministic', () => {
    const map1 = DungeonGenerator.generateFromSignature(signature, width, height);
    const hero1 = new Hero(100);
    const engine1 = new SimulationEngine(map1, hero1);
    const steps1 = engine1.run(signature);

    const map2 = DungeonGenerator.generateFromSignature(signature, width, height);
    const hero2 = new Hero(100);
    const engine2 = new SimulationEngine(map2, hero2);
    const steps2 = engine2.run(signature);

    expect(steps1).toEqual(steps2);
  });
});
