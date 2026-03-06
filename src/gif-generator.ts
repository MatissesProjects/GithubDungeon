import GIFEncoder from 'gif-encoder';
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
    console.log(`Initializing alternative gif-encoder at ${width}x${height}`);
    const encoder = new GIFEncoder(width, height);
    
    const chunks: Buffer[] = [];
    encoder.on('data', (chunk: Buffer) => chunks.push(chunk));

    encoder.writeHeader();
    encoder.setRepeat(0);
    encoder.setDelay(200);
    encoder.setQuality(10);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    const renderer = new Renderer(ctx);

    if (spriteSheet) {
      renderer.setSprite(TileType.Room, { image: spriteSheet, sx: 16, sy: 64, sw: 16, sh: 16 });
      renderer.setSprite(TileType.Wall, { image: spriteSheet, sx: 16, sy: 16, sw: 16, sh: 16 });
      renderer.setSprite(TileType.Enemy, { image: spriteSheet, sx: 368, sy: 368, sw: 16, sh: 16 });
      renderer.setSprite(TileType.Loot, { image: spriteSheet, sx: 304, sy: 288, sw: 16, sh: 16 });
      renderer.setSprite(TileType.Trap, { image: spriteSheet, sx: 160, sy: 144, sw: 16, sh: 16 });
      renderer.setSprite(TileType.Exit, { image: spriteSheet, sx: 48, sy: 336, sw: 16, sh: 16 });
      renderer.setSprite('Hero', { image: spriteSheet, sx: 128, sy: 100, sw: 16, sh: 28 });
    }

    try {
      let frameCount = 0;
      for (const step of steps) {
        renderer.clear();
        renderer.drawMap(map);
        renderer.drawHero(step.heroX, step.heroY);

        const pixels = ctx.getImageData(0, 0, width, height).data;
        encoder.addFrame(pixels);
        
        await new Promise(resolve => setTimeout(resolve, 0));
        frameCount++;
      }

      encoder.finish();
      const finalBuffer = Buffer.concat(chunks);
      return new Uint8Array(finalBuffer);
    } catch (err) {
      console.error('GIF generation error:', err);
      throw err;
    }
  }
}

