import { Buffer } from 'buffer';
import * as process from 'process';

if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}
if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = process;
}
export { Buffer, process };
