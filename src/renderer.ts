import { DungeonMap, TileType, DungeonTheme } from './dungeon-generator';

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
  private theme: DungeonTheme = DungeonTheme.Classic;

  constructor(private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {}

  public setSprite(type: TileType | 'Hero', data: SpriteData): void {
    this.sprites.set(type, data);
  }

  public setTheme(theme: DungeonTheme): void {
    this.theme = theme;
  }

  public drawViewport(map: DungeonMap, heroX: number, heroY: number, viewWidth: number, viewHeight: number): void {
    this.setTheme(map.metadata.theme);
    
    const halfW = Math.floor(viewWidth / 2);
    const halfH = Math.floor(viewHeight / 2);
    
    const startX = heroX - halfW;
    const startY = heroY - halfH;

    for (let y = 0; y < viewHeight; y++) {
      for (let x = 0; x < viewWidth; x++) {
        const worldX = startX + x;
        const worldY = startY + y;
        
        const tile = (worldX >= 0 && worldX < map.width && worldY >= 0 && worldY < map.height)
          ? map.grid[worldY][worldX]
          : TileType.Wall; // Outside map is all walls
        
        this.drawTileAt(x, y, tile);
      }
    }
    
    // Draw hero at the center of the viewport
    this.drawHeroAt(halfW, halfH);
  }

  private drawTileAt(viewX: number, viewY: number, tile: TileType | undefined): void {
    const sprite = tile !== undefined ? this.sprites.get(tile) : undefined;
    
    if (sprite) {
      this.ctx.drawImage(
        sprite.image,
        sprite.sx, sprite.sy, sprite.sw, sprite.sh,
        viewX * this.tileSize, viewY * this.tileSize, this.tileSize, this.tileSize
      );
    } else {
      let color = '#222';
      switch (this.theme) {
        case DungeonTheme.Crypt:
          color = tile === TileType.Wall ? '#2c3e50' : '#1a252f';
          break;
        case DungeonTheme.Underworld:
          color = tile === TileType.Wall ? '#4a235a' : '#2e1534';
          break;
        default:
          color = tile === TileType.Wall ? '#444' : '#222';
      }

      if (tile === TileType.Enemy) color = '#aa0000';
      if (tile === TileType.Trap) color = '#5500aa';
      if (tile === TileType.Loot) color = '#aaaa00';
      if (tile === TileType.Exit) color = '#00aa00';
      if (tile === TileType.Room && color === '#222') color = '#333';

      this.ctx.fillStyle = color;
      this.ctx.fillRect(viewX * this.tileSize, viewY * this.tileSize, this.tileSize, this.tileSize);
    }
  }

  private drawHeroAt(viewX: number, viewY: number): void {
    const sprite = this.sprites.get('Hero');
    if (sprite) {
      this.ctx.drawImage(
        sprite.image,
        sprite.sx, sprite.sy, sprite.sw, sprite.sh,
        viewX * this.tileSize, viewY * this.tileSize, this.tileSize, this.tileSize
      );
    } else {
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(viewX * this.tileSize + 2, viewY * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
    }
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
