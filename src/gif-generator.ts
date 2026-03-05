import GIFEncoder from 'gif-encoder-2';
import { DungeonMap, TileType } from './dungeon-generator';
import { SimulationStep } from './simulation';
import { Renderer } from './renderer';

export class GifGenerator {
  public static async generate(
    map: DungeonMap, 
    steps: SimulationStep[], 
    width: number, 
    height: number,
    spriteSheet?: ImageBitmap | HTMLImageElement | OffscreenCanvas
  ): Promise<Uint8Array> {
    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(200);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null;

    if (!ctx) {
      throw new Error('Could not get 2D context from OffscreenCanvas');
    }

    const renderer = new Renderer(ctx);

    if (spriteSheet) {
      // Setup 0x72 Dungeon Tileset v1.1 mappings (16x16 tiles)
      renderer.setSprite(TileType.Room, { image: spriteSheet, sx: 16, sy: 64, sw: 16, sh: 16 }); // Floor
      renderer.setSprite(TileType.Wall, { image: spriteSheet, sx: 16, sy: 16, sw: 16, sh: 16 }); // Wall
      renderer.setSprite(TileType.Enemy, { image: spriteSheet, sx: 368, sy: 368, sw: 16, sh: 16 }); // Demon
      renderer.setSprite(TileType.Loot, { image: spriteSheet, sx: 304, sy: 288, sw: 16, sh: 16 }); // Chest
      renderer.setSprite(TileType.Trap, { image: spriteSheet, sx: 160, sy: 144, sw: 16, sh: 16 }); // Spikes
      renderer.setSprite(TileType.Exit, { image: spriteSheet, sx: 48, sy: 336, sw: 16, sh: 16 }); // Ladder/Exit
      renderer.setSprite('Hero', { image: spriteSheet, sx: 128, sy: 100, sw: 16, sh: 28 }); // Knight (taller than 16)
    }

    for (const step of steps) {
      renderer.clear();
      renderer.drawMap(map);
      renderer.drawHero(step.heroX, step.heroY);

      const pixels = ctx.getImageData(0, 0, width, height).data;
      encoder.addFrame(pixels);
    }

    encoder.finish();
    const buffer = encoder.out.getData();
    return new Uint8Array(buffer);
  }
}

