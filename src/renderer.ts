import { DungeonMap, TileType } from './dungeon-generator';

export interface SpriteData {
  image: ImageBitmap | HTMLImageElement | OffscreenCanvas;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export class Renderer {
  private tileSize: number = 16;
  private sprites: Map<TileType | 'Hero', SpriteData> = new Map();

  constructor(private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {}

  public setSprite(type: TileType | 'Hero', data: SpriteData): void {
    this.sprites.set(type, data);
  }

  public drawMap(map: DungeonMap): void {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.grid[y]?.[x];
        this.drawTile(x, y, tile);
      }
    }
  }

  public drawHero(x: number, y: number): void {
    const sprite = this.sprites.get('Hero');
    if (sprite) {
      this.ctx.drawImage(
        sprite.image,
        sprite.sx, sprite.sy, sprite.sw, sprite.sh,
        x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize
      );
    } else {
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(x * this.tileSize + 2, y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
    }
  }

  private drawTile(x: number, y: number, tile: TileType | undefined): void {
    const sprite = tile !== undefined ? this.sprites.get(tile) : undefined;
    
    if (sprite) {
      this.ctx.drawImage(
        sprite.image,
        sprite.sx, sprite.sy, sprite.sw, sprite.sh,
        x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize
      );
    } else {
      let color = '#222';
      switch (tile) {
        case TileType.Wall: color = '#444'; break;
        case TileType.Enemy: color = '#aa0000'; break;
        case TileType.Trap: color = '#5500aa'; break;
        case TileType.Loot: color = '#aaaa00'; break;
        case TileType.Room: color = '#333'; break;
        case TileType.Exit: color = '#00aa00'; break;
      }
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }
    
    // Grid lines for debug or when sprites are missing
    if (!sprite) {
      this.ctx.strokeStyle = '#111';
      this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }
  }

  public clear(): void {
    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
