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
  ): Promise<Buffer> {
    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(200);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // We need a canvas to draw on. 
    // In node we'd use 'canvas' package, in browser OffscreenCanvas.
    // For this implementation we'll assume a canvas context is provided 
    // or created in the environment.
    
    // For the sake of this logic, let's assume we are in an environment 
    // with OffscreenCanvas (like a Chrome Service Worker).
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    const renderer = new Renderer(ctx);

    for (const step of steps) {
      renderer.clear();
      renderer.drawMap(map);
      renderer.drawHero(step.heroX, step.heroY);
      
      // Get pixel data from canvas
      const pixels = ctx.getImageData(0, 0, width, height).data;
      encoder.addFrame(pixels as any);
    }

    encoder.finish();
    return encoder.out.getData();
  }
}
