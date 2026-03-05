import { DungeonMap, TileType } from './dungeon-generator';
import { Hero } from './hero';

export type SimulationAction = 
  | 'Start'
  | `Moved to (${number}, ${number})`
  | `Reached Room ${number}`
  | 'Fought an enemy'
  | 'Sprung a trap'
  | 'Found loot'
  | 'Found the exit!';

export interface SimulationStep {
  heroX: number;
  heroY: number;
  heroHp: number;
  action: SimulationAction;
}

export class SimulationEngine {
  private steps: SimulationStep[] = [];

  constructor(private map: DungeonMap, private hero: Hero) {}

  public run(): SimulationStep[] {
    this.steps = [];
    
    if (this.map.rooms.length === 0) return [];

    // Starting position: center of first room
    const firstRoom = this.map.rooms[0];
    const startX = firstRoom.x + 1;
    const startY = firstRoom.y + 1;
    this.hero.setPosition(startX, startY);

    this.logStep('Start');

    // Move from room to room
    for (let i = 0; i < this.map.rooms.length; i++) {
      if (!this.hero.isAlive()) break;

      const room = this.map.rooms[i];
      const targetX = room.x + 1;
      const targetY = room.y + 1;

      // Move to room center
      this.moveTo(targetX, targetY, `Reached Room ${i}`);
      
      // Interact with room content
      this.interactWithTile(targetX, targetY);
      
      if (room.type === TileType.Exit) {
          this.logStep('Found the exit!');
          break;
      }
    }

    return this.steps;
  }

  private moveTo(tx: number, ty: number, finalAction: SimulationAction) {
    let cx = this.hero.x;
    let cy = this.hero.y;

    // Simple A* would be better but linear path is fine for this corridor-like dungeon
    while (cx !== tx || cy !== ty) {
      if (!this.hero.isAlive()) break;

      if (cx !== tx) cx += (tx > cx ? 1 : -1);
      else if (cy !== ty) cy += (ty > cy ? 1 : -1);

      this.hero.setPosition(cx, cy);
      // We don't log every micro-step to keep GIF size reasonable
      // But we could log every N steps
    }
    this.logStep(finalAction);
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
