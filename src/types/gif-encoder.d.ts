declare module 'gif-encoder' {
  import { EventEmitter } from 'events';
  
  class GIFEncoder extends EventEmitter {
    constructor(width: number, height: number);
    writeHeader(): void;
    addFrame(pixels: Uint8ClampedArray | Uint8Array | number[]): void;
    finish(): void;
    setRepeat(repeat: number): void;
    setDelay(delay: number): void;
    setQuality(quality: number): void;
    setTransparent(color: number): void;
  }
  export default GIFEncoder;
}
