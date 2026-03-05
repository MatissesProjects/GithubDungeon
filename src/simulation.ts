import { DungeonMap, TileType } from './dungeon-generator';
import { Hero } from './hero';

export type SimulationAction = 
  | 'Start'
  | `Moved to (${number}, ${number})`
  | `Blocked at (${number}, ${number})`
  | 'Fought an enemy'
  | 'Sprung a trap'
  | 'Found loot'
  | 'Entered a large room';

export interface SimulationStep {
  heroX: number;
  heroY: number;
  heroHp: number;
  action: SimulationAction;
}

export class SimulationEngine {
  private steps: SimulationStep[] = [];

  constructor(private map: DungeonMap, private hero: Hero) {}

  public run(signature: string): SimulationStep[] {
    this.steps = [];
    
    // Starting position: first non-wall tile from top-left
    let startX = 1;
    let startY = 1;
    outer: for (let y = 1; y < this.map.height - 1; y++) {
      for (let x = 1; x < this.map.width - 1; x++) {
        const row = this.map.grid[y];
        if (row && row[x] !== TileType.Wall) {
          startX = x;
          startY = y;
          break outer;
        }
      }
    }
    this.hero.setPosition(startX, startY);

    this.logStep('Start');

    // Simple deterministic movement based on signature
    for (let i = 0; i < signature.length; i++) {
      if (!this.hero.isAlive()) break;

      const char = signature[i];
      if (char === undefined) break;
      const hexVal = parseInt(char, 16);

      // 0-3: North, 4-7: East, 8-11: South, 12-15: West
      let dx = 0;
      let dy = 0;
      if (hexVal <= 3) dy = -1;
      else if (hexVal <= 7) dx = 1;
      else if (hexVal <= 11) dy = 1;
      else dx = -1;

      const nextX = this.hero.x + dx;
      const nextY = this.hero.y + dy;

      if (this.canMoveTo(nextX, nextY)) {
        this.hero.setPosition(nextX, nextY);
        this.interactWithTile(nextX, nextY);
        this.logStep(`Moved to (${nextX}, ${nextY})`);
      } else {
        this.logStep(`Blocked at (${this.hero.x}, ${this.hero.y})`);
      }
    }

    return this.steps;
  }

  private canMoveTo(x: number, y: number): boolean {
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) return false;
    const row = this.map.grid[y];
    return row !== undefined && row[x] !== TileType.Wall;
  }

  private interactWithTile(x: number, y: number): void {
    const row = this.map.grid[y];
    if (!row) return;
    const tile = row[x];

    switch (tile) {
      case TileType.Enemy:
        this.hero.takeDamage(15);
        this.logStep('Fought an enemy');
        break;
      case TileType.Trap:
        this.hero.takeDamage(10);
        this.logStep('Sprung a trap');
        break;
      case TileType.Loot:
        this.hero.heal(20);
        this.logStep('Found loot');
        break;
      case TileType.Room:
        this.logStep('Entered a large room');
        break;
    }
  }

  private logStep(action: SimulationAction): void {
    this.steps.push({
      heroX: this.hero.x,
      heroY: this.hero.y,
      heroHp: this.hero.stats.currentHp,
      action: action,
    });
  }
}
