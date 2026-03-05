import GIFEncoder from 'gif-encoder-2';
import { DungeonMap } from './dungeon-generator';
import { SimulationStep } from './simulation';
import { Renderer } from './renderer';

export class GifGenerator {
  public static async generate(
    map: DungeonMap, 
    steps: SimulationStep[], 
    width: number, 
    height: number
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

    for (const step of steps) {
      renderer.clear();
      renderer.drawMap(map);
      renderer.drawHero(step.heroX, step.heroY);
      
      const pixels = ctx.getImageData(0, 0, width, height).data;
      encoder.addFrame(pixels);
    }

    encoder.finish();
    const buffer = encoder.out.getData();
    // Return as Uint8Array for browser-native use
    return new Uint8Array(buffer);
  }
}
