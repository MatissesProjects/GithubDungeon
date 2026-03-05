declare module 'gif-encoder-2' {
  class GIFEncoder {
    constructor(width: number, height: number);
    start(): void;
    setRepeat(repeat: number): void;
    setDelay(delay: number): void;
    setQuality(quality: number): void;
    addFrame(data: Uint8ClampedArray | Uint8Array): void;
    finish(): void;
    out: {
      getData(): Buffer;
    };
  }
  export default GIFEncoder;
}
