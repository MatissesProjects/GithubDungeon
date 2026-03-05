import { DungeonMap, TileType } from './dungeon-generator';

export class Renderer {
  private tileSize: number = 16;

  constructor(private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {}

  public drawMap(map: DungeonMap): void {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.grid[y]?.[x];
        this.drawTile(x, y, tile);
      }
    }
  }

  public drawHero(x: number, y: number): void {
    this.ctx.fillStyle = '#ff0000'; // Hero is red
    this.ctx.fillRect(x * this.tileSize + 2, y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
  }

  private drawTile(x: number, y: number, tile: TileType | undefined): void {
    let color = '#222'; // Default empty
    
    switch (tile) {
      case TileType.Wall:
        color = '#444';
        break;
      case TileType.Enemy:
        color = '#aa0000';
        break;
      case TileType.Trap:
        color = '#5500aa';
        break;
      case TileType.Loot:
        color = '#aaaa00';
        break;
      case TileType.Room:
        color = '#333';
        break;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    
    // Add some "grid" lines for visual flair
    this.ctx.strokeStyle = '#111';
    this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
  }

  public clear(): void {
    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
